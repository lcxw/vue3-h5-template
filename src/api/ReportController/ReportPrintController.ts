import { http } from '@/utils/http'

/**
 * 报表打印控制器
 * 处理报表打印模板的增删改查及预览操作
 */
export class ReportPrintController {
  /**
   * 添加报表打印模板
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportPrint/add', params)
  }

  /**
   * 更新报表打印模板
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportPrint/update', params)
  }

  /**
   * 删除报表打印模板
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportPrint/delete', params)
  }

  /**
   * 获取报表打印模板列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportPrint/list', params)
  }

  /**
   * 查看报表打印模板详情
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('/admin/report/reportPrint/view', { params })
  }

  /**
   * 预览报表打印模板
   */
  static preview(params: Record<string, any>, fileName: string): Promise<Blob> {
    return http.downloadBlob('/admin/report/reportPrint/preview', params)
  }
}
