import { http } from '@/utils/http'

/**
 * 在线数据库链接控制器
 * 处理在线数据库链接的增删改查、表结构获取及连接测试操作
 */
export class OnlineDblinkController {
  /**
   * 获取在线数据库链接列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineDblink/list', params)
  }

  /**
   * 获取数据库链接表列表
   */
  static listDblinkTables(params: Record<string, any>): Promise<any> {
    return http.get('/admin/online/onlineDblink/listDblinkTables', { params })
  }

  /**
   * 获取数据库链接表字段列表
   */
  static listDblinkTableColumns(params: Record<string, any>): Promise<any> {
    return http.get('/admin/online/onlineDblink/listDblinkTableColumns', { params })
  }

  /**
   * 查看在线数据库链接详情
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('/admin/online/onlineDblink/view', { params })
  }

  /**
   * 添加在线数据库链接
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineDblink/add', params)
  }

  /**
   * 更新在线数据库链接
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineDblink/update', params)
  }

  /**
   * 删除在线数据库链接
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineDblink/delete', params)
  }

  /**
   * 测试数据库连接
   */
  static testConnection(params: Record<string, any>): Promise<any> {
    return http.get('/admin/online/onlineDblink/testConnection', { params })
  }
}