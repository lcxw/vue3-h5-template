/**
 * 流程处理组合式函数
 * 提供流程操作的核心方法，包括加签、关闭流程、预处理操作等
 */
import { ref, type Ref } from 'vue'
import { showToast } from 'vant'
import { useRouter } from 'vue-router'
import { FlowOperationController } from '@/api/FlowController/FlowOperationController'
import { SysFlowTaskOperationType } from '@/staticDict/flowStaticDict'
import type { CommitInfo, FlowOperation } from '../types'

/**
 * 流程处理组合式函数参数
 */
interface UseFlowOptions {
  processInstanceId?: Ref<string | undefined>
  taskId?: Ref<string | undefined>
  dialogParams?: Ref<Record<string, any> | undefined>
  observer?: Ref<any>
  refreshParentCachedPage?: Ref<boolean>
  commitInfo?: Ref<CommitInfo>
  showCommitDlg?: Ref<boolean>
}

/**
 * 流程处理组合式函数
 * @param options - 流程处理参数
 * @returns 流程处理方法
 */
export function useFlow(options: UseFlowOptions = {}) {
  const router = useRouter()

  const {
    processInstanceId = ref(undefined),
    taskId = ref(undefined),
    dialogParams = ref(undefined),
    observer = ref(undefined),
    refreshParentCachedPage = ref(false),
    commitInfo = ref({} as CommitInfo),
    showCommitDlg = ref(false)
  } = options

  /**
   * 加签操作
   * @param assignee - 加签人员（可以是数组或逗号分隔的字符串）
   * @param isAdd - 是否为加签（true为加签，false为减签）
   * @returns Promise
   */
  function submitConsign(assignee: string | string[], isAdd = true): Promise<void> {
    return new Promise((resolve, reject) => {
      const params = {
        taskId: (dialogParams.value || {}).taskId || taskId.value,
        processInstanceId: (dialogParams.value || {}).processInstanceId || processInstanceId.value,
        newAssignees: Array.isArray(assignee) ? assignee : assignee.split(','),
        isAdd
      }

      FlowOperationController.submitConsign(params).then(() => {
        showToast({
          type: 'success',
          message: isAdd ? '加签成功！' : '减签成功！'
        })
        resolve()
      }).catch((e) => {
        reject(e)
      })
    })
  }

  /**
   * 关闭流程处理页面
   * @param isDialog - 是否为弹窗模式
   */
  function handlerClose(isDialog = false): void {
    if (isDialog) {
      if (observer.value != null) {
        observer.value.cancel(true)
      }
    } else {
      refreshParentCachedPage.value = true
      router.back()
    }
  }

  /**
   * 初始化表单数据（需要子组件实现）
   * @returns Promise
   */
  function initFormData(): Promise<void> {
    return new Promise((_resolve, reject) => {
      showToast({
        type: 'fail',
        message: '初始化流程表单数据接口并未实现，请联系管理员！'
      })
      reject(new Error('初始化流程表单数据接口并未实现'))
    })
  }

  /**
   * 预处理工作流操作
   * @param operation - 操作类型
   * @param isStart - 是否为启动流程
   * @param copyItemList - 抄送列表
   * @param formData - 表单数据
   * @param finishedInfo - 已完成信息
   * @returns Promise
   */
  function preHandlerOperation(
    operation: FlowOperation | null,
    isStart: boolean,
    copyItemList: Record<string, any>[] = [],
    formData: Record<string, any> = {},
    finishedInfo: Record<string, any> = {}
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (operation == null) {
        isStart ? resolve() : reject(new Error('操作类型为空'))
        return
      }

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
        processInstanceId: processInstanceId.value,
        taskId: taskId.value,
        formData,
        finishedInfo,
        copyItemList
      }

      if (showCommitDig) {
        let title = '提交'
        if (!isStart) {
          const coSignTypes = [
            SysFlowTaskOperationType.getById('multi_consign')?.id,
            SysFlowTaskOperationType.getById('multi_minus_sign')?.id,
            SysFlowTaskOperationType.getById('multi_before_consign')?.id,
            SysFlowTaskOperationType.getById('multi_after_consign')?.id
          ]
          if (coSignTypes.includes(operation.type)) {
            title = SysFlowTaskOperationType.getById(operation.type)?.name || '审批'
          } else {
            title = '审批'
          }
        }
        commitInfo.value.title = title
        showCommitDlg.value = true
        reject(new Error('需要显示审批弹窗'))
      } else {
        resolve()
      }
    })
  }

  /**
   * 启动流程（需要子组件实现）
   * @param operation - 操作类型
   * @param formData - 表单数据
   * @param copyItemList - 抄送列表
   */
  function startImpl(
    operation: FlowOperation,
    formData: Record<string, any>,
    copyItemList: Record<string, any>[]
  ): void {
    showToast({
      type: 'fail',
      message: '当前流程并未实现启动功能，请联系管理员！'
    })
  }

  /**
   * 流程处理操作（需要子组件实现）
   * @param operation - 操作类型
   */
  function submitImpl(operation: FlowOperation): void {
    showToast({
      type: 'fail',
      message: '当前流程并未实现处理功能，请联系管理员！'
    })
  }

  /**
   * 获取表单数据（需要子组件实现）
   * @returns Promise
   */
  async function getMasterData(): Promise<void> {
    return Promise.resolve()
  }

  return {
    submitConsign,
    handlerClose,
    initFormData,
    preHandlerOperation,
    startImpl,
    submitImpl,
    getMasterData,
    processInstanceId,
    taskId,
    dialogParams,
    observer,
    refreshParentCachedPage,
    commitInfo,
    showCommitDlg
  }
}