import { http } from '@/utils/http'

/**
 * 系统配置控制器
 * 处理系统配置的获取操作
 */
export class SysConfController {
  /**
   * 获取系统配置
   */
  static getSysConf(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysConf/view', { params })
  }
}
