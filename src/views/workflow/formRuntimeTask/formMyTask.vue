<script setup lang="ts">
import type { CardData, TaskCardData } from '../types'
/**
 * 我的待办任务页面
 * 展示当前用户的待办任务、已办任务和历史任务列表
 */
import { nextTick, onActivated, ref } from 'vue'
import { useRouter } from 'vue-router'
import { FlowOperationController } from '@/api/FlowController/FlowOperationController'
import { SysFlowTaskOperationType, SysFlowWorkOrderStatus } from '@/staticDict/flowStaticDict'
import { getHeadImageUrl } from '@/utils/index'
import TaskCard from '../components/taskCard.vue'
import FormMyApprovedTask from './formMyApprovedTask.vue'
import FormMyHistoryTask from './formMyHistoryTask.vue'

const router = useRouter()

/** 当前显示状态 */
const currentState = ref('daiban')
/** 搜索关键词 */
const searchString = ref('')
/** 消息状态 */
const messageStatus = ref('daiban')
/** 消息状态下拉列表 */
const messageStatusDropdownList = [
  { text: '待办', value: 'daiban' },
  { text: '已办', value: 'yiban' },
  { text: '已发', value: 'history' },
]

/** 加载状态 */
const loading = ref(false)
/** 加载完成状态 */
const finished = ref(false)
/** 数据列表 */
const dataList = ref<TaskCardData[]>([])
/** 当前页码 */
const currentPage = ref(0)
/** 总数量 */
const totalCount = ref(0)
/** 每页数量 */
const pageSize = 20

/** 已办任务组件引用 */
const approvedTaskRef = ref()
/** 历史任务组件引用 */
const historyTaskRef = ref()

/**
 * 加载更多数据
 * van-list 触发 @load 时会自动将 loading 设为 true
 * 这里直接发起请求，请求完成后将 loading 设为 false 即可
 */
function loadDataList(): void {
  // 如果数据已全部加载，直接结束
  if (finished.value) {
    loading.value = false
    return
  }
  // 计算下一页页码
  const nextPage = currentPage.value + 1
  doLoadData(nextPage)
}

/**
 * 执行数据加载
 * @param pageNum - 页码
 */
async function doLoadData(pageNum: number): Promise<void> {
  const params: Record<string, any> = {
    pageParam: {
      pageNum,
      pageSize,
      count: false,
    },
    processDefinitionName: searchString.value,
  }

  try {
    const res = await FlowOperationController.listRuntimeTask(params)
    const newList = res.dataList.map((item: TaskCardData) => ({
      ...item,
      headImageUrl: getHeadImageUrl(item as any),
    }))

    if (pageNum === 1) {
      dataList.value = newList
    }
    else {
      dataList.value = [...dataList.value, ...newList]
    }

    totalCount.value = res.totalCount
    currentPage.value = pageNum

    // 判断是否加载完成
    finished.value = dataList.value.length >= totalCount.value || newList.length <= 0
  }
  catch (e) {
    console.error(e)
  }
  finally {
    // 无论成功失败都要将 loading 设为 false，否则 van-list 会一直显示加载中
    loading.value = false
  }
}

/**
 * 下拉菜单变更
 * @param value - 选中的值
 */
function dropdownChange(value: string): void {
  currentState.value = value
  nextTick(() => {
    // 当切换到不同状态时，手动触发对应组件的数据加载
    if (value === 'history' && historyTaskRef.value) {
      historyTaskRef.value.refresh()
    }
    else if (value === 'yiban' && approvedTaskRef.value) {
      approvedTaskRef.value.refresh()
    }
    else {
      refresh()
    }
  })
}

/**
 * 刷新列表
 */
function refresh(): void {
  currentPage.value = 0
  finished.value = false
  dataList.value = []
  loading.value = true
  doLoadData(1)
}

/**
 * 搜索刷新列表
 */
function onRefresh(): void {
  if (currentState.value === 'daiban') {
    refresh()
  }
  else if (currentState.value === 'history' && historyTaskRef.value) {
    historyTaskRef.value.refresh()
  }
  else if (currentState.value === 'yiban' && approvedTaskRef.value) {
    approvedTaskRef.value.refresh()
  }
}

/**
 * 获取卡片数据
 * @param cardData - 任务卡片数据
 * @returns 格式化的卡片数据
 */
function getCardData(cardData: TaskCardData): CardData {
  return {
    title: cardData.processDefinitionName || '',
    subTitle: [
      `工单编号：${cardData.workOrderCode || ''}`,
      `当前任务：${cardData.taskName || ''}`,
      `创建时间：${cardData.taskStartTime || ''}`,
    ],
  }
}

/**
 * 跳转到任务详情
 * @param row - 任务数据
 */
async function goTaskDetails(row: TaskCardData): Promise<void> {
  const res = await FlowOperationController.viewRuntimeTaskInfo({
    processInstanceId: row.processInstanceId,
    processDefinitionId: row.processDefinitionId,
    taskId: row.taskId,
  })

  const data = {
    isRuntime: true,
    isDraft: row.isDraft,
    taskId: row.taskId,
    flowStatus: row.flowStatus || 1,
    processDefinitionKey: row.processDefinitionKey,
    processInstanceId: row.processInstanceId,
    processDefinitionId: row.processDefinitionId,
    formId: res.formId,
    routerName: res.mobileRouterName || res.routerName,
    readOnly: res.readOnly,
    taskName: row.taskName,
    headImageUrl: row.headImageUrl,
    flowEntryName: row.processDefinitionName,
    processInstanceInitiator: row.showName,
    // 过滤掉加签、减签操作，加签、减签只有在已完成任务里可以操作
    operationList: (res.operationList || []).filter((item: any) => {
      return item.type !== SysFlowTaskOperationType.getById('multi_consign')?.id
        && item.type !== SysFlowTaskOperationType.getById('revoke')?.id
        && item.type !== SysFlowTaskOperationType.getById('multi_minus_sign')?.id
    }),
    variableList: res.variableList,
    showWorkFlowForm: true,
  }

  router.push({
    path: '/workflow/handle',
    query: { passData: encodeURIComponent(JSON.stringify(data)) },
  })
}

onActivated(() => {
  nextTick(() => {
    refresh()
  })
})
</script>

<template>
  <div class="form-my-task">
    <!-- 顶部筛选区域 -->
    <div class="filter-box">
      <van-dropdown-menu>
        <van-dropdown-item v-model="messageStatus" :options="messageStatusDropdownList" @change="dropdownChange" />
      </van-dropdown-menu>
      <van-search
        v-model="searchString"
        shape="square"
        background="#F7F8FA"
        placeholder="请输入流程名称"
        @search="onRefresh"
      />
    </div>

    <!-- 待办任务列表 -->
    <div v-if="currentState === 'daiban'" class="main-box">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        @load="loadDataList"
      >
        <div v-for="(data, index) in dataList" :key="index" class="task-item">
          <TaskCard
            :card-data="getCardData(data)"
            :flow-status="SysFlowWorkOrderStatus.getById('APPROVING')?.id"
            @click="goTaskDetails(data)"
          >
            <template #menu>
              <div class="card-menu-box">
                <div class="user-box">
                  <van-image
                    v-if="data.headImageUrl"
                    round
                    width="24"
                    height="24"
                    :src="data.headImageUrl"
                  />
                  <span class="userName">{{ data.showName }}</span>
                </div>
                <span class="time">{{ data.createTime }}</span>
              </div>
            </template>
          </TaskCard>
        </div>
      </van-list>
    </div>

    <!-- 已办任务 -->
    <template v-else-if="currentState === 'yiban'">
      <FormMyApprovedTask ref="approvedTaskRef" />
    </template>

    <!-- 历史任务 -->
    <template v-else>
      <FormMyHistoryTask ref="historyTaskRef" />
    </template>
  </div>
</template>

<style lang="less" scoped>
.form-my-task {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #F6F7F9;
}

.filter-box {
  background: white;
  padding: 0 18px;
  display: flex;
  align-items: center;

  .van-dropdown-menu {
    width: 20%;
  }

  .van-search {
    flex: 1;
  }
}

.main-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
}

.task-item + .task-item {
  margin-top: 15px;
}

.card-menu-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #f0efef;
  padding-top: 8px;
  margin-top: 10px;

  .user-box {
    height: 24px;
    display: flex;
    align-items: center;

    .userName {
      font-size: 12px;
      color: #666666;
      font-weight: 400;
      margin-left: 5px;
    }
  }

  .time {
    color: #999999;
    font-size: 12px;
  }
}
</style>
