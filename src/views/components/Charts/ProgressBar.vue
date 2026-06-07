<script setup lang="ts">
/**
 * ProgressBar 进度条图表组件
 * 提供进度条展示功能
 */
import { computed, watch, ref } from 'vue'

interface DataItem {
  [key: string]: any
}

interface Props {
  /** 图表数据 */
  data?: { dataList: DataItem[] } | DataItem[]
  /** 图表高度 */
  height?: string
  /** 图表配置 */
  options?: Record<string, unknown>
  /** 组件配置 */
  widget?: Record<string, unknown>
}

const props = withDefaults(defineProps<Props>(), {
  data: undefined,
  height: undefined,
  options: undefined,
  widget: undefined,
})

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'dblclick', data: unknown): void
}>()

/** 数据列表 */
const dataList = computed<DataItem[]>(() => {
  if (props.data == null) return []
  if (Array.isArray(props.data)) return props.data
  return (props.data as Record<string, DataItem[]>)?.dataList || []
})

/**
 * 获取列值
 * @param row 行数据
 * @param columnNameList 列名或列名列表
 */
function getColumnValue(row: Record<string, any>, columnNameList: string | string[]): any {
  if (Array.isArray(columnNameList)) {
    let dataValue = columnNameList.length > 0 ? row : undefined
    for (let i = 0; i < columnNameList.length; i++) {
      const name = columnNameList[i]
      if (name == null || dataValue == null) {
        dataValue = undefined
        break
      }
      const dictName = `${name}__DictMap`
      const current = dataValue as Record<string, any>
      dataValue = current[dictName] ? (current[dictName] as Record<string, any>).name : current[name]
    }
    return dataValue
  }
  else {
    const columnName = columnNameList
    const dictName = `${columnName}__DictMap`
    return row[dictName] ? (row[dictName] as Record<string, any>).name : row[columnName]
  }
}

/**
 * 获取数据属性列名
 * @param columnName 配置名称
 */
function getDataPropertyName(columnName: string): string | undefined {
  const opts = props.options as Record<string, any> | undefined
  if (
    opts && opts.datasetInfo &&
    opts.datasetInfo[columnName] &&
    Array.isArray(opts.datasetInfo[columnName]) &&
    opts.datasetInfo[columnName].length > 0
  ) {
    return opts.datasetInfo[columnName][0].columnName
  }
  return undefined
}

/**
 * 根据配置字段获取字符串数据
 * @param columnName 配置名称
 * @param defaultString 默认值
 * @param data 数据源
 */
function getDataString(columnName: string, defaultString: string, data?: DataItem): any {
  const propertyName = getDataPropertyName(columnName)
  if (!propertyName) return defaultString
  const val = getColumnValue(data || {}, propertyName)
  return val == null ? defaultString : val
}

/**
 * 根据配置字段获取数字数据
 * @param columnName 配置名称
 * @param data 数据源
 */
function getDataNumber(columnName: string, data?: DataItem): number {
  const val = getDataString(columnName, '0', data)
  if (typeof val === 'string') {
    return isNaN(Number(val)) ? 0 : Number(val)
  }
  return val as number
}

/** 标题 */
const title = computed(() => {
  const opts = props.options as Record<string, any> | undefined
  if (opts == null || opts.title == null || !opts.title.show) return undefined
  return opts ? opts.title.text : undefined
})

/**
 * 计算进度百分比
 * @param item 数据项
 */
function calcPercentage(item: DataItem): number {
  try {
    if (!getDataPropertyName('progressColumn')) return 0
    const pct = Number(
      (
        getDataNumber('progressColumn', item) /
        (props.options as Record<string, any>)?.seriesSetting?.maxValue * 100
      ).toFixed(2),
    )
    return pct > 100 ? 100 : pct
  }
  catch (e) {
    console.log(e)
    return 0
  }
}

/**
 * 格式化外部进度文本
 * @param pct 百分比
 * @param item 数据项
 */
function outerTextFormat(pct: number, item: DataItem): string {
  const text = getDataString('textColumn', '', item)
  return (props.options as Record<string, any>)?.seriesSetting?.textStyle?.text
    ?.replace(/:/gi, text ? ':' : '')
    ?.replace(/\{percent\}/gi, String(pct))
    ?.replace(/\{text\}/gi, String(text)) || ''
}

/**
 * 点击事件
 */
function onTableClick() {
  emit('click')
}

/**
 * 双击事件
 * @param item 数据项
 */
function onDblClick(item: DataItem) {
  emit('dblclick', item)
}

/** 带百分比的数据列表 */
const dataListWithPercentage = ref<DataItem[]>([])

// 监听数据变化，计算百分比
watch(dataList, (newList) => {
  if (Array.isArray(newList)) {
    dataListWithPercentage.value = newList.map((item) => {
      return {
        ...item,
        percentage: calcPercentage(item),
      }
    })
  }
  else {
    dataListWithPercentage.value = []
  }
}, { deep: true, immediate: true })
</script>

<template>
  <div class="progress-bar" @click.stop="onTableClick">
    <div
      v-if="title != null && title !== ''"
      class="title"
      :style="{
        color: (options as any)?.title?.textStyle?.color,
        fontSize: (options as any)?.title?.textStyle?.fontSize + 'px',
        fontWeight: (options as any)?.title?.bold ? 600 : undefined,
        textAlign: (options as any)?.title?.left,
        fontStyle: (options as any)?.title?.italics ? 'italic' : undefined,
      }"
    >
      {{ title }}
    </div>
    <div class="progress-bar-container">
      <div
        v-for="(item, index) in dataListWithPercentage"
        v-if="(options as any)?.seriesSetting"
        :key="index"
        class="progress-container"
        @dblclick="onDblClick(item)"
      >
        <van-progress
          :percentage="item.percentage"
          :color="(options as any)?.seriesSetting?.color"
          :show-pivot="false"
          stripe
          style="flex-grow: 1;"
        />
        <div
          v-if="!(options as any)?.seriesSetting?.textInside"
          class="progress-text"
          :style="{
            color: (options as any)?.seriesSetting?.textStyle?.color,
            width: (options as any)?.seriesSetting?.textStyle?.width + 'px',
            fontSize: (options as any)?.seriesSetting?.textStyle?.fontSize + 'px',
            fontWeight: (options as any)?.seriesSetting?.textStyle?.bold ? 600 : undefined,
            fontStyle: (options as any)?.seriesSetting?.textStyle?.italics ? 'italic' : undefined,
          }"
        >
          <span v-html="outerTextFormat(item.percentage, item)" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.progress-bar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;

  .title {
    padding: 0 4px;
    height: 40px;
    line-height: 30px;
    border-bottom: solid 1px #f6f6f6;
    flex-grow: 0;
    flex-shrink: 0;
  }

  .progress-bar-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 20px 10px 0;
    box-sizing: border-box;
    overflow: hidden;
    width: 100%;
  }

  .progress-container {
    display: inline-flex;
    align-items: center;
    width: 100%;
    position: relative;

    & + .progress-container {
      margin-top: 20px;
    }
  }

  .progress-text {
    flex-grow: 0;
    flex-shrink: 0;
    display: inline-block;
    vertical-align: middle;
    text-align: right;
  }
}
</style>
