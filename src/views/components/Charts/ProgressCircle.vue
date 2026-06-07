<script setup lang="ts">
/**
 * ProgressCircle 圆形进度图组件
 * 提供圆形进度展示功能
 */
import { computed, ref, watch } from 'vue'

interface Props {
  /** 图表数据 */
  data?: Record<string, unknown>[] | Record<string, unknown>
  /** 图表配置 */
  options?: Record<string, unknown>
  /** 组件配置 */
  widget?: Record<string, unknown>
}

const props = withDefaults(defineProps<Props>(), {
  data: undefined,
  options: undefined,
  widget: undefined,
})

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'dblclick', data: unknown): void
}>()

/** 组件刷新索引 */
const index = ref(0)

/**
 * 获取数据对象
 */
const dataObject = computed<Record<string, any> | undefined>(() => {
  if (Array.isArray(props.data)) {
    return props.data[0]
  }
  return props.data
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
function getDataString(columnName: string, defaultString: string, data?: Record<string, any>): any {
  const propertyName = getDataPropertyName(columnName)
  if (!propertyName) return defaultString
  const val = getColumnValue(data || dataObject.value || {}, propertyName)
  return val == null ? defaultString : val
}

/**
 * 根据配置字段获取数字数据
 * @param columnName 配置名称
 * @param data 数据源
 */
function getDataNumber(columnName: string, data?: Record<string, any>): number {
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

/** 进度百分比 */
const percentage = computed(() => {
  if (!getDataPropertyName('progressColumn')) return 0
  return Number(
    (
      getDataNumber('progressColumn') /
      (props.options as Record<string, any>)?.seriesSetting?.maxValue
    ).toFixed(2),
  ) * 100
})

/** 进度文本 */
const progressText = computed(() => {
  const opts = props.options as Record<string, any> | undefined
  return opts?.seriesSetting?.textStyle?.text?.replace('{percent}', String(percentage.value)) || ''
})

/** 进度环 SVG 描述 */
const circumference = computed(() => {
  return 2 * Math.PI * 45
})

/** 进度环偏移量 */
const dashOffset = computed(() => {
  return circumference.value * (1 - percentage.value / 100)
})

/**
 * 点击事件
 */
function onTableClick() {
  emit('click')
}

/**
 * 双击事件
 */
function onDblClick() {
  emit('dblclick', dataObject.value)
}

// 监听配置变化刷新
watch(
  () => (props.options as Record<string, any>)?.seriesSetting,
  () => {
    index.value++
  },
  { deep: true, immediate: true },
)
</script>

<template>
  <div v-if="options" class="progress-circle" @click.stop="onTableClick">
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
    <div class="progress-circle-container">
      <div class="progress-circle-wrapper" @dblclick="onDblClick">
        <svg class="circle-progress" viewBox="0 0 100 100">
          <circle
            class="circle-bg"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e8e8e8"
            stroke-width="6"
          />
          <circle
            class="circle-fill"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            :stroke="(options as any)?.seriesSetting?.color || '#1989fa'"
            stroke-width="6"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div
          class="progress-text"
          :style="{
            color: (options as any)?.seriesSetting?.textStyle?.color,
            fontStyle: (options as any)?.seriesSetting?.textStyle?.italics ? 'italic' : undefined,
            fontWeight: (options as any)?.seriesSetting?.textStyle?.bold ? 'bold' : undefined,
            fontSize: (options as any)?.seriesSetting?.textStyle?.fontSize + 'px',
          }"
        >
          <span v-html="progressText" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.progress-circle {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;

  .title {
    padding: 0 4px;
    height: 40px;
    line-height: 30px;
    border-bottom: solid 1px #f6f6f6;
    flex-grow: 0;
    flex-shrink: 0;
  }

  .progress-circle-container {
    height: calc(100% - 40px);
    flex: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    padding-top: 10px;
    width: 100%;
  }

  .progress-circle-wrapper {
    display: inline-block;
    text-align: center;
    width: 100%;
    height: 100%;
    position: relative;

    .circle-progress {
      width: 100%;
      height: 100%;
      max-width: 200px;
      max-height: 200px;

      .circle-fill {
        transition: stroke-dashoffset 0.5s ease;
      }
    }

    .progress-text {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
  }
}
</style>
