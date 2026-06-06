import type { AxiosRequestConfig } from 'axios'
import { showFailToast } from 'vant'
import { http } from '@/utils/http'
import requestUrl from './requestUrl'
import 'vant/es/toast/style'

function showErrorMessage(text: { message: string }): void {
  showFailToast(text.message)
}

/**
 * post 请求
 * @param url 请求的 url
 * @param params 请求参数
 * @param options axios 设置项
 */
export function fetchPost(url: string, params: any, options: AxiosRequestConfig): Promise<any> {
  if (options == null) return Promise.resolve({})
  const tempOptions: AxiosRequestConfig = {
    ...options,
    method: 'post',
    url: requestUrl(url),
    data: params,
  }
  return http.request(tempOptions)
}

/**
 * get 请求
 * @param url 请求的 url
 * @param params 请求参数
 * @param options axios 设置项
 */
export function fetchGet(url: string, params: any, options: AxiosRequestConfig): Promise<any> {
  if (options == null) return Promise.resolve({})
  const tempOptions: AxiosRequestConfig = {
    ...options,
    method: 'get',
    url: requestUrl(url),
    params,
  }
  return http.request(tempOptions)
}

/**
 * 下载文件，返回 blob
 * @param url 请求的 url
 * @param params 请求参数
 * @param _fileName 下载后保存的文件名（保留兼容）
 * @param method 请求方法
 */
export function fetchDownloadBlob(url: string, params?: any, _fileName?: string, method: string = 'post'): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const options: AxiosRequestConfig = {
      url: requestUrl(url),
      method: method as 'get' | 'post',
      data: method === 'post' ? params : undefined,
      params: method === 'get' ? params : undefined,
      responseType: 'blob',
      transformResponse: [(data: any) => {
        return (data instanceof Blob && data.size > 0) ? data : undefined
      }],
    }
    http.request(options).then((res: any) => {
      if (res == null) {
        reject(new Error('下载文件失败'))
      }
      else {
        const blobData = new Blob([res], { type: 'application/octet-stream' })
        resolve(blobData)
      }
    }).catch((e: any) => {
      if (e instanceof Blob) {
        const reader = new FileReader()
        reader.onload = () => {
          const jsonObj = JSON.parse(reader.result as string)
          reject((jsonObj || {}).errorMessage || '下载文件失败')
        }
        reader.readAsText(e)
      }
      else {
        reject(String('下载文件失败'))
      }
    })
  })
}

/**
 * 下载请求（触发浏览器下载）
 * @param url 请求的 url
 * @param params 请求参数
 * @param fileName 下载后保存的文件名
 */
export function fetchDownload(url: string, params: any, fileName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fetchDownloadBlob(url, params).then((blobData) => {
      const blobUrl = window.URL.createObjectURL(blobData)
      const linkDom = document.createElement('a')
      linkDom.style.display = 'none'
      linkDom.href = blobUrl
      linkDom.setAttribute('download', fileName)
      if (typeof linkDom.download === 'undefined') {
        linkDom.setAttribute('target', '_blank')
      }
      document.body.appendChild(linkDom)
      linkDom.click()
      document.body.removeChild(linkDom)
      window.URL.revokeObjectURL(blobUrl)
      resolve()
    }).catch(e => reject(e))
  })
}

/**
 * 上传文件
 * @param url 请求的 url
 * @param params 请求参数
 */
export function fetchUpload(url: string, params: Record<string, any>): Promise<any> {
  return new Promise((resolve, reject) => {
    http.request({
      url: requestUrl(url),
      method: 'post',
      data: params,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: [
        (data: Record<string, any>) => {
          const formData = new FormData()
          Object.keys(data).forEach((key) => {
            formData.append(key, data[key])
          })
          return formData
        },
      ],
    }).then((res: any) => {
      if (res && res.success) {
        resolve(res)
      }
      else {
        showErrorMessage({
          message: res?.errorMessage ? res.errorMessage : '数据请求失败',
        })
      }
    }).catch((e: any) => {
      showErrorMessage({
        message: e?.errorMessage ? e.errorMessage : '网络请求错误',
      })
      reject(e)
    })
  })
}

/** url 调用节流 Set */
const ajaxThrottleSet = new Set<string>()

export interface DoUrlOptions {
  /** 是否显示错误提示 */
  showError?: boolean
  /** 是否启用节流 */
  throttleFlag?: boolean
  /** 节流超时时间（ms） */
  throttleTimeout?: number
}

/**
 * 数据请求
 * @param url 请求的 url
 * @param type 请求类型 (get, post)
 * @param params 请求参数
 * @param axiosOption axios 设置
 * @param options 显示设置
 */
export function doUrl(
  url: string,
  type?: string,
  params?: any,
  axiosOption?: AxiosRequestConfig,
  options?: DoUrlOptions,
): Promise<any> {
  const finalOption: DoUrlOptions = {
    throttleFlag: false,
    ...options,
  }
  const { showError, throttleFlag, throttleTimeout } = finalOption
  const finalAxiosOption: AxiosRequestConfig = {
    ...axiosOption,
  }
  if (type == null || type === '') type = 'post'
  if (ajaxThrottleSet.has(url) && throttleFlag) {
    return Promise.resolve()
  }
  else {
    if (throttleFlag) {
      ajaxThrottleSet.add(url)
      setTimeout(() => {
        ajaxThrottleSet.delete(url)
      }, throttleTimeout || 50)
    }
    return new Promise((resolve, reject) => {
      let ajaxCall: Promise<any> | null = null
      if (type!.toLowerCase() === 'get') {
        ajaxCall = fetchGet(url, params, finalAxiosOption)
      }
      else if (type!.toLowerCase() === 'post') {
        ajaxCall = fetchPost(url, params, finalAxiosOption)
      }

      if (ajaxCall != null) {
        ajaxCall.then(res => resolve(res)).catch((e: any) => {
          if (showError) {
            showErrorMessage({
              message: e?.errorMessage ? e.errorMessage : '网络请求错误',
            })
          }
          reject(e)
        })
      }
      else {
        reject(new Error('错误的请求类型 - ' + type))
      }
    })
  }
}
