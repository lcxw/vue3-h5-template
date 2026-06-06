import { http } from '@/utils/http'

/**
 * 报表页面控制器
 * 处理报表页面的增删改查操作
 */
export class ReportPageController {
  /**
   * 获取报表页面列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportPage/list', params)
  }

  /**
   * 查看报表页面详情
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('/admin/report/reportPage/view', { params })
  }

  /**
   * 导出报表页面数据
   */
  static export(params: Record<string, any>, fileName: string): Promise<Blob> {
    return http.downloadBlob('/admin/report/reportPage/export', params)
  }

  /**
   * 添加报表页面
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportPage/add', params)
  }

  /**
   * 更新报表页面
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportPage/update', params)
  }

  /**
   * 删除报表页面
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportPage/delete', params)
  }
}
