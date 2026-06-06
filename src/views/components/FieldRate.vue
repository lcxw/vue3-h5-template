<script setup lang="ts">
import { ref } from 'vue'

/**
 * FieldRate 评分字段组件
 * 提供评分功能
 */

interface Props {
  /** 标签 */
  label?: string
  /** 评分值 */
  value?: number
  /** 字段属性名 */
  prop?: string
  /** 评分总数 */
  count?: number
  /** 间距 */
  gutter?: string | number
  /** 图标大小 */
  size?: string
  /** 选中颜色 */
  color?: string
  /** 未选中颜色 */
  voidColor?: string
  /** 是否允许半选 */
  allowHalf?: boolean
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
  count: 5,
  gutter: 20,
  size: '20',
  color: 'var(--van-primary-color)',
  voidColor: '#c8c9cc',
  allowHalf: false,
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
 * 评分变化处理
 * @param val 评分值
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
  <div class="field-rate field-form-item">
    <van-field :label="label" :required="required" :name="prop">
      <template #input>
        <van-rate
          :model-value="value"
          :count="count"
          :size="size"
          :gutter="gutter"
          :color="color"
          :void-color="voidColor"
          :disabled="disabled"
          @update:model-value="onChange"
        />
      </template>
    </van-field>
  </div>
</template>

<style scoped>
.field-rate {
  background: white;
}
</style>
