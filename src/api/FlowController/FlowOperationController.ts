import { http } from '@/utils/http'

/**
 * 流程操作控制器
 * 处理流程实例的启动、任务提交、审批、驳回等核心流程操作
 */
export class FlowOperationController {
  /**
   * 保存草稿
   */
  static startAndSaveDraft(params: Record<string, any>, axiosOption?: { processDefinitionKey?: string }): Promise<any> {
    let url = '/admin/flow/flowOnlineOperation/startAndSaveDraft'
    if (axiosOption?.processDefinitionKey) {
      url += `/${axiosOption.processDefinitionKey}`
    }
    return http.post(url, params)
  }

  /**
   * 获取在线表单工作流草稿数据
   */
  static viewOnlineDraftData(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowOnlineOperation/viewDraftData', { params })
  }

  /**
   * 启动流程实例并且提交表单信息
   */
  static startAndTakeUserTask(params: Record<string, any>, axiosOption?: { processDefinitionKey?: string }): Promise<any> {
    let url = '/admin/flow/flowOnlineOperation/startAndTakeUserTask'
    if (axiosOption?.processDefinitionKey) {
      url += `/${axiosOption.processDefinitionKey}`
    }
    else {
      // 从流程设计里启动
      url = '/admin/flow/flowOnlineOperation/startPreview'
    }
    return http.post(url, params)
  }

  /**
   * 获得流程以及工单信息
   */
  static listWorkOrder(params: Record<string, any>, axiosOption?: { processDefinitionKey?: string }): Promise<any> {
    let url = '/admin/flow/flowOnlineOperation/listWorkOrder'
    if (axiosOption?.processDefinitionKey) {
      url += `/${axiosOption.processDefinitionKey}`
    }
    return http.post(url, params)
  }

  /**
   * 提交用户任务数据
   */
  static submitUserTask(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowOnlineOperation/submitUserTask', params)
  }

  /**
   * 获取历史流程数据
   */
  static viewHistoricProcessInstance(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowOnlineOperation/viewHistoricProcessInstance', { params })
  }

  /**
   * 获取用户任务数据
   */
  static viewUserTask(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowOnlineOperation/viewUserTask', { params })
  }

  /**
   * 获取在线表单工作流以及工作流下表单列表
   */
  static listFlowEntryForm(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowOnlineOperation/listFlowEntryForm', { params })
  }

  /**
   * 获得草稿信息
   */
  static viewDraftData(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowOperation/viewDraftData', { params })
  }

  /**
   * 撤销工单
   */
  static cancelWorkOrder(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowOperation/cancelWorkOrder', params)
  }

  /**
   * 多实例加签
   */
  static submitConsign(params: Record<string, any>): Promise<any> {
    if (params.before == null) {
      // 会签前后加签
      return http.post('/admin/flow/flowOperation/submitConsign', params)
    }
    else {
      // 串行会签前后加签
      return http.post('/admin/flow/flowOperation/submitSequenceConsign', params)
    }
  }

  /**
   * 已办任务列表
   */
  static listHistoricTask(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowOperation/listHistoricTask', params)
  }

  /**
   * 获取已办任务信息
   */
  static viewHistoricTaskInfo(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowOperation/viewHistoricTaskInfo', { params })
  }

  /**
   * 仅启动流程实例
   */
  static startOnly(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowOperation/startOnly', params)
  }

  /**
   * 获得流程定义初始化用户任务信息
   */
  static viewInitialTaskInfo(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowOperation/viewInitialTaskInfo', { params })
  }

  /**
   * 获取待办任务信息
   */
  static viewRuntimeTaskInfo(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowOperation/viewRuntimeTaskInfo', { params })
  }

  /**
   * 获取流程实例审批历史
   */
  static listFlowTaskComment(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowOperation/listFlowTaskComment', { params })
  }

  /**
   * 获取历史任务信息
   */
  static viewInitialHistoricTaskInfo(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowOperation/viewInitialHistoricTaskInfo', { params })
  }

  /**
   * 获取所有待办任务
   */
  static listRuntimeTask(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowOperation/listRuntimeTask', params)
  }

  /**
   * 获得流程实例审批路径
   */
  static viewHighlightFlowData(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowOperation/viewHighlightFlowData', { params })
  }

  /**
   * 获得流程实例的配置XML
   */
  static viewProcessBpmn(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowOperation/viewProcessBpmn', { params })
  }

  /**
   * 获得所有历史流程实例
   */
  static listAllHistoricProcessInstance(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowOperation/listAllHistoricProcessInstance', params)
  }

  /**
   * 获得当前用户历史流程实例
   */
  static listHistoricProcessInstance(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowOperation/listHistoricProcessInstance', params)
  }

  /**
   * 终止流程
   */
  static stopProcessInstance(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowOperation/stopProcessInstance', params)
  }

  /**
   * 删除流程实例
   */
  static deleteProcessInstance(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowOperation/deleteProcessInstance', params)
  }

  /**
   * 催办
   */
  static remindRuntimeTask(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowOperation/remindRuntimeTask', params)
  }

  /**
   * 催办消息列表
   */
  static listRemindingTask(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowMessage/listRemindingTask', params)
  }

  /**
   * 驳回
   */
  static rejectRuntimeTask(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowOperation/rejectRuntimeTask', params)
  }

  /**
   * 驳回到起点
   */
  static rejectToStartUserTask(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowOperation/rejectToStartUserTask', params)
  }

  /**
   * 撤销
   */
  static revokeHistoricTask(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowOperation/revokeHistoricTask', params)
  }

  /**
   * 抄送消息列表
   */
  static listCopyMessage(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowMessage/listCopyMessage', params)
  }

  /**
   * 消息个数
   */
  static getMessageCount(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowMessage/getMessageCount', { params })
  }

  /**
   * 待办任务数量
   */
  static countRuntimeTask(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowOperation/countRuntimeTask', params)
  }

  /**
   * 在线表单流程抄送消息数据
   */
  static viewOnlineCopyBusinessData(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowOnlineOperation/viewCopyBusinessData', { params })
  }

  /**
   * 静态表单流程抄送消息数据
   */
  static viewCopyBusinessData(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowOperation/viewCopyBusinessData', { params })
  }

  /**
   * 获取指定任务处理人列表
   */
  static viewTaskUserInfo(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowOperation/viewTaskUserInfo', { params })
  }

  /**
   * 获取驳回历史任务列表
   */
  static listRejectCandidateUserTask(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowOperation/listRejectCandidateUserTask', { params })
  }

  /**
   * 获取多实例任务中会签人员列表
   */
  static listMultiSignAssignees(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowOperation/listMultiSignAssignees', { params })
  }

  /**
   * 流程干预
   */
  static interveneRuntimeTask(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowOperation/interveneRuntimeTask', params)
  }

  /**
   * 自由跳
   */
  static freeJump(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowOperation/freeJumpTo', params)
  }

  /**
   * 数据补偿
   */
  static fixBusinessData(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowOnlineOperation/fixBusinessData', params)
  }

  /**
   * 获取所有任务列表
   */
  static listAllUserTask(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowOperation/listAllUserTask', { params })
  }

  /**
   * 流程复活
   */
  static restart(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowOperation/revive', params)
  }

  /**
   * 获取用户任务信息
   */
  static viewTaskFormKey(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowOperation/viewTaskFormKey', { params })
  }
}
