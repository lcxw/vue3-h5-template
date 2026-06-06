import { http } from '@/utils/http'

/**
 * 在线规则控制器
 * 处理在线规则的增删改查操作
 */
export class OnlineRuleController {
  /**
   * 获取在线规则列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineRule/list', params)
  }

  /**
   * 查看在线规则详情
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('/admin/online/onlineRule/view', { params })
  }

  /**
   * 导出在线规则数据
   */
  static export(params: Record<string, any>, fileName: string): Promise<Blob> {
    return http.downloadBlob('/admin/online/onlineRule/export', params)
  }

  /**
   * 添加在线规则
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineRule/add', params)
  }

  /**
   * 更新在线规则
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineRule/update', params)
  }

  /**
   * 删除在线规则
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineRule/delete', params)
  }
}
