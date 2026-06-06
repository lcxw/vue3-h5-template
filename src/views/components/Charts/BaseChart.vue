<script setup lang="ts">
import * as echarts from 'echarts'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

/**
 * BaseChart 基础图表组件
 * 提供ECharts图表渲染功能
 */

interface Props {
  /** 图表配置 */
  options?: Record<string, unknown>
  /** 图表宽度 */
  width?: string
  /** 图表高度 */
  height?: string
  /** 图表数据 */
  data?: unknown[]
}

const props = withDefaults(defineProps<Props>(), {
  options: undefined,
  width: '100%',
  height: '300px',
  data: undefined,
})

const emit = defineEmits<{
  (e: 'click', params: unknown): void
}>()

const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

/**
 * 初始化图表
 */
function initChart() {
  if (!chartRef.value)
    return

  chartInstance = echarts.init(chartRef.value)

  if (props.options) {
    chartInstance.setOption(props.options)
  }

  // 监听点击事件
  chartInstance.on('click', (params) => {
    emit('click', params)
  })
}

/**
 * 更新图表配置
 */
function updateChart() {
  if (!chartInstance || !props.options)
    return
  chartInstance.setOption(props.options, true)
}

/**
 * 调整图表大小
 */
function resizeChart() {
  if (!chartInstance)
    return
  chartInstance.resize()
}

// 监听配置变化
watch(
  () => props.options,
  () => {
    nextTick(() => {
      updateChart()
    })
  },
  { deep: true },
)

// 监听数据变化
watch(
  () => props.data,
  () => {
    nextTick(() => {
      updateChart()
    })
  },
  { deep: true },
)

// 组件挂载后初始化图表
onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

// 组件卸载前销毁图表
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', resizeChart)
})

// 暴露方法供父组件调用
defineExpose({
  resizeChart,
  updateChart,
})
</script>

<template>
  <div ref="chartRef" class="echarts-container" :style="{ width, height }" />
</template>

<style scoped>
.echarts-container {
  min-height: 200px;
}
</style>
