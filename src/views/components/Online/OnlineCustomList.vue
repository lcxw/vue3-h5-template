<script setup lang="ts">
import { computed, inject, nextTick, ref, watch } from 'vue'
import { showDialog } from 'vant'
import { OnlineFormEventType, SysCustomWidgetOperationType } from '@/staticDict/index'
import CustomList from '../CustomList.vue'
import ImageCard from '../ImageCard.vue'

/**
 * OnlineCustomList 在线自定义列表组件
 * 提供在线表单列表展示功能，支持增删改操作
 */

interface Operation {
  type: number
  name?: string
  enabled?: boolean
  eventInfo?: Record<string, Function>
}

interface Widget {
  operationList?: Operation[]
  childWidgetList?: unknown[]
  relation?: unknown
  primaryColumnName?: string
  eventInfo?: Record<string, Function>
}

interface Props {
  /** 数据列表 */
  value?: unknown[]
  /** 组件配置 */
  widget?: Widget
  /** 是否支持下拉刷新 */
  supportPullRefresh?: boolean
}

interface RowData {
  __cascade_add_id__?: number
  [key: string]: unknown
}

const props = withDefaults(defineProps<Props>(), {
  value: () => [],
  widget: undefined,
  supportPullRefresh: true,
})

const emit = defineEmits<{
  (e: 'update:value', value: unknown[]): void
  (e: 'change', value: unknown[]): void
}>()

/** 注入表单上下文 */
const formInject = inject<(() => any) | undefined>('form', undefined)

const listRef = ref<InstanceType<typeof CustomList> | null>(null)

/**
 * 安全获取表单上下文
 */
function form(): any {
  if (formInject == null) return {}
  return formInject() || {}
}

/**
 * 获取操作
 * @param type 操作类型
 */
function getOperation(type: number): Operation | undefined {
  if (!props.widget?.operationList)
    return undefined
  return props.widget.operationList.find(op => op.type === type)
}

/**
 * 检查是否有指定类型的操作且已启用
 * @param type 操作类型
 */
function hasOperator(type: number): boolean {
  const temp = getOperation(type)
  return !!(temp && temp.enabled)
}

/**
 * 检查操作是否可见（含权限校验）
 * @param type 操作类型
 * @param data 行数据（编辑/删除操作需要传入）
 */
function operationVisible(type: number, data?: unknown): boolean {
  const operation = getOperation(type)
  if (operation == null) return false
  return !form().readOnly && hasOperator(type) && form().checkOperationVisible(operation, data)
}

/**
 * 卡片组件配置
 */
const cardWidget = computed(() => {
  if (Array.isArray(props.widget?.childWidgetList) && props.widget.childWidgetList.length > 0) {
    return props.widget.childWidgetList[0]
  }
  return undefined
})

/**
 * 表格数据变更处理，支持 AFTER_LOAD_TABLE_DATA 事件回调
 * @param dataList 变更后的数据列表
 */
async function onTableDataListChange(dataList: unknown[]): Promise<unknown[]> {
  if (props.widget?.eventInfo && typeof props.widget.eventInfo[OnlineFormEventType.AFTER_LOAD_TABLE_DATA] === 'function') {
    dataList = await props.widget.eventInfo[OnlineFormEventType.AFTER_LOAD_TABLE_DATA](dataList)
  }
  emit('update:value', dataList)
  emit('change', dataList)
  return dataList
}

/**
 * 编辑回调处理，支持级联数据处理（新增记录 push 和更新记录 map 替换）
 * @param row 原始行数据（新增时为 null）
 * @param res 操作返回的数据
 */
function handlerEditOperate(row: RowData | null, res: RowData): void {
  if (props.widget?.relation != null) {
    const tempList = [...props.value] as RowData[]
    if (row == null) {
      // 新增记录
      const newRow = { ...res, __cascade_add_id__: new Date().getTime() }
      tempList.push(newRow)
    }
    else {
      // 更新记录
      const updatedRow = res
      const primaryColumnName = props.widget.primaryColumnName
      const replacedList = tempList.map((item) => {
        if (updatedRow.__cascade_add_id__ != null) {
          return updatedRow.__cascade_add_id__ === item.__cascade_add_id__ ? updatedRow : item
        }
        else {
          return (primaryColumnName && updatedRow[primaryColumnName] === item[primaryColumnName])
            ? updatedRow
            : item
        }
      })
      tempList.splice(0, tempList.length, ...replacedList)
    }
    onTableDataListChange(tempList)
  }
}

/**
 * 操作点击统一处理
 * @param operation 操作对象
 * @param row 行数据（新增时为 null）
 */
function onOperationClick(operation: Operation, row?: unknown): void {
  const rowData = row as RowData | null | undefined
  if (operation.type === SysCustomWidgetOperationType.BATCH_DELETE
    || operation.type === SysCustomWidgetOperationType.DELETE) {
    onDeleteRow(rowData)
  }
  else {
    form().handlerOperation(
      operation,
      row,
      props.widget,
      (res: RowData) => {
        handlerEditOperate(rowData ?? null, res)
      },
    )
  }
}

/**
 * 删除行，弹出确认弹窗后执行删除
 * @param row 要删除的行数据
 */
function onDeleteRow(row: RowData | null | undefined): void {
  if (row == null) return
  showDialog({
    title: '消息',
    message: '是否删除当前数据？',
    showCancelButton: true,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(() => {
    const primaryColumnName = props.widget?.primaryColumnName
    const tempList = [...(props.value as RowData[])].filter((data) => {
      if (data.__cascade_add_id__ != null) {
        return data.__cascade_add_id__ !== row.__cascade_add_id__
      }
      else {
        return primaryColumnName && data[primaryColumnName] !== row[primaryColumnName]
      }
    })
    onTableDataListChange(tempList)
  }).catch(() => {
    // 用户取消删除，不做任何操作
  })
}

/**
 * 重置列表
 */
function reset() {
  nextTick(() => {
    if (listRef.value) {
      listRef.value.reset()
    }
  })
}

// 监听数据变化
watch(
  () => props.value,
  () => {
    reset()
  },
  { immediate: true },
)

// 暴露方法供父组件调用
defineExpose({
  reset,
})
</script>

<template>
  <div class="online-custom-list">
    <van-button
      v-if="operationVisible(SysCustomWidgetOperationType.ADD)"
      type="success"
      plain
      block
      style="margin-bottom: 12px"
      @click="onOperationClick(getOperation(SysCustomWidgetOperationType.ADD)!)"
    >
      <van-icon name="plus" color="#00AE1C" />
      {{ getOperation(SysCustomWidgetOperationType.ADD)?.name || '添加' }}
    </van-button>
    <CustomList
      ref="listRef"
      class="list-box"
      :data-list="value"
      :support-pull-refresh="false"
    >
      <ImageCard
        v-for="(data, i) in value"
        :key="i"
        class="list-item"
        :data="(data as any)"
        :widget="(cardWidget as any)"
        :parent-widget="(widget as any)"
      >
        <template #menu>
          <div
            v-if="operationVisible(SysCustomWidgetOperationType.DELETE, data) || operationVisible(SysCustomWidgetOperationType.EDIT, data)"
            class="card-menu"
          >
            <van-icon
              v-if="operationVisible(SysCustomWidgetOperationType.DELETE, data)"
              name="delete-o"
              size="14px"
              color="var(--van-danger-color)"
              @click="onOperationClick(getOperation(SysCustomWidgetOperationType.DELETE)!, data)"
            />
            <span
              v-if="operationVisible(SysCustomWidgetOperationType.DELETE, data)"
              style="margin-left: 4px; color: var(--van-danger-color)"
              @click="onOperationClick(getOperation(SysCustomWidgetOperationType.DELETE)!, data)"
            >
              {{ getOperation(SysCustomWidgetOperationType.DELETE)?.name || '删除' }}
            </span>
            <van-icon
              v-if="operationVisible(SysCustomWidgetOperationType.EDIT, data)"
              name="edit"
              size="14px"
              color="var(--van-primary-color)"
              style="margin-left: 8px"
              @click="onOperationClick(getOperation(SysCustomWidgetOperationType.EDIT)!, data)"
            />
            <span
              v-if="operationVisible(SysCustomWidgetOperationType.EDIT, data)"
              style="margin-left: 4px; color: var(--van-primary-color)"
              @click="onOperationClick(getOperation(SysCustomWidgetOperationType.EDIT)!, data)"
            >
              {{ getOperation(SysCustomWidgetOperationType.EDIT)?.name || '编辑' }}
            </span>
          </div>
        </template>
      </ImageCard>
    </CustomList>
  </div>
</template>

<style scoped>
.online-custom-list {
  padding: 2px 4px;
}

.card-menu {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #D9DBDD;
  padding-top: 10px;
  width: 100%;
}
</style>
