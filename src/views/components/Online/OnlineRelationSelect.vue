<script setup lang="ts">
/**
 * OnlineRelationSelect 关联选择组件
 * 通过弹窗打开关联表单进行数据选择
 * TODO: 后续完善关联表单弹窗逻辑
 */
import { ref, computed, watch } from 'vue'

interface Props {
  /** 组件配置 */
  widget?: any
  /** 标签文本 */
  label?: string
  /** 是否必填 */
  required?: boolean
  /** 选择器属性配置 */
  props?: {
    label?: string
    value?: string
    relativeFormId?: string
    datasourceId?: string
    relationId?: string
    variableName?: string
    relationTableName?: string
    relationColumnName?: string
    displayField?: string
  }
  /** 绑定值 */
  value?: string | number | any[]
  /** 是否禁用 */
  disabled?: boolean
  /** 占位提示 */
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  widget: undefined,
  label: '关联选择',
  required: false,
  props: () => ({
    label: 'name',
    value: 'id',
    relativeFormId: undefined,
    datasourceId: undefined,
    relationId: undefined,
    variableName: undefined,
    relationTableName: undefined,
    relationColumnName: undefined,
    displayField: undefined,
  }),
  value: undefined,
  disabled: false,
  placeholder: undefined,
})

const emit = defineEmits<{
  (e: 'update:value', value: any): void
  (e: 'change', value: any, detail?: any): void
}>()

/** 是否显示选择弹窗 */
const showSelectDlg = ref(false)

/** 已选中的项目列表 */
const selectedItems = ref<any[]>([])

/**
 * 显示文本（已选项的 displayField 拼接）
 */
const selectValue = computed(() => {
  const labelList = (selectedItems.value || []).map(item => item[props.props?.displayField || 'name'])
  return labelList.length > 0 ? labelList.join(', ') : undefined
})

/**
 * 点击字段打开选择弹窗
 */
function onFieldClick(): void {
  if (!props.disabled) {
    showSelectDlg.value = true
  }
}

/**
 * 关闭选择弹窗回调
 * @param refresh - 是否刷新
 * @param selectItem - 选中的项目
 */
function onCloseSelectForm(refresh: boolean, selectItem?: any): void {
  showSelectDlg.value = false
  if (refresh && selectItem) {
    const val = Array.isArray(selectItem) && selectItem.length > 0
      ? selectItem.map((item: any) => item[props.props?.relationColumnName || 'id'])
      : undefined
    emit('update:value', val)
    emit('change', val)
    selectedItems.value = selectItem
  }
}

/** 监听值变化，获取选中项 */
watch(
  () => props.value,
  () => {
    // TODO: 根据 value 调用接口获取 selectedItems
    if (props.value == null || props.value === '') {
      selectedItems.value = []
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="relation-select">
    <!-- TODO: 后续完善关联表单弹窗 -->
    <van-field
      :model-value="selectValue"
      :label="label"
      :placeholder="placeholder || `请选择${label}`"
      :required="required"
      :disabled="disabled"
      is-link
      readonly
      @click="onFieldClick"
    />
  </div>
</template>

<style scoped>
.relation-select {
  width: 100%;
}
</style>
