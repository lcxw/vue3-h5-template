<script setup lang="ts">
/**
 * 在线表单入口页面
 * 用于加载和显示在线表单，支持子表单弹窗、删除模式切换
 */
import { onActivated, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import OnlineQueryForm from './OnlineQueryForm.vue'

const router = useRouter()
const route = useRoute()

// 表单ID
const formId = ref<string | undefined>(undefined)
// 入口ID
const entryId = ref<string | undefined>(undefined)
// 是否显示子页面
const showSubPage = ref(false)
// 子表单ID
const subFormId = ref<string | undefined>(undefined)
// 编辑行数据
const editRowData = ref<any>(undefined)
// 标签类型（用于控制返回行为）
const barType = ref(0)
// 时间戳（用于强制刷新）
const date = ref(Date.now())
// OnlineQueryForm 组件引用
const queryFormRef = ref<InstanceType<typeof OnlineQueryForm> | null>(null)

/**
 * 关闭子表单
 */
function closeSubPage() {
  showSubPage.value = false
}

/**
 * 处理子表单关闭事件
 * @param refresh - 是否需要刷新
 */
function onCloseSubForm(refresh: boolean) {
  showSubPage.value = false
  if (refresh) {
    date.value = Date.now()
  }
}

/**
 * 关闭表单
 */
function closed() {
  router.back()
}

/**
 * 切换删除模式
 */
function toggleDelete() {
  queryFormRef.value?.toggleDelete()
}

/**
 * 返回上一页
 */
function goBack() {
  if (barType.value === 0) {
    router.back()
  }
  else {
    closeSubPage()
  }
}

// 页面加载时获取参数
onMounted(() => {
  // 从路由参数获取表单信息
  const passData = route.query.passData as string
  if (passData) {
    try {
      const item = JSON.parse(decodeURIComponent(passData))
      formId.value = item.formId
      entryId.value = item.entryId
    }
    catch (e) {
      console.error('解析表单参数失败', e)
    }
  }
})

// 页面激活时刷新时间戳
onActivated(() => {
  date.value = Date.now()
})
</script>

<template>
  <div class="online-form-wrapper">
    <!-- 子表单弹窗 -->
    <van-popup
      v-if="showSubPage"
      :show="showSubPage"
      position="left"
      :style="{ width: '100%', height: '100%' }"
    >
      <OnlineQueryForm
        v-if="subFormId && showSubPage"
        :form-id="subFormId"
        :row-data="editRowData"
        @close="onCloseSubForm"
        @change-sub="barType = 1 - barType"
      />
    </van-popup>

    <!-- 主表单内容 -->
    <OnlineQueryForm
      v-if="formId && !showSubPage"
      :key="date"
      :form-id="formId"
      :entry-id="entryId"
      @change-sub="barType = 1 - barType"
      @close="closed"
    />
  </div>
</template>

<style scoped lang="less">
.online-form-wrapper {
  width: 100%;
  height: 100vh;
  background-color: #f6f7f9;
}
</style>
