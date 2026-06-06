import { http } from '@/utils/http'

/**
 * 流程变量控制器
 * 处理流程变量的增删改查操作
 */
export class FlowEntryVariableController {
  /**
   * 获取流程变量列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowEntryVariable/list', params)
  }

  /**
   * 添加流程变量
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowEntryVariable/add', params)
  }

  /**
   * 更新流程变量
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowEntryVariable/update', params)
  }

  /**
   * 删除流程变量
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowEntryVariable/delete', params)
  }

  /**
   * 查看流程变量详情
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowEntryVariable/view', { params })
  }
}
