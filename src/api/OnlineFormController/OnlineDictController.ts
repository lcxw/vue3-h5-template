import { http } from '@/utils/http'

/**
 * 在线字典控制器
 * 处理在线字典的增删改查及全局字典关联操作
 */
export class OnlineDictController {
  /**
   * 获取在线字典列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineDict/list', params)
  }

  /**
   * 查看在线字典详情
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('/admin/online/onlineDict/view', { params })
  }

  /**
   * 导出在线字典数据
   */
  static export(params: Record<string, any>, fileName: string): Promise<Blob> {
    return http.downloadBlob('/admin/online/onlineDict/export', params)
  }

  /**
   * 添加在线字典
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineDict/add', params)
  }

  /**
   * 更新在线字典
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineDict/update', params)
  }

  /**
   * 删除在线字典
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineDict/delete', params)
  }

  /**
   * 获取所有全局字典
   */
  static listAllGlobalDict(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineDict/listAllGlobalDict', params)
  }
}
