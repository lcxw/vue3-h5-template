<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * FieldCheckBox 多选框字段组件
 * 提供多选功能
 */

interface Props {
  /** 标签 */
  label?: string
  /** 选择值 */
  value?: unknown[]
  /** 字段属性名 */
  prop?: string
  /** 图标大小 */
  iconSize?: string | number
  /** 排列方向 */
  direction?: string
  /** 选中颜色 */
  activeColor?: string
  /** 是否必填 */
  required?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 数据列表 */
  dataList?: Record<string, unknown>[]
  /** 属性映射 */
  props?: {
    value: string
    label: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  value: undefined,
  prop: undefined,
  iconSize: '20px',
  direction: 'horizontal',
  activeColor: 'var(--van-primary-color)',
  required: false,
  disabled: false,
  dataList: () => [],
  props: () => ({
    value: 'id',
    label: 'name',
  }),
})

const emit = defineEmits<{
  (e: 'update:value', value: unknown[]): void
  (e: 'change', value: unknown[]): void
}>()

const dirty = ref(false)

/**
 * 计算选中值
 */
const checkVal = computed(() => {
  if (Array.isArray(props.value))
    return props.value
  return []
})

/**
 * 选择变化处理
 * @param val 选择值
 */
function onChange(val: unknown[]) {
  emit('update:value', val)
  emit('change', val)
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
  <div class="field-checkbox field-form-item">
    <van-field :label="label" :required="required" :name="prop">
      <template #input>
        <van-checkbox-group
          :model-value="checkVal"
          :disabled="disabled"
          :direction="direction as 'horizontal' | 'vertical'"
          @update:model-value="onChange"
        >
          <van-checkbox
            v-for="item in dataList"
            :key="item[props.props.value]"
            :name="item[props.props.value]"
            shape="square"
          >
            {{ item[props.props.label] }}
          </van-checkbox>
        </van-checkbox-group>
      </template>
    </van-field>
  </div>
</template>

<style scoped>
.field-checkbox {
  background: white;
}
</style>
