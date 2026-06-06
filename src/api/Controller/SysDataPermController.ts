import { http } from '@/utils/http'

/**
 * 系统数据权限控制器
 * 处理数据权限及其用户关联的增删改查操作
 */
export class SysDataPermController {
  /**
   * 添加数据权限
   * @param params {dataPermId, dataPermName, deptIdListString}
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysDataPerm/add', params)
  }

  /**
   * 更新数据权限
   * @param params {dataPermId, dataPermName, deptIdListString}
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysDataPerm/update', params)
  }

  /**
   * 删除数据权限
   * @param params {dataPermId}
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysDataPerm/delete', params)
  }

  /**
   * 获取数据权限列表
   * @param params {dataPermName}
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysDataPerm/list', params)
  }

  /**
   * 查看数据权限详情
   * @param params {dataPermId}
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysDataPerm/view', { params })
  }

  /**
   * 获取数据权限用户列表
   * @param params {dataPermId, searchString}
   */
  static listDataPermUser(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysDataPerm/listDataPermUser', params)
  }

  /**
   * 添加数据权限用户
   * @param params {dataPermId, userIdListString}
   */
  static addDataPermUser(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysDataPerm/addDataPermUser', params)
  }

  /**
   * 删除数据权限用户
   * @param params {dataPermId, userId}
   */
  static deleteDataPermUser(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysDataPerm/deleteDataPermUser', params)
  }

  /**
   * 获取不在数据权限中的用户列表
   */
  static listNotInDataPermUser(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysDataPerm/listNotInDataPermUser', params)
  }
}
