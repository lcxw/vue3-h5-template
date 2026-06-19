<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import CustomList from '../CustomList.vue'
import { SysCommonBizController } from '@/api/Controller/SysCommonBizController'

/**
 * UserSelectDlg 用户选择弹窗组件
 * 提供用户选择弹窗功能，支持分页加载和搜索过滤
 */

interface UserItem {
  userId: string | number
  showName: string
  loginName?: string
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
  rowKey: 'userId',
  filterObject: undefined,
})

const emit = defineEmits<{
  (e: 'update:value', value: unknown[]): void
  (e: 'confirm', items: UserItem[]): void
  (e: 'close'): void
}>()

/** 搜索条件 */
const formFilter = ref({
  keyword: undefined as string | undefined,
})
/** 已选中的用户ID列表 */
const selectItems = ref<(string | number)[]>([])
/** 用户列表数据 */
const userList = ref<UserItem[]>([])
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
 * 加载用户列表数据
 * @param pageNum - 页码
 * @param reload - 是否重新加载（清空列表）
 */
function loadUserList(pageNum: number, reload = false): void {
  console.log(`[UserSelectDlg] loadUserList, pageNum=${pageNum}, reload=${reload}, currentLength=${userList.value.length}`)
  loading.value = true
  const filterParams: Record<string, any> = {
    ...(props.filterObject || {}),
  }
  if (formFilter.value.keyword) {
    filterParams.showName = formFilter.value.keyword
  }
  SysCommonBizController.list({
    widgetType: 'upms_user',
    pageParam: {
      pageNum,
      pageSize,
      count: true,
    },
    filter: filterParams,
  }).then((res: any) => {
    const dataList = (res?.dataList || []) as UserItem[]
    console.log(`[UserSelectDlg] 接口返回, dataList长度=${dataList.length}, totalCount=${res?.totalCount}`)
    if (reload || pageNum === 1) {
      userList.value = dataList
    } else {
      userList.value = [...userList.value, ...dataList]
    }
    currentPage.value = pageNum
    const totalCount = res?.totalCount
    if (totalCount != null && totalCount > 0) {
      finished.value = userList.value.length >= totalCount
    } else {
      finished.value = dataList.length < pageSize
    }
    console.log(`[UserSelectDlg] 加载完成, userList长度=${userList.value.length}, finished=${finished.value}`)
  }).catch((e) => {
    console.error(`[UserSelectDlg] 加载失败:`, e)
    finished.value = true
  }).finally(() => {
    loading.value = false
  })
}

/**
 * 刷新用户列表（重置并重新加载第一页）
 */
function refreshUser(): void {
  finished.value = false
  // 重置列表组件的页码，确保下次加载更多从第2页开始
  cardListRef.value?.reset()
  loadUserList(1, true)
}

/** 搜索防抖定时器 */
let searchTimer: number | null = null

/**
 * 监听搜索关键词变化，防抖搜索
 */
watch(
  () => formFilter.value.keyword,
  () => {
    if (searchTimer) {
      clearTimeout(searchTimer)
    }
    searchTimer = window.setTimeout(() => {
      refreshUser()
    }, 300)
  },
)

/**
 * 加载更多
 * @param pageNum - 页码
 */
function loadMore(pageNum: number): void {
  console.log(`[UserSelectDlg] loadMore触发, pageNum=${pageNum}, loading=${loading.value}, finished=${finished.value}`)
  if (loading.value || finished.value) return
  loadUserList(pageNum)
}

/**
 * 检查是否选中
 * @param data - 用户数据
 * @returns 是否选中
 */
function isSelect(data: UserItem): boolean {
  if (data == null)
    return false
  const key = data[props.rowKey as keyof UserItem] as string | number
  return selectItems.value.includes(key)
}

/**
 * 选择变化处理
 * @param data - 用户数据
 * @param val - 是否选中
 */
function onSelectChange(data: UserItem, val: boolean) {
  if (data == null)
    return
  const key = data[props.rowKey as keyof UserItem] as string | number
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
 * 获取选中的用户对象列表
 */
function getSelectedUserItems(): UserItem[] {
  const keySet = new Set(selectItems.value)
  return userList.value.filter(item => {
    const key = item[props.rowKey as keyof UserItem] as string | number
    return keySet.has(key)
  })
}

/**
 * 提交选择
 */
function onSubmit() {
  const selectedItems = getSelectedUserItems()
  emit('update:value', selectItems.value)
  emit('confirm', selectedItems)
  emit('close')
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
  refreshUser()
})
</script>

<template>
  <div class="user-select-dlg">
    <div class="header">
      <div class="nav-bar">
        <span class="text">用户选择</span>
      </div>
    </div>
    <div class="search-box">
      <van-search
        v-model="formFilter.keyword"
        placeholder="请输入用户名称"
        @search="refreshUser"
      />
    </div>
    <div class="main-box">
      <CustomList
        ref="cardListRef"
        height="100%"
        :is-loading="loading"
        :finished="finished"
        :data-list="userList"
        @load="loadMore"
      >
        <div
          v-for="(data, i) in userList"
          :key="i"
          class="user-item"
          @click="onSelectChange(data, !isSelect(data))"
        >
          <span class="text">{{ data.showName }}</span>
          <van-checkbox class="select" shape="square" icon-size="16px" :model-value="isSelect(data)" />
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
.user-select-dlg {
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
      width: 100%;
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

    .user-item {
      background: white;
      border-radius: 4px;
      padding: 15px 28px;
      position: relative;
      margin-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .text {
        color: #333333;
        font-size: 14px;
        font-weight: bold;
        height: 25px;
        line-height: 25px;
      }

      .select {
        position: absolute;
        left: 6px;
        top: 16px;
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
