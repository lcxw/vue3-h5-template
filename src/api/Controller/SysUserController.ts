import { http } from '@/utils/http'

/**
 * 系统用户控制器
 * 处理用户的增删改查及导出操作
 */
export class SysUserController {
  /**
   * 获取用户列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysUser/list', params)
  }

  /**
   * 查看用户详情
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysUser/view', { params })
  }

  /**
   * 导出用户数据
   */
  static export(params: Record<string, any>, fileName: string): Promise<Blob> {
    return http.downloadBlob('admin/upms/sysUser/export', params)
  }

  /**
   * 添加用户
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysUser/add', params)
  }

  /**
   * 更新用户
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysUser/update', params)
  }

  /**
   * 删除用户
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysUser/delete', params)
  }
}
