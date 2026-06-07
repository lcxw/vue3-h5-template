<script setup lang="ts">
import { showToast } from 'vant'
/**
 * 在线编辑表单
 * 用于新增、编辑数据，支持保存、提交、启动流程等操作
 */
import { computed, nextTick, onMounted, provide, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { OnlineFormEventType, SysOnlineColumnFilterType, SysOnlineFieldKind, SysOnlineRelationType } from '@/staticDict/index'
import { useOnlineForm } from './useOnlineForm'

const props = defineProps<{
  formId?: string
  editFormId?: string
  formConfig?: any
  masterTableData?: any
  rowData?: any
  saveData?: boolean
  isCopy?: boolean
}>()

const emit = defineEmits<{
  (e: 'close', refresh: boolean, data?: any): void
}>()

const router = useRouter()

// 表单配置
const formConfigRef = ref(props.formConfig || null)
// 是否只读
const readOnly = ref(false)
// 是否编辑模式
const isEdit = ref(false)
// 主表数据
const masterTableData = ref(props.masterTableData)

// 使用在线表单组合式函数
const {
  isReady,
  form,
  masterTable,
  isRelation,
  formReadOnly,
  formData,
  rules,
  initPage,
  initFormWidgetList,
  initWidgetRule,
  initWidgetLinkage,
  rebuildFormConfig,
  getWidgetValue,
  onValueChange,
  getWidgetVisible,
  onWidgetValueChange,
  getIgnoreMaskFields,
  showSubPage,
  subFormId,
  editRowData,
  provideFormContext,
  richEditWidgetList,
  tableWidgetList,
  doUrl,
} = useOnlineForm(formConfigRef, { readOnly, isEdit, masterTableData })

// 表单引用
const formRef = ref<any>(null)
// 时间戳（用于强制刷新）
const date = ref(Date.now())
// 流程定义Key
const processDefinitionKey = ref<string | undefined>(undefined)
// 主表主键字段名
const masterTablePrimaryKey = ref<string | undefined>(undefined)
// 主表主键值
const masterTablePrimaryValue = ref<any>(undefined)

/**
 * 获取可见的组件列表
 */
const visibleWidgetList = computed(() => {
  return (form.value.widgetList || []).filter(widget => getWidgetVisible(widget))
})

/**
 * 返回上一页
 * @param refresh - 是否需要刷新
 * @param data - 返回的数据
 */
function onBack(refresh: boolean = false, data?: any) {
  emit('close', refresh, data)
}

/**
 * 根据表单ID获取流程定义Key
 * @param formId - 表单ID
 */
function getPDKByFormId(formId: string) {
  doUrl('/admin/online/onlineApi/runScript/getPDKByFormId', 'post', {
    scriptCode: 'getPDKByFormId',
    scriptParam: {
      formId,
    },
  }).then((res) => {
    if (res && res.length > 0) {
      processDefinitionKey.value = res[0].PROCESS_DEFINITION_KEY
    }
  }).catch((e) => {
    console.error(e)
  })
}

/**
 * 保存表单数据（Promise版本）
 */
function onSaveFormDataPromise(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (masterTable.value == null || masterTable.value.datasource == null) {
      showToast({
        message: '表单使用主数据源或主表不存在！',
      })
      reject(new Error('表单使用主数据源或主表不存在'))
      return
    }
    const params: any = {
      datasourceId: masterTable.value.datasource.datasourceId,
      relationId: (masterTable.value.relation || {}).relationId,
      masterData: isRelation.value
        ? undefined
        : formData[masterTable.value.datasource.variableName],
    }
    if (isRelation.value) {
      // 从表数据添加或更新
      params.slaveData = {
        ...formData[masterTable.value.relation.variableName],
      }
      // 设置关联字段的值
      const slaveColumnValue = (masterTableData.value || {})[masterTable.value.relation.masterColumn.columnName]
      if (slaveColumnValue != null) {
        params.slaveData[masterTable.value.relation.slaveColumn.columnName] = slaveColumnValue
      }
    }
    else {
      // 设置一对多从表数据
      params.slaveData = tableWidgetList.value.reduce((retObj: Record<string, any>, widget: any) => {
        if (widget.relation != null) {
          retObj[widget.relation.variableName] = formData[widget.relation.variableName]
        }
        return retObj
      }, {})
    }

    // 把slaveData里的relationVariableName替换成relationId
    if (!isRelation.value && params.slaveData) {
      const slaveDataKeyList = Object.keys(params.slaveData)
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
            params.slaveData[relationId] = params.slaveData[key]
          }
          params.slaveData[key] = undefined
        })
      }
    }

    let commitUrl: string
    if (isRelation.value) {
      // 从表提交数据
      commitUrl = props.rowData == null || props.isCopy
        ? '/admin/online/onlineOperation/addOneToManyRelation/'
        : '/admin/online/onlineOperation/updateOneToManyRelation/'
    }
    else {
      // 主表提交数据
      commitUrl = props.rowData == null || props.isCopy
        ? '/admin/online/onlineOperation/addDatasource/'
        : '/admin/online/onlineOperation/updateDatasource/'
    }
    commitUrl += masterTable.value.datasource.variableName
    doUrl(commitUrl, 'post', params).then((res) => {
      resolve(res)
    }).catch((e) => {
      reject(e)
    })
  })
}

/**
 * 保存表单数据
 */
function onSaveFormData() {
  onSaveFormDataPromise().then((res) => {
    if (res) {
      masterTablePrimaryValue.value = res
      showToast({
        message: '保存成功！',
      })
      onBack(true)
    }
  }).catch((e) => {
    console.error(e)
  })
}

/**
 * 提交表单（带验证）
 */
async function onSubmit() {
  // 获取富文本内容
  if (Array.isArray(richEditWidgetList.value)) {
    richEditWidgetList.value.forEach((richWidget) => {
      if (richWidget && richWidget.widgetImpl) {
        onValueChange(richWidget, richWidget.widgetImpl.getHtml())
      }
    })
  }

  try {
    // 验证表单
    await formRef.value?.validate()
    if (props.saveData !== false) {
      // 非级联保存数据
      onSaveFormData()
    }
    else {
      // 级联添加返回表单数据到父表单
      let data: any = null
      if (isRelation.value) {
        data = formData[masterTable.value.relation.variableName]
      }
      if (form.value.eventInfo && typeof form.value.eventInfo[OnlineFormEventType.BEFORE_COMMIT_FORM_DATA] === 'function') {
        data = await form.value.eventInfo[OnlineFormEventType.BEFORE_COMMIT_FORM_DATA](data)
      }
      onBack(true, data)
    }
  }
  catch (e) {
    console.error('表单验证失败', e)
  }
}

/**
 * 暂存表单（不验证）
 */
async function onSave() {
  // 获取富文本内容
  if (Array.isArray(richEditWidgetList.value)) {
    richEditWidgetList.value.forEach((richWidget) => {
      if (richWidget && richWidget.widgetImpl) {
        onValueChange(richWidget, richWidget.widgetImpl.getHtml())
      }
    })
  }

  if (props.saveData !== false) {
    // 非级联保存数据
    onSaveFormData()
  }
  else {
    // 级联添加返回表单数据到父表单
    let data: any = null
    if (isRelation.value) {
      data = formData[masterTable.value.relation.variableName]
    }
    if (form.value.eventInfo && typeof form.value.eventInfo[OnlineFormEventType.BEFORE_COMMIT_FORM_DATA] === 'function') {
      data = form.value.eventInfo[OnlineFormEventType.BEFORE_COMMIT_FORM_DATA](data)
    }
    onBack(true, data)
  }
}

/**
 * 启动流程
 */
async function onStartFlow() {
  try {
    // 验证表单
    await formRef.value?.validate()
    if (!masterTablePrimaryValue.value) {
      onSaveFormDataPromise().then((res) => {
        masterTablePrimaryValue.value = res
        onStartFlowImpl(processDefinitionKey.value || '', [], masterTablePrimaryValue.value).then(() => {
          showToast({
            message: '流程启动成功',
          })
          onBack(true)
        })
      }).catch((e) => {
        console.error(e)
      })
    }
    else {
      onStartFlowImpl(processDefinitionKey.value || '', [], masterTablePrimaryValue.value).then(() => {
        showToast({
          message: '流程启动成功',
        })
        onBack(true)
      })
    }
  }
  catch (e) {
    console.error('表单验证失败', e)
  }
}

/**
 * 启动流程实现
 * @param processDefinitionKey - 流程定义Key
 * @param taskVariableList - 任务变量列表
 * @param primaryValue - 主键值
 */
function onStartFlowImpl(processDefinitionKey: string, taskVariableList: any[], primaryValue: any): Promise<void> {
  const params = {
    id: primaryValue,
    processDefinitionKey,
    taskVariableData: {},
  }
  // 任务变量
  params.taskVariableData = (taskVariableList || []).reduce((retObj: Record<string, any>, item: any) => {
    if (item.variableType === 0) {
      // 固定值
      retObj[item.variableName] = item.variableValue
    }
    else if (item.variableType === 1) {
      // 字段值
      retObj[item.variableName] = primaryValue[item.variableValue]
    }
    return retObj
  }, {})
  return doUrl('/admin/flow/flowOnlineOperation/startWithBusinessKey', 'post', params)
}

/**
 * 关闭子表单回调
 * @param refresh - 是否需要刷新
 * @param data - 返回的数据
 */
function onCloseSubForm(refresh: boolean, data?: any) {
  showSubPage.value = false
  if (refresh) {
    date.value = Date.now()
  }
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
 * 加载关联表数据
 * @param widget - 组件信息
 */
async function loadRelationTableData(widget: any) {
  try {
    if (widget == null || widget.datasource == null || widget.relation == null) {
      throw new Error('未配置关联表')
    }
    if (!widget.relation.slaveColumn && widget.relation.slaveColumnId) {
      widget.relation.slaveColumn = formConfigRef.value?.relationMap?.get(widget.relation.relationId)?.slaveColumn
    }

    let params: any = {
      datasourceId: widget.datasource.datasourceId,
      relationId: widget.relation.relationId,
      filterDtoList: [
        {
          tableName: widget.table.tableName,
          columnName: widget.relation.slaveColumn.columnName,
          filterType: SysOnlineColumnFilterType.EQUAL_FILTER,
          columnValue: (formData[widget.datasource.variableName] || {})[widget.relation.masterColumn.columnName],
        },
      ],
    }
    // 脱敏设置
    params.ignoreMaskFields = getIgnoreMaskFields(widget)
    if (widget.eventInfo && typeof widget.eventInfo[OnlineFormEventType.BEFORE_LOAD_TABLE_DATA] === 'function') {
      params = await widget.eventInfo[OnlineFormEventType.BEFORE_LOAD_TABLE_DATA](params)
    }
    if (params == null)
      throw new Error('取消加载数据')
    const res = await doUrl(
      `/admin/online/onlineOperation/listByOneToManyRelationId/${widget.datasource.variableName}`,
      'post',
      params,
    )

    if (widget.eventInfo && typeof widget.eventInfo[OnlineFormEventType.AFTER_LOAD_TABLE_DATA] === 'function') {
      res.dataList = await widget.eventInfo[OnlineFormEventType.AFTER_LOAD_TABLE_DATA](res.dataList)
    }
    // 复制数据，清空主键id以及自动编码字段
    if (props.isCopy) {
      let temp = Date.now()
      const autoCodeColumnName: string[] = []
      if (widget.table && Array.isArray(widget.table.columnList)) {
        widget.table.columnList.forEach((column: any) => {
          if (column.fieldKind === SysOnlineFieldKind.AUTO_CODE) {
            autoCodeColumnName.push(column.columnName)
          }
        })
      }
      res.dataList.forEach((item: any) => {
        if (widget.primaryColumnName) {
          item[widget.primaryColumnName] = undefined
        }
        item.__cascade_add_id__ = temp++
        autoCodeColumnName.forEach((columnName) => {
          item[columnName] = undefined
        })
      })
    }
    formData[widget.relation.variableName] = res.dataList
  }
  catch (e) {
    console.error(e)
    throw e
  }
}

/**
 * 清空表单数据
 * @param data - 数据对象
 * @param columnList - 字段列表
 */
function clearFormData(data: any, columnList: string[]) {
  if (data == null || !Array.isArray(columnList))
    return
  columnList.forEach((columnName) => {
    data[columnName] = undefined
  })
}

/**
 * 获取主表主键以及主键对应的值
 */
function getPrimaryKeyValue() {
  if (props.rowData !== null && props.rowData !== undefined) {
    if (masterTable.value && Array.isArray(masterTable.value.columnList)) {
      masterTable.value.columnList.forEach((column: any) => {
        if (column.primaryKey) {
          masterTablePrimaryKey.value = column.columnName
          if (masterTablePrimaryKey.value) {
            masterTablePrimaryValue.value = props.rowData[masterTablePrimaryKey.value]
          }
        }
      })
    }
  }
}

/**
 * 初始化表单数据
 */
async function initFormData() {
  if (props.rowData != null) {
    getPrimaryKeyValue()
    // 如果是复制，清空主键以及自动编码字段
    const clearColumnList: string[] = []
    if (props.isCopy && masterTable.value && Array.isArray(masterTable.value.columnList)) {
      masterTable.value.columnList.forEach((column: any) => {
        if (column.primaryKey || column.fieldKind === SysOnlineFieldKind.AUTO_CODE) {
          masterTablePrimaryKey.value = column.columnName
          if (masterTablePrimaryKey.value) {
            masterTablePrimaryValue.value = props.rowData[masterTablePrimaryKey.value]
          }
          clearColumnList.push(column.columnName)
        }
      })
    }
    if (isRelation.value) {
      formData[masterTable.value.relation.variableName] = { ...props.rowData }
      clearFormData(formData[masterTable.value.relation.variableName], clearColumnList)
    }
    else {
      // 初始化主表以及一对一字段数据
      const relationNameList: string[] = []
      let datasourceName: string | undefined
      form.value.tableMap?.forEach((table: any) => {
        if (table.relation && table.relation.relationType === SysOnlineRelationType.ONE_TO_ONE) {
          relationNameList.push(table.relation.variableName)
        }
        else if (table.relation == null) {
          datasourceName = table.datasource.variableName
        }
      })
      Object.keys(props.rowData).forEach((key) => {
        if (!relationNameList.includes(key)) {
          // 主表字段
          if (datasourceName) {
            formData[datasourceName][key] = props.rowData[key]
          }
        }
        else {
          // 从表字段
          if (props.rowData[key]) {
            formData[key] = props.rowData[key]
          }
        }
      })
      // 初始化一对多数据
      if (Array.isArray(tableWidgetList.value) && tableWidgetList.value.length > 0) {
        const httpCallList = tableWidgetList.value
          .map((widget) => {
            if (widget.relation && widget.relation.relationType === SysOnlineRelationType.ONE_TO_MANY) {
              return loadRelationTableData(widget)
            }
            return null
          })
          .filter(item => item != null)
        await Promise.all(httpCallList)
        if (datasourceName) {
          clearFormData(formData[datasourceName], clearColumnList)
        }
      }
      else {
        if (datasourceName) {
          clearFormData(formData[datasourceName], clearColumnList)
        }
      }
    }
  }
}

// 提供表单上下文
provideFormContext()

// 监听表单配置变化
watch(() => props.formConfig, (newConfig) => {
  if (newConfig) {
    formConfigRef.value = newConfig
    if (props.editFormId) {
      getPDKByFormId(props.editFormId)
    }
    isReady.value = false
    rebuildFormConfig()
    initPage()
    initFormWidgetList()
    initWidgetRule()
    if (form.value.eventInfo && typeof form.value.eventInfo[OnlineFormEventType.AFTER_CREATE_FORM] === 'function') {
      form.value.eventInfo[OnlineFormEventType.AFTER_CREATE_FORM]()
    }
    initFormData().then(() => {
      if (form.value.eventInfo && typeof form.value.eventInfo[OnlineFormEventType.AFTER_LOAD_FORM_DATA] === 'function') {
        form.value.eventInfo[OnlineFormEventType.AFTER_LOAD_FORM_DATA]()
      }
      initWidgetLinkage()
    }).catch((e) => {
      console.error(e)
    }).finally(() => {
      isReady.value = true
    })
  }
}, { immediate: true })
</script>

<template>
  <div class="online-edit-form">
    <!-- 加载状态 -->
    <div v-if="!isReady" class="loading-box">
      <van-loading size="24px">
        加载中...
      </van-loading>
    </div>

    <!-- 表单内容 -->
    <template v-else>
      <!-- 导航栏 -->
      <van-nav-bar
        :title="form.formName || '编辑表单'"
        left-arrow
        @click-left="onBack(false)"
      />

      <!-- 表单主体 -->
      <div class="main-box">
        <van-form ref="formRef" :model="formData">
          <!-- TODO: 需要实现 OnlineCustomBlock 组件 -->
          <!-- <OnlineCustomBlock :widgetList="form.widgetList" :key="date" /> -->
          <van-cell-group inset>
            <van-field
              v-for="widget in visibleWidgetList"
              :key="widget.variableName"
              v-model="formData[widget.propString]"
              :label="widget.showName"
              :required="widget.props.required"
              :rules="rules[widget.propString] || []"
              :placeholder="`请输入${widget.showName}`"
            />
          </van-cell-group>
        </van-form>
      </div>

      <!-- 操作按钮 -->
      <div v-if="!formReadOnly" class="menu-box">
        <van-button block @click="onBack(false)">
          取消
        </van-button>
        <van-button block type="primary" @click="onSave()">
          暂存
        </van-button>
        <van-button block type="primary" @click="onSubmit()">
          保存
        </van-button>
        <van-button block type="primary" @click="onStartFlow()">
          提交
        </van-button>
      </div>

      <!-- 子表单弹窗 -->
      <van-popup
        v-if="showSubPage"
        :show="showSubPage"
        position="left"
        :style="{ width: '100%', height: '100%', background: '#f6f6f6' }"
      >
        <OnlineEditForm
          :form-id="subFormId"
          :row-data="editRowData"
          :save-data="false"
          @close="onCloseSubForm"
        />
      </van-popup>
    </template>
  </div>
</template>

<style scoped lang="less">
.online-edit-form {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f6f7f9;

  .loading-box {
    display: flex;
    width: 100vw;
    height: 100vh;
    background: white;
    align-items: center;
    justify-content: center;
  }

  .main-box {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .menu-box {
    flex-grow: 0;
    flex-shrink: 0;
    width: 100%;
    padding: 10px 15px;
    background: white;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    gap: 8px;

    .van-button {
      flex: 1;
    }
  }
}
</style>
