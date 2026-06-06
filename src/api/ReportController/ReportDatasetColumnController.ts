import { http } from '@/utils/http'

/**
 * 报表数据集字段控制器
 * 处理报表数据集字段的查询和更新操作
 */
export class ReportDatasetColumnController {
  /**
   * 获取报表数据集字段列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDatasetColumn/list', params)
  }

  /**
   * 查看报表数据集字段详情
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('/admin/report/reportDatasetColumn/view', { params })
  }

  /**
   * 导出报表数据集字段数据
   */
  static export(params: Record<string, any>, fileName: string): Promise<Blob> {
    return http.downloadBlob('/admin/report/reportDatasetColumn/export', params)
  }

  /**
   * 更新报表数据集字段
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDatasetColumn/update', params)
  }
}
