import { http } from '@/utils/http'

/**
 * 系统全局字典控制器
 * 处理全局字典及其数据项的增删改查操作
 */
export class SysGlobalDictController {
  /**
   * 获取全局字典列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/globalDict/list', params)
  }

  /**
   * 获取所有全局字典
   */
  static listAll(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/globalDict/listAll', { params })
  }

  /**
   * 添加全局字典
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/globalDict/add', params)
  }

  /**
   * 更新全局字典
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/globalDict/update', params)
  }

  /**
   * 删除全局字典
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/globalDict/delete', params)
  }

  /**
   * 添加字典数据项
   */
  static addItem(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/globalDict/addItem', params)
  }

  /**
   * 更新字典数据项
   */
  static updateItem(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/globalDict/updateItem', params)
  }

  /**
   * 更新字典数据项状态
   */
  static updateItemStatus(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/globalDict/updateItemStatus', params)
  }

  /**
   * 删除字典数据项
   */
  static deleteItem(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/globalDict/deleteItem', params)
  }

  /**
   * 重新加载缓存数据
   */
  static reloadCachedData(params: Record<string, any>): Promise<any> {
    return http.get('admin/upms/globalDict/reloadCachedData', { params })
  }
}
