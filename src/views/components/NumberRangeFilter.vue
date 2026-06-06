<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseFilter from './BaseFilter.vue'

/**
 * NumberRangeFilter 数字范围筛选组件
 * 提供数字范围选择功能
 */

interface DataItem {
  id: string | number
  name: string
  min?: number
  max?: number
}

interface Props {
  /** 标签 */
  label?: string
  /** 数值范围 */
  value?: number[]
  /** 数据列表 */
  dataList?: DataItem[]
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  value: undefined,
  dataList: () => [],
})

const emit = defineEmits<{
  (e: 'update:value', value: number[]): void
  (e: 'change', value: number[]): void
}>()

const isExpand = ref(false)

/**
 * 计算有效数据列表
 */
const validDataList = computed(() => {
  if (!Array.isArray(props.dataList))
    return []
  return isExpand.value ? props.dataList : props.dataList.slice(0, 6)
})

/**
 * 计算最小值
 */
const minValue = computed(() => Array.isArray(props.value) ? props.value[0] : undefined)

/**
 * 计算最大值
 */
const maxValue = computed(() => Array.isArray(props.value) ? props.value[1] : undefined)

/**
 * 值变化处理
 * @param min 最小值
 * @param max 最大值
 */
function onChange(min: string | number | undefined, max: string | number | undefined) {
  const minVal = min !== '' && min !== undefined ? Number(min) : undefined
  const maxVal = max !== '' && max !== undefined ? Number(max) : undefined
  emit('update:value', [minVal as number, maxVal as number])
  emit('change', [minVal as number, maxVal as number])
}

/**
 * 点击选项处理
 * @param data 数据项
 */
function onItemClick(data: DataItem) {
  onChange(data.min, data.max)
}
</script>

<template>
  <BaseFilter class="number-range-filter" :label="label">
    <template #right>
      <van-icon
        v-if="dataList.length > 6"
        :name="isExpand ? 'arrow-up' : 'arrow-down'"
        color="#999999"
        size="12px"
        @click="isExpand = !isExpand"
      >
        <span style="margin-right: 5px">{{ isExpand ? '收起' : '展开' }}</span>
      </van-icon>
    </template>
    <div class="number-input-wrap">
      <div class="wrap">
        <input
          class="number"
          :value="minValue"
          type="number"
          @input="(e) => onChange((e.target as HTMLInputElement).value, maxValue)"
        >
        <div class="gutter" />
        <input
          class="number"
          :value="maxValue"
          type="number"
          @input="(e) => onChange(minValue, (e.target as HTMLInputElement).value)"
        >
      </div>
    </div>
    <div class="select-list">
      <div
        v-for="data in validDataList"
        :key="data.id"
        class="select-item"
        @click="onItemClick(data)"
      >
        {{ data.name }}
      </div>
    </div>
  </BaseFilter>
</template>

<style scoped>
.number-input-wrap {
  margin-top: 8px;
}

.wrap {
  display: flex;
  align-items: center;
}

.gutter {
  height: 1px;
  width: 12px;
  background: #999999;
  flex-grow: 0;
  flex-shrink: 0;
  margin: 0px 6px;
}

.number {
  height: 36px;
  background: #F6F7F9;
  border-radius: 4px;
  flex-grow: 1;
  flex-shrink: 1;
  width: calc(50% - 15px);
  text-align: center;
  border: none;
  color: #999999;
  padding: 0 10px;
}

.select-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.select-item {
  height: 36px;
  line-height: 36px;
  background: #F6F7F9;
  border-radius: 4px;
  text-align: center;
  color: #333333;
  cursor: pointer;
  box-sizing: border-box;
  padding: 0 12px;
  min-width: 60px;
}
</style>
