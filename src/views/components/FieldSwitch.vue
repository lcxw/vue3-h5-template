<script setup lang="ts">
import { ref } from 'vue'

/**
 * FieldSwitch 开关字段组件
 * 提供开关切换功能
 */

interface Props {
  /** 标签 */
  label?: string
  /** 开关值 */
  value?: boolean
  /** 字段属性名 */
  prop?: string
  /** 开关大小 */
  size?: string | number
  /** 选中颜色 */
  activeColor?: string
  /** 未选中颜色 */
  inactiveColor?: string
  /** 是否必填 */
  required?: boolean
  /** 验证规则 */
  rules?: unknown[]
  /** 是否禁用 */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  value: false,
  prop: undefined,
  size: '20px',
  activeColor: 'var(--van-primary-color)',
  inactiveColor: '#E8E8E8',
  required: false,
  rules: undefined,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:value', value: boolean): void
  (e: 'change', value: boolean): void
}>()

const dirty = ref(false)

/**
 * 开关变化处理
 * @param val 开关值
 */
function onChange(val: boolean) {
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
  <div class="field-switch field-form-item">
    <van-field :label="label" :required="required" :name="prop">
      <template #input>
        <van-switch
          :model-value="value"
          :size="size"
          :active-color="activeColor"
          :inactive-color="inactiveColor"
          :disabled="disabled"
          @update:model-value="onChange"
        />
      </template>
    </van-field>
  </div>
</template>

<style scoped>
.field-switch {
  background: white;
}
</style>
