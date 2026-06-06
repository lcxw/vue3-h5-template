<script setup lang="ts">
import BaseFilter from './BaseFilter.vue'

/**
 * SwitchFilter 开关筛选组件
 * 提供开关筛选功能
 */

interface Props {
  /** 标签 */
  label?: string
  /** 开关值 */
  value?: boolean
  /** 选中颜色 */
  activeColor?: string
  /** 未选中颜色 */
  inactiveColor?: string
  /** 开关大小 */
  size?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  value: false,
  activeColor: 'var(--van-primary-color)',
  inactiveColor: '#E8E8E8',
  size: '20px',
})

const emit = defineEmits<{
  (e: 'update:value', value: boolean): void
  (e: 'change', value: boolean): void
}>()

/**
 * 开关变化处理
 * @param value 开关值
 */
function onChange(value: boolean) {
  emit('update:value', value)
  emit('change', value)
}
</script>

<template>
  <BaseFilter class="switch-filter" :label="label">
    <template #right>
      <van-switch
        :model-value="value"
        :size="size"
        :active-color="activeColor"
        :inactive-color="inactiveColor"
        @update:model-value="onChange"
      />
    </template>
  </BaseFilter>
</template>

<style scoped>
.switch-filter {
  background: white;
}
</style>
