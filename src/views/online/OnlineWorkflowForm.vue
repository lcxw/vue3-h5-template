<script setup lang="ts">
import { showToast } from 'vant'
/**
 * 在线流程表单
 * 用于流程审批场景，支持草稿、待办、已办等状态
 */
import { computed, provide, ref, watch } from 'vue'
import { FlowOperationController } from '@/api/FlowController/FlowOperationController'
import { OnlineFormEventType, SysOnlineRelationType } from '@/staticDict/index'
import OnlineCustomBlock from '@/views/components/Online/OnlineCustomBlock.vue'
import OnlineEditForm from './OnlineEditForm.vue'
import { useOnlineForm } from './useOnlineForm'

const props = defineProps<{
  formConfig: any
  flowInfo?: any
  readOnly?: boolean
}>()

// 表单配置
const formConfigRef = ref(props.formConfig)
// 是否只读
const readOnly = ref(props.readOnly || false)
// 流程信息
const flowInfo = ref(props.flowInfo)

// 使用在线表单组合式函数
const {
  isReady,
  form,
  masterTable,
  formData,
  rules,
  formAuth,
  initPage,
  initFormWidgetList,
  initWidgetRule,
  initWidgetLinkage,
  getWidgetValue,
  onValueChange,
  getWidgetVisible,
  onWidgetValueChange,
  richEditWidgetList,
  tableWidgetList,
  showSubPage,
  subFormId,
  editRowData,
  provideFormContext,
} = useOnlineForm(formConfigRef, { readOnly, flowInfo })

// 表单引用
const formRef = ref<any>(null)
// 时间戳（用于强制刷新）
const keyUUID = ref(Date.now())
// 任务是否只读
const taskReadOnly = ref(true)
// 是否为启动流程
const isStart = ref(false)

/**
 * 是否为运行时流程
 */
const isRuntime = computed(() => {
  return flowInfo.value ? (flowInfo.value.isRuntime === true || flowInfo.value.isRuntime === 'true') : false
})

/**
 * 是否为草稿
 */
const isDraft = computed(() => {
  return flowInfo.value ? (flowInfo.value.isDraft || flowInfo.value.isDraft === 'true') : false
})

/**
 * 获取可见的组件列表
 */
const visibleWidgetList = computed(() => {
  return (form.value.widgetList || []).filter(widget => getWidgetVisible(widget))
})

/**
 * 判断组件是否禁用
 * @param widget - 组件信息
 */
function isWidgetDisabled(widget: any): boolean {
  // 检查权限配置
  const formWidgetAuth = formAuth.value?.mobile?.[widget.variableName]
  if (formWidgetAuth?.disabled)
    return true
  // 检查事件脚本
  if (widget.eventInfo && typeof widget.eventInfo.disable === 'function') {
    return widget.eventInfo.disable()
  }
  return readOnly.value || taskReadOnly.value
}

/**
 * 关闭子表单回调
 * @param refresh - 是否需要刷新
 * @param data - 返回的数据
 */
function onCloseSubForm(refresh: boolean, data?: any) {
  showSubPage.value = false
}

/**
 * 获取表格数据
 * @param widget - 组件信息
 */
function getTableData(widget: any): any[] {
  return widget.relation ? formData[widget.relation.variableName] : []
}

/**
 * 设置表格数据
 * @param widget - 组件信息
 * @param dataList - 数据列表
 */
function setTableData(widget: any, dataList: any[]) {
  if (widget == null)
    return
  if (widget.relation) {
    formData[widget.relation.variableName] = dataList
  }
}

/**
 * 初始化表单数据
 */
function initFormData(): Promise<void> {
  if (flowInfo.value == null || flowInfo.value.processInstanceId == null) {
    return Promise.resolve()
  }
  return new Promise((resolve, reject) => {
    const params = {
      processInstanceId: flowInfo.value.processInstanceId,
      taskId: flowInfo.value.taskId,
    }
    // 判断是展示历史流程的数据还是待办流程的数据
    let httpCall: Promise<any>
    if (isDraft.value) {
      // 草稿数据
      httpCall = FlowOperationController.viewOnlineDraftData({
        processDefinitionKey: flowInfo.value.processDefinitionKey,
        processInstanceId: flowInfo.value.processInstanceId,
      })
    }
    else if (flowInfo.value.messageId != null) {
      // 抄送消息
      httpCall = FlowOperationController.viewOnlineCopyBusinessData({
        messageId: flowInfo.value.messageId,
      })
    }
    else {
      // 待办或已办流程
      httpCall = (flowInfo.value.taskId != null && isRuntime.value)
        ? FlowOperationController.viewUserTask(params)
        : FlowOperationController.viewHistoricProcessInstance(params)
    }
    httpCall.then((res) => {
      isStart.value = (res == null)
      // 流程数据
      const masterData = (res || {})[masterTable.value?.datasource?.variableName || ''] || {}
      // 初始化表单字段
      const relationNameList = new Map<string, any>()
      let datasourceName: string | undefined
      form.value.tableMap?.forEach((table: any) => {
        if (table.relation) {
          if (table.relation.relationType === 0 || isDraft.value) {
            relationNameList.set(table.relation.variableName, table.relation)
          }
          else {
            relationNameList.set(`${table.relation.variableName}List`, table.relation)
          }
        }
        else if (table.relation == null) {
          datasourceName = table.datasource.variableName
        }
      })
      Object.keys(masterData).forEach((key) => {
        const relation = relationNameList.get(key)
        const relationVariableName = (relation || {}).variableName
        if (relationVariableName == null) {
          // 主表字段
          if (datasourceName) {
            formData[datasourceName][key] = masterData[key]
          }
        }
        else {
          // 从表字段
          if (relation.relationType === 1 && masterData[key]) {
            // 如果是一对多关联字段，判断表单上使用这个字段的table组件是否支持数据加载数据后脚本
            if (Array.isArray(tableWidgetList.value)) {
              tableWidgetList.value.forEach((tableWidget) => {
                if (tableWidget.relation && tableWidget.relation.relationId === relation.relationId) {
                  if (tableWidget.eventInfo && typeof tableWidget.eventInfo.afterLoadTableData === 'function') {
                    masterData[key] = tableWidget.eventInfo.afterLoadTableData(masterData[key])
                  }
                }
              })
            }
          }
          if (masterData[key]) {
            formData[relationVariableName] = masterData[key]
          }
        }
      })
      resolve()
    }).catch((e) => {
      reject(e)
    })
  })
}

/**
 * 获取表单数据实现
 * @param variableList - 变量列表
 */
async function getFormDataImpl(variableList?: any[]): Promise<any> {
  let tempObj: any = {}
  // 获取表单数据
  form.value.tableMap?.forEach((table: any) => {
    if (table.relation) {
      if (tempObj.slaveData == null)
        tempObj.slaveData = {}
      tempObj.slaveData[table.relation.variableName] = formData[table.relation.variableName]
    }
    else if (table.relation == null) {
      tempObj.masterData = formData[table.datasource.variableName]
    }
  })
  // 获取流程变量
  if (Array.isArray(variableList)) {
    variableList.forEach((variable) => {
      if (!variable.builtin) {
        const column = form.value.columnMap?.get(variable.bindColumnId)
        const relation = form.value.relationMap?.get(variable.bindRelationId)
        if (column != null) {
          if (tempObj.taskVariableData == null)
            tempObj.taskVariableData = {}
          if (relation == null) {
            tempObj.taskVariableData[variable.variableName] = formData[masterTable.value?.datasource?.variableName || ''][column.columnName] || ''
          }
          else {
            tempObj.taskVariableData[variable.variableName] = formData[relation.variableName][column.columnName] || ''
          }
        }
      }
    })
  }

  // 执行提交数据前脚本
  if (form.value.eventInfo && typeof form.value.eventInfo[OnlineFormEventType.BEFORE_COMMIT_FORM_DATA] === 'function') {
    tempObj = await form.value.eventInfo[OnlineFormEventType.BEFORE_COMMIT_FORM_DATA](tempObj)
  }
  if (tempObj == null)
    throw new Error('提交数据前脚本返回数据为空')
  // 把slaveData里的relationVariableName替换成relationId
  if (tempObj.slaveData) {
    const slaveDataKeyList = Object.keys(tempObj.slaveData)
    if (slaveDataKeyList.length > 0) {
      const relationVariableNameMap = new Map<string, string>()
      form.value.tableMap?.forEach((table: any) => {
        if (table.relation != null) {
          relationVariableNameMap.set(table.relation.variableName, table.relation.relationId)
        }
      })
      slaveDataKeyList.forEach((key) => {
        const relationId = relationVariableNameMap.get(key)
        if (relationId != null) {
          tempObj.slaveData[relationId] = tempObj.slaveData[key]
        }
        tempObj.slaveData[key] = undefined
      })
    }
  }

  return tempObj
}

/**
 * 获取表单数据
 * @param isDraft - 是否为草稿
 * @param variableList - 变量列表
 */
function getFormData(isDraft: boolean, variableList?: any[]): Promise<any> {
  // 获取富文本内容
  if (Array.isArray(richEditWidgetList.value)) {
    richEditWidgetList.value.forEach((richWidget) => {
      if (richWidget && richWidget.widgetImpl) {
        onValueChange(richWidget, richWidget.widgetImpl.getHtml())
      }
    })
  }

  return new Promise((resolve, reject) => {
    if (isDraft) {
      getFormDataImpl(variableList).then((res) => {
        resolve(res)
      }).catch((e) => {
        reject(e)
      })
    }
    else {
      formRef.value?.validate().then(async () => {
        const res = await getFormDataImpl(variableList)
        resolve(res)
      }).catch(() => {
        reject(new Error('表单验证失败'))
      })
    }
  })
}

/**
 * 查看任务表单Key
 */
function viewTaskFormKey(): Promise<void> {
  if (flowInfo.value == null || flowInfo.value.processDefinitionKey == null || flowInfo.value.processDefinitionKey === '') {
    return Promise.resolve()
  }
  const params = {
    processDefinitionKey: flowInfo.value.processDefinitionKey,
    processInstanceId: flowInfo.value.processInstanceId,
    taskId: flowInfo.value.taskId,
  }
  return new Promise((resolve, reject) => {
    FlowOperationController.viewTaskFormKey(params).then((res) => {
      try {
        // HTTP 拦截器已经解析了 res.data，返回的可能是对象或字符串
        const temp = typeof res === 'string' ? JSON.parse(res) : res
        taskReadOnly.value = temp.readOnly == null ? true : temp.readOnly
        formAuth.value = temp.formAuth
        // 解析权限配置
        if (formAuth.value && formAuth.value.mobile) {
          Object.keys(formAuth.value.mobile).forEach((key) => {
            const formAuthItem = formAuth.value!.mobile![key]
            Object.keys(formAuthItem).forEach((subKey) => {
              let authItem = formAuthItem[subKey]
              if (authItem && authItem != null && authItem !== '') {
                formAuthItem[subKey] = authItem.split(',').map((item: string) => Number.parseInt(item))
              }
              else {
                formAuthItem[subKey] = [0, 0]
              }
              const disabled = formAuthItem[subKey][0] === 1
              const hide = formAuthItem[subKey][1] === 1
              formAuthItem[subKey].disabled = disabled
              formAuthItem[subKey].hide = hide
            })
          })
        }
      }
      catch (e) {
        console.log(e)
        formAuth.value = undefined
      }
      resolve()
    }).catch((e) => {
      reject(e)
    })
  })
}

// 提供表单上下文
provideFormContext()

// 监听表单配置变化
watch(() => props.formConfig, (newConfig) => {
  if (newConfig) {
    formConfigRef.value = newConfig
    isReady.value = false
    viewTaskFormKey().then(() => {
      initPage()
      initFormWidgetList()
      initWidgetRule()
      if (form.value.eventInfo && typeof form.value.eventInfo[OnlineFormEventType.AFTER_CREATE_FORM] === 'function') {
        form.value.eventInfo[OnlineFormEventType.AFTER_CREATE_FORM]()
      }
      return initFormData()
    }).then(() => {
      if (form.value.eventInfo && typeof form.value.eventInfo[OnlineFormEventType.AFTER_LOAD_FORM_DATA] === 'function') {
        form.value.eventInfo[OnlineFormEventType.AFTER_LOAD_FORM_DATA]()
      }
      initWidgetLinkage()
      isReady.value = true
      keyUUID.value = Date.now()
    }).catch((e) => {
      console.error(e)
    })
  }
}, { immediate: true })

// 暴露方法供父组件调用
defineExpose({
  getFormData,
})
</script>

<template>
  <div class="online-work-flow-form">
    <!-- 表单内容 -->
    <van-form
      :key="keyUUID"
      ref="formRef"
      :model="formData"
    >
      <OnlineCustomBlock v-if="isReady" :widget-list="form.widgetList" />
    </van-form>

    <!-- 子表单弹窗 -->
    <van-popup
      v-if="showSubPage"
      :show="showSubPage"
      position="left"
      :style="{ width: '100%', height: '100%', background: '#F6F6F6' }"
    >
      <OnlineEditForm
        :form-id="subFormId"
        :row-data="editRowData"
        :save-data="false"
        @close="onCloseSubForm"
      />
    </van-popup>
  </div>
</template>

<style scoped lang="less">
.online-work-flow-form {
  position: relative;
  height: 100%;
  background-color: #f6f7f9;
  padding: 16px;
}
</style>
