<script setup lang="ts">
import JsBarcode from 'jsbarcode'
import { onMounted, ref, watch } from 'vue'

/**
 * FieldBarCode 条形码字段组件
 * 提供条形码生成和展示功能
 */

interface Props {
  /** 标签 */
  label?: string
  /** 条形码值 */
  value?: string
  /** 条形码文本 */
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '条形码',
  value: '',
  text: '',
})

const canvasRef = ref<HTMLCanvasElement | null>(null)

/**
 * 生成条形码
 */
function generateBarcode() {
  if (!canvasRef.value || !props.value)
    return

  try {
    JsBarcode(canvasRef.value, props.value, {
      text: props.text || props.value,
      width: 2,
      height: 50,
      displayValue: true,
      fontSize: 12,
      margin: 10,
    })
  }
  catch (error) {
    console.error('条形码生成失败:', error)
  }
}

// 监听值变化
watch(
  () => props.value,
  () => {
    generateBarcode()
  },
)

// 组件挂载后生成条形码
onMounted(() => {
  generateBarcode()
})
</script>

<template>
  <div class="field-barcode field-form-item">
    <van-field :label="label">
      <template #input>
        <canvas ref="canvasRef" class="barcode-canvas" />
      </template>
    </van-field>
  </div>
</template>

<style scoped>
.field-barcode {
  background: white;
}

.barcode-canvas {
  width: 100%;
  max-width: 400px;
}
</style>
