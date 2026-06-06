/**
 * 处理请求 URL，去掉开头的 '/'，判断是否为完整 URL
 * @param actionName - 请求路径
 * @returns 处理后的 URL
 */
export default function requestUrl(actionName: string): string {
  if (actionName != null && actionName !== '') {
    if (actionName.charAt(0) === '/')
      actionName = actionName.substring(1)
  }
  if (actionName.startsWith('http://') || actionName.startsWith('https://')) {
    return actionName
  }
  else {
    return actionName
  }
}
