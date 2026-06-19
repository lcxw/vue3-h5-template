<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import UserSelectDlg from './UserSelectDlg.vue'
import { SysCommonBizController } from '@/api/Controller/SysCommonBizController'

/**
 * UserSelect 用户选择组件
 * 提供用户选择功能，支持回显用户名称
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
  /** 占位文本 */
  placeholder?: string
  /** 验证规则 */
  rules?: unknown[]
  /** 过滤对象 */
  filterObject?: Record<string, unknown>
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  value: undefined,
  prop: undefined,
  props: () => ({
    label: 'showName',
    value: 'userId',
  }),
  multiple: false,
  disabled: false,
  required: false,
  placeholder: undefined,
  rules: undefined,
  filterObject: undefined,
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
 * 根据用户ID列表加载用户详情
 * @param idList 用户ID列表
 */
function loadSelectedUsers(idList: (string | number)[]): void {
  if (!idList || idList.length === 0) {
    selectedItems.value = []
    return
  }
  SysCommonBizController.viewByIds({
    widgetType: 'upms_user',
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
 * @param items 选中的用户对象列表
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

// 监听值变化，加载选中用户详情
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
    loadSelectedUsers(idList)
  },
  { immediate: true },
)

// 暴露方法供父组件调用
defineExpose({
  getSelectItems,
})
</script>

<template>
  <div class="user-select field-form-item">
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
      <UserSelectDlg
        :row-key="props.props.value"
        :value="value"
        :multiple="multiple"
        :filter-object="filterObject"
        @update:value="onSelectChange"
        @confirm="onConfirm"
        @close="onCloseSelectDlg"
      />
    </van-popup>
  </div>
</template>

<style scoped>
.user-select {
  background: white;
}
</style>
