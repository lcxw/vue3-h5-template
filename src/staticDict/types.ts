/**
 * 字典项类型定义
 */

/**
 * 字典项基础接口
 */
export interface DictionaryItem {
  id: number | string
  name: string
  symbol: string
  disabled?: boolean
  parentId?: number | string
}

/**
 * 用户状态字典项
 */
export interface SysUserStatusItem extends DictionaryItem {
  id: 0 | 1
  symbol: 'NORMAL' | 'LOCKED'
}

/**
 * 用户类型字典项
 */
export interface SysUserTypeItem extends DictionaryItem {
  id: 0 | 1 | 2
  symbol: 'ADMIN' | 'SYSTEM' | 'OPERATOR'
}

/**
 * 操作日志操作类型字典项
 */
export interface SysOperationTypeItem extends DictionaryItem {
  id: number
  symbol: string
}

/**
 * 权限分组类型字典项
 */
export interface SysPermModuleTypeItem extends DictionaryItem {
  id: 0 | 1
  symbol: 'GROUP' | 'CONTROLLER'
}

/**
 * 权限字类型字典项
 */
export interface SysPermCodeTypeItem extends DictionaryItem {
  id: 0 | 1 | 2
  symbol: 'FORM' | 'FRAGMENT' | 'OPERATION'
}

/**
 * 菜单类型字典项
 */
export interface SysMenuTypeItem extends DictionaryItem {
  id: 0 | 1 | 2 | 3
  symbol: 'DIRECTORY' | 'MENU' | 'FRAGMENT' | 'BUTTON'
}

/**
 * 移动端工作台配置项类型字典项
 */
export interface MobileEntryTypeItem extends DictionaryItem {
  id: 0 | 1 | 2
  symbol: 'BANNER' | 'SUDOKU' | 'GROUP'
}

/**
 * 菜单绑定类型字典项
 */
export interface SysMenuBindTypeItem extends DictionaryItem {
  id: 0 | 1 | 2 | 3 | 4 | 5
  symbol: 'ROUTER' | 'ONLINE_FORM' | 'WORK_ORDER' | 'REPORT' | 'THRID_URL' | 'ROUTER_WORK_ORDER'
}

/**
 * 数据权限类型字典项
 */
export interface SysDataPermTypeItem extends DictionaryItem {
  id: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 20
  symbol: 'ALL' | 'ONLY_USER' | 'ONLY_DEPT' | 'ONLY_DEPT_AND_CHILD' | 'CUSTOM_DEPT_AND_CHILD' | 'CUSTOM_DEPT' | 'DEPT_USER' | 'DEPT_AND_CHILD_USER' | 'SQL'
}

/**
 * 流程绑定表单类型字典项
 */
export interface SysFlowEntryBindFormTypeItem extends DictionaryItem {
  id: 0 | 1
  symbol: 'ONLINE_FORM' | 'ROUTER_FORM'
}

/**
 * 流程设计发布状态字典项
 */
export interface SysFlowEntryPublishedStatusItem extends DictionaryItem {
  id: 0 | 1
  symbol: 'UNPUBLISHED' | 'PUBLISHED'
}

/**
 * 流程设计步骤字典项
 */
export interface SysFlowEntryStepItem extends DictionaryItem {
  id: 0 | 1 | 2 | 3
  symbol: 'BASIC' | 'PROCESS_VARIABLE' | 'PROCESS_DESIGN' | 'PROCESS_STATUS'
}

/**
 * 任务操作类型字典项
 */
export interface SysFlowTaskOperationTypeItem extends DictionaryItem {
  id: string
  symbol: string
}

/**
 * 工作流任务类型字典项
 */
export interface SysFlowTaskTypeItem extends DictionaryItem {
  id: 0 | 1
  symbol: 'OTHER_TASK' | 'USER_TASK'
}

/**
 * 工作流变量类型字典项
 */
export interface SysFlowVariableTypeItem extends DictionaryItem {
  id: 0 | 1
  symbol: 'INSTANCE' | 'TASK'
}

/**
 * 工单状态字典项
 */
export interface SysFlowWorkOrderStatusItem extends DictionaryItem {
  id: 0 | 1 | 2 | 3 | 4 | 5 | 6
  symbol: 'SUBMITED' | 'APPROVING' | 'REFUSED' | 'FINISHED' | 'STOPPED' | 'CANCEL' | 'DRAFT'
}

/**
 * 抄送类型字典项
 */
export interface SysFlowCopyForTypeItem extends DictionaryItem {
  id: string
  symbol: string
}

/**
 * 钉钉节点类型字典项
 */
export interface FlowNodeTypeItem extends DictionaryItem {
  id: 0 | 1 | 2 | 3 | 4 | 5
  symbol: 'ORIGINATOR' | 'APPROVED_BY' | 'CC_TO' | 'CONNECTING_LINE' | 'CONDITIONAL_BRANCH' | 'PARALLEL_BRANCH'
}

/**
 * 流程图类型字典项
 */
export interface DiagramTypeItem extends DictionaryItem {
  id: 0 | 1
  symbol: 'ORDINARY' | 'DINGDING'
}

/**
 * 字段类型字典项
 */
export interface SysOnlineFieldKindItem extends DictionaryItem {
  id: number
  symbol: string
}

/**
 * 数据权限过滤类型字典项
 */
export interface SysOnlineDataPermFilterTypeItem extends DictionaryItem {
  id: 1 | 2
  symbol: 'USER_FILTER' | 'DEPT_FILTER'
}

/**
 * 关联类型字典项
 */
export interface SysOnlineRelationTypeItem extends DictionaryItem {
  id: 0 | 1
  symbol: 'ONE_TO_ONE' | 'ONE_TO_MANY'
}

/**
 * 表单类别字典项
 */
export interface SysOnlineFormKindItem extends DictionaryItem {
  id: 1 | 5
  symbol: 'DIALOG' | 'PAGE'
}

/**
 * 页面类型字典项
 */
export interface SysOnlinePageTypeItem extends DictionaryItem {
  id: 1 | 10
  symbol: 'BIZ' | 'FLOW'
}

/**
 * 页面状态字典项
 */
export interface SysOnlinePageStatusItem extends DictionaryItem {
  id: 0 | 1 | 2
  symbol: 'BASIC' | 'DATASOURCE' | 'DESIGNING'
}

/**
 * 字典类型字典项
 */
export interface SysOnlineDictTypeItem extends DictionaryItem {
  id: 1 | 5 | 15 | 20
  symbol: 'TABLE' | 'URL' | 'CUSTOM' | 'CODE'
}

/**
 * 验证规则类型字典项
 */
export interface SysOnlineRuleTypeItem extends DictionaryItem {
  id: 1 | 2 | 3 | 4 | 5 | 6 | 100
  symbol: 'INTEGER_ONLY' | 'DIGITAL_ONLY' | 'LETTER_ONLY' | 'RANGE' | 'EMAIL' | 'MOBILE' | 'CUSTOM'
}

/**
 * 组件绑定值类型字典项
 */
export interface SysCustomWidgetBindValueTypeItem extends DictionaryItem {
  id: 1 | 10 | 20
  symbol: 'DICT_DATA' | 'SYSTEM_VARIABLE' | 'INPUT_DATA'
}

/**
 * 过滤类型字典项
 */
export interface SysOnlineColumnFilterTypeItem extends DictionaryItem {
  id: 0 | 1 | 2 | 3 | 4
  symbol: 'NONE' | 'EQUAL_FILTER' | 'RANFGE_FILTER' | 'LIKE_FILTER' | 'MULTI_SELECT_FILTER'
}

/**
 * 数据表状态字典项
 */
export interface SysOnlinePageDatasourceFieldStatusItem extends DictionaryItem {
  id: 0 | 1
  symbol: 'DELETED' | 'USED' | 'UNUSED'
}

/**
 * 在线表单编辑步骤字典项
 */
export interface SysOnlinePageSettingStepItem extends DictionaryItem {
  id: 0 | 1 | 2
  symbol: 'BASIC' | 'DATASOURCE' | 'FORM_DESIGN'
}

/**
 * 参数值类型字典项
 */
export interface SysOnlineParamValueTypeItem extends DictionaryItem {
  id: 1 | 2 | 3
  symbol: 'TABLE_COLUMN' | 'STATIC_DICT' | 'INPUT_VALUE'
}

/**
 * 字段聚合类型字典项
 */
export interface SysOnlineAggregationTypeItem extends DictionaryItem {
  id: 0 | 1 | 2 | 3 | 4
  symbol: 'SUM' | 'COUNT' | 'AVG' | 'MIN' | 'MAX'
}

/**
 * 过滤条件操作类型字典项
 */
export interface SysOnlineFilterOperationTypeItem extends DictionaryItem {
  id: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  symbol: string
}

/**
 * 虚拟字段过滤值类型字典项
 */
export interface SysOnlineVirtualColumnFilterValueTypeItem extends DictionaryItem {
  id: 0 | 1
  symbol: 'CUSTOM_INPUT' | 'STATIC_DICT'
}

/**
 * 自动编码类型字典项
 */
export interface SysAutoCodeTypeItem extends DictionaryItem {
  id: 'DAYS' | 'HOURS' | 'MINUTES' | 'SECONDS'
  symbol: 'DAYS' | 'HOURS' | 'MINUTES' | 'SECONDS'
}

/**
 * 数据视图类型字典项
 */
export interface DataViewTypeItem extends DictionaryItem {
  id: number
  symbol: string
}

/**
 * 数据集类型字典项
 */
export interface DatasetTypeItem extends DictionaryItem {
  id: 1 | 2 | 3
  symbol: 'TABLE' | 'SQL' | 'API'
}

/**
 * 页面过滤类型字典项
 */
export interface PageFilterTypeItem extends DictionaryItem {
  id: 1 | 2
  symbol: 'PAGE_PARAM' | 'VIEW_PARAM'
}

/**
 * 过滤条件类型字典项
 */
export interface FilterKindItem extends DictionaryItem {
  id: 1 | 2
  symbol: 'AND' | 'OR'
}

/**
 * 过滤值类别字典项
 */
export interface FilterValueKindItem extends DictionaryItem {
  id: number
  symbol: string
}

/**
 * 报表字典类型字典项
 */
export interface ReportDictTypeItem extends DictionaryItem {
  id: 1 | 15 | 20
  symbol: 'TABLE' | 'CUSTOM' | 'CODE'
}

/**
 * 报表关联类型字典项
 */
export interface ReportRelationTypeItem extends DictionaryItem {
  id: 0 | 1
  symbol: 'ONE_TO_ONE' | 'ONE_TO_MANY'
}

/**
 * 数据集连接类型字典项
 */
export interface JoinTypeItem extends DictionaryItem {
  id: 1 | 2 | 3
  symbol: 'INNER' | 'LEFT' | 'RIGHT'
}

/**
 * 组件类型字典项
 */
export interface WidgetTypeItem extends DictionaryItem {
  id: 1 | 2
  symbol: 'BASIC' | 'VIEW'
}

/**
 * 排序类型字典项
 */
export interface OrderTypeItem extends DictionaryItem {
  id: 1 | 2
  symbol: 'ASC' | 'DESC'
}

/**
 * 指标计算类型字典项
 */
export interface CalculateTypeItem extends DictionaryItem {
  id: 0 | 1 | 2 | 3 | 4 | 5 | 6
  symbol: 'SUM' | 'COUNT' | 'AVG' | 'MIN_BY' | 'MAX_BY' | 'STD_DEV' | 'MEAN_DEV'
}

/**
 * 条件过滤类型字典项
 */
export interface CriteriaFilterTypeItem extends DictionaryItem {
  id: number
  symbol: string
}

/**
 * 日期自定义数据类型字典项
 */
export interface CustomDateValueTypeItem extends DictionaryItem {
  id: number
  symbol: string
}

/**
 * 水平位置字典项
 */
export interface HorizontalPositionItem extends DictionaryItem {
  id: 0 | 1 | 2
  symbol: 'LEFT' | 'CENTER' | 'RIGHT'
}

/**
 * 垂直位置字典项
 */
export interface VerticalPositionItem extends DictionaryItem {
  id: 'top' | 'inside' | 'bottom'
  symbol: 'TOP' | 'CENTER' | 'BOTTOM'
}

/**
 * 内外位置字典项
 */
export interface InsidePositionItem extends DictionaryItem {
  id: 'inside' | 'outisde'
  symbol: 'INSIDE' | 'OUTSIDE'
}

/**
 * 提示触发位置字典项
 */
export interface TipsTriggerTypeItem extends DictionaryItem {
  id: 'item' | 'axis'
  symbol: 'DATA' | 'AXIS'
}

/**
 * 线型字典项
 */
export interface LineTypeItem extends DictionaryItem {
  id: 'solid' | 'dashed'
  symbol: 'SOLID' | 'DOTTED'
}

/**
 * 折点样式字典项
 */
export interface ShapeTypeItem extends DictionaryItem {
  id: string
  symbol: string
}

/**
 * 横轴位置字典项
 */
export interface HorizontalAxisPostionItem extends DictionaryItem {
  id: 'top' | 'bottom'
  symbol: 'TOP' | 'BOTTOM'
}

/**
 * 纵轴位置字典项
 */
export interface VerticalAxisPositionItem extends DictionaryItem {
  id: 'left' | 'right'
  symbol: 'LEFT' | 'RIGHT'
}

/**
 * 报表组件类型字典项
 */
export interface ReportWidgetTypeItem extends DictionaryItem {
  id: number
  symbol: string
}

/**
 * 属性值类型字典项
 */
export interface AttributeValueTypeItem extends DictionaryItem {
  id: 1 | 2 | 3
  symbol: 'STRING' | 'NUMBER' | 'BOOLEAN'
}

/**
 * 打印方向字典项
 */
export interface PrintOrientationItem extends DictionaryItem {
  id: 1 | 2
  symbol: 'LANDSCAPE' | 'PORTRAIT'
}

/**
 * 纸张大小字典项
 */
export interface PrintPaperTypeItem extends DictionaryItem {
  id: 'A4' | 'A5'
  symbol: 'A4' | 'A5'
}

/**
 * 打印编辑步骤字典项
 */
export interface PrintTemplateEditStepItem extends DictionaryItem {
  id: 0 | 1
  symbol: 'BASIC' | 'TEMPLATE'
}

/**
 * 打印单元格类型字典项
 */
export interface PrintCellTypeItem extends DictionaryItem {
  id: 1 | 2 | 3 | 4
  symbol: 'COLUMN' | 'IMAGE' | 'BARCODE' | 'QRCODE'
}

/**
 * 打印单元格图片类型字典项
 */
export interface PrintCellImageSourceTypeItem extends DictionaryItem {
  id: 1
  symbol: 'COLUMN'
}

/**
 * 条形码编码类型字典项
 */
export interface PrintBarCodeTypeItem extends DictionaryItem {
  id: string
  symbol: string
}

/**
 * 二维码编码类型字典项
 */
export interface PrintQRCodeTypeItem extends DictionaryItem {
  id: string
  symbol: string
}

/**
 * 报表组件绑定类型字典项
 */
export interface ReportBindDataTypeItem extends DictionaryItem {
  id: 0 | 5 | 10
  symbol: 'DATASET' | 'SYSTEM_VARIABLE' | 'CUSTOM'
}

/**
 * 组件类型字典项
 */
export interface SysCustomWidgetTypeItem extends DictionaryItem {
  id: number
  symbol: string
}

/**
 * 在线表单事件类型字典项
 */
export interface OnlineFormEventTypeItem extends DictionaryItem {
  id: string
  symbol: string
}

/**
 * 表单类型字典项
 */
export interface SysOnlineFormTypeItem extends DictionaryItem {
  id: number
  symbol: string
}

/**
 * 操作类型字典项
 */
export interface SysCustomWidgetOperationTypeItem extends DictionaryItem {
  id: number
  symbol: string
}

/**
 * 系统变量类型字典项
 */
export interface OnlineSystemVariableTypeItem extends DictionaryItem {
  id: number
  symbol: string
}

/**
 * 组件绑定数据类型字典项
 */
export interface SysCustomWidgetBindDataTypeItem extends DictionaryItem {
  id: 0 | 5 | 10 | 20
  symbol: 'Column' | 'SYSTEM_VARIABLE' | 'Custom' | 'Fixed'
}

/**
 * 脱敏类型字典项
 */
export interface SysMaskFieldTypeItem extends DictionaryItem {
  id: string
  symbol: string
}

/**
 * 方向字典项
 */
export interface DirectionTypeItem extends DictionaryItem {
  id: 0 | 1
  symbol: 'HORIZONTAL' | 'VERTICAL'
}

/**
 * 数据库连接类型字典项
 */
export interface DblinkTypeItem extends DictionaryItem {
  id: number
  symbol: string
}

/**
 * 公式项类型字典项
 */
export interface FormulaItemKindItem extends DictionaryItem {
  id: string
  symbol: string
}

/**
 * 文件类型字典项
 */
export interface EnumFileTypeItem extends DictionaryItem {
  id: number
  symbol: string
}

/**
 * 逻辑运算符字典项
 */
export interface LogicOperatorTypeItem extends DictionaryItem {
  id: 'AND' | 'OR'
  symbol: 'AND' | 'OR'
}

/**
 * 自定义查询过滤值类型字典项
 */
export interface CustomQueryFilterValueTypeItem extends DictionaryItem {
  id: 0 | 1
  symbol: 'FIXED' | 'DICT'
}

/**
 * 散点符号类型字典项
 */
export interface ScatterSymbolTypeItem extends DictionaryItem {
  id: 0 | 1
  symbol: 'FIXED' | 'VALUE'
}