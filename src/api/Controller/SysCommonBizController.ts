import { http } from '@/utils/http'

/**
 * 系统通用业务控制器
 * 处理通用业务组件的查询操作
 */
export class SysCommonBizController {
  /**
   * 获取业务组件列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('admin/commonext/bizwidget/list', params)
  }

  /**
   * 根据ID列表查看业务组件
   */
  static viewByIds(params: Record<string, any>): Promise<any> {
    return http.post('admin/commonext/bizwidget/view', params)
  }
}
