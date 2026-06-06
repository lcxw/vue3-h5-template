/**
 * workflow 模块导出
 */

export { default as EditCopyForItem } from './components/copyForSelect/editCopyForItem.vue'

export { default as CopyForSelect } from './components/copyForSelect/index.vue'

// components
export { default as TaskCard } from './components/taskCard.vue'
export { default as TaskCommentList } from './components/taskCommentList.vue'
export { default as TaskCommit } from './components/taskCommit.vue'
// composables
export * from './composables/useFlow'
export { default as FormMyApprovedTask } from './formRuntimeTask/formMyApprovedTask.vue'

export { default as FormMyHistoryTask } from './formRuntimeTask/formMyHistoryTask.vue'
// pages
export { default as FormMyTask } from './formRuntimeTask/formMyTask.vue'
export { default as HandleFlowTask } from './handleFlowTask/index.vue'
// types
export * from './types'
