<script setup lang="ts">
import type { CopyItem } from '../../types'
/**
 * 编辑抄送项组件
 * 用于选择抄送的人员、部门、角色、岗位等
 */
import { computed, onMounted, ref } from 'vue'
import { SysCommonBizController } from '@/api'
import { SysFlowCopyForType } from '@/staticDict/flowStaticDict'
import { getHeadImageUrl, treeDataTranslate } from '@/utils/index'
import { findTreeNodeObjectPath } from '@/views/components/utils'
import CustomCascaderPanel from '@/views/components/CustomCascaderPanel/index.vue'
import CustomSelectPanel from '@/views/components/CustomSelectPanel/index.vue'

/**
 * 组件属性定义
 */
interface Props {
  /** 已选中的抄送项 */
  selectedData?: Record<string, CopyItem[]>
  /** 角色列表 */
  roleList?: Record<string, any>[]
  /** 部门列表 */
  deptList?: Record<string, any>[]
  /** 岗位列表 */
  postList?: Record<string, any>[]
  /** 部门岗位列表 */
  deptPostList?: Record<string, any>[]
}

const props = withDefaults(defineProps<Props>(), {
  selectedData: () => ({}),
  roleList: () => [],
  deptList: () => [],
  postList: () => [],
  deptPostList: () => [],
})

const emit = defineEmits<{
  /** 关闭弹窗事件 */
  (e: 'close', data?: { type: string, value: CopyItem[] }): void
}>()

/** 搜索关键词 */
const searchVal = ref('')
/** 抄送类型选择弹窗 */
const showTypePicker = ref(false)
/** 选中的抄送项 */
const selectCopyForItem = ref<string[]>([])
/** 选中的抄送类型 */
const copyTypeValue = ref<{ id: string, name: string }>({ id: 'user', name: '抄送人' })
/** 时间戳，用于触发级联面板刷新 */
const time = ref(0)

/** 用户列表面板引用 */
const userListRef = ref<InstanceType<typeof CustomSelectPanel> | null>(null)
/** 部门级联面板引用 */
const deptListRef = ref<InstanceType<typeof CustomCascaderPanel> | null>(null)
/** 角色/岗位列表面板引用 */
const dataListRef = ref<InstanceType<typeof CustomSelectPanel> | null>(null)
/** 部门岗位级联面板引用 */
const deptPostListRef = ref<InstanceType<typeof CustomCascaderPanel> | null>(null)

/** 抄送类型列表 */
const typeColumns = computed(() => {
  return SysFlowCopyForType.getList().map(item => ({
    text: item.name,
    value: item.id,
  }))
})

/** 部门树形数据 */
const deptTree = computed(() => {
  const tempList = (props.deptList || []).map(item => ({
    ...item,
    checked: false,
  }))
  return treeDataTranslate(tempList)
})

/** 部门岗位树形数据 */
const deptPostTree = computed(() => {
  if (Array.isArray(props.deptList) && Array.isArray(props.deptPostList)) {
    const tempList = props.deptList.map(item => ({
      ...item,
      isDept: true,
      showCheckbox: false,
    })).concat(props.deptPostList.map(deptPost => ({
      ...deptPost,
      parentId: deptPost.deptId,
      id: deptPost.deptPostId,
      name: deptPost.postShowName,
      showCheckbox: true,
    })))
    return treeDataTranslate(tempList)
  }
  return []
})

/**
 * 加载系统用户数据（分页）
 * @param pageNum 页码
 * @returns 用户列表数据及总数
 */
function loadSysUserData(pageNum: number): Promise<{ dataList: any[], totalCount: number }> {
  const showName = searchVal.value
  return SysCommonBizController.list({
    widgetType: 'upms_user',
    pageParam: {
      pageNum,
      pageSize: 20,
      count: false,
    },
    filter: {
      showName,
    },
  }).then((res: any) => {
    if (res.dataList == null) res.dataList = []
    res.dataList.forEach((item: any) => {
      item.id = item.loginName
      item.name = item.showName
    })
    return {
      dataList: res.dataList,
      totalCount: res.totalCount,
    }
  })
}

/**
 * 选项过滤方法
 * @param data 选项数据
 * @returns 是否匹配搜索条件
 */
function filterListItem(data: Record<string, any>): boolean {
  if (data == null || data.name == null) return false
  return searchVal.value == null || searchVal.value === '' || data.name.indexOf(searchVal.value) !== -1
}

/**
 * 返回上一页
 */
function goBack(): void {
  emit('close')
}

/**
 * 抄送类型确认
 */
function onTypeConfirm(value: { text: string, value: string }): void {
  const item = SysFlowCopyForType.getById(value.value)
  if (item) {
    copyTypeValue.value = { id: item.id, name: item.name }
  }
  selectCopyForItem.value = []
  showTypePicker.value = false
}

/**
 * 判断抄送项是否禁用
 * @param data - 抄送项数据
 * @returns 是否禁用
 */
function copyItemDisabled(data: Record<string, any>): boolean {
  if (props.selectedData == null)
    return false
  const selectList = props.selectedData[copyTypeValue.value.id]
  if (!Array.isArray(selectList))
    return false
  return selectList.filter(item => item.id === data.id).length > 0
}

/**
 * 重置选择
 */
function resetClick(): void {
  selectCopyForItem.value = []
}

/**
 * 搜索处理，重置所有面板并触发刷新
 */
function onSearch(): void {
  if (userListRef.value) userListRef.value.reset()
  if (deptListRef.value) deptListRef.value.reset()
  if (dataListRef.value) dataListRef.value.reset()
  if (deptPostListRef.value) deptPostListRef.value.reset()
  time.value++
}

/**
 * 根据抄送类型构建抄送数据
 * @returns 构建后的抄送数据或 undefined
 */
async function buildCopyForItemList(): Promise<{ type: string, value: CopyItem[] } | undefined> {
  const type = copyTypeValue.value.id
  let value: CopyItem[] = []

  if (type === 'user') {
    // 用户类型需要从API获取详细信息
    const params = {
      widgetType: 'upms_user',
      fieldName: 'loginName',
      fieldValues: selectCopyForItem.value.join(','),
    }
    const res = await SysCommonBizController.viewByIds(params)
    if (Array.isArray(res)) {
      value = res.map((userItem: any) => ({
        id: userItem.loginName,
        name: userItem.showName,
        headImageUrl: getHeadImageUrl(userItem),
      }))
    }
  }
  else if (type === 'dept') {
    // 部门类型：通过树形路径获取完整层级名称
    value = selectCopyForItem.value
      .map(id => {
        const path = findTreeNodeObjectPath(deptTree.value, id, 'id', 'children')
        if (path.length > 0) {
          const deptItem = path[path.length - 1] as Record<string, any>
          return {
            ...deptItem,
            id: deptItem.id,
            name: path.map(item => (item as Record<string, any>).name).join(' / '),
          }
        }
        return null
      })
      .filter((item): item is CopyItem => item != null)
  }
  else if (type === 'deptPostLeader' || type === 'upDeptPostLeader') {
    // 部门领导类型无需选择具体项
    return { type, value: [] }
  }
  else if (type === 'deptPost') {
    // 部门岗位类型：通过树形路径获取完整层级名称
    value = selectCopyForItem.value
      .map(id => {
        const path = findTreeNodeObjectPath(deptPostTree.value, id, 'id', 'children')
        if (path.length > 0) {
          const deptPostItem = path[path.length - 1] as Record<string, any>
          return {
            id: deptPostItem.id,
            name: path.map(item => (item as Record<string, any>).name).join(' / '),
          }
        }
        return null
      })
      .filter((item): item is CopyItem => item != null)
  }
  else {
    // 角色、岗位等
    const list = type === 'role' ? props.roleList : props.postList
    value = list
      .filter(item => selectCopyForItem.value.includes(item.id))
      .map(item => ({
        id: item.id,
        name: item.name,
      }))
  }

  return value.length > 0 ? { type, value } : undefined
}

/**
 * 确认选择
 */
async function confirmClick(): Promise<void> {
  const formData = await buildCopyForItemList()
  emit('close', formData)
}

onMounted(() => {
  const firstType = SysFlowCopyForType.getList()[0]
  if (firstType) {
    copyTypeValue.value = { id: firstType.id, name: firstType.name }
  }
})
</script>

<template>
  <div class="edit-copyfor-item">
    <!-- 顶部导航栏 -->
    <div
      class="nav-header"
      style="position: fixed; top: 0; left: 0; right: 0; z-index: 9999; background-color: #ffffff; border-bottom: 1px solid #ebedf0;"
    >
      <div class="nav-bar">
        <van-icon name="arrow-left" size="20" @click="goBack" />
        <span class="text">抄送设置</span>
      </div>
    </div>
    <div class="nav-placeholder" />

    <!-- 搜索框 -->
    <div class="filter-box">
      <van-search
        v-model="searchVal"
        placeholder="请输入搜索关键词"
        shape="square"
        background="#F7F8FA"
        @search="onSearch"
      />
    </div>

    <!-- 抄送类型选择 -->
    <div class="type-select-box">
      <van-cell-group inset>
        <van-cell
          title="抄送类型"
          is-link
          :value="copyTypeValue.name"
          @click="showTypePicker = true"
        >
          <template #title>
            <span>抄送类型 <span class="require-span">*</span></span>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <van-popup v-model:show="showTypePicker" position="bottom" round>
      <van-picker
        :columns="typeColumns"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
      />
    </van-popup>

    <!-- 抄送项选择列表 -->
    <div class="copy-item-select">
      <van-cell-group inset>
        <!-- 抄送人 -->
        <CustomSelectPanel
          v-if="copyTypeValue.id === 'user'"
          ref="userListRef"
          v-model:value="selectCopyForItem"
          height="100%"
          :props="{ text: 'name', value: 'loginName', disabled: copyItemDisabled }"
          :multiple="true"
          :data-list="loadSysUserData"
        />

        <!-- 抄送部门 -->
        <CustomCascaderPanel
          v-if="copyTypeValue.id === 'dept'"
          ref="deptListRef"
          v-model:value="selectCopyForItem"
          :options="deptTree"
          :props="{ text: 'name', value: 'id', disabled: copyItemDisabled }"
          :multiple="true"
          :time="time"
          :filter="filterListItem"
        />

        <!-- 抄送角色 -->
        <CustomSelectPanel
          v-if="copyTypeValue.id === 'role'"
          ref="dataListRef"
          v-model:value="selectCopyForItem"
          height="100%"
          :props="{ text: 'name', value: 'id', disabled: copyItemDisabled }"
          :multiple="true"
          :data-list="roleList"
          :filter="filterListItem"
        />

        <!-- 抄送岗位 -->
        <CustomSelectPanel
          v-if="['allDeptPost', 'selfDeptPost', 'siblingDeptPost', 'upDeptPost'].includes(copyTypeValue.id)"
          ref="dataListRef"
          v-model:value="selectCopyForItem"
          height="100%"
          :props="{ text: 'name', value: 'id', disabled: copyItemDisabled }"
          :multiple="true"
          :data-list="postList"
          :filter="filterListItem"
        />

        <!-- 指定部门岗位 -->
        <CustomCascaderPanel
          v-if="copyTypeValue.id === 'deptPost'"
          ref="deptPostListRef"
          v-model:value="selectCopyForItem"
          :options="deptPostTree"
          :props="{ text: 'name', value: 'id', disabled: copyItemDisabled, showCheckbox: 'showCheckbox' }"
          :multiple="true"
          :time="time"
          :filter="filterListItem"
        />
      </van-cell-group>
    </div>

    <!-- 底部按钮 -->
    <div class="floor">
      <van-button class="reset-btn" @click="resetClick">
        重选
      </van-button>
      <van-button
        type="primary"
        :disabled="selectCopyForItem.length <= 0 && copyTypeValue.id !== 'deptPostLeader' && copyTypeValue.id !== 'upDeptPostLeader'"
        @click="confirmClick"
      >
        确定{{ selectCopyForItem.length > 0 ? ` (${selectCopyForItem.length})` : '' }}
      </van-button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.edit-copyfor-item {
  display: flex;
  flex-direction: column;
  background: #F6F7F9;
  width: 100vw;
  height: 100vh;

  .nav-header {
    padding: 10px 16px;
  }

  .nav-bar {
    display: flex;
    flex-direction: row;
    align-items: center;

    .text {
      flex: 1;
      text-align: center;
      color: #323233;
      font-weight: 500;
      font-size: 16px;
    }
  }

  .nav-placeholder {
    height: 44px;
  }

  .filter-box {
    flex-grow: 0;
    flex-shrink: 0;
    padding: 10px 12px;
    background-color: #fff;
  }

  .type-select-box {
    flex-grow: 0;
    flex-shrink: 0;
    margin: 16px;
  }

  .copy-item-select {
    flex-grow: 1;
    flex-shrink: 1;
    margin: 16px;
    overflow-y: auto;
    background-color: #fff;

    .select-panel {
      padding: 10px;
    }
  }

  .floor {
    height: 64px;
    padding: 0 10px;
    background-color: #ffffff;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;

    .reset-btn {
      width: 30%;
    }

    .van-button {
      &:first-child {
        width: 30%;
      }
      &:last-child {
        width: 60%;
      }
    }
  }

  .require-span {
    color: red;
    font-size: 18px;
    margin-left: 2px;
  }
}
</style>
