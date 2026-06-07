# 项目迁移修复执行计划

## Context

项目从 uniapp (Vue 2 + uview-ui) 迁移至 Vite + Vue 3 + Vant H5。迁移后在线表单、流程审批等核心业务功能无法正常使用。本计划记录了详细的差异分析结果和修复待办事项。

## 已完成的分析

- [x] 两个项目目录结构对比
- [x] 核心基础设施（请求封装、工具函数）对比
- [x] 在线表单模块对比
- [x] 流程审批模块对比
- [x] Online 业务组件和字段组件对比
- [x] 静态字典对比（81个字典全部一致）
- [x] API 层对比（36个 Controller 全部一致）

---

## Phase 1: 基础设施修复 [P0]

### Task 1.1: 恢复 JSONbig BigInt 处理
- **问题**: `src/utils/http/index.ts` 中完全移除了 JSON BigInt 处理，后端返回 Long 类型 ID（雪花算法）会导致精度丢失
- **原始实现**: `common/request.js` 第53-64行，使用 `JSONbig({ storeAsString: true })` 解析响应
- **修复方案**: 在 `src/utils/http/index.ts` 的 axios 实例中添加 `transformResponse` 使用已有的 `src/utils/jsonBigint/` 模块
- **状态**: [x] 已修复 (commit 4ef7242)

### Task 1.2: 恢复 showMessage 的 icon 类型支持
- **问题**: `src/utils/index.ts` 中 `showMessage` 函数忽略了 `_type` 参数，原始支持 success/error/none 图标
- **修复方案**: 使用 vant 的 `showSuccessToast`/`showFailToast` 根据类型显示不同图标
- **状态**: [x] 已修复 (commit 4ef7242)

### Task 1.3: 恢复 _skipAuthRedirect 配置支持
- **问题**: `src/utils/http/index.ts` 移除了 `_skipAuthRedirect` 配置，部分页面（setting.vue, my/index.vue）仍在引用
- **修复方案**: 在请求拦截器中检查 `config._skipAuthRedirect`，支持跳过 401 自动重定向
- **状态**: [x] 已修复 (commit 4ef7242)

---

## Phase 2: 在线表单核心修复 [P0]

### Task 2.1: 修复 useOnlineForm 中 batchDelete/deleteRow 的 queryTable 获取方式
- **问题**: `(builtFormConfig.value as any).queryTable?.table` 取不到值，queryTable 是组件 computed 不在 formConfig 中
- **原始实现**: `this.queryTable.table`（通过组件 computed 访问）
- **修复方案**: 将 queryTable 通过参数传入或使用 provide/inject
- **文件**: `src/views/online/useOnlineForm.ts`
- **状态**: [x] 已修复 (commit 87925de)

### Task 2.2: 修复 onCloseSubForm 未调用 operationCallback
- **问题**: OnlineEditForm 和 OnlineWorkflowForm 的 onCloseSubForm 未调用 operationCallback，子表单操作结果无法回传
- **修复方案**: 在 onCloseSubForm 中调用 operationCallback(data)
- **文件**: `src/views/online/OnlineEditForm.vue`, `src/views/online/OnlineWorkflowForm.vue`
- **状态**: [x] 已修复 (commit 87925de)

### Task 2.3: 修复 initWidgetRule 未调用 formRef.setRules
- **问题**: 仅用 `Object.assign(rules, rulesObj)` 赋值，未调用 form ref 的 setRules，表单校验规则可能不生效
- **原始实现**: `this.$refs.form.setRules(this.rules)` + setTimeout(200ms)
- **修复方案**: 在 initWidgetRule 中获取 form ref 并调用 setRules
- **文件**: `src/views/online/useOnlineForm.ts`
- **状态**: [x] 已修复 (commit 87925de)

### Task 2.4: 补全 buildEventContext 缺失的方法
- **问题**: `buildEventContext` 未提供 `doUrl`、`router` 等，自定义事件脚本可能报错
- **原始实现**: 事件函数通过 `.bind(this)` 可访问完整 Vue 实例（含 doUrl、$refs、$router 等）
- **修复方案**: 在 buildEventContext 中补充 doUrl、router 等方法
- **文件**: `src/views/online/useOnlineForm.ts`
- **状态**: [x] 已修复 (commit 87925de)

### Task 2.5: 修复 OnlineCustomBlock 栅格布局
- **问题**: 原始使用 `u-row`/`u-col` 栅格系统支持 `span` 列宽，迁移后改为简单 div 布局，所有组件全宽显示
- **修复方案**: 使用 vant 的 `van-row`/`van-col` 或 CSS Grid 实现栅格布局
- **文件**: `src/views/components/Online/OnlineCustomBlock.vue`
- **状态**: [x] 已修复 (commit 87925de)

### Task 2.6: 补全 OnlineCustomWidget 缺失的约15种组件类型渲染分支
- **缺失组件类型**:
  - `Tabs` → 需要 OnlineCustomTabs
  - `DataSelect` → 需要 OnlineRelationSelect
  - `UserSelect` → 需要 UserSelect 集成
  - `DeptSelect` → 需要 DeptSelect 集成
  - `Signature` → 需要 SignaturePad 集成
  - `BARCODE` → 已有 FieldBarCode，需接入
  - `QRCODE` → 已有 FieldQRcode，需接入
  - `Video` → 已有 FieldVideo，需接入
  - `MAP` → 暂不需要（H5 不需要小程序地图）
  - `MobileRadioFilter` / `MobileCheckBoxFilter` → 需要 SelectFilter
  - `MobileInputFilter` → 需要 SearchFilter
  - `MobileSwitchFilter` → 需要 SwitchFilter
  - `MobileNumberRangeFilter` → 需要 NumberRangeFilter
  - `MobileDateRangeFilter` → 需要 DateRangeFilter
  - 图表类型 (isChart) → 需要 OnlineCustomChart
- **修复方案**: 在 OnlineCustomWidget 模板中逐个添加条件分支，引用已有或新建的组件
- **文件**: `src/views/components/Online/OnlineCustomWidget.vue`
- **状态**: [x] 已修复 (commit 87925de)

### Task 2.7: 新建 OnlineCustomFilterBox 筛选组件
- **问题**: 列表页筛选功能完全缺失
- **原始功能**: 支持排序和筛选，底部弹出式筛选面板，含"重置"和"确定"按钮，emit refresh/reset 事件
- **修复方案**: 基于 vant 的 `van-popup` + `van-cell` 新建筛选组件
- **文件**: 新建 `src/views/components/Online/OnlineCustomFilterBox.vue`
- **状态**: [x] 已修复 (commit 87925de)

### Task 2.8: 新建 OnlineCustomTabs 标签页组件
- **问题**: 标签页分组渲染功能缺失
- **原始功能**: 使用 `u-tabs` 渲染多标签切换，每个 tab 下渲染 OnlineCustomBlock
- **修复方案**: 使用 vant 的 `van-tabs` + `van-tab` 实现
- **文件**: 新建 `src/views/components/Online/OnlineCustomTabs.vue`
- **状态**: [x] 已修复 (commit 87925de)

### Task 2.9: 新建 OnlineRelationSelect 关联选择组件
- **问题**: 关联表选择功能完全缺失
- **原始功能**: 弹出 OnlineForm 进行关联数据选择，支持单选/多选，自动加载关联数据并显示
- **修复方案**: 基于 `van-popup` + `OnlineQueryForm` 新建组件
- **文件**: 新建 `src/views/components/Online/OnlineRelationSelect.vue`
- **状态**: [x] 已修复 (commit 87925de)

### Task 2.10: 新建 OnlineCustomChart 图表组件
- **问题**: 在线表单中的图表功能缺失
- **原始功能**: 支持11种图表类型，集成 ReportDatasetController 数据加载
- **修复方案**: 基于已有的 `src/views/components/Charts/` 组件封装
- **文件**: 新建 `src/views/components/Online/OnlineCustomChart.vue`
- **状态**: [x] 已修复 (commit 87925de)

### Task 2.11: 新建 OnlineImageCard 图片卡片组件
- **问题**: 关联选择卡片展示简化
- **原始功能**: 支持左右图片布局、字典值显示、选择功能（checkbox），内嵌 OnlineCustomImage 和 OnlineCustomBlock
- **修复方案**: 基于 vant 的 `van-card` + `van-checkbox` 新建
- **文件**: 新建 `src/views/components/Online/OnlineImageCard.vue`
- **状态**: [x] 已修复 (commit 87925de)

### Task 2.12: 修复 OnlineCustomList 增删改操作
- **问题**: `onAddClick`/`onEditClick`/`onDeleteClick` 仅有 console.log，实际业务逻辑未实现
- **缺失内容**: `form().handlerOperation` 调用、级联数据处理 (`__cascade_add_id__`)、权限校验 (`checkOperationVisible`)、删除确认弹窗、数据变更回调 (`AFTER_LOAD_TABLE_DATA`)
- **修复方案**: 完整实现增删改操作逻辑
- **文件**: `src/views/components/Online/OnlineCustomList.vue`
- **状态**: [x] 已修复 (commit 87925de)

### Task 2.13: 修复 OnlineQueryForm 流程详情跳转
- **问题**: `onFlowDetails` 方法为 TODO 注释
- **修复方案**: 实现 flowDetails 跳转到流程详情页
- **文件**: `src/views/online/OnlineQueryForm.vue`
- **状态**: [x] 已修复 (commit 87925de)

### Task 2.14: 修复 OnlineCustomWidget 字典加载丢失报表字典模式
- **问题**: 仅保留在线表单字典模式，报表字典模式丢失
- **原始实现**: 区分报表字典和在线表单字典两种模式
- **修复方案**: 恢复报表字典加载逻辑
- **文件**: `src/views/components/Online/OnlineCustomWidget.vue`
- **状态**: [x] 已修复 (commit 87925de)

### Task 2.15: 恢复字段组件的 validateWidget 方法
- **问题**: 所有字段组件（Field*.vue）的 `validateWidget` 方法被移除
- **修复方案**: 在各字段组件中恢复 validateWidget 方法
- **文件**: `src/views/components/Field*.vue`（所有字段组件）
- **状态**: [x] 已修复 (commit 87925de)

### Task 2.16: 修复 OnlineCustomWidget 缺少 parentWidget 注入
- **问题**: 原始项目通过 inject `parentWidget` 实现父子组件通信，迁移后移除
- **修复方案**: 恢复 parentWidget 的 provide/inject
- **文件**: `src/views/components/Online/OnlineCustomWidget.vue`
- **状态**: [x] 已修复 (commit 87925de)

---

## Phase 3: 流程审批模块修复 [P0]

### Task 3.1: 修复 editCopyForItem 用户列表未实现
- **问题**: `filteredUserList` computed 直接返回空数组 `[]`，无法选择抄送用户
- **原始实现**: 通过 `CustomSelectPanel` 组件配合 `loadSysUserData` 方法实现分页加载
- **修复方案**: 实现用户数据加载和列表展示
- **文件**: `src/views/workflow/components/copyForSelect/editCopyForItem.vue`
- **状态**: [x] 已修复 (commit 6ed44bd)

### Task 3.2: 修复 editCopyForItem 部门级联选择降级
- **问题**: 原始使用 `CustomCascaderPanel` 实现部门树级联选择，迁移后降级为扁平列表
- **修复方案**: 利用已有的 `CustomCascaderPanel` 组件实现部门树级联选择
- **文件**: `src/views/workflow/components/copyForSelect/editCopyForItem.vue`
- **状态**: [x] 已修复 (commit 6ed44bd)

### Task 3.3: 修复 editCopyForItem 部门岗位(deptPost)选择缺失
- **问题**: deptPost 类型的级联选择完全缺失
- **原始实现**: 有 `deptPostTree` computed 构建部门-岗位级联树
- **修复方案**: 实现 deptPostTree 计算和级联选择 UI
- **文件**: `src/views/workflow/components/copyForSelect/editCopyForItem.vue`
- **状态**: [x] 已修复 (commit 6ed44bd)

### Task 3.4: 修复 editCopyForItem 搜索功能为空实现
- **问题**: `onSearch` 方法为空
- **修复方案**: 实现搜索时重载数据逻辑
- **文件**: `src/views/workflow/components/copyForSelect/editCopyForItem.vue`
- **状态**: [x] 已修复 (commit 6ed44bd)

### Task 3.5: 修复 taskCommit SET_ASSIGNEE 初始化缺失
- **问题**: SET_ASSIGNEE 操作时 `otherFilterObject` 初始化逻辑完全缺失
- **原始实现**: mounted 中处理 multiSignAssignee 的 assigneeType 和 assigneeList
- **修复方案**: 在 onMounted 中恢复 SET_ASSIGNEE 的初始化逻辑
- **文件**: `src/views/workflow/components/taskCommit.vue`
- **状态**: [x] 已修复 (commit 6ed44bd)

### Task 3.6: 修复 taskCommit multiSelect 计算属性缺失
- **问题**: 用户选择组件没有传递 `multiple` 相关参数
- **原始实现**: 有 `multiSelect` 计算属性判断是否多选
- **修复方案**: 恢复 multiSelect 计算属性并传递给 UserSelect 组件
- **文件**: `src/views/workflow/components/taskCommit.vue`
- **状态**: [x] 已修复 (commit 6ed44bd)

### Task 3.7: 修复 handleFlowTask getButtonType 缺失类型映射
- **问题**: 缺少 `PARALLEL_REFUSE`（并行拒绝）和 `MULTI_REFUSE`（多实例拒绝）类型映射
- **修复方案**: 在 getButtonType 中补充这两种类型的映射
- **文件**: `src/views/workflow/handleFlowTask/index.vue`
- **状态**: [x] 已修复 (commit 6ed44bd)

### Task 3.8: 修复 handleFlowTask getMasterData 未传递 variableList
- **问题**: `getMasterData` 未传递 `variableList` 参数给表单组件
- **修复方案**: 从 taskDetailsData 中获取 variableList 并传递
- **文件**: `src/views/workflow/handleFlowTask/index.vue`
- **状态**: [x] 已修复 (commit 6ed44bd)

### Task 3.9: 修复 copyForSelect 删除行为不一致
- **问题**: 原始删除类型时设为 `undefined`，迁移后设为空数组 `[]`，导致空的分组行被显示
- **修复方案**: 改为设为 undefined 或在 computed 中过滤空数组
- **文件**: `src/views/workflow/components/copyForSelect/index.vue`
- **状态**: [x] 已修复 (commit 6ed44bd)

---

## Phase 4: 公共组件补全 [P1]

### Task 4.1: 补全 CustomCascaderPanelPopup 组件
- **问题**: 原始项目有 `CustomCascaderPanelPopup`（级联面板弹窗），迁移后缺失
- **修复方案**: 基于 `CustomCascaderPanel` + `van-popup` 新建
- **文件**: 新建 `src/views/components/CustomCascaderPanelPopup/index.vue`
- **状态**: [x] 已修复 (commit c6590dc)

### Task 4.2: 补全图表组件体系
- **问题**: 原始项目有两套图表（Charts 旧版 + Charts3.0 基于 ECharts），迁移后 Charts 目录下有部分组件但可能不完整
- **修复方案**: 检查并补全缺失的图表组件（dataCard, dataProgressCard, progressBar, progressCircle, carouselChart 等）
- **文件**: `src/views/components/Charts/`
- **状态**: [x] 已修复 (commit c6590dc)

---

## Phase 5: 表单组件细节修复 [P2]

### Task 5.1: 修复 OnlineWorkOrderForm 直接 URL 调用绕过 Controller
- **问题**: 使用 `doUrl('/admin/flow/...')` 直接调用，绕过了 Controller 封装
- **修复方案**: 改用 FlowOperationController 和 FlowEntryController 的方法
- **文件**: `src/views/online/OnlineWorkOrderForm.vue`
- **状态**: [x] 已修复 (commit c6590dc)

### Task 5.2: 修复 OnlineOneToOneQueryForm sortList 未做字段映射
- **问题**: `sortList` computed 直接返回 `orderList`，未做 fieldName 字段映射
- **修复方案**: 添加字段映射逻辑
- **文件**: `src/views/online/OnlineOneToOneQueryForm.vue`
- **状态**: [x] 已修复 (commit c6590dc)

### Task 5.3: 修复 form.vue 缺少 toggleDelete 方法
- **问题**: 入口页删除模式切换功能缺失
- **修复方案**: 添加 toggleDelete 方法
- **文件**: `src/views/online/form.vue`
- **状态**: [x] 已修复 (commit c6590dc)

### Task 5.4: 修复 OnlineFieldLabel 不支持富文本
- **问题**: 原始使用 `u-parse`（HTML 富文本解析），迁移后仅使用 `van-field`（纯文本）
- **修复方案**: 对包含 HTML 的内容使用 `v-html` 渲染
- **文件**: `src/views/components/Online/OnlineFieldLabel.vue`
- **状态**: [x] 已修复 (commit c6590dc)

---

## 已验证无问题的模块

- [x] API 层: 36个 Controller 完全一致，无遗漏
- [x] 静态字典: 81个字典全部迁移，值内容一致
- [x] Token 管理逻辑: 完整迁移
- [x] 审批记录展示 (taskCommentList): 功能完整等价
- [x] 任务卡片 (taskCard): 功能完整等价
- [x] 已办任务/历史任务列表: 基本完整
- [x] 核心工具函数: 全部迁移

---

## 修复进度统计

| Phase | 总任务数 | 已完成 | 进度 |
|-------|---------|--------|------|
| Phase 1: 基础设施 | 3 | 3 | 100% |
| Phase 2: 在线表单 | 16 | 16 | 100% |
| Phase 3: 流程审批 | 9 | 9 | 100% |
| Phase 4: 公共组件 | 2 | 2 | 100% |
| Phase 5: 细节修复 | 4 | 4 | 100% |
| **合计** | **34** | **34** | **100%** |
