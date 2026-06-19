import { OnlineOperation } from '@/api/OnlineFormController/OnlineOperation'
import { doUrl } from '@/common/ajax'
/**
 * 在线表单工具函数
 * 提供字典数据获取、权限码计算等功能
 */
import * as StaticDict from '@/staticDict'
import { SysCustomWidgetOperationType, SysCustomWidgetType } from '@/staticDict/index'
import { SysOnlineDictType } from '@/staticDict/onlineStaticDict'

/** 字典项数据结构 */
interface DictItem {
  id: string | number
  name: string
  parentId?: string | number
}

/** 字典信息 */
interface DictInfo {
  dictId: string | number
  dictName: string
  dictType: number
  dictDataJson: string
  dictListUrl?: string
  keyColumnName?: string
  valueColumnName?: string
  parentKeyColumnName?: string
}

/** 字典参数项 */
interface DictParam {
  dictParamName: string
  dictValueType: number
  dictValue: any
}

/**
 * 获取数据表字典数据
 * @param sender - 请求发起者（用于传递上下文）
 * @param dictId - 字典ID
 * @param dictParams - 字典参数
 * @returns Promise，返回字典数据列表
 */
function getTableDictData(sender: any, dictId: string | number, dictParams?: Record<string, any>): Promise<DictItem[]> {
  return new Promise((resolve, reject) => {
    const filterDtoList = dictParams
      ? Object.keys(dictParams).map((key) => {
          return {
            columnName: key,
            columnValue: dictParams[key],
          }
        })
      : []
    const params = {
      dictId,
      filterDtoList,
    }
    OnlineOperation.listDict(params).then((res) => {
      resolve(res)
    }).catch((e) => {
      reject(e)
    })
  })
}

/**
 * 通过URL获取字典数据
 * @param url - 请求URL
 * @param params - 请求参数
 * @param dictInfo - 字典信息
 * @param methods - 请求方法
 * @returns Promise，返回字典数据列表
 */
function getDictDataByUrl(url: string, params: Record<string, any>, dictInfo: DictInfo, methods: string = 'get'): Promise<DictItem[]> {
  return new Promise((resolve, reject) => {
    doUrl(url, methods, params).then((res) => {
      if (Array.isArray(res)) {
        resolve(res.map((item) => {
          return {
            id: item[dictInfo.keyColumnName || 'id'],
            name: item[dictInfo.valueColumnName || 'name'],
            parentId: item[dictInfo.parentKeyColumnName || 'parentId'],
          }
        }))
      }
      else {
        reject(new Error('返回数据格式错误'))
      }
    }).catch((e) => {
      reject(e)
    })
  })
}

/**
 * 获取URL字典数据
 * @param dictInfo - 字典信息
 * @param dictParams - 字典参数
 * @returns Promise，返回字典数据列表
 */
function getUrlDictData(dictInfo: DictInfo, dictParams?: Record<string, any>): Promise<DictItem[]> {
  const url = dictInfo.dictListUrl
  if (url != null && url !== '') {
    return getDictDataByUrl(url, dictParams || {}, dictInfo, 'get')
  }
  else {
    console.error(`字典 [${dictInfo.dictName}] url为空`)
    return Promise.reject(new Error('字典URL为空'))
  }
}

/**
 * 获取字典数据
 * @param sender - 请求发起者（用于传递上下文）
 * @param dictInfo - 字典配置对象
 * @param dictParams - 获取字典时传入的参数，仅对于数据表字典和URL字典有效
 * @returns Promise，返回字典数据
 */
export function getDictDataList(sender: any, dictInfo: DictInfo | null | undefined, dictParams?: Record<string, any>): Promise<DictItem[]> {
  if (dictInfo == null)
    return Promise.reject(new Error('字典信息为空'))
  
  // TABLE 和 CODE 类型通过接口获取数据，不需要 dictDataJson
  if (dictInfo.dictType === SysOnlineDictType.TABLE || dictInfo.dictType === SysOnlineDictType.CODE) {
    return getTableDictData(sender, dictInfo.dictId, dictParams)
  }
  
  // URL 类型通过 URL 获取数据，不需要 dictDataJson
  if (dictInfo.dictType === SysOnlineDictType.URL) {
    return getUrlDictData(dictInfo, dictParams || {})
  }
  
  // 以下类型需要 dictDataJson
  if (dictInfo.dictDataJson == null)
    return Promise.reject(new Error('字典数据为空'))
  
  let dictData: any
  try {
    dictData = JSON.parse(dictInfo.dictDataJson)
  }
  catch (e) {
    return Promise.reject(new Error('字典数据解析失败'))
  }
  
  switch (dictInfo.dictType) {
    case SysOnlineDictType.CUSTOM:
      if (dictData != null && Array.isArray(dictData.dictData)) {
        return Promise.resolve(dictData.dictData)
      }
      else {
        return Promise.reject(new Error('获取自定义字典数据错误！'))
      }
    case SysOnlineDictType.STATIC:
      if (dictData != null && dictData.staticDictName != null && (StaticDict as any)[dictData.staticDictName] != null) {
        return Promise.resolve((StaticDict as any)[dictData.staticDictName].getList())
      }
      else {
        return Promise.reject(new Error('未知的静态字典！'))
      }
    default:
      return Promise.reject(new Error('未知的字典类型！'))
  }
}

/**
 * 获取操作的权限码
 * @param widget - 组件信息
 * @param operation - 操作信息
 * @returns 权限码字符串
 */
export function getOperationPermCode(widget: any, operation: any): string {
  const datasourceVariableName = (widget.datasource || {}).variableName
  let temp = 'view'
  switch (operation.type) {
    case SysCustomWidgetOperationType.ADD:
    case SysCustomWidgetOperationType.EDIT:
    case SysCustomWidgetOperationType.DELETE:
      temp = 'edit'
      break
    default:
      temp = 'view'
  }
  return `online:${datasourceVariableName}:${temp}`
}

/**
 * 判断组件类型是否为图表类型
 * @param widgetType - 组件类型
 * @returns 是否为图表组件
 */
export function isChart(widgetType: number): boolean {
  return [
    SysCustomWidgetType.LineChart,
    SysCustomWidgetType.BarChart,
    SysCustomWidgetType.PieChart,
    SysCustomWidgetType.ScatterChart,
    SysCustomWidgetType.PivotTable,
    SysCustomWidgetType.DataViewTable,
    SysCustomWidgetType.Carousel,
    SysCustomWidgetType.RichText,
    SysCustomWidgetType.GaugeChart,
    SysCustomWidgetType.RadarChart,
    SysCustomWidgetType.FunnelChart,
    SysCustomWidgetType.ProgressBar,
    SysCustomWidgetType.ProgressCircle,
    SysCustomWidgetType.DataCard,
    SysCustomWidgetType.DataProgressCard,
    SysCustomWidgetType.CommonList,
  ].includes(widgetType)
}

export {
  getDictDataByUrl,
}
