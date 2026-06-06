import { http } from '@/utils/http'

/**
 * 报表打印分组控制器
 * 处理报表打印分组的增删改查操作
 */
export class ReportPrintGroupController {
  /**
   * 添加报表打印分组
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportPrintGroup/add', params)
  }

  /**
   * 更新报表打印分组
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportPrintGroup/update', params)
  }

  /**
   * 删除报表打印分组
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportPrintGroup/delete', params)
  }

  /**
   * 获取报表打印分组列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportPrintGroup/list', params)
  }

  /**
   * 查看报表打印分组详情
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('/admin/report/reportPrintGroup/view', { params })
  }
}
