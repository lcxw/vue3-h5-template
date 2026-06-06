import { http } from '@/utils/http'

/**
 * 在线数据源关联控制器
 * 处理在线数据源关联的增删改查操作
 */
export class OnlineDatasourceRelationController {
  /**
   * 获取在线数据源关联列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineDatasourceRelation/list', params)
  }

  /**
   * 查看在线数据源关联详情
   */
  static view(params: Record<string, any>): Promise<any> {
    return http.get('/admin/online/onlineDatasourceRelation/view', { params })
  }

  /**
   * 导出在线数据源关联数据
   */
  static export(params: Record<string, any>, fileName: string): Promise<Blob> {
    return http.downloadBlob('/admin/online/onlineDatasourceRelation/export', params)
  }

  /**
   * 添加在线数据源关联
   */
  static add(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineDatasourceRelation/add', params)
  }

  /**
   * 更新在线数据源关联
   */
  static update(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineDatasourceRelation/update', params)
  }

  /**
   * 删除在线数据源关联
   */
  static delete(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineDatasourceRelation/delete', params)
  }
}
