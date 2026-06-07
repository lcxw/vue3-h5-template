<script setup lang="ts">
import { ref } from 'vue'
import { validateWidget as validateWidgetUtil } from '@/utils/validate'

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
/** 校验错误信息 */
const errorMessage = ref('')

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
