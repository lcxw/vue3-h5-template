<script setup lang="ts">
import { ref } from 'vue'
import { validateWidget as validateWidgetUtil } from '@/utils/validate'

/**
 * FieldInput 输入框字段组件
 * 提供文本输入功能
 */

interface Props {
  /** 输入值 */
  value?: string | number | Date | boolean
  /** 标签 */
  label?: string
  /** 是否必填 */
  required?: boolean
  /** 输入类型 */
  type?: string
  /** 最大长度 */
  maxlength?: number
  /** 是否密码输入 */
  password?: boolean
  /** 是否可清空 */
  clearable?: boolean
  /** 占位文本 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 字段属性名 */
  prop?: string
  /** 验证规则 */
  rules?: unknown[]
}

const props = withDefaults(defineProps<Props>(), {
  value: undefined,
  label: undefined,
  required: false,
  type: 'text',
  maxlength: -1,
  password: false,
  clearable: false,
  placeholder: undefined,
  disabled: false,
  readonly: false,
  prop: undefined,
  rules: undefined,
})

const emit = defineEmits<{
  (e: 'update:value', value: string): void
  (e: 'change', value: string): void
}>()

const dirty = ref(false)
/** 校验错误信息 */
const errorMessage = ref('')

/**
 * 安全转换为字符串，null/undefined 显示为空
 * @param val 输入值
 */
function safeString(val: unknown): string {
  if (val == null) return ''
  return String(val)
}

/**
 * 输入变化处理
 * @param val 输入值
 */
function onChange(val: string) {
  emit('update:value', val)
  emit('change', val)
  dirty.value = true
}

/**
 * 设置脏状态
 * @param val 脏状态值
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
  <div class="field-input field-form-item">
    <van-field
      :label="label"
      :required="required"
      :name="prop"
      :model-value="safeString(value)"
      :type="type as 'text' | 'number' | 'digit' | 'tel' | 'email' | 'password' | 'textarea'"
      :maxlength="maxlength > 0 ? maxlength : undefined"
      :placeholder="placeholder"
      :disabled="disabled || readonly"
      :clearable="clearable"
      @update:model-value="onChange"
    />
  </div>
</template>

<style scoped>
.field-input {
  background: white;
}
</style>
