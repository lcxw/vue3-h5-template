import { http } from '@/utils/http'

/**
 * 报表数据集控制器
 * 处理报表数据集的增删改查、预览及同步操作
 */
export class ReportDatasetController {
  /**
   * 获取报表数据集列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDataset/list', params)
  }

  /**
   * 查看报表数据集详情
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('/admin/report/reportDataset/view', { params })
  }

  /**
   * 根据ID列表获取数据集
   */
  static listByIds(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDataset/listByIds', params)
  }

  /**
   * 导出报表数据集数据
   */
  static export(params: Record<string, any>, fileName: string): Promise<Blob> {
    return http.downloadBlob('/admin/report/reportDataset/export', params)
  }

  /**
   * 添加报表数据集
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDataset/add', params)
  }

  /**
   * 更新报表数据集
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDataset/update', params)
  }

  /**
   * 删除报表数据集
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDataset/delete', params)
  }

  /**
   * 预览数据集
   */
  static previewDataset(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDataset/previewDataset', params)
  }

  /**
   * 同步字段
   */
  static syncColumns(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDataset/sync', params)
  }

  /**
   * 根据字段获取数据列表
   */
  static listDataWithColumn(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDataset/listDataWithColumn', params)
  }
}
