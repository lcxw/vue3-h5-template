import { http } from '@/utils/http'

/**
 * 在线操作控制器
 * 处理在线数据源、一对多关联、字典等操作
 */
export class OnlineOperation {
  /**
   * 获取在线字典列表
   */
  static listDict(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineOperation/listDict', params)
  }

  /**
   * 根据数据源ID获取列表
   */
  static listByDatasourceId(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineOperation/listByDatasourceId', params)
  }

  /**
   * 根据一对多关联ID获取列表
   */
  static listByOneToManyRelationId(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineOperation/listByOneToManyRelationId', params)
  }

  /**
   * 添加数据源
   */
  static addDatasource(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineOperation/addDatasource', params)
  }

  /**
   * 添加一对多关联
   */
  static addOneToManyRelation(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineOperation/addOneToManyRelation', params)
  }

  /**
   * 更新数据源
   */
  static updateDatasource(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineOperation/updateDatasource', params)
  }

  /**
   * 更新一对多关联
   */
  static updateOneToManyRelation(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineOperation/updateOneToManyRelation', params)
  }

  /**
   * 根据数据源ID查看详情
   */
  static viewByDatasourceId(params: Record<string, any>): Promise<any> {
    return http.get('/admin/online/onlineOperation/viewByDatasourceId', { params })
  }

  /**
   * 根据一对多关联ID查看详情
   */
  static viewByOneToManyRelationId(params: Record<string, any>): Promise<any> {
    return http.get('/admin/online/onlineOperation/viewByOneToManyRelationId', { params })
  }

  /**
   * 删除数据源
   */
  static deleteDatasource(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineOperation/deleteDatasource', params)
  }

  /**
   * 删除一对多关联
   */
  static deleteOneToManyRelation(params: Record<string, any>): Promise<any> {
    return http.post('/admin/online/onlineOperation/deleteOneToManyRelation', params)
  }

  /**
   * 获取字段规则代码
   */
  static getColumnRuleCode(params: Record<string, any>): Promise<any> {
    return http.get('/admin/online/onlineOperation/getColumnRuleCode', { params })
  }

  /**
   * 获取打印模板
   */
  static getPrintTemplate(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportPrint/listAll', params)
  }
}
