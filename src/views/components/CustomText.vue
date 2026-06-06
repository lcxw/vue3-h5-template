<template>
  <div
    class="custom-text"
    :style="{
      background: bgColor,
      height: height ? `${height}px` : undefined,
      justifyContent: valign,
      padding: `${padding}px`
    }"
  >
    <!-- HTML内容渲染 -->
    <div v-if="isHtml" class="html-content" v-html="String(value)" />
    <!-- 普通文本渲染 -->
    <div
      v-else
      :style="{
        width: '100%',
        textIndent: `${textIndent}em`,
        textAlign: align as 'left' | 'center' | 'right' | 'justify',
        maxHeight: height ? `${height}px` : undefined,
        lineHeight: 1.5,
        fontSize: `${fontSize}px`,
        color: fontColor,
        fontWeight: fontBold ? 600 : 400,
        fontStyle: fontItalic ? 'italic' : undefined,
        overflow: 'hidden',
        wordBreak: 'break-word'
      }"
    >
      {{ value }}
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * CustomText 自定义文本组件
 * 支持普通文本和HTML文本渲染
 */

interface Props {
  /** 文本值 */
  value?: string | number | Date
  /** 文本对齐方式 */
  align?: string
  /** 垂直对齐方式 */
  valign?: string
  /** 背景颜色 */
  bgColor?: string
  /** 高度 */
  height?: number
  /** 文本缩进 */
  textIndent?: number
  /** 字体大小 */
  fontSize?: number
  /** 内边距 */
  padding?: number
  /** 字体颜色 */
  fontColor?: string
  /** 是否加粗 */
  fontBold?: boolean
  /** 是否斜体 */
  fontItalic?: boolean
  /** 是否为HTML内容 */
  isHtml?: boolean
}

withDefaults(defineProps<Props>(), {
  value: '',
  align: 'left',
  valign: 'center',
  bgColor: undefined,
  height: 25,
  textIndent: 0,
  fontSize: 14,
  padding: 2,
  fontColor: '#383838',
  fontBold: false,
  fontItalic: false,
  isHtml: false
})
</script>

<style scoped>
.custom-text {
  display: flex;
  flex-direction: column;
  padding: 2px;
}

.html-content {
  width: 100%;
}
</style>