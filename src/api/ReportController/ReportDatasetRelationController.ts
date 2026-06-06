import { http } from '@/utils/http'

/**
 * 报表数据集关联控制器
 * 处理报表数据集关联的增删改查操作
 */
export class ReportDatasetRelationController {
  /**
   * 获取报表数据集关联列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDatasetRelation/list', params)
  }

  /**
   * 查看报表数据集关联详情
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('/admin/report/reportDatasetRelation/view', { params })
  }

  /**
   * 导出报表数据集关联数据
   */
  static export(params: Record<string, any>, fileName: string): Promise<Blob> {
    return http.downloadBlob('/admin/report/reportDatasetRelation/export', params)
  }

  /**
   * 添加报表数据集关联
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDatasetRelation/add', params)
  }

  /**
   * 更新报表数据集关联
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDatasetRelation/update', params)
  }

  /**
   * 删除报表数据集关联
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDatasetRelation/delete', params)
  }
}
