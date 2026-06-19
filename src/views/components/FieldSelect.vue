<script setup lang="ts">
import { computed, ref } from 'vue'
import SelectPopup from './SelectPopup/index.vue'
import { findItemFromList } from './utils'
import { validateWidget as validateWidgetUtil } from '@/utils/validate'

/**
 * FieldSelect 选择框字段组件
 * 提供下拉选择功能
 */

interface Props {
  /** 选择值 */
  value?: string | number | unknown[]
  /** 标签 */
  label?: string
  /** 字段属性名 */
  prop?: string
  /** 占位文本 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否必填 */
  required?: boolean
  /** 是否多选 */
  multiple?: boolean
  /** 数据列表 */
  dataList?: Record<string, unknown>[]
  /** 选中颜色 */
  color?: string
  /** 属性映射 */
  props?: {
    label: string
    value: string
  }
  /** 验证规则 */
  rules?: unknown[]
}

const props = withDefaults(defineProps<Props>(), {
  value: undefined,
  label: undefined,
  prop: undefined,
  placeholder: undefined,
  disabled: false,
  required: false,
  multiple: false,
  dataList: () => [],
  color: undefined,
  props: () => ({
    label: 'name',
    value: 'id',
  }),
  rules: undefined,
})

const emit = defineEmits<{
  (e: 'update:value', value: unknown): void
  (e: 'change', value: unknown): void
}>()

const showPicker = ref(false)
const dirty = ref(false)
/** 校验错误信息 */
const errorMessage = ref('')

/**
 * 计算显示值
 */
const selectValue = computed(() => {
  if (props.value == null)
    return ''
  let temp = props.value
  if (Array.isArray(props.dataList)) {
    if (props.multiple) {
      temp = Array.isArray(props.value)
        ? props.value.map((item) => {
            const node = findItemFromList(props.dataList!, item, props.props.value)
            return node ? node[props.props.label] : null
          }).filter(item => item != null)
        : props.value
    }
    else {
      const node = findItemFromList(props.dataList!, props.value, props.props.value)
      if (node)
        temp = node[props.props.label]
    }
  }
  return Array.isArray(temp) ? temp.join(' / ') : String(temp)
})

/**
 * 选择变化处理
 * @param val 选择值
 */
function onChange(val: unknown) {
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
  <div class="field-select field-form-item">
    <van-field
      :label="label"
      :required="required"
      :name="prop"
      :model-value="selectValue"
      :placeholder="placeholder"
      :disabled="disabled"
      readonly
      is-link
      @click="showPicker = !disabled"
    />
    <SelectPopup
      :show-picker-dlg="showPicker"
      :value="value"
      :title="label"
      :multiple="multiple"
      :data-list="dataList"
      :props="{ text: props.props.label, value: props.props.value }"
      :color="color"
      @update:value="onChange"
      @close="showPicker = false"
    />
  </div>
</template>

<style scoped>
.field-select {
  background: white;
}
</style>
