<script setup lang="ts">
import type { CommitInfo, CopyItem, FlowOperation, TaskDetailsData } from '../types'
import { showDialog, showLoadingToast, showToast, closeToast } from 'vant'
/**
 * 流程处理页面（核心）
 * 用于处理流程任务的审批、驳回、转办等操作
 */
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FlowOperationController } from '@/api/FlowController/FlowOperationController'
import { OnlineFormController } from '@/api/OnlineFormController/OnlineFormController'
import { SysFlowTaskOperationType, SysFlowWorkOrderStatus } from '@/staticDict/flowStaticDict'
import { getHeadImageUrl, showMessage } from '@/utils/index'
import OnlineWorkflowForm from '@/views/online/OnlineWorkflowForm.vue'
import CopyForSelect from '../components/copyForSelect/index.vue'
import TaskCommentList from '../components/taskCommentList.vue'
import TaskCommit from '../components/taskCommit.vue'

// 状态图标
const statusImg = '/static/icon/approval-icon.png'
const passImg = '/static/icon/pass-icon.png'
const refuseImg = '/static/icon/refuse-icon.png'
const draftImg = '/static/icon/draft-icon.png'
const cancelImg = '/static/icon/cancel-icon.png'
const stoppedImg = '/static/icon/stopped-icon.png'
const moreIcon = '/static/icon/more-icon.png'

const router = useRouter()
const route = useRoute()

/** 任务详情数据 */
const taskDetailsData = ref<TaskDetailsData>({})
/** 当前标签页 */
const tableType = ref(0)
/** 更多操作显示状态 */
const moreShow = ref(false)
/** 审批弹窗显示状态 */
const showCommitDlg = ref(false)
/** 提交信息 */
const commitInfo = ref<CommitInfo>({})
/** 抄送列表 */
const copyItemList = ref<CopyItem[]>([])
/** 操作按钮列表 */
const operationList = ref<FlowOperation[]>([])
/** 是否正在提交（防止重复提交） */
const isSubmitting = ref(false)

/** 流程定义ID */
const processDefinitionId = ref<string | undefined>()
/** 发起人头像 */
const headImageUrl = ref<string | null>(null)
/** 发起人名称 */
const processInstanceInitiator = ref<string>('')

/** 在线表单组件引用 */
const workflowFormRef = ref()
/** 在线表单配置 */
const formConfig = ref<any>(null)
/** 表单是否加载完成 */
const formReady = ref(false)

/**
 * 加载在线表单配置
 * @param formId - 表单ID
 */
async function loadFormConfig(formId: string): Promise<void> {
  try {
    const res = await OnlineFormController.render({ formId })
    const onlineForm = res.onlineForm
    const widgetJson = onlineForm.widgetJson
    const formConfigData = typeof widgetJson === 'string' ? JSON.parse(widgetJson) : widgetJson
    const mobileConfig = formConfigData.mobile

    if (mobileConfig != null) {
      formConfig.value = {
        rawData: res,
        readOnly: taskDetailsData.value.readOnly,
        formName: onlineForm.formName,
        formType: onlineForm.formType,
        formKind: onlineForm.formKind,
        masterTableId: onlineForm.masterTableId,
        labelWidth: mobileConfig.labelWidth,
        labelPosition: mobileConfig.labelPosition,
        filterItemWidth: mobileConfig.filterItemWidth,
        gutter: mobileConfig.gutter,
        height: mobileConfig.height,
        width: mobileConfig.width,
        widgetList: mobileConfig.widgetList,
        operationList: (mobileConfig.operationList || []).sort((a: any, b: any) => {
          return (a.showOrder || 0) - (b.showOrder || 0)
        }),
        tableWidget: mobileConfig.tableWidget,
        leftWidget: mobileConfig.leftWidget,
        customFieldList: mobileConfig.customFieldList,
        formEventList: mobileConfig.formEventList,
        maskFieldList: mobileConfig.maskFieldList,
      }
      formReady.value = true
    }
    else {
      console.warn('没有找到移动端配置信息')
    }
  }
  catch (e) {
    console.error('加载表单配置失败', e)
  }
}

/**
 * 获取流程信息
 * @returns 流程信息对象
 */
function getFlowInfo(): Record<string, any> {
  return {
    processInstanceId: taskDetailsData.value.processInstanceId,
    processDefinitionId: taskDetailsData.value.processDefinitionId,
    taskId: taskDetailsData.value.taskId,
    processDefinitionKey: taskDetailsData.value.processDefinitionKey,
    flowEntryName: taskDetailsData.value.flowEntryName,
    processInstanceInitiator: taskDetailsData.value.processInstanceInitiator,
    isRuntime: taskDetailsData.value.isRuntime,
    isDraft: taskDetailsData.value.isDraft,
  }
}

/**
 * 流程状态图标
 */
const statusImage = computed(() => {
  const statusList = [statusImg, statusImg, refuseImg, passImg, stoppedImg, cancelImg, draftImg]
  return statusList[taskDetailsData.value.flowStatus || 0] || statusImg
})

/**
 * 流程操作列表
 */
const flowOperation = computed(() => {
  if (Array.isArray(operationList.value)) {
    return operationList.value.map((item) => {
      if (item.type === SysFlowTaskOperationType.getById('multi_sign')?.id && item.multiSignAssignee != null) {
        const multiSignAssignee = {
          ...item.multiSignAssignee,
          assigneeList: item.multiSignAssignee.assigneeList
            ? item.multiSignAssignee.assigneeList.split(',')
            : undefined,
        }
        return { ...item, multiSignAssignee }
      }
      return { ...item }
    })
  }
  return []
})

/**
 * 主要操作按钮（前2个）
 */
const mainOperation = computed(() => {
  return flowOperation.value.slice(0, 2)
})

/**
 * 更多操作按钮（后面的）
 */
const moreOperation = computed(() => {
  return flowOperation.value.slice(2)
})

/**
 * 更多操作列表
 */
const moreActions = computed(() => {
  return moreOperation.value.map(operation => ({
    text: operation.label,
    operation,
  }))
})

/**
 * 获取按钮类型
 * @param type - 操作类型
 * @returns 按钮类型
 */
function getButtonType(type: string): string {
  const agreeTypes = [
    SysFlowTaskOperationType.getById('agree')?.id,
    SysFlowTaskOperationType.getById('transfer')?.id,
    SysFlowTaskOperationType.getById('multi_consign')?.id,
    SysFlowTaskOperationType.getById('multi_minus_sign')?.id,
    SysFlowTaskOperationType.getById('multi_before_consign')?.id,
    SysFlowTaskOperationType.getById('multi_after_consign')?.id,
    SysFlowTaskOperationType.getById('multi_agree')?.id,
    SysFlowTaskOperationType.getById('multi_sign')?.id,
    SysFlowTaskOperationType.getById('set_assignee')?.id,
  ]

  const refuseTypes = [
    SysFlowTaskOperationType.getById('refuse')?.id,
    SysFlowTaskOperationType.getById('multi_refuse')?.id,
    SysFlowTaskOperationType.getById('parallel_refuse')?.id,
  ]

  const rejectTypes = [
    SysFlowTaskOperationType.getById('reject')?.id,
    SysFlowTaskOperationType.getById('rejectToStart')?.id,
    SysFlowTaskOperationType.getById('rejectToTask')?.id,
    SysFlowTaskOperationType.getById('revoke')?.id,
  ]

  if (agreeTypes.includes(type))
    return 'primary'
  if (type === SysFlowTaskOperationType.getById('save')?.id)
    return 'success'
  if (refuseTypes.includes(type))
    return 'default'
  if (rejectTypes.includes(type))
    return 'danger'
  return 'default'
}

/**
 * 返回上一页
 */
function onBack(): void {
  router.back()
}

/**
 * 处理操作按钮点击
 * @param operation - 操作类型
 */
function handlerOperation(operation: FlowOperation): void {
  if (taskDetailsData.value.processInstanceId == null && taskDetailsData.value.taskId == null) {
    handlerStart(operation, copyItemList.value)
  }
  else {
    handlerSubmit(operation, copyItemList.value)
  }
}

/**
 * 处理提交操作
 * @param operation - 操作类型
 * @param copyItemList - 抄送列表
 */
async function handlerSubmit(operation: FlowOperation, copyItemList: CopyItem[]): Promise<void> {
  if (workflowFormRef.value && !workflowFormRef.value.isReady) {
    showMessage('表单数据加载中，请稍候！', 'warning')
    return
  }
  const formData = await getMasterData(operation.type)
  preHandlerOperation(operation, false, copyItemList, formData).then((taskCommitData) => {
    onTaskCommitCallback(true, taskCommitData)
  }).catch(() => {
    // 需要显示审批弹窗
  })
}

/**
 * 处理启动操作
 * @param operation - 操作类型
 * @param copyItemList - 抄送列表
 */
async function handlerStart(operation: FlowOperation, copyItemList: CopyItem[]): void {
  if (workflowFormRef.value && !workflowFormRef.value.isReady) {
    showMessage('表单数据加载中，请稍候！', 'warning')
    return
  }
  const formData = await getMasterData(operation.type)
  preHandlerOperation(operation, true, copyItemList, formData).then((taskCommitData) => {
    if (formData) {
      const builtFormData = buildFormData(operation, formData, taskCommitData)
      startImpl(operation, builtFormData, copyItemList)
    }
  }).catch(() => {
    // 需要显示审批弹窗
  })
}

/**
 * 预处理工作流操作
 * @param operation - 操作类型
 * @param isStart - 是否为启动流程
 * @param copyItemList - 抄送列表
 * @param formData - 表单数据
 * @returns Promise
 */
function preHandlerOperation(
  operation: FlowOperation,
  isStart: boolean,
  copyItemList: CopyItem[],
  formData: Record<string, any>,
): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    // 撤销操作不弹出选择窗口
    let showCommitDig = (!isStart && operation.type !== SysFlowTaskOperationType.getById('revoke')?.id)
      || operation.type === SysFlowTaskOperationType.getById('set_assignee')?.id

    if (operation.type === SysFlowTaskOperationType.getById('multi_sign')?.id) {
      showCommitDig = !operation.multiSignAssignee
        || !Array.isArray(operation.multiSignAssignee.assigneeList)
        || operation.multiSignAssignee.assigneeList.length <= 0
    }

    commitInfo.value = {
      operation,
      processInstanceId: taskDetailsData.value.processInstanceId,
      taskId: taskDetailsData.value.taskId,
      formData,
      finishedInfo: {},
      copyItemList,
    }

    if (showCommitDig) {
      let title = '提交'
      if (!isStart) {
        const coSignTypes = [
          SysFlowTaskOperationType.getById('multi_consign')?.id,
          SysFlowTaskOperationType.getById('multi_minus_sign')?.id,
          SysFlowTaskOperationType.getById('multi_before_consign')?.id,
          SysFlowTaskOperationType.getById('multi_after_consign')?.id,
        ]
        if (coSignTypes.includes(operation.type)) {
          title = SysFlowTaskOperationType.getById(operation.type)?.name || '审批'
        }
        else {
          title = '审批'
        }
      }
      commitInfo.value.title = title
      showCommitDlg.value = true
      reject(new Error('需要显示审批弹窗'))
    }
    else {
      resolve({})
    }
  })
}

/**
 * 启动流程
 * @param operation - 操作类型
 * @param formData - 表单数据
 * @param copyItemList - 抄送列表
 */
function startImpl(
  operation: FlowOperation,
  formData: Record<string, any>,
  copyItemList: CopyItem[],
): void {
  if (isSubmitting.value) {
    showMessage('正在提交中，请稍候！', 'warning')
    return
  }
  isSubmitting.value = true
  showLoadingToast({ message: '提交中...', forbidClick: true, duration: 0 })
  FlowOperationController.startAndTakeUserTask({
    processDefinitionKey: taskDetailsData.value.processDefinitionKey,
    masterData: formData.masterData || {},
    slaveData: formData.slaveData,
    taskVariableData: {
      ...formData.taskVariableData,
      latestApprovalStatus: operation.latestApprovalStatus,
    },
    flowTaskCommentDto: {
      approvalType: operation.type,
    },
    copyData: (copyItemList || []).reduce((retObj, item) => {
      retObj[item.type] = item.id
      return retObj
    }, {} as Record<string, string>),
  }).then(() => {
    closeToast()
    isSubmitting.value = false
    showMessage('启动成功！', 'success')
    handlerClose()
  }).catch((e) => {
    closeToast()
    isSubmitting.value = false
    console.error(e)
  })
}

/**
 * 提交用户任务
 * @param operation - 操作类型
 * @param formData - 表单数据
 * @param copyItemList - 抄送列表
 * @param taskCommitData - 提交数据
 * @returns Promise
 */
function submitImpl(
  operation: FlowOperation,
  formData: Record<string, any>,
  copyItemList: CopyItem[],
  taskCommitData: Record<string, any>,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isSubmitting.value) {
      showMessage('正在提交中，请稍候！', 'warning')
      reject(new Error('重复提交'))
      return
    }
    isSubmitting.value = true
    showLoadingToast({ message: '提交中...', forbidClick: true, duration: 0 })
    const params = {
      taskId: taskDetailsData.value.taskId,
      processInstanceId: taskDetailsData.value.processInstanceId,
      masterData: formData.masterData,
      slaveData: formData.slaveData,
      flowTaskCommentDto: {
        taskComment: (taskCommitData || {}).message,
        approvalType: operation.type,
        delegateAssignee: operation.type === SysFlowTaskOperationType.getById('transfer')?.id
          ? (taskCommitData || {}).assignee
          : undefined,
      },
      taskVariableData: {
        ...formData.taskVariableData,
        latestApprovalStatus: operation.latestApprovalStatus,
      },
      copyData: (copyItemList || []).reduce((retObj, item) => {
        retObj[item.type] = item.id
        return retObj
      }, {} as Record<string, string>),
    }

    FlowOperationController.submitUserTask(params).then(() => {
      closeToast()
      isSubmitting.value = false
      showMessage('提交成功！', 'success')
      resolve()
    }).catch((e) => {
      closeToast()
      isSubmitting.value = false
      reject(e)
    })
  })
}

/**
 * 构建表单数据
 * @param operation - 操作类型
 * @param formData - 表单数据
 * @param taskCommitData - 提交数据
 * @returns 构建后的表单数据
 */
function buildFormData(
  operation: FlowOperation,
  formData: Record<string, any>,
  taskCommitData: Record<string, any>,
): Record<string, any> {
  const assignee = ((taskCommitData || {}).assignee || '').split(',')
  if (operation.type === SysFlowTaskOperationType.getById('multi_sign')?.id) {
    // 会签操作设置多实例处理人集合
    if (formData.taskVariableData == null)
      formData.taskVariableData = {}
    formData.taskVariableData.assigneeList = assignee
  }
  else if (operation.type === SysFlowTaskOperationType.getById('set_assignee')?.id) {
    // 设置下一个任务节点处理人
    if (formData.taskVariableData == null)
      formData.taskVariableData = {}
    formData.taskVariableData.appointedAssignee = Array.isArray(assignee)
      ? assignee.join(',')
      : undefined
  }
  return formData
}

/**
 * 获取表单数据
 * @param operationType - 操作类型
 * @returns 表单数据
 */
async function getMasterData(operationType: string): Promise<Record<string, any>> {
  // 不需要获取表单数据的操作
  const tempList = [
    SysFlowTaskOperationType.getById('multi_consign')?.id,
    SysFlowTaskOperationType.getById('multi_minus_sign')?.id,
    SysFlowTaskOperationType.getById('multi_before_consign')?.id,
    SysFlowTaskOperationType.getById('multi_after_consign')?.id,
    SysFlowTaskOperationType.getById('free_jump')?.id,
    SysFlowTaskOperationType.getById('reject')?.id,
    SysFlowTaskOperationType.getById('rejectToTask')?.id,
    SysFlowTaskOperationType.getById('rejectToStart')?.id,
    SysFlowTaskOperationType.getById('revoke')?.id,
  ]

  if (tempList.includes(operationType))
    return Promise.resolve({})

  // 从在线表单组件获取表单数据
  if (workflowFormRef.value && typeof workflowFormRef.value.getFormData === 'function') {
    try {
      const isDraft = taskDetailsData.value.isDraft || false
      const variableList = taskDetailsData.value.variableList
      const formData = await workflowFormRef.value.getFormData(isDraft, variableList)
      return formData
    }
    catch (e) {
      console.error('获取表单数据失败', e)
      return Promise.reject(e)
    }
  }

  return Promise.resolve({
    masterData: {},
    slaveData: {},
    taskVariableData: {},
  })
}

/**
 * 关闭流程处理页面
 */
function handlerClose(): void {
  router.back()
}

/**
 * 审批提交回调
 * @param success - 是否成功
 * @param taskCommitData - 提交数据
 */
async function onTaskCommitCallback(success: boolean, taskCommitData?: Record<string, any>): void {
  const operation = commitInfo.value.operation!
  const formData = buildFormData(operation, commitInfo.value.formData || {}, taskCommitData || {})
  const copyItemListValue = copyItemList.value

  if (success) {
    if (isSubmitting.value) {
      showMessage('正在提交中，请稍候！', 'warning')
      return
    }
    // 启动流程
    if (taskDetailsData.value.processInstanceId == null && taskDetailsData.value.taskId == null) {
      startImpl(operation, formData, copyItemListValue)
      showCommitDlg.value = false
      return
    }

    // 加签、减签操作
    const coSignTypes = [
      SysFlowTaskOperationType.getById('multi_consign')?.id,
      SysFlowTaskOperationType.getById('multi_minus_sign')?.id,
      SysFlowTaskOperationType.getById('multi_before_consign')?.id,
      SysFlowTaskOperationType.getById('multi_after_consign')?.id,
    ]

    if (coSignTypes.includes(operation.type)) {
      // 串行会签前后加签参数
      let after: boolean | undefined
      if (
        operation.type === SysFlowTaskOperationType.getById('multi_before_consign')?.id
        || operation.type === SysFlowTaskOperationType.getById('multi_after_consign')?.id
      ) {
        after = operation.type === SysFlowTaskOperationType.getById('multi_after_consign')?.id
      }

      FlowOperationController.submitConsign({
        taskId: taskDetailsData.value.taskId,
        processInstanceId: taskDetailsData.value.processInstanceId,
        newAssignees: ((taskCommitData || {}).assignee || '').split(','),
        isAdd: operation.type === SysFlowTaskOperationType.getById('multi_consign')?.id,
        before: after != null ? !after : undefined,
      }).then(() => {
        showToast({ type: 'success', message: operation.type === SysFlowTaskOperationType.getById('multi_consign')?.id ? '加签成功！' : '减签成功！' })
        handlerClose()
      }).catch((e) => {
        console.error(e)
      })
      showCommitDlg.value = false
      return
    }

    // 自由跳
    if (operation.type === SysFlowTaskOperationType.getById('free_jump')?.id) {
      FlowOperationController.freeJump({
        processInstanceId: taskDetailsData.value.processInstanceId,
        sourceTaskId: taskDetailsData.value.taskId,
        targetTaskKey: (taskCommitData || {}).targetTaskKey,
        delegateAssignee: (taskCommitData || {}).assignee,
        taskComment: (taskCommitData || {}).message,
        taskVariableData: {
          latestApprovalStatus: operation.latestApprovalStatus,
        },
      }).then(() => {
        handlerClose()
      }).catch((e) => {
        console.error(e)
      })
      showCommitDlg.value = false
      return
    }

    // 驳回操作
    if (
      operation.type === SysFlowTaskOperationType.getById('reject')?.id
      || operation.type === SysFlowTaskOperationType.getById('rejectToTask')?.id
    ) {
      FlowOperationController.rejectRuntimeTask({
        processInstanceId: taskDetailsData.value.processInstanceId,
        taskId: taskDetailsData.value.taskId,
        targetTaskKey: (taskCommitData || {}).targetTaskKey,
        taskComment: (taskCommitData || {}).message,
        taskVariableData: {
          latestApprovalStatus: operation.latestApprovalStatus,
        },
      }).then(() => {
        handlerClose()
      }).catch((e) => {
        console.error(e)
      })
      showCommitDlg.value = false
      return
    }

    // 驳回到起点
    if (operation.type === SysFlowTaskOperationType.getById('rejectToStart')?.id) {
      FlowOperationController.rejectToStartUserTask({
        processInstanceId: taskDetailsData.value.processInstanceId,
        taskId: taskDetailsData.value.taskId,
        taskComment: (taskCommitData || {}).message,
        taskVariableData: {
          latestApprovalStatus: operation.latestApprovalStatus,
        },
      }).then(() => {
        handlerClose()
      }).catch((e) => {
        console.error(e)
      })
      showCommitDlg.value = false
      return
    }

    // 撤销操作
    if (operation.type === SysFlowTaskOperationType.getById('revoke')?.id) {
      showDialog({
        title: '提示',
        message: '是否撤销此任务？',
      }).then(() => {
        FlowOperationController.revokeHistoricTask({
          processInstanceId: taskDetailsData.value.processInstanceId,
          taskId: taskDetailsData.value.taskId,
          taskComment: '任务处理人撤销任务',
          taskVariableData: {
            latestApprovalStatus: operation.latestApprovalStatus,
          },
        }).then(() => {
          handlerClose()
        }).catch((e) => {
          console.error(e)
        })
      }).catch(() => {
        // 用户取消
      })
      showCommitDlg.value = false
      return
    }

    submitImpl(operation, formData, copyItemListValue, taskCommitData || {}).then(() => {
      handlerClose()
    }).catch((e) => {
      console.error(e)
    })
  }
  showCommitDlg.value = false
}

onMounted(() => {
  const userInfoStr = localStorage.getItem('userInfo')
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null

  // 从路由参数获取数据
  const passData = route.query.passData
  if (passData) {
    const item = JSON.parse(decodeURIComponent(passData as string))
    taskDetailsData.value = item || {}
    operationList.value = item.operationList || []
    processDefinitionId.value = item.processDefinitionId
    processInstanceInitiator.value = item.processInstanceInitiator || userInfo?.showName || ''
    headImageUrl.value = getHeadImageUrl({
      headImageUrl: item.headImageUrl ? item : userInfo,
    })

    // 加载在线表单配置
    if (item.formId) {
      loadFormConfig(item.formId)
    }
  }
})
</script>

<template>
  <div class="handle-flow-task">
    <!-- 导航栏 -->
    <van-nav-bar
      fixed
      placeholder
      :title="taskDetailsData.flowEntryName || '任务详情'"
      left-arrow
      @click-left="router.back()"
    />

    <!-- 任务详情头部 -->
    <div class="task-detail">
      <div class="task-info">
        <span class="task-details-herder-title">{{ taskDetailsData.flowEntryName }}</span>
        <span v-if="taskDetailsData.taskName" class="task-details-herder-txt">
          当前任务：{{ taskDetailsData.taskName }}
        </span>
        <div class="task-details-herder-user">
          <div class="user-avatar">
            <img v-if="headImageUrl" :src="headImageUrl">
          </div>
          <span class="user-name">{{ processInstanceInitiator }}</span>
        </div>
      </div>
      <van-image
        class="task-details-herder-img"
        width="67"
        height="53"
        :src="statusImage"
      />
    </div>

    <!-- 标签页 -->
    <van-tabs v-if="taskDetailsData.processInstanceId" v-model:active="tableType">
      <van-tab title="表单详情" />
      <van-tab title="审批记录" />
    </van-tabs>

    <!-- 表单内容区域 -->
    <div v-if="taskDetailsData" class="task-data">
      <!-- 表单详情 -->
      <div v-show="tableType === 0" class="task-input-box">
        <!-- 在线表单组件 -->
        <OnlineWorkflowForm
          v-if="formReady && formConfig"
          ref="workflowFormRef"
          :form-config="formConfig"
          :read-only="taskDetailsData.readOnly"
          :flow-info="getFlowInfo()"
        />
        <div class="cc-view">
          <CopyForSelect v-model="copyItemList" />
        </div>
      </div>

      <!-- 审批记录 -->
      <div v-show="tableType === 1">
        <TaskCommentList
          v-if="taskDetailsData.processInstanceId"
          :process-instance-id="taskDetailsData.processInstanceId"
          :process-definition-id="processDefinitionId"
        />
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div v-if="mainOperation.length > 0 && tableType === 0" class="task-details-floor">
      <!-- 更多操作按钮 -->
      <div v-if="moreActions.length > 0" class="more-btn-wrapper">
        <van-icon name="ellipsis" size="24" @click="moreShow = !moreShow" />
        <div v-if="moreShow" class="btnList">
          <div
            v-for="item in moreActions"
            :key="item.operation.id"
            class="btnnn"
            @click.stop="handlerOperation(item.operation)"
          >
            {{ item.text }}
          </div>
        </div>
      </div>

      <!-- 主要操作按钮 -->
      <van-button
        v-for="operation in mainOperation"
        :key="operation.id"
        :type="getButtonType(operation.type)"
        block
        @click="handlerOperation(operation)"
      >
        {{ operation.label }}
      </van-button>
    </div>

    <!-- 审批提交弹窗 -->
    <van-popup v-model:show="showCommitDlg" position="bottom" round style="height: 100%;">
      <TaskCommit
        v-if="showCommitDlg"
        :title="commitInfo.title"
        :operation="commitInfo.operation!"
        :process-instance-id="taskDetailsData.processInstanceId"
        :process-definition-id="processDefinitionId"
        :task-id="commitInfo.taskId"
        :finished-info="commitInfo.finishedInfo"
        @close="onTaskCommitCallback"
      />
    </van-popup>
  </div>
</template>

<style lang="less" scoped>
.handle-flow-task {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #F6F7F9;
  overflow: hidden;
}

.task-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background-color: #ffffff;
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;

  .task-info {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    width: 100px;
  }
}

.task-details-herder-title {
  width: 100%;
  font-size: 16px;
  line-height: 20px;
  height: 20px;
  color: #333333;
  font-weight: bold;
}

.task-details-herder-txt {
  width: 70%;
  color: #666666;
  line-height: 20px;
  height: 20px;
  font-size: 14px;
  margin-top: 10px;
}

.task-details-herder-user {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 5px;
  background-color: #333333;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
}

.user-name {
  color: #666666;
  font-size: 12px;
}

.task-details-herder-img {
  flex-shrink: 0;
}

.task-data {
  flex-grow: 1;
  flex-shrink: 1;
  overflow-y: auto;
  margin-top: 16px;
}

.task-input-box {
  display: flex;
  flex-direction: column;
}

.cc-view {
  padding: 16px;
  background-color: #ffffff;
  border-radius: 8px;
  margin: 16px;
}

.task-details-floor {
  height: 64px;
  padding: 0 16px;
  background-color: #ffffff;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  border-top: 1px solid #E8E8E8;

  .more-btn-wrapper {
    position: relative;

    .btnList {
      position: absolute;
      left: 0;
      bottom: 100%;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(50, 50, 51, 0.12);

      .btnnn {
        height: 40px;
        width: 100px;
        line-height: 40px;
        text-align: center;
        cursor: pointer;
      }
    }
  }

  .van-button {
    flex: 1;
    margin-left: 8px;
  }
}
</style>
