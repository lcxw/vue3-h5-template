import {
  createRouter,
  createWebHashHistory,
} from 'vue-router'
import { useCachedViewStore } from '@/store/modules/cached-view'
import setPageTitle from '@/utils/set-page-title'
import routes from './routes'

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

/**
 * 白名单路由（不需要登录验证的页面）
 */
const whiteList = ['/login', '/login/password']

/**
 * 路由守卫
 * 处理登录验证、路由缓存、页面标题
 */
router.beforeEach((to, _from, next) => {
  // 路由缓存
  useCachedViewStore().addCachedView(to)
  // 页面 title
  setPageTitle(to.meta.title)

  // 登录验证
  const token = localStorage.getItem('token')
  if (token) {
    // 已登录，正常跳转
    next()
  }
  else if (whiteList.includes(to.path)) {
    // 白名单页面，不需要登录
    next()
  }
  else {
    // 未登录，跳转到登录页
    next({ name: 'Login', query: { redirect: to.fullPath } })
  }
})

export default router
