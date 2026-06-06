<script setup lang="ts">
import type { WidgetInfo } from './utils'
import { showToast } from 'vant'
/**
 * 报表表单组件
 * 用于渲染报表页面中的过滤条件和图表组件
 */
import { computed, onMounted, provide, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { DictionaryController } from '@/api/Controller/DictionaryController'
import { ReportDatasetController } from '@/api/ReportController/ReportDatasetController'
import { ReportDictController } from '@/api/ReportController/ReportDictController'
import { ReportOperationController } from '@/api/ReportController/ReportOperationController'
import {
  DatasetType,
  FilterValueKind,
  OnlineFormEventType,
  OnlineSystemVariableType,
  ReportWidgetType,
  SysCustomWidgetOperationType,
  SysCustomWidgetType,
  SysOnlineFormType,
  SysOnlineParamValueType,
} from '@/staticDict/index'
import { findItemFromList, findTreeNode, formatDate } from '@/utils'
import { getAllWidgetList, isChart, isFilterWidget } from './utils'

/**
 * 表单配置接口
 */
interface FormConfig {
  pageId: string
  pageName: string
  pageCode: string
  gutter: number
  labelWidth: number
  labelPosition: string
  customFieldList: any[]
  filterItemWidth: number
  widgetList: WidgetInfo[]
  paramList: any[]
}

/**
 * 组件属性
 */
const props = defineProps<{
  formConfig: FormConfig
  height?: string
  isEdit?: boolean
  currentWidget?: WidgetInfo
  fullscreen?: boolean
  params?: string
  mode?: string
}>()

// 路由器
const router = useRouter()

// 组件状态
const show = ref<boolean>(false)
const isReady = ref<boolean>(false)
const formData = ref<Record<string, any>>({})
const datasetMap = ref<Map<string, any>>(new Map())
const dictMap = ref<Map<string, any>>(new Map())
const showSubPage = ref<boolean>(false)
const subPageId = ref<string | undefined>(undefined)
const subPageParams = ref<string | undefined>(undefined)

/**
 * 获取过滤组件类型列表
 */
const filterWidgetTypeList = computed(() => {
  return [
    SysCustomWidgetType.MobileInputFilter,
    SysCustomWidgetType.MobileRadioFilter,
    SysCustomWidgetType.MobileCheckBoxFilter,
    SysCustomWidgetType.MobileSwitchFilter,
    SysCustomWidgetType.MobileDateRangeFilter,
    SysCustomWidgetType.MobileNumberRangeFilter,
  ]
})

/**
 * 获取所有组件列表
 */
const getAllWidget = computed(() => {
  if (Array.isArray(props.formConfig.widgetList)) {
    return getAllWidgetList(props.formConfig.widgetList)
  }
  return []
})

/**
 * 获取表单参数
 */
const formParams = computed(() => {
  let params: Record<string, any> = {}
  try {
    if (props.params) {
      params = JSON.parse(props.params)
    }
  }
  catch (e) {
    console.error('解析表单参数失败:', e)
  }
  return params
})

/**
 * 获取过滤组件列表
 */
const filterWidgetList = computed(() => {
  return getAllWidget.value.filter((widget) => {
    return filterWidgetTypeList.value.includes(widget.widgetType)
  })
})

/**
 * 获取图表组件列表
 */
const chartWidgetList = computed(() => {
  return getAllWidget.value.filter((widget) => {
    return !filterWidgetTypeList.value.includes(widget.widgetType)
  })
})

/**
 * 获取用户信息
 */
function getUserInfo(): Record<string, any> {
  try {
    const userInfoStr = localStorage.getItem('userInfo')
    return userInfoStr ? JSON.parse(userInfoStr) : {}
  }
  catch {
    return {}
  }
}

/**
 * 获取系统变量值
 * @param systemVariableType 系统变量类型
 * @returns 系统变量值
 */
function getSystemVariableValue(systemVariableType: string): string | undefined {
  const userInfo = getUserInfo()
  switch (systemVariableType) {
    case OnlineSystemVariableType.CURRENT_USER:
      return userInfo.showName
    case OnlineSystemVariableType.CURRENT_DEPT:
      return userInfo.deptName
    case OnlineSystemVariableType.CURRENT_DATE:
      return formatDate(new Date(), 'YYYY-MM-DD')
    case OnlineSystemVariableType.CURRENT_TIME:
      return formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
    case OnlineSystemVariableType.FLOW_CREATE_USER:
      return userInfo.showName
    default:
      return undefined
  }
}

/**
 * 获取组件值
 * @param widget 组件信息
 * @returns 组件当前值
 */
function getWidgetValue(widget: WidgetInfo): any {
  return formData.value[widget.variableName]
}

/**
 * 获取组件是否可见
 * @param widget 组件信息
 * @returns 是否可见
 */
function getWidgetVisible(widget: WidgetInfo): boolean {
  if (widget == null || widget.eventInfo == null)
    return true
  if (typeof widget.eventInfo[OnlineFormEventType.VISIBLE] === 'function') {
    return widget.eventInfo[OnlineFormEventType.VISIBLE]()
  }
  return true
}

/**
 * 设置组件值
 * @param widget 组件信息
 * @param value 新值
 */
function onValueChange(widget: WidgetInfo, value: any): void {
  formData.value[widget.variableName] = value
}

/**
 * 组件值变更事件
 * @param widget 组件信息
 * @param value 新值
 * @param dictData 字典数据
 */
function onWidgetValueChange(widget: WidgetInfo, value: any, dictData?: any): void {
  if (widget == null || widget.eventInfo == null)
    return
  const fun = getScriptFunction(widget.eventInfo, OnlineFormEventType.CHANGE)
  fun && fun(value)
}

/**
 * 获取脚本函数
 * @param eventInfo 事件信息
 * @param eventType 事件类型
 * @returns 函数或 null
 */
function getScriptFunction(eventInfo: Record<string, any>, eventType: string): Function | null {
  if (eventInfo && typeof eventInfo[eventType] === 'function') {
    return eventInfo[eventType]
  }
  return null
}

/**
 * 获取字典数据列表
 * @param dictInfo 字典信息
 * @param params 查询参数
 * @returns 字典数据列表
 */
async function getDictDataList(dictInfo: Record<string, any>, params: Record<string, any>): Promise<any[]> {
  if (dictInfo == null || dictInfo.dictId == null)
    return []
  return listDictData(dictInfo.dictId, params)
}

/**
 * 获取参数值
 * @param valueType 值类型
 * @param valueData 值数据
 * @returns 参数值
 */
function getParamValue(valueType: string, valueData: any): any {
  switch (valueType) {
    case SysOnlineParamValueType.TABLE_COLUMN: {
      const widget = findItemFromList(getAllWidget.value, valueData, 'widgetId') as WidgetInfo | null
      return widget ? formData.value[widget.variableName] : undefined
    }
    case SysOnlineParamValueType.STATIC_DICT:
      return Array.isArray(valueData) ? valueData[1] : undefined
    case SysOnlineParamValueType.INPUT_VALUE:
      return valueData
    default:
      return undefined
  }
}

/**
 * 获取下拉组件参数
 * @param widget 组件信息
 * @returns 下拉参数
 */
function getDropdownParams(widget: WidgetInfo): Record<string, any> | null {
  if (!widget.props?.dictInfo?.paramList || !Array.isArray(widget.props.dictInfo.paramList)) {
    return {}
  }

  const params: Record<string, any> = {}
  for (const dictParam of widget.props.dictInfo.paramList) {
    if (dictParam.dictValue == null || dictParam.dictValueType == null)
      continue
    const widgetData = getParamValue(dictParam.dictValueType, dictParam.dictValue)
    if (widgetData == null)
      return null
    params[dictParam.dictParamName] = widgetData
  }
  return params
}

/**
 * 获取查询参数
 * @param filter 过滤条件
 * @returns 查询参数
 */
function getQueryParam(filter: Record<string, any>): Record<string, any> {
  if (filter.filterValueType === FilterValueKind.FORM_PARAM) {
    const formParam = formParams.value[filter.paramValue]
    if (formParam != null) {
      if (formParam.filterValueType === FilterValueKind.INNER_VARIABLE) {
        return {
          ...filter,
          filterValueType: FilterValueKind.INNER_VARIABLE,
          paramValue: formParam,
        }
      }
      return { ...filter, paramValue: formParam }
    }
    return { ...filter, paramValue: undefined }
  }

  if (filter.filterValueType === FilterValueKind.WIDGET_DATA) {
    const filterWidget = findItemFromList(getAllWidget.value, filter.formWidgetId, 'widgetId') as WidgetInfo | null
    let paramValue: any
    let dateRange: string | undefined

    if (filterWidget != null) {
      paramValue = formData.value[filterWidget.variableName]

      // 级联选择器特殊处理
      if (filterWidget.widgetType === ReportWidgetType.Cascader) {
        if (Array.isArray(paramValue)) {
          paramValue = paramValue[paramValue.length - 1]
        }
        else {
          paramValue = undefined
        }
      }

      if (paramValue === '')
        paramValue = undefined

      // 日期范围组件特殊处理
      if (filterWidget.widgetType === ReportWidgetType.DateRange
        || filterWidget.widgetType === ReportWidgetType.Date) {
        switch (filterWidget.props?.type) {
          case 'daterange':
            dateRange = 'date'
            break
          case 'monthrange':
            dateRange = 'month'
            break
          case 'datetimerange':
          case 'datetime':
            dateRange = undefined
            break
          default:
            dateRange = filterWidget.props?.type
        }
      }
    }

    return { ...filter, dateRange, paramValue }
  }

  return { ...filter }
}

/**
 * 分组查询数据
 * @param params 查询参数
 * @returns 查询结果
 */
async function listDataWithGroup(params: Record<string, any>): Promise<any> {
  const finalParams = {
    ...params,
    pageCode: props.formConfig.pageCode,
  }

  if (props.isEdit) {
    return ReportOperationController.previewDataWithGroup(finalParams)
  }
  return ReportOperationController.listDataWithGroup(finalParams)
}

/**
 * 查询字典数据
 * @param dictId 字典ID
 * @param params 查询参数
 * @returns 字典数据列表
 */
async function listDictData(dictId: string, params: Record<string, any>): Promise<any[]> {
  if (params == null)
    return []

  const filterDtoList = Object.keys(params).map(key => ({
    columnName: key,
    columnValue: params[key],
  }))

  return ReportDictController.listDictData({
    dictId,
    filterDtoList,
  })
}

/**
 * 查询字段数据
 * @param datasetId 数据集ID
 * @param columnId 字段ID
 * @returns 字段数据列表
 */
async function listColumnData(datasetId: string, columnId: string): Promise<any> {
  return ReportDatasetController.listDataWithColumn({
    datasetId,
    columnId,
  })
}

/**
 * 加载数据集信息
 * @param datasetId 数据集ID
 * @returns 数据集信息
 */
async function loadDatasetInfo(datasetId: string): Promise<any> {
  const res = await ReportDatasetController.view({ datasetId })
  try {
    const info = JSON.parse(res.datasetInfo)
    res.datasetParamList = info.paramList
    res.columnList = info.columnList || res.columnList
  }
  catch {
    res.datasetParamList = []
  }
  return res
}

/**
 * 初始化组件
 * @param widget 组件信息
 * @returns 初始化后的组件
 */
function initFormWidget(widget: WidgetInfo): WidgetInfo {
  if (widget == null)
    return widget

  // 初始化字典信息
  if (widget.props?.dictInfo) {
    const dict = dictMap.value.get(widget.props.dictInfo.dictId)
    widget.props.dictInfo.dict = dict
    show.value = true
  }

  // 初始化事件信息
  if (widget.eventInfo == null) {
    widget.eventInfo = {}
  }

  // 递归初始化子组件
  if (Array.isArray(widget.childWidgetList)) {
    widget.childWidgetList = widget.childWidgetList.map(subWidget => initFormWidget(subWidget))
  }

  // 初始化数据集信息
  if (widget.props?.datasetInfo?.datasetId) {
    const dataset = datasetMap.value.get(widget.props.datasetInfo.datasetId)
    return {
      ...widget,
      dataset,
      columnList: (dataset || {}).columnList,
    }
  }

  return { ...widget }
}

/**
 * 加载单个数据集
 * @param datasetId 数据集ID
 * @returns 数据集信息
 */
async function loadDataset(datasetId: string): Promise<any> {
  const res = await ReportDatasetController.view({ datasetId })
  try {
    const info = JSON.parse(res.datasetInfo)
    res.datasetParamList = info.paramList
  }
  catch {
    res.datasetParamList = []
  }
  datasetMap.value.set(datasetId, res)
  return res
}

/**
 * 从组件列表获取所有数据集ID
 * @param widgetList 组件列表
 * @param datasetIdList 数据集ID列表
 */
function getAllDatasetIdsByWidgetList(widgetList: WidgetInfo[], datasetIdList: string[] = []): void {
  if (Array.isArray(widgetList)) {
    widgetList.forEach((widget) => {
      if (widget?.props?.datasetInfo?.datasetId) {
        const datasetId = widget.props.datasetInfo.datasetId
        if (datasetId && !datasetIdList.includes(datasetId)) {
          datasetIdList.push(datasetId)
        }
      }
      if (widget.childWidgetList) {
        getAllDatasetIdsByWidgetList(widget.childWidgetList, datasetIdList)
      }
    })
  }
}

/**
 * 加载所有数据集
 * @param widgetList 组件列表
 * @returns Promise
 */
async function loadAllDataset(widgetList: WidgetInfo[]): Promise<any[]> {
  const datasetIdList: string[] = []
  getAllDatasetIdsByWidgetList(widgetList, datasetIdList)
  return Promise.all(datasetIdList.map(datasetId => loadDataset(datasetId)))
}

/**
 * 加载报表字典列表
 * @returns Promise
 */
async function loadReportDictList(): Promise<void> {
  dictMap.value = new Map()
  const res = await DictionaryController.dictReportDict({})
  res.forEach((item: any) => {
    item.dictData = item.dictDataJson ? JSON.parse(item.dictDataJson) : undefined
    dictMap.value.set(item.id, item)
  })
}

/**
 * 初始化表单数据
 */
async function initFormData(): Promise<void> {
  // 初始化所有组件的表单数据
  getAllWidget.value.forEach((widget) => {
    formData.value[widget.variableName] = undefined
  })

  // 加载所有数据集
  await loadAllDataset(props.formConfig.widgetList)

  // 加载字典数据
  await loadReportDictList()

  // 初始化组件
  props.formConfig.widgetList = props.formConfig.widgetList.map(widget => initFormWidget(widget))
}

/**
 * 重置过滤条件
 */
function onReset(): void {
  if (Array.isArray(filterWidgetList.value)) {
    filterWidgetList.value.forEach((widget) => {
      onValueChange(widget, undefined)
    })
  }
}

/**
 * 关闭子页面
 * @param refresh 是否刷新
 */
function onCloseSubPage(refresh?: boolean): void {
  showSubPage.value = false
}

/**
 * 跳转到子页面
 * @param pageId 页面ID
 * @param params 参数
 */
function gotoPage(pageId: string, params: Record<string, any>): void {
  showSubPage.value = true
  subPageId.value = pageId
  subPageParams.value = JSON.stringify(params || {})
}

/**
 * 图表双击事件处理
 * @param widget 组件信息
 * @param data 数据
 */
function onChartDblClick(widget: WidgetInfo, data: Record<string, any>): void {
  if (widget == null || !Array.isArray(widget.operationList))
    return

  // 下钻事件
  const drillOperation = findItemFromList(
    widget.operationList,
    SysCustomWidgetOperationType.DRILL,
    'type',
  )

  if (drillOperation?.enabled) {
    const pageId = drillOperation.pageId
    const filterList = drillOperation.filterList
    let params: Record<string, any> = {}

    if (Array.isArray(filterList)) {
      const dataset = datasetMap.value.get(widget.props?.datasetInfo?.datasetId)
      params = filterList.reduce((retObj: Record<string, any>, item: any) => {
        if (item.filterValueType === FilterValueKind.DRILL_DATA && dataset) {
          const columnId = item.paramValue
          const column = findItemFromList(dataset.columnList, columnId, 'columnId')
          if (column) {
            retObj[item.paramName] = data[column.columnName]
          }
        }
        else {
          retObj[item.paramName] = getQueryParam(item)
        }
        return retObj
      }, {})
    }

    gotoPage(pageId, params)
    return
  }

  // 路由跳转操作
  const routeOperation = findItemFromList(
    widget.operationList,
    SysCustomWidgetOperationType.ROUTE,
    'type',
  )

  if (routeOperation?.enabled && !props.isEdit) {
    const queryParams = (routeOperation.routeParams || []).reduce(
      (retObj: Record<string, any>, item: any) => {
        if (item.valueType === 'fixed') {
          retObj[item.paramName] = item.paramValue
        }
        else if (item.valueType === 'bind' && widget.dataset) {
          const column = findItemFromList(
            widget.dataset.columnList,
            item.paramValue,
            'columnId',
          )
          let columnName: string | string[]

          if (widget.dataset.datasetType === DatasetType.API) {
            columnName = []
            let currentColumn = column
            do {
              columnName.push(currentColumn.columnName)
              currentColumn = findItemFromList(
                widget.dataset.columnList,
                currentColumn.parentId,
                'columnId',
              )
            } while (currentColumn != null)
            columnName = columnName.reverse()
          }
          else {
            columnName = (column || {}).columnName
          }

          const value = getDataString(columnName, data)
          if (value)
            retObj[item.paramName] = value
        }
        return retObj
      },
      {},
    )

    router.push({
      name: routeOperation.routeName,
      query: queryParams,
    })
  }
}

/**
 * 根据配置的字段取字符串数据
 * @param columnName 字段名（可以是数组）
 * @param data 数据对象
 * @returns 字段值
 */
function getDataString(columnName: string | string[], data: Record<string, any>): any {
  if (Array.isArray(columnName)) {
    let dataValue = columnName.length > 0 ? data : undefined

    for (const name of columnName) {
      if (name == null || dataValue == null) {
        dataValue = undefined
        break
      }
      dataValue = dataValue[name]
    }
    return dataValue
  }
  return data[columnName]
}

// 提供表单上下文给子组件
provide('form', () => ({
  ...props.formConfig,
  mode: props.mode || 'mobile',
  isEdit: props.isEdit,
  formType: SysOnlineFormType.REPORT,
  readOnly: false,
  getWidgetValue,
  getWidgetVisible,
  onValueChange,
  onWidgetValueChange,
  getDictDataList,
  getQueryParam,
  listDataWithGroup,
  listDictData,
  listColumnData,
  loadDatasetInfo,
  getDropdownParams,
  onChartDblClick,
  isActive: (widget: WidgetInfo) => props.currentWidget === widget,
}))

// 监听表单配置变化
watch(
  () => props.formConfig,
  () => {
    if (props.formConfig == null)
      return
    isReady.value = false
    datasetMap.value = new Map()

    initFormData()
      .then(() => {
        isReady.value = true
      })
      .catch((e) => {
        console.error('初始化表单数据失败:', e)
        showToast({
          message: '页面初始化失败！',
          position: 'top',
        })
        setTimeout(() => {
          router.back()
        }, 1500)
      })
  },
  { immediate: true },
)
</script>

<template>
  <div class="online-report-form">
    <!-- 过滤条件区域 -->
    <div v-if="show" class="filter-box">
      <div class="filter-header">
        <span class="filter-title">筛选条件</span>
        <van-button size="small" type="default" @click="onReset">
          重置
        </van-button>
      </div>
      <div class="filter-content">
        <!-- 过滤组件将在这里渲染 -->
        <div v-for="widget in filterWidgetList" :key="widget.widgetId" class="filter-item">
          <!-- TODO: 根据组件类型渲染不同的过滤组件 -->
          <div class="filter-widget-placeholder">
            {{ widget.showName }}
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-box">
      <!-- 图表组件区域 -->
      <div v-for="widget in chartWidgetList" :key="widget.widgetId" class="chart-item">
        <!-- TODO: 根据组件类型渲染不同的图表组件 -->
        <div class="chart-widget-placeholder">
          <div class="chart-title">
            {{ widget.showName }}
          </div>
          <div class="chart-content">
            <!-- 图表内容占位 -->
            <div v-if="isChart(widget.widgetType)" class="echarts-placeholder">
              ECharts 图表区域
            </div>
            <div v-else class="widget-placeholder">
              {{ widget.widgetType }} 组件
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹出子页面 -->
    <van-popup v-model:show="showSubPage" position="left" :style="{ width: '100%', height: '100%' }">
      <ReportForm
        v-if="showSubPage && subPageId"
        :form-config="formConfig"
        :params="subPageParams"
        @close="onCloseSubPage"
      />
    </van-popup>
  </div>
</template>

<style scoped lang="less">
.online-report-form {
  min-height: 100vh;
  background: #f6f7f9;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.filter-box {
  background: #ffffff;
  padding: 12px 16px;
  position: fixed;
  left: 0;
  right: 0;
  flex-shrink: 0;
  z-index: 99999;
  border-bottom: 1px solid #ebedf0;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.filter-title {
  font-size: 14px;
  font-weight: 500;
  color: #323233;
}

.filter-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-item {
  padding: 8px 0;
}

.filter-widget-placeholder {
  padding: 12px;
  background: #f7f8fa;
  border-radius: 4px;
  font-size: 14px;
  color: #969799;
}

.main-box {
  flex: 1;
  overflow: auto;
  padding: 16px;
  margin-top: 80px;
  width: 100%;
}

.chart-item {
  margin-bottom: 16px;
}

.chart-widget-placeholder {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
}

.chart-title {
  font-size: 14px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 12px;
}

.chart-content {
  min-height: 200px;
}

.echarts-placeholder,
.widget-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background: #f7f8fa;
  border-radius: 4px;
  color: #969799;
  font-size: 14px;
}
</style>
