import { http } from '@/utils/http'

/**
 * 报表数据库链接控制器
 * 处理报表数据库链接的增删改查、表结构获取及连接测试操作
 */
export class ReportDblinkController {
  /**
   * 获取报表数据库链接列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDblink/list', params)
  }

  /**
   * 查看报表数据库链接详情
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('/admin/report/reportDblink/view', { params })
  }

  /**
   * 导出报表数据库链接数据
   */
  static export(params: Record<string, any>, fileName: string): Promise<Blob> {
    return http.downloadBlob('/admin/report/reportDblink/export', params)
  }

  /**
   * 添加报表数据库链接
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDblink/add', params)
  }

  /**
   * 更新报表数据库链接
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDblink/update', params)
  }

  /**
   * 删除报表数据库链接
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportDblink/delete', params)
  }

  /**
   * 获取所有表列表
   */
  static listAllTables(params: Record<string, any>): Promise<any> {
    return http.get('/admin/report/reportDblink/listAllTables', { params })
  }

  /**
   * 获取表字段列表
   */
  static listTableColumn(params: Record<string, any>): Promise<any> {
    return http.get('/admin/report/reportDblink/listTableColumn', { params })
  }

  /**
   * 测试数据库连接
   */
  static testConnection(params: Record<string, any>): Promise<any> {
    return http.get('/admin/report/reportDblink/testConnection', { params })
  }
}