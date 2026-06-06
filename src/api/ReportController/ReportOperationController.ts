import { http } from '@/utils/http'

/**
 * 报表操作控制器
 * 处理报表数据的查询和预览操作
 */
export class ReportOperationController {
  /**
   * 根据分组获取数据列表
   */
  static listDataWithGroup(params: Record<string, any>): Promise<any> {
    const url = `/admin/report/reportOperation/listData/${params.pageCode}`
    return http.post(url, params)
  }

  /**
   * 预览数据
   */
  static previewDataWithGroup(params: Record<string, any>): Promise<any> {
    return http.post('/admin/report/reportOperation/previewData', params)
  }
}
