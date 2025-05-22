import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone' // 导入时区插件
import utc from 'dayjs/plugin/utc' // 导入 UTC 插件

dayjs.extend(utc)
dayjs.extend(timezone)

const uppConfig = {
  days: 60,
  apiKey: 'ur2482162-50c9dae9f951b84567bc8e2a',
  defaultTimezone: 'Asia/Shanghai',
}

// 获取指定时区的当前时间
function getCurrentTimeInTimezone(tz: string = uppConfig.defaultTimezone) {
  return tz ? dayjs.tz(dayjs(), tz) : dayjs()
}

// ===== 工具函数 =====
/** 格式化数字，保留两位小数 */
function formatNumber(value: number | string): string {
  const num = typeof value === 'string' ? Number.parseFloat(value) : value
  return (Math.floor(num * 100) / 100).toString()
}

/** 生成日期范围和Unix时间戳 */
function generateDateRanges(days: number = uppConfig.days, tz = uppConfig.defaultTimezone) {
  const dates: any[] = []
  const today = getCurrentTimeInTimezone(tz).startOf('day')

  for (let d = 0; d < days; d++) {
    dates.push(today.subtract(d, 'day'))
  }

  const dailyRanges = dates.map(date => ({
    start: date.unix(),
    end: date.add(1, 'day').unix(),
    format: `${date.unix()}_${date.add(1, 'day').unix()}`,
  }))

  const totalRange = {
    start: dates[dates.length - 1]?.unix(),
    end: dates[0].add(1, 'day').unix(),
    format: `${dates[dates.length - 1].unix()}_${dates[0].add(1, 'day').unix()}`,
  }

  return { dates, dailyRanges, totalRange }
}

/** 处理Uptime Robot监控数据 */
function processMonitorData(monitors: MonitorData[], dates: dayjs.Dayjs[]): ProcessedMonitor[] {
  return monitors.map((monitor) => {
    const ranges = monitor.custom_uptime_ranges.split('-')
    const average = formatNumber(ranges.pop() || '0')

    const daily: any = []
    const dateMap: Record<string, number> = {}

    dates.forEach((date, index) => {
      const dateKey = date.format('YYYYMMDD')
      dateMap[dateKey] = index

      daily[index] = {
        date: date.format('YYYY-MM-DD'),
        uptime: formatNumber(ranges[index] || '0'),
        down: { times: 0, duration: 0 },
      }
    })

    const total = monitor.logs.reduce((total, log) => {
      if (log.type === 1) { // 只处理停机事件
        const dateKey = dayjs.unix(log.datetime).format('YYYYMMDD')
        const index = dateMap[dateKey]

        if (index !== undefined) {
          total.times += 1
          total.duration += log.duration
          daily[index].down.times += 1
          daily[index].down.duration += log.duration
        }
      }
      return total
    }, { times: 0, duration: 0 })

    let status: MonitorStatus = 'unknow'
    if (monitor.status === 2)
      status = 'ok'
    if (monitor.status === 9)
      status = 'down'

    return {
      id: monitor.id,
      name: monitor.friendly_name,
      url: monitor.url,
      average,
      daily,
      total,
      status,
    }
  })
}

/** 从Uptime Robot API获取并处理监控数据 */
async function fetchUptimeRobotData(apiKey: string, days: number = uppConfig.days) {
  const { dates, dailyRanges, totalRange } = generateDateRanges(days)

  const postData = {
    api_key: apiKey,
    format: 'json',
    logs: '1',
    log_types: '1-2',
    logs_start_date: totalRange.start.toString(),
    logs_end_date: totalRange.end.toString(),
    custom_uptime_ranges: [...dailyRanges.map(r => r.format), totalRange.format].join('-'),
  }

  try {
    const response = await fetch('https://api.uptimerobot.com/v2/getMonitors', {
      method: 'POST',
      body: new URLSearchParams(postData),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    const data: UptimeRobotApiResponse = await response.json()

    if (data.stat !== 'ok') {
      throw new Error(data.error?.message || 'API request failed')
    }
    return processMonitorData(data.monitors, dates)
  }
  catch (error) {
    console.error('UptimeRobot API error:', error)
    throw error
  }
}

// ===== Nuxt服务器处理函数 =====
export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
  setHeader(event, 'Pragma', 'no-cache')
  setHeader(event, 'Expires', '0')

  try {
    const data = await fetchUptimeRobotData(uppConfig.apiKey)
    return data
  }
  catch (error: any) {
    console.error('Failed to fetch uptime data:', error.message)
    return { error: 'Failed to fetch uptime data' }
  }
})
