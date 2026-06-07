<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, ref } from 'vue'
import { validateWidget as validateWidgetUtil } from '@/utils/validate'

/**
 * FieldCalendar 日期选择字段组件
 * 提供日期选择功能
 */

interface Props {
  /** 标签 */
  label?: string
  /** 日期值 */
  value?: string | Date | number
  /** 字段属性名 */
  prop?: string
  /** 占位文本 */
  placeholder?: string
  /** 选中颜色 */
  color?: string
  /** 确认按钮文本 */
  confirmText?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否必填 */
  required?: boolean
  /** 验证规则 */
  rules?: unknown[]
  /** 日期格式 */
  format?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  value: undefined,
  prop: undefined,
  placeholder: undefined,
  color: 'var(--van-primary-color)',
  confirmText: '确定',
  disabled: false,
  readonly: false,
  required: false,
  rules: undefined,
  format: 'YYYY-MM-DD',
})

const emit = defineEmits<{
  (e: 'update:value', value: string): void
  (e: 'change', value: string): void
}>()

const showCalendar = ref(false)
const dirty = ref(false)
/** 校验错误信息 */
const errorMessage = ref('')

/**
 * 最大日期
 */
const maxDate = new Date(2050, 0, 1)

/**
 * 计算日期对象
 */
const day = computed(() => {
  if (props.value == null)
    return null
  if (typeof props.value === 'string') {
    return dayjs(props.value, props.format)
  }
  else {
    return dayjs(props.value)
  }
})

/**
 * 计算显示日期
 */
const showDate = computed(() => {
  return day.value ? day.value.format(props.format) : undefined
})

/**
 * 选择日期处理
 * @param date 选择的日期
 */
function onSelectDate(date: Date) {
  const formatted = dayjs(date).format(props.format)
  emit('update:value', formatted)
  emit('change', formatted)
  showCalendar.value = false
}

/**
 * 设置脏状态
 */
function setDirty(val: boolean) {
  dirty.value = val
}

/**
 * 获取脏状态
 */
function getDirty() {
  return dirty.value
}

/**
 * 校验组件值是否符合规则
 * @returns Promise，校验失败时 resolve 错误信息字符串
 */
function validateWidget(): Promise<string | void> {
  return new Promise((resolve) => {
    validateWidgetUtil(props.rules as any[], props.value)
      .then(() => {
        errorMessage.value = ''
        resolve()
      })
      .catch((e: string) => {
        errorMessage.value = e
        resolve(e)
      })
  })
}

// 暴露方法供父组件调用
defineExpose({
  setDirty,
  getDirty,
  validateWidget,
})
</script>

<template>
  <div class="field-calendar field-form-item">
    <van-field
      :label="label"
      :required="required"
      :name="prop"
      :model-value="showDate"
      :placeholder="placeholder"
      :disabled="disabled"
      readonly
      is-link
      @click="showCalendar = !disabled && !readonly"
    />
    <van-calendar
      v-model:show="showCalendar"
      :title="label"
      :color="color"
      :max-date="maxDate"
      @confirm="onSelectDate"
    />
  </div>
</template>

<style scoped>
.field-calendar {
  background: white;
}
</style>
