<script setup lang="ts">
/**
 * CustomCascaderPanelPopup 级联面板弹窗组件
 * 提供级联选择弹窗功能，基于 CustomCascaderPanel + CustomPopup
 */
import { computed, ref, toRefs } from 'vue'
import CustomPopup from '../CustomPopup/index.vue'
import CustomCascaderPanel from '../CustomCascaderPanel/index.vue'

interface Props {
  /** 弹窗标题 */
  title?: string
  /** 是否显示弹窗 */
  showPicker?: boolean
  /** 是否多选 */
  multiple?: boolean
  /** 选中值 */
  value?: unknown[] | string | number
  /** 数据列表 */
  dataList?: Record<string, unknown>[]
  /** 属性映射 */
  cascaderProps?: {
    text?: string
    value?: string
    children?: string
    disabled?: string
    leaf?: string
    showCheckbox?: string
    data?: unknown
  }
  /** 选中颜色 */
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '请选择',
  showPicker: false,
  multiple: false,
  value: undefined,
  dataList: () => [],
  cascaderProps: () => ({
    text: 'name',
    value: 'id',
    children: 'children',
  }),
  color: undefined,
})

const emit = defineEmits<{
  (e: 'input', value: unknown): void
  (e: 'close'): void
}>()

/** 选中的值 */
const selectValue = ref<unknown>(undefined)
/** 级联面板引用 */
const cascaderPanelRef = ref<InstanceType<typeof CustomCascaderPanel> | null>(null)

/**
 * 计算最终的属性映射（确保必填字段存在）
 */
const finalCascaderProps = computed(() => {
  return {
    text: cascaderProps.value?.text || 'name',
    value: cascaderProps.value?.value || 'id',
    children: cascaderProps.value?.children || 'children',
    disabled: cascaderProps.value?.disabled,
    leaf: cascaderProps.value?.leaf,
    showCheckbox: cascaderProps.value?.showCheckbox,
    data: cascaderProps.value?.data,
  }
})

const { cascaderProps } = toRefs(props)

/**
 * 选择变化回调
 * @param val 选中的值
 */
function changeSelect(val: unknown) {
  selectValue.value = val
}

/**
 * 取消选择，关闭弹窗
 */
function onCancel() {
  emit('close')
}

/**
 * 确认选择，发送选中值并关闭弹窗
 */
function onConfirm() {
  emit('input', selectValue.value)
  emit('close')
}

/**
 * 重置选择状态
 */
function onReset() {
  selectValue.value = undefined
  cascaderPanelRef.value?.reset()
}
</script>

<template>
  <CustomPopup
    class="cascader-select-popup"
    :title="title"
    :show-picker-dlg="showPicker"
    @close="onCancel"
    @confirm="onConfirm"
    @reset="onReset"
  >
    <CustomCascaderPanel
      ref="cascaderPanelRef"
      :value="value"
      height="100%"
      :options="dataList"
      :props="finalCascaderProps"
      @change-check="changeSelect"
    />
    <van-empty v-if="dataList.length <= 0" description="暂无数据" />
  </CustomPopup>
</template>

<style scoped>
</style>
