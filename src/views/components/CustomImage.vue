<template>
  <div class="custom-image" :style="{ justifyContent: align }">
    <img :src="src" :style="imageStyle" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * CustomImage 自定义图片组件
 * 支持多种图片显示样式和对齐方式
 */

interface Props {
  /** 图片地址 */
  src?: string
  /** 图片填充方式 */
  fit?: string
  /** 对齐方式 */
  align?: string
  /** 图片宽度 */
  width?: string
  /** 图片高度 */
  height?: string
  /** 圆角 */
  radius?: string | number
  /** 是否圆形 */
  round?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  src: undefined,
  fit: undefined,
  align: 'left',
  width: undefined,
  height: undefined,
  radius: 3,
  round: false
})

/**
 * 计算图片样式
 */
const imageStyle = computed(() => {
  const borderRadius = props.round
    ? '50%'
    : typeof props.radius === 'number'
      ? `${props.radius}px`
      : props.radius

  return {
    width: props.width || '200px',
    height: props.height || '200px',
    objectFit: props.fit as 'contain' | 'cover' | 'fill' | 'none' | 'scale-down' | undefined,
    borderRadius
  }
})
</script>

<style scoped>
.custom-image {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>