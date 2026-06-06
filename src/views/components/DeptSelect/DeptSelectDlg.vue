<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import CustomList from '../CustomList.vue'

/**
 * DeptSelectDlg 部门选择弹窗组件
 * 提供部门选择弹窗功能
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
}

const props = withDefaults(defineProps<Props>(), {
  value: undefined,
  multiple: false,
  rowKey: 'deptId',
})

const emit = defineEmits<{
  (e: 'update:value', value: unknown[]): void
  (e: 'close'): void
}>()

const formFilter = ref({
  deptName: undefined as string | undefined,
})
const selectItems = ref<(string | number)[]>([])
const deptList = ref<DeptItem[]>([])
const loading = ref(false)
const finished = ref(false)
const cardListRef = ref<InstanceType<typeof CustomList> | null>(null)

// 模拟部门数据
const mockDeptList: DeptItem[] = [
  { deptId: '1', deptName: '技术部' },
  { deptId: '2', deptName: '产品部' },
  { deptId: '3', deptName: '运营部' },
  { deptId: '4', deptName: '市场部' },
  { deptId: '5', deptName: '财务部' },
]

/**
 * 刷新部门列表
 */
function refreshDept() {
  deptList.value = mockDeptList.filter((item) => {
    if (formFilter.value.deptName) {
      return item.deptName.includes(formFilter.value.deptName)
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
  // 模拟加载
  setTimeout(() => {
    refreshDept()
    loading.value = false
  }, 500)
}

/**
 * 检查是否选中
 * @param data 部门数据
 */
function isSelect(data: DeptItem): boolean {
  if (data == null)
    return false
  return selectItems.value.includes(data[props.rowKey as keyof DeptItem])
}

/**
 * 选择变化处理
 * @param data 部门数据
 * @param val 是否选中
 */
function onSelectChange(data: DeptItem, val: boolean) {
  if (data == null || data[props.rowKey as keyof DeptItem] == null)
    return
  const key = data[props.rowKey as keyof DeptItem]
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
    selectItems.value = Array.isArray(props.value) ? [...props.value] : []
  }
  else {
    selectItems.value = Array.isArray(props.value) ? [...props.value] : (props.value == null ? [] : [props.value])
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
  nextTick(() => {
    if (cardListRef.value) {
      cardListRef.value.reset()
    }
  })
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
          :key="data[props.rowKey]"
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
    overflow: auto;
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
