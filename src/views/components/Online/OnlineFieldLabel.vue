<script setup lang="ts">
/**
 * OnlineFieldLabel 在线字段只读标签组件
 * 用于表单只读模式下显示字段值
 */
import { computed } from 'vue'
import { SysCustomWidgetType } from '@/staticDict/index'

interface Props {
  /** 字段值 */
  value?: string | number | boolean | Date | null
  /** 组件配置 */
  widget: any
}

const props = defineProps<Props>()

/**
 * 获取显示值
 */
const showValue = computed(() => {
  if (props.widget && props.widget.widgetType === SysCustomWidgetType.Switch) {
    return props.value ? '是' : '否'
  }
  if (props.value == null) return ''
  return String(props.value)
})
</script>

<template>
  <div class="online-field-label">
    <van-field
      :label="widget.showName"
      :required="widget.props?.required"
      :model-value="showValue"
      readonly
      is-link
    />
  </div>
</template>

<style scoped>
.online-field-label {
  background: white;
}
</style>
