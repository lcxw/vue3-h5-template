<template>
  <div :style="{ height: height || '100%' }">
    <van-pull-refresh
      v-model="innerLoading"
      :disabled="!supportPullRefresh"
      @refresh="onRefresh"
    >
      <van-list
        v-model:loading="innerLoading"
        :finished="finished"
        @load="loadMore"
      >
        <slot />
        <div v-if="dataList.length === 0 && !innerLoading" class="empty-box">
          <van-empty description="暂无数据" />
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

/**
 * CustomList 自定义列表组件
 * 支持下拉刷新和上拉加载更多
 */

interface Props {
  /** 是否正在加载 */
  isLoading?: boolean
  /** 是否加载完成 */
  finished?: boolean
  /** 数据列表 */
  dataList?: unknown[]
  /** 行键名 */
  rowKey?: string
  /** 是否支持选择 */
  supportSelect?: boolean
  /** 是否支持下拉刷新 */
  supportPullRefresh?: boolean
  /** 列表高度 */
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  finished: false,
  dataList: () => [],
  rowKey: undefined,
  supportSelect: false,
  supportPullRefresh: true,
  height: undefined
})

const emit = defineEmits<{
  (e: 'load', pageNum: number): void
}>()

/** 内部加载状态（避免直接修改 prop） */
const innerLoading = ref(props.isLoading)
const pageNum = ref(1)

// 同步外部 isLoading 到内部
watch(() => props.isLoading, (val) => {
  innerLoading.value = val
})

/**
 * 下拉刷新
 */
function onRefresh() {
  pageNum.value = 1
  emit('load', pageNum.value++)
}

/**
 * 加载更多
 */
function loadMore() {
  if (innerLoading.value || props.finished) return
  emit('load', pageNum.value++)
}

/**
 * 重置列表
 */
function reset() {
  pageNum.value = 1
  onRefresh()
}

// 暴露方法供父组件调用
defineExpose({
  reset
})
</script>

<style scoped>
.empty-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
</style>