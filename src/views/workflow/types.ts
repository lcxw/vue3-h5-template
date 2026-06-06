/**
 * 流程相关类型定义
 */

/**
 * 流程操作类型
 */
export interface FlowOperation {
  id: string
  type: string
  label: string
  latestApprovalStatus?: number
  multiSignAssignee?: {
    assigneeType?: string
    assigneeList?: string[]
  }
}

/**
 * 提交信息
 */
export interface CommitInfo {
  title?: string
  operation?: FlowOperation
  processInstanceId?: string
  taskId?: string
  formData?: Record<string, any>
  finishedInfo?: Record<string, any>
  copyItemList?: Record<string, any>[]
}

/**
 * 任务详情数据
 */
export interface TaskDetailsData {
  processInstanceId?: string
  processDefinitionKey?: string
  processDefinitionId?: string
  taskId?: string
  taskKey?: string
  formId?: string
  routerName?: string
  readOnly?: boolean
  flowEntryName?: string
  processInstanceInitiator?: string
  headImageUrl?: string
  taskName?: string
  flowStatus?: number
  showWorkFlowForm?: boolean
  isRuntime?: boolean
  isDraft?: boolean
  messageId?: string
  operationList?: FlowOperation[]
  variableList?: Record<string, any>[]
}

/**
 * 卡片数据
 */
export interface CardData {
  title: string
  subTitle: string[]
}

/**
 * 流程任务评论
 */
export interface FlowTaskComment {
  createUsername?: string
  createTime?: string
  taskName?: string
  taskComment?: string
  approvalType?: string
  headImageUrl?: string
  showNextTaskFlow?: boolean
}

/**
 * 抄送项
 */
export interface CopyItem {
  type: string
  id: string
  name?: string
  headImageUrl?: string
}

/**
 * 任务卡片数据
 */
export interface TaskCardData {
  id?: string
  processDefinitionName?: string
  processDefinitionKey?: string
  processDefinitionId?: string
  processInstanceId?: string
  taskId?: string
  taskName?: string
  workOrderCode?: string
  taskStartTime?: string
  createTime?: string
  endTime?: string
  startTime?: string
  showName?: string
  headImageUrl?: string
  flowStatus?: number
  isDraft?: boolean
  approvalType?: string
  name?: string
}