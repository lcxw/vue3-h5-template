<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { SystemController } from '@/api'
import { clearAllStorage } from '@/utils'

/**
 * 路由实例
 */
const router = useRouter()

/**
 * 返回上一页
 */
function goBack(): void {
  router.back()
}

/**
 * 退出登录
 * 清除存储数据并跳转到登录页
 */
function onLogOut(): void {
  clearAllStorage()
  SystemController.logout({ _skipAuthRedirect: true })
    .catch(() => {})
    .finally(() => {
      router.replace('/login')
    })
}
</script>

<template>
  <div class="setting-container">
    <van-nav-bar title="系统设置" left-arrow fixed placeholder @click-left="goBack" />
    <div class="content">
      <van-image class="image" src="/static/my/my2x.jpg" width="100%" fit="contain" />
      <van-button type="primary" class="btn" @click="onLogOut">
        退出登录
      </van-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.setting-container {
  background: #ffffff;
  min-height: 100vh;
}

.content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
}

.image {
  width: 100%;
  margin-bottom: 4vh;
}

.btn {
  width: 240rpx;
  height: 80rpx !important;
  border-radius: 8rpx !important;
}
</style>
