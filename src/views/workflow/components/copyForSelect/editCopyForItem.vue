<script setup lang="ts">
import type { CopyItem } from '../../types'
/**
 * 编辑抄送项组件
 * 用于选择抄送的人员、部门、角色、岗位等
 */
import { computed, onMounted, ref, watch } from 'vue'
import { SysCommonBizController } from '@/api'
import { SysFlowCopyForType } from '@/staticDict/flowStaticDict'
import { getHeadImageUrl, treeDataTranslate } from '@/utils/index'

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

/** 抄送类型列表 */
const typeColumns = computed(() => {
  return SysFlowCopyForType.getList().map(item => ({
    text: item.name,
    value: item.id,
  }))
})

/** 过滤后的用户列表 */
const filteredUserList = computed(() => {
  // 这里需要从API获取用户列表
  return []
})

/** 过滤后的部门列表 */
const filteredDeptList = computed(() => {
  if (!searchVal.value)
    return props.deptList
  return props.deptList.filter(item => item.name?.includes(searchVal.value))
})

/** 过滤后的角色列表 */
const filteredRoleList = computed(() => {
  if (!searchVal.value)
    return props.roleList
  return props.roleList.filter(item => item.name?.includes(searchVal.value))
})

/** 过滤后的岗位列表 */
const filteredPostList = computed(() => {
  if (!searchVal.value)
    return props.postList
  return props.postList.filter(item => item.name?.includes(searchVal.value))
})

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
 * 切换用户选择
 */
function toggleUser(item: Record<string, any>): void {
  if (copyItemDisabled(item))
    return
  const index = selectCopyForItem.value.indexOf(item.loginName)
  if (index === -1) {
    selectCopyForItem.value.push(item.loginName)
  }
  else {
    selectCopyForItem.value.splice(index, 1)
  }
}

/**
 * 切换部门选择
 */
function toggleDept(item: Record<string, any>): void {
  if (copyItemDisabled(item))
    return
  const index = selectCopyForItem.value.indexOf(item.id)
  if (index === -1) {
    selectCopyForItem.value.push(item.id)
  }
  else {
    selectCopyForItem.value.splice(index, 1)
  }
}

/**
 * 切换角色选择
 */
function toggleRole(item: Record<string, any>): void {
  if (copyItemDisabled(item))
    return
  const index = selectCopyForItem.value.indexOf(item.id)
  if (index === -1) {
    selectCopyForItem.value.push(item.id)
  }
  else {
    selectCopyForItem.value.splice(index, 1)
  }
}

/**
 * 切换岗位选择
 */
function togglePost(item: Record<string, any>): void {
  if (copyItemDisabled(item))
    return
  const index = selectCopyForItem.value.indexOf(item.id)
  if (index === -1) {
    selectCopyForItem.value.push(item.id)
  }
  else {
    selectCopyForItem.value.splice(index, 1)
  }
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
 * 确认选择
 */
async function confirmClick(): void {
  const formData = await buildCopyForItemList()
  emit('close', formData)
}

/**
 * 根据抄送类型构建抄送数据
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
    value = props.deptList
      .filter(item => selectCopyForItem.value.includes(item.id))
      .map(item => ({
        id: item.id,
        name: item.name,
      }))
  }
  else if (type === 'deptPostLeader' || type === 'upDeptPostLeader') {
    value = []
  }
  else if (type === 'deptPost') {
    value = props.deptPostList
      .filter(item => selectCopyForItem.value.includes(item.deptPostId))
      .map(item => ({
        id: item.deptPostId,
        name: item.postShowName,
      }))
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
 * 搜索
 */
function onSearch(): void {
  // 搜索时触发列表更新
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
        <div v-if="copyTypeValue.id === 'user'" class="select-panel">
          <van-checkbox-group v-model="selectCopyForItem">
            <van-cell
              v-for="item in filteredUserList"
              :key="item.loginName"
              clickable
              @click="toggleUser(item)"
            >
              <template #title>
                <span>{{ item.showName }}</span>
              </template>
              <template #right-icon>
                <van-checkbox :name="item.loginName" :disabled="copyItemDisabled(item)" />
              </template>
            </van-cell>
          </van-checkbox-group>
        </div>

        <!-- 抄送部门 -->
        <div v-if="copyTypeValue.id === 'dept'" class="select-panel">
          <van-checkbox-group v-model="selectCopyForItem">
            <van-cell
              v-for="item in filteredDeptList"
              :key="item.id"
              clickable
              @click="toggleDept(item)"
            >
              <template #title>
                <span>{{ item.name }}</span>
              </template>
              <template #right-icon>
                <van-checkbox :name="item.id" :disabled="copyItemDisabled(item)" />
              </template>
            </van-cell>
          </van-checkbox-group>
        </div>

        <!-- 抄送角色 -->
        <div v-if="copyTypeValue.id === 'role'" class="select-panel">
          <van-checkbox-group v-model="selectCopyForItem">
            <van-cell
              v-for="item in filteredRoleList"
              :key="item.id"
              clickable
              @click="toggleRole(item)"
            >
              <template #title>
                <span>{{ item.name }}</span>
              </template>
              <template #right-icon>
                <van-checkbox :name="item.id" :disabled="copyItemDisabled(item)" />
              </template>
            </van-cell>
          </van-checkbox-group>
        </div>

        <!-- 抄送岗位 -->
        <div v-if="['allDeptPost', 'selfDeptPost', 'siblingDeptPost', 'upDeptPost'].includes(copyTypeValue.id)" class="select-panel">
          <van-checkbox-group v-model="selectCopyForItem">
            <van-cell
              v-for="item in filteredPostList"
              :key="item.id"
              clickable
              @click="togglePost(item)"
            >
              <template #title>
                <span>{{ item.name }}</span>
              </template>
              <template #right-icon>
                <van-checkbox :name="item.id" :disabled="copyItemDisabled(item)" />
              </template>
            </van-cell>
          </van-checkbox-group>
        </div>
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
