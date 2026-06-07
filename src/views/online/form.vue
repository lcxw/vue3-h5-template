<script setup lang="ts">
/**
 * 在线表单入口页面（中间层）
 * 负责：1. 从路由参数获取 formId/entryId 等参数
 *       2. 调用 OnlineFormController.render 异步加载表单配置
 *       3. 解析 widgetJson.mobile 构建完整的 formConfig
 *       4. 根据 formType 条件渲染对应的子表单组件
 */
import { showDialog } from 'vant'
import { onActivated, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { OnlineFormController } from '@/api/OnlineFormController/OnlineFormController'
import { SysOnlineFormType } from '@/staticDict/index'
import OnlineEditForm from './OnlineEditForm.vue'
import OnlineOneToOneQueryForm from './OnlineOneToOneQueryForm.vue'
import OnlineQueryForm from './OnlineQueryForm.vue'
import OnlineWorkflowForm from './OnlineWorkflowForm.vue'
import OnlineWorkOrderForm from './OnlineWorkOrderForm.vue'

const router = useRouter()
const route = useRoute()

// 表单ID
const formId = ref<string | undefined>(undefined)
// 入口ID
const entryId = ref<string | undefined>(undefined)
// 表单配置
const formConfig = ref<any>(undefined)
// 是否就绪
const isReady = ref(false)
// 组件刷新 key
const formKey = ref(0)
// 时间戳（用于强制刷新）
const date = ref(Date.now())
// 标签类型（用于控制返回行为）
const barType = ref(0)
// 是否显示流程表单（编辑表单内部切换到流程表单时使用）
const showWorkFlowForm = ref(false)
// 流程信息（流程表单需要）
const flowInfo = ref<any>(undefined)
// 是否只读
const readOnly = ref(false)
// 编辑行数据
const rowData = ref<any>(undefined)
// 是否保存数据
const saveData = ref(true)
// 各子表单组件引用
const queryFormRef = ref<InstanceType<typeof OnlineQueryForm> | null>(null)
const workflowRef = ref<InstanceType<typeof OnlineWorkflowForm> | null>(null)

/**
 * 清理表单配置中的缓存数据
 */
function clearFormConfig() {
  if (formConfig.value) {
    formConfig.value.datasourceMap = null
    formConfig.value.relationMap = null
    formConfig.value.tableMap = null
    formConfig.value.columnMap = null
    formConfig.value.dictMap = null
    formConfig.value.linkageMap = null
  }
  formConfig.value = null
}

/**
 * 异步加载在线表单配置
 * 调用 OnlineFormController.render 获取表单渲染数据，
 * 解析 widgetJson.mobile 构建完整的 formConfig 对象
 */
async function loadOnlineFormConfig() {
  isReady.value = false
  if (!formId.value)
    return
  clearFormConfig()
  try {
    const res = await OnlineFormController.render({ formId: formId.value })
    const onlineForm = res.onlineForm
    let formConfigData = JSON.parse(onlineForm.widgetJson)
    formConfigData = formConfigData.mobile
    if (formConfigData != null) {
      formConfig.value = {
        rawData: res,
        readOnly: readOnly.value,
        formName: onlineForm.formName,
        formType: onlineForm.formType,
        formKind: onlineForm.formKind,
        masterTableId: onlineForm.masterTableId,
        labelWidth: formConfigData.labelWidth,
        labelPosition: formConfigData.labelPosition,
        filterItemWidth: formConfigData.filterItemWidth,
        gutter: formConfigData.gutter,
        height: formConfigData.height,
        width: formConfigData.width,
        widgetList: formConfigData.widgetList,
        operationList: (formConfigData.operationList || []).sort((a: any, b: any) => {
          return (a.showOrder || 0) - (b.showOrder || 0)
        }),
        tableWidget: formConfigData.tableWidget,
        leftWidget: formConfigData.leftWidget,
        customFieldList: formConfigData.customFieldList,
        formEventList: formConfigData.formEventList,
        maskFieldList: formConfigData.maskFieldList,
      }
      isReady.value = true
    }
    else {
      showDialog({
        title: '提示',
        message: '没有找到移动端配置信息！',
      }).then(() => {
        router.back()
      })
    }
  }
  catch (e) {
    console.error('加载表单配置失败', e)
  }
}

/**
 * 子表单切换事件
 */
function changeSub() {
  barType.value = 1 - barType.value
}

/**
 * 切换删除模式
 */
function toggleDelete() {
  if (queryFormRef.value)
    queryFormRef.value.toggleDelete()
}

/**
 * 关闭子页面
 */
function closeSubPage() {
  if (queryFormRef.value)
    queryFormRef.value.closeSubPage()
}

/**
 * 子表单关闭回调
 */
function onClose() {
  router.back()
}

/**
 * 获取流程表单数据（供流程表单使用）
 * @param _isDraft - 是否草稿
 * @param _variableList - 变量列表
 */
function getFormData(_isDraft: boolean, _variableList: any[]) {
  return workflowRef.value
    ? (workflowRef.value as any).getFormData(_isDraft, _variableList)
    : Promise.reject(new Error('流程表单未就绪'))
}

/**
 * 返回上一页
 */
function goBack() {
  if (barType.value === 0) {
    router.back()
  }
  else {
    closeSubPage()
  }
}

// 监听 formId 变化，重新加载配置
watch(formId, () => {
  loadOnlineFormConfig()
  formKey.value++
})

// 页面加载时获取路由参数
onMounted(() => {
  const passData = route.query.passData as string
  if (passData) {
    try {
      const item = JSON.parse(decodeURIComponent(passData))
      formId.value = item.formId
      entryId.value = item.entryId
      // 流程相关参数
      if (item.flowInfo)
        flowInfo.value = item.flowInfo
      if (item.readOnly != null)
        readOnly.value = item.readOnly
      if (item.rowData)
        rowData.value = item.rowData
      if (item.saveData != null)
        saveData.value = item.saveData
      if (item.showWorkFlowForm)
        showWorkFlowForm.value = item.showWorkFlowForm
    }
    catch (e) {
      console.error('解析表单参数失败', e)
    }
  }
})

// 页面激活时刷新时间戳
onActivated(() => {
  date.value = Date.now()
})

// 暴露方法供父组件调用
defineExpose({
  toggleDelete,
  closeSubPage,
  getFormData,
  goBack,
})
</script>

<template>
  <div class="online-form-wrapper">
    <!-- 查询表单 -->
    <OnlineQueryForm
      v-if="isReady && formConfig.formType === SysOnlineFormType.QUERY"
      ref="queryFormRef"
      :key="formKey"
      :form-config="formConfig"
      @change-sub="changeSub"
      @close="onClose"
    />

    <!-- 编辑表单 -->
    <OnlineEditForm
      v-if="isReady && (formConfig.formType === SysOnlineFormType.FORM && !showWorkFlowForm)"
      :key="formKey"
      :edit-form-id="formId"
      :form-config="formConfig"
      :row-data="rowData"
      :save-data="saveData"
      @close="onClose"
    />

    <!-- 流程表单 -->
    <OnlineWorkflowForm
      v-if="isReady && ((formConfig.formType === SysOnlineFormType.FLOW) || showWorkFlowForm)"
      ref="workflowRef"
      :key="formKey"
      :read-only="readOnly"
      :flow-info="flowInfo"
      :form-config="formConfig"
      @close="onClose"
    />

    <!-- 工单表单 -->
    <OnlineWorkOrderForm
      v-if="isReady && formConfig.formType === SysOnlineFormType.WORK_ORDER"
      :key="formKey"
      :read-only="readOnly"
      :entry-id="entryId"
      :form-config="formConfig"
      @close="onClose"
    />

    <!-- 一对一查询表单 -->
    <OnlineOneToOneQueryForm
      v-if="isReady && formConfig.formType === SysOnlineFormType.ONE_TO_ONE_QUERY"
      :key="formKey"
      :form-config="formConfig"
      @close="onClose"
    />

    <!-- 加载中状态 -->
    <div v-if="!isReady" class="loading-wrapper">
      <van-loading type="spinner" size="36px" vertical>
        加载中...
      </van-loading>
    </div>
  </div>
</template>

<style scoped lang="less">
.online-form-wrapper {
  width: 100%;
  height: 100vh;
  background-color: #f6f7f9;
}

.loading-wrapper {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}
</style>
