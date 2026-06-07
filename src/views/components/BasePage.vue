<template>
  <div
    class="base-page"
    :style="{
      marginTop: '0px',
      paddingTop: (titleNavHeight + statusBarHeight) + 'px',
      background: backgroundColor
    }"
  >
    <!-- 标题栏 -->
    <div class="page-title" :style="{ height: titleNavHeight + 'px', top: statusBarHeight + 'px' }">
      <div class="title">
        <van-icon v-if="showBack" name="arrow-left" size="20" @click="goBack" />
        <span class="text" :style="{ flexGrow: showBack ? 0 : 1 }">{{ title }}</span>
      </div>
    </div>
    <div style="height: 100%; overflow: hidden; display: flex; flex-direction: column">
      <!-- 页面内容 -->
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { getSystemInfo, getBoundingClientRect } from './utils'

/**
 * BasePage 基础页面组件
 * 提供统一的页面布局和标题栏
 */

interface Props {
  /** 页面标题 */
  title?: string
  /** 背景颜色 */
  backgroundColor?: string
  /** 是否显示返回按钮 */
  showBack?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  backgroundColor: '#F6F7F9',
  showBack: true
})

const emit = defineEmits<{
  (e: 'back'): void
}>()

const router = useRouter()

const systemInfo = getSystemInfo()
const rect = getBoundingClientRect(systemInfo.windowWidth, systemInfo.statusBarHeight)

/**
 * 窗口宽度
 */
const windowWidth = computed(() => systemInfo.windowWidth)

/**
 * 状态栏高度
 */
const statusBarHeight = computed(() => systemInfo.statusBarHeight)

/**
 * 标题导航栏高度
 */
const titleNavHeight = computed(() => Math.max((rect.top - systemInfo.statusBarHeight) * 2 + rect.height, 40))

/**
 * 返回上一页
 */
function goBack() {
  emit('back')
  router.back()
}
</script>

<style scoped>
.base-page {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}

.page-title {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 9999;
}

.title {
  height: 100%;
  width: 100%;
  border-bottom: 1px solid #ebedf0;
  background-color: #ffffff;
  position: absolute;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 10px;
}

.title .van-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.title .text {
  width: calc(100vw - 40px);
  color: #323233;
  font-weight: 500;
  font-size: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>