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
 * 判断内容是否为 HTML 富文本
 * @param str 待检测的字符串
 */
function isHtmlContent(str: string): boolean {
  return /<[a-zA-Z][^>]*>/.test(str)
}

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

/**
 * 判断当前内容是否为富文本
 */
const isRichText = computed(() => {
  return typeof showValue.value === 'string' && isHtmlContent(showValue.value)
})
</script>

<template>
  <div class="online-field-label">
    <van-field
      :label="widget.showName"
      :required="widget.props?.required"
      readonly
      is-link
    >
      <template #input>
        <span v-if="isRichText" class="rich-text-content" v-html="showValue" />
        <span v-else>{{ showValue }}</span>
      </template>
    </van-field>
  </div>
</template>

<style scoped>
.online-field-label {
  background: white;
}

.rich-text-content {
  line-height: 1.5;
  word-break: break-all;
}

.rich-text-content :deep(img) {
  max-width: 100%;
  height: auto;
}
</style>
