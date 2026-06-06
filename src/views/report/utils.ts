/**
 * 报表工具函数
 * 提供报表组件相关的工具方法
 */
import { SysCustomWidgetType } from '@/staticDict/index'

/**
 * 组件信息接口
 */
export interface WidgetInfo {
  widgetId: string
  widgetType: string
  variableName: string
  showName: string
  props?: Record<string, any>
  childWidgetList?: WidgetInfo[]
  [key: string]: any
}

/**
 * 递归添加组件到列表
 * @param widget 当前组件
 * @param widgetList 组件列表
 */
function addWidgetToList(widget: WidgetInfo, widgetList: WidgetInfo[]): void {
  widgetList.push(widget)
  if (Array.isArray(widget.childWidgetList)) {
    widget.childWidgetList.forEach((subWidget) => {
      addWidgetToList(subWidget, widgetList)
    })
  }
}

/**
 * 获取所有组件列表
 * 递归遍历组件树，将所有组件平铺到一个列表中
 * @param rootList 根组件列表
 * @returns 平铺后的组件列表
 */
export function getAllWidgetList(rootList: WidgetInfo[]): WidgetInfo[] {
  const temp: WidgetInfo[] = []
  if (Array.isArray(rootList)) {
    rootList.forEach((widget) => {
      addWidgetToList(widget, temp)
    })
  }
  return temp
}

/**
 * 判断组件类型是否为图表类型
 * @param widgetType 组件类型
 * @returns 是否为图表类型组件
 */
export function isChart(widgetType: string): boolean {
  const chartTypes = [
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
  ]
  return chartTypes.includes(widgetType)
}

/**
 * 判断组件类型是否为过滤组件
 * @param widgetType 组件类型
 * @returns 是否为过滤组件
 */
export function isFilterWidget(widgetType: string): boolean {
  const filterTypes = [
    SysCustomWidgetType.MobileInputFilter,
    SysCustomWidgetType.MobileRadioFilter,
    SysCustomWidgetType.MobileCheckBoxFilter,
    SysCustomWidgetType.MobileSwitchFilter,
    SysCustomWidgetType.MobileDateRangeFilter,
    SysCustomWidgetType.MobileNumberRangeFilter,
  ]
  return filterTypes.includes(widgetType)
}