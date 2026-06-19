<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CustomCascaderPanel from './CustomCascaderPanel/index.vue'
import CustomPopup from './CustomPopup/index.vue'
import { findTreeNodeObjectPath, traverseTree } from './utils'
import { validateWidget as validateWidgetUtil } from '@/utils/validate'

/**
 * FieldCascader 级联选择字段组件
 * 提供级联选择功能
 */

interface Props {
  /** 组件配置 */
  widget?: Record<string, unknown>
  /** 字段属性名 */
  prop?: string
  /** 选择值 */
  value?: string | number | unknown[]
  /** 标签 */
  label?: string
  /** 占位文本 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否必填 */
  required?: boolean
  /** 验证规则 */
  rules?: unknown[]
  /** 是否多选 */
  multiple?: boolean
  /** 选中颜色 */
  color?: string
  /** 数据列表 */
  dataList?: Record<string, unknown>[]
  /** 属性映射 */
  props?: {
    value: string
    label: string
    children: string
    showCheckbox?: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  widget: undefined,
  prop: undefined,
  value: undefined,
  label: undefined,
  placeholder: undefined,
  disabled: false,
  required: false,
  rules: undefined,
  multiple: false,
  color: undefined,
  dataList: () => [],
  props: () => ({
    value: 'id',
    label: 'name',
    children: 'children',
    showCheckbox: 'showCheckbox',
  }),
})

const emit = defineEmits<{
  (e: 'update:value', value: unknown): void
  (e: 'change', value: unknown): void
}>()

const showPickerDlg = ref(false)
const selectValue = ref<any>(undefined)
const cascadePanelRef = ref<InstanceType<typeof CustomCascaderPanel> | null>(null)
const dirty = ref(false)
/** 校验错误信息 */
const errorMessage = ref('')

/**
 * 计算级联面板属性映射
 * 将 FieldCascader 的 props 格式转换为 CustomCascaderPanel 期望的格式
 */
const cascaderProps = computed(() => ({
  text: props.props.label,
  value: props.props.value,
  children: props.props.children,
  showCheckbox: props.props.showCheckbox,
}))

/**
 * 计算树形数据列表
 */
const treeDataList = computed(() => {
  const list = [...props.dataList]
  traverseTree(list, (node) => {
    node.showCheckbox = props.multiple
  })
  return list
})

/**
 * 计算显示值
 */
const getShowValue = computed(() => {
  if (props.value == null) return ''
  try {
    if (Array.isArray(props.value)) {
      const arr = props.value.map((item) => {
        const path = findTreeNodeObjectPath(props.dataList, item, props.props.value, props.props.children)
        return path.map(p => p[props.props.label]).join(' / ')
      })
      return arr.join(',')
    }
    else {
      const path = findTreeNodeObjectPath(props.dataList, props.value, props.props.value, props.props.children)
      return path.map(p => p[props.props.label]).join(' / ')
    }
  }
  catch {
    return String(props.value ?? '')
  }
})

/**
 * 关闭弹窗
 */
function onCancel() {
  showPickerDlg.value = false
}

/**
 * 确认选择
 */
function onConfirm() {
  emit('update:value', selectValue.value)
  emit('change', selectValue.value)
  onCancel()
}

/**
 * 重置选择
 */
function onReset() {
  selectValue.value = props.multiple ? [] : null
}

/**
 * 选择变化处理
 * @param value 选择值
 */
function onSelectChange(value: unknown) {
  selectValue.value = value
}

/**
 * 设置脏状态
 * @param val 脏状态值
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

// 监听值变化
watch(
  () => props.value,
  (val) => {
    selectValue.value = val
  },
  { immediate: true },
)
</script>

<template>
  <div class="field-cascader field-form-item">
    <van-field
      :label="label"
      :required="required"
      :name="prop"
      :model-value="getShowValue"
      :placeholder="placeholder"
      :disabled="disabled"
      readonly
      is-link
      @click="showPickerDlg = !disabled"
    />
    <CustomPopup
      class="cascader-select-popup"
      :title="label"
      :show-picker-dlg="showPickerDlg"
      @close="onCancel"
      @reset="onReset"
      @confirm="onConfirm"
    >
      <CustomCascaderPanel
        ref="cascadePanelRef"
        height="100%"
        :value="selectValue"
        :multiple="multiple"
        :color="color"
        :options="treeDataList"
        :props="cascaderProps"
        @change-check="onSelectChange"
      />
      <van-empty v-if="dataList.length <= 0" description="暂无数据" />
    </CustomPopup>
  </div>
</template>

<style scoped>
.field-cascader {
  background: white;
}
</style>
