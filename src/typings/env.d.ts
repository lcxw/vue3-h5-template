/// <reference types="vite/client" />

declare module 'virtual:svg-icons/register' {
  export default function register(): void
}

interface ImportMetaEnv {
  /** API 基础路径 */
  readonly VITE_BASE_API: string
  /** 是否启用 Eruda 调试工具 */
  readonly VITE_ENABLE_ERUDA: string
  /** 公共路径 */
  readonly VITE_PUBLIC_PATH: string
  /** 是否启用 CDN */
  readonly VITE_CDN_DEPS: string
  /** OnlyOffice 服务地址 */
  readonly VITE_ONLYOFFICE_URL: string
  /** 项目名称 */
  readonly VITE_PROJECT_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
