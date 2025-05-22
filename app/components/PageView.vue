<script setup lang="ts">
const userAgent = ref('')
const currentYear = ref(new Date().getFullYear())
const loading = ref(true)

onMounted(() => {
  if (navigator)
    userAgent.value = navigator.userAgent
  loading.value = true
})

const { data, status } = await useFetch<ProcessedMonitor[]>('/api/status')

const statusImgSrc = computed(() => {
  if (status.value === 'pending')
    return '/check/nodata.svg'

  if (data.value?.every(item => item.status === 'ok')) {
    return '/check/success.svg'
  }
  else if (data.value?.some(item => item.status === 'down')) {
    return '/check/failure.svg'
  }

  return '/check/nodata.svg'
})

watch(() => data.value, (newValue) => {
  if (newValue?.length) {
    loading.value = false
  }
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
        <div class="headerright">
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
      <span id="lastDayStatus">
        <img id="statusImg" class="statusImg icobeat" :src="statusImgSrc" alt="status" loading="eager">
      </span>
      <h1 class="is-revealing hero-title text-2xl">
        Ryanuo's Pages Status
      </h1>
    </div>
    <div id="pageContainer" class="is-revealing pageContainer">
      <ClientOnly>
        <!-- this component will only be rendered on client side -->
        <div id="reports" class="reportContainer">
          <MonitorComponent v-for="(monitor, index) in data || []" :key="index" :monitor="monitor" />
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
        Copyright ©<span id="currentYear">{{ currentYear }}</span> ryanuo. All Rights Reserved.
      </p>
    </footer>
  </div>
</template>

<style>
@import url('../styles/index.css');
</style>
