<script setup lang="ts">
const userAgent = ref('')
const currentYear = ref(new Date().getFullYear())

onMounted(() => {
  if (navigator)
    userAgent.value = navigator.userAgent
})

const { data, status } = await useFetch<ProcessedMonitor[]>('/api/status', {
  lazy: true,
  server: false,
})

const statusVal = computed(() => {
  if (status.value === 'pending')
    return 'nodata'

  if (data.value?.every(item => item.status === 'ok')) {
    return 'success'
  }
  else if (data.value?.some(item => item.status === 'down')) {
    return 'failure'
  }

  return 'nodata'
})
</script>

<template>
  <div class="is-boxed has-animations">
    <header>
      <div class="headerinner">
        <div class="headerleft">
          <a href="/">
            <img src="/logo.svg" alt="Logo" loading="eager">
            <span>STATUS</span>
          </a>
        </div>
        <div class="headerright flex gap-2">
          <DarkToggle />
          <a
            href="https://github.com/ryanuo/status" rel="nofollow" target="_blank"
            class="stars-on-github-btn inline-flex items-center justify-center"
          >
            <span class="i-carbon-logo-github" />
          </a>
        </div>
      </div>
    </header>

    <div id="SiteInfo" class="headline">
      <span id="lastDayStatus" :key="statusVal">
        <img id="statusImg" class="statusImg" :class="{ icobeat: statusVal !== 'success' }" :src="`/check/${statusVal}.svg`" alt="status" loading="eager">
      </span>
      <h1 class="is-revealing hero-title text-2xl">
        Ryanuo's Pages Status
      </h1>
    </div>
    <div id="pageContainer" class="is-revealing pageContainer">
      <ClientOnly>
        <div id="reports" class="reportContainer">
          <Loading v-if="statusVal === 'nodata'" />
          <MonitorComponent v-for="(monitor, index) in data || []" v-else :key="index" :monitor="monitor" />
        </div>
        <template #fallback>
          <Loading />
        </template>
      </ClientOnly>
    </div>
    <div id="clientInfo" class="clientInfo">
      <p><span id="uag">UA : {{ userAgent }}</span></p>
    </div>

    <footer text-xs>
      <p>
        Based on the <a href="https://dashboard.uptimerobot.com/monitors" target="_blank">UptimeRobot</a> API, with a check frequency of every 5 minutes.
      </p>
      <p class="copy-right mt-1">
        Copyright ©<span id="currentYear">{{ currentYear }}</span> <a href="https://github.com/ryanuo" target="_blank">ryanuo</a>. All Rights Reserved.
      </p>
    </footer>
  </div>
</template>

<style>
@import url('../styles/index.css');
</style>
