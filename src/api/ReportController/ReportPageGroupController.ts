import { http } from '@/utils/http'

/**
 * 报表页面分组控制器
 * 处理报表页面分组的增删改查操作
 */
export class ReportPageGroupController {
  /**
   * 获取报表页面分组列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportPageGroup/list', params)
  }

  /**
   * 查看报表页面分组详情
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('/admin/report/reportPageGroup/view', { params })
  }

  /**
   * 导出报表页面分组数据
   */
  static export(params: Record<string, any>, fileName: string): Promise<Blob> {
    return http.downloadBlob('/admin/report/reportPageGroup/export', params)
  }

  /**
   * 添加报表页面分组
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportPageGroup/add', params)
  }

  /**
   * 更新报表页面分组
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportPageGroup/update', params)
  }

  /**
   * 删除报表页面分组
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportPageGroup/delete', params)
  }

  /**
   * 获取所有报表页面分组
   */
  static listAll(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportPageGroup/listAll', params)
  }
}
