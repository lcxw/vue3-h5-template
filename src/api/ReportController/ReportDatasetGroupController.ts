import { http } from '@/utils/http'

/**
 * 报表数据集分组控制器
 * 处理报表数据集分组的增删改查操作
 */
export class ReportDatasetGroupController {
  /**
   * 获取报表数据集分组列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDatasetGroup/list', params)
  }

  /**
   * 查看报表数据集分组详情
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('/admin/report/reportDatasetGroup/view', { params })
  }

  /**
   * 导出报表数据集分组数据
   */
  static export(params: Record<string, any>, fileName: string): Promise<Blob> {
    return http.downloadBlob('/admin/report/reportDatasetGroup/export', params)
  }

  /**
   * 添加报表数据集分组
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDatasetGroup/add', params)
  }

  /**
   * 更新报表数据集分组
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDatasetGroup/update', params)
  }

  /**
   * 删除报表数据集分组
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDatasetGroup/delete', params)
  }

  /**
   * 获取所有报表数据集分组
   */
  static listAll(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDatasetGroup/listAll', params)
  }
}
