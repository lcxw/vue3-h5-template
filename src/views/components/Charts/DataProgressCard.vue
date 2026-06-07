<script setup lang="ts">
/**
 * DataProgressCard 数据进度卡片组件
 * 提供带进度条的数据卡片展示功能
 */
import { computed } from 'vue'

interface Props {
  /** 图表数据 */
  data?: Record<string, unknown>[] | Record<string, unknown>
  /** 图表高度 */
  height?: string
  /** 图表配置 */
  options?: Record<string, unknown>
  /** 组件配置 */
  widget?: Record<string, unknown>
  /** 文本列配置 */
  textColumn?: Record<string, unknown>[]
}

const props = withDefaults(defineProps<Props>(), {
  data: undefined,
  height: undefined,
  options: undefined,
  widget: undefined,
  textColumn: () => [],
})

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'dblclick', data: unknown): void
}>()

/**
 * 获取数据对象
 */
const dataObject = computed(() => {
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

/**
 * 获取文本样式
 * @param textStyleName 样式名
 */
function getTextStyle(textStyleName: string): Record<string, unknown> {
  const opts = (props.options as Record<string, any>)?.seriesSetting
  return {
    ...opts[textStyleName],
    fontStyle: opts[textStyleName]?.italics ? 'italic' : undefined,
    fontWeight: opts[textStyleName]?.bold ? 'bold' : undefined,
    fontSize: opts[textStyleName]?.fontSize + 'px',
  }
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
      (props.options as Record<string, any>)?.seriesSetting?.progress?.maxValue
    ).toFixed(2),
  ) * 100
})

/**
 * 格式化外部进度文本
 * @param pct 百分比
 */
function outerTextFormat(pct: number): string {
  return (props.options as Record<string, any>)?.seriesSetting?.progress?.textStyle?.text?.replace(
    /\{percent\}/gi,
    String(pct),
  ) || ''
}

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
</script>

<template>
  <div
    v-if="(options as any)?.seriesSetting"
    class="data-card-progress"
    @click.stop="onTableClick"
    @dblclick="onDblClick"
  >
    <van-image
      v-if="(options as any).seriesSetting.icon"
      class="data-card-image"
      :src="(options as any).seriesSetting.icon"
      :width="(options as any).seriesSetting.iconSize + 'px'"
      :height="(options as any).seriesSetting.iconSize + 'px'"
      fit="cover"
      round
    />
    <div class="data-card-title" :style="(getTextStyle('mainTextStyle') as any)">
      {{ getDataString("mainTextColumn", "卡片标题") }}
    </div>
    <div class="data-card-number" :style="(getTextStyle('numTextStyle') as any)">
      {{ getDataString("numTextColumn", "") }}
    </div>
    <div class="data-card-footer">
      <van-progress
        :percentage="percentage"
        :color="(options as any)?.seriesSetting?.progress?.color"
        :show-pivot="false"
        stripe
        style="flex-grow: 1;"
      />
      <div
        v-if="(options as any) && !(options as any).seriesSetting.progress.textInside"
        class="progress-text"
        :style="{
          color: (options as any).seriesSetting.progress.textStyle.color,
          width: (options as any).seriesSetting.progress.textStyle.width + 'px',
          fontSize: (options as any).seriesSetting.progress.textStyle.fontSize + 'px',
          fontWeight: (options as any).seriesSetting.progress.textStyle.bold ? 600 : undefined,
          fontStyle: (options as any).seriesSetting.progress.textStyle.italics ? 'italic' : undefined,
        }"
      >
        <span v-html="outerTextFormat(percentage)" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.data-card-progress {
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 110px;
  cursor: pointer;
  background: white;

  .data-card-number {
    line-height: 2;
    text-align: left;
    flex-grow: 1;
    flex-shrink: 0;
    height: 40px;
  }

  .data-card-title {
    flex-grow: 0;
    flex-shrink: 0;
  }

  .data-card-footer {
    flex-grow: 0;
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .data-card-image {
    position: absolute;
    top: 0;
    right: 0;
  }

  .progress-text {
    text-align: right;
    flex-shrink: 0;
  }
}
</style>
