<script setup lang="ts">
import type { CardData, TaskCardData } from '../types'
/**
 * 已办任务页面
 * 展示当前用户已处理的任务列表
 */
import { nextTick, onActivated, ref } from 'vue'
import { useRouter } from 'vue-router'
import { FlowOperationController } from '@/api/FlowController/FlowOperationController'
import { SysFlowTaskOperationType } from '@/staticDict/flowStaticDict'
import { getHeadImageUrl } from '@/utils/index'
import TaskCard from '../components/taskCard.vue'

const router = useRouter()

/** 搜索关键词 */
const searchString = ref('')

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
    const res = await FlowOperationController.listHistoricTask(params)
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
    loading.value = false
  }
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
 * 获取卡片数据
 * @param cardData - 任务卡片数据
 * @returns 格式化的卡片数据
 */
function getCardData(cardData: TaskCardData): CardData {
  const approvalTypeName = SysFlowTaskOperationType.getById(cardData.approvalType)?.name || ''
  return {
    title: cardData.processDefinitionName || '',
    subTitle: [
      `工单编号：${cardData.workOrderCode || ''}`,
      `当前任务：${cardData.name || ''}`,
      `审批操作：${approvalTypeName}`,
      `审批时间：${cardData.endTime || ''}`,
    ],
  }
}

/**
 * 跳转到任务详情
 * @param row - 任务数据
 */
async function goTaskDetails(row: TaskCardData): Promise<void> {
  const res = await FlowOperationController.viewHistoricTaskInfo({
    taskId: row.id,
    processDefinitionId: row.processDefinitionId,
    processInstanceId: row.processInstanceId,
  })

  const data = {
    processDefinitionKey: row.processDefinitionKey,
    taskId: row.id,
    processInstanceId: row.processInstanceId,
    processDefinitionId: row.processDefinitionId,
    formId: res.formId,
    routerName: res.mobileRouterName || res.routerName,
    readOnly: true,
    flowEntryName: row.processDefinitionName,
    processInstanceInitiator: row.showName,
    taskName: row.name,
    headImageUrl: row.headImageUrl,
    // 在已办理任务中仅显示加签、减签和撤销操作
    operationList: res.operationList.filter((item: any) => {
      return item.type === SysFlowTaskOperationType.getById('multi_consign')?.id
        || item.type === SysFlowTaskOperationType.getById('revoke')?.id
        || item.type === SysFlowTaskOperationType.getById('multi_minus_sign')?.id
    }),
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

// 导出刷新方法供父组件调用
defineExpose({ refresh })
</script>

<template>
  <div class="form-my-approved-task">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      @load="loadDataList"
    >
      <div v-for="(item, index) in dataList" :key="index" class="task-item">
        <TaskCard
          :card-data="getCardData(item)"
          @click="goTaskDetails(item)"
        >
          <template #menu>
            <div class="card-menu-box">
              <div class="user-box">
                <van-image
                  v-if="item.headImageUrl"
                  round
                  width="24"
                  height="24"
                  :src="item.headImageUrl"
                />
                <span class="userName">{{ item.showName }}</span>
              </div>
              <span class="time">{{ item.createTime }}</span>
            </div>
          </template>
        </TaskCard>
      </div>
    </van-list>
  </div>
</template>

<style lang="less" scoped>
.form-my-approved-task {
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
