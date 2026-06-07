<script setup lang="ts">
/**
 * OnlineCustomTabs 标签页组件
 * 根据 widget.childWidgetList 渲染 van-tabs，每个 tab 对应一个子组件块
 */
import { ref, watch } from 'vue'
import OnlineCustomBlock from './OnlineCustomBlock.vue'

interface Props {
  /** 组件配置 */
  widget: any
}

const props = defineProps<Props>()

/** 当前激活的 tab 索引 */
const active = ref(0)

/**
 * 切换标签页
 * @param index - 目标索引
 */
function changeTab(index: number): void {
  active.value = index
}

/** 监听子组件列表变化，重置激活索引 */
watch(
  () => props.widget.childWidgetList,
  () => {
    active.value = 0
  },
  { immediate: true },
)
</script>

<template>
  <div
    class="online-custom-tabs"
    :style="{ marginBottom: (widget.props.paddingBottom ? widget.props.paddingBottom : 0) + 'px' }"
  >
    <!-- TODO: 后续完善 van-tabs 的样式和配置项 -->
    <van-tabs v-model:active="active" @change="changeTab">
      <van-tab
        v-for="subWidget in widget.childWidgetList"
        :key="subWidget.variableName"
        :title="subWidget.showName"
      />
    </van-tabs>
    <div
      v-for="(subWidget, index) in widget.childWidgetList"
      :key="subWidget.variableName"
    >
      <OnlineCustomBlock v-if="active === index" :widget-list="subWidget.childWidgetList" />
    </div>
  </div>
</template>

<style scoped>
.online-custom-tabs {
  width: 100%;
}
</style>
