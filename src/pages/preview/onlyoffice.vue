<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { projectConfig } from '@/config'

/**
 * 路由实例
 */
const router = useRouter()
const route = useRoute()

/**
 * 文件URL
 */
const fileUrl = ref('')

/**
 * 文件名
 */
const fileName = ref('')

/**
 * 编辑器ID
 */
const editorId = ref(`onlyoffice-editor-${Date.now()}`)

/**
 * 加载进度
 */
const loadingPercent = ref(0)

/**
 * 获取文件类型
 * @param fileName 文件名
 * @returns 文件类型
 */
function getFileType(fileName: string): string {
  if (!fileName)
    return 'text'
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const typeMap: Record<string, string> = {
    doc: 'word',
    docx: 'word',
    xls: 'cell',
    xlsx: 'cell',
    csv: 'cell',
    ppt: 'slide',
    pptx: 'slide',
    pdf: 'pdf',
  }
  return typeMap[ext] || 'text'
}

/**
 * 初始化 OnlyOffice 编辑器
 */
function initOnlyOffice(): void {
  const onlyofficeServer = projectConfig.onlyofficeUrl
  const fullFileUrl = fileUrl.value.startsWith('http')
    ? fileUrl.value
    : projectConfig.baseUrl + fileUrl.value

  // 动态加载 OnlyOffice api.js
  const scriptId = 'onlyoffice-api-script'
  if (!document.getElementById(scriptId)) {
    const script = document.createElement('script')
    script.id = scriptId
    script.src = `${onlyofficeServer}/web-apps/apps/api/documents/api.js`
    script.onload = () => {
      createEditor(onlyofficeServer, fullFileUrl)
    }
    script.onerror = () => {
      loadingPercent.value = 100
    }
    document.head.appendChild(script)
  }
  else {
    createEditor(onlyofficeServer, fullFileUrl)
  }
}

/**
 * 创建编辑器
 * @param onlyofficeServer OnlyOffice 服务器地址
 * @param fullFileUrl 完整文件URL
 */
function createEditor(onlyofficeServer: string, fullFileUrl: string): void {
  try {
    const config = {
      document: {
        fileType: fileName.value.split('.').pop()?.toLowerCase() || '',
        key: `${Date.now()}`,
        title: fileName.value,
        url: fullFileUrl,
      },
      documentType: getFileType(fileName.value),
      editorConfig: {
        mode: 'view',
        lang: 'zh',
        customization: {
          forcesave: false,
        },
      },
      type: 'embedded',
      events: {
        onAppReady: () => {
          loadingPercent.value = 100
        },
        onDocumentReady: () => {
          loadingPercent.value = 100
        },
        onError: () => {
          loadingPercent.value = 100
        },
        onInfo: (event: any) => {
          if (event.data && typeof event.data.percent === 'number') {
            loadingPercent.value = event.data.percent
          }
        },
      },
    }

    if (typeof (window as any).DocsAPI === 'undefined') {
      loadingPercent.value = 100
      return
    }

    // 模拟进度
    startFakeProgress()

    new (window as any).DocsAPI.DocEditor(editorId.value, config)
  }
  catch (e) {
    loadingPercent.value = 100
  }
}

/**
 * 启动模拟进度
 */
function startFakeProgress(): void {
  let percent = 0
  const timer = setInterval(() => {
    if (loadingPercent.value >= 100) {
      clearInterval(timer)
      return
    }
    percent += Math.random() * 8
    if (percent > 90)
      percent = 90
    if (percent > loadingPercent.value) {
      loadingPercent.value = Math.floor(percent)
    }
  }, 300)
}

/**
 * 下载文件
 */
function downloadFile(): void {
  const fileurl = fileUrl.value
  if (fileurl) {
    const a = document.createElement('a')
    a.href = fileurl
    a.download = fileName.value
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}

/**
 * 返回上一页
 */
function goBack(): void {
  router.back()
}

/**
 * 页面加载时初始化
 */
onMounted(() => {
  // 获取路由参数
  if (route.query.fileUrl) {
    fileUrl.value = decodeURIComponent(route.query.fileUrl as string)
  }
  if (route.query.fileName) {
    fileName.value = decodeURIComponent(route.query.fileName as string)
  }

  nextTick(() => {
    initOnlyOffice()
  })
})
</script>

<template>
  <div class="onlyoffice-preview">
    <div class="preview-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="22" color="#333" />
        <span class="back-text">返回</span>
      </div>
      <span class="file-name">{{ fileName }}</span>
    </div>
    <div class="notice-bar">
      <span class="notice-text">
        【本预览程序由开源控件支持，部分文件可能无法预览，若无法预览请
        <span class="download-link" @click="downloadFile">下载</span>】
      </span>
    </div>
    <!-- 加载进度 -->
    <div v-if="loadingPercent < 100" class="loading-mask">
      <div class="loading-box">
        <div class="loading-circle">
          <span class="loading-percent">{{ loadingPercent }}%</span>
        </div>
        <span class="loading-label">文档加载中...</span>
      </div>
    </div>
    <div class="preview-container">
      <div :id="editorId" class="editor-placeholder" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.onlyoffice-preview {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.preview-header {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 12px;
  background: #fff;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  cursor: pointer;
}

.back-text {
  font-size: 14px;
  color: #333;
  margin-left: 4px;
}

.file-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-left: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-bar {
  background: #fffbe8;
  padding: 6px 12px;
  border-bottom: 1px solid #ffe58f;
  flex-shrink: 0;
}

.notice-text {
  font-size: 12px;
  color: #999;
}

.download-link {
  color: #0080ff;
  text-decoration: underline;
  cursor: pointer;
}

.preview-container {
  flex: 1;
  width: 100%;
  overflow: hidden;
  position: relative;
}

.editor-placeholder {
  width: 100%;
  height: 100%;
}

.loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 100;
}

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #e8f4ff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #0080ff;
}

.loading-percent {
  font-size: 20px;
  font-weight: bold;
  color: #0080ff;
}

.loading-label {
  margin-top: 12px;
  font-size: 13px;
  color: #666;
}
</style>
