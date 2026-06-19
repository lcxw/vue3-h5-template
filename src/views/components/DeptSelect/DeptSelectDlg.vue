<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import CustomList from '../CustomList.vue'
import { SysCommonBizController } from '@/api/Controller/SysCommonBizController'

/**
 * DeptSelectDlg 部门选择弹窗组件
 * 提供部门选择弹窗功能，支持分页加载和搜索过滤
 */

interface DeptItem {
  deptId: string | number
  deptName: string
}

interface Props {
  /** 选择值 */
  value?: string | number | unknown[]
  /** 是否多选 */
  multiple?: boolean
  /** 行键名 */
  rowKey?: string
  /** 过滤对象 */
  filterObject?: Record<string, unknown>
}

const props = withDefaults(defineProps<Props>(), {
  value: undefined,
  multiple: false,
  rowKey: 'deptId',
  filterObject: undefined,
})

const emit = defineEmits<{
  (e: 'update:value', value: unknown[]): void
  (e: 'confirm', items: DeptItem[]): void
  (e: 'close'): void
}>()

/** 搜索条件 */
const formFilter = ref({
  deptName: undefined as string | undefined,
})
/** 已选中的部门ID列表 */
const selectItems = ref<(string | number)[]>([])
/** 部门列表数据 */
const deptList = ref<DeptItem[]>([])
/** 加载状态 */
const loading = ref(false)
/** 是否加载完成 */
const finished = ref(false)
/** 当前页码 */
const currentPage = ref(1)
/** 每页数量 */
const pageSize = 20
/** 列表组件引用 */
const cardListRef = ref<InstanceType<typeof CustomList> | null>(null)

/**
 * 加载部门列表数据
 * @param pageNum - 页码
 * @param reload - 是否重新加载（清空列表）
 */
function loadDeptList(pageNum: number, reload = false): void {
  console.log(`[DeptSelectDlg] loadDeptList, pageNum=${pageNum}, reload=${reload}, currentLength=${deptList.value.length}`)
  loading.value = true
  const filterParams: Record<string, any> = {
    ...(props.filterObject || {}),
  }
  if (formFilter.value.deptName) {
    filterParams.deptName = formFilter.value.deptName
  }
  SysCommonBizController.list({
    widgetType: 'upms_dept',
    pageParam: {
      pageNum,
      pageSize,
      count: true,
    },
    filter: filterParams,
  }).then((res: any) => {
    const dataList = (res?.dataList || []) as DeptItem[]
    console.log(`[DeptSelectDlg] 接口返回, dataList长度=${dataList.length}, totalCount=${res?.totalCount}`)
    if (reload || pageNum === 1) {
      deptList.value = dataList
    } else {
      deptList.value = [...deptList.value, ...dataList]
    }
    currentPage.value = pageNum
    const totalCount = res?.totalCount
    if (totalCount != null && totalCount > 0) {
      finished.value = deptList.value.length >= totalCount
    } else {
      finished.value = dataList.length < pageSize
    }
    console.log(`[DeptSelectDlg] 加载完成, deptList长度=${deptList.value.length}, finished=${finished.value}`)
  }).catch((e) => {
    console.error(`[DeptSelectDlg] 加载失败:`, e)
    finished.value = true
  }).finally(() => {
    loading.value = false
  })
}

/**
 * 刷新部门列表（重置并重新加载第一页）
 */
function refreshDept(): void {
  finished.value = false
  // 重置列表组件的页码，确保下次加载更多从第2页开始
  cardListRef.value?.reset()
  loadDeptList(1, true)
}

/** 搜索防抖定时器 */
let searchTimer: number | null = null

/**
 * 监听搜索关键词变化，防抖搜索
 */
watch(
  () => formFilter.value.deptName,
  () => {
    if (searchTimer) {
      clearTimeout(searchTimer)
    }
    searchTimer = window.setTimeout(() => {
      refreshDept()
    }, 300)
  },
)

/**
 * 加载更多
 * @param pageNum - 页码
 */
function loadMore(pageNum: number): void {
  console.log(`[DeptSelectDlg] loadMore触发, pageNum=${pageNum}, loading=${loading.value}, finished=${finished.value}`)
  if (loading.value || finished.value) return
  loadDeptList(pageNum)
}

/**
 * 检查是否选中
 * @param data - 部门数据
 * @returns 是否选中
 */
function isSelect(data: DeptItem): boolean {
  if (data == null)
    return false
  const key = data[props.rowKey as keyof DeptItem] as string | number
  return selectItems.value.includes(key)
}

/**
 * 选择变化处理
 * @param data - 部门数据
 * @param val - 是否选中
 */
function onSelectChange(data: DeptItem, val: boolean) {
  if (data == null)
    return
  const key = data[props.rowKey as keyof DeptItem] as string | number
  if (key == null)
    return
  if (val) {
    if (!selectItems.value.includes(key)) {
      if (props.multiple) {
        selectItems.value.push(key)
      }
      else {
        selectItems.value = [key]
      }
    }
  }
  else {
    selectItems.value = selectItems.value.filter(item => item !== key)
  }
}

/**
 * 返回
 */
function onBack() {
  reset()
  emit('close')
}

/**
 * 获取选中的部门对象列表
 */
function getSelectedDeptItems(): DeptItem[] {
  const keySet = new Set(selectItems.value)
  return deptList.value.filter(item => {
    const key = item[props.rowKey as keyof DeptItem] as string | number
    return keySet.has(key)
  })
}

/**
 * 提交选择
 */
function onSubmit() {
  const selectedItems = getSelectedDeptItems()
  emit('update:value', selectItems.value)
  emit('confirm', selectedItems)
  emit('close')
}

/**
 * 获取部门项的唯一键
 * @param data - 部门数据
 * @returns 唯一键值
 */
function getItemKey(data: DeptItem): string | number {
  return data[props.rowKey as keyof DeptItem] as string | number
}

/**
 * 重置选择
 */
function reset() {
  if (props.multiple) {
    selectItems.value = Array.isArray(props.value) ? [...props.value as (string | number)[]] : []
  }
  else {
    selectItems.value = Array.isArray(props.value) ? [...props.value as (string | number)[]] : (props.value == null ? [] : [props.value as string | number])
  }
}

// 监听值变化
watch(
  () => props.value,
  () => {
    reset()
  },
  { immediate: true },
)

// 组件挂载后初始化
onMounted(() => {
  refreshDept()
})
</script>

<template>
  <div class="dept-select-dlg">
    <div class="header">
      <div class="nav-bar">
        <van-icon name="arrow-left" size="20" @click="onBack" />
        <span class="text">部门选择</span>
      </div>
    </div>
    <div class="search-box">
      <van-search
        v-model="formFilter.deptName"
        placeholder="请输入部门名称"
        @search="refreshDept"
      />
    </div>
    <div class="main-box">
      <CustomList
        ref="cardListRef"
        height="100%"
        :is-loading="loading"
        :finished="finished"
        :data-list="deptList"
        @load="loadMore"
      >
        <div
          v-for="data in deptList"
          :key="getItemKey(data)"
          class="dept-item"
          @click="onSelectChange(data, !isSelect(data))"
        >
          <van-checkbox class="select" shape="square" icon-size="16px" :model-value="isSelect(data)" />
          <span class="text">{{ data.deptName }}</span>
        </div>
      </CustomList>
    </div>
    <div class="menu-box">
      <van-button block @click="onBack">
        取消
      </van-button>
      <van-button block type="primary" @click="onSubmit">
        保存
      </van-button>
    </div>
  </div>
</template>

<style scoped lang="less">
.dept-select-dlg {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #F6F7F9;

  .header {
    position: sticky;
    top: 0;
    background-color: #ffffff;
    border-bottom: 1px solid #ebedf0;
    z-index: 10;
  }

  .nav-bar {
    height: 44px;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-left: 10px;

    .text {
      width: calc(100vw - 40px);
      color: #323233;
      font-weight: 500;
      font-size: 15px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .search-box {
    background: #fff;
    padding: 10px;
  }

  .main-box {
    flex: 1;
    position: relative;
    padding: 0px 16px;

    .dept-item {
      display: flex;
      align-items: center;
      background: white;
      border-radius: 4px;
      padding: 15px 28px 15px 13px;
      position: relative;
      margin-top: 16px;

      .text {
        color: #333333;
        font-size: 14px;
        font-weight: bold;
        height: 25px;
        line-height: 25px;
        margin-left: -5px;
      }
    }
  }

  .menu-box {
    flex-grow: 0;
    flex-shrink: 0;
    width: 100%;
    padding: 10px 15px;
    flex-wrap: nowrap;
    background: white;
    box-sizing: border-box;
    margin-top: 15px;
    position: sticky;
    bottom: 0;
    display: flex;
    gap: 8px;
  }
}
</style>
