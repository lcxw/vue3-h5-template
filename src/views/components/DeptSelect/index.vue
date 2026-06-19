<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import DeptSelectDlg from './DeptSelectDlg.vue'
import { SysCommonBizController } from '@/api/Controller/SysCommonBizController'

/**
 * DeptSelect 部门选择组件
 * 提供部门选择功能，支持回显部门名称
 */

interface Props {
  /** 标签 */
  label?: string
  /** 选择值 */
  value?: string | number | unknown[]
  /** 字段属性名 */
  prop?: string
  /** 属性映射 */
  props?: {
    label: string
    value: string
  }
  /** 是否多选 */
  multiple?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 是否必填 */
  required?: boolean
  /** 验证规则 */
  rules?: unknown[]
  /** 占位文本 */
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '部门选择',
  value: undefined,
  prop: undefined,
  props: () => ({
    label: 'deptName',
    value: 'deptId',
  }),
  multiple: false,
  disabled: false,
  required: false,
  rules: undefined,
  placeholder: undefined,
})

const emit = defineEmits<{
  (e: 'update:value', value: unknown): void
  (e: 'change', value: unknown): void
}>()

const showSelectDlg = ref(false)
const selectedItems = ref<Record<string, unknown>[]>([])

/**
 * 计算显示值
 */
const selectValue = computed(() => {
  const labelList = (selectedItems.value || []).map(item => item[props.props.label])
  return labelList.length > 0 ? labelList.join(', ') : undefined
})

/**
 * 根据部门ID列表加载部门详情
 * @param idList 部门ID列表
 */
function loadSelectedDepts(idList: (string | number)[]): void {
  if (!idList || idList.length === 0) {
    selectedItems.value = []
    return
  }
  SysCommonBizController.viewByIds({
    widgetType: 'upms_dept',
    fieldName: props.props.value,
    fieldValues: idList.join(','),
  }).then((res: any) => {
    if (Array.isArray(res)) {
      selectedItems.value = res
    } else {
      selectedItems.value = []
    }
  }).catch(() => {
    selectedItems.value = []
  })
}

/**
 * 点击处理
 */
function onClick() {
  if (props.disabled)
    return
  showSelectDlg.value = true
}

/**
 * 关闭选择弹窗
 */
function onCloseSelectDlg() {
  showSelectDlg.value = false
}

/**
 * 选择确认处理（立即更新显示）
 * @param items 选中的部门对象列表
 */
function onConfirm(items: any[]) {
  selectedItems.value = items
}

/**
 * 选择变化处理
 * @param val 选择值
 */
function onSelectChange(val: unknown[]) {
  const temp = props.multiple ? val : val[0]
  emit('update:value', temp)
  emit('change', temp)
}

/**
 * 获取选中项列表
 */
function getSelectItems() {
  return selectedItems.value
}

// 监听值变化，加载选中部门详情
watch(
  () => props.value,
  (newVal) => {
    if (!newVal || (Array.isArray(newVal) && newVal.length === 0)) {
      selectedItems.value = []
      return
    }
    let idList: (string | number)[]
    if (Array.isArray(newVal)) {
      idList = newVal as (string | number)[]
    } else {
      idList = [newVal as string | number]
    }
    loadSelectedDepts(idList)
  },
  { immediate: true },
)

// 暴露方法供父组件调用
defineExpose({
  getSelectItems,
})
</script>

<template>
  <div class="dept-select field-form-item">
    <van-field
      :label="label"
      :required="required"
      :name="prop"
      :model-value="selectValue"
      :placeholder="placeholder"
      :disabled="disabled"
      readonly
      is-link
      @click="onClick"
    />
    <van-popup
      v-model:show="showSelectDlg"
      position="bottom"
      round
      :style="{ height: '70%' }"
    >
      <DeptSelectDlg
        :row-key="props.props.value"
        :value="value"
        :multiple="multiple"
        @update:value="onSelectChange"
        @confirm="onConfirm"
        @close="onCloseSelectDlg"
      />
    </van-popup>
  </div>
</template>

<style scoped>
.dept-select {
  background: white;
}
</style>
