# 项目迁移修复执行计划

## Context

项目从 uniapp (Vue 2 + uview-ui) 迁移至 Vite + Vue 3 + VITE H5。迁移后在线表单、流程审批等核心业务功能无法正常使用。本计划旨在系统性地排查并修复所有迁移遗留问题，确保H5端功能完整可用。

---

## 一、项目技术栈对比

### 原始项目 (C:\Users\wang\githome\node\vue\p2506-si-forms-fe-mobile)
- **框架**: uniapp + Vue 2 (Options API)
- **UI组件库**: uview-ui
- **API调用**: uni API (uni.navigateTo, uni.showToast等)
- **状态管理**: Vuex / 全局变量
- **构建工具**: Webpack (vue.config.js)
- **路由**: pages.json 配置
- **混入**: mixins (flowMixins.js, onlineFormMixins.js)
- **语言**: JavaScript

### 迁移后项目 (c:\Users\wang\githome\node\vue\vue3-h5-template)
- **框架**: Vue 3 (Composition API + Options API混合)
- **UI组件库**: vant
- **API调用**: axios
- **状态管理**: Vue 3 reactive/ref
- **构建工具**: Vite 8.0.16
- **路由**: Vue Router 4 (hash模式)
- **组合式函数**: composables (useFlow.ts替代flowMixins)
- **语言**: TypeScript


---

## 三、执行任务清单

### Task 1: 核心基础设施检查
**目标**: 确保项目基础架构正确运行

- [ ] 1.1 检查 `src/utils/taroCompat.ts` 兼容性层实现
  - 验证所有uni API到Taro API的映射
  - 重点检查: navigateTo, showToast, showModal, navigateBack, getStorageSync/setStorageSync
  - 文件: `src/utils/taroCompat.ts`

- [ ] 1.2 检查 `src/common/request.ts` 和 `src/common/ajax.ts`
  - 对比原始项目的请求封装
  - 验证API请求路径、拦截器、错误处理
  - 文件: `src/common/request.ts`, `src/common/ajax.ts`

- [ ] 1.3 检查静态字典 `src/staticDict/`
  - 对比原始项目的静态字典定义
  - 验证: flowStaticDict.ts, onlineStaticDict.ts, reportStaticDict.ts
  - 文件: `src/staticDict/*.ts`

- [ ] 1.4 检查 `src/App.vue` 和入口文件
  - 验证应用初始化逻辑
  - 检查全局配置、路由守卫
  - 文件: `src/App.vue`, `src/app.ts`

**验证方法**: 运行 `npm run dev`，检查控制台无报错，能正常访问登录页

---

### Task 2: 登录模块修复
**目标**: 确保用户能正常登录并获取用户信息

- [ ] 2.1 检查登录页面组件
  - 对比原始: `pages/login/index.vue`, `pages/login/password.vue`
  - 检查迁移后: `src/pages/login/index.vue`, `src/pages/login/password.vue`
  - 验证表单验证、API调用、跳转逻辑

- [ ] 2.2 检查SSO登录
  - 对比原始: `ssoLogin.vue` (项目根目录)
  - 检查迁移后: `src/pages/login/ssoLogin.vue`
  - 验证URL参数解析、token处理

- [ ] 2.3 验证登录状态管理
  - 检查token存储 (localStorage/sessionStorage)
  - 检查用户信息存储和获取
  - 验证路由守卫 (未登录跳转)

**验证方法**: 
1. 启动开发服务器
2. 访问登录页，输入用户名密码
3. 验证能成功登录并跳转到首页
4. 检查localStorage中是否正确存储token和userInfo

---

### Task 3: 首页功能修复
**目标**: 首页能正确加载菜单和入口配置

- [ ] 3.1 检查首页组件
  - 对比原始: `pages/home/index.vue`
  - 检查迁移后: `src/pages/home/index.vue`
  - 验证组件替换: u-grid → nut-grid, u-image → nut-image

- [ ] 3.2 验证菜单加载逻辑
  - 检查从localStorage读取 `setHomeEntryList`
  - 验证 `jumpTo` 方法的菜单跳转逻辑
  - 检查 `SysMenuBindType` 字典引用

- [ ] 3.3 验证待办任务计数
  - 检查 `FlowOperationController.countRuntimeTask` 调用
  - 验证API响应处理

**验证方法**:
1. 登录后查看首页
2. 验证菜单分组和图标显示
3. 点击菜单项，验证能正确跳转到对应页面

---

### Task 4: 在线表单模块修复 (核心)
**目标**: 在线表单能正常展示、查询、编辑、提交

#### 4.1 表单入口页面
- [ ] 对比原始: `views/online/form.vue`
- [ ] 检查迁移后: `src/views/online/form.vue`
- [ ] 验证URL参数解析 (formId, entryId)
- [ ] 验证子页面切换逻辑

#### 4.2 表单Mixins迁移验证
- [ ] 对比原始: `views/online/onlineFormMixins.js` (876行)
- [ ] 检查迁移后: `src/views/online/onlineFormMixins.ts`
- [ ] **重点检查**:
  - `buildFormConfig` 方法 (构建表单配置)
  - `getWidgetValue` / `onValueChange` (组件值获取和变更)
  - `initFormWidgetList` / `initWidget` (组件初始化)
  - `buildWidgetRule` (表单验证规则)
  - `initPage` (页面初始化)
  - `handlerOperation` (操作处理)

#### 4.3 表单组件检查
- [ ] 检查 `src/views/components/Online/` 目录下所有组件
- [ ] 验证组件替换: uview → vant
- [ ] 重点组件:
  - OnlineCustomWidget.vue (核心组件渲染)
  - OnlineCustomList.vue (列表组件)
  - OnlineCustomUpload.vue (上传组件)
  - OnlineRelationSelect.vue (关联选择)

#### 4.4 表单字段组件
- [ ] 检查 `src/views/components/Field*.vue` 所有字段组件
- [ ] 验证每种字段类型: Input, Select, Radio, CheckBox, Cascader, Upload等
- [ ] 确保vant组件正确使用

#### 4.5 表单类型支持
- [ ] OnlineQueryForm.vue (查询表单)
- [ ] OnlineEditForm.vue (编辑表单)
- [ ] OnlineWorkflowForm.vue (工作流表单)
- [ ] OnlineWorkOrderForm.vue (工单表单)
- [ ] OnlineOneToOneQueryForm.vue (一对一查询表单)

#### 4.6 在线表单工具函数
- [ ] 对比原始: `views/online/utils.js`
- [ ] 检查迁移后: `src/views/online/utils.ts`
- [ ] 验证 `getDictDataList` 等工具函数

**验证方法**:
1. 从首页点击在线表单菜单
2. 验证表单列表页能加载
3. 点击查看详情，验证表单渲染
4. 测试表单提交、验证规则
5. 测试各种字段类型交互

---

### Task 5: 流程审批模块修复 (核心)
**目标**: 流程任务列表、审批处理、表单联动正常

#### 5.1 我的待办任务
- [ ] 对比原始: `views/workflow/formRuntimeTask/formMyTask.vue`
- [ ] 检查迁移后: `src/views/workflow/formRuntimeTask/formMyTask.vue`
- [ ] 验证任务列表加载、分页、筛选
- [ ] 验证点击进入任务详情

#### 5.2 已办任务 / 历史任务
- [ ] 检查 `formMyApprovedTask.vue` (已办)
- [ ] 检查 `formMyHistoryTask.vue` (历史)
- [ ] 验证API调用和数据展示

#### 5.3 流程处理页面 (关键)
- [ ] 对比原始: `views/workflow/handleFlowTask/index.vue` (966行)
- [ ] 检查迁移后: `src/views/workflow/handleFlowTask/index.vue` (876行)
- [ ] **重点差异分析**:
  - 原始使用 `mixins: [flowMixins]`
  - 迁移后使用 `useFlow()` composables
  - 验证所有mixin方法已正确转换为composables

#### 5.4 useFlow组合式函数
- [ ] 对比原始: `views/workflow/mixins/flowMixins.js` (114行)
- [ ] 检查迁移后: `src/views/workflow/composables/useFlow.ts` (228行)
- [ ] 验证方法映射:
  - `submitConsign` (加签/减签)
  - `preHandlerOperation` (审批预处理)
  - `handlerClose` (关闭页面)
  - `initFormData` (初始化表单)
  - `startImpl` (启动流程)
  - `submitImpl` (提交流程)

#### 5.5 流程组件检查
- [ ] taskCard.vue (任务卡片)
- [ ] taskCommentList.vue (审批记录)
- [ ] taskCommit.vue (审批提交弹窗)
- [ ] copyForSelect/ (抄送人选择)

#### 5.6 流程API控制器
- [ ] 检查 `src/api/FlowController/` 所有控制器
- [ ] 验证:
  - FlowOperationController.ts (流程操作)
  - FlowEntryController.ts (流程入口)
  - FlowCategoryController.ts (流程分类)

**验证方法**:
1. 访问"消息"tab (待办任务)
2. 验证任务列表加载
3. 点击任务进入审批页
4. 验证表单展示、审批记录
5. 测试审批操作 (同意、拒绝、加签等)
6. 验证审批成功后返回列表

---

### Task 6: 报表模块修复
**目标**: 报表页面能正常展示图表

- [ ] 6.1 检查报表入口
  - 对比原始: `views/report/index.vue`
  - 检查迁移后: `src/views/report/index.vue`

- [ ] 6.2 检查报表表单
  - 对比原始: `views/report/reportForm.vue`
  - 检查迁移后: `src/views/report/reportForm.vue`

- [ ] 6.3 检查图表组件
  - 对比原始: `views/components/Charts/` 和 `Charts3.0/`
  - 检查迁移后: `src/views/components/Charts/` 和 `Charts3.0/`
  - 验证ECharts集成

- [ ] 6.4 检查报表API
  - 验证 `src/api/ReportController/` 所有控制器
  - 检查数据加载和渲染

**验证方法**:
1. 从首页点击报表菜单
2. 验证报表页面加载
3. 验证图表渲染

---

### Task 7: 公共组件和工具验证
**目标**: 确保所有公共组件正常工作

#### 7.1 基础组件
- [ ] BasePage.vue (页面容器)
- [ ] BaseFilter.vue (筛选器)
- [ ] CustomList.vue (自定义列表)
- [ ] CustomImage.vue (图片组件)
- [ ] CustomText.vue (文本组件)
- [ ] FilterBox.vue (筛选框)
- [ ] SearchFilter.vue (搜索筛选)

#### 7.2 弹出组件
- [ ] CustomPopup/index.vue
- [ ] CustomSelectPanel/index.vue
- [ ] CustomCascaderPanel/index.vue
- [ ] CustomCascaderPanelPopup/index.vue
- [ ] SelectPopup/index.vue

#### 7.3 选择组件
- [ ] DeptSelect/ (部门选择)
- [ ] UserSelect/ (用户选择)
- [ ] SignaturePad/ (签名板)

#### 7.4 工具函数
- [ ] `src/utils/index.ts` (主工具函数)
- [ ] `src/utils/validate.ts` (表单验证)
- [ ] `src/utils/widget.ts` (组件工具)
- [ ] `src/utils/onlineEvent.ts` (在线表单事件)
- [ ] `src/utils/signature.ts` (签名工具)
- [ ] `src/utils/constant.ts` (常量定义)

---

### Task 8: 页面模块验证
**目标**: 确保所有页面正常工作

- [ ] 8.1 我的页面
  - `src/pages/my/index.vue`
  - `src/pages/my/setting.vue`
  - `src/pages/my/info.vue`

- [ ] 8.2 自定义页面
  - `src/pages/custom/handleOATask.vue`
  - `src/pages/custom/viewOATask.vue`

- [ ] 8.3 预览页面
  - `src/pages/preview/onlineoffice.vue`

- [ ] 8.4 TabBar组件
  - 检查 `src/components/CustomTabBar.vue`
  - 验证tab切换功能

---

### Task 9: API层完整性验证
**目标**: 确保所有API接口正确迁移

#### 9.1 通用控制器
- [ ] CommonPhrasesController.ts
- [ ] DictionaryController.ts
- [ ] SysCommonBizController.ts
- [ ] SysConfController.ts
- [ ] SysDataPermController.ts
- [ ] SysDeptController.ts
- [ ] SysGlobalDictController.ts
- [ ] SysPostController.ts
- [ ] SystemController.ts
- [ ] SysUserController.ts

#### 9.2 在线表单控制器
- [ ] OnlineColumnController.ts
- [ ] OnlineDatasourceController.ts
- [ ] OnlineDatasourceRelationController.ts
- [ ] OnlineDblinkController.ts
- [ ] OnlineDictController.ts
- [ ] OnlineFormController.ts
- [ ] OnlineOperation.ts
- [ ] OnlinePageController.ts
- [ ] OnlineRuleController.ts
- [ ] OnlineVirtualColumnController.ts

#### 9.3 流程控制器
- [ ] FlowCategoryController.ts
- [ ] FlowDictionaryController.ts
- [ ] FlowEntryController.ts
- [ ] FlowEntryVariableController.ts
- [ ] FlowOperationController.ts

#### 9.4 报表控制器
- [ ] ReportDatasetColumnController.ts
- [ ] ReportDatasetController.ts
- [ ] ReportDatasetGroupController.ts
- [ ] ReportDatasetRelationController.ts
- [ ] ReportDblinkController.ts
- [ ] ReportDictController.ts
- [ ] ReportOperationController.ts
- [ ] ReportPageController.ts
- [ ] ReportPageGroupController.ts
- [ ] ReportPrintController.ts
- [ ] ReportPrintGroupController.ts

**验证方法**: 对每个API控制器，检查其导出方法是否与原始项目一致

---

### Task 10: 构建和生产环境验证
**目标**: 确保项目能正常构建和部署

- [ ] 10.1 开发环境
  - 运行 `npm run dev`
  - 验证无编译错误
  - 验证HMR热更新正常

- [ ] 10.2 生产构建
  - 运行 `npm run build`
  - 验证构建成功
  - 检查dist目录结构

- [ ] 10.3 环境变量
  - 检查 `.env.development`
  - 检查 `.env.production`
  - 验证API代理配置

- [ ] 10.4 Vite配置
  - 检查 `vite.config.ts`
  - 验证alias配置 (@ 指向 src)
  - 验证static文件服务
  - 验证vant组件自动导入

---

## 四、关键风险点和注意事项

### 高风险项
1. **uni API → Taro API 兼容层**: 这是整个迁移的基础，如有问题会导致所有功能异常
2. **onlineFormMixins.ts**: 876行的复杂逻辑，迁移过程中容易遗漏或出错
3. **useFlow.ts**: 流程核心逻辑，替代了flowMixins，需确保所有方法正确实现
4. **表单动态渲染**: 在线表单的核心，组件类型多、逻辑复杂

### 中风险项
5. **组件库替换**: uview → vant，部分组件API可能不一致
6. **Vue 2 → Vue 3**: Options API → Composition API，响应式系统变化
7. **路由系统**: pages.json → Vue Router，页面生命周期不同

### 低风险项
8. **静态资源**: 图片、字体等
9. **样式文件**: CSS/Less可能需要微调
10. **TypeScript类型**: 类型定义可能不完整但不影响运行

---

## 五、验证检查清单

每个模块完成后，执行以下验证:

### 基础验证
- [ ] 页面能正常加载，无白屏
- [ ] 控制台无JavaScript错误
- [ ] 网络请求正常，无404/500错误

### 功能验证
- [ ] 页面交互正常 (点击、输入、选择)
- [ ] 数据正确展示
- [ ] 表单提交成功
- [ ] 页面跳转正常

### 边界验证
- [ ] 空数据处理正确
- [ ] 错误提示友好
- [ ] 加载状态显示正常

---

## 六、执行顺序建议

```
Phase 1: 基础设施 (Task 1)
    ↓
Phase 2: 登录模块 (Task 2)
    ↓
Phase 3: 首页功能 (Task 3)
    ↓
Phase 4: 在线表单 (Task 4) ← 核心
    ↓
Phase 5: 流程审批 (Task 5) ← 核心
    ↓
Phase 6: 报表模块 (Task 6)
    ↓
Phase 7: 公共组件 (Task 7)
    ↓
Phase 8: 页面模块 (Task 8)
    ↓
Phase 9: API验证 (Task 9)
    ↓
Phase 10: 构建验证 (Task 10)
```

**预计总工作量**: 10个阶段，每个阶段1-3小时不等

---

## 七、常用对比命令

```powershell
# 对比两个项目的文件数量
Get-ChildItem -Recurse -File "原始路径" | Measure-Object
Get-ChildItem -Recurse -File "迁移路径" | Measure-Object

# 查看具体文件内容对比
fc "原始文件" "迁移文件"

# 检查编译错误
npm run dev
# 观察控制台输出
```

---

## 八、关键文件路径索引

### 核心文件
- 入口: `src/App.vue`, `src/app.ts`
- 路由: `src/router/index.ts`
- 兼容性层: `src/utils/taroCompat.ts`
- 请求封装: `src/common/request.ts`, `src/common/ajax.ts`

### 在线表单核心
- Mixins: `src/views/online/onlineFormMixins.ts`
- 表单入口: `src/views/online/form.vue`
- 查询表单: `src/views/online/OnlineQueryForm.vue`
- 编辑表单: `src/views/online/OnlineEditForm.vue`
- 工作流表单: `src/views/online/OnlineWorkflowForm.vue`
- 工具函数: `src/views/online/utils.ts`

### 流程审批核心
- Mixins替代: `src/views/workflow/composables/useFlow.ts`
- 任务列表: `src/views/workflow/formRuntimeTask/formMyTask.vue`
- 审批处理: `src/views/workflow/handleFlowTask/index.vue`
- 审批提交: `src/views/workflow/components/taskCommit.vue`
- 审批记录: `src/views/workflow/components/taskCommentList.vue`

### 静态字典
- 流程字典: `src/staticDict/flowStaticDict.ts`
- 在线表单字典: `src/staticDict/onlineStaticDict.ts`
- 报表字典: `src/staticDict/reportStaticDict.ts`
- 基础字典: `src/staticDict/DictionaryBase.ts`
