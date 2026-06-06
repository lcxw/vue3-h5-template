import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'

/**
 * 应用路由配置
 * 包含所有页面路由、TabBar路由、业务模块路由
 */
const routes: Array<RouteRecordRaw> = [
  // 主布局路由（带 TabBar）
  {
    path: '/',
    name: 'root',
    component: Layout,
    redirect: { name: 'Home' },
    children: [
      // 工作台（首页）
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/pages/home/index.vue'),
        meta: {
          title: '工作台',
        },
      },
      // 消息（待办任务）
      {
        path: 'message',
        name: 'Message',
        component: () => import('@/views/workflow/formRuntimeTask/formMyTask.vue'),
        meta: {
          title: '消息',
        },
      },
      // 我的
      {
        path: 'my',
        name: 'My',
        component: () => import('@/pages/my/index.vue'),
        meta: {
          title: '我的',
        },
      },
      // Demo 页面（保留）
      {
        path: 'demo',
        name: 'Demo',
        component: () => import('@/views/demo/index.vue'),
        meta: {
          title: 'Demo',
        },
      },
      // 工具页面（保留）
      {
        path: 'tools',
        name: 'Tools',
        component: () => import('@/views/tools/index.vue'),
        meta: {
          title: '工具',
        },
      },
      // 关于页面（保留）
      {
        path: 'about',
        name: 'About',
        component: () => import('@/views/about/index.vue'),
        meta: {
          title: '关于',
          noCache: true,
        },
      },
      // 报表展示
      {
        path: 'report',
        name: 'Report',
        component: () => import('@/views/report/index.vue'),
        meta: {
          title: '报表展示',
          noCache: true,
        },
      },
      // 报表表单
      {
        path: 'report/form',
        name: 'ReportForm',
        component: () => import('@/views/report/reportForm.vue'),
        meta: {
          title: '报表详情',
          noCache: true,
        },
      },
      // 在线表单入口
      {
        path: 'online/form',
        name: 'OnlineForm',
        component: () => import('@/views/online/form.vue'),
        meta: {
          title: '在线表单',
          noCache: true,
        },
      },
      // 已办任务
      {
        path: 'workflow/approved',
        name: 'FormMyApprovedTask',
        component: () => import('@/views/workflow/formRuntimeTask/formMyApprovedTask.vue'),
        meta: {
          title: '已办任务',
          noCache: true,
        },
      },
      // 历史任务
      {
        path: 'workflow/history',
        name: 'FormMyHistoryTask',
        component: () => import('@/views/workflow/formRuntimeTask/formMyHistoryTask.vue'),
        meta: {
          title: '历史任务',
          noCache: true,
        },
      },
      // 流程处理
      {
        path: 'workflow/handle',
        name: 'HandleFlowTask',
        component: () => import('@/views/workflow/handleFlowTask/index.vue'),
        meta: {
          title: '任务详情',
          noCache: true,
        },
      },
    ],
  },
  // 登录页面（不需要 Layout）
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login/index.vue'),
    meta: {
      title: '登录',
      noCache: true,
    },
  },
  // 修改密码页面
  {
    path: '/login/password',
    name: 'LoginPassword',
    component: () => import('@/pages/login/password.vue'),
    meta: {
      title: '修改密码',
      noCache: true,
    },
  },
  // 个人信息页面
  {
    path: '/my/info',
    name: 'MyInfo',
    component: () => import('@/pages/my/info.vue'),
    meta: {
      title: '个人信息',
      noCache: true,
    },
  },
  // 系统设置页面
  {
    path: '/my/setting',
    name: 'MySetting',
    component: () => import('@/pages/my/setting.vue'),
    meta: {
      title: '系统设置',
      noCache: true,
    },
  },
  // OA 任务处理页面
  {
    path: '/custom/handleOATask',
    name: 'HandleOATask',
    component: () => import('@/pages/custom/handleOATask.vue'),
    meta: {
      title: 'OA任务处理',
      noCache: true,
    },
  },
  // OA 任务查看页面
  {
    path: '/custom/viewOATask',
    name: 'ViewOATask',
    component: () => import('@/pages/custom/viewOATask.vue'),
    meta: {
      title: 'OA任务查看',
      noCache: true,
    },
  },
  // 文件预览页面
  {
    path: '/preview/onlyoffice',
    name: 'OnlyOfficePreview',
    component: () => import('@/pages/preview/onlyoffice.vue'),
    meta: {
      title: '文件预览',
      noCache: true,
    },
  },
  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404.vue'),
    meta: {
      title: '页面未找到',
      noCache: true,
    },
  },
]

export default routes
