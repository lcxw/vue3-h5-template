import { http } from '@/utils/http'

/**
 * 字典控制器
 * 处理各类字典数据的获取，包括角色字典、部门字典、菜单字典等
 */
export class DictionaryController {
  /**
   * 获取角色字典
   */
  static dictSysRole(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysRole/listDict', { params })
  }

  /**
   * 获取全局编码字典
   */
  static dictGlobalDict(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/globalDict/listDict', { params })
  }

  /**
   * 根据ID列表获取全局编码字典
   */
  static dictGlobalDictByIds(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/globalDict/listDictByIds', { params })
  }

  /**
   * 获取用户状态字典（静态）
   */
  static dictSysUserStatus(): Promise<any> {
    return Promise.resolve({ id: 'SysUserStatus', name: '用户状态字典' })
  }

  /**
   * 获取用户类型字典（静态）
   */
  static dictSysUserType(): Promise<any> {
    return Promise.resolve({ id: 'SysUserType', name: '用户类型字典' })
  }

  /**
   * 获取部门字典
   */
  static dictSysDept(params: Record<string, any>): Promise<any> {
    return http.get('/admin/upms/sysDept/listDict', { params })
  }

  /**
   * 根据父级ID获取部门字典
   */
  static dictSysDeptByParentId(params: Record<string, any>): Promise<any> {
    return http.get('/admin/upms/sysDept/listDictByParentId', { params })
  }

  /**
   * 获取所有菜单字典
   */
  static dictAllMenu(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysMenu/listDict', { params })
  }

  /**
   * 获取系统菜单字典
   */
  static dictSysMenu(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysMenu/listMenuDict', { params })
  }

  /**
   * 获取数据权限类型字典（静态）
   */
  static dictSysDataPermType(): Promise<any> {
    return Promise.resolve({ id: 'SysDataPermType', name: '数据权限类型字典' })
  }

  /**
   * 获取数据权限字典
   */
  static dictSysDataPerm(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysDataPerm/listDict', { params })
  }

  /**
   * 获取部门岗位字典
   */
  static dictDeptPost(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysDept/listSysDeptPostWithRelation', { params })
  }

  /**
   * 获取岗位字典
   */
  static dictSysPost(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysPost/listDict', { params })
  }

  /**
   * 获取在线数据库链接字典
   */
  static dictOnlineDblink(params: Record<string, any>): Promise<any> {
    return http.get('/admin/online/onlineDblink/listDict', { params })
  }

  /**
   * 获取报表数据库链接字典
   */
  static dictReportDblink(params: Record<string, any>): Promise<any> {
    return http.get('/admin/report/reportDblink/listDict', { params })
  }

  /**
   * 获取报表字典
   */
  static dictReportDict(params: Record<string, any>): Promise<any> {
    return http.get('/admin/report/reportDict/listDict', { params })
  }

  /**
   * 获取流程数据库链接字典
   */
  static dictFlowDblink(params: Record<string, any>): Promise<any> {
    return http.get('/admin/flow/flowDblink/listDict', { params })
  }
}
