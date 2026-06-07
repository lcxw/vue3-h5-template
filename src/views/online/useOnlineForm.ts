import type { ComputedRef, Ref } from 'vue'
import type { ValidateRule } from '@/utils/validate'
import { showDialog, showToast } from 'vant'
/**
 * 在线表单组合式函数
 * 提供表单配置构建、数据管理、组件初始化等功能
 */
import { computed, provide, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { doUrl } from '@/common/ajax'
import * as StaticDict from '@/staticDict'
import {
  OnlineFormEventType,
  OnlineSystemVariableType,
  SysCustomWidgetBindDataType,
  SysCustomWidgetOperationType,
  SysCustomWidgetType,
  SysOnlineColumnFilterType,
  SysOnlineFieldKind,
  SysOnlineFormType,
  SysOnlineParamValueType,
  SysOnlineRelationType,
  SysOnlineRuleType,
} from '@/staticDict/index'
import { findItemFromList, formatDate } from '@/utils/index'
import { eventFunction } from '@/utils/onlineEvent'
import { validate } from '@/utils/validate'
import { getDictDataList } from './utils'

/** 表单配置类型 */
interface FormConfig {
  formId?: string
  formName?: string
  formType?: number
  labelWidth?: number
  readOnly?: boolean
  masterTableId?: string
  widgetList?: any[]
  tableWidget?: any
  leftWidget?: any
  operationList?: any[]
  formEventList?: any[]
  eventInfo?: Record<string, Function>
  rawData?: any
  datasourceMap?: Map<string, any>
  relationMap?: Map<string, any>
  tableMap?: Map<string, any>
  columnMap?: Map<string, any>
  dictMap?: Map<string, any>
  linkageMap?: Map<string, any[]>
  maskFieldList?: any[]
  customFieldList?: any[]
}

/** 组件信息 */
interface Widget {
  widgetType: number
  variableName: string
  showName: string
  bindData: {
    dataType: number
    tableId?: string
    columnId?: string
    formFieldName?: string
    systemVariableType?: number
  }
  props: {
    required?: boolean
    dictId?: string
    dictInfo?: any
    tableColumnList?: any[]
    orderList?: any[]
    relativeTable?: any
  }
  column?: any
  table?: any
  datasource?: any
  relation?: any
  dictInfo?: any
  eventList?: any[]
  eventInfo?: Record<string, Function>
  childWidgetList?: Widget[]
  operationList?: any[]
  primaryColumnName?: string
  propString?: string
  widgetImpl?: any
}

/** 表单数据 */
interface FormData {
  customField: Record<string, any>
  [key: string]: any
}

/** 表单权限项 */
interface FormAuthItem {
  disabled: boolean
  hide: boolean
  [key: string]: any
}

/** 表单权限 */
interface FormAuth {
  mobile?: Record<string, FormAuthItem>
}

/**
 * 在线表单组合式函数
 * @param formConfig - 表单配置
 * @param options - 可选配置项
 */
export function useOnlineForm(formConfig: Ref<FormConfig | null>, options: {
  readOnly?: Ref<boolean>
  isEdit?: Ref<boolean>
  masterTableData?: Ref<any>
  flowInfo?: Ref<any>
} = {}) {
  const router = useRouter()

  // 响应式状态
  const isReady = ref(false)
  const showSubPage = ref(false)
  const subFormId = ref<string | undefined>(undefined)
  const editRowData = ref<any>(undefined)
  const operationSender = ref<any>(undefined)
  const operationCallback = ref<Function | undefined>(undefined)
  const errorMessage = ref<any[]>([])
  const tableWidgetList = ref<any[]>([])
  const dropdownWidgetList = ref<any[]>([])
  const richEditWidgetList = ref<any[]>([])
  const formAuth = ref<FormAuth | undefined>(undefined)
  const widgetImplList = reactive<Record<string, any>>({})
  const formData = reactive<FormData>({
    customField: {},
  })
  const rules = reactive<Record<string, ValidateRule[]>>({})

  /**
   * 获取用户信息
   * @returns 用户信息对象
   */
  const getUserInfo = computed(() => {
    const userInfoStr = localStorage.getItem('userInfo')
    return userInfoStr ? JSON.parse(userInfoStr) : null
  })

  /**
   * 轻量级拷贝数据源对象，避免 JSON.stringify 序列化巨大的引用链
   * 只拷贝数据源自身属性 + 简化的 masterTable（列信息不含字典/规则引用）
   */
  const copyDatasourceLite = (datasource: any): any => {
    const copy: any = {}
    for (const key of Object.keys(datasource)) {
      if (key !== 'masterTable' && key !== 'relationList') {
        copy[key] = datasource[key]
      }
    }
    if (datasource.masterTable) {
      copy.masterTable = copyTableLite(datasource.masterTable)
    }
    return copy
  }

  /**
   * 轻量级拷贝表对象，只拷贝列的基础属性，不含 dictInfo / ruleList 等交叉引用
   */
  const copyTableLite = (table: any): any => {
    const copy: any = {}
    for (const key of Object.keys(table)) {
      if (key !== 'columnList' && key !== 'datasource' && key !== 'relation') {
        copy[key] = table[key]
      }
    }
    if (Array.isArray(table.columnList)) {
      copy.columnList = table.columnList.map((col: any) => {
        const colCopy: any = {}
        for (const key of Object.keys(col)) {
          if (key !== 'dictInfo' && key !== 'ruleList') {
            colCopy[key] = col[key]
          }
        }
        return colCopy
      })
    }
    return copy
  }

  /**
   * 轻量级拷贝关联对象，避免 JSON.stringify 序列化巨大引用链
   */
  const copyRelationLite = (relation: any): any => {
    const copy: any = {}
    for (const key of Object.keys(relation)) {
      if (key !== 'masterColumn' && key !== 'slaveTable' && key !== 'slaveColumn') {
        copy[key] = relation[key]
      }
    }
    return copy
  }

  /**
   * 构建表单配置
   * @param formData - 原始表单数据
   * @returns 构建后的表单配置
   */
  const buildFormConfig = (formData: FormConfig | null): FormConfig => {
    if (formData == null)
      return {} as FormConfig
    const formConfig: FormConfig = { ...formData }
    formConfig.datasourceMap = new Map()
    formConfig.relationMap = new Map()
    formConfig.tableMap = new Map()
    formConfig.columnMap = new Map()
    formConfig.dictMap = new Map()
    formConfig.linkageMap = new Map()
    const rawData = formData.rawData
    if (rawData == null)
      return formConfig

    // 字典
    if (Array.isArray(rawData.onlineDictList)) {
      rawData.onlineDictList.forEach((dict: any) => {
        formConfig.dictMap!.set(dict.dictId, dict)
      })
    }

    // 数据表
    if (Array.isArray(rawData.onlineTableList)) {
      rawData.onlineTableList.forEach((table: any) => {
        formConfig.tableMap!.set(table.tableId, table)
      })
    }

    // 字段
    if (Array.isArray(rawData.onlineColumnList)) {
      // 重置 columnList 避免多次 rebuild 时累积
      rawData.onlineTableList?.forEach((table: any) => { table.columnList = [] })
      rawData.onlineColumnList.forEach((column: any) => {
        if (column.dictId != null) {
          column.dictInfo = formConfig.dictMap!.get(column.dictId)
        }
        if (column.encodedRule != null && column.encodedRule !== null) {
          if (typeof column.encodedRule === 'string') {
            column.encodedRule = JSON.parse(column.encodedRule)
          }
        }
        // 脱敏设置
        if (Array.isArray(formConfig.maskFieldList) && formConfig.maskFieldList.length > 0) {
          formConfig.maskFieldList.forEach((item) => {
            if (Array.isArray(item) && item.length === 2) {
              if (item[0] === column.tableId && item[1] === column.columnId) {
                column.supportMaskField = true
              }
            }
          })
        }
        // 是否富文本
        column.isRichText = column.fieldKind === SysOnlineFieldKind.RICH_TEXT
        const table = formConfig.tableMap!.get(column.tableId)
        if (table) {
          table.columnList.push(column)
        }
        formConfig.columnMap!.set(column.columnId, column)
      })
    }

    // 虚拟字段
    if (Array.isArray(rawData.onlineVirtualColumnList)) {
      rawData.onlineVirtualColumnList.forEach((column: any) => {
        column.columnId = column.virtualColumnId
        column.columnComment = column.columnPrompt
        column.columnName = column.objectFieldName
        column.primaryKey = false
        column.isVirtualColumn = true
        formConfig.columnMap!.set(column.columnId, column)
      })
    }

    // 数据源
    if (Array.isArray(rawData.onlineDatasourceList)) {
      rawData.onlineDatasourceList.forEach((datasource: any) => {
        datasource.masterTable = formConfig.tableMap!.get(datasource.masterTableId)
        if (datasource.masterTable) {
          datasource.masterTable.datasource = copyDatasourceLite(datasource)
        }
        formConfig.datasourceMap!.set(datasource.datasourceId, datasource)
      })
    }

    // 关联
    if (Array.isArray(rawData.onlineDatasourceRelationList)) {
      // 重置 relationList 避免多次 rebuild 时累积
      rawData.onlineDatasourceList?.forEach((ds: any) => { ds.relationList = [] })
      rawData.onlineDatasourceRelationList.forEach((relation: any) => {
        const datasource = formConfig.datasourceMap!.get(relation.datasourceId)
        if (datasource) {
          datasource.relationList.push(relation)
        }
        relation.masterColumn = formConfig.columnMap!.get(relation.masterColumnId)
        relation.slaveTable = formConfig.tableMap!.get(relation.slaveTableId)
        if (relation.slaveTable) {
          relation.slaveTable.relation = copyRelationLite(relation)
          relation.slaveTable.datasource = datasource ? copyDatasourceLite(datasource) : undefined
        }
        relation.slaveColumn = formConfig.columnMap!.get(relation.slaveColumnId)
        formConfig.relationMap!.set(relation.relationId, relation)
      })
    }

    // 校验规则
    if (Array.isArray(rawData.onlineColumnRuleList)) {
      // 重置 ruleList 避免多次 rebuild 时累积
      rawData.onlineColumnList?.forEach((col: any) => { col.ruleList = [] })
      rawData.onlineColumnRuleList.forEach((rule: any) => {
        const column = formConfig.columnMap!.get(rule.columnId)
        if (column) {
          column.ruleList.push(rule)
        }
      })
    }

    return formConfig
  }

  /**
   * 构建后的表单配置（ref，避免 computed 重复构建导致数据丢失）
   */
  const builtFormConfig = ref<FormConfig>(buildFormConfig(formConfig.value || null))

  /**
   * 重新构建表单配置（在 formConfig 变化时调用）
   */
  const rebuildFormConfig = (): void => {
    builtFormConfig.value = buildFormConfig(formConfig.value || null)
  }

  /**
   * 获取当前构建后的表单配置
   */
  const form = computed(() => builtFormConfig.value)

  /**
   * 获取主表信息
   */
  const masterTable = computed(() => {
    return builtFormConfig.value.tableMap?.get(builtFormConfig.value.masterTableId || '')
  })

  /**
   * 是否为关联表
   */
  const isRelation = computed(() => {
    return masterTable.value?.relation != null
  })

  /**
   * 表单是否只读
   */
  const formReadOnly = computed(() => {
    return options.readOnly?.value || false
  })

  /**
   * 获取系统变量值
   * @param systemVariableType - 系统变量类型
   * @returns 系统变量值
   */
  const getSystemVariableValue = (systemVariableType: number): string | undefined => {
    switch (systemVariableType) {
      case OnlineSystemVariableType.CURRENT_USER:
        return getUserInfo.value?.showName
      case OnlineSystemVariableType.CURRENT_DEPT:
        return getUserInfo.value?.deptName
      case OnlineSystemVariableType.CURRENT_DATE:
        return formatDate(new Date(), 'YYYY-MM-DD')
      case OnlineSystemVariableType.CURRENT_TIME:
        return formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
      case OnlineSystemVariableType.FLOW_CREATE_USER:
        return (options.flowInfo?.value || {}).processInstanceInitiator || getUserInfo.value?.showName
    }
    return undefined
  }

  /**
   * 根据字段获取组件值
   * @param column - 字段信息
   * @returns 字段值
   */
  const getWidgetValueByColumn = (column: any): any => {
    if (column == null)
      return undefined
    const table = column.tableId ? builtFormConfig.value.tableMap?.get(column.tableId) : undefined
    if (table == null || table.datasource == null)
      return undefined
    return table.relation == null
      ? formData[table.datasource.variableName]?.[column.columnName]
      : formData[table.relation.variableName]?.[column.columnName]
  }

  /**
   * 获取组件值
   * @param widget - 组件信息
   * @param rowData - 行数据（可选）
   * @returns 组件值
   */
  const getWidgetValue = (widget: Widget, rowData?: any): any => {
    const data = rowData || formData
    // bindData 为空时直接返回 undefined
    if (widget.bindData == null) return undefined
    // DEBUG: 跟踪上传组件的值获取
    if (widget.widgetType === SysCustomWidgetType.Upload) {
      console.log('[getWidgetValue] Upload widget: ds=%s rel=%s col=%s bindDataType=%o formData[ds]=%o',
        widget.datasource?.variableName, widget.relation?.variableName, widget.column?.columnName,
        widget.bindData?.dataType, widget.datasource ? data[widget.datasource.variableName] : '(no ds)')
    }
    // 列表组件
    if (widget.widgetType === SysCustomWidgetType.List) {
      if (widget.relation && data[widget.relation.variableName]) {
        return data[widget.relation.variableName]
      }
      return []
    }
    if (widget.bindData.dataType === SysCustomWidgetBindDataType.Column && widget.column) {
      if (rowData != null) {
        if (formReadOnly.value || widget.widgetType === SysCustomWidgetType.Label || widget.widgetType === SysCustomWidgetType.Text) {
          const dictObj = data[`${widget.column.columnName}DictMap`]
          if (dictObj != null && dictObj.name)
            return dictObj.name
          const dictArray = data[`${widget.column.columnName}DictMapList`]
          if (Array.isArray(dictArray) && dictArray.length > 0)
            return dictArray.map(item => item.name).join(',')
        }
        return data[widget.column.columnName]
      }
      // 绑定从表字段
      if (widget.relation && data[widget.relation.variableName]) {
        if (formReadOnly.value || widget.widgetType === SysCustomWidgetType.Label || widget.widgetType === SysCustomWidgetType.Text) {
          const dictObj = data[widget.relation.variableName][`${widget.column.columnName}DictMap`]
          if (dictObj != null && dictObj.name)
            return dictObj.name
          const dictArray = data[widget.relation.variableName][`${widget.column.columnName}DictMapList`]
          if (Array.isArray(dictArray) && dictArray.length > 0)
            return dictArray.map(item => item.name).join(',')
        }
        return data[widget.relation.variableName][widget.column.columnName]
      }
      // 绑定主表字段
      if (widget.datasource && data[widget.datasource.variableName]) {
        if (formReadOnly.value || widget.widgetType === SysCustomWidgetType.Label || widget.widgetType === SysCustomWidgetType.Text) {
          const dictObj = data[widget.datasource.variableName][`${widget.column.columnName}DictMap`]
          if (dictObj != null && dictObj.name)
            return dictObj.name
          const dictArray = data[widget.datasource.variableName][`${widget.column.columnName}DictMapList`]
          if (Array.isArray(dictArray) && dictArray.length > 0) {
            return dictArray.map(item => item.name).join(',')
          }
        }
        return data[widget.datasource.variableName][widget.column.columnName]
      }
    }
    else if (widget.bindData.dataType === SysCustomWidgetBindDataType.Custom && widget.bindData.formFieldName) {
      return formData.customField[widget.bindData.formFieldName]
    }
    else if (widget.bindData.dataType === SysCustomWidgetBindDataType.SYSTEM_VARIABLE && widget.bindData.systemVariableType != null) {
      return getSystemVariableValue(widget.bindData.systemVariableType)
    }
    return undefined
  }

  /**
   * 获取组件属性路径
   * @param widget - 组件信息
   * @param value - 组件值
   * @returns 属性路径字符串
   */
  const getWidgetProp = (widget: Widget, value?: any): string | undefined => {
    if (widget.bindData == null) return undefined
    if (widget.bindData.dataType === SysCustomWidgetBindDataType.Column && widget.column) {
      if (widget.relation && formData[widget.relation.variableName]) {
        return `${widget.relation.variableName}.${widget.column.columnName}`
      }
      else if (widget.datasource && formData[widget.datasource.variableName]) {
        return `${widget.datasource.variableName}.${widget.column.columnName}`
      }
    }
    else if (widget.bindData.dataType === SysCustomWidgetBindDataType.Custom && widget.bindData.formFieldName) {
      return `customField.${widget.bindData.formFieldName}`
    }
    return undefined
  }

  /**
   * 组件值改变处理
   * @param widget - 组件信息
   * @param value - 新值
   */
  const onValueChange = (widget: Widget, value: any): void => {
    if (formReadOnly.value)
      return
    if (widget.bindData == null)
      return
    // 列表组件
    if (widget.widgetType === SysCustomWidgetType.List) {
      if (widget.relation) {
        formData[widget.relation.variableName] = value
      }
      return
    }
    if (widget.bindData.dataType === SysCustomWidgetBindDataType.Column && widget.column) {
      // 绑定从表字段
      if (widget.relation) {
        formData[widget.relation.variableName][widget.column.columnName] = value
      }
      // 绑定主表字段
      if (widget.datasource) {
        formData[widget.datasource.variableName][widget.column.columnName] = value
      }
    }
    else if (widget.bindData.dataType === SysCustomWidgetBindDataType.Custom && widget.bindData.formFieldName) {
      formData.customField[widget.bindData.formFieldName] = value
    }
  }

  /**
   * 获取组件是否可见
   * @param widget - 组件信息
   * @returns 是否可见
   */
  const getWidgetVisible = (widget: Widget): boolean => {
    if (options.isEdit?.value)
      return true
    const formWidgetAuth = formAuth.value && formAuth.value.mobile ? formAuth.value.mobile[widget.variableName] : null
    if (formWidgetAuth && formWidgetAuth.hide)
      return false
    if (widget.eventInfo && typeof widget.eventInfo[OnlineFormEventType.VISIBLE] === 'function') {
      return widget.eventInfo[OnlineFormEventType.VISIBLE]()
    }
    return true
  }

  /**
   * 获取操作权限码
   * @param operation - 操作信息
   * @returns 权限码字符串
   */
  const getOperationPermCode = (operation: any): string => {
    let temp = 'view'
    switch (operation.type) {
      case SysCustomWidgetOperationType.ADD:
      case SysCustomWidgetOperationType.EDIT:
      case SysCustomWidgetOperationType.DELETE:
      case SysCustomWidgetOperationType.BATCH_DELETE:
        temp = 'edit'
        break
      default:
        temp = 'view'
    }
    if (masterTable.value && masterTable.value.datasource) {
      return `online:${masterTable.value.datasource.variableName}:${temp}`
    }
    return ''
  }

  /**
   * 获取脚本函数
   * @param eventInfo - 事件信息
   * @param eventType - 事件类型
   * @returns 函数或null
   */
  const getScriptFunction = (eventInfo: Record<string, Function> | undefined, eventType: string): Function | null => {
    // 在 Web 环境下，直接检查函数是否存在
    if (eventInfo && typeof eventInfo[eventType] === 'function') {
      return eventInfo[eventType]
    }
    return null
  }

  /**
   * 检查操作权限码是否存在
   * @param permCode - 权限码
   * @returns 是否存在权限
   */
  const checkPermCodeExist = (permCode: string): boolean => {
    // TODO: 实现权限检查逻辑
    return true
  }

  /**
   * 检查操作是否有权限
   * @param operation - 操作信息
   * @returns 是否有权限
   */
  const checkOperationPermCode = (operation: any): boolean => {
    if (builtFormConfig.value.formType !== SysOnlineFormType.QUERY || options.isEdit?.value)
      return true
    return checkPermCodeExist(getOperationPermCode(operation))
  }

  /**
   * 检查操作是否禁用
   * @param operation - 操作信息
   * @param rowData - 行数据
   * @returns 是否禁用
   */
  const checkOperationDisabled = (operation: any, rowData?: any): boolean => {
    if (options.isEdit?.value)
      return false
    if (operation == null)
      return true
    const fun = getScriptFunction(operation.eventInfo, OnlineFormEventType.OPERATION_DISABLED)
    return fun ? fun(rowData) : false
  }

  /**
   * 检查操作是否可见
   * @param operation - 操作信息
   * @param rowData - 行数据
   * @returns 是否可见
   */
  const checkOperationVisible = (operation: any, rowData?: any): boolean => {
    if (options.isEdit?.value)
      return true
    if (operation == null)
      return false
    const fun = getScriptFunction(operation.eventInfo, OnlineFormEventType.OPERATION_VISIBLE)
    return fun ? fun(rowData) : true
  }

  /**
   * 组件值改变事件处理（带详情）
   * @param widget - 组件信息
   * @param value - 新值
   * @param detail - 详情信息
   */
  const onWidgetValueChange = (widget: Widget, value: any, detail?: any): void => {
    if (formReadOnly.value)
      return
    if (widget.bindData == null)
      return
    const dictData = (detail || {}).dictData
    // 更新字典数据
    if (dictData != null) {
      if (widget.bindData.dataType === SysCustomWidgetBindDataType.Column && widget.column) {
        if (widget.relation) {
          if (Array.isArray(dictData)) {
            formData[widget.relation.variableName][`${widget.column.columnName}DictMapList`] = dictData
          }
          else {
            formData[widget.relation.variableName][`${widget.column.columnName}DictMap`] = dictData
          }
        }
        if (widget.datasource) {
          if (Array.isArray(dictData)) {
            formData[widget.datasource.variableName][`${widget.column.columnName}DictMapList`] = dictData
          }
          else {
            formData[widget.datasource.variableName][`${widget.column.columnName}DictMap`] = dictData
          }
        }
      }
      else if (widget.bindData.dataType === SysCustomWidgetBindDataType.Custom && widget.bindData.formFieldName) {
        if (Array.isArray(dictData)) {
          formData.customField[`${widget.bindData.formFieldName}DictMapList`] = dictData
        }
        else {
          formData.customField[`${widget.bindData.formFieldName}DictMap`] = dictData
        }
      }
    }
    // 一对一关联选择组件
    if (widget.widgetType === SysCustomWidgetType.DataSelect
      && (builtFormConfig.value.formType === SysOnlineFormType.FORM || builtFormConfig.value.formType === SysOnlineFormType.FLOW)) {
      const selectRow = (detail || {}).selectRow
      const relationId = (widget.props.relativeTable || {}).relationId
      const relation = builtFormConfig.value.relationMap?.get(relationId)
      if (relation != null) {
        formData[relation.variableName] = selectRow || {}
      }
    }
    const fun = getScriptFunction(widget.eventInfo, OnlineFormEventType.CHANGE)
    fun && fun(value, detail)
  }

  /**
   * 获取主键数据
   * @param widget - 组件信息
   * @param data - 数据对象
   * @returns 主键值
   */
  const getPrimaryData = (widget: Widget, data?: any): any => {
    let primaryKey: string | undefined
    if (widget && widget.table && Array.isArray(widget.table.columnList)) {
      widget.table.columnList.forEach((column: any) => {
        if (column.primaryKey)
          primaryKey = column.columnName
      })
    }
    if (primaryKey != null) {
      let tempData: any
      if (data != null) {
        tempData = widget.relation == null ? data : data[widget.relation.variableName]
      }
      else {
        tempData = widget.relation == null
          ? formData[widget.datasource?.variableName || '']
          : formData[widget.relation.variableName]
      }
      if (tempData != null) {
        if (Array.isArray(tempData)) {
          return tempData[0][primaryKey]
        }
        else {
          return tempData[primaryKey]
        }
      }
    }
    return undefined
  }

  /**
   * 创建事件函数的上下文对象
   * 模拟 Vue 2 组件实例的 this，使事件脚本可以通过 this.formData 等访问数据
   */
  const buildEventContext = (): Record<string, any> => ({
    formData,
    form: builtFormConfig.value,
    masterTable: masterTable.value,
    isRelation,
    isReady: isReady.value,
    readOnly: formReadOnly.value,
    formAuth: formAuth.value,
    flowData: options.flowInfo?.value,
    getWidgetValue,
    getWidgetValueByColumn,
    onValueChange,
    getDropdownParams,
    getDictDataList,
    getPrimaryData,
    getWidgetVisible,
    getSystemVariableValue,
  })

  /**
   * 将事件函数绑定到表单上下文
   * @param fun - 事件函数
   */
  const bindEvent = (fun: Function | null): Function | null => {
    return fun ? fun.bind(buildEventContext()) : null
  }

  /**
   * 初始化表单组件列表
   */
  const initFormWidgetList = (): void => {
    if (Array.isArray(builtFormConfig.value.operationList)) {
      builtFormConfig.value.operationList.forEach((operation) => {
        operation.eventInfo = (operation.eventList || []).reduce((retObj: Record<string, Function>, event: any) => {
          const fun = bindEvent(eventFunction(event))
          if (fun)
            retObj[event.eventType] = fun
          return retObj
        }, {})
      })
    }
    if (Array.isArray(builtFormConfig.value.formEventList)) {
      builtFormConfig.value.eventInfo = builtFormConfig.value.formEventList.reduce((retObj: Record<string, Function>, event: any) => {
        const fun = bindEvent(eventFunction(event))
        if (fun)
          retObj[event.eventType] = fun
        return retObj
      }, {})
    }
    else {
      builtFormConfig.value.eventInfo = {}
    }
    errorMessage.value = []
    if (Array.isArray(builtFormConfig.value.widgetList)) {
      builtFormConfig.value.widgetList.forEach((widget) => {
        initWidget(widget)
      })
    }
    if (builtFormConfig.value.tableWidget) {
      initWidget(builtFormConfig.value.tableWidget)
      builtFormConfig.value.tableWidget.table = masterTable.value
      if (builtFormConfig.value.tableWidget.table) {
        if (builtFormConfig.value.tableWidget.table.datasource) {
          builtFormConfig.value.tableWidget.datasource = builtFormConfig.value.tableWidget.table.datasource
        }
        if (builtFormConfig.value.tableWidget.table.relation) {
          builtFormConfig.value.tableWidget.relation = builtFormConfig.value.tableWidget.table.relation
        }
      }
    }
    if (builtFormConfig.value.leftWidget)
      initWidget(builtFormConfig.value.leftWidget)
    if (errorMessage.value.length > 0) {
      console.error(errorMessage.value)
    }
  }

  /**
   * 初始化单个组件
   * @param widget - 组件信息
   */
  const initWidget = (widget: Widget): void => {
    if (widget != null) {
      if (widget.bindData.tableId) {
        widget.table = builtFormConfig.value.tableMap?.get(widget.bindData.tableId)
      }
      if (widget.bindData.columnId) {
        widget.column = builtFormConfig.value.columnMap?.get(widget.bindData.columnId)
      }
      if (widget.bindData.dataType === SysCustomWidgetBindDataType.Custom) {
        if (widget.props.dictId != null) {
          widget.dictInfo = builtFormConfig.value.dictMap?.get(widget.props.dictId)
        }
      }
      else {
        widget.dictInfo = (widget.column || {}).dictInfo
      }
      if (widget.table) {
        if (widget.table.datasource)
          widget.datasource = widget.table.datasource
        if (widget.table.relation)
          widget.relation = widget.table.relation
      }
      if (widget.widgetType === SysCustomWidgetType.RichEditor) {
        richEditWidgetList.value.push(widget)
      }
      widget.propString = getWidgetProp(widget)

      // 初始化组件下拉字典参数
      if (widget.props.dictInfo && Array.isArray(widget.props.dictInfo.paramList)) {
        widget.props.dictInfo.paramList.forEach((param: any) => {
          if (param.dictValueType === SysOnlineParamValueType.STATIC_DICT) {
            let errorItem: any = null
            if (Array.isArray(param.dictValue) && param.dictValue.length === 2) {
              const staticDict = (StaticDict as any)[param.dictValue[0]]
              if (staticDict == null) {
                errorItem = {
                  widget,
                  message: `组件字典参数${param.dictParamName}绑定的静态字典 [${param.dictValue[0]}] 并不存在！`,
                }
              }
              else {
                if (staticDict.getValue(param.dictValue[1]) == null) {
                  errorItem = {
                    widget,
                    message: `组件字典参数${param.dictParamName}绑定的静态字典值并不属于静态字段 [${param.dictValue[0]}] ！`,
                  }
                }
              }
            }
            else {
              errorItem = {
                widget,
                message: `组件字典参数${param.dictParamName}绑定的静态字典错误！`,
              }
            }
            if (errorItem != null)
              errorMessage.value.push(errorItem)
          }
        })
      }
      if (widget.props.dictInfo && widget.props.dictInfo.dictId) {
        widget.props.dictInfo.dict = builtFormConfig.value.dictMap?.get(widget.props.dictInfo.dictId)
      }
      if (widget.column && widget.column.dictInfo != null) {
        dropdownWidgetList.value.push(widget)
      }
      // 初始化表格列
      if (widget.widgetType === SysCustomWidgetType.Table || widget.widgetType === SysCustomWidgetType.List) {
        widget.primaryColumnName = undefined
        if (widget.table && Array.isArray(widget.table.columnList)) {
          for (let i = 0; i < widget.table.columnList.length; i++) {
            if (widget.table.columnList[i].primaryKey) {
              widget.primaryColumnName = widget.table.columnList[i].columnName
              break
            }
          }
        }
        if (Array.isArray(widget.props.tableColumnList)) {
          widget.props.tableColumnList.forEach((tableColumn) => {
            tableColumn.table = builtFormConfig.value.tableMap?.get(tableColumn.tableId)
            tableColumn.column = builtFormConfig.value.columnMap?.get(tableColumn.columnId)
            tableColumn.relation = builtFormConfig.value.relationMap?.get(tableColumn.relationId)
            if (tableColumn.table == null || tableColumn.column == null) {
              errorMessage.value.push({
                widget,
                message: `表格列 [${tableColumn.showName}] 绑定的字段不存在！`,
              })
            }
          })
        }
        // 操作排序
        if (Array.isArray(widget.operationList)) {
          widget.operationList = (widget.operationList || []).sort((value1: any, value2: any) => {
            return (value1.showOrder || 0) - (value2.showOrder || 0)
          })
          widget.operationList.forEach((operation) => {
            operation.eventInfo = (operation.eventList || []).reduce((retObj: Record<string, Function>, event: any) => {
              const fun = bindEvent(eventFunction(event))
              if (fun)
                retObj[event.eventType] = fun
              return retObj
            }, {})
          })
        }
        tableWidgetList.value.push(widget)
      }

      if (Array.isArray(widget.childWidgetList)) {
        widget.childWidgetList.forEach((subWidget) => {
          initWidget(subWidget)
        })
      }

      if (widget.props && widget.props.dictInfo) {
        if (Array.isArray(widget.props.dictInfo.paramList)) {
          widget.props.dictInfo.paramList.forEach((dictParam: any) => {
            if (dictParam.dictValueType === SysOnlineParamValueType.TABLE_COLUMN) {
              let linkageItem = builtFormConfig.value.linkageMap?.get(dictParam.dictValue)
              if (linkageItem == null) {
                linkageItem = []
                builtFormConfig.value.linkageMap!.set(dictParam.dictValue, linkageItem)
              }
              linkageItem.push(widget)
            }
          })
        }
      }

      if (Array.isArray(widget.eventList)) {
        widget.eventInfo = widget.eventList.reduce((retObj: Record<string, Function>, event: any) => {
          const fun = bindEvent(eventFunction(event))
          if (fun)
            retObj[event.eventType] = fun
          return retObj
        }, {})
      }
      else {
        widget.eventInfo = {}
      }
    }
  }

  /**
   * 构建校验规则项
   * @param column - 字段信息
   * @param rule - 规则信息
   * @param trigger - 触发方式
   * @returns 校验规则项
   */
  const buildRuleItem = (column: any, rule: any, trigger: 'onBlur' | 'onChange' = 'onBlur'): ValidateRule | undefined => {
    if (rule.propDataJson) {
      rule.data = typeof rule.propDataJson === 'string' ? JSON.parse(rule.propDataJson) : rule.propDataJson
    }
    if (column != null && rule != null) {
      switch (rule.onlineRule.ruleType) {
        case SysOnlineRuleType.INTEGER_ONLY:
          return { type: 'integer', message: rule.data.message, trigger, transform: (value: any) => Number(value) }
        case SysOnlineRuleType.DIGITAL_ONLY:
          return { type: 'number', message: rule.data.message, trigger, transform: (value: any) => Number(value) }
        case SysOnlineRuleType.LETTER_ONLY:
          return { type: 'string', pattern: /^[a-z]+$/i, message: rule.data.message, trigger }
        case SysOnlineRuleType.EMAIL:
          return { type: 'email', message: rule.data.message, trigger }
        case SysOnlineRuleType.MOBILE:
          return { type: 'string', pattern: /^((\+?86)|(\(\+86\)))?(13[0-35-9]\d{8}|15[0-35-9]\d{8}|17[0-35-9]\d{8}|19[0-35-9]\d{8}|18[0235-9]\d{8}|147\d{8}|1349\d{7})$/, message: rule.data.message, trigger }
        case SysOnlineRuleType.RANGE:
          if (column) {
            const isNumber = !['Boolean', 'Date', 'String'].includes(column.objectFieldType)
            return { type: isNumber ? 'number' : 'string', min: rule.data.min, max: rule.data.max, message: rule.data.message, trigger }
          }
          break
        case SysOnlineRuleType.CUSTOM:
          return { type: 'string', pattern: new RegExp(rule.onlineRule.pattern), message: rule.data.message, trigger }
      }
    }
    return undefined
  }

  /**
   * 构建组件校验规则
   * @param widget - 组件信息
   * @param rulesObj - 规则对象
   */
  const buildWidgetRule = (widget: Widget, rulesObj: Record<string, ValidateRule[]>): void => {
    if (widget != null) {
      let widgetRuleKey: string | undefined
      if (widget.bindData.dataType === SysCustomWidgetBindDataType.Custom) {
        widgetRuleKey = `customField.${widget.bindData.formFieldName}`
      }
      else if (widget.bindData.dataType === SysCustomWidgetBindDataType.Column && widget.column) {
        widgetRuleKey = `${widget.relation ? widget.relation.variableName : widget.datasource?.variableName}.${widget.column.columnName}`
      }
      if (widgetRuleKey && (widget.props.required || (widget.column && Array.isArray(widget.column.ruleList)))) {
        rulesObj[widgetRuleKey] = []
        // 必填验证
        if (widget.props.required) {
          rulesObj[widgetRuleKey].push({
            required: true,
            type: 'string',
            message: `${widget.showName}不能为空！`,
            trigger: 'onChange',
            transform: () => {
              const widgetValue = getWidgetValue(widget)
              if (widgetValue == null)
                return undefined
              return widgetValue.toString()
            },
          })
        }
        // 其他验证
        if (widget.column && Array.isArray(widget.column.ruleList)) {
          widget.column.ruleList.forEach((rule: any) => {
            const ruleItem = buildRuleItem(widget.column, rule, 'onChange')
            if (ruleItem)
              rulesObj[widgetRuleKey!].push(ruleItem)
          })
        }
      }
      if (Array.isArray(widget.childWidgetList)) {
        widget.childWidgetList.forEach((subWidget) => {
          buildWidgetRule(subWidget, rulesObj)
        })
      }
    }
  }

  /**
   * 初始化组件校验规则
   */
  const initWidgetRule = (): void => {
    const rulesObj: Record<string, ValidateRule[]> = {}
    if (Array.isArray(builtFormConfig.value.widgetList)) {
      builtFormConfig.value.widgetList.forEach((widget) => {
        buildWidgetRule(widget, rulesObj)
      })
    }
    Object.assign(rules, rulesObj)
  }

  /**
   * 重置组件
   * @param widget - 组件信息
   */
  const resetWidget = (widget: Widget): void => {
    const widgetImpl = widgetImplList[(widget || {}).variableName]
    if (widgetImpl && typeof widgetImpl.reset === 'function') {
      widgetImpl.reset()
      onValueChange(widget, undefined)
    }
  }

  /**
   * 初始化组件联动
   */
  const initWidgetLinkage = (): void => {
    if (!builtFormConfig.value.linkageMap)
      return
    builtFormConfig.value.linkageMap.forEach((widgetList, key) => {
      const column = builtFormConfig.value.columnMap?.get(key)
      const table = column ? builtFormConfig.value.tableMap?.get(column.tableId) : undefined
      if (!table)
        return
      const watchKey = `formData.${table.relation == null ? table.datasource.variableName : table.relation.variableName}.${column.columnName}`
      watch(() => formData[table.relation == null ? table.datasource.variableName : table.relation.variableName]?.[column.columnName], (newValue) => {
        if (Array.isArray(widgetList)) {
          widgetList.forEach((widget) => {
            resetWidget(widget)
          })
        }
      })
    })
  }

  /**
   * 获取参数值
   * @param valueType - 值类型
   * @param valueData - 值数据
   * @returns 参数值
   */
  const getParamValue = (valueType: number, valueData: any): any => {
    switch (valueType) {
      case SysOnlineParamValueType.TABLE_COLUMN:
        const column = builtFormConfig.value.columnMap?.get(valueData)
        return column ? getWidgetValueByColumn(column) : undefined
      case SysOnlineParamValueType.STATIC_DICT:
        return Array.isArray(valueData) ? valueData[1] : undefined
      case SysOnlineParamValueType.INPUT_VALUE:
        return valueData
    }
    return undefined
  }

  /**
   * 获取下拉参数
   * @param widget - 组件信息
   * @returns 参数对象
   */
  const getDropdownParams = (widget: Widget): Record<string, any> => {
    if (Array.isArray(widget.props.dictInfo?.paramList)) {
      const params: Record<string, any> = {}
      for (let i = 0; i < widget.props.dictInfo.paramList.length; i++) {
        const dictParam = widget.props.dictInfo.paramList[i]
        if (dictParam.dictValue == null || dictParam.dictValueType == null)
          continue
        params[dictParam.dictParamName] = getParamValue(dictParam.dictValueType, dictParam.dictValue)
      }
      return params
    }
    return {}
  }

  /**
   * 获取表忽略脱敏字段列表
   * @param table - 表信息
   * @param ignoreList - 忽略列表
   */
  const getTableIgnoreFieldList = (table: any, ignoreList: string[] = []): void => {
    if (table == null)
      return
    if (Array.isArray(table.columnList) && table.columnList.length > 0) {
      table.columnList.forEach((column: any) => {
        if (!column.supportMaskField && column.fieldKind === SysOnlineFieldKind.FIELD_MASK) {
          ignoreList.push(`${table.tableName}.${column.columnName}`)
        }
      })
    }
  }

  /**
   * 获取忽略脱敏字段
   * @param widget - 组件信息
   * @returns 忽略字段字符串
   */
  const getIgnoreMaskFields = (widget?: Widget): string | undefined => {
    const tempList: string[] = []
    if (widget == null) {
      // 返回所有忽略字段
      builtFormConfig.value.tableMap?.forEach((table) => {
        getTableIgnoreFieldList(table, tempList)
      })
    }
    else {
      if (widget.relation == null) {
        if (widget.datasource) {
          // 组件绑定的主表，返回主表以及一对一从表忽略字段
          getTableIgnoreFieldList(widget.datasource.masterTable, tempList)
        }
        if (widget.datasource && Array.isArray(widget.datasource.relationList)) {
          widget.datasource.relationList.forEach((relation: any) => {
            if (relation.relationType === SysOnlineRelationType.ONE_TO_ONE) {
              getTableIgnoreFieldList(relation.slaveTable, tempList)
            }
          })
        }
      }
      else {
        // 组件绑定的从表，仅返回从表的忽略字段
        getTableIgnoreFieldList(widget.relation.slaveTable, tempList)
      }
    }
    return tempList.length > 0 ? tempList.join(',') : undefined
  }

  /**
   * 初始化页面数据
   */
  const initPage = (): void => {
    if (!builtFormConfig.value.tableMap)
      return
    builtFormConfig.value.tableMap.forEach((table) => {
      if (table.relation == null) {
        // 主表
        const tempObj = Array.isArray(table.columnList)
          ? table.columnList.reduce((retObj: Record<string, any>, column: any) => {
              retObj[column.columnName] = column.objectFieldType === 'Boolean' ? false : undefined
              return retObj
            }, {})
          : {}
        formData[table.datasource.variableName] = tempObj
      }
      else {
        if (table.relation.relationType === SysOnlineRelationType.ONE_TO_ONE) {
          // 一对一关联从表
          const tempObj = Array.isArray(table.columnList)
            ? table.columnList.reduce((retObj: Record<string, any>, column: any) => {
                retObj[column.columnName] = column.objectFieldType === 'Boolean' ? false : undefined
                return retObj
              }, {})
            : {}
          formData[table.relation.variableName] = tempObj
        }
        else if (table.relation.relationType === SysOnlineRelationType.ONE_TO_MANY) {
          // 一对多关联从表
          if (masterTable.value?.relation != null && masterTable.value.relation.relationId === table.relation.relationId) {
            // 表单主表是当前一对多从表
            const tempObj = Array.isArray(table.columnList)
              ? table.columnList.reduce((retObj: Record<string, any>, column: any) => {
                  retObj[column.columnName] = undefined
                  return retObj
                }, {})
              : {}
            formData[table.relation.variableName] = tempObj
          }
          else {
            formData[table.relation.variableName] = []
          }
        }
      }
    })
    // 初始化自定义字段
    if (Array.isArray(builtFormConfig.value.customFieldList)) {
      builtFormConfig.value.customFieldList.forEach((field) => {
        formData.customField[field.fieldName] = undefined
      })
    }
  }

  /**
   * 检查是否有操作
   * @param type - 操作类型
   * @returns 是否有操作
   */
  const hasOperator = (type: number): boolean => {
    const temp = getOperation(type)
    return temp && temp.enabled
  }

  /**
   * 获取操作
   * @param type - 操作类型
   * @returns 操作信息
   */
  const getOperation = (type: number): any => {
    return findItemFromList(builtFormConfig.value.operationList || [], type, 'type')
  }

  /**
   * 操作是否可见
   * @param type - 操作类型
   * @returns 是否可见
   */
  const operationVisible = (type: number): boolean => {
    const operation = getOperation(type)
    return !builtFormConfig.value.readOnly && hasOperator(type) && checkOperationVisible(operation)
  }

  /**
   * 刷新回调（空实现，可被子组件覆盖）
   */
  const onRefresh = (): void => {}

  /**
   * 处理操作
   * @param operation - 操作信息
   * @param data - 数据
   * @param sender - 发送者
   * @param callback - 回调函数
   */
  const handlerOperation = (operation: any, data: any, sender?: any, callback?: Function): void => {
    if (operation.type === SysCustomWidgetOperationType.BATCH_DELETE) {
      batchDelete(data)
    }
    else if (operation.type === SysCustomWidgetOperationType.DELETE) {
      deleteRow(data)
    }
    else {
      handlerForm(operation, data, sender, callback)
    }
  }

  /**
   * 批量删除表格数据
   * @param batchDeleteRows - 要删除的行数据列表
   */
  const batchDelete = (batchDeleteRows: any[]): void => {
    const table = (builtFormConfig.value as any).queryTable?.table
    if (!table)
      return
    const params = {
      datasourceId: table.datasource.datasourceId,
      relationId: (table.relation || {}).relationId,
      dataIdList: batchDeleteRows.map((item) => {
        return item[(table.primaryKeyColumn || {}).columnName]
      }),
    }
    let httpCall: Promise<any>
    if (params.relationId) {
      httpCall = doUrl(`/admin/online/onlineOperation/deleteBatchOneToManyRelation/${table.datasource.variableName}`, 'post', params)
    }
    else {
      httpCall = doUrl(`/admin/online/onlineOperation/deleteBatchDatasource/${table.datasource.variableName}`, 'post', params)
    }
    httpCall.then(() => {
      showToast({
        message: '删除成功！',
      })
      onRefresh()
    }).catch((e) => {
      console.error(e)
    })
  }

  /**
   * 删除数据
   * @param row - 要删除的行数据
   */
  const deleteRow = (row: any): void => {
    const table = (builtFormConfig.value as any).queryTable?.table
    if (!table)
      return
    const params = {
      datasourceId: table.datasource.datasourceId,
      relationId: (table.relation || {}).relationId,
      dataId: row[(table.primaryKeyColumn || {}).columnName],
    }
    let httpCall: Promise<any>
    if (params.relationId) {
      httpCall = doUrl(`/admin/online/onlineOperation/deleteOneToManyRelation/${table.datasource.variableName}`, 'post', params)
    }
    else {
      httpCall = doUrl(`/admin/online/onlineOperation/deleteDatasource/${table.datasource.variableName}`, 'post', params)
    }
    httpCall.then(() => {
      showToast({
        message: '删除成功！',
      })
      onRefresh()
    }).catch((e) => {
      console.error(e)
    })
  }

  /**
   * 页面操作处理
   * @param operation - 操作信息
   * @param row - 行数据
   * @param sender - 发送者
   * @param callback - 回调函数
   */
  const handlerForm = (operation: any, row: any, sender?: any, callback?: Function): void => {
    const formId = operation.formId
    if (formId == null) {
      showToast({
        message: '操作绑定表单不存在！',
      })
      return
    }
    showSubPage.value = true
    subFormId.value = operation.formId
    editRowData.value = row || null
    operationSender.value = sender
    operationCallback.value = callback
  }

  /**
   * 获取查询参数
   * @param filterWidgetList - 过滤组件列表
   * @returns 查询参数数组
   */
  const getQueryParams = (filterWidgetList: Widget[]): any[] => {
    if (Array.isArray(filterWidgetList)) {
      return filterWidgetList.map((widget) => {
        if (widget.bindData.dataType !== SysCustomWidgetBindDataType.Column || widget.column == null)
          return null
        const paramValue = getWidgetValue(widget)
        if (paramValue == null || paramValue === '' || (Array.isArray(paramValue) && paramValue.length === 0))
          return null
        const temp: any = {
          tableName: widget.table?.tableName,
          columnName: widget.column.columnName,
          filterType: widget.column.filterType,
          columnValue: widget.column.filterType !== SysOnlineColumnFilterType.RANFGE_FILTER ? paramValue : undefined,
        }
        if (widget.column.filterType === SysOnlineColumnFilterType.RANFGE_FILTER) {
          temp.columnValueStart = paramValue[0]
          temp.columnValueEnd = paramValue[1]
        }
        return temp
      }).filter(item => item != null)
    }
    return []
  }

  /**
   * 显示消息
   * @param type - 消息类型
   * @param message - 消息内容
   */
  const showMessage = (type: string, message: string): void => {
    showToast({
      message,
    })
  }

  /**
   * 提供表单上下文给子组件
   */
  const provideFormContext = () => {
    provide('form', () => ({
      ...builtFormConfig.value,
      readOnly: formReadOnly.value,
      getWidgetValue,
      onValueChange,
      getWidgetVisible,
      onWidgetValueChange,
      getDictDataList,
      getDropdownParams,
      getPrimaryData,
      masterTable: masterTable.value,
      handlerOperation,
      checkOperationVisible,
      checkOperationDisabled,
      formData,
      rules,
      widgetImplList,
      formAuth: formAuth.value,
      flowData: options.flowInfo?.value,
    }))
  }

  return {
    // 状态
    isReady,
    showSubPage,
    subFormId,
    editRowData,
    operationSender,
    operationCallback,
    errorMessage,
    tableWidgetList,
    dropdownWidgetList,
    richEditWidgetList,
    formAuth,
    widgetImplList,
    formData,
    rules,
    // 计算属性
    form,
    masterTable,
    isRelation,
    formReadOnly,
    getUserInfo,
    // 方法
    rebuildFormConfig,
    buildFormConfig,
    getSystemVariableValue,
    getWidgetValueByColumn,
    getWidgetValue,
    getWidgetProp,
    onValueChange,
    getWidgetVisible,
    getOperationPermCode,
    getScriptFunction,
    checkOperationPermCode,
    checkOperationDisabled,
    checkOperationVisible,
    onWidgetValueChange,
    getPrimaryData,
    initFormWidgetList,
    initWidget,
    buildRuleItem,
    buildWidgetRule,
    initWidgetRule,
    resetWidget,
    initWidgetLinkage,
    getParamValue,
    getDropdownParams,
    getTableIgnoreFieldList,
    getIgnoreMaskFields,
    initPage,
    hasOperator,
    getOperation,
    operationVisible,
    onRefresh,
    handlerOperation,
    batchDelete,
    deleteRow,
    handlerForm,
    getQueryParams,
    showMessage,
    provideFormContext,
    // 工具
    doUrl,
    getDictDataList,
  }
}
