import { http } from '@/utils/http'

/**
 * 在线字段控制器
 * 处理在线字段的增删改查、刷新及字段规则关联操作
 */
export class OnlineColumnController {
  /**
   * 获取在线字段列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineColumn/list', params)
  }

  /**
   * 查看在线字段详情
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('/admin/online/onlineColumn/view', { params })
  }

  /**
   * 导出在线字段数据
   */
  static export(params: Record<string, any>, fileName: string): Promise<Blob> {
    return http.downloadBlob('/admin/online/onlineColumn/export', params)
  }

  /**
   * 添加在线字段
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineColumn/add', params)
  }

  /**
   * 更新在线字段
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineColumn/update', params)
  }

  /**
   * 刷新字段
   */
  static refreshColumn(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineColumn/refresh', params)
  }

  /**
   * 删除在线字段
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineColumn/delete', params)
  }

  /**
   * 获取在线字段规则列表
   */
  static listOnlineColumnRule(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineColumn/listOnlineColumnRule', params)
  }

  /**
   * 获取不在字段规则中的列表
   */
  static listNotInOnlineColumnRule(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineColumn/listNotInOnlineColumnRule', params)
  }

  /**
   * 添加在线字段规则
   */
  static addOnlineColumnRule(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineColumn/addOnlineColumnRule', params)
  }

  /**
   * 删除在线字段规则
   */
  static deleteOnlineColumnRule(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineColumn/deleteOnlineColumnRule', params)
  }

  /**
   * 更新在线字段规则
   */
  static updateOnlineColumnRule(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineColumn/updateOnlineColumnRule', params)
  }

  /**
   * 查看在线字段规则详情
   */
  static viewOnlineColumnRule(params: Record<string, any>): Promise<any> {
    return http.get('/admin/online/onlineColumn/viewOnlineColumnRule', { params })
  }
}
