<script setup lang="ts">
/**
 * OnlineCustomImage 在线表单图片展示组件
 * 用于在表单中展示已上传的图片
 */
import { computed, ref, watch } from 'vue'
import { buildGetUrl } from '@/utils/index'

interface Props {
  /** 图片值（JSON字符串） */
  value?: string
  /** widget 配置 */
  widget?: any
  /** 图片源地址 */
  src?: string
  /** 图片填充模式 */
  fit?: string
  /** 是否圆形 */
  round?: boolean
  /** 宽度 */
  width?: string
  /** 高度 */
  height?: string
  /** 圆角 */
  radius?: number
  /** 对齐方式 */
  align?: string
  /** 表单上下文函数 */
  formFn?: () => any
}

const props = withDefaults(defineProps<Props>(), {
  value: undefined,
  widget: undefined,
  src: undefined,
  fit: 'cover',
  round: false,
  width: '100%',
  height: '200px',
  radius: 5,
  align: 'center',
  formFn: undefined,
})

const fileList = ref<any[]>([])

/** 判断是否为base64图片 */
function isBase64(src: string): boolean {
  return /^data:image\/\w+;base64,/.test(src)
}

/** 获取下载地址 */
function getDownloadUrl(): string {
  const widget = props.widget
  if (!widget) return ''
  const dsVar = widget.datasource?.variableName || ''
  if (widget.relation) {
    return `/admin/online/onlineOperation/downloadOneToManyRelation/${dsVar}`
  }
  return `/admin/online/onlineOperation/downloadDatasource/${dsVar}`
}

/** 构建下载URL */
function getUploadFileUrl(item: any, params: Record<string, any>): string | null {
  if (item == null || item.downloadUri == null) return null
  const downloadParams = { ...params, filename: item.filename }
  return buildGetUrl(item.downloadUri, downloadParams)
}

/** 构建流程参数 */
function buildFlowParam(): Record<string, any> {
  const formCtx = props.formFn?.() || {}
  const params: Record<string, any> = {}
  const flowData = formCtx.flowData
  if (flowData) {
    if (flowData.processDefinitionKey) params.processDefinitionKey = flowData.processDefinitionKey
    if (flowData.processInstanceId) params.processInstanceId = flowData.processInstanceId
    if (flowData.taskId) params.taskId = flowData.taskId
  }
  return params
}

/** 图片URL */
const imageUrl = computed(() => {
  if (Array.isArray(fileList.value) && fileList.value.length > 0) {
    return fileList.value[0].url
  }
  if (props.src && isBase64(props.src)) {
    return props.src
  }
  // 尝试从 src prop 解析
  if (props.src && !props.value) {
    try {
      const imgUrl = JSON.parse(props.src)
      if (imgUrl) {
        return getUploadFileUrl(imgUrl, { filename: imgUrl.filename })
      }
    }
    catch {
      // ignore
    }
  }
  return getDownloadUrl()
})

/** 样式 */
const wrapperStyle = computed(() => {
  let justifyContent = 'center'
  switch (props.align) {
    case 'left': justifyContent = 'flex-start'; break
    case 'right': justifyContent = 'flex-end'; break
    default: justifyContent = 'center'
  }
  return {
    'justify-content': justifyContent,
    'border-radius': props.radius ? `${props.radius}px` : undefined,
  }
})

// 监听 value 变化
watch(
  () => props.value,
  (newValue) => {
    if (!props.widget?.column) return
    fileList.value = []
    if (newValue) {
      const widget = props.widget!
      const formCtx = props.formFn?.() || {}
      const token = localStorage.getItem('token') || ''
      const downloadParams: Record<string, any> = {
        ...buildFlowParam(),
        datasourceId: widget.datasource?.datasourceId,
        fieldName: widget.column?.columnName,
        asImage: true,
        Authorization: token,
      }
      if (widget.relation?.relationId) {
        downloadParams.relationId = widget.relation.relationId
      }
      if (formCtx.getPrimaryData) {
        downloadParams.dataId = formCtx.getPrimaryData(widget) || ''
      }

      try {
        let temp = JSON.parse(newValue)
        if (Array.isArray(temp)) {
          const dlUrl = getDownloadUrl()
          temp = temp.map((item: any) => ({
            ...item,
            downloadUri: dlUrl,
          }))
          fileList.value = temp.map((item: any) => {
            const dlParams = { ...downloadParams, filename: item.filename }
            return {
              ...item,
              url: getUploadFileUrl(item, dlParams),
            }
          })
        }
      }
      catch {
        // ignore
      }
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="online-custom-image" :style="wrapperStyle">
    <van-image
      v-if="imageUrl"
      :src="imageUrl"
      :width="width"
      :height="height"
      :round="round"
      :fit="(fit as any) || 'cover'"
      :radius="radius ? `${radius}px` : undefined"
      :lazy-load="true"
    >
      <template #loading>
        <van-loading type="spinner" size="20" />
      </template>
      <template #error>
        <div class="image-error">
          <van-icon name="photo-o" size="24" color="#dcdee0" />
          <span>加载失败</span>
        </div>
      </template>
    </van-image>
  </div>
</template>

<style scoped>
.online-custom-image {
  display: flex;
  flex-direction: row;
  overflow: hidden;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
  color: #969799;
  width: 100%;
  height: 100%;
  background: #f7f8fa;
}
</style>
