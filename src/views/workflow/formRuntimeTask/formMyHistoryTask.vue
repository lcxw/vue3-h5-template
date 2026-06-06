<script setup lang="ts">
import type { CardData, TaskCardData } from '../types'
/**
 * 历史任务页面
 * 展示当前用户发起的历史流程实例列表
 */
import { nextTick, onActivated, ref } from 'vue'
import { useRouter } from 'vue-router'
import { FlowOperationController } from '@/api/FlowController/FlowOperationController'
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
    const res = await FlowOperationController.listHistoricProcessInstance(params)
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
  return {
    title: cardData.processDefinitionName || '',
    subTitle: [
      `工单编号：${cardData.workOrderCode || ''}`,
      `发起时间：${cardData.startTime || ''}`,
      `结束时间：${cardData.endTime || '无'}`,
    ],
  }
}

/**
 * 跳转到任务详情
 * @param row - 任务数据
 */
async function goTaskDetails(row: TaskCardData): Promise<void> {
  const res = await FlowOperationController.viewInitialHistoricTaskInfo({
    processInstanceId: row.processInstanceId,
  })

  const data = {
    processDefinitionKey: row.processDefinitionKey,
    taskId: null,
    processInstanceId: row.processInstanceId,
    processDefinitionId: row.processDefinitionId,
    formId: res.formId,
    headImageUrl: row.headImageUrl,
    routerName: res.mobileRouterName || res.routerName,
    flowStatus: row.flowStatus,
    readOnly: true,
    flowEntryName: row.processDefinitionName,
    processInstanceInitiator: row.showName,
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
  <div class="form-my-history-task">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      @load="loadDataList"
    >
      <div v-for="(data, index) in dataList" :key="index" class="task-item">
        <TaskCard
          :card-data="getCardData(data)"
          :flow-status="data.flowStatus"
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
            </div>
          </template>
        </TaskCard>
      </div>
    </van-list>
  </div>
</template>

<style lang="less" scoped>
.form-my-history-task {
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
}
</style>
