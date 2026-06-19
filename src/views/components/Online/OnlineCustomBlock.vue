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
const formInject = inject<(() => any) | undefined>('form', undefined)

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
  const val = form().getWidgetValue(widget)
  // 调试：跟踪上传组件的值
  if (widget.propString && widget.propString.includes('FJ')) {
    console.log('[OnlineCustomBlock.getWidgetValue] prop=%s val=%o widget.column=%o',
      widget.propString, val, widget.column?.columnName)
  }
  return val
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
  <!-- 使用 vant 栅格布局，支持 gutter 间距和 span 列宽控制 -->
  <van-row class="custom-block" :gutter="gutter">
    <van-col
      v-for="(widget, index) in validWidgetList"
      :key="index + widget.variableName"
      :class="subWidgetClass"
      :span="24"
    >
      <div :style="{ marginBottom: (widget.props?.paddingBottom ? widget.props.paddingBottom : 0) + 'px' }">
        <OnlineCustomWidget
          :value="getWidgetValue(widget)"
          :widget="widget"
          @update:value="(val: any) => onWidgetValueChange(widget, val)"
          @change="(val: any, detail?: any) => onChange(widget, val, detail)"
        />
      </div>
    </van-col>
  </van-row>
</template>

<style scoped>
/* 栅格列间距调整 */
.custom-block :deep(.van-col) {
  margin-bottom: 0;
}
</style>
