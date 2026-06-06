<script setup lang="ts">
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

/**
 * ScatterChart 散点图组件
 * 提供散点图渲染功能
 */

interface Props {
  /** 图表数据 */
  data?: Record<string, unknown>[]
  /** 图表配置 */
  options?: Record<string, unknown>
  /** 图表宽度 */
  width?: string
  /** 图表高度 */
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  options: undefined,
  width: '100%',
  height: '300px',
})

/**
 * 计算图表配置
 */
const chartOptions = computed(() => {
  return {
    tooltip: {
      trigger: 'item',
    },
    xAxis: {
      type: 'value',
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        type: 'scatter',
        data: props.data.map(item => [
          item.x || 0,
          item.y || 0,
        ]),
      },
    ],
  }
})
</script>

<template>
  <BaseChart :options="chartOptions" :width="width" :height="height" :data="data" />
</template>

<style scoped>
</style>
