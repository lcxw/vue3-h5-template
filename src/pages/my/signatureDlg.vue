<script setup lang="ts">
// @ts-ignore - upng-js 没有类型声明
import UPNG from 'upng-js'
import { showFailToast } from 'vant'
import { computed, nextTick, ref, watch } from 'vue'
import { Handwriting } from '@/utils/signature'

/**
 * 组件属性定义
 */
interface Props {
  visible?: boolean
  modelValue?: string
  title?: string
  height?: string | number
  backgroundColor?: string
  penColor?: string
  autoTrim?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  title: '手写签名',
  height: '300rpx',
  penColor: '#000',
  autoTrim: false,
})

/**
 * 组件事件定义
 */
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'update:modelValue', value: string): void
  (e: 'close'): void
  (e: 'change', value: string): void
}>()

/**
 * Canvas 引用
 */
const canvasRef = ref<HTMLCanvasElement>()

/**
 * Canvas ID
 */
const canvasId = '__signature__canvas'

/**
 * 签名数据
 */
const signature = ref<any>(null)

/**
 * 手写签名实例
 */
let handwriting: Handwriting | null = null

/**
 * 计算样式
 */
const getStyle = computed(() => {
  return `width: 100%; height: ${props.height};`
})

/**
 * 显示状态（双向绑定）
 */
const show = computed({
  get: () => props.visible,
  set: (val: boolean) => {
    emit('update:visible', val)
    if (!val) {
      emit('close')
    }
  },
})

/**
 * 初始化 Canvas
 */
function initCanvas(): void {
  if (!canvasRef.value)
    return

  const ctx = canvasRef.value.getContext('2d')
  if (!ctx)
    return

  // 设置 Canvas 尺寸
  const rect = canvasRef.value.getBoundingClientRect()
  const devicePixelRatio = window.devicePixelRatio || 1
  canvasRef.value.width = rect.width * devicePixelRatio
  canvasRef.value.height = rect.height * devicePixelRatio
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)

  if (!handwriting) {
    handwriting = new Handwriting({
      penColor: props.penColor,
      slideValue: 50,
      canvasName: canvasId,
      ctx,
    })
  }

  handwriting.setSize(rect)

  // 绘制背景
  const bgColor = props.backgroundColor || 'rgba(248, 248, 248, 0.5)'
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, rect.width, rect.height)

  // 加载已有签名
  if (signature.value) {
    setTimeout(() => {
      const bound = signature.value.bound || {
        left: 0,
        right: rect.width,
        top: 0,
        bottom: rect.height,
      }
      handwriting?.fromDataURL(signature.value.data || signature.value.imgUrl, {
        xOffset: bound.left,
        yOffset: bound.top,
        width: bound.right - bound.left - 4.5,
        height: bound.bottom - bound.top - 4,
      })
    }, 100)
  }
}

/**
 * 开始签名
 */
function sign(): void {
  if (!props.visible)
    return
  setTimeout(() => {
    nextTick(() => {
      initCanvas()
    })
  }, 300)
}

/**
 * 触摸开始事件
 * @param event 触摸事件
 */
function uploadScaleStart(event: TouchEvent): void {
  handwriting?.uploadScaleStart(event)
}

/**
 * 触摸移动事件
 * @param event 触摸事件
 */
function uploadScaleMove(event: TouchEvent): void {
  handwriting?.uploadScaleMove(event)
}

/**
 * 触摸结束事件
 * @param event 触摸事件
 */
function uploadScaleEnd(event: TouchEvent): void {
  handwriting?.uploadScaleEnd(event)
}

/**
 * 重签（清空签名）
 */
function rewrite(): void {
  handwriting?.clear()
}

/**
 * 提交签名
 */
function onSubmit(): void {
  if (!handwriting || handwriting.isEmpty()) {
    showFailToast('请在框内签字')
    return
  }
  convertToBase64()
}

/**
 * 将签名转换为 Base64
 */
function convertToBase64(): void {
  if (!handwriting || !canvasRef.value)
    return

  const left = 0
  const top = 0
  const right = handwriting.canvasWidth
  const bottom = handwriting.canvasHeight

  const ctx = canvasRef.value.getContext('2d')
  if (!ctx)
    return

  // 获取 Canvas 图片数据
  const imageData = ctx.getImageData(left, top, right - left, bottom - top)

  // 使用 UPNG.js 编码为 PNG
  const pngBuffer = UPNG.encode([imageData.data.buffer], imageData.width, imageData.height, 0)
  // 将 ArrayBuffer 转为 Base64（使用兼容方式）
  const uint8Array = new Uint8Array(pngBuffer)
  let binary = ''
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i])
  }
  const base64 = window.btoa(binary)
  const dataURL = `data:image/png;base64,${base64}`

  const result = {
    data: dataURL,
    bound: {
      left,
      top,
      right,
      bottom,
    },
  }

  emit('update:modelValue', JSON.stringify(result))
  emit('change', JSON.stringify(result))
}

/**
 * 监听 visible 属性变化
 */
watch(
  () => props.visible,
  (val) => {
    if (val) {
      // 解析签名数据
      if (typeof props.modelValue === 'object' && props.modelValue) {
        signature.value = JSON.parse(JSON.stringify(props.modelValue))
      }
      else if (typeof props.modelValue === 'string' && props.modelValue) {
        signature.value = props.modelValue.startsWith('data:image')
          || props.modelValue.startsWith('http')
          ? { bound: null, data: props.modelValue }
          : JSON.parse(props.modelValue)
      }
      else {
        signature.value = null
      }
      sign()
    }
  },
)

/**
 * 监听 modelValue 属性变化
 */
watch(
  () => props.modelValue,
  (newVal) => {
    if (typeof props.modelValue === 'object' && props.modelValue) {
      signature.value = JSON.parse(JSON.stringify(props.modelValue))
    }
    else if (typeof newVal === 'string' && newVal) {
      signature.value = newVal.startsWith('data:image') || newVal.startsWith('http')
        ? { bound: null, data: newVal }
        : JSON.parse(newVal)
    }
    else {
      signature.value = null
    }
    if (props.visible) {
      sign()
    }
  },
)
</script>

<template>
  <van-popup
    v-model:show="show"
    position="bottom"
    round
    closeable
    safe-area-inset-bottom
  >
    <div class="container">
      <div class="title">
        {{ title }}
      </div>
      <div :style="getStyle" class="handCenter">
        <canvas
          ref="canvasRef"
          class="hand-writing"
          style="width: 100%; height: 100%"
          @touchend="uploadScaleEnd"
          @touchmove="uploadScaleMove"
          @touchstart="uploadScaleStart"
        />
      </div>
      <div class="buttons">
        <van-button type="default" @click="rewrite">
          重签
        </van-button>
        <van-button type="primary" @click="onSubmit">
          提交
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<style scoped>
.container {
  width: 100%;
  position: relative;
  background-color: #fff;
  padding-bottom: 40rpx;
}

.title {
  width: 100%;
  display: flex;
  justify-content: center;
  color: #3e3e3e;
  font-size: 38rpx;
  font-weight: bold;
  margin-top: 35rpx;
}

.handCenter {
  width: 90% !important;
  height: 300rpx !important;
  margin: 35rpx auto 0;
  border: 1px dashed #979797;
  box-sizing: border-box;
  position: relative;
  background-color: #f8f8f8;
}

.hand-writing {
  width: 100% !important;
  height: 100% !important;
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 5;
}

.buttons {
  width: 570rpx;
  margin: 40rpx auto;
  display: flex;
  justify-content: space-between;
}

.buttons .van-button {
  flex: 1;
  margin: 0 20rpx;
}
</style>
