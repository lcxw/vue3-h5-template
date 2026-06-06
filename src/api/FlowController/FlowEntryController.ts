import { http } from '@/utils/http'

/**
 * 流程定义控制器
 * 处理流程定义的增删改查、发布、版本管理等操作
 */
export class FlowEntryController {
  /**
   * 获取流程定义列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowEntry/list', params)
  }

  /**
   * 查看流程定义详情
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowEntry/view', { params })
  }

  /**
   * 添加流程定义
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowEntry/add', params)
  }

  /**
   * 更新流程定义
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowEntry/update', params)
  }

  /**
   * 删除流程定义
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowEntry/delete', params)
  }

  /**
   * 发布流程定义
   */
  static publish(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowEntry/publish', params)
  }

  /**
   * 获取流程定义发布列表
   */
  static listFlowEntryPublish(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowEntry/listFlowEntryPublish', { params })
  }

  /**
   * 更新主版本
   */
  static updateMainVersion(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowEntry/updateMainVersion', params)
  }

  /**
   * 挂起流程定义发布
   */
  static suspendFlowEntryPublish(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowEntry/suspendFlowEntryPublish', params)
  }

  /**
   * 激活流程定义发布
   */
  static activateFlowEntryPublish(params: Record<string, any>): Promise<any> {
    return http.post('/admin/flow/flowEntry/activateFlowEntryPublish', params)
  }

  /**
   * 查看流程定义字典
   */
  static viewDict(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowEntry/viewDict', { params })
  }

  /**
   * 获取流程定义字典列表
   */
  static listDict(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowEntry/listDict', { params })
  }

  /**
   * 获取所有流程定义
   */
  static listAll(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowEntry/listAll', { params })
  }
}
