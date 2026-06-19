<template>
  <div ref="listContainerRef" class="custom-list-container" :style="{ height: height || '100%' }">
    <van-pull-refresh
      v-model="innerLoading"
      :disabled="!supportPullRefresh"
      @refresh="onRefresh"
    >
      <van-list
        v-model:loading="innerLoading"
        :finished="finished"
        :scroll-container="scrollContainer"
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
import { computed, ref, watch, onMounted } from 'vue'

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

/** 列表容器 ref，用于指定 van-list 的滚动容器 */
const listContainerRef = ref<HTMLElement | null>(null)
/** 滚动容器，默认为组件自身，确保 van-list 能正确检测滚动 */
const scrollContainer = computed(() => listContainerRef.value)

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
 * van-list 触发 load 事件时会自动将 loading 设为 true，
 * 因此只需检查 finished 状态，无需重复检查 loading
 */
function loadMore() {
  console.log(`[CustomList] loadMore触发, pageNum=${pageNum.value}, finished=${props.finished}, innerLoading=${innerLoading.value}`)
  if (props.finished) return
  emit('load', pageNum.value++)
}

/**
 * 重置列表（重置页码，不自动加载）
 */
function reset() {
  pageNum.value = 1
}

/**
 * 重置并刷新（重置页码后立即加载第一页）
 */
function refresh() {
  pageNum.value = 1
  onRefresh()
}

// 暴露方法供父组件调用
defineExpose({
  reset,
  refresh
})
</script>

<style scoped>
.custom-list-container {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.empty-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
</style>