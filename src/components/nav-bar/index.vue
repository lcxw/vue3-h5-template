<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useDarkModeStore } from '@/store/modules/dark-mode'

const darkModeStore = useDarkModeStore()
const { isDark } = storeToRefs(darkModeStore)

const iconName = computed(() => isDark.value ? 'light' : 'dark')

function onClickRight(event: TouchEvent | MouseEvent) {
  darkModeStore.toggleDarkMode(event)
}
</script>

<template>
  <van-nav-bar fixed placeholder @click-right="onClickRight">
    <template #right>
      <svg-icon class="text-[18px]" :name="iconName" />
    </template>
  </van-nav-bar>
</template>

<style scoped>
:deep(.van-nav-bar) {
  background-color: #ffffff;
  border-bottom: 1px solid #ebedf0;
}

:deep(.van-nav-bar__title) {
  color: #323233;
  font-weight: 500;
  font-size: 30rpx;
}

:deep(.van-nav-bar__right .van-icon) {
  color: #323233;
}
</style>
