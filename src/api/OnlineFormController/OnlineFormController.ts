import { http } from '@/utils/http'

/**
 * 在线表单控制器
 * 处理在线表单的增删改查、渲染、克隆等操作
 */
export class OnlineFormController {
  /**
   * 获取在线表单列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineForm/list', params)
  }

  /**
   * 查看在线表单详情
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('/admin/online/onlineForm/view', { params })
  }

  /**
   * 渲染在线表单
   */
  static render(params: Record<string, any>): Promise<any> {
    return http.get('/admin/online/onlineForm/render', { params })
  }

  /**
   * 导出在线表单数据
   */
  static export(params: Record<string, any>, fileName: string): Promise<Blob> {
    return http.downloadBlob('/admin/online/onlineForm/export', params)
  }

  /**
   * 添加在线表单
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineForm/add', params)
  }

  /**
   * 更新在线表单
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineForm/update', params)
  }

  /**
   * 删除在线表单
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineForm/delete', params)
  }

  /**
   * 克隆在线表单
   */
  static clone(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineForm/clone', params)
  }
}
