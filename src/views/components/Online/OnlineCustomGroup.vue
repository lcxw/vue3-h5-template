<script setup lang="ts">
/**
 * OnlineCustomGroup 在线自定义分组容器组件
 * 渲染分组容器，递归调用 OnlineCustomBlock 渲染子组件
 */
import OnlineCustomBlock from './OnlineCustomBlock.vue'

interface Props {
  /** 组件配置 */
  widget: any
}

const props = defineProps<Props>()
</script>

<template>
  <div
    class="online-custom-group"
    :style="{
      marginTop: (widget.props?.paddingTop ? widget.props.paddingTop : 0) + 'px',
      padding: (widget.props?.padding ? widget.props.padding : 0) + 'px',
    }"
  >
    <van-cell-group :title="widget.showName" inset>
      <OnlineCustomBlock :widget-list="widget.childWidgetList" />
    </van-cell-group>
  </div>
</template>

<style scoped>
.online-custom-group {
  margin-bottom: 8px;
}
</style>
