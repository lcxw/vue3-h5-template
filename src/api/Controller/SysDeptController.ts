import { http } from '@/utils/http'

/**
 * 系统部门控制器
 * 处理部门的增删改查及部门岗位关联操作
 */
export class SysDeptController {
  /**
   * 获取部门列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysDept/list', params)
  }

  /**
   * 查看部门详情
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysDept/view', { params })
  }

  /**
   * 导出部门数据
   */
  static export(params: Record<string, any>, fileName: string): Promise<Blob> {
    return http.downloadBlob('admin/upms/sysDept/export', params)
  }

  /**
   * 添加部门
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysDept/add', params)
  }

  /**
   * 更新部门
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysDept/update', params)
  }

  /**
   * 删除部门
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysDept/delete', params)
  }

  /**
   * 获取不在部门岗位中的用户列表
   */
  static listNotInSysDeptPost(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysDept/listNotInSysDeptPost', params)
  }

  /**
   * 获取部门岗位列表
   */
  static listSysDeptPost(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysDept/listSysDeptPost', params)
  }

  /**
   * 添加部门岗位
   */
  static addSysDeptPost(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysDept/addSysDeptPost', params)
  }

  /**
   * 更新部门岗位
   */
  static updateSysDeptPost(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysDept/updateSysDeptPost', params)
  }

  /**
   * 删除部门岗位
   */
  static deleteSysDeptPost(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysDept/deleteSysDeptPost', params)
  }

  /**
   * 查看部门岗位详情
   */
  static viewSysDeptPost(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysDept/viewSysDeptPost', { params })
  }
}
