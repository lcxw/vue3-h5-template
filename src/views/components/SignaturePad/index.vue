<template>
  <div class="field-signature field-form-item">
    <van-field :label="label" :required="required" :name="prop">
      <template #input>
        <div class="hand-sign-box" style="width: 100%">
          <div
            v-if="!imageValue"
            class="hand-sign"
            @click="openSignature"
          >
            <van-icon name="edit" color="#5b5b5b" size="24" class="icon" />
            <span style="line-height: 16px">添加签名</span>
          </div>
          <div v-else class="sign-preview" @click="openSignature" @contextmenu.prevent="handleLongPress">
            <div v-if="deleteable" class="preview-delete-icon" @click.stop="deleteSignature">
              <van-icon name="delete-o" color="#5b5b5b" size="16" />
            </div>
            <img :src="imageValue" :style="{ height: height, width: '100%' }" />
          </div>
        </div>
      </template>
    </van-field>
    
    <!-- 签名弹窗 -->
    <van-popup v-model:show="showSignaturePad" position="bottom" :style="{ height: '50%' }">
      <div class="signature-popup">
        <div class="signature-header">
          <span>签名</span>
          <van-icon name="cross" @click="close" />
        </div>
        <div class="signature-canvas-wrap">
          <canvas ref="canvasRef" class="signature-canvas" />
        </div>
        <div class="signature-footer">
          <van-button block @click="clearCanvas">清除</van-button>
          <van-button block type="primary" @click="saveSignature">保存</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import SignaturePad from 'signature_pad'

/**
 * SignaturePad 签名组件
 * 提供手写签名功能
 */

interface Props {
  /** 签名值 */
  value?: string
  /** 标签 */
  label?: string
  /** 是否必填 */
  required?: boolean
  /** 字段属性名 */
  prop?: string
  /** 验证规则 */
  rules?: unknown[]
  /** 是否禁用 */
  disabled?: boolean
  /** 签名区域宽度 */
  width?: string | number
  /** 签名区域高度 */
  height?: string | number
  /** 背景颜色 */
  backgroundColor?: string
  /** 笔颜色 */
  penColor?: string
  /** 是否自动裁剪 */
  autoTrim?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  value: undefined,
  label: undefined,
  required: false,
  prop: undefined,
  rules: undefined,
  disabled: false,
  width: '100%',
  height: '100px',
  backgroundColor: undefined,
  penColor: '#000000',
  autoTrim: true
})

const emit = defineEmits<{
  (e: 'update:value', value: string): void
  (e: 'change', value: string): void
}>()

const showSignaturePad = ref(false)
const signature = ref<string | undefined>(props.value)
const deleteable = ref(false)
const imageValue = ref<string>(props.value || '')
const canvasRef = ref<HTMLCanvasElement | null>(null)
let signaturePadInstance: SignaturePad | null = null

/**
 * 解析签名图片值
 * @param v 签名值
 */
function parseImageValue(v: string | undefined) {
  if (!v) {
    imageValue.value = ''
    return
  }
  try {
    if (v.startsWith('data:image')) {
      imageValue.value = v
    } else {
      const parsed = JSON.parse(v)
      if (parsed && parsed.data) {
        imageValue.value = parsed.data
      }
    }
  } catch {
    imageValue.value = v
  }
}

/**
 * 打开签名面板
 */
function openSignature() {
  if (props.disabled) return
  showSignaturePad.value = true
  deleteable.value = false
  nextTick(() => {
    initCanvas()
  })
}

/**
 * 初始化画布
 */
function initCanvas() {
  if (!canvasRef.value) return
  
  const canvas = canvasRef.value
  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight
  
  signaturePadInstance = new SignaturePad(canvas, {
    backgroundColor: props.backgroundColor || 'rgb(255, 255, 255)',
    penColor: props.penColor
  })
  
  // 如果有已有签名，加载到画布
  if (imageValue.value) {
    signaturePadInstance.fromDataURL(imageValue.value)
  }
}

/**
 * 清除画布
 */
function clearCanvas() {
  if (signaturePadInstance) {
    signaturePadInstance.clear()
  }
}

/**
 * 保存签名
 */
function saveSignature() {
  if (!signaturePadInstance) return
  
  const dataURL = signaturePadInstance.toDataURL()
  const result = JSON.stringify({
    data: dataURL,
    bound: signaturePadInstance.toData()
  })
  
  emit('update:value', result)
  emit('change', result)
  imageValue.value = dataURL
  showSignaturePad.value = false
}

/**
 * 关闭签名面板
 */
function close() {
  showSignaturePad.value = false
}

/**
 * 删除签名
 */
function deleteSignature() {
  deleteable.value = false
  emit('update:value', '')
  emit('change', '')
  imageValue.value = ''
}

/**
 * 长按处理
 */
function handleLongPress() {
  deleteable.value = true
}

// 监听值变化
watch(
  () => props.value,
  (v) => {
    if (v) {
      signature.value = v
      parseImageValue(v)
    } else {
      signature.value = undefined
      parseImageValue(undefined)
    }
  },
  { immediate: true }
)

// 组件挂载后初始化
onMounted(() => {
  parseImageValue(props.value)
})
</script>

<style scoped>
.field-signature {
  background: white;
}

.hand-sign-box .hand-sign {
  width: 100%;
  background-color: #f7f7f7;
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  padding: 5px 10px;
}

.hand-sign-box .hand-sign .icon {
  margin-right: 2px;
  position: relative;
  top: 1px;
  width: 16px;
  height: 16px;
}

.hand-sign-box .sign-preview {
  position: relative;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dcdfe6;
  padding: 8px 0;
  user-select: none;
}

.hand-sign-box .sign-preview img {
  max-width: 100%;
  cursor: pointer;
}

.hand-sign-box .sign-preview .preview-delete-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  background-color: #ffffff;
  cursor: pointer;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
}

.signature-popup {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
}

.signature-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}

.signature-canvas-wrap {
  flex: 1;
  padding: 16px;
}

.signature-canvas {
  width: 100%;
  height: 100%;
  border: 1px solid #ebedf0;
  border-radius: 8px;
}

.signature-footer {
  display: flex;
  gap: 8px;
  padding: 16px;
}
</style>