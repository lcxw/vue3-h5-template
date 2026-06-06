<script setup lang="ts">
import { showSuccessToast } from 'vant'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { SystemController } from '@/api'
import { buildGetUrl, clearAllStorage } from '@/utils'
import SignatureDlg from './signatureDlg.vue'

/**
 * 路由实例
 */
const router = useRouter()

/**
 * 用户信息
 */
const user = ref<any>(null)

/**
 * 签名数据
 */
const signature = ref('')

/**
 * 显示签名编辑对话框
 */
const showSignatureEdit = ref(false)

/**
 * 版本号
 */
const version = ref('1.0.0')

/**
 * 保存加载状态
 */
const saveLoading = ref(false)

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
 * 跳转到个人信息页面
 */
function handleToInfo(): void {
  router.push('/my/info')
}

/**
 * 跳转到设置页面
 */
function handleToSetting(): void {
  router.push('/my/setting')
}

/**
 * 关于软件
 */
function handleAbout(): void {
  // 可以跳转到关于页面或显示对话框
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

/**
 * 设置签名
 * 获取用户签名并打开签名编辑对话框
 */
async function setSign(): Promise<void> {
  try {
    const res = await SystemController.getUserSignature({})
    signature.value = res || ''
    // 延迟加载防止闪烁
    setTimeout(() => {
      showSignatureEdit.value = true
    }, 100)
  }
  catch (e) {
    console.log(e)
  }
}

/**
 * 保存签名到服务器
 * @param data 签名数据
 */
async function saveSignatureAPI(data: string): Promise<void> {
  if (saveLoading.value)
    return
  saveLoading.value = true
  try {
    await SystemController.saveUserSignature({ signingPicture: data })
    showSuccessToast('保存成功')
    showSignatureEdit.value = false
  }
  finally {
    saveLoading.value = false
  }
}

/**
 * 关闭签名编辑对话框
 */
function closeSignatureEdit(): void {
  showSignatureEdit.value = false
}

/**
 * 签名编辑完成回调
 * @param params 签名数据
 */
function changeSignatureEdit(params: string): void {
  saveSignatureAPI(params)
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
  <div class="my-container">
    <van-nav-bar title="我的" fixed placeholder />
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
    <div class="content-section">
      <div class="menu-list">
        <van-cell-group inset>
          <van-cell
            title="个人签名"
            is-link
            @click="setSign"
          >
            <template #icon>
              <van-image width="20" height="20" src="/static/mine/mine-signature.png" />
            </template>
          </van-cell>
        </van-cell-group>
      </div>
      <div class="menu-list">
        <van-cell-group inset>
          <van-cell
            title="关于软件"
            :value="`版本v${version}`"
            is-link
            @click="handleAbout"
          >
            <template #icon>
              <van-image width="20" height="20" src="/static/mine/mine-about.png" />
            </template>
          </van-cell>
        </van-cell-group>
      </div>
    </div>
    <div class="content">
      <van-button type="primary" class="btn" @click="onLogOut">
        退出登录
      </van-button>
    </div>
    <SignatureDlg
      v-model:visible="showSignatureEdit"
      v-model="signature"
      auto-trim
      @close="closeSignatureEdit"
      @change="changeSignatureEdit"
    />
  </div>
</template>

<style scoped lang="scss">
.my-container {
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

.content-section {
  padding: 16px;

  .menu-list {
    margin-bottom: 16px;
  }
}

.content {
  position: fixed;
  bottom: 70rpx;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn {
  width: 240rpx;
  height: 80rpx !important;
  border-radius: 8rpx !important;
}
</style>
