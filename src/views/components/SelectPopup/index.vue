<template>
  <CustomPopup
    class="select-popup"
    :title="title"
    :show-picker-dlg="showPickerDlg"
    @close="onCancel"
    @reset="onReset"
    @confirm="onConfirm"
  >
    <CustomSelectPanel
      ref="selectPanelRef"
      :value="selectValue"
      height="100%"
      :multiple="multiple"
      :color="color"
      :data-list="dataList"
      :props="finalProps"
      @change-check="changeSelect"
    />
    <van-empty v-if="dataList.length <= 0" description="暂无数据" />
  </CustomPopup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import CustomPopup from '../CustomPopup/index.vue'
import CustomSelectPanel from '../CustomSelectPanel/index.vue'

/**
 * SelectPopup 选择弹出组件
 * 提供选择弹出面板功能
 */

interface Props {
  /** 标题 */
  title?: string
  /** 选择值 */
  value?: number | string | unknown[]
  /** 是否显示弹窗 */
  showPickerDlg?: boolean
  /** 是否多选 */
  multiple?: boolean
  /** 选中颜色 */
  color?: string
  /** 列表数据 */
  dataList?: Record<string, unknown>[] | ((pageNum: number) => Promise<{ dataList: unknown[]; totalCount: number }>)
  /** 属性映射 */
  props?: {
    text: string
    value: string
    disabled?: string | ((data: Record<string, unknown>) => boolean)
    pageSize?: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  title: '标题',
  value: undefined,
  showPickerDlg: false,
  multiple: false,
  color: undefined,
  dataList: () => [],
  props: () => ({
    text: 'name',
    value: 'id',
    disabled: undefined,
    pageSize: 20
  })
})

const emit = defineEmits<{
  (e: 'update:value', value: unknown): void
  (e: 'close'): void
}>()

const selectValue = ref<unknown>(undefined)
const selectPanelRef = ref<InstanceType<typeof CustomSelectPanel> | null>(null)

/**
 * 计算最终属性映射
 */
const finalProps = computed(() => ({
  text: props.props.text,
  value: props.props.value,
  disabled: props.props.disabled,
  pageSize: props.props.pageSize || 20
}))

/**
 * 选择变化处理
 * @param val 选择值
 */
function changeSelect(val: unknown) {
  selectValue.value = val
}

/**
 * 关闭弹窗
 */
function onCancel() {
  emit('close')
}

/**
 * 确认选择
 */
function onConfirm() {
  emit('update:value', selectValue.value)
  emit('close')
}

/**
 * 重置选择
 */
function onReset() {
  selectValue.value = props.multiple ? [] : undefined
}

// 监听值变化
watch(
  () => props.value,
  (val) => {
    selectValue.value = val
  },
  { immediate: true }
)
</script>

<style scoped>
.select-popup {
  background: white;
}
</style>