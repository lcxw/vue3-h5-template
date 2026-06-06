<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import CustomList from '../CustomList.vue'

/**
 * UserSelectDlg 用户选择弹窗组件
 * 提供用户选择弹窗功能
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
  (e: 'close'): void
}>()

const formFilter = ref({
  sysUserLoginName: undefined as string | undefined,
})
const selectItems = ref<(string | number)[]>([])
const userList = ref<UserItem[]>([])
const loading = ref(false)
const finished = ref(false)
const cardListRef = ref<InstanceType<typeof CustomList> | null>(null)

// 模拟用户数据
const mockUserList: UserItem[] = [
  { userId: '1', showName: '张三', loginName: 'zhangsan' },
  { userId: '2', showName: '李四', loginName: 'lisi' },
  { userId: '3', showName: '王五', loginName: 'wangwu' },
  { userId: '4', showName: '赵六', loginName: 'zhaoliu' },
  { userId: '5', showName: '钱七', loginName: 'qianqi' },
]

/**
 * 刷新用户列表
 */
function refreshUser() {
  userList.value = mockUserList.filter((item) => {
    if (formFilter.value.sysUserLoginName) {
      return item.showName.includes(formFilter.value.sysUserLoginName)
    }
    return true
  })
  finished.value = true
}

/**
 * 加载更多
 */
function loadMore() {
  loading.value = true
  setTimeout(() => {
    refreshUser()
    loading.value = false
  }, 500)
}

/**
 * 检查是否选中
 * @param data 用户数据
 */
function isSelect(data: UserItem): boolean {
  if (data == null)
    return false
  return selectItems.value.includes(data[props.rowKey as keyof UserItem])
}

/**
 * 选择变化处理
 * @param data 用户数据
 * @param val 是否选中
 */
function onSelectChange(data: UserItem, val: boolean) {
  if (data == null || data[props.rowKey as keyof UserItem] == null)
    return
  const key = data[props.rowKey as keyof UserItem]
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
 * 提交选择
 */
function onSubmit() {
  emit('update:value', selectItems.value)
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
  nextTick(() => {
    if (cardListRef.value) {
      cardListRef.value.reset()
    }
  })
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
        v-model="formFilter.sysUserLoginName"
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
    overflow: auto;
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
