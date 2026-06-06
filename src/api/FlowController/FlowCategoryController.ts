import { http } from '@/utils/http'

/**
 * 流程分类控制器
 * 处理流程分类的增删改查操作
 */
export class FlowCategoryController {
  /**
   * 获取流程分类列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowCategory/list', params)
  }

  /**
   * 查看流程分类详情
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowCategory/view', { params })
  }

  /**
   * 添加流程分类
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowCategory/add', params)
  }

  /**
   * 更新流程分类
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowCategory/update', params)
  }

  /**
   * 删除流程分类
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowCategory/delete', params)
  }
}
