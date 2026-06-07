<script setup lang="ts">
import type { UploaderFileListItem } from 'vant'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { buildGetUrl } from '@/utils/index'
import { projectConfig } from '@/config'
import { SysOnlineFieldKind } from '@/staticDict/index'

/**
 * FieldUpload 上传字段组件
 * 提供文件/图片上传功能，支持在线表单和普通表单两种模式
 */

interface Props {
  /** 标签 */
  label?: string
  /** 上传文件值（JSON 字符串） */
  value?: string
  /** 上传地址（普通模式） */
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
  /** 是否图片类型（普通模式） */
  isImage?: boolean
  /** 下载参数（普通模式） */
  downloadParams?: Record<string, unknown>
  /** 在线表单 widget 配置（在线表单模式） */
  widget?: any
  /** 在线表单 form 上下文函数 */
  formFn?: () => any
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
  widget: undefined,
  formFn: undefined,
})

const emit = defineEmits<{
  (e: 'update:value', value: string): void
  (e: 'change', value: string): void
}>()

const router = useRouter()
const fileList = ref<UploaderFileListItem[]>([])

/** 是否为在线表单模式 */
const isOnlineMode = computed(() => props.widget != null)

/** 在线表单的 fieldKind: 1=文件上传, 2=图片上传 */
const fieldKind = computed(() => {
  if (!isOnlineMode.value) return props.isImage ? 2 : 1
  const column = props.widget.column
  return column?.fieldKind ?? 1
})

/** 是否图片类型 */
const isImageType = computed(() => {
  if (!isOnlineMode.value) return props.isImage
  return fieldKind.value === SysOnlineFieldKind.UPLOAD_IMAGE
})

/** 最大文件数量 */
const maxFileCount = computed(() => {
  if (isOnlineMode.value && props.widget?.column?.maxFileCount) {
    return props.widget.column.maxFileCount
  }
  return props.maxCount
})

/** 获取在线表单的上传地址 */
const uploadAction = computed(() => {
  if (!isOnlineMode.value) return props.action
  const widget = props.widget
  if (widget.props?.actionUrl) {
    return buildGetUrl(widget.props.actionUrl, {})
  }
  const dsVar = widget.datasource?.variableName || ''
  if (widget.relation) {
    return buildGetUrl(`admin/online/onlineOperation/uploadOneToManyRelation/${dsVar}`, {})
  }
  return buildGetUrl(`admin/online/onlineOperation/uploadDatasource/${dsVar}`, {})
})

/** 获取在线表单的上传附加数据 */
const uploadFormData = computed(() => {
  if (!isOnlineMode.value) return props.formData || {}
  const widget = props.widget
  const formCtx = props.formFn?.() || {}
  const token = localStorage.getItem('token') || ''
  const data: Record<string, any> = {
    datasourceId: widget.datasource?.datasourceId,
    asImage: isImageType.value ? 1 : 0,
    fieldName: widget.column?.columnName,
    Authorization: token,
  }
  if (widget.relation?.relationId) {
    data.relationId = widget.relation.relationId
  }
  // 注入流程参数
  const flowData = formCtx.flowData
  if (flowData) {
    if (flowData.processDefinitionKey) data.processDefinitionKey = flowData.processDefinitionKey
    if (flowData.processInstanceId) data.processInstanceId = flowData.processInstanceId
    if (flowData.taskId) data.taskId = flowData.taskId
  }
  return data
})

/** 获取在线表单的上传请求头 */
const uploadHeader = computed(() => {
  if (!isOnlineMode.value) return props.header || {}
  const token = localStorage.getItem('token') || ''
  return {
    Authorization: token,
  }
})

/**
 * 获取在线表单的下载地址路径
 * 参照原始 OnlineCustomUpload.vue 的 getDownloadUrl 计算属性
 */
function getDownloadUrlPath(): string {
  const widget = props.widget
  if (widget.props?.downloadUrl) {
    return widget.props.downloadUrl
  }
  const dsVar = widget.datasource?.variableName || ''
  if (widget.relation) {
    return `/admin/online/onlineOperation/downloadOneToManyRelation/${dsVar}`
  }
  return `/admin/online/onlineOperation/downloadDatasource/${dsVar}`
}

/**
 * 构建在线表单的下载参数
 * 参照原始 OnlineCustomUpload.vue 的 value watcher 中的 downloadParams 构建
 */
function buildDownloadParams(): Record<string, any> {
  const widget = props.widget
  const formCtx = props.formFn?.() || {}
  const token = localStorage.getItem('token') || ''
  const params: Record<string, any> = {
    datasourceId: widget.datasource?.datasourceId,
    fieldName: widget.column?.columnName,
    asImage: isImageType.value,
    Authorization: token,
  }
  if (widget.relation?.relationId) {
    params.relationId = widget.relation.relationId
  }
  // 注入流程参数
  const flowData = formCtx.flowData
  if (flowData) {
    if (flowData.processDefinitionKey) params.processDefinitionKey = flowData.processDefinitionKey
    if (flowData.processInstanceId) params.processInstanceId = flowData.processInstanceId
    if (flowData.taskId) params.taskId = flowData.taskId
  }
  // 注入数据主键
  if (formCtx.getPrimaryData) {
    params.dataId = formCtx.getPrimaryData(widget) || ''
  }
  return params
}

/**
 * 构建上传文件下载URL
 * 参照原始 uploadMixin.getUploadFileUrl 方法
 */
function getUploadFileUrl(item: any, params: Record<string, any>): string | null {
  if (item == null || item.downloadUri == null) return null
  const downloadParams = { ...params, filename: item.filename }
  return buildGetUrl(item.downloadUri, downloadParams)
}

/**
 * 解析上传数据为带 URL 的文件列表
 * 参照原始 uploadMixin.parseUploadData 方法
 */
function parseUploadData(jsonData: string, params: Record<string, any>): UploaderFileListItem[] {
  let pathList: any[] = []
  if (jsonData != null) {
    try {
      pathList = JSON.parse(jsonData)
    }
    catch (e) {
      console.error('[FieldUpload] parseUploadData JSON.parse error', e)
    }
  }
  if (!Array.isArray(pathList)) return []
  return pathList.map((item: any) => {
    const downloadParams = { ...params, filename: item.filename }
    return {
      ...item,
      url: getUploadFileUrl(item, downloadParams),
      status: 'done' as const,
      message: '',
      isImage: isImageType.value,
    }
  })
}

/**
 * 文件列表转JSON
 */
function fileListToJson(list: UploaderFileListItem[]): string {
  const files = list.map(item => ({
    name: item.name,
    downloadUri: (item as any).downloadUri,
    filename: (item as any).filename || item.name,
    uploadPath: (item as any).uploadPath,
  }))
  return JSON.stringify(files)
}

/**
 * 上传完成处理
 */
function afterRead(file: UploaderFileListItem | UploaderFileListItem[]) {
  const files = Array.isArray(file) ? file : [file]
  files.forEach((item) => {
    item.status = 'uploading'
    item.message = '上传中...'

    if (isOnlineMode.value && uploadAction.value) {
      // 在线表单模式：真实上传到服务器
      const formDataObj = new FormData()
      formDataObj.append('uploadFile', item.file as File)
      const fd = uploadFormData.value
      Object.keys(fd).forEach((key) => {
        formDataObj.append(key, fd[key])
      })

      fetch(uploadAction.value, {
        method: 'POST',
        headers: uploadHeader.value as Record<string, string>,
        body: formDataObj,
      })
        .then(res => res.json())
        .then((res) => {
          if (res.success && res.data) {
            const data = res.data
            ;(item as any).downloadUri = data.downloadUri
            ;(item as any).filename = data.filename
            ;(item as any).uploadPath = data.uploadPath
            item.url = data.downloadUri || item.url
            item.status = 'done'
            item.message = ''
          }
          else {
            item.status = 'failed'
            item.message = res.errorMessage || '上传失败'
          }
          onChange()
        })
        .catch(() => {
          item.status = 'failed'
          item.message = '上传失败'
          onChange()
        })
    }
    else {
      // 普通模式：模拟上传
      setTimeout(() => {
        item.status = 'done'
        item.message = ''
        onChange()
      }, 1000)
    }
  })
}

/**
 * 删除文件处理
 */
function onDelete(_file: UploaderFileListItem, index: number) {
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
 * 下载/预览文件
 * 文档类型（doc/docx/xls/xlsx/ppt/pptx/pdf/txt/csv）使用 OnlyOffice 在线预览
 * 其他类型直接下载
 */
function downloadFile(file: UploaderFileListItem) {
  if (!file?.url) return
  const fileName = file.name || (file as any).filename || '未命名文件'

  // 文档类型跳转 OnlyOffice 预览
  const docExts = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'txt', 'csv']
  const ext = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()
  if (docExts.includes(ext)) {
    // 构建后端实际地址的 URL（OnlyOffice 服务器需要能访问到）
    // 开发环境：将前端代理路径 /dev-api 替换为后端实际地址
    // 生产环境：URL 已是相对路径，拼接当前域名即可
    let docUrl = file.url
    const baseUrl = projectConfig.baseUrl
    if (baseUrl && baseUrl !== '/' && docUrl.includes(baseUrl)) {
      // 开发环境：把前端代理路径替换为后端实际地址
      const serverUrl = import.meta.env.VITE_API_SERVER_URL || 'http://10.10.10.211:8300'
      // 处理相对路径 (/dev-api/admin/...) 和绝对路径 (http://localhost:5175/dev-api/admin/...)
      docUrl = docUrl.replace(baseUrl, serverUrl)
    }
    else if (!docUrl.startsWith('http')) {
      docUrl = window.location.origin + (docUrl.startsWith('/') ? '' : '/') + docUrl
    }
    router.push({
      path: '/preview/onlyoffice',
      query: {
        fileUrl: encodeURIComponent(docUrl),
        fileName: encodeURIComponent(fileName),
      },
    })
  }
  else {
    // 其他类型直接下载
    const a = document.createElement('a')
    a.href = file.url
    a.target = '_blank'
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}

/**
 * 初始化文件列表
 * 参照原始 OnlineCustomUpload.vue 的 value watcher 逻辑：
 * 1. 解析 JSON 字符串
 * 2. 为每个 item 覆盖 downloadUri 为下载路径
 * 3. 调用 parseUploadData 构建带完整 URL 的文件列表
 */
function initFileList() {
  fileList.value = []
  if (props.value != null && props.value !== '') {
    if (isOnlineMode.value) {
      // 在线表单模式：参照原始 OnlineCustomUpload.vue 的 value watcher
      const downloadParams = buildDownloadParams()
      const downloadUri = getDownloadUrlPath()
      let temp: any[]
      try {
        temp = JSON.parse(props.value)
      }
      catch (e) {
        console.error('[FieldUpload] JSON.parse error', e, 'value:', props.value)
        return
      }
      // 关键步骤：为每个 item 覆盖 downloadUri 为下载路径
      temp = Array.isArray(temp) ? temp.map((item: any) => ({
        ...item,
        downloadUri,
      })) : []
      fileList.value = parseUploadData(JSON.stringify(temp), downloadParams)
      console.log('[FieldUpload] prop=%s value=%s parsed=%o', props.prop, props.value, fileList.value)
    }
    else {
      // 普通模式
      try {
        const parsed = JSON.parse(props.value)
        if (Array.isArray(parsed)) {
          fileList.value = parsed.map((item: any) => ({
            url: item.url || item.downloadUri,
            name: item.name || item.filename,
            filename: item.filename,
            downloadUri: item.downloadUri,
            uploadPath: item.uploadPath,
            status: 'done' as const,
            message: '',
          }))
        }
      }
      catch (e) {
        console.error('[FieldUpload] parse error', e)
      }
      console.log('[FieldUpload] prop=%s value=%s', props.prop, props.value)
    }
  }
  else {
    console.log('[FieldUpload] prop=%s value=%o (empty)', props.prop, props.value)
  }
}

// 监听值变化，参照原始代码使用 setTimeout 延迟初始化
watch(
  () => props.value,
  () => {
    setTimeout(() => {
      initFileList()
    }, 30)
  },
  { immediate: true },
)
</script>

<template>
  <div class="field-upload field-form-item">
    <van-field :label="label" :required="required" :name="prop">
      <template #input>
        <!-- 只读/禁用状态：显示文件列表 -->
        <div v-if="readOnly || disabled">
          <div
            v-for="(file, index) in fileList"
            :key="index"
            class="file-item"
            @click.stop="downloadFile(file)"
          >
            <van-icon :name="isImageType ? 'photo-o' : 'description'" size="16" />
            <span class="file-link">{{ file.name || (file as any).filename || '未命名文件' }}</span>
          </div>
          <div v-if="fileList.length === 0" class="empty-text">暂无附件</div>
        </div>
        <!-- 编辑状态 -->
        <template v-else>
          <!-- 图片类型编辑模式 -->
          <van-uploader
            v-if="isImageType"
            v-model="fileList"
            :max-count="maxFileCount"
            :deletable="true"
            :accept="'image/*'"
            :preview-full-image="true"
            :after-read="afterRead"
            @delete="onDelete"
          />
          <!-- 非图片类型编辑模式：文件列表 + 上传按钮 -->
          <div v-else>
            <div
              v-for="(file, index) in fileList"
              :key="index"
              class="file-item"
              @click.stop="downloadFile(file)"
            >
              <van-icon name="description" size="16" />
              <span class="file-link">{{ file.name || '未命名文件' }}</span>
              <van-icon name="cross" size="14" color="#999" @click.stop="onDelete(file, index)" />
            </div>
            <van-uploader
              v-model="fileList"
              :max-count="maxFileCount"
              :show-card="fileList.length < maxFileCount"
              :deletable="false"
              :accept="'*'"
              :after-read="afterRead"
            />
          </div>
        </template>
      </template>
    </van-field>
  </div>
</template>

<style scoped>
.field-upload {
  background: white;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0;
  cursor: pointer;
}

.file-link {
  color: #1989fa;
  font-size: 14px;
}

.file-link:active {
  opacity: 0.7;
}

.file-name {
  flex: 1;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-text {
  color: #999;
  font-size: 13px;
}
</style>
