import { http } from '@/utils/http'

/**
 * 系统岗位控制器
 * 处理岗位的增删改查操作
 */
export class SysPostController {
  /**
   * 获取岗位列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('/admin/upms/sysPost/list', params)
  }

  /**
   * 查看岗位详情
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('/admin/upms/sysPost/view', { params })
  }

  /**
   * 添加岗位
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('/admin/upms/sysPost/add', params)
  }

  /**
   * 更新岗位
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('/admin/upms/sysPost/update', params)
  }

  /**
   * 删除岗位
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('/admin/upms/sysPost/delete', params)
  }
}
