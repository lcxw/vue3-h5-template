<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseFilter from './BaseFilter.vue'
import { findItemFromList } from './utils'

/**
 * SelectFilter 选择筛选组件
 * 提供选择筛选功能
 */

interface Props {
  /** 选择值 */
  value?: unknown[] | string | number | boolean
  /** 标签 */
  label?: string
  /** 组件配置 */
  widget?: Record<string, unknown>
  /** 数据列表 */
  dataList?: Record<string, unknown>[]
  /** 是否多选 */
  multiple?: boolean
  /** 属性映射 */
  prop?: {
    value: string
    label: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  value: undefined,
  label: undefined,
  widget: undefined,
  dataList: () => [],
  multiple: false,
  prop: () => ({
    value: 'id',
    label: 'name',
  }),
})

const emit = defineEmits<{
  (e: 'update:value', value: unknown): void
  (e: 'change', value: unknown): void
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
 * 计算选中值
 */
const selectValue = computed(() => {
  if (props.multiple) {
    if (Array.isArray(props.dataList) && Array.isArray(props.value)) {
      return props.dataList.filter((data) => {
        return (props.value as any).includes(data[props.prop.value])
      })
    }
    else {
      return []
    }
  }
  else {
    return findItemFromList(props.dataList, props.value, props.prop.value)
  }
})

/**
 * 计算选中字符串
 */
const selectString = computed(() => {
  if (props.multiple) {
    return (selectValue.value as Record<string, unknown>[]).map(item => item[props.prop.label]).join(',')
  }
  else {
    return selectValue.value ? String((selectValue.value as Record<string, unknown>)[props.prop.label]) : ''
  }
})

/**
 * 检查是否选中
 * @param data 数据项
 */
function isActive(data: Record<string, unknown>): boolean {
  if (props.multiple) {
    return (props.value as unknown[] || []).includes(data[props.prop.value])
  }
  else {
    return props.value === data[props.prop.value]
  }
}

/**
 * 选择变化处理
 * @param data 数据项
 */
function onChange(data: Record<string, unknown>) {
  let tempData: unknown
  if (props.multiple) {
    const tempArr = (selectValue.value as Record<string, unknown>[]).map(item => item[props.prop.value])
    const pos = tempArr.indexOf(data[props.prop.value])
    if (pos === -1) {
      tempArr.push(data[props.prop.value])
    }
    else {
      tempArr.splice(pos, 1)
    }
    tempData = tempArr
  }
  else {
    if (props.value !== data[props.prop.value]) {
      tempData = data[props.prop.value]
    }
  }
  emit('update:value', tempData)
  emit('change', tempData)
}
</script>

<template>
  <BaseFilter class="select-filter" :label="label">
    <template #right>
      <div class="flex-row-center">
        <span class="select">{{ selectString }}</span>
        <van-icon
          v-if="dataList.length > 6"
          :name="isExpand ? 'arrow-up' : 'arrow-down'"
          color="#999999"
          size="12px"
          @click="isExpand = !isExpand"
        >
          <span style="margin-right: 5px">{{ isExpand ? '收起' : '展开' }}</span>
        </van-icon>
      </div>
    </template>
    <div class="select-list">
      <div
        v-for="data in validDataList"
        :key="String(data[prop.value])"
        class="select-item"
        :class="{ active: isActive(data) }"
        @click="onChange(data)"
      >
        {{ data[prop.label] }}
      </div>
    </div>
  </BaseFilter>
</template>

<style scoped lang="scss">
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
  font-size: 15px;
  cursor: pointer;
  box-sizing: border-box;
  padding: 0 12px;
  min-width: 60px;
}

.select-item.active {
  background: rgba(25, 137, 250, 0.1);
  color: var(--van-primary-color);
  border: 1px solid var(--van-primary-color);
}

.select {
  color: var(--van-primary-color);
  font-size: 12px;
  margin-right: 5px;
  height: 17px;
  line-height: 17px;
}

.flex-row-center {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
