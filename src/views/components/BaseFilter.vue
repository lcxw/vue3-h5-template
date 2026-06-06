<template>
  <div class="base-filter">
    <div class="flex-row-between">
      <div class="label">{{ label }}</div>
      <slot name="right" />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * BaseFilter 基础筛选组件
 * 提供统一的筛选布局
 */

interface Props {
  /** 筛选标签 */
  label?: string
}

withDefaults(defineProps<Props>(), {
  label: undefined
})
</script>

<style scoped>
.base-filter .label {
  font-size: 14px;
  color: #333333;
  height: 20px;
  line-height: 20px;
}

.base-filter {
  margin-top: 10px;
}

.flex-row-between {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>