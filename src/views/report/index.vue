<script setup lang="ts">
import { showToast } from 'vant'
/**
 * 报表入口页面
 * 用于展示报表页面内容，包含导航栏和报表表单组件
 */
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ReportPageController } from '@/api/ReportController/ReportPageController'
import { getBoundingClientRect } from '@/utils'
import ReportForm from './reportForm.vue'

/**
 * 表单配置接口
 */
interface FormConfig {
  pageId: string
  pageName: string
  pageCode: string
  gutter: number
  labelWidth: number
  labelPosition: string
  customFieldList: any[]
  filterItemWidth: number
  widgetList: any[]
  paramList: any[]
}

// 获取路由和路由器
const route = useRoute()
const router = useRouter()

// 状态栏高度
const statusBarHeight = ref<number>(0)
// 导航栏高度
const titleNavHeight = ref<number>(44)
// 页面是否准备好
const isReady = ref<boolean>(false)
// 表单配置
const formConfig = ref<FormConfig | undefined>(undefined)
// 页面ID
const pageId = ref<string | undefined>(undefined)

/**
 * 返回上一页
 */
function goBack(): void {
  router.back()
}

/**
 * 加载报表页面数据
 */
async function loadReportPage(): Promise<void> {
  if (!pageId.value)
    return

  isReady.value = false

  try {
    const res = await ReportPageController.view({ pageId: pageId.value })

    const temp = {
      pageId: res.pageId,
      pageName: res.pageName,
      pageCode: res.pageCode,
      groupId: res.groupId,
      pageJson: res.pageJson,
      formInfo: res.pageJson ? JSON.parse(res.pageJson) : {},
    }

    const formInfo = temp.formInfo.mobile

    if (formInfo != null) {
      formConfig.value = {
        pageId: temp.pageId,
        pageName: temp.pageName,
        pageCode: temp.pageCode,
        gutter: formInfo.gutter || 20,
        labelWidth: formInfo.labelWidth || 100,
        labelPosition: formInfo.labelPosition || 'left',
        customFieldList: formInfo.customFieldList || [],
        filterItemWidth: formInfo.filterItemWidth || 350,
        widgetList: formInfo.widgetList || [],
        paramList: formInfo.paramList || [],
      }
      isReady.value = true
    }
    else {
      showToast({
        message: '没有找到移动端配置信息！',
        position: 'top',
      })
      setTimeout(() => {
        router.back()
      }, 1500)
    }
  }
  catch (e) {
    console.error('加载报表页面失败:', e)
  }
}

/**
 * 初始化页面
 */
function initPage(): void {
  // 获取系统信息（Web 环境下使用 window 对象）
  const windowWidth = window.innerWidth

  // 计算 H5 环境下的状态栏高度
  statusBarHeight.value = 0

  // 获取导航栏按钮位置信息
  const rect = getBoundingClientRect(windowWidth, statusBarHeight.value)

  // 计算导航栏高度
  titleNavHeight.value = Math.max((rect.top - statusBarHeight.value) * 2 + rect.height, 44)

  // 从路由参数获取 pageId
  if (route.query.pageId) {
    pageId.value = route.query.pageId as string
  }
  else {
    showToast({
      message: '没有找到 pageId！',
      position: 'top',
    })
  }
}

// 监听 pageId 变化
watch(pageId, () => {
  loadReportPage()
})

// 页面挂载时初始化
onMounted(() => {
  initPage()
})
</script>

<template>
  <div v-show="isReady" class="report-page">
    <!-- 固定导航栏 -->
    <div
      class="nav-header"
      :style="{ height: `${titleNavHeight + statusBarHeight + 5}px` }"
    >
      <div
        class="nav-bar"
        :style="{ height: `${titleNavHeight}px`, top: `${statusBarHeight}px` }"
      >
        <van-icon
          name="arrow-left"
          size="20"
          class="nav-icon"
          @click="goBack"
        />
        <span class="nav-title">图表展示</span>
      </div>
    </div>

    <!-- 占位区域 -->
    <div :style="{ height: `${titleNavHeight + statusBarHeight + 5}px` }" />

    <!-- 报表表单组件 -->
    <ReportForm v-if="isReady && formConfig" :form-config="formConfig" />
  </div>
</template>

<style scoped lang="less">
.report-page {
  min-height: 100vh;
  background-color: #f6f7f9;
}

.nav-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background-color: #ffffff;
  border-bottom: 1px solid #ebedf0;
}

.nav-bar {
  position: absolute;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 16px;
  width: 100%;
}

.nav-icon {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  color: #323233;
}

.nav-title {
  width: calc(100vw - 80px);
  color: #323233;
  font-weight: 500;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
