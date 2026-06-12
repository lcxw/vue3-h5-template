<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { FlowOperationController } from '@/api'
import projectConfig from '@/config'
import { MobileEntryType, SysMenuBindType, SysOnlineFormType } from '@/staticDict'
import { buildGetUrl, setObjectToSessionStorage, treeDataTranslate } from '@/utils'

/**
 * 路由实例
 */
const router = useRouter()

/**
 * 默认图标
 */
const homeGridIcon2x = '/static/home/homeGridIcon2x.png'

/**
 * 首页入口列表数据
 */
const getHomeEntryList = ref<any[]>([])

/**
 * 任务列表数据
 */
const taskCellList = ref([
  { title: '待办任务', value: '10' },
  { title: '历史任务', value: '100' },
  { title: '已办任务', value: '9' },
])

/**
 * 获取最终入口列表（处理图片数据）
 */
const getFinalEntryList = computed(() => {
  return (getHomeEntryList.value || []).map((item) => {
    const temp = { ...item }
    try {
      temp.imageData = temp.imageData ? JSON.parse(temp.imageData) : undefined
      if (temp.imageData) {
        // 构建图片URL
        temp.imageData = buildImageUrl(temp.imageData)
      }
    }
    catch (e) {
      temp.imageData = null
    }
    return temp
  })
})

/**
 * 获取分组列表（九宫格和分组类型）
 */
const commonList = computed(() => {
  if (Array.isArray(getFinalEntryList.value)) {
    const tempList = getFinalEntryList.value.filter((item) => {
      return item.entryType === MobileEntryType.SUDOKU || item.entryType === MobileEntryType.GROUP
    })
    if (Array.isArray(tempList)) {
      return treeDataTranslate(
        tempList.map(item => ({ ...item })),
        'entryId',
        'parentId',
      ).filter(item => (item.children || []).length > 0)
    }
  }
  return []
})

/**
 * 构建图片URL
 * @param imageData 图片数据对象
 * @returns 图片URL字符串
 */
function buildImageUrl(imageData: any): string {
  if (!imageData)
    return homeGridIcon2x
  if (Array.isArray(imageData)) {
    imageData = imageData[0]
  }
  if (imageData.downloadUri) {
    const token = localStorage.getItem('token')
    return buildGetUrl(imageData.downloadUri, {
      filename: imageData.filename,
      Authorization: token,
    })
  }
  return homeGridIcon2x
}

/**
 * 入口项点击事件
 * @param entryId 入口ID
 * @param extraObject 额外参数JSON字符串
 */
function onEntryItemClick(entryId: string, extraObject: string): void {
  jumpTo(entryId, extraObject)
}

/**
 * 跳转到指定入口
 * @param entryId 入口ID
 * @param menu 额外参数JSON字符串
 */
function jumpTo(entryId: string, menu: string): void {
  const menuItem = JSON.parse(menu || '{}')
  if (menuItem != null && setObjectToSessionStorage('currentMenuId', entryId)) {
    // 路由表单
    if (menuItem.bindType === SysMenuBindType.ROUTER && menuItem.formRouterName) {
      router.push({ name: menuItem.formRouterName })
      return
    }
    // 在线表单菜单
    if (
      menuItem.bindType === SysMenuBindType.ONLINE_FORM
      && menuItem.onlineFormId != null
      && menuItem.onlineFormId !== ''
    ) {
      router.push({
        path: '/online/form',
        query: {
          passData: JSON.stringify({
            formId: menuItem.onlineFormId,
            formType: SysOnlineFormType.QUERY,
          }),
        },
      })
    }
    // 工单列表菜单
    if (
      menuItem.bindType === SysMenuBindType.WORK_ORDER
      && menuItem.onlineFormId != null
      && menuItem.onlineFormId !== ''
      && menuItem.onlineFlowEntryId != null
      && menuItem.onlineFlowEntryId !== ''
    ) {
      router.push({
        path: '/online/form',
        query: {
          passData: JSON.stringify({
            formId: menuItem.onlineFormId,
            entryId: menuItem.onlineFlowEntryId,
          }),
        },
      })
    }
    // 报表菜单
    if (
      menuItem.bindType === SysMenuBindType.REPORT
      && menuItem.reportPageId != null
      && menuItem.reportPageId !== ''
    ) {
      router.push({
        path: '/report',
        query: { pageId: menuItem.reportPageId },
      })
    }
  }
}

/**
 * 跳转到任务列表
 * @param index 任务类型索引
 */
function goTaskList(index: number): void {
  const paths = ['/message', '/workflow/history', '/workflow/approved']
  if (index >= 0 && index < paths.length) {
    router.push(paths[index])
  }
}

/**
 * 初始化表单数据
 * 获取待办任务数量
 */
async function formInit(): Promise<void> {
  try {
    const res = await FlowOperationController.countRuntimeTask({})
    taskCellList.value[0].value = res || 0
  }
  catch (e) {
    console.log(e)
  }
}

/**
 * 页面加载时初始化数据
 */
onMounted(() => {
  // 从localStorage获取首页入口列表
  const entryListStr = localStorage.getItem('setHomeEntryList')
  if (entryListStr) {
    try {
      getHomeEntryList.value = JSON.parse(entryListStr)
    }
    catch (e) {
      console.log(e)
    }
  }
  formInit()
})
</script>

<template>
  <div class="home-container">
    <van-nav-bar title="工作台" fixed placeholder />
    <div style="padding: 0 16px 10px 16px">
      <div v-for="group in commonList" :key="group.entryId" class="commons">
        <p class="commons-title">
          {{ group.entryName }}
        </p>
        <van-grid :column-num="4" :border="false" class="commons-ctn">
          <van-grid-item
            v-for="(item, index) in group.children"
            :key="item.entryId"
            class="commons-ctn-item"
            @click="onEntryItemClick(item.entryId, item.extraData)"
          >
            <div class="commons-ctn-item-icon">
              <van-image width="44" height="44" :src="item.imageData || homeGridIcon2x" />
            </div>
            <div class="commons-ctn-item-text">
              {{ item.entryName }}
            </div>
          </van-grid-item>
        </van-grid>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.home-container {
  background: #F6F7F9;
  min-height: 100vh;
}

.commons {
  width: 100%;
  margin-top: 32rpx;
  border-radius: 16rpx;
  padding: 24rpx 0;
  background: #ffffff;
}

.commons-title {
  margin: 0;
  padding: 24rpx 30rpx;
  color: #000000;
  font-weight: 700;
  font-size: 32rpx;
}

.commons-ctn-item {
  margin-bottom: 40rpx;
}

.commons-ctn-item-icon {
  width: 88rpx;
  height: 88rpx;
  margin-bottom: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
}

.commons-ctn-item-text {
  width: 100%;
  font-size: 24rpx;
  color: #646566;
  text-align: center;
  margin-top: 16rpx;
}

.cell {
  width: 100%;
  height: 112rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  margin: 32rpx 0;
  display: flex;
  align-items: center;
}
</style>
