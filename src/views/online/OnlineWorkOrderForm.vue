<script setup lang="ts">
import { showDialog, showToast } from 'vant'
/**
 * 在线工单表单
 * 用于展示流程工单列表，支持筛选、撤销、催办、办理等操作
 */
import { computed, nextTick, onMounted, provide, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { FlowOperationController } from '@/api/FlowController/FlowOperationController'
import { FlowEntryController } from '@/api/FlowController/FlowEntryController'
import { OnlineFormEventType, SysCustomWidgetOperationType, SysFlowTaskOperationType, SysFlowTaskType, SysFlowWorkOrderStatus } from '@/staticDict/index'
import { findItemFromList } from '@/utils/index'
import { TableWidget } from '@/utils/widget'
import { useOnlineForm } from './useOnlineForm'

const props = defineProps<{
  entryId?: string
  formConfig: any
}>()

const router = useRouter()

// 表单配置
const formConfigRef = ref(props.formConfig)
// 是否只读
const readOnly = ref(false)

// 使用在线表单组合式函数
const {
  isReady,
  form,
  masterTable,
  initPage,
  initFormWidgetList,
  initWidgetRule,
  initWidgetLinkage,
  rebuildFormConfig,
  getWidgetValue,
  onValueChange,
  getWidgetVisible,
  onWidgetValueChange,
  getIgnoreMaskFields,
  getQueryParams,
  provideFormContext,
} = useOnlineForm(formConfigRef, { readOnly })

// 流程定义Key
const processDefinitionKey = ref<string | undefined>(undefined)
// 流程定义名称
const processDefinitionName = ref<string | undefined>(undefined)
// 表单过滤条件
const formFilter = ref({
  workOrderCode: undefined as string | undefined,
  flowStatus: undefined as number | undefined,
})
// 表格组件
const tableWidget = ref(new TableWidget(loadTableData, loadTableDataVerify, true))

/**
 * 获取查询表格配置
 */
const queryTable = computed(() => {
  return form.value.tableWidget
})

/**
 * 获取过滤组件列表
 */
const filterWidgetList = computed(() => {
  return queryTable.value?.childWidgetList?.slice(1) || []
})

/**
 * 获取打印操作
 */
const getPrintOperation = computed(() => {
  const operation = findItemFromList(form.value.operationList || [], SysCustomWidgetOperationType.PRINT, 'type')
  return (operation && operation.enabled) ? operation : null
})

/**
 * 获取过滤状态名称
 */
const getFilterStatusName = computed(() => {
  return SysFlowWorkOrderStatus.getValue(formFilter.value.flowStatus) || '全部'
})

/**
 * 获取流程状态下拉列表
 */
const flowStatusDropdownList = computed(() => {
  const tempList = SysFlowWorkOrderStatus.getList().map((item) => {
    return {
      ...item,
      text: item.name,
      value: item.id,
    }
  })
  tempList.unshift({
    id: undefined,
    text: '全部',
    value: undefined,
  })
  return tempList
})

/**
 * 返回上一页
 */
function goBack() {
  router.back()
}

/**
 * 刷新列表
 */
function onRefresh() {
  tableWidget.value.loadDataList(1)
}

/**
 * 重置过滤条件
 */
function onReset() {
  if (Array.isArray(filterWidgetList.value)) {
    filterWidgetList.value.forEach((widget) => {
      onValueChange(widget, undefined)
    })
    tableWidget.value.loadDataList(1)
  }
}

/**
 * 下拉状态改变
 * @param value - 选中的值
 */
function dropdownChange(value: number | undefined) {
  formFilter.value.flowStatus = value
  onRefresh()
}

/**
 * 获取卡片数据
 * @param cardData - 原始数据
 */
function getCardData(cardData: any) {
  return {
    title: cardData.processDefinitionName,
    subTitle: [
      `工单编号：${cardData.workOrderCode || '无'}`,
      `发起人：${cardData.userShowName || '无'}`,
      `当前任务：${(cardData.runtimeTaskInfo || {}).taskName || '无'}`,
      `创建日期：${cardData.createTime || '无'}`,
    ],
  }
}

/**
 * 加载表格数据验证
 */
function loadTableDataVerify(): boolean {
  return true
}

/**
 * 加载表格数据
 * @param params - 加载参数
 */
async function loadTableData(params: any): Promise<{ dataList: any[], totalCount: number }> {
  try {
    if (params == null)
      params = {}
    params = {
      ...params,
      filterDtoList: getQueryParams(filterWidgetList.value),
      flowWorkOrderDtoFilter: {
        flowStatus: formFilter.value.flowStatus,
        workOrderCode: formFilter.value.workOrderCode,
      },
    }
    // 脱敏设置
    params.ignoreMaskFields = getIgnoreMaskFields()
    if (queryTable.value?.eventInfo && typeof queryTable.value.eventInfo[OnlineFormEventType.BEFORE_LOAD_TABLE_DATA] === 'function') {
      params = await queryTable.value.eventInfo[OnlineFormEventType.BEFORE_LOAD_TABLE_DATA](params)
    }
    if (params == null) {
      throw new Error('取消加载数据')
    }
    const res = await FlowOperationController.listWorkOrder(params)
    res.dataList = res.dataList.map((item: any) => {
      const initTaskInfo = item.initTaskInfo == null ? {} : (typeof item.initTaskInfo === 'string' ? JSON.parse(item.initTaskInfo) : item.initTaskInfo)
      const runtimeTaskInfo = (Array.isArray(item.runtimeTaskInfoList) && item.runtimeTaskInfoList.length > 0) ? item.runtimeTaskInfoList[0] : {}
      return {
        ...item,
        flowStatusShowName: SysFlowWorkOrderStatus.getValue(item.flowStatus),
        initTaskInfo,
        runtimeTaskInfo,
      }
    })
    if (queryTable.value?.eventInfo && typeof queryTable.value.eventInfo[OnlineFormEventType.AFTER_LOAD_TABLE_DATA] === 'function') {
      res.dataList = await queryTable.value.eventInfo[OnlineFormEventType.AFTER_LOAD_TABLE_DATA](res.dataList)
    }
    return {
      dataList: res.dataList,
      totalCount: res.totalCount,
    }
  }
  catch (e) {
    console.error(e)
    throw e
  }
}

/**
 * 加载列表数据
 * @param pageNum - 页码
 */
function loadDataList(pageNum: number) {
  tableWidget.value.loadDataList(pageNum)
}

/**
 * 启动流程
 */
function onStartFlow() {
  if (processDefinitionKey.value == null)
    return
  const params = {
    processDefinitionKey: processDefinitionKey.value,
  }
  FlowOperationController.viewInitialTaskInfo(params).then((res) => {
    if (res && res.taskType === SysFlowTaskType.USER_TASK && res.assignedMe) {
      const data = {
        processDefinitionKey: processDefinitionKey.value,
        formId: res.formId,
        routerName: res.mobileRouterName || res.routerName,
        readOnly: res.readOnly,
        taskName: '启动流程',
        isDraft: true,
        flowEntryName: processDefinitionName.value,
        operationList: (res.operationList || []).filter((item: any) => {
          return item.type !== SysFlowTaskOperationType.CO_SIGN
            && item.type !== SysFlowTaskOperationType.REVOKE
            && item.type !== SysFlowTaskOperationType.SIGN_REDUCTION
        }),
        variableList: res.variableList,
      }
      router.push({
        path: '/views/workflow/handleFlowTask/index',
        query: { passData: encodeURIComponent(JSON.stringify(data)) },
      })
    }
    else {
      FlowOperationController.startOnly({
        processDefinitionKey: processDefinitionKey.value,
      }).then(() => {
        showToast({
          message: '启动成功！',
        })
      }).catch((e) => {
        console.error(e)
      })
    }
  }).catch((e) => {
    console.error(e)
  })
}

/**
 * 办理工单
 * @param row - 工单数据
 */
function onHandlerWorkOrder(row: any) {
  if (processDefinitionKey.value == null)
    return
  const taskId = (Array.isArray(row.runtimeTaskInfoList) && row.runtimeTaskInfoList.length > 0) ? row.runtimeTaskInfoList[0].taskId : undefined
  const params = {
    processInstanceId: row.processInstanceId,
    processDefinitionId: row.processDefinitionId,
    taskId,
  }
  FlowOperationController.viewRuntimeTaskInfo(params).then((res) => {
    const data = {
      isRuntime: true,
      isDraft: row.flowStatus === SysFlowWorkOrderStatus.DRAFT,
      flowStatus: row.flowStatus,
      taskId,
      processDefinitionKey: row.processDefinitionKey,
      processInstanceId: row.processInstanceId,
      processDefinitionId: row.processDefinitionId,
      formId: res.formId,
      routerName: res.mobileRouterName || res.routerName,
      readOnly: res.readOnly,
      taskName: (row.runtimeInitialTask || {}).taskName,
      flowEntryName: row.processDefinitionName,
      processInstanceInitiator: row.processInstanceInitiator,
      operationList: (res.operationList || []).filter((item: any) => item.type !== SysFlowTaskOperationType.CO_SIGN),
      variableList: res.variableList,
    }
    router.push({
      path: '/views/workflow/handleFlowTask/index',
      query: { passData: encodeURIComponent(JSON.stringify(data)) },
    })
  }).catch((e) => {
    console.error(e)
  })
}

/**
 * 查看工单详情
 * @param row - 工单数据
 */
function onViewWorkOrder(row: any) {
  if (processDefinitionKey.value == null)
    return
  FlowOperationController.viewInitialHistoricTaskInfo({
    processInstanceId: row.processInstanceId,
  }).then((res) => {
    const data = {
      isRuntime: false,
      flowStatus: row.flowStatus,
      processDefinitionKey: row.processDefinitionKey,
      processInstanceId: row.processInstanceId,
      processDefinitionId: row.processDefinitionId,
      formId: res.formId,
      routerName: res.mobileRouterName || res.routerName,
      readOnly: true,
      taskId: row.runtimeTaskInfo?.taskId,
      taskName: row.runtimeTaskInfo?.taskName,
      flowEntryName: row.processDefinitionName,
      processInstanceInitiator: row.userShowName,
      headImageUrl: row.headImageUrl,
    }
    router.push({
      path: '/views/workflow/handleFlowTask/index',
      query: { passData: encodeURIComponent(JSON.stringify(data)) },
    })
  }).catch((e) => {
    console.error(e)
  })
}

/**
 * 催办工单
 * @param row - 工单数据
 */
function onHandlerRemindClick(row: any) {
  FlowOperationController.remindRuntimeTask({
    workOrderId: row.workOrderId,
  }).then(() => {
    showToast({
      message: '催办成功！',
    })
  }).catch((e) => {
    console.error(e)
  })
}

/**
 * 撤销工单
 * @param row - 工单数据
 */
function onCancelWorkOrder(row: any) {
  showDialog({
    title: '消息',
    message: '是否撤销此工单？',
  }).then(() => {
    const params = {
      workOrderId: row.workOrderId,
      cancelReason: '主动撤销',
    }
    FlowOperationController.cancelWorkOrder(params).then(() => {
      tableWidget.value.loadDataList(1)
      showToast({
        message: '撤销成功！',
      })
    }).catch((e) => {
      console.error(e)
    })
  }).catch(() => {
    // 用户取消
  })
}

/**
 * 打印工单
 * @param operation - 打印操作
 * @param row - 工单数据
 */
function onPrint(operation: any, row: any) {
  // TODO: 实现打印功能
  console.log('打印工单', operation, row)
}

// 提供表单上下文
provideFormContext()

// 监听表单配置变化
watch(() => props.formConfig, (newConfig) => {
  if (newConfig) {
    formConfigRef.value = newConfig
    isReady.value = false
    rebuildFormConfig()
    initPage()
    initFormWidgetList()
    initWidgetRule()
    if (props.entryId) {
      FlowEntryController.viewDict({
        entryId: props.entryId,
      }).then((res) => {
        processDefinitionKey.value = res.processDefinitionKey
        processDefinitionName.value = res.processDefinitionName
        isReady.value = true
        tableWidget.value.loadDataList(1)
      }).catch((e) => {
        console.error(e)
      })
    }
    else {
      isReady.value = true
    }
  }
}, { immediate: true })
</script>

<template>
  <div class="online-work-order-form">
    <!-- 导航栏 -->
    <van-nav-bar
      :title="form.formName || '工单列表'"
      left-arrow
      @click-left="goBack"
    />

    <!-- 过滤区域 -->
    <div class="filter-box">
      <div class="search-area">
        <!-- 状态下拉 -->
        <van-dropdown-menu>
          <van-dropdown-item
            v-model="formFilter.flowStatus"
            :options="flowStatusDropdownList"
            @change="dropdownChange"
          />
        </van-dropdown-menu>
        <!-- 搜索框 -->
        <van-search
          v-model="formFilter.workOrderCode"
          shape="square"
          placeholder="请输入工单编码"
          @search="onRefresh"
        />
      </div>
      <!-- 过滤字段 -->
      <!-- TODO: 需要实现 OnlineCustomBlock 组件 -->
    </div>

    <!-- 列表区域 -->
    <div class="main-box">
      <van-list
        v-model:loading="tableWidget.loading"
        :finished="tableWidget.finished"
        finished-text="没有更多了"
        @load="loadDataList"
      >
        <div
          v-for="(data, index) in tableWidget.dataList"
          :key="index"
          class="list-item"
        >
          <van-cell-group inset>
            <van-cell
              :title="getCardData(data).title"
              :label="getCardData(data).subTitle.join('\n')"
            >
              <template #right-icon>
                <div class="menu-box">
                  <van-button
                    size="small"
                    :type="data.flowStatus === SysFlowWorkOrderStatus.CANCEL ? 'default' : 'danger'"
                    :disabled="data.flowStatus === SysFlowWorkOrderStatus.CANCEL"
                    @click.stop="onCancelWorkOrder(data)"
                  >
                    撤销
                  </van-button>
                  <van-button
                    size="small"
                    :type="data.flowStatus === SysFlowWorkOrderStatus.CANCEL ? 'default' : 'success'"
                    :disabled="data.flowStatus === SysFlowWorkOrderStatus.CANCEL"
                    @click.stop="onHandlerRemindClick(data)"
                  >
                    催办
                  </van-button>
                  <van-button
                    v-if="getPrintOperation"
                    size="small"
                    type="default"
                    @click.stop="onPrint(getPrintOperation, data)"
                  >
                    {{ getPrintOperation.name || '打印' }}
                  </van-button>
                  <van-button
                    v-if="(data.initTaskInfo.taskKey || '') !== (data.runtimeTaskInfo.taskKey || '')"
                    size="small"
                    type="primary"
                    @click.stop="onViewWorkOrder(data)"
                  >
                    详情
                  </van-button>
                  <van-button
                    v-if="(data.initTaskInfo.taskKey || '') === (data.runtimeTaskInfo.taskKey || '')"
                    size="small"
                    type="primary"
                    @click.stop="onHandlerWorkOrder(data)"
                  >
                    办理
                  </van-button>
                </div>
              </template>
            </van-cell>
          </van-cell-group>
        </div>
      </van-list>
    </div>

    <!-- 新增按钮 -->
    <div class="add-btn" @click="onStartFlow()">
      <van-icon name="plus" size="24" color="#fff" />
    </div>
  </div>
</template>

<style scoped lang="less">
.online-work-order-form {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f6f7f9;

  .filter-box {
    background: white;
    padding: 0 18px;
    flex-grow: 0;
    flex-shrink: 0;

    .search-area {
      display: flex;
      width: 100%;
      flex-direction: row;
      align-items: center;
      gap: 8px;
    }
  }

  .main-box {
    flex-grow: 1;
    flex-shrink: 1;
    padding: 16px;
    position: relative;
    overflow-y: auto;

    .list-item {
      margin-bottom: 16px;

      .menu-box {
        display: flex;
        flex-direction: row;
        gap: 4px;
      }
    }
  }

  .add-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1989fa;
    position: fixed;
    right: 16px;
    bottom: 50px;
    z-index: 999;
    cursor: pointer;
  }
}
</style>
