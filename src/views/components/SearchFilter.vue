<script setup lang="ts">
import BaseFilter from './BaseFilter.vue'

/**
 * SearchFilter 搜索筛选组件
 * 提供搜索输入功能
 */

interface Props {
  /** 标签 */
  label?: string
  /** 搜索值 */
  value?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  value: undefined,
})

const emit = defineEmits<{
  (e: 'update:value', value: string): void
  (e: 'change', value: string): void
}>()

/**
 * 输入变化处理
 * @param value 输入值
 */
function onChange(value: string) {
  emit('update:value', value)
  emit('change', value)
}
</script>

<template>
  <BaseFilter class="search-filter" :label="label">
    <van-search
      :model-value="value"
      shape="square"
      placeholder="请输入关键词"
      @update:model-value="onChange"
      @clear="onChange('')"
    />
  </BaseFilter>
</template>

<style scoped>
.search-filter {
  background: white;
}
</style>
