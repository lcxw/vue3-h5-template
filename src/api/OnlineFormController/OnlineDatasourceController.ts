import { http } from '@/utils/http'

/**
 * 在线数据源控制器
 * 处理在线数据源的增删改查操作
 */
export class OnlineDatasourceController {
  /**
   * 获取在线数据源列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineDatasource/list', params)
  }

  /**
   * 查看在线数据源详情
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('/admin/online/onlineDatasource/view', { params })
  }

  /**
   * 导出在线数据源数据
   */
  static export(params: Record<string, any>, fileName: string): Promise<Blob> {
    return http.downloadBlob('/admin/online/onlineDatasource/export', params)
  }

  /**
   * 添加在线数据源
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineDatasource/add', params)
  }

  /**
   * 更新在线数据源
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineDatasource/update', params)
  }

  /**
   * 删除在线数据源
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineDatasource/delete', params)
  }
}
