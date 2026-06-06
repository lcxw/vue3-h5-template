import { http } from '@/utils/http'

/**
 * 系统控制器
 * 处理登录、登出、用户管理、角色管理、部门管理、菜单管理等系统级操作
 */
export class SystemController {
  /**
   * 用户登录
   */
  static login(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/login/doLogin', params)
  }

  /**
   * SSO单点登录
   */
  static ssoLogin(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/login/doLoginByAuth', { params })
  }

  /**
   * 获取任务信息
   */
  static getTaskInfo(params: Record<string, any>): Promise<any> {
    return http.get('admin/flow/flowOperation/getTaskInfo', { params })
  }

  /**
   * 查看任务信息
   */
  static viewTaskInfo(params: Record<string, any>): Promise<any> {
    return http.get('admin/flow/flowOperation/viewTaskInfo', { params })
  }

  /**
   * 用户登出
   */
  static logout(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/login/doLogout', params)
  }

  /**
   * 设置当前工作台页面
   * @param params {newWorkbenchId}
   */
  static changeWorkbenchId(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/login/changeWorkbenchId', { params })
  }

  /**
   * 移动端登录
   */
  static loginMobile(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/login/doMobileLogin', params)
  }

  /**
   * 修改密码
   */
  static changePassword(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/login/changePassword', params)
  }

  /**
   * 无需登录修改密码
   */
  static changePasswordWithoutLogin(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/login/changePasswordWithoutLogin', params)
  }

  /**
   * 获取登录信息
   */
  static getLoginInfo(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/login/getLoginInfo', { params })
  }

  /**
   * 获取字典列表
   */
  static getDictList(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysDict/list', params)
  }

  /**
   * 获取角色列表
   */
  static getRoleList(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysRole/list', params)
  }

  /**
   * 获取角色详情
   */
  static getRole(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysRole/view', { params })
  }

  /**
   * 删除角色
   */
  static deleteRole(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysRole/delete', params)
  }

  /**
   * 添加角色
   */
  static addRole(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysRole/add', params)
  }

  /**
   * 更新角色
   */
  static updateRole(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysRole/update', params)
  }

  /**
   * 获取用户列表
   */
  static getUserList(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysUser/list', params)
  }

  /**
   * 获取用户详情
   */
  static getUser(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysUser/view', { params })
  }

  /**
   * 重置用户密码
   */
  static resetUserPassword(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysUser/resetPassword', params)
  }

  /**
   * 删除用户
   */
  static deleteUser(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysUser/delete', params)
  }

  /**
   * 添加用户
   */
  static addUser(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysUser/add', params)
  }

  /**
   * 更新用户
   */
  static updateUser(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysUser/update', params)
  }

  /**
   * 添加部门
   */
  static addDepartment(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysDept/add', params)
  }

  /**
   * 删除部门
   */
  static deleteDepartment(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysDept/delete', params)
  }

  /**
   * 更新部门
   */
  static updateDepartment(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysDept/update', params)
  }

  /**
   * 获取部门列表
   */
  static getDepartmentList(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysDept/list', params)
  }

  // ========== 菜单接口 ==========

  /**
   * 获取菜单权限列表
   */
  static getMenuPermList(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysMenu/list', params)
  }

  /**
   * 添加菜单
   */
  static addMenu(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysMenu/add', params)
  }

  /**
   * 更新菜单
   */
  static updateMenu(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysMenu/update', params)
  }

  /**
   * 删除菜单
   */
  static deleteMenu(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysMenu/delete', params)
  }

  /**
   * 查看菜单详情
   */
  static viewMenu(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysMenu/view', { params })
  }

  // ========== 权限字接口 ==========

  /**
   * 获取所有权限码
   */
  static getPermCodeList(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/login/getAllPermCodes', { params })
  }

  /**
   * 获取角色用户列表
   * @param params {roleId, searchString}
   */
  static listRoleUser(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysRole/listUserRole', params)
  }

  /**
   * 获取不在角色中的用户列表
   */
  static listNotInUserRole(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysRole/listNotInUserRole', params)
  }

  /**
   * 添加角色用户
   * @param params {roleId, userIdListString}
   */
  static addRoleUser(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysRole/addUserRole', params)
  }

  /**
   * 删除角色用户
   * @param params {roleId, userId}
   */
  static deleteRoleUser(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysRole/deleteUserRole', params)
  }

  /**
   * 根据权限码查询角色
   */
  static queryRoleByPermCode(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysRole/listAllRolesByPermCode', params)
  }

  // ========== 权限查询 ==========

  /**
   * 获取用户权限详情列表
   */
  static listSysPermWithDetail(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysUser/listSysPermWithDetail', { params })
  }

  /**
   * 获取用户权限码详情列表
   */
  static listSysPermCodeWithDetail(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysUser/listSysPermCodeWithDetail', { params })
  }

  /**
   * 获取用户菜单详情列表
   */
  static listSysMenuWithDetail(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysUser/listSysMenuWithDetail', { params })
  }

  /**
   * 根据角色ID获取权限详情列表
   */
  static listSysPermByRoleIdWithDetail(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysRole/listSysPermWithDetail', { params })
  }

  /**
   * 根据角色ID获取权限码详情列表
   */
  static listSysPermCodeByRoleIdWithDetail(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysRole/listSysPermCodeWithDetail', { params })
  }

  /**
   * 获取菜单权限码列表
   */
  static listMenuPermCode(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysMenu/listMenuPerm', { params })
  }

  /**
   * 根据菜单ID获取权限详情列表
   */
  static listSysPermByMenuIdWithDetail(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysMenu/listSysPermWithDetail', { params })
  }

  /**
   * 根据菜单ID获取用户详情列表
   */
  static listSysUserByMenuIdWithDetail(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysMenu/listSysUserWithDetail', { params })
  }

  /**
   * 根据权限码ID获取用户详情列表
   */
  static listSysUserByPermCodeIdWithDetail(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysPermCode/listSysUserWithDetail', { params })
  }

  /**
   * 根据权限码ID获取角色详情列表
   */
  static listSysRoleByPermCodeIdWithDetail(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysPermCode/listSysRoleWithDetail', { params })
  }

  /**
   * 根据权限ID获取用户详情列表
   */
  static listSysUserByPermIdWithDetail(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysPerm/listSysUserWithDetail', { params })
  }

  /**
   * 根据权限ID获取角色详情列表
   */
  static listSysRoleByPermIdWithDetail(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysPerm/listSysRoleWithDetail', { params })
  }

  /**
   * 根据权限ID获取菜单详情列表
   */
  static listSysMenuByPermIdWithDetail(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/sysPerm/listSysMenuWithDetail', { params })
  }

  // ========== 操作日志 ==========

  /**
   * 获取操作日志列表
   */
  static listSysOperationLog(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/sysOperationLog/list', params)
  }

  // ========== 在线用户 ==========

  /**
   * 获取在线用户列表
   */
  static listSysLoginUser(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/loginUser/list', params)
  }

  /**
   * 删除在线用户
   */
  static deleteSysLoginUser(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/loginUser/delete', params)
  }

  /**
   * 获取上传用户头像URL
   */
  static changeHeadImageUrl(): string {
    return 'admin/upms/login/changeHeadImage'
  }

  /**
   * 获取用户签名
   */
  static getUserSignature(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/login/getSigningPicture', { params })
  }

  /**
   * 保存用户签名
   */
  static saveUserSignature(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/login/changeSigningPicture', params)
  }
}
