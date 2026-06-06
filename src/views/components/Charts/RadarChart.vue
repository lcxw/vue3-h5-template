<script setup lang="ts">
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

/**
 * RadarChart 雷达图组件
 * 提供雷达图渲染功能
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
    radar: {
      indicator: [
        { name: '指标1', max: 100 },
        { name: '指标2', max: 100 },
        { name: '指标3', max: 100 },
        { name: '指标4', max: 100 },
        { name: '指标5', max: 100 },
      ],
    },
    series: [
      {
        type: 'radar',
        data: props.data.map(item => ({
          value: Object.values(item).slice(0, 5),
          name: String(item.name || ''),
        })),
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
