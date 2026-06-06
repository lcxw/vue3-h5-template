<script setup lang="ts">
import { ref } from 'vue'

/**
 * FieldStepper 步进器字段组件
 * 提供数字步进功能
 */

interface Props {
  /** 标签 */
  label?: string
  /** 数值 */
  value?: number
  /** 字段属性名 */
  prop?: string
  /** 最小值 */
  min?: number
  /** 最大值 */
  max?: number
  /** 步长 */
  step?: number
  /** 输入框宽度 */
  inputWidth?: string
  /** 输入框高度 */
  inputHeight?: string
  /** 是否整数 */
  integer?: boolean
  /** 是否必填 */
  required?: boolean
  /** 验证规则 */
  rules?: unknown[]
  /** 是否禁用 */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  value: undefined,
  prop: undefined,
  min: 0,
  max: 9999,
  step: 1,
  inputWidth: '64',
  inputHeight: '56',
  integer: false,
  required: false,
  rules: undefined,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:value', value: number): void
  (e: 'change', value: number): void
}>()

const dirty = ref(false)

/**
 * 数值变化处理
 * @param val 数值
 */
function onChange(val: number) {
  emit('update:value', val)
  emit('change', val)
  dirty.value = true
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

// 暴露方法供父组件调用
defineExpose({
  setDirty,
  getDirty,
})
</script>

<template>
  <div class="field-stepper field-form-item">
    <van-field :label="label" :required="required" :name="prop">
      <template #input>
        <van-stepper
          :model-value="value"
          :step="step"
          :min="min"
          :max="max"
          :disabled="disabled"
          @update:model-value="onChange"
        />
      </template>
    </van-field>
  </div>
</template>

<style scoped>
.field-stepper {
  background: white;
}
</style>
