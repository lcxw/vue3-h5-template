<template>
  <div class="task-commit-wrapper" style="padding: 16px; height: 100vh;">
    <!-- 顶部导航栏 -->
    <div
      class="nav-header"
      style="position: fixed; top: 0; left: 0; right: 0; z-index: 9999; background-color: #ffffff; border-bottom: 1px solid #ebedf0;"
    >
      <div class="nav-bar">
        <van-icon name="arrow-left" size="20" @click="goBack" />
        <span class="text">审批</span>
      </div>
    </div>
    <div class="nav-placeholder"></div>

    <!-- 表单内容 -->
    <van-form style="margin: 16px 0; height: calc(100vh - 140px);">
      <div style="background-color: #fff;">
        <!-- 驳回节点选择 -->
        <van-field
          v-if="operation.type === 'free_jump'"
          v-model="formData.targetTaskKey"
          label="驳回节点"
          placeholder="请选择跳转任务节点"
          required
          is-link
          readonly
          @click="showJumpTaskPicker = true"
        />
        <van-popup v-model:show="showJumpTaskPicker" position="bottom" round>
          <van-picker
            :columns="jumpTaskList"
            @confirm="onJumpTaskConfirm"
            @cancel="showJumpTaskPicker = false"
          />
        </van-popup>

        <!-- 驳回到历史任务节点选择 -->
        <van-field
          v-if="processInstanceId != null && taskId != null && operation.type === 'rejectToTask'"
          v-model="formData.targetTaskKey"
          label="驳回节点"
          placeholder="请选择驳回节点"
          required
          is-link
          readonly
          @click="showRejectTaskPicker = true"
        />
        <van-popup v-model:show="showRejectTaskPicker" position="bottom" round>
          <van-picker
            :columns="taskWidgets"
            @confirm="onRejectTaskConfirm"
            @cancel="showRejectTaskPicker = false"
          />
        </van-popup>

        <!-- 指派用户选择 -->
        <van-field
          v-if="showAssignSelect || operation.type === 'free_jump'"
          v-model="userNameDisplay"
          label="指派用户"
          placeholder="请选择指派用户"
          is-link
          readonly
          @click="showUserPicker = true"
        />
        <van-popup v-model:show="showUserPicker" position="bottom" round style="height: 60%;">
          <UserSelect
            :value="formData.assignee"
            :props="{ label: 'showName', value: 'userId' }"
            @change="onUserSelectChange"
          />
        </van-popup>

        <!-- 减签用户选择 -->
        <van-field
          v-if="operation.type === 'multi_minus_sign'"
          v-model="formData.assignee"
          label="减签用户"
          placeholder="请选择减签用户"
          required
          is-link
          readonly
          @click="showMinusSignPicker = true"
        />
        <van-popup v-model:show="showMinusSignPicker" position="bottom" round>
          <van-picker
            :columns="multiSignAssigneess"
            @confirm="onMinusSignConfirm"
            @cancel="showMinusSignPicker = false"
          />
        </van-popup>

        <!-- 审批意见 -->
        <van-field
          v-if="['multi_consign', 'multi_minus_sign', 'multi_sign'].indexOf(operation.type) === -1"
          v-model="formData.message"
          label="审批意见"
          type="textarea"
          rows="2"
          autosize
          maxlength="50"
          show-word-limit
          required
        />

        <!-- 常用语选择 -->
        <van-field
          v-model="selectedPhrase"
          label="常用语"
          placeholder="点击选择常用语"
          is-link
          readonly
          @click="showPhrasePicker = true"
        />
        <van-popup v-model:show="showPhrasePicker" position="bottom" round>
          <van-picker
            :columns="phraseList"
            @confirm="onPhraseConfirm"
            @cancel="showPhrasePicker = false"
          />
        </van-popup>
      </div>
    </van-form>

    <!-- 底部按钮 -->
    <div class="footer-buttons">
      <van-button type="primary" block @click="onSubmitClick">确定</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 审批提交弹窗组件
 * 用于处理流程任务的审批提交，包括审批意见、指派用户、驳回节点等
 */
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { FlowOperationController } from '@/api/FlowController/FlowOperationController'
import { SysConfController, CommonPhrasesController } from '@/api'
import { SysFlowTaskOperationType } from '@/staticDict/flowStaticDict'
import UserSelect from '@/views/components/UserSelect/index.vue'
import type { FlowOperation } from '../types'

/**
 * 组件属性定义
 */
interface Props {
  /** 弹窗标题 */
  title?: string
  /** 操作类型 */
  operation: FlowOperation
  /** 流程实例ID */
  processInstanceId?: string
  /** 流程定义ID */
  processDefinitionId?: string
  /** 任务ID */
  taskId?: string
  /** 已完成信息 */
  finishedInfo?: Record<string, any>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  /** 关闭弹窗事件 */
  (e: 'close', success: boolean, data?: Record<string, any>): void
}>()

const router = useRouter()

/** 表单数据 */
const formData = ref({
  message: '同意。',
  assignee: undefined as string | undefined,
  targetTaskKey: undefined as string | undefined
})

/** 用户名列表 */
const userName = ref<string[]>([])
/** 用户名显示文本（可写，用于 v-model 绑定） */
const userNameDisplay = ref('')

/** 弹窗显示状态 */
const showJumpTaskPicker = ref(false)
const showRejectTaskPicker = ref(false)
const showUserPicker = ref(false)
const showMinusSignPicker = ref(false)
const showPhrasePicker = ref(false)

/**
 * 用户选择变更
 * @param val - 选中的用户
 */
function onUserSelectChange(val: any): void {
  if (val) {
    formData.assignee = val.userId || val
    userNameDisplay.value = val.showName || val.userId || ''
    showUserPicker.value = false
  }
}

/** 常用语列表 */
const phraseList = ref<string[]>([])
/** 选中的常用语 */
const selectedPhrase = ref('')

/** 跳转任务节点列表 */
const jumpTaskList = ref<{ text: string; value: string }[]>([])
/** 驳回任务节点列表 */
const taskWidgets = ref<{ text: string; value: string }[]>([])
/** 减签用户列表 */
const multiSignAssigneess = ref<{ text: string; value: string }[]>([])

/**
 * 是否显示指派用户选择
 */
const showAssignSelect = computed(() => {
  let showAssignSelectFlag = false

  // 如果是会签操作，判断是否在流程内设置了会签人
  if (props.operation.type === SysFlowTaskOperationType.getById('multi_sign')?.id) {
    showAssignSelectFlag = !props.operation.multiSignAssignee
      || !Array.isArray(props.operation.multiSignAssignee.assigneeList)
      || props.operation.multiSignAssignee.assigneeList.length <= 0
  }

  const assignTypes = [
    SysFlowTaskOperationType.getById('transfer')?.id,
    SysFlowTaskOperationType.getById('multi_consign')?.id,
    SysFlowTaskOperationType.getById('multi_before_consign')?.id,
    SysFlowTaskOperationType.getById('multi_after_consign')?.id,
    SysFlowTaskOperationType.getById('set_assignee')?.id
  ]

  return assignTypes.includes(props.operation.type) || showAssignSelectFlag
})

/**
 * 获取常用意见列表
 */
function getPhraseList(): void {
  const userInfoStr = localStorage.getItem('userInfo')
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null

  phraseList.value = []

  SysConfController.getSysConf({ confCode: 'commonExpressions' }).then((val) => {
    CommonPhrasesController.list({
      commonPhrasesDtoFilter: { ownerUserId: userInfo?.userId }
    }).then((res) => {
      phraseList.value = res.dataList.map((item: any) => item.phraseContent)
    }).catch(() => {
    }).finally(() => {
      if (val.conf) {
        const confData = JSON.parse(val.conf)
        confData.forEach((item: any) => {
          if (item.content) phraseList.value.push(item.content)
        })
      }
    })
  }).catch(() => {
  })
}

/**
 * 返回上一页
 */
function goBack(): void {
  emit('close', false)
}

/**
 * 提交审批
 */
function onSubmitClick(): void {
  if (Array.isArray(userName.value) && userName.value.length > 0) {
    formData.value.assignee = userName.value.join(',')
  }
  emit('close', true, formData.value)
}

/**
 * 跳转任务节点确认
 */
function onJumpTaskConfirm(value: { text: string; value: string }): void {
  formData.value.targetTaskKey = value.value
  showJumpTaskPicker.value = false
}

/**
 * 驳回任务节点确认
 */
function onRejectTaskConfirm(value: { text: string; value: string }): void {
  formData.value.targetTaskKey = value.value
  showRejectTaskPicker.value = false
}

/**
 * 减签用户确认
 */
function onMinusSignConfirm(value: { text: string; value: string }): void {
  formData.value.assignee = value.value
  showMinusSignPicker.value = false
}

/**
 * 常用语确认
 */
function onPhraseConfirm(value: string): void {
  formData.value.message = value
  selectedPhrase.value = value
  showPhrasePicker.value = false
}

/**
 * 加载驳回候选任务列表
 */
function loadTaskWidgetDropdownData(): void {
  if (!props.processInstanceId || !props.taskId) return

  FlowOperationController.listRejectCandidateUserTask({
    processInstanceId: props.processInstanceId,
    taskId: props.taskId
  }).then((res) => {
    taskWidgets.value = res.map((item: any) => ({
      text: item.showName,
      value: item.taskKey
    }))
  }).catch((e) => {
    console.error(e)
  })
}

/**
 * 加载减签用户列表
 */
function listMultiSignAssigneesDropdownData(): void {
  if (!props.processInstanceId || !props.taskId) return

  FlowOperationController.listMultiSignAssignees({
    processInstanceId: props.processInstanceId,
    taskId: props.taskId
  }).then((res) => {
    const data = res.sort((val1: any, val2: any) => {
      return val1.approved === val2.approved ? 0 : (val1.approved ? 1 : -1)
    })

    multiSignAssigneess.value = data.map((item: any) => ({
      text: item.showName,
      value: item.assignee
    }))
  }).catch((e) => {
    console.error(e)
  })
}

/**
 * 加载所有用户任务列表
 */
function loadAllUserTask(): void {
  if (!props.processDefinitionId) return

  FlowOperationController.listAllUserTask({
    processDefinitionId: props.processDefinitionId
  }).then((res) => {
    jumpTaskList.value = res.map((item: any) => ({
      text: item.taskName,
      value: item.taskKey
    }))
  }).catch((e) => {
    console.error(e)
  })
}

onMounted(() => {
  getPhraseList()

  // 减签操作
  if (props.operation.type === SysFlowTaskOperationType.getById('multi_minus_sign')?.id) {
    listMultiSignAssigneesDropdownData()
  }

  // 驳回到历史任务
  if (props.processInstanceId != null && props.taskId != null
    && props.operation.type === SysFlowTaskOperationType.getById('rejectToTask')?.id) {
    loadTaskWidgetDropdownData()
  }

  // 自由跳
  if (props.processDefinitionId != null
    && props.operation.type === SysFlowTaskOperationType.getById('free_jump')?.id) {
    loadAllUserTask()
  }
})
</script>

<style lang="less" scoped>
.nav-header {
  padding: 10px 16px;
}

.nav-bar {
  display: flex;
  flex-direction: row;
  align-items: center;

  .text {
    flex: 1;
    text-align: center;
    color: #323233;
    font-weight: 500;
    font-size: 16px;
  }
}

.nav-placeholder {
  height: 44px;
}

.footer-buttons {
  position: fixed;
  bottom: 16px;
  left: 16px;
  right: 16px;
}
</style>