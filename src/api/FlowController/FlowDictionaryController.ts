import { http } from '@/utils/http'

/**
 * 流程字典控制器
 * 处理流程相关字典数据的获取
 */
export class FlowDictionaryController {
  /**
   * 获取流程分类字典
   */
  static dictFlowCategory(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowCategory/listDict', { params })
  }
}
