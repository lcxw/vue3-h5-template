<script setup lang="ts">
/**
 * DataCard 数据卡片组件
 * 提供数据卡片展示功能，支持图标、标题、数值、页脚
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

/**
 * 获取数据对象（如果是数组取第一个）
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

/** 是否显示页脚文本 */
const isShowFootText = computed(() => {
  const opts = props.options as Record<string, any> | undefined
  return opts && opts.datasetInfo && opts.datasetInfo.footTextColumn && opts.datasetInfo.footTextColumn.length > 0
})

/** 是否显示页脚数值 */
const isShowFootNum = computed(() => {
  const opts = props.options as Record<string, any> | undefined
  return opts && opts.datasetInfo && opts.datasetInfo.footNumTextColumn && opts.datasetInfo.footNumTextColumn.length > 0
})

/** 页脚数值文本 */
const footerNumText = computed(() => {
  const numText = getDataString('footNumTextColumn', '')
  if (!isNaN(Number(numText))) {
    return Number(numText)
  }
  return numText
})

/** 页脚数值图标 */
const footerNumIcon = computed(() => {
  if (!isNaN(Number(footerNumText.value))) {
    return Number(footerNumText.value) >= 0 ? 'arrow-up' : 'arrow-down'
  }
  return ''
})

/** 显示的页脚数值 */
const showFooterNumText = computed(() => {
  if (!isNaN(Number(footerNumText.value))) {
    return Math.abs(Number(footerNumText.value))
  }
  return footerNumText.value
})

/**
 * 获取文本样式
 * @param textStyleName 样式名
 */
function getTextStyle(textStyleName: string): Record<string, any> {
  const opts = (props.options as Record<string, any>)?.seriesSetting
  return {
    ...opts[textStyleName],
    fontStyle: opts[textStyleName]?.italics ? 'italic' : undefined,
    fontWeight: opts[textStyleName]?.bold ? 'bold' : undefined,
    fontSize: opts[textStyleName]?.fontSize + 'px',
  }
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
    class="data-card"
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
    <div class="data-card-title" :style="getTextStyle('mainTextStyle')">
      {{ getDataString("mainTextColumn", "卡片标题") }}
    </div>
    <div class="data-card-number" :style="getTextStyle('numTextStyle')">
      {{ getDataString("numTextColumn", "") }}
    </div>
    <div v-if="isShowFootText || isShowFootNum" class="data-card-footer">
      <div v-if="isShowFootText" :style="getTextStyle('footTextStyle')">
        {{ getDataString("footTextColumn", "") }}
      </div>
      <div v-if="isShowFootNum" :style="{
        ...getTextStyle('footNumTextStyle'),
        color: footerNumIcon === 'arrow-up' ? '#00A241' : '#EF502F',
      }">
        <van-icon v-if="footerNumIcon" :name="footerNumIcon" />
        {{ showFooterNumText }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.data-card {
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 110px;
  cursor: pointer;

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
    border-top: 1px solid #E8E8E8;
    padding-top: 10px;
    display: flex;
    justify-content: space-between;
  }

  .data-card-image {
    position: absolute;
    top: 0;
    right: 0;
  }
}
</style>
