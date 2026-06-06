<template>
  <div class="copy-for-select">
    <div class="cc-view-title" @click="onAddClick">
      <span class="text">抄送设置</span>
      <van-icon name="plus" color="#ccc" size="20" />
    </div>
    <div class="wrap">
      <div class="row" v-for="typeGroup in copyForDataList" :key="typeGroup.type">
        <div class="row-t">
          <div class="flex-row-between">
            <span class="copyType">{{ getTypeName(typeGroup.type) }}</span>
            <van-icon name="minus" color="#FF5219" size="16" @click="deleteCoyForItem(typeGroup.type)" />
          </div>
        </div>
        <div class="row-c flex-row-start">
          <div class="copyItem" v-for="data in typeGroup.dataList" :key="data.id">
            <img class="copyItem-avatar" :src="data.headImageUrl" v-if="data.headImageUrl" />
            <span class="name">{{ data.name }}</span>
            <van-icon class="copyItem-del" name="cross" color="#171A1D" @click="deleteCoyForItem(typeGroup.type, data)" />
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑抄送项弹窗 -->
    <van-popup v-model:show="popupShow" position="bottom" round style="height: 100%;">
      <EditCopyForItem
        v-if="popupShow"
        :selectedData="selectData"
        :roleList="roleList"
        :deptList="deptList"
        :postList="postList"
        :deptPostList="deptPostList"
        @close="onClosePopup"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
/**
 * 抄送人选择组件
 * 用于设置流程任务的抄送人员、部门、角色等
 */
import { ref, computed, onMounted, watch } from 'vue'
import { SysCommonBizController } from '@/api'
import { SysFlowCopyForType } from '@/staticDict/flowStaticDict'
import { megerList } from '@/utils/index'
import EditCopyForItem from './editCopyForItem.vue'
import type { CopyItem } from '../../types'

/**
 * 组件属性定义
 */
interface Props {
  /** 抄送项列表 */
  modelValue?: CopyItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  /** 更新抄送项事件 */
  (e: 'update:modelValue', value: CopyItem[]): void
}>()

/** 弹窗显示状态 */
const popupShow = ref(false)
/** 角色列表 */
const roleList = ref<Record<string, any>[]>([])
/** 部门列表 */
const deptList = ref<Record<string, any>[]>([])
/** 岗位列表 */
const postList = ref<Record<string, any>[]>([])
/** 部门岗位列表 */
const deptPostList = ref<Record<string, any>[]>([])
/** 选中的抄送数据 */
const selectData = ref<Record<string, CopyItem[]>>({})

/**
 * 获取抄送类型名称
 * @param type - 抄送类型ID
 * @returns 抄送类型名称
 */
function getTypeName(type: string): string {
  const item = SysFlowCopyForType.getById(type)
  return item?.name || '未知类型'
}

/**
 * 更新编辑抄送项数据
 * @param data - 抄送项数据
 */
function updateEditCopyForItem(data: { type: string; value: CopyItem[] }): void {
  const copyForType = data.type
  // 按照抄送类型更新
  if (selectData.value[copyForType] == null) {
    selectData.value[copyForType] = []
  }
  selectData.value[copyForType] = megerList(selectData.value[copyForType], data.value, 'id')
  selectData.value = { ...selectData.value }
  onValueChange()
}

/**
 * 触发值变更事件
 */
function onValueChange(): void {
  const value = Object.keys(selectData.value).reduce((retObj: CopyItem[], key) => {
    const temp = selectData.value[key]
    if (temp != null && Array.isArray(temp)) {
      retObj.push({
        type: key,
        id: temp.map(item => item.id).join(',')
      })
    }
    return retObj
  }, [])
  emit('update:modelValue', value)
}

/**
 * 关闭弹窗
 * @param data - 抄送项数据
 */
function onClosePopup(data?: { type: string; value: CopyItem[] }): void {
  popupShow.value = false
  if (data) {
    updateEditCopyForItem(data)
  }
}

/**
 * 删除抄送项
 * @param type - 抄送类型
 * @param data - 抄送项数据（可选，如果不传则删除整个类型）
 */
function deleteCoyForItem(type: string, data?: CopyItem): void {
  if (type != null && selectData.value[type] != null) {
    if (data != null) {
      selectData.value[type] = selectData.value[type].filter(item => item !== data)
    } else {
      selectData.value[type] = []
    }
  }
  onValueChange()
}

/**
 * 点击添加抄送项
 */
function onAddClick(): void {
  popupShow.value = true
}

/**
 * 加载部门列表
 */
function loadSysDeptList(): void {
  const params = {
    widgetType: 'upms_dept',
    filter: {}
  }
  SysCommonBizController.list(params).then((res) => {
    if (res.dataList == null) res.dataList = []
    deptList.value = res.dataList.map((item: any) => ({
      id: String(item.deptId),
      name: item.deptName,
      ...item
    }))
  }).catch((e) => {
    console.error(e)
  })
}

/**
 * 加载岗位列表
 */
function loadSysPostList(): void {
  const params = {
    widgetType: 'upms_post',
    filter: {}
  }
  SysCommonBizController.list(params).then((res) => {
    if (res.dataList == null) res.dataList = []
    postList.value = res.dataList.map((item: any) => ({
      id: String(item.postId),
      name: item.postName,
      ...item
    }))
  }).catch((e) => {
    console.error(e)
  })
}

/**
 * 加载部门岗位列表
 */
function loadDeptPostList(): void {
  const params = {
    widgetType: 'upms_dept_post',
    filter: {}
  }
  SysCommonBizController.list(params).then((res) => {
    if (res.dataList == null) res.dataList = []
    deptPostList.value = res.dataList.sort((value1: any, value2: any) => {
      return value1.postLevel - value2.postLevel
    })
  }).catch((e) => {
    console.error(e)
  })
}

/**
 * 加载角色列表
 */
function loadSysRoleList(): void {
  const params = {
    widgetType: 'upms_role',
    filter: {}
  }
  SysCommonBizController.list(params).then((res) => {
    if (res.dataList == null) res.dataList = []
    roleList.value = res.dataList.map((item: any) => ({
      id: String(item.roleId),
      name: item.roleName,
      ...item
    }))
  }).catch((e) => {
    console.error(e)
  })
}

/**
 * 抄送数据列表（按类型分组）
 */
const copyForDataList = computed(() => {
  return Object.keys(selectData.value).map((key) => {
    if (key != null && Array.isArray(selectData.value[key])) {
      return {
        type: key,
        dataList: selectData.value[key]
      }
    }
    return null
  }).filter((item) => item != null) as { type: string; dataList: CopyItem[] }[]
})

onMounted(() => {
  loadSysRoleList()
  loadSysDeptList()
  loadSysPostList()
  loadDeptPostList()
})
</script>

<style lang="less" scoped>
.copy-for-select {
  .cc-view-title {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    .text {
      color: #333333;
      font-size: 16px;
      font-weight: bold;
    }
  }

  .wrap {
    .row {
      border-bottom: 1px solid rgb(229, 229, 229);
      padding-bottom: 0;
      margin-top: 16px;

      .row-t {
        width: 100%;
        margin-bottom: 5px;
      }

      .row-c {
        flex-wrap: wrap;
      }

      .copyItem {
        background: #F6F7F9;
        margin-right: 10px;
        margin-bottom: 10px;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        color: #171A1D;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;

        .copyItem-avatar {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          margin-right: 10px;
        }

        .name {
          line-height: 20px;
          font-size: 12px;
          height: 20px;
          color: #171a1d;
        }

        .copyItem-del {
          line-height: 20px;
          height: 20px;
          margin-left: 10px;
        }
      }
    }
  }
}

.flex-row-between {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.flex-row-start {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.copyType {
  font-size: 14px;
  color: #333333;
  font-weight: 500;
}
</style>