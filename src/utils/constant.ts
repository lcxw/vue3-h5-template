/** 流程抄送类型 */
export const SysFlowCopyForType: Array<{ id: string; text: string }> = [
  { id: 'user', text: '抄送人' },
  { id: 'dept', text: '抄送部门' },
  { id: 'role', text: '抄送角色' },
  { id: 'deptPostLeader', text: '审批人部门领导' },
  { id: 'upDeptPostLeader', text: '审批人上级部门领导' },
  { id: 'allDeptPost', text: '抄送岗位' },
  { id: 'selfDeptPost', text: '审批人部门岗位' },
  { id: 'siblingDeptPost', text: '审批人同级部门岗位' },
  { id: 'upDeptPost', text: '审批人上级部门岗位' },
  { id: 'deptPost', text: '指定部门岗位' }
]

/** 流程任务操作类型 */
export const SysFlowTaskOperationType: Array<{ id: string; name: string; symbol: string }> = [
  { id: 'agree', name: '同意', symbol: 'AGREE' },
  { id: 'refuse', name: '拒绝', symbol: 'REFUSE' },
  { id: 'reject', name: '驳回', symbol: 'REJECT' },
  { id: 'rejectToStart', name: '驳回到起点', symbol: 'REJECT_TO_START' },
  { id: 'rejectToTask', name: '驳回到历史任务', symbol: 'REJECT_TO_TASK' },
  { id: 'revoke', name: '撤销', symbol: 'REVOKE' },
  { id: 'transfer', name: '转办', symbol: 'TRANSFER' },
  { id: 'multi_consign', name: '加签', symbol: 'CO_SIGN' },
  { id: 'multi_minus_sign', name: '减签', symbol: 'SIGN_REDUCTION' },
  { id: 'save', name: '保存', symbol: 'SAVE' },
  { id: 'stop', name: '终止', symbol: 'STOP' },
  { id: 'multi_sign', name: '会签', symbol: 'MULTI_SIGN' },
  { id: 'multi_agree', name: '同意（会签）', symbol: 'MULTI_AGREE' },
  { id: 'multi_refuse', name: '拒绝（会签）', symbol: 'MULTI_REFUSE' },
  { id: 'multi_abstain', name: '弃权（会签）', symbol: 'MULTI_ABSTAIN' },
  { id: 'set_assignee', name: '指定审批人', symbol: 'SET_ASSIGNEE' },
  { id: 'intervene', name: '干预', symbol: 'INTERVENE' },
  { id: 'free_jump', name: '自由跳', symbol: 'FREE_JUMP' },
  { id: 'revive', name: '流程复活', symbol: 'REVIVE' },
  { id: 'timeout_auto_complete', name: '超时自动审批', symbol: 'TIMEOUT_AUTO_COMPLETE' },
  { id: 'empty_user_auto_complete', name: '空审批人自动审批', symbol: 'EMPTY_USER_AUTO_COMPLETE' },
  { id: 'empty_user_auto_reject', name: '空审批人自动退回', symbol: 'EMPTY_USER_AUTO_REJECT' },
  { id: 'multi_before_consign', name: '前加签（串行会签）', symbol: 'BFORE_CONSIGN' },
  { id: 'multi_after_consign', name: '后加签（串行会签）', symbol: 'AFTER_CONSIGN' }
]
