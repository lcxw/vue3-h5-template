<script setup lang="ts">
/**
 * OnlineCustomChart 在线自定义图表组件
 * 根据图表类型分发到不同的图表渲染器
 * TODO: 后续完善各图表类型的渲染逻辑
 */
import { ref, watch, onMounted } from 'vue'
import { inject } from 'vue'

interface Props {
  /** 组件配置 */
  widget: any
  /** 绑定值 */
  value?: any
}

const props = defineProps<Props>()

/** 注入表单上下文 */
const formInject = inject<() => any>('form')

/**
 * 安全获取表单上下文
 */
function form(): any {
  if (formInject == null) return {}
  return formInject() || {}
}

/** 图表数据 */
const chartData = ref<any[]>([])

/**
 * 刷新图表数据
 */
function refresh(): void {
  // TODO: 后续实现图表数据加载逻辑
  chartData.value = []
}

/** 监听 widget.props 变化，刷新图表 */
watch(
  () => props.widget?.props,
  () => {
    refresh()
  },
  { deep: true, immediate: true },
)

onMounted(() => {
  if (props.widget) {
    props.widget.widgetImpl = { refresh }
  }
})
</script>

<template>
  <div
    class="custom-chart"
    :style="{
      padding: '15px',
      height: widget.props?.basicInfo?.height || '300px',
      marginBottom: (widget.props?.basicInfo?.paddingBottom || 0) + 'px',
    }"
  >
    <!-- TODO: 后续根据 widget.widgetType 分发到具体的图表渲染组件 -->
    <div class="chart-placeholder">
      <p>{{ widget.showName || '图表组件' }}</p>
      <p class="chart-type">类型: {{ widget.widgetType }}</p>
    </div>
  </div>
</template>

<style scoped>
.custom-chart {
  background: white;
  position: relative;
  width: 100%;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
}

.chart-type {
  font-size: 12px;
  color: #ccc;
  margin-top: 8px;
}
</style>
