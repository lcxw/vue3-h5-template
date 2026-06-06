<script setup lang="ts">
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

/**
 * PieChart 饼图组件
 * 提供饼图渲染功能
 */

interface ValueColumn {
  columnName: string
  name: string
}

interface CategoryColumn {
  columnName: string
}

interface Props {
  /** 图表数据 */
  data?: Record<string, unknown>[]
  /** 图表配置 */
  options?: Record<string, unknown>
  /** 分类列列表 */
  categrayColumnList?: CategoryColumn[]
  /** 值列列表 */
  valueColumnList?: ValueColumn[]
  /** 选中值 */
  value?: Record<string, unknown>
  /** 图表宽度 */
  width?: string
  /** 图表高度 */
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  options: undefined,
  categrayColumnList: () => [],
  valueColumnList: () => [],
  value: undefined,
  width: '100%',
  height: '300px',
})

const emit = defineEmits<{
  (e: 'update:value', value: Record<string, unknown> | null): void
  (e: 'change', value: Record<string, unknown> | null): void
  (e: 'click', params: unknown): void
}>()

/**
 * 获取行数据列名值
 * @param row 行数据
 * @param columnNameList 列名列表
 */
function getColumnValue(row: Record<string, unknown>, columnNameList: string | string[]): unknown {
  if (Array.isArray(columnNameList)) {
    let dataValue = columnNameList.length > 0 ? row : undefined
    for (let i = 0; i < columnNameList.length; i++) {
      const name = columnNameList[i]
      if (name == null || dataValue == null) {
        dataValue = undefined
        break
      }
      const dictName = `${name}__DictMap`
      dataValue = (dataValue as Record<string, unknown>)[dictName]
        ? (dataValue as Record<string, unknown>)[dictName].name
        : (dataValue as Record<string, unknown>)[name]
    }
    return dataValue
  }
  else {
    const columnName = columnNameList
    const dictName = `${columnName}__DictMap`
    return row[dictName] ? row[dictName].name : row[columnName]
  }
}

/**
 * 计算分类数据
 */
const categoryData = computed(() => {
  if (!Array.isArray(props.categrayColumnList) || !Array.isArray(props.data))
    return []
  return props.data.map((item) => {
    return props.categrayColumnList.reduce((retObj: string | undefined, columnInfo) => {
      if (columnInfo != null && columnInfo.columnName != null) {
        if (retObj != null) {
          retObj += '\r\n'
        }
        else {
          retObj = ''
        }
        retObj += String(getColumnValue(item, columnInfo.columnName))
      }
      return retObj
    }, undefined) || ''
  })
})

/**
 * 计算系列数据
 */
const series = computed(() => {
  if (!Array.isArray(props.valueColumnList) || !Array.isArray(props.data))
    return []
  return props.valueColumnList.map(() => {
    const serieData = categoryData.value.map((name, index) => {
      return {
        value: getColumnValue(props.data![index], props.valueColumnList![0].columnName),
        name,
      }
    })

    // 获取中心和半径配置
    const options = props.options as Record<string, unknown> | undefined
    const seriesOptions = options?.series as Record<string, unknown> | undefined
    const center: [string, string] = ['50%', '50%']
    const radius: [string, string] = ['0%', '70%']

    if (seriesOptions?.centerX != null)
      center[0] = `${String(seriesOptions.centerX)}%`
    if (seriesOptions?.centerY != null)
      center[1] = `${String(seriesOptions.centerY)}%`
    if (seriesOptions?.radiusInner != null)
      radius[0] = String(seriesOptions.radiusInner)
    if (seriesOptions?.radiusOuter != null)
      radius[1] = String(seriesOptions.radiusOuter)

    return {
      type: 'pie',
      radius,
      center,
      roseType: seriesOptions?.isRose ? 'area' : undefined,
      data: serieData,
    }
  })
})

/**
 * 计算图表配置
 */
const chartOptions = computed(() => {
  return {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: series.value,
  }
})

/**
 * 点击处理
 * @param params 点击参数
 */
function onClick(params: unknown) {
  const clickParams = params as { dataIndex: number }
  const clickData = props.data[clickParams.dataIndex]
  if (props.value === clickData) {
    emit('update:value', null)
    emit('change', null)
  }
  else {
    emit('update:value', clickData)
    emit('change', clickData)
  }
}
</script>

<template>
  <BaseChart :options="chartOptions" :width="width" :height="height" :data="data" @click="onClick" />
</template>

<style scoped>
</style>
