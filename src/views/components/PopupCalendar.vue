<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, ref, watch } from 'vue'

/**
 * PopupCalendar 弹出日历组件
 * 提供日期选择弹出面板功能
 */

interface Props {
  /** 是否显示 */
  show?: boolean
  /** 日期值 */
  value?: string | number | Date | string[]
  /** 标签 */
  label?: string
  /** 日历类型 */
  type?: string
  /** 选中颜色 */
  color?: string
  /** 确认按钮文本 */
  confirmText?: string
  /** 值格式 */
  valueFormat?: string
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  value: undefined,
  label: undefined,
  type: 'single',
  color: 'var(--van-primary-color)',
  confirmText: '确定',
  valueFormat: 'YYYY-MM-DD',
})

const emit = defineEmits<{
  (e: 'update:value', value: string[]): void
  (e: 'update:show', value: boolean): void
  (e: 'close'): void
}>()

const maxDate = new Date(2050, 0, 1)
const currentDate = ref<Date | [Date, Date] | undefined>(undefined)

/**
 * 计算日期对象
 */
const day = computed(() => {
  function formatDateValue(value: string | number | Date, valueFormat: string): dayjs.Dayjs {
    if (valueFormat === 'timestamp') {
      return dayjs(value)
    }
    else if (typeof value === 'string') {
      return dayjs(value, valueFormat)
    }
    else {
      return dayjs(value)
    }
  }

  if (props.value == null)
    return null
  if (Array.isArray(props.value)) {
    return props.value.map(item => formatDateValue(item, props.valueFormat))
  }
  else {
    return formatDateValue(props.value, props.valueFormat)
  }
})

/**
 * 计算日历类型
 */
const calendarType = computed(() => {
  if (props.type === 'range')
    return 'range'
  if (props.type === 'multiple')
    return 'multiple'
  return 'single'
})

/**
 * 关闭日历
 */
function onClose() {
  emit('close')
}

/**
 * 选择日期处理
 * @param date 选择的日期
 */
function onSelectDate(date: Date | [Date, Date]) {
  if (Array.isArray(date)) {
    emit('update:value', [
      dayjs(date[0]).format(props.valueFormat),
      dayjs(date[1]).format(props.valueFormat),
    ])
  }
  else {
    emit('update:value', [dayjs(date).format(props.valueFormat)])
  }
  emit('close')
}

// 监听日期变化
watch(
  () => day.value,
  (val) => {
    if (Array.isArray(val)) {
      currentDate.value = [val[0].toDate(), val[1].toDate()]
    }
    else if (val) {
      currentDate.value = val.toDate()
    }
    else {
      currentDate.value = undefined
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="popup-calendar">
    <van-calendar
      :show="show"
      :title="label"
      :type="calendarType"
      :color="color"
      :max-date="maxDate"
      @update:show="(val: boolean) => emit('update:show', val)"
      @confirm="onSelectDate"
      @close="onClose"
    />
  </div>
</template>

<style scoped>
</style>
