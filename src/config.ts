/**
 * 项目全局配置
 * 迁移自: core/config/index.js + development.js + production.js
 */
export const projectConfig = {
  /** API 基础路径 */
  baseUrl: import.meta.env.VITE_BASE_API || '/',
  /** OnlyOffice 服务地址 */
  onlyofficeUrl: import.meta.env.VITE_ONLYOFFICE_URL || '/office/',
  /** 项目名称 */
  projectName: import.meta.env.VITE_PROJECT_NAME || '项目管理系统',
}

/**
 * 全局默认 HTTP 选项
 */
export const globalHttpOption = {
  showError: true,
  throttleFlag: false,
  throttleTimeout: 50,
}

export default projectConfig
