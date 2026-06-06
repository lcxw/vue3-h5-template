import { treeDataTranslate } from '@/utils/index'

const DEFAULT_PAGE_SIZE = 20

/** 排序信息 */
interface OrderInfo {
  fieldName?: string
  asc?: boolean
  dateAggregateBy?: string
}

/** 分页参数 */
interface PageParam {
  pageNum: number
  pageSize: number
  count?: boolean
}

/** 加载表格数据的参数 */
interface LoadTableParams {
  orderParam?: OrderInfo[]
  pageParam?: PageParam
}

/** 表格数据响应 */
interface TableDataResponse<T = Record<string, any>> {
  dataList: T[]
  totalCount: number
  finished?: boolean
}

/** 排序变化信息 */
interface SortInfo {
  fieldName?: string
  asc?: boolean
}

/**
 * 下拉组件（Select、Cascade、TreeSelect、Tree等）
 */
export class DropdownWidget<T = Record<string, any>> {
  loading: boolean
  dirty: boolean
  dropdownList: T[]
  isTree: boolean
  idKey: string
  parentIdKey: string
  loadDropdownData: () => Promise<T[]>

  /**
   * @param loadDropdownData - 下拉数据获取函数
   * @param isTree - 是否是树数据
   * @param idKey - 键字段字段名
   * @param parentIdKey - 父字段字段名
   */
  constructor(
    loadDropdownData: () => Promise<T[]>,
    isTree = false,
    idKey = 'id',
    parentIdKey = 'parentId',
  ) {
    this.loading = false
    this.dirty = true
    this.dropdownList = []
    this.isTree = isTree
    this.idKey = idKey
    this.parentIdKey = parentIdKey
    this.loadDropdownData = loadDropdownData
    this.setDropdownList = this.setDropdownList.bind(this)
    this.onVisibleChange = this.onVisibleChange.bind(this)
  }

  /**
   * 重新获取下拉数据
   */
  reloadDropdownData(): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.loading) {
        if (typeof this.loadDropdownData === 'function') {
          this.loading = true
          this.loadDropdownData().then((dataList) => {
            this.setDropdownList(dataList)
            this.loading = false
            this.dirty = false
            resolve(this.dropdownList)
          }).catch(() => {
            this.setDropdownList([])
            this.loading = false
            reject(this.dropdownList)
          })
        }
        else {
          reject(new Error('获取下拉数据失败'))
        }
      }
      else {
        resolve(this.dropdownList)
      }
    })
  }

  /**
   * 下拉框显示或隐藏时调用
   * @param isShow - 正在显示或者隐藏
   */
  onVisibleChange(isShow: boolean): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (isShow && this.dirty && !this.loading) {
        this.reloadDropdownData().then((res) => {
          resolve(res)
        }).catch((e) => {
          reject(e)
        })
      }
      else {
        resolve(this.dropdownList)
      }
    })
  }

  /**
   * 设置下拉数据
   * @param dataList - 要显示的下拉数据
   */
  setDropdownList(dataList: T[]): void {
    if (Array.isArray(dataList)) {
      this.dropdownList = this.isTree
        ? treeDataTranslate(dataList as any[], this.idKey, this.parentIdKey) as unknown as T[]
        : dataList
    }
  }
}

/**
 * 表格组件
 */
export class TableWidget<T = Record<string, any>> {
  currentRow: T | null
  loading: boolean
  finished: boolean
  oldPage: number
  currentPage: number
  oldPageSize: number
  pageSize: number
  totalCount: number
  dataList: T[]
  orderInfo: OrderInfo
  paged: boolean
  rowSelection: boolean
  searchVerify: () => boolean
  loadTableData: (params: LoadTableParams) => Promise<TableDataResponse<T>>
  loadDataList: (pageNum: number) => void
  onSortChange: (sortInfo?: SortInfo) => void
  loadTableDataImpl: (pageNum: number, pageSize: number, reload?: boolean) => Promise<void>
  refreshTable: (research?: boolean, pageNum?: number, showMsg?: boolean) => void

  /**
   * @param loadTableData - 表数据获取函数
   * @param verifyTableParameter - 表数据获取检验函数
   * @param paged - 是否支持分页
   * @param rowSelection - 是否支持行选择
   * @param orderFieldName - 默认排序字段
   * @param ascending - 默认排序方式（true为正序，false为倒序）
   * @param dateAggregateBy - 默认排序字段的日期统计类型
   */
  constructor(
    loadTableData?: (params: LoadTableParams) => Promise<TableDataResponse<T>>,
    verifyTableParameter?: () => boolean,
    paged?: boolean,
    rowSelection?: boolean,
    orderFieldName?: string,
    ascending?: boolean,
    dateAggregateBy?: string,
  ) {
    this.currentRow = null
    this.loading = false
    this.finished = false
    this.oldPage = 0
    this.currentPage = 0
    this.oldPageSize = DEFAULT_PAGE_SIZE
    this.pageSize = DEFAULT_PAGE_SIZE
    this.totalCount = 0
    this.dataList = []
    this.orderInfo = {
      fieldName: orderFieldName,
      asc: ascending,
      dateAggregateBy,
    }
    this.paged = paged ?? false
    this.rowSelection = rowSelection ?? false
    this.searchVerify = verifyTableParameter || function () {
      return true
    }
    this.loadTableData = loadTableData || function () {
      return Promise.resolve({ dataList: [], totalCount: 0 })
    }

    const _this = this

    this.loadDataList = (pageNum: number) => {
      if (typeof _this.loadTableData === 'function') {
        const params: LoadTableParams = {}
        if (_this.orderInfo.fieldName != null)
          params.orderParam = [_this.orderInfo]
        if (_this.paged) {
          params.pageParam = {
            pageNum,
            pageSize: _this.pageSize,
            count: false,
          }
        }
        _this.loading = true
        _this.finished = false
        if (pageNum === 1) {
          _this.dataList = []
        }
        _this.currentPage = pageNum
        _this.loadTableData(params).then((tableData) => {
          _this.dataList = _this.dataList.concat(tableData.dataList)
          _this.totalCount = tableData.totalCount
          _this.loading = false
          if (tableData.finished != null) {
            _this.finished = tableData.finished
          }
          else {
            // 根据总数判断是否加载完成
            _this.finished = _this.dataList.length >= _this.totalCount || tableData.dataList.length <= 0
          }
        }).catch((e) => {
          console.error(e)
          _this.loading = false
          _this.finished = false
        })
      }
    }

    /**
     * 表格排序字段变化
     * @param sortInfo - 排序信息
     */
    this.onSortChange = (sortInfo?: SortInfo) => {
      _this.orderInfo.fieldName = (sortInfo || {}).asc == null ? undefined : sortInfo!.fieldName
      _this.orderInfo.asc = (sortInfo || {}).asc
    }

    /**
     * 获取表格数据
     * @param pageNum - 当前分页
     * @param pageSize - 每页数量
     * @param reload - 是否重新获取数据
     */
    this.loadTableDataImpl = (pageNum: number, pageSize: number, reload = false) => {
      return new Promise<void>((resolve, reject) => {
        if (typeof _this.loadTableData !== 'function') {
          reject()
        }
        else {
          // 如果pageSize和pageNum没有变化，并且不强制刷新
          if (_this.paged && !reload && _this.oldPage === pageNum && _this.oldPageSize === pageSize) {
            resolve()
          }
          else {
            const params: LoadTableParams = {}
            if (_this.orderInfo.fieldName != null)
              params.orderParam = [_this.orderInfo]
            if (_this.paged) {
              params.pageParam = {
                pageNum,
                pageSize,
              }
            }
            _this.loading = true
            _this.loadTableData(params).then((tableData) => {
              _this.dataList = tableData.dataList
              _this.totalCount = tableData.totalCount
              _this.loading = false
              resolve()
            }).catch((e) => {
              _this.loading = false
              reject(e)
            })
          }
        }
      })
    }

    /**
     * 刷新表格数据
     * @param research - 是否按照新的查询条件重新查询（调用verify函数）
     * @param pageNum - 当前页面
     */
    this.refreshTable = (research = false, pageNum?: number, showMsg = false) => {
      _this.loadDataList(pageNum || 1)
    }
  }
}

/** 上传文件项 */
interface UploadFileItem {
  [key: string]: any
}

/**
 * 上传组件
 */
export class UploadWidget {
  maxCount: number
  fileList: UploadFileItem[]

  /**
   * @param maxCount - 最大上传数量
   */
  constructor(maxCount = 1) {
    this.maxCount = maxCount
    this.fileList = []
    this.onFileChange = this.onFileChange.bind(this)
  }

  /**
   * 上传文件列表改变
   * @param file - 改变的文件
   * @param fileList - 改变后的文件列表
   * @returns 处理后的文件列表
   */
  onFileChange(file: UploadFileItem, fileList: UploadFileItem[]): UploadFileItem[] {
    if (Array.isArray(fileList) && fileList.length > 0) {
      if (this.maxCount === 1) {
        this.fileList = [fileList[fileList.length - 1]]
      }
      else {
        this.fileList = fileList
      }
    }
    else {
      this.fileList = []
    }
    return this.fileList
  }
}

/** 图表数据列 */
interface ChartColumn {
  [key: string]: any
}

/** 图表数据 */
interface ChartData {
  columns: ChartColumn[]
  rows: Record<string, any>[]
}

/**
 * 图表组件
 */
export class ChartWidget {
  columns: ChartColumn[]
  loading: boolean
  dataEmpty: boolean
  chartData: ChartData | undefined
  chartObject: { resize: () => void } | undefined
  dimensionMaps: Map<string, any>
  chartSetting: Record<string, any> | undefined
  searchVerify: () => boolean
  loadTableData: (params?: any) => Promise<TableDataResponse>

  /**
   * @param loadTableData - chart数据获取函数
   * @param verifyTableParameter - 数据参数检验函数
   * @param columns - 数据列
   */
  constructor(
    loadTableData?: (params?: any) => Promise<TableDataResponse>,
    verifyTableParameter?: () => boolean,
    columns?: ChartColumn[],
  ) {
    this.columns = columns || []
    this.loading = false
    this.dataEmpty = false
    this.chartData = undefined
    this.chartObject = undefined
    this.dimensionMaps = new Map()
    this.chartSetting = undefined
    this.searchVerify = verifyTableParameter || function () {
      return true
    }
    this.loadTableData = loadTableData || function () {
      return Promise.resolve({ dataList: [], totalCount: 0 })
    }
  }

  /**
   * 获取图表数据
   * @param reload - 是否重新获取数据
   */
  loadChartDataImpl(reload = false): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof this.loadTableData !== 'function') {
        reject()
      }
      else {
        if (!reload) {
          resolve()
        }
        else {
          this.loading = true
          this.loadTableData().then((tableData) => {
            this.chartData = {
              columns: this.columns,
              rows: tableData.dataList,
            }
            this.loading = false
            if (this.chartObject)
              this.chartObject.resize()
            resolve()
          }).catch((e) => {
            console.error(e)
            this.loading = false
            reject(e)
          })
        }
      }
    })
  }

  /**
   * 刷新图表数据
   * @param research - 是否按照新的查询条件重新查询（调用verify函数）
   */
  refreshChart(research = false): void {
    if (research) {
      if (typeof this.searchVerify === 'function' && !this.searchVerify())
        return
    }

    this.loadChartDataImpl(true).catch(() => {
      // 静默处理错误
    })
  }
}
