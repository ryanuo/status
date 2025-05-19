// ===== 类型定义 =====
interface UptimeRobotApiResponse {
  stat: string
  monitors: MonitorData[]
  error?: {
    type: string
    message: string
  }
}

interface MonitorData {
  id: string
  friendly_name: string
  url: string
  status: number
  custom_uptime_ranges: string
  logs: LogData[]
}

interface LogData {
  type: number // 1=down, 2=up
  datetime: number // Unix timestamp
  duration: number // seconds
}

interface ProcessedMonitor {
  id: string
  name: string
  url: string
  average: string
  daily: DailyUptime[]
  total: TotalDownTime
  status: MonitorStatus
}

interface DailyUptime {
  date: string
  uptime: string
  down: {
    times: number
    duration: number
  }
}

interface TotalDownTime {
  times: number
  duration: number
}

type MonitorStatus = 'ok' | 'down' | 'unknow'

type LineStatus = 'success' | 'failure' | 'nodata' | 'partial'
