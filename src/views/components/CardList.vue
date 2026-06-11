<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import CustomList from './CustomList.vue'

/**
 * CardList 卡片列表组件
 * 提供卡片展示功能
 */

interface Props {
  /** 数据列表 */
  value?: unknown[]
}

const props = withDefaults(defineProps<Props>(), {
  value: () => [],
})

const cardListRef = ref<InstanceType<typeof CustomList> | null>(null)

/**
 * 重置列表
 */
function reset() {
  nextTick(() => {
    if (cardListRef.value) {
      cardListRef.value.reset()
    }
  })
}

// 暴露方法供父组件调用
defineExpose({
  reset,
})

// 监听数据变化
watch(
  () => props.value,
  (val) => {
    if (val && val.length > 0) {
      reset()
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="card-list">
    <slot name="addBtn" />
    <CustomList
      ref="cardListRef"
      class="list-box"
      :support-pull-refresh="false"
      :data-list="value"
      :finished="true"
    >
      <slot :data="value" />
    </CustomList>
  </div>
</template>

<style scoped>
.card-list {
  background: #F6F7F9;
}

.card-item {
  background: #F6F7F9;
  border-radius: 8px;
  margin-bottom: 15px;
}
</style>
