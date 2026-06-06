<script setup lang="ts">
/**
 * OnlineCustomBlock 在线自定义块组件
 * 递归渲染组件列表，是表单渲染的核心入口
 */
import { computed, inject } from 'vue'
import OnlineCustomWidget from './OnlineCustomWidget.vue'

interface Props {
  /** 栅格间距 */
  gutter?: number
  /** 组件列表 */
  widgetList?: any[]
  /** 子组件样式类 */
  subWidgetClass?: string
  /** 操作对象 */
  operation?: any
}

const props = withDefaults(defineProps<Props>(), {
  gutter: 0,
  widgetList: () => [],
  subWidgetClass: undefined,
  operation: undefined,
})

/** 注入表单上下文 */
const formInject = inject<() => any>('form', undefined)

/**
 * 安全获取表单上下文
 */
function form(): any {
  if (formInject == null) return {}
  return formInject() || {}
}

/**
 * 获取组件值
 * @param widget - 组件信息
 */
function getWidgetValue(widget: any): any {
  if (props.operation && typeof props.operation.getWidgetValue === 'function') {
    return props.operation.getWidgetValue(widget)
  }
  return form().getWidgetValue(widget)
}

/**
 * 组件值变更处理
 * @param widget - 组件信息
 * @param val - 新值
 */
function onWidgetValueChange(widget: any, val: any): void {
  form().onValueChange(widget, val)
}

/**
 * 组件值变化处理（带详情）
 * @param widget - 组件信息
 * @param val - 新值
 * @param detail - 详情信息
 */
function onChange(widget: any, val: any, detail?: any): void {
  return form().onWidgetValueChange(widget, val, detail)
}

/**
 * 过滤出可见的组件列表
 */
const validWidgetList = computed(() => {
  return (props.widgetList || []).filter((widget: any) => form().getWidgetVisible(widget))
})
</script>

<template>
  <div class="custom-block">
    <div
      v-for="(widget, index) in validWidgetList"
      :key="index + widget.variableName"
      :class="subWidgetClass"
      class="custom-block-item"
    >
      <div :style="{ marginBottom: (widget.props?.paddingBottom ? widget.props.paddingBottom : 0) + 'px' }">
        <OnlineCustomWidget
          :value="getWidgetValue(widget)"
          :widget="widget"
          @update:value="(val: any) => onWidgetValueChange(widget, val)"
          @change="(val: any, detail?: any) => onChange(widget, val, detail)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-block-item {
  width: 100%;
}
</style>
