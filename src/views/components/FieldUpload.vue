<script setup lang="ts">
import type { UploaderFileListItem } from 'vant'
import { onMounted, ref, watch } from 'vue'

/**
 * FieldUpload 上传字段组件
 * 提供文件上传功能
 */

interface UploadFile {
  url?: string
  name?: string
  filename?: string
  downloadUri?: string
  uploadPath?: string
  status?: string
  message?: string
}

interface Props {
  /** 标签 */
  label?: string
  /** 上传文件值 */
  value?: string
  /** 上传地址 */
  action?: string
  /** 上传字段名 */
  name?: string
  /** 上传附加数据 */
  formData?: Record<string, unknown>
  /** 上传请求头 */
  header?: Record<string, unknown>
  /** 最大上传数量 */
  maxCount?: number
  /** 字段属性名 */
  prop?: string
  /** 是否必填 */
  required?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
  /** 是否图片类型 */
  isImage?: boolean
  /** 下载参数 */
  downloadParams?: Record<string, unknown>
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  value: undefined,
  action: undefined,
  name: 'uploadFile',
  formData: undefined,
  header: undefined,
  maxCount: 1,
  prop: undefined,
  required: false,
  disabled: false,
  readOnly: false,
  isImage: true,
  downloadParams: undefined,
})

const emit = defineEmits<{
  (e: 'update:value', value: string): void
  (e: 'change', value: string): void
}>()

const fileList = ref<UploaderFileListItem[]>([])

/**
 * 解析上传数据
 * @param value 上传值
 * @param params 下载参数
 */
function parseUploadData(value: string, params?: Record<string, unknown>): UploaderFileListItem[] {
  if (!value)
    return []

  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) {
      return parsed.map(item => ({
        url: item.url || item.downloadUri,
        name: item.name || item.filename,
        status: 'done',
        message: '',
      }))
    }
  }
  catch {
    // 如果解析失败，返回空数组
  }

  return []
}

/**
 * 文件列表转JSON
 * @param list 文件列表
 */
function fileListToJson(list: UploaderFileListItem[]): string {
  const files = list.map(item => ({
    url: item.url,
    name: item.name,
    downloadUri: item.url,
    filename: item.name,
  }))
  return JSON.stringify(files)
}

/**
 * 上传完成处理
 * @param file 上传文件
 */
function afterRead(file: UploaderFileListItem | UploaderFileListItem[]) {
  const files = Array.isArray(file) ? file : [file]
  files.forEach((item) => {
    item.status = 'uploading'
    item.message = '上传中...'

    // 模拟上传成功
    setTimeout(() => {
      item.status = 'done'
      item.message = ''
      onChange()
    }, 1000)
  })
}

/**
 * 删除文件处理
 * @param file 删除的文件
 * @param index 文件索引
 */
function onDelete(file: UploaderFileListItem, index: number) {
  fileList.value.splice(index, 1)
  onChange()
}

/**
 * 值变化处理
 */
function onChange() {
  const value = fileListToJson(fileList.value)
  emit('update:value', value)
  emit('change', value)
}

/**
 * 下载文件
 * @param file 文件信息
 */
function downloadFile(file: UploaderFileListItem) {
  if (file && file.url) {
    const a = document.createElement('a')
    a.href = file.url
    a.download = file.name || '未命名文件'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}

/**
 * 初始化文件列表
 */
function initFileList() {
  if (props.value) {
    fileList.value = parseUploadData(props.value, props.downloadParams)
  }
  else {
    fileList.value = []
  }
}

// 监听值变化
watch(
  () => props.value,
  () => {
    initFileList()
  },
  { immediate: true },
)

// 组件挂载后初始化
onMounted(() => {
  initFileList()
})
</script>

<template>
  <div class="field-upload field-form-item">
    <van-field :label="label" :required="required" :name="prop">
      <template #input>
        <!-- 非图片类型的只读状态 -->
        <div v-if="readOnly && !isImage">
          <div v-for="(file, index) in fileList" :key="index">
            <a class="file-link" @click="downloadFile(file)">{{ file.name || file.filename }}</a>
          </div>
        </div>
        <!-- 上传组件 -->
        <van-uploader
          v-if="!(readOnly && !isImage)"
          v-model="fileList"
          :max-count="maxCount"
          :deletable="!disabled && !readOnly"
          :disabled="disabled"
          :accept="isImage ? 'image' : '*'"
          :preview-full-image="isImage"
          :after-read="afterRead"
          @delete="onDelete"
        />
      </template>
    </van-field>
  </div>
</template>

<style scoped>
.field-upload {
  background: white;
}

.file-link {
  color: royalblue;
  cursor: pointer;
}
</style>
