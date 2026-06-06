import { http } from '@/utils/http'

/**
 * 报表字典控制器
 * 处理报表字典的增删改查及字典数据查询操作
 */
export class ReportDictController {
  /**
   * 获取报表字典列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDict/list', params)
  }

  /**
   * 查看报表字典详情
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('/admin/report/reportDict/view', { params })
  }

  /**
   * 导出报表字典数据
   */
  static export(params: Record<string, any>, fileName: string): Promise<Blob> {
    return http.downloadBlob('/admin/report/reportDict/export', params)
  }

  /**
   * 添加报表字典
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDict/add', params)
  }

  /**
   * 更新报表字典
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDict/update', params)
  }

  /**
   * 删除报表字典
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDict/delete', params)
  }

  /**
   * 获取字典数据列表
   */
  static listDictData(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDict/listDictData', params)
  }

  /**
   * 获取所有全局字典
   */
  static listAllGlobalDict(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDict/listAllGlobalDict', params)
  }
}
