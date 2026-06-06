<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, ref } from 'vue'
import BaseFilter from './BaseFilter.vue'

/**
 * DateRangeFilter 日期范围筛选组件
 * 提供日期范围选择功能
 */

interface Props {
  /** 标签 */
  label?: string
  /** 日期值 */
  value?: string[]
  /** 选中颜色 */
  color?: string
  /** 确认按钮文本 */
  confirmText?: string
  /** 显示格式 */
  format?: string
  /** 值格式 */
  valueFormat?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  value: undefined,
  color: 'var(--van-primary-color)',
  confirmText: '确定',
  format: 'YYYY-MM-DD',
  valueFormat: 'YYYY-MM-DD',
})

const emit = defineEmits<{
  (e: 'update:value', value: string[]): void
  (e: 'change', value: string[]): void
}>()

const showCalendar = ref(false)
const maxDate = new Date(2050, 0, 1)

/**
 * 计算日期列表
 */
const dayList = computed(() => {
  return (props.value || []).map((item) => {
    if (props.valueFormat === 'timestamp') {
      return dayjs(Number(item))
    }
    else if (typeof item === 'string') {
      return dayjs(item, props.valueFormat)
    }
    else {
      return dayjs(item)
    }
  })
})

/**
 * 计算开始日期
 */
const startDate = computed(() => {
  const temp = dayList.value[0]
  return temp ? temp.format(props.format) : '开始日期'
})

/**
 * 计算结束日期
 */
const endDate = computed(() => {
  const temp = dayList.value[1]
  return temp ? temp.format(props.format) : '结束日期'
})

/**
 * 选择日期处理
 * @param dates 选择的日期范围
 */
function onSelectDate(dates: [Date, Date]) {
  const value = [
    dayjs(dates[0]).format(props.valueFormat),
    dayjs(dates[1]).format(props.valueFormat),
  ]
  emit('update:value', value)
  emit('change', value)
  showCalendar.value = false
}
</script>

<template>
  <BaseFilter class="date-range-filter" :label="label">
    <div class="date-input flex-align-center" @click="showCalendar = true">
      <span class="date">{{ startDate }}</span>
      <div class="gutter" />
      <span class="date">{{ endDate }}</span>
      <van-icon name="calendar-o" color="#999999" size="16" style="margin-right: 10px" />
    </div>
    <van-calendar
      v-model:show="showCalendar"
      :title="label"
      :color="color"
      type="range"
      :max-date="maxDate"
      @confirm="onSelectDate"
    />
  </BaseFilter>
</template>

<style scoped>
.date-input {
  height: 36px;
  background: #F6F7F9;
  margin-top: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.gutter {
  height: 1px;
  width: 12px;
  background: #999999;
  flex-grow: 0;
  flex-shrink: 0;
}

.date-input .date {
  width: 100px;
  flex-grow: 1;
  flex-shrink: 1;
  font-size: 14px;
  color: #999999;
  text-align: center;
  padding: 0px 10px;
}

.flex-align-center {
  display: flex;
  align-items: center;
}
</style>
