<script setup lang="ts">
import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'

const props = withDefaults(defineProps<{
  monitor?: ProcessedMonitor // 必需属性，类型为 ProcessedMonitor
  showChart?: boolean // 可选属性，默认值为 false
}>(), {
  // 默认值（必须与类型定义完全匹配）
  monitor: () => ({
    id: '',
    name: '',
    url: '',
    average: '0.00',
    daily: [],
    total: { times: 0, duration: 0 },
    status: 'unknow',
  }),
})

dayjs.extend(advancedFormat)

const statusDateMap = reactive({
  info: '',
  color: '',
})

function getLineStatus(obj: DailyUptime): LineStatus {
  if (Number(obj.uptime) === 100) {
    return 'success'
  }

  if (Number(obj.uptime) <= 0 && obj.down.times === 0) {
    return 'nodata'
  }

  return 'failure'
}

const reversedDaily = computed(() => {
  return [...(props.monitor.daily || [])].reverse()
})

function handleMouseDown(status: DailyUptime) {
  const formattedDate = dayjs(status.date).format('dddd, MMMM Do, YYYY')
  statusDateMap.info = `${formattedDate} - Status:${getLineStatus(status).toUpperCase()}`
  statusDateMap.color = `var(--${getLineStatus(status)}-color)`
}

const status = computed(() => {
  // 取0表示获取最新的数据
  return getLineStatus(props.monitor.daily[0] as DailyUptime)
})
</script>

<template>
  <div class="statusContainer">
    <!-- 状态头部 -->
    <div class="statusHeader">
      <div class="statusHeader-left">
        <!-- 状态图标 -->
        <div class="statusItemImageWrapper">
          <div class="guangquan" :class="status" />
          <img
            class="statusIcon" alt="status"
            :src="`/check/${status}.svg`"
          >
        </div>
        <!-- 监控项链接与标题 -->
        <a :href="monitor.url" target="_blank" rel="noopener">
          <h2 class="statusTitle">{{ monitor.name }}</h2>
        </a>
      </div>

      <!-- 正常运行时间 -->
      <div class="statusUptime">
        {{ monitor.average || 0 }}% Uptime within {{ monitor?.daily?.length || 0 }} days
      </div>
    </div>

    <!-- 状态流容器（状态方块） -->
    <div class="statusStreamContainer">
      <div
        v-for="(item, index) in reversedDaily" :key="index" :class="`statusSquare ${getLineStatus(item)}`"
        @mouseover="handleMouseDown(item)" @mouseleave="statusDateMap.info = ''"
      />
    </div>
    <div
      class="text-xs font-bold h-1"
      :style="{
        color: statusDateMap.color,
      }"
    >
      {{ statusDateMap.info || '' }}
    </div>

    <canvas v-if="showChart" :id="`chart-${monitor.id}`" class="chart" />
  </div>
</template>
