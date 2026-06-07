<script setup lang="ts">
import { showDialog, showToast } from 'vant'
/**
 * 在线查询表单
 * 用于展示数据列表，支持筛选、排序、新增、编辑、删除等操作
 */
import { computed, nextTick, onMounted, provide, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { doUrl } from '@/common/ajax'
import { FlowOperationController } from '@/api/FlowController/FlowOperationController'
import { OnlineFormEventType, SysCustomWidgetOperationType, SysOnlineColumnFilterType, SysOnlineFormType, SysOnlineRelationType } from '@/staticDict/index'
import { TableWidget } from '@/utils/widget'
import OnlineEditForm from './OnlineEditForm.vue'
import { useOnlineForm } from './useOnlineForm'

const props = defineProps<{
  formId?: string
  entryId?: string
  formConfig?: any
  rowData?: any
}>()

const emit = defineEmits<{
  (e: 'close', refresh: boolean): void
  (e: 'changeSub'): void
}>()

const router = useRouter()

// 表单配置
const formConfigRef = ref(props.formConfig || null)
// 是否只读
const readOnly = ref(false)
// 是否编辑模式
const isEdit = ref(false)
// 主表数据
const masterTableData = ref(props.rowData)

// 使用在线表单组合式函数
const {
  isReady,
  form,
  masterTable,
  formReadOnly,
  initPage,
  initFormWidgetList,
  initWidgetRule,
  initWidgetLinkage,
  rebuildFormConfig,
  getWidgetValue,
  onValueChange,
  getWidgetVisible,
  onWidgetValueChange,
  getDropdownParams,
  getPrimaryData,
  getIgnoreMaskFields,
  getQueryParams,
  getOperation,
  operationVisible,
  handlerOperation,
  showSubPage,
  subFormId,
  editRowData,
  provideFormContext,
  onRefresh,
} = useOnlineForm(formConfigRef, { readOnly, isEdit, masterTableData })

// 是否显示删除按钮
const showDelete = ref(false)
// 删除确认弹窗
const showDeleteDlg = ref(false)
// 是否全选
const selectAll = ref(false)
// 选中的删除项
const selectItemList = ref<any[]>([])
// 排序信息
const sortInfo = ref<any>(undefined)
// 当前激活的排序字段
const sortInfoActive = ref<string | null>(null)
// 表格组件
const tableWidget = ref(new TableWidget(loadTableData, loadTableDataVerify, true))

/**
 * 获取查询表格配置
 */
const queryTable = computed(() => {
  return form.value.tableWidget
})

/**
 * 获取卡片组件配置
 */
const cardWidget = computed(() => {
  return queryTable.value?.childWidgetList?.[0]
})

/**
 * 获取过滤组件列表
 */
const filterWidgetList = computed(() => {
  return queryTable.value?.childWidgetList?.slice(1) || []
})

/**
 * 获取排序列表
 */
const sortList = computed(() => {
  return (queryTable.value?.props?.orderList || []).map((item: any) => {
    const table = form.value.tableMap?.get(item.tableId)
    const column = form.value.columnMap?.get(item.columnId)
    if ((masterTable.value || {}).tableId === (table || {}).tableId) {
      // 主表字段
      return {
        ...item,
        fieldName: column?.columnName,
        asc: undefined,
      }
    }
    else {
      // 从表字段
      return {
        ...item,
        fieldName: `${table?.tableName}.${column?.columnName}`,
        asc: undefined,
      }
    }
  })
})

/**
 * 返回上一页
 */
function goBack() {
  router.back()
}

/**
 * 关闭子表单
 */
function closeSubPage() {
  showSubPage.value = false
  emit('changeSub')
}

/**
 * 处理编辑操作
 * @param rowData - 行数据
 */
function handlerEditOperation(rowData: any) {
  if (showDelete.value)
    return
  if (!operationVisible(SysCustomWidgetOperationType.EDIT) || formReadOnly.value)
    return
  if ('WFSTATUS' in rowData && rowData.WFSTATUS !== -1) {
    // 流程数据，跳转到流程详情
    onFlowDetails(rowData)
  }
  else {
    handlerOperation(getOperation(SysCustomWidgetOperationType.EDIT), rowData)
    emit('changeSub')
  }
}

/**
 * 查看流程详情
 * 根据工单编号查询流程信息，跳转到流程处理页面
 * @param row - 行数据
 */
async function onFlowDetails(row: any) {
  try {
    const res: any = await doUrl(
      '/admin/online/onlineApi/runScript/queryFlowInfoByWorkFlowCode',
      'post',
      {
        scriptCode: 'queryFlowInfoByWorkFlowCode',
        scriptParam: {
          workOrderCode: row?.BILLCODE,
        },
      },
    )
    const processInfo = res[0]
    const taskRes: any = await FlowOperationController.viewInitialHistoricTaskInfo({
      processInstanceId: processInfo.PROCESS_INSTANCE_ID,
    })
    const data = {
      isRuntime: false,
      processDefinitionKey: processInfo.PROCESS_DEFINITION_KEY || null,
      processInstanceId: processInfo.PROCESS_INSTANCE_ID || null,
      processDefinitionId: processInfo.PROCESS_DEFINITION_ID || null,
      formId: taskRes.formId || null,
      routerName: taskRes.mobileRouterName || taskRes.routerName,
      readOnly: true,
      taskId: processInfo.taskId || null,
      taskName: processInfo.taskName,
      flowEntryName: processInfo.PROCESS_DEFINITION_NAME || null,
      processInstanceInitiator: null,
      flowStatus: row.WFSTATUS,
      showWorkFlowForm: true,
    }
    router.push({
      name: 'HandleFlowTask',
      query: {
        passData: encodeURIComponent(JSON.stringify(data)),
      },
    })
  }
  catch (e) {
    console.error('查询流程详情失败', e)
    showToast('查询流程详情失败')
  }
}

/**
 * 点击删除按钮
 */
function onDeleteClick() {
  if (!Array.isArray(selectItemList.value) || selectItemList.value.length <= 0)
    return
  showDeleteDlg.value = true
}

/**
 * 执行批量删除
 */
function handlerBathDelete() {
  if (!showDelete.value)
    return
  handlerOperation(
    getOperation(SysCustomWidgetOperationType.BATCH_DELETE),
    selectItemList.value,
  )
  showDeleteDlg.value = false
}

/**
 * 关闭子表单回调
 * @param refresh - 是否需要刷新
 */
function onCloseSubForm(refresh: boolean) {
  showSubPage.value = false
  emit('changeSub')
  if (refresh)
    onRefresh()
}

/**
 * 刷新列表
 */
function refreshData() {
  onCancelDelete()
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
 * 取消删除状态
 */
function onCancelDelete() {
  showDelete.value = false
  selectAll.value = false
  selectItemList.value = []
}

/**
 * 全选状态改变
 * @param checked - 是否选中
 */
function changeSelectAll(checked: boolean) {
  if (checked) {
    selectItemList.value = tableWidget.value.dataList.filter((item) => {
      return !('WFSTATUS' in item && item.WFSTATUS !== -1)
    })
  }
  else {
    selectItemList.value = []
  }
}

/**
 * 排序状态改变
 * @param sortItem - 排序项
 */
function onSortChange(sortItem: any) {
  if (sortItem.asc == null) {
    sortItem.asc = true
  }
  else if (sortItem.asc === true) {
    sortItem.asc = false
  }
  else if (sortItem.asc === false) {
    sortItem.asc = true
  }
  if (sortItem.asc != null) {
    sortInfoActive.value = sortItem.fieldName
    sortInfo.value = {
      fieldName: sortItem.fieldName,
      asc: sortItem.asc,
    }
  }
  else {
    sortInfo.value = undefined
  }
  refreshData()
}

/**
 * 加载表格数据
 * @param params - 加载参数
 */
async function loadTableData(params: any): Promise<{ dataList: any[], totalCount: number }> {
  try {
    if (params == null)
      params = {}
    const table = form.value.tableMap?.get(masterTable.value?.tableId || '')
    if (table == null) {
      throw new Error('未配置关联表')
    }
    params = {
      ...params,
      datasourceId: table.datasource.datasourceId,
      filterDtoList: getQueryParams(filterWidgetList.value),
      orderParam: sortInfo.value == null ? [] : [sortInfo.value],
    }
    if (queryTable.value?.relation != null) {
      params.relationId = table.relation.relationId
      params.filterDtoList.push({
        tableName: queryTable.value.table.tableName,
        columnName: queryTable.value.relation.slaveColumn.columnName,
        filterType: SysOnlineColumnFilterType.EQUAL_FILTER,
        columnValue: (masterTableData.value || {})[queryTable.value.relation.masterColumn.columnName],
      })
    }
    // 脱敏设置
    params.ignoreMaskFields = getIgnoreMaskFields(queryTable.value)
    if (queryTable.value?.eventInfo && typeof queryTable.value.eventInfo[OnlineFormEventType.BEFORE_LOAD_TABLE_DATA] === 'function') {
      params = await queryTable.value.eventInfo[OnlineFormEventType.BEFORE_LOAD_TABLE_DATA](params)
    }
    if (params == null) {
      throw new Error('未配置查询参数')
    }
    let res: any = null
    if (table.relation != null) {
      res = await doUrl(
        `/admin/online/onlineOperation/listByOneToManyRelationId/${table.datasource.variableName}`,
        'post',
        params,
      )
    }
    else {
      res = await doUrl(
        `/admin/online/onlineOperation/listByDatasourceId/${table.datasource.variableName}`,
        'post',
        params,
      )
    }
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
 * 加载表格数据验证
 */
function loadTableDataVerify(): boolean {
  return true
}

/**
 * 加载列表数据
 * @param pageNum - 页码
 */
function loadDataList(pageNum: number) {
  tableWidget.value.loadDataList(pageNum)
}

/**
 * 获取卡片数据
 * @param cardData - 原始数据
 */
function getCardData(cardData: any) {
  return {
    title: '',
    subTitle: [
      `单据编号：${cardData.BILLCODE || '无'}`,
      `经办人：${cardData.OPERATORDictMap?.name || '无'}`,
      `项目名称：${(cardData.PROJECT_NAME || '') || '无'}`,
      cardData.WFSTATUSDictMap?.name || '',
    ],
  }
}

/**
 * 获取流程状态标签类型
 * @param status - 流程状态
 */
function getFlowStatusTagType(status: number): 'default' | 'primary' | 'success' | 'danger' | 'warning' {
  switch (status) {
    case -1:
      return 'default'
    case 0:
      return 'primary'
    case 1:
      return 'success'
    case 2:
      return 'danger'
    default:
      return 'default'
  }
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
    if (form.value.eventInfo && typeof form.value.eventInfo.formCreated === 'function') {
      form.value.eventInfo.formCreated()
    }
    initWidgetLinkage()
    isReady.value = true
  }
}, { immediate: true })

// 页面挂载后刷新列表
onMounted(() => {
  nextTick(() => {
    tableWidget.value.loadDataList(1)
  })
})
</script>

<template>
  <div class="online-query-form">
    <!-- 导航栏 -->
    <van-nav-bar
      :title="form.formName || '查询表单'"
      left-arrow
      @click-left="goBack"
    />

    <!-- 过滤区域 -->
    <div class="filter-box">
      <div class="filter-header">
        <!-- 排序区域 -->
        <div class="sort-area">
          <div
            v-for="sortItem in sortList"
            :key="sortItem.id"
            class="sort-item"
            @click="onSortChange(sortItem)"
          >
            <span :class="{ sortActive: sortInfoActive === sortItem.fieldName }">
              {{ sortItem.showName }}
            </span>
            <van-icon :name="sortItem.asc ? 'arrow-up' : 'arrow-down'" size="14" />
          </div>
        </div>
        <!-- 操作按钮 -->
        <div class="nav-right">
          <van-icon
            v-if="!showDelete && operationVisible(SysCustomWidgetOperationType.BATCH_DELETE) && !formReadOnly"
            name="delete"
            size="20"
            @click="showDelete = true"
          />
          <span v-if="showDelete" class="cancel-text" @click="showDelete = false">取消</span>
        </div>
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
          <!-- TODO: 需要实现 TaskCard 组件 -->
          <van-cell-group inset>
            <van-cell
              :title="getCardData(data).title"
              :label="getCardData(data).subTitle.join('\n')"
              @click="handlerEditOperation(data)"
            >
              <template #right-icon>
                <van-tag v-if="data.WFSTATUS" :type="getFlowStatusTagType(data.WFSTATUS)">
                  {{ data.WFSTATUSDictMap?.name || '' }}
                </van-tag>
              </template>
            </van-cell>
          </van-cell-group>
        </div>
      </van-list>

      <!-- 删除菜单 -->
      <div v-if="showDelete" class="menu-box">
        <van-checkbox v-model="selectAll" @change="changeSelectAll">
          全部
        </van-checkbox>
        <div class="delete-btn">
          <van-icon name="delete" color="#ee0a24" />
          <span class="text" @click="onDeleteClick">
            删除{{ selectItemList.length > 0 ? `(${selectItemList.length})` : '' }}
          </span>
        </div>
      </div>

      <!-- 子表单弹窗 -->
      <van-popup
        v-if="showSubPage"
        :show="showSubPage"
        position="left"
        :style="{ width: '100%', height: '100%' }"
      >
        <OnlineEditForm
          v-if="showSubPage"
          :form-id="subFormId"
          :row-data="editRowData"
          @close="onCloseSubForm"
        />
      </van-popup>
    </div>

    <!-- 新增按钮 -->
    <div class="add-btn" @click="handlerOperation(getOperation(SysCustomWidgetOperationType.ADD), null)">
      <van-icon name="plus" size="24" color="#fff" />
    </div>

    <!-- 删除确认弹窗 -->
    <van-dialog
      v-model:show="showDeleteDlg"
      title="提示"
      message="是否删除选中数据？"
      show-cancel-button
      @confirm="handlerBathDelete"
    />
  </div>
</template>

<style scoped lang="less">
.online-query-form {
  height: 100vh;
  background: #f6f7f9;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;

  .filter-box {
    background: white;
    padding: 0 18px;
    flex-grow: 0;
    flex-shrink: 0;

    .filter-header {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 10px 0;

      .sort-area {
        display: flex;
        flex-direction: row;
        align-items: center;

        .sort-item {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          margin-right: 8px;
          cursor: pointer;

          span {
            font-size: 14px;
            color: #707070;
            margin-right: 2px;

            &.sortActive {
              color: #1989fa;
            }
          }
        }
      }

      .nav-right {
        display: flex;
        flex-direction: row;
        align-items: center;

        .cancel-text {
          font-size: 14px;
          color: #707070;
          margin-left: 10px;
        }
      }
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
    }
  }

  .menu-box {
    flex-grow: 0;
    flex-shrink: 0;
    height: 50px;
    line-height: 50px;
    z-index: 999;
    padding: 0 16px;
    background-color: #ffffff;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    .delete-btn {
      display: flex;
      flex-direction: row;
      align-items: center;

      .text {
        font-size: 15px;
        color: #ee0a24;
        margin-left: 5px;
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
