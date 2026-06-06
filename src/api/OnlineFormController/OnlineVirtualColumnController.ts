import { http } from '@/utils/http'

/**
 * 在线虚拟字段控制器
 * 处理在线虚拟字段的增删改查操作
 */
export class OnlineVirtualColumnController {
  /**
   * 获取在线虚拟字段列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineVirtualColumn/list', params)
  }

  /**
   * 查看在线虚拟字段详情
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('/admin/online/onlineVirtualColumn/view', { params })
  }

  /**
   * 添加在线虚拟字段
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineVirtualColumn/add', params)
  }

  /**
   * 更新在线虚拟字段
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineVirtualColumn/update', params)
  }

  /**
   * 删除在线虚拟字段
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineVirtualColumn/delete', params)
  }
}
