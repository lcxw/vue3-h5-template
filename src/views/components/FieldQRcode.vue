<script setup lang="ts">
import QRCode from 'qrcode'
import { onMounted, ref, watch } from 'vue'

/**
 * FieldQRcode 二维码字段组件
 * 提供二维码生成和展示功能
 */

interface Props {
  /** 标签 */
  label?: string
  /** 二维码值 */
  value?: string
  /** 是否禁用 */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '二维码',
  value: '',
  disabled: true,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)

/**
 * 生成二维码
 */
async function generateQRCode() {
  if (!canvasRef.value || !props.value)
    return

  try {
    await QRCode.toCanvas(canvasRef.value, props.value, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
  }
  catch (error) {
    console.error('二维码生成失败:', error)
  }
}

// 监听值变化
watch(
  () => props.value,
  () => {
    generateQRCode()
  },
)

// 组件挂载后生成二维码
onMounted(() => {
  generateQRCode()
})
</script>

<template>
  <div class="field-qrcode field-form-item">
    <van-field :label="label">
      <template #input>
        <div class="qrcode-container">
          <canvas ref="canvasRef" class="qrcode-canvas" />
        </div>
      </template>
    </van-field>
  </div>
</template>

<style scoped>
.field-qrcode {
  background: white;
}

.qrcode-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.qrcode-canvas {
  max-width: 200px;
}
</style>
