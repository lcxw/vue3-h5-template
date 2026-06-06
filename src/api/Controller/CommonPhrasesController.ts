import { http } from '@/utils/http'

/**
 * 常用短语控制器
 * 处理常用短语列表的获取
 */
export class CommonPhrasesController {
  /**
   * 获取常用短语列表
   */
  static list(params: Record<string, any>): Promise<any> {
    return http.post('admin/upms/commonPhrases/list', params)
  }
}
