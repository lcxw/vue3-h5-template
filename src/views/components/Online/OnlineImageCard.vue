<script setup lang="ts">
/**
 * OnlineImageCard 图片卡片组件
 * 支持左右图片布局、字典值显示和选择功能的卡片容器
 */
import { computed, inject } from 'vue'
import { SysCustomWidgetType, SysCustomWidgetBindDataType } from '@/staticDict'
import OnlineCustomImage from './OnlineCustomImage.vue'
import OnlineCustomBlock from './OnlineCustomBlock.vue'

interface Props {
  /** 行数据 */
  rowData?: any
  /** 主表信息 */
  masterTable?: any
  /** 组件配置 */
  widget?: any
  /** 父级组件 */
  parentWidget?: any
  /** 是否支持选择 */
  supportSelect?: boolean
  /** 是否已选中 */
  isSelect?: boolean
  /** 是否块级显示 */
  isBlock?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  rowData: undefined,
  masterTable: undefined,
  widget: undefined,
  parentWidget: undefined,
  supportSelect: false,
  isSelect: false,
  isBlock: false,
})

const emit = defineEmits<{
  (e: 'select', rowData: any, checked: boolean): void
}>()

/** 注入表单上下文 */
const formInject = inject<(() => any) | undefined>('form', undefined)

/**
 * 安全获取表单上下文
 */
function form(): any {
  if (formInject == null) return {}
  return formInject() || {}
}

/**
 * 获取图片组件（childWidgetList 的第一个元素）
 */
const imageWidget = computed(() => {
  if (Array.isArray(props.widget?.childWidgetList) && props.widget.childWidgetList.length > 0) {
    return props.widget.childWidgetList[0]
  }
  return null
})

/**
 * 获取除图片外的子组件列表（childWidgetList 从第二个元素开始）
 */
const childWidgetList = computed(() => {
  if (Array.isArray(props.widget?.childWidgetList) && props.widget.childWidgetList.length > 1) {
    return props.widget.childWidgetList.slice(1)
  }
  return []
})

/**
 * 获取字段显示值，支持字典映射
 * @param data - 当前行数据
 * @param widget - 组件配置
 */
function getValue(data: any, widget: any): any {
  if (widget.column == null) return ''
  const formCtx = form()
  if (
    formCtx.readOnly ||
    widget.widgetType === SysCustomWidgetType.getValue('Label') ||
    widget.widgetType === SysCustomWidgetType.getValue('Text')
  ) {
    let dictObj = undefined
    if (widget?.column?.columnName && data) {
      dictObj = data[widget.column.columnName + 'DictMap']
    }
    if (dictObj != null && dictObj.name) return dictObj.name
    let dictArray = undefined
    if (widget?.column?.columnName && data) {
      dictArray = data[widget.column.columnName + 'DictMapList']
    }
    if (Array.isArray(dictArray) && dictArray.length > 0) {
      return dictArray.map((item: any) => item.name).join(',')
    }
  }
  return data[widget.column.columnName]
}

/**
 * 获取组件值（支持主表和从表数据源）
 * @param widget - 组件配置
 */
function getWidgetValue(widget: any): any {
  if (props.rowData == null || widget.bindData.dataType !== SysCustomWidgetBindDataType.Column) {
    return form().getWidgetValue(widget)
  } else {
    if (props.parentWidget == null) {
      // 来自于主表
      if (widget.relation) {
        return getValue(props.rowData[widget.relation.variableName], widget)
      } else {
        return getValue(props.rowData, widget)
      }
    } else {
      // 来自于从表
      return getValue(props.rowData, widget)
    }
  }
}

/**
 * 值变更处理
 * @param widget - 组件配置
 * @param val - 新值
 */
function onValueChange(widget: any, val: any): void {
  if (props.rowData) {
    props.rowData[widget.column.columnName] = val
  } else {
    form().onValueChange(widget, val)
  }
}

/**
 * 组件值变更处理，同步字典数据到行数据
 * @param widget - 组件配置
 * @param val - 新值
 * @param detail - 详情信息（包含字典数据）
 */
function onWidgetValueChange(widget: any, val: any, detail?: any): void {
  const dictData = (detail || {}).dictData
  if (widget.relation && dictData && props.rowData) {
    if (
      widget.bindData.dataType === SysCustomWidgetBindDataType.Column &&
      widget.column
    ) {
      if (Array.isArray(dictData)) {
        props.rowData[widget.column.columnName + 'DictMapList'] = dictData
      } else {
        props.rowData[widget.column.columnName + 'DictMap'] = dictData
      }
    }
  }
}

/**
 * 选择状态变更处理
 * @param checked - 是否选中
 */
function onSelectChange(checked: boolean): void {
  emit('select', props.rowData, checked)
}
</script>

<template>
  <div
    class="online-image-card"
    :class="{ block: isBlock }"
    :style="{ paddingLeft: supportSelect ? '28px' : undefined }"
  >
    <div class="card-box">
      <!-- 左侧图片 -->
      <OnlineCustomImage
        v-if="widget.props.imagePosition === 'left' && imageWidget"
        class="image"
        :style="{ alignSelf: widget.props.imageAlign }"
        :value="getWidgetValue(imageWidget)"
        :src="imageWidget.props.src"
        :fit="imageWidget.props.fit"
        :width="imageWidget.props.width"
        :height="imageWidget.props.height"
        :round="imageWidget.props.round"
        :radius="imageWidget.props.radius"
        :widget="imageWidget"
        :form-fn="formInject"
      />
      <!-- 卡片内容区域 -->
      <OnlineCustomBlock
        class="card-content"
        :widget-list="childWidgetList"
        :operation="{
          getWidgetValue: getWidgetValue,
          onWidgetValueChange: onWidgetValueChange,
          onValueChange: onValueChange,
        }"
      />
      <!-- 右侧图片 -->
      <OnlineCustomImage
        v-if="widget.props.imagePosition === 'right' && imageWidget"
        class="image"
        :style="{ alignSelf: widget.props.imageAlign }"
        :value="getWidgetValue(imageWidget)"
        :src="imageWidget.props.src"
        :fit="imageWidget.props.fit"
        :width="imageWidget.props.width"
        :height="imageWidget.props.height"
        :round="imageWidget.props.round"
        :radius="imageWidget.props.radius"
        :widget="imageWidget"
        :form-fn="formInject"
      />
    </div>
    <!-- 菜单插槽 -->
    <div>
      <slot name="menu" />
    </div>
    <!-- 选择复选框 -->
    <van-checkbox
      v-if="supportSelect"
      class="select"
      :model-value="isSelect"
      @update:model-value="onSelectChange"
    />
  </div>
</template>

<style scoped>
.block {
  background: #f6f7f9 !important;
  border-radius: 8px !important;
  margin-bottom: 15px;
}

.online-image-card {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  border-radius: 8px;
  background: white;
  margin: 0;
  border: 1px solid #ebedf0;
}

.card-box {
  display: flex;
  flex-direction: column;
}

.card-content {
  flex-grow: 1;
  flex-shrink: 1;
  min-width: 0;
}

.image {
  flex-shrink: 0;
  margin-bottom: 8px;
}

.select {
  position: absolute;
  left: 8px;
  top: 17px;
}
</style>
