<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FlowOperationController, SystemController } from '@/api'

import { clearAllStorage, getToken, setToken } from '@/utils'

/**
 * 路由实例
 */
const router = useRouter()
const route = useRoute()

/**
 * 消息ID
 */
const messageId = ref('')

/**
 * SSO 登录
 * @param fullPath 完整路径
 */
async function doSsoLogin(fullPath: string): Promise<void> {
  const v5ticket = route.query.v5ticket as string
  if (!v5ticket) {
    redirectToLogin()
    return
  }
  clearAllStorage()
  try {
    const res = await SystemController.ssoLogin({
      source: 'seeyonportail',
      code: v5ticket,
      isMobile: true,
    })
    localStorage.setItem('setHomeEntryList', JSON.stringify(res.mobileEntryList))
    setToken(res.tokenData)
    localStorage.setItem('userInfo', JSON.stringify(res))
    goToNext()
  }
  catch (e) {
    redirectToLogin()
  }
}

/**
 * 重定向到登录页
 */
function redirectToLogin(): void {
  clearAllStorage()
  router.replace('/login')
}

/**
 * 处理 API 错误
 * @param error 错误对象
 */
function handleApiError(error: any): void {
  if (error && error._isAuthError && route.query.v5ticket) {
    doSsoLogin(route.fullPath)
  }
}

/**
 * 获取下一步跳转
 */
async function goToNext(): Promise<void> {
  if (!messageId.value)
    return

  try {
    const taskInfo = await SystemController.viewTaskInfo({ messageId: messageId.value })
    if (taskInfo) {
      const params = {
        processInstanceId: taskInfo.processInstanceId,
        processDefinitionId: taskInfo.processDefinitionId,
        taskId: taskInfo.taskId,
      }
      const flowStatus = taskInfo.taskFinished

      if (!flowStatus) {
        const res = await FlowOperationController.viewRuntimeTaskInfo(params)
        const data = {
          taskFinished: taskInfo.taskFinished,
          isRuntime: true,
          isDraft: false,
          taskId: taskInfo.taskId,
          flowStatus: res.flowStatus || 1,
          processDefinitionKey: taskInfo.processDefinitionKey,
          processInstanceId: taskInfo.processInstanceId,
          processDefinitionId: taskInfo.processDefinitionId,
          formId: res.formId,
          routerName: res.mobileRouterName || res.routerName,
          readOnly: res.readOnly,
          taskName: taskInfo.taskName,
          headImageUrl: res.headImageUrl,
          flowEntryName: taskInfo.processDefinitionName,
          showWorkFlowForm: true,
          processInstanceInitiator: taskInfo.processInstanceInitiator,
          operationList: [],
          variableList: res.variableList,
        }
        router.replace({
          path: '/views/workflow/handleFlowTask/index',
          query: { passData: JSON.stringify(data) },
        })
      }
      else {
        const res = await FlowOperationController.viewHistoricTaskInfo(params)
        const data = {
          taskFinished: taskInfo.taskFinished,
          processDefinitionKey: taskInfo.processDefinitionKey,
          taskId: taskInfo.taskId,
          processInstanceId: taskInfo.processInstanceId,
          processDefinitionId: taskInfo.processDefinitionId,
          formId: res.formId,
          routerName: res.mobileRouterName || res.routerName,
          readOnly: true,
          flowEntryName: taskInfo.processDefinitionName,
          processInstanceInitiator: taskInfo.showName,
          taskName: taskInfo.taskName,
          headImageUrl: res.headImageUrl,
          showWorkFlowForm: true,
          operationList: [],
        }
        router.replace({
          path: '/views/workflow/handleFlowTask/index',
          query: { passData: JSON.stringify(data) },
        })
      }
    }
  }
  catch (e) {
    handleApiError(e)
  }
}

/**
 * 页面加载时初始化
 */
onMounted(() => {
  messageId.value = route.query.messageId as string || ''
  const fullPath = route.fullPath
  const token = getToken()
  const hasV5Ticket = !!route.query.v5ticket

  if (hasV5Ticket) {
    doSsoLogin(fullPath)
  }
  else if (token) {
    goToNext()
  }
  else {
    redirectToLogin()
  }
})
</script>

<template>
  <div />
</template>

<style scoped lang="less"></style>
