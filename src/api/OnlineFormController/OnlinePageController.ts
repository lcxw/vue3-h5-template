import { http } from '@/utils/http'

/**
 * 在线页面控制器
 * 处理在线页面的增删改查、状态更新及数据源关联操作
 */
export class OnlinePageController {
  /**
   * 获取在线页面列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlinePage/list', params)
  }

  /**
   * 获取所有页面和表单
   */
  static listAllPageAndForm(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlinePage/listAllPageAndForm', params)
  }

  /**
   * 查看在线页面详情
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('/admin/online/onlinePage/view', { params })
  }

  /**
   * 导出在线页面数据
   */
  static export(params: Record<string, any>, fileName: string): Promise<Blob> {
    return http.downloadBlob('/admin/online/onlinePage/export', params)
  }

  /**
   * 添加在线页面
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlinePage/add', params)
  }

  /**
   * 更新在线页面
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlinePage/update', params)
  }

  /**
   * 更新发布状态
   */
  static updatePublished(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlinePage/updatePublished', params)
  }

  /**
   * 删除在线页面
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlinePage/delete', params)
  }

  /**
   * 更新页面状态
   */
  static updateStatus(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlinePage/updateStatus', params)
  }

  /**
   * 获取在线页面数据源列表
   */
  static listOnlinePageDatasource(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlinePage/listOnlinePageDatasource', params)
  }

  /**
   * 获取不在页面数据源中的列表
   */
  static listNotInOnlinePageDatasource(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlinePage/listNotInOnlinePageDatasource', params)
  }

  /**
   * 添加在线页面数据源
   */
  static addOnlinePageDatasource(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlinePage/addOnlinePageDatasource', params)
  }

  /**
   * 删除在线页面数据源
   */
  static deleteOnlinePageDatasource(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlinePage/deleteOnlinePageDatasource', params)
  }

  /**
   * 更新在线页面数据源
   */
  static updateOnlinePageDatasource(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlinePage/updateOnlinePageDatasource', params)
  }

  /**
   * 查看在线页面数据源详情
   */
  static viewOnlinePageDatasource(params: Record<string, any>): Promise<any> {
    return http.get('/admin/online/onlinePage/viewOnlinePageDatasource', { params })
  }
}
