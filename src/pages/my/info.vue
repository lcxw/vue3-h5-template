<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { buildGetUrl } from '@/utils'

/**
 * 路由实例
 */
const router = useRouter()

/**
 * 用户信息
 */
const user = ref<any>(null)

/**
 * 获取头像URL
 */
const headerImg = computed(() => {
  if (user.value?.headImageUrl) {
    try {
      let urlData = user.value.headImageUrl
      if (typeof urlData === 'string') {
        urlData = JSON.parse(urlData)[0]
      }
      if (urlData?.downloadUri) {
        const token = localStorage.getItem('token')
        return buildGetUrl(urlData.downloadUri, {
          filename: urlData.filename,
          Authorization: token,
        })
      }
    }
    catch (e) {
      console.log(e)
    }
  }
  return null
})

/**
 * 返回上一页
 */
function goBack(): void {
  router.back()
}

/**
 * 页面加载时获取用户信息
 */
onMounted(() => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    try {
      user.value = JSON.parse(userInfoStr)
    }
    catch (e) {
      console.log(e)
    }
  }
})
</script>

<template>
  <div class="info-container">
    <van-nav-bar title="个人信息" left-arrow fixed placeholder @click-left="goBack" />
    <div class="setting-container">
      <div class="container-avatar">
        <van-image
          v-if="!headerImg"
          round
          width="80"
          height="80"
          src="/static/mine/default-header.jpg"
        />
        <van-image v-else round width="80" height="80" :src="headerImg" />
      </div>
      <div class="menu-list">
        <van-cell-group inset>
          <van-cell title="用户名" :value="user?.showName || ''" />
          <van-cell title="所属部门" :value="user?.deptName || ''" />
        </van-cell-group>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.info-container {
  background: #f5f5f5;
  min-height: 100vh;
}

.setting-container {
  padding: 16px;
}

.container-avatar {
  margin: 40rpx 0 30rpx;
  display: flex;
  justify-content: center;
}

.menu-list {
  margin-bottom: 16px;
}
</style>
