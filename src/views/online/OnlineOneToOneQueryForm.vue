<script setup lang="ts">
/**
 * 一对一查询表单
 * 用于关联选择场景，支持筛选、排序、选择等操作
 */
import { computed, nextTick, onMounted, provide, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { doUrl } from '@/common/ajax'
import { OnlineFormEventType, SysOnlineColumnFilterType } from '@/staticDict/index'
import { TableWidget } from '@/utils/widget'
import { useOnlineForm } from './useOnlineForm'

const props = defineProps<{
  value?: number | string | any[]
  rowKey?: string
  formConfig: any
}>()

const emit = defineEmits<{
  (e: 'close', confirmed: boolean, selectItemList: any[]): void
}>()

const router = useRouter()

// 表单配置
const formConfigRef = ref(props.formConfig)
// 是否只读
const readOnly = ref(false)

// 使用在线表单组合式函数
const {
  isReady,
  form,
  masterTable,
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
  getQueryParams,
  provideFormContext,
} = useOnlineForm(formConfigRef, { readOnly })

// 选中的项列表
const selectItemList = ref<any[]>([])
// 排序信息
const sortInfo = ref<any>(undefined)
// 当前激活的排序字段
const sortInfoActive = ref<string | null>(null)
// 表格组件
const tableWidget = ref(new TableWidget(loadTableData, loadTableDataVerify, true))

/**
 * 获取查询表格配置
 */
const queryTable = computed(() => {
  return props.formConfig?.tableWidget
})

/**
 * 获取卡片组件配置
 */
const cardWidget = computed(() => {
  return queryTable.value?.childWidgetList?.[0]
})

/**
 * 获取过滤组件列表
 */
const filterWidgetList = computed(() => {
  return queryTable.value?.childWidgetList?.slice(1) || []
})

/**
 * 获取排序列表（含字段映射）
 */
const sortList = computed(() => {
  return (queryTable.value?.props?.orderList || []).map((item: any) => {
    const table = form.value.tableMap?.get(item.tableId)
    const column = form.value.columnMap?.get(item.columnId)
    if ((masterTable.value || {}).tableId === (table || {}).tableId) {
      // 主表字段
      return {
        ...item,
        fieldName: column?.columnName,
        asc: undefined,
      }
    }
    else {
      // 从表字段
      return {
        ...item,
        fieldName: `${table?.tableName}.${column?.columnName}`,
        asc: undefined,
      }
    }
  })
})

/**
 * 返回上一页
 */
function goBack() {
  emit('close', false, selectItemList.value)
}

/**
 * 提交选择
 */
function onSubmit() {
  emit('close', true, selectItemList.value)
}

/**
 * 刷新列表
 */
function onRefresh() {
  tableWidget.value.loadDataList(1)
}

/**
 * 重置过滤条件
 */
function onReset() {
  if (Array.isArray(filterWidgetList.value)) {
    filterWidgetList.value.forEach((widget) => {
      onValueChange(widget, undefined)
    })
    tableWidget.value.loadDataList(1)
  }
}

/**
 * 判断是否选中
 * @param data - 数据项
 */
function isSelect(data: any): boolean {
  if (data == null)
    return false
  const primaryKey = (queryTable.value?.table?.primaryKeyColumn || {}).columnName
  if (primaryKey) {
    for (let i = 0; i < selectItemList.value.length; i++) {
      if (selectItemList.value[i][primaryKey] === data[primaryKey]) {
        return true
      }
    }
  }
  return false
}

/**
 * 选择状态改变
 * @param data - 数据项
 */
function onSelectChange(data: any) {
  selectItemList.value = [data]
}

/**
 * 排序状态改变
 * @param sortItem - 排序项
 */
function onSortChange(sortItem: any) {
  if (sortItem.asc == null) {
    sortItem.asc = true
  }
  else if (sortItem.asc === true) {
    sortItem.asc = false
  }
  else if (sortItem.asc === false) {
    sortItem.asc = true
  }
  if (sortItem.asc != null) {
    sortInfoActive.value = sortItem.fieldName
    sortInfo.value = {
      fieldName: sortItem.fieldName,
      asc: sortItem.asc,
    }
  }
  else {
    sortInfo.value = undefined
  }
  onRefresh()
}

/**
 * 加载表格数据验证
 */
function loadTableDataVerify(): boolean {
  return true
}

/**
 * 加载表格数据
 * @param params - 加载参数
 */
async function loadTableData(params: any): Promise<{ dataList: any[], totalCount: number }> {
  try {
    const table = queryTable.value?.table
    if (table == null) {
      throw new Error('未配置关联表')
    }
    if (params == null)
      params = {}
    params = {
      ...params,
      orderParam: sortInfo.value == null ? [] : [sortInfo.value],
    }
    params.datasourceId = table.datasource.datasourceId
    params.filterDtoList = getQueryParams(filterWidgetList.value)
    if (queryTable.value?.relation != null) {
      params.relationId = table.relation.relationId
    }
    if (queryTable.value?.eventInfo && typeof queryTable.value.eventInfo[OnlineFormEventType.BEFORE_LOAD_TABLE_DATA] === 'function') {
      params = await queryTable.value.eventInfo[OnlineFormEventType.BEFORE_LOAD_TABLE_DATA](params)
    }
    if (params == null) {
      throw new Error('取消加载数据')
    }
    const res = await doUrl(
      `/admin/online/onlineOperation/listByOneToManyRelationId/${table.datasource.variableName}`,
      'post',
      params,
    )

    if (queryTable.value?.eventInfo && typeof queryTable.value.eventInfo[OnlineFormEventType.AFTER_LOAD_TABLE_DATA] === 'function') {
      res.dataList = await queryTable.value.eventInfo[OnlineFormEventType.AFTER_LOAD_TABLE_DATA](res.dataList)
    }
    return {
      dataList: res.dataList,
      totalCount: res.totalCount,
    }
  }
  catch (e) {
    console.error(e)
    throw e
  }
}

/**
 * 加载列表数据
 * @param pageNum - 页码
 */
function loadDataList(pageNum: number) {
  tableWidget.value.loadDataList(pageNum)
}

// 提供表单上下文
provideFormContext()

// 监听表单配置变化
watch(() => props.formConfig, (newConfig) => {
  if (newConfig) {
    formConfigRef.value = newConfig
    isReady.value = false
    rebuildFormConfig()
    initPage()
    initFormWidgetList()
    initWidgetRule()
    if (form.value.eventInfo && typeof form.value.eventInfo[OnlineFormEventType.AFTER_CREATE_FORM] === 'function') {
      form.value.eventInfo[OnlineFormEventType.AFTER_CREATE_FORM]()
    }
    initWidgetLinkage()
    isReady.value = true
  }
}, { immediate: true })

// 页面挂载后刷新列表
onMounted(() => {
  nextTick(() => {
    tableWidget.value.loadDataList(1)
  })
})
</script>

<template>
  <div class="relation-select-dlg">
    <!-- 导航栏 -->
    <van-nav-bar
      :title="form.formName || '关联选择'"
      left-arrow
      @click-left="goBack"
    />

    <!-- 过滤区域 -->
    <div v-if="filterWidgetList.length > 0" class="filter-box">
      <div class="filter-header">
        <!-- 排序区域 -->
        <div class="sort-area">
          <div
            v-for="sortItem in sortList"
            :key="sortItem.id"
            class="sort-item"
            @click="onSortChange(sortItem)"
          >
            <span :class="{ sortActive: sortInfoActive === sortItem.fieldName }">
              {{ sortItem.showName }}
            </span>
            <van-icon :name="sortItem.asc ? 'arrow-up' : 'arrow-down'" size="14" />
          </div>
        </div>
      </div>
      <!-- 过滤字段 -->
      <!-- TODO: 需要实现 OnlineCustomBlock 组件 -->
    </div>

    <!-- 列表区域 -->
    <div class="main-box">
      <van-list
        v-model:loading="tableWidget.loading"
        :finished="tableWidget.finished"
        finished-text="没有更多了"
        @load="loadDataList"
      >
        <div
          v-for="(data, index) in tableWidget.dataList"
          :key="index"
          class="list-item"
        >
          <!-- TODO: 需要实现 OnlineImageCard 组件 -->
          <van-cell-group inset>
            <van-cell
              :title="data[cardWidget?.column?.columnName] || ''"
              @click="onSelectChange(data)"
            >
              <template #right-icon>
                <van-icon v-if="isSelect(data)" name="success" color="#1989fa" />
              </template>
            </van-cell>
          </van-cell-group>
        </div>
      </van-list>
    </div>

    <!-- 操作按钮 -->
    <div class="menu-box">
      <van-button block @click="goBack">
        取消
      </van-button>
      <van-button block type="primary" @click="onSubmit">
        保存
      </van-button>
    </div>
  </div>
</template>

<style scoped lang="less">
.relation-select-dlg {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f6f7f9;

  .filter-box {
    background: white;
    padding: 0 18px;
    flex-grow: 0;
    flex-shrink: 0;

    .filter-header {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 10px 0;

      .sort-area {
        display: flex;
        flex-direction: row;
        align-items: center;

        .sort-item {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          margin-right: 8px;
          cursor: pointer;

          span {
            font-size: 14px;
            color: #707070;
            margin-right: 2px;

            &.sortActive {
              color: #1989fa;
            }
          }
        }
      }
    }
  }

  .main-box {
    flex-grow: 1;
    flex-shrink: 1;
    padding: 16px;
    position: relative;
    overflow-y: auto;

    .list-item {
      margin-bottom: 16px;
    }
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
