<template>
  <div class="task-details-flow">
    <div class="van-steps van-steps--vertical">
      <div class="van-steps__items">
        <div
          class="van-hairline van-step van-step--vertical"
          v-for="(item, index) in flowTaskCommentListReverse"
          :key="index"
        >
          <div class="van-step__title">
            <p class="step-title">{{ item.createUsername }}</p>
            <div class="steps-item-desc">
              <div class="steps-item-desc-ctn">
                <span>{{ item.showNextTaskFlow ? '待处理' : item.taskName }}</span>
                <span class="steps-item-desc-ctn-time">{{ item.createTime }}</span>
              </div>
              <div v-if="item.taskComment" class="steps-item-desc-operation">
                <span>{{ item.taskComment }}</span>
              </div>
            </div>
          </div>
          <div class="van-step__circle-container">
            <div class="steps-item-icon">
              <img :src="item.headImageUrl" alt="" class="u-image" />
              <div class="steps-item-startIcon">
                <div
                  :class="['mobile-font', getOperationIconName(item.approvalType) === 'success' ? 'icon-success' : 'icon-close']"
                  style="font-size: 12px; opacity: 1; z-index: 999;"
                  :style="{ color: getOperationBakgroundColor(item.approvalType) }"
                />
              </div>
            </div>
          </div>
          <div class="van-step__line"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 审批记录组件
 * 用于展示流程任务的审批历史记录，包括审批人、审批时间、审批意见等
 */
import { ref, onMounted, computed } from 'vue'
import { FlowOperationController } from '@/api/FlowController/FlowOperationController'
import { getHeadImageUrl } from '@/utils/index'
import type { FlowTaskComment } from '../types'

/**
 * 组件属性定义
 */
interface Props {
  /** 流程实例ID */
  processInstanceId?: string
  /** 流程定义ID */
  processDefinitionId?: string
}

const props = defineProps<Props>()

/** 审批记录列表 */
const stepsList = ref<FlowTaskComment[]>([])
/** 反转后的审批记录列表 */
const flowTaskCommentListReverse = ref<FlowTaskComment[]>([])
/** 未完成任务映射 */
const unfinishedTaskMap = ref<Record<string, string>>({})
/** 未完成任务集合 */
const unfinishedTaskSet = ref<string[]>([])

/**
 * 从XML中获取活动名称
 * @param xmlString - XML字符串
 * @param activityId - 活动ID
 * @returns 活动名称或null
 */
function getActivityName(xmlString: string, activityId: string): string | null {
  try {
    // 解析 XML
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml')

    // 定义 BPMN 命名空间
    const ns = 'http://www.omg.org/spec/BPMN/20100524/MODEL'

    // 获取所有 userTask
    const tasks = xmlDoc.getElementsByTagNameNS(ns, 'userTask')

    // 遍历查找目标 id
    for (const task of tasks) {
      if (task.getAttribute('id') === activityId) {
        return task.getAttribute('name') || null
      }
    }

    // 没找到则返回 null
    return null
  } catch (err) {
    console.error('解析失败:', err)
    return null
  }
}

/**
 * 获取下一个任务信息
 */
function getNextTaskInfo(): void {
  if (props.processInstanceId == null || props.processInstanceId === '') {
    return
  }

  const params = {
    processInstanceId: props.processInstanceId
  }

  FlowOperationController.viewHighlightFlowData(params)
    .then((res) => {
      unfinishedTaskMap.value = res.unfinishedTaskMap
      unfinishedTaskSet.value = res.unfinishedTaskSet

      // 多个节点待验证
      if (unfinishedTaskSet.value.length > 0) {
        const promises = unfinishedTaskSet.value.map((taskKey, index) => {
          return FlowOperationController.viewTaskUserInfo({
            processDefinitionId: props.processDefinitionId,
            processInstanceId: props.processInstanceId,
            taskId: unfinishedTaskMap.value[taskKey],
            historic: false
          }).then((persons) => {
            if (persons) {
              return FlowOperationController.viewProcessBpmn({
                processDefinitionId: props.processDefinitionId
              }).then((res) => {
                // 当前流程实例xml
                const taskName = getActivityName(res.data, unfinishedTaskSet.value[index]) || ''
                return {
                  taskName,
                  createUsername: persons.map((item: any) => item.showName).join(',')
                }
              })
            }
            return null
          })
        })

        Promise.all(promises).then((results) => {
          const tempResList = results.filter(Boolean).map((item: any) => ({
            showNextTaskFlow: true,
            taskName: item.taskName,
            createUsername: item.createUsername
          }))

          flowTaskCommentListReverse.value = JSON.parse(
            JSON.stringify(stepsList.value)
          ).reverse()
          flowTaskCommentListReverse.value.unshift(...tempResList)
        })
      } else {
        flowTaskCommentListReverse.value = JSON.parse(
          JSON.stringify(stepsList.value)
        ).reverse()
      }
    })
    .catch((e) => {
      console.warn(e)
    })
}

/**
 * 获取审批记录列表
 */
function getTaskFlowList(): void {
  FlowOperationController.listFlowTaskComment({
    processInstanceId: props.processInstanceId
  }).then((res) => {
    stepsList.value = res
    for (const item of stepsList.value) {
      item.headImageUrl = getHeadImageUrl(item as any) ?? undefined
    }
    getNextTaskInfo()
  }).catch((e) => {
    console.error(e)
  })
}

/**
 * 获取操作标签类型
 * @param type - 操作类型
 * @returns 标签类型
 */
function getOperationTagType(type: string | undefined): string {
  switch (type) {
    case 'agree':
    case 'multi_agree':
    case 'set_assignee':
      return 'success'
    case 'refuse':
    case 'multi_refuse':
      return 'warning'
    case 'stop':
    case 'reject':
    case 'rejectToStart':
    case 'rejectToTask':
    case 'revoke':
      return 'danger'
    default:
      return 'primary'
  }
}

/**
 * 获取操作背景颜色
 * @param type - 操作类型
 * @returns 背景颜色
 */
function getOperationBakgroundColor(type: string | undefined): string {
  const temp = getOperationTagType(type)
  switch (temp) {
    case 'success':
      return '#00B042'
    case 'danger':
      return '#EE0A24'
    default:
      return '#FF976A'
  }
}

/**
 * 获取操作图标名称
 * @param type - 操作类型
 * @returns 图标名称
 */
function getOperationIconName(type: string | undefined): string {
  const temp = getOperationTagType(type)
  switch (temp) {
    case 'success':
      return 'success'
    case 'danger':
      return 'close'
    default:
      return 'close'
  }
}

onMounted(() => {
  getTaskFlowList()
})
</script>

<style lang="less">
// common
@padding-base: 4px;
@padding-xs: @padding-base * 2;
@padding-sm: @padding-base * 3;
@padding-md: @padding-base * 4;
@padding-lg: @padding-base * 6;
@padding-xl: @padding-base * 8;
@gray-3: #ebedf0;
@gray-6: #969799;
@gray-8: #323233;
@green: #07c160;
@white: #fff;
@text-color: @gray-8;
// Font
@font-size-xs: 10px;
@font-size-sm: 12px;
@font-size-md: 14px;
@font-size-lg: 16px;
@font-weight-bold: 500;
@line-height-xs: 14px;
@line-height-sm: 18px;
@line-height-md: 20px;
@line-height-lg: 22px;
@border-color: @gray-3;
@animation-duration-base: 0.3s;
// Step
@step-text-color: @gray-6;
@step-active-color: @green;
@step-process-text-color: @text-color;
@step-font-size: @font-size-md;
@step-line-color: @border-color;
@step-finish-line-color: @green;
@step-finish-text-color: @text-color;
@step-icon-size: 12px;
@step-circle-size: 5px;
@step-circle-color: @gray-6;
@step-horizontal-title-font-size: @font-size-sm;

.van-steps {
  overflow: hidden;
  background-color: #fff;

  &--horizontal {
    padding: 10px 10px 0;

    .van-steps__items {
      position: relative;
      display: flex;
      margin: 0 0 10px;
      padding-bottom: 22px;
    }
  }

  &--vertical {
    padding: 0 0 0 @padding-xl;
  }

  .van-step {
    position: relative;
    flex: 1;
    color: @step-text-color;
    font-size: @step-font-size;

    &__circle {
      display: block;
      width: @step-circle-size;
      height: @step-circle-size;
      background-color: @step-circle-color;
      border-radius: 50%;
    }

    &__line {
      position: absolute;
      background-color: @step-line-color;
      transition: background-color @animation-duration-base;
    }

    &--horizontal {
      float: left;

      &:first-child {
        .van-step__title {
          margin-left: 0;
          transform: none;
        }
      }

      &:last-child {
        position: absolute;
        right: 1px;
        width: auto;

        .van-step__title {
          margin-left: 0;
          transform: none;
        }

        .van-step__circle-container {
          right: -9px;
          left: auto;
        }
      }

      .van-step__circle-container {
        position: absolute;
        top: 30px;
        left: -@padding-xs;
        z-index: 1;
        padding: 0 @padding-xs;
        background-color: @white;
        transform: translateY(-50%);
      }

      .van-step__title {
        display: inline-block;
        margin-left: 3px;
        font-size: @step-horizontal-title-font-size;
        transform: translateX(-50%);

        @media (max-width: 321px) {
          font-size: @step-horizontal-title-font-size - 1px;
        }
      }

      .van-step__line {
        top: 30px;
        left: 0;
        width: 100%;
        height: 1px;
        border: 1px dashed #C1C2C4;
      }

      .van-step__icon {
        display: block;
        font-size: @step-icon-size;
      }

      .van-step--process {
        color: @step-process-text-color;
      }
    }

    &--vertical {
      display: block;
      float: none;
      padding: 6px 10px 10px 0;
      line-height: @line-height-sm;

      &:not(:last-child)::after {
        border-bottom-width: 1px;
      }

      .van-step__circle-container {
        position: absolute;
        top: 19px;
        left: -15px;
        z-index: 1;
        font-size: @step-icon-size;
        line-height: 1;
        transform: translate(-50%, -50%);
      }

      .van-step__line {
        top: 16px;
        left: -15px;
        width: 1px;
        height: 100%;
        border: 1px dashed #C1C2C4;
      }
    }

    &:last-child {
      .van-step__line {
        width: 0;
        border: none;
      }
    }

    &--finish {
      color: @step-finish-text-color;

      .van-step__circle,
      .van-step__line {
        // background-color: @step-finish-line-color;
      }
    }

    &__icon,
    &__title {
      transition: color @animation-duration-base;

      &--active,
      &--finish {
        color: @step-active-color;
      }
    }
  }
}

.step-title {
  margin-left: 30px;
  font-size: 14px;
  font-weight: bold;
  color: #333333;
}

.steps-item-desc {
  margin-left: 30px;
}

.steps-item-desc-ctn {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0;

  span {
    font-size: 12px;
    color: #999;
    font-weight: 400;
  }

  .steps-item-desc-ctn-time {
    font-size: 12px;
    color: #999;
  }
}

.steps-item-desc-operation {
  width: 100%;
  margin: 5px 0;
  padding: 0 5px;
  background: #F6F7F9;
  border-radius: 4px;
  display: flex;
  align-items: center;

  span {
    width: 100%;
    font-size: 14px;
    color: #666666;
    font-weight: 400;
    padding: 5px;
    overflow-wrap: break-word;
  }
}

.steps-item-icon {
  width: 42px;
  height: 42px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  position: relative;

  img {
    width: 80%;
    height: 80%;
  }
}

.steps-item-startIcon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  position: absolute;
  bottom: -1px;
  left: calc(100% - 15px);
  border: 2px solid #ffffff;
  background-color: #ffffff;
}

.task-details-flow {
  height: 100%;
  margin: 0 16px 16px 16px;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 8px;
}

.icon-success {
  background-color: #00B042;
  border-radius: 50%;
}

.icon-close {
  background-color: #EE0A24;
  border-radius: 50%;
}
</style>