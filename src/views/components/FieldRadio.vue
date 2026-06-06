<script setup lang="ts">
import { ref } from 'vue'

/**
 * FieldRadio 单选框字段组件
 * 提供单选功能
 */

interface Props {
  /** 标签 */
  label?: string
  /** 选择值 */
  value?: boolean | string | number
  /** 选中颜色 */
  color?: string
  /** 图标大小 */
  iconSize?: string
  /** 排列方向 */
  direction?: string
  /** 是否必填 */
  required?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 数据列表 */
  dataList?: Record<string, unknown>[]
  /** 验证规则 */
  rules?: unknown[]
  /** 字段属性名 */
  prop?: string
  /** 属性映射 */
  props?: {
    value: string
    label: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  value: undefined,
  color: 'var(--van-primary-color)',
  iconSize: '20px',
  direction: 'horizontal',
  required: false,
  disabled: false,
  dataList: () => [],
  rules: undefined,
  prop: undefined,
  props: () => ({
    value: 'id',
    label: 'name',
  }),
})

const emit = defineEmits<{
  (e: 'update:value', value: unknown): void
  (e: 'change', value: unknown): void
}>()

const dirty = ref(false)

/**
 * 选择变化处理
 * @param val 选择值
 */
function onChange(val: unknown) {
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
  <div class="field-radio field-form-item">
    <van-field :label="label" :required="required" :name="prop">
      <template #input>
        <van-radio-group
          :model-value="value"
          :disabled="disabled"
          :direction="direction as 'horizontal' | 'vertical'"
          @update:model-value="onChange"
        >
          <van-radio
            v-for="item in dataList"
            :key="item[props.props.value]"
            :name="item[props.props.value]"
          >
            {{ item[props.props.label] }}
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
  </div>
</template>

<style scoped>
.field-radio {
  background: white;
}
</style>
