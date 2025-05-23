<script setup lang="ts">
const color = useColorMode()

useHead({
  meta: [{
    id: 'theme-color',
    name: 'theme-color',
    content: () => color.value === 'dark' ? '#222222' : '#ffffff',
  }],
})

function toggleTheme() {
  const modes = ['light', 'dark', 'auto']
  const currentIndex = modes.indexOf(color.preference)
  const nextIndex = (currentIndex + 1) % modes.length
  color.preference = modes[nextIndex] as string
}
</script>

<template>
  <button class="!outline-none cursor-pointer" @click="toggleTheme">
    <div v-if="color.preference === 'light'" class="i-carbon-sun" />
    <div v-else-if="color.preference === 'dark'" class="i-carbon-moon" />
    <div v-else class="i-carbon-ibm-cloud-sysdig-secure" /> <!-- system mode icon -->
  </button>
</template>
