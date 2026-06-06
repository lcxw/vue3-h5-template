import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import Axios from 'axios'
import { closeToast, showFailToast, showLoadingToast } from 'vant'
import router from '@/router'
import { ContentTypeEnum } from '@/enums/request-enum'
import NProgress from '../progress'
import 'vant/es/toast/style'

// 默认 Axios 实例请求配置
const configDefault: AxiosRequestConfig = {
  headers: {
    'Content-Type': ContentTypeEnum.JSON,
    'deviceType': '0',
  },
  timeout: 30000,
  baseURL: import.meta.env.VITE_BASE_API,
  data: {},
}

// HTTP 状态码 → 错误消息映射
const HTTP_ERROR_MAP: Record<number, string> = {
  400: '请求错误',
  401: '登录已过期，请重新登录',
  403: '拒绝访问',
  404: '请求地址出错',
  408: '请求超时',
  500: '服务器内部错误',
  501: '服务未实现',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
  505: 'HTTP版本不支持',
}

const axiosInstance: AxiosInstance = Axios.create(configDefault)

// 是否正在跳转登录页（防止重复跳转）
let isRedirectingToLogin = false

/**
 * 处理 401 认证过期
 */
function handleAuthExpired(): void {
  if (isRedirectingToLogin) return
  isRedirectingToLogin = true
  // 清空本地存储
  try {
    localStorage.clear()
    sessionStorage.clear()
  }
  catch { /* ignore */ }
  showFailToast('登录已过期，请重新登录')
  setTimeout(() => {
    isRedirectingToLogin = false
    router.push('/login')
  }, 1500)
}

// 请求拦截
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    NProgress.start()
    // 注入 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = token
    }
    // 注入 MenuId
    try {
      const menuIdStr = localStorage.getItem('currentMenuId')
      if (menuIdStr) {
        const parsed = JSON.parse(menuIdStr)
        config.headers.MenuId = parsed?.data ?? menuIdStr
      }
    }
    catch { /* ignore */ }
    return config
  },
  (error: AxiosError) => {
    showFailToast(error.message)
    return Promise.reject(error)
  },
)

// 响应拦截
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    NProgress.done()
    const res = response.data
    if (!res) {
      showFailToast('网络请求错误')
      return Promise.reject(new Error('网络请求错误'))
    }
    // 后端返回格式: { success: boolean, data: any, errorMessage?: string, errorCode?: number, code?: number }
    if (res.success) {
      return res.data === undefined ? {} : res.data
    }
    // 401 处理
    if (res.errorCode === 401 || res.code === 401) {
      handleAuthExpired()
      return Promise.reject(new Error(res.errorMessage || '登录已过期'))
    }
    // 业务错误
    showFailToast(res.errorMessage || '网络请求错误')
    return Promise.reject(res)
  },
  (error: AxiosError) => {
    NProgress.done()
    // 被取消的请求不弹出错误提示
    if (Axios.isCancel(error)) {
      return Promise.reject(error)
    }
    // 处理 HTTP 网络错误
    const status = error.response?.status
    if (status === 401) {
      handleAuthExpired()
      return Promise.reject(error)
    }
    const message = (status && HTTP_ERROR_MAP[status]) || '网络连接故障'
    showFailToast(message)
    return Promise.reject(error)
  },
)

export const http = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return axiosInstance.get(url, config)
  },
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return axiosInstance.post(url, data, config)
  },
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return axiosInstance.put(url, data, config)
  },
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return axiosInstance.delete(url, config)
  },
  request<T = any>(config: AxiosRequestConfig): Promise<T> {
    return axiosInstance.request(config)
  },
  /**
   * 文件上传
   */
  upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    return axiosInstance.post(url, formData, {
      ...config,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  /**
   * 文件下载 (返回 Blob)
   */
  downloadBlob(url: string, data?: any, config?: AxiosRequestConfig): Promise<Blob> {
    return axiosInstance.post(url, data, {
      ...config,
      responseType: 'blob',
    }).then((res: any) => {
      if (res instanceof Blob && res.size > 0) {
        return res
      }
      throw new Error('下载文件失败')
    })
  },
  /**
   * 可取消的请求 — 适用于页面切换时取消未完成的请求
   */
  requestWithCancel<T = any>(config: AxiosRequestConfig) {
    const controller = new AbortController()
    const finalConfig = {
      ...config,
      signal: controller.signal,
    }
    return {
      promise: axiosInstance.request<any, T>(finalConfig),
      cancel: () => controller.abort(),
    }
  },
}

export { showLoadingToast, closeToast }
