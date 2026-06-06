/**
 * 在线表单组件工具函数
 * 提供在线表单相关的辅助方法
 */

/**
 * 检查是否为图表组件
 * @param widgetType 组件类型
 * @returns 是否为图表组件
 */
export function isChart(widgetType: string): boolean {
  const chartTypes = [
    'BarChart',
    'PieChart',
    'LineChart',
    'ScatterChart',
    'RadarChart',
    'FunnelChart',
    'CarouselChart',
    'DataCard',
    'ProgressCard',
    'ProgressBar',
    'ProgressCircle',
  ]
  return chartTypes.includes(widgetType)
}

/**
 * 获取过滤类型列表
 * @param fieldType 字段类型
 * @returns 过滤类型列表
 */
export function getFilterTypeByFieldType(fieldType: string): string[] {
  switch (fieldType) {
    case 'Boolean':
      return ['EQ', 'NOT_EQ']
    case 'String':
      return ['EQ', 'NOT_EQ', 'LIKE', 'NOT_NULL', 'IS_NULL', 'IN', 'NOT_IN']
    case 'Date':
      return ['EQ', 'GE', 'GT', 'LE', 'LT', 'BETWEEN', 'NOT_NULL', 'IS_NULL']
    case 'Integer':
    case 'Long':
    case 'Double':
    case 'BigDecimal':
      return ['EQ', 'NOT_EQ', 'GE', 'GT', 'LE', 'LT', 'NOT_NULL', 'IS_NULL', 'IN', 'NOT_IN']
    default:
      return []
  }
}

/**
 * 获取有效过滤值类型列表
 * @param filterValueList 过滤值类型列表
 * @param filterType 过滤类型
 * @param column 字段信息
 * @returns 有效过滤值类型列表
 */
export function getValidFilterValueTypeByFieldType(
  filterValueList: string[],
  filterType: string,
  column: { fieldType: string },
): string[] {
  if (!Array.isArray(filterValueList))
    return []

  const validTypes: Record<string, string[]> = {
    Boolean: ['FORM_PARAM', 'WIDGET_DATA', 'DICT_DATA', 'PRINT_INPUT_PARAM', 'INPUT_DATA'],
    String: ['FORM_PARAM', 'WIDGET_DATA', 'DICT_DATA', 'COLUMN_DATA', 'PRINT_INPUT_PARAM', 'INPUT_DATA'],
    Date: ['FORM_PARAM', 'WIDGET_DATA', 'DICT_DATA', 'COLUMN_DATA', 'PRINT_INPUT_PARAM', 'INNER_VARIABLE', 'INPUT_DATA'],
    Integer: ['FORM_PARAM', 'WIDGET_DATA', 'DICT_DATA', 'COLUMN_DATA', 'PRINT_INPUT_PARAM', 'INPUT_DATA'],
    Long: ['FORM_PARAM', 'WIDGET_DATA', 'DICT_DATA', 'COLUMN_DATA', 'PRINT_INPUT_PARAM', 'INPUT_DATA'],
    Double: ['FORM_PARAM', 'WIDGET_DATA', 'DICT_DATA', 'COLUMN_DATA', 'PRINT_INPUT_PARAM', 'INPUT_DATA'],
    BigDecimal: ['FORM_PARAM', 'WIDGET_DATA', 'DICT_DATA', 'COLUMN_DATA', 'PRINT_INPUT_PARAM', 'INPUT_DATA'],
  }

  const types = validTypes[column.fieldType] || []

  // 包含和不包含类型只能使用字典和字段值过滤
  if (filterType === 'IN' || filterType === 'NOT_IN') {
    return types.filter(item => item === 'DICT_DATA' || item === 'COLUMN_DATA')
  }

  return types.filter(item => filterValueList.includes(item))
}

/**
 * 获取计算列名
 * @param calculateType 计算类型
 * @param columnName 列名
 * @returns 计算列名
 */
export function getValueColumnName(calculateType: string, columnName: string): string | null {
  if (!columnName)
    return null

  const calculateNames: Record<string, string> = {
    SUM: 'sumOf',
    COUNT: 'countOf',
    AVG: 'avgOf',
    MIN_BY: 'minOf',
    MAX_BY: 'maxOf',
    STD_DEV: 'stddevOf',
    MEAN_DEV: 'varpopOf',
  }

  const calculateName = calculateNames[calculateType]
  if (!calculateName)
    return null

  return calculateName + columnName.charAt(0).toUpperCase() + columnName.slice(1)
}
