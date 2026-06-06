<template>
  <div class="task-card">
    <div class="card-main-box">
      <div class="content">
        <span class="title">{{ cardData.title }}</span>
        <span class="sub-title" v-for="subTitle in cardData.subTitle" :key="subTitle">
          {{ subTitle }}
        </span>
      </div>
      <van-image v-if="statusImage" class="process-status" width="134" height="106" :src="statusImage" />
    </div>
    <slot name="menu" />
  </div>
</template>

<script setup lang="ts">
/**
 * 任务卡片组件
 * 用于展示流程任务的基本信息，包括标题、子标题和流程状态图标
 */
import { computed } from 'vue'
import { SysFlowWorkOrderStatus } from '@/staticDict/flowStaticDict'
import type { CardData } from '../types'

// 状态图标使用 public 目录下的静态资源
const statusImg = '/static/icon/approval-icon.png'
const passImg = '/static/icon/pass-icon.png'
const refuseImg = '/static/icon/refuse-icon.png'
const draftImg = '/static/icon/draft-icon.png'
const cancelImg = '/static/icon/cancel-icon.png'
const stoppedImg = '/static/icon/stopped-icon.png'

/**
 * 组件属性定义
 */
interface Props {
  /** 卡片数据 */
  cardData: CardData
  /** 流程状态 */
  flowStatus?: number
  /** 完成时是否同意 */
  finishedWithAgree?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  finishedWithAgree: true
})

/**
 * 根据流程状态计算显示的状态图标
 * @returns 状态图标URL或null
 */
const statusImage = computed(() => {
  switch (props.flowStatus) {
    case SysFlowWorkOrderStatus.getById('APPROVING')?.id:
    case SysFlowWorkOrderStatus.getById('SUBMITED')?.id:
      // 审批中
      return statusImg
    case SysFlowWorkOrderStatus.getById('STOPPED')?.id:
      // 终止
      return stoppedImg
    case SysFlowWorkOrderStatus.getById('REFUSED')?.id:
      // 拒绝
      return refuseImg
    case SysFlowWorkOrderStatus.getById('FINISHED')?.id:
      // 通过
      return props.finishedWithAgree ? passImg : refuseImg
    case SysFlowWorkOrderStatus.getById('CANCEL')?.id:
      // 撤销
      return cancelImg
    case SysFlowWorkOrderStatus.getById('DRAFT')?.id:
      // 草稿
      return draftImg
    default:
      return null
  }
})
</script>

<style scoped>
.task-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
}

.card-main-box {
  display: flex;
}

.card-main-box .content {
  flex-grow: 1;
  flex-shrink: 1;
  width: 100px;
}

.card-main-box .process-status {
  flex-grow: 0;
  flex-shrink: 0;
  margin-left: 15px;
  margin-top: 15px;
}

.card-main-box .content .title {
  display: block;
  font-weight: bold;
  color: #333333;
  line-height: 20px;
  height: 20px;
  font-size: 16px;
  margin-bottom: 8px;
}

.card-main-box .content .sub-title {
  display: block;
  color: #666666;
  line-height: 20px;
  height: 20px;
  font-size: 14px;
  font-weight: 400;
  margin-top: 4px;
  /** 单行省略号 */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>