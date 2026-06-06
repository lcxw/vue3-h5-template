<script setup lang="ts">
import { showToast } from 'vant'
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { SystemController } from '@/api'
import { encrypt } from '@/utils'

/**
 * 路由实例
 */
const router = useRouter()

/**
 * 表单数据
 */
const formData = reactive({
  userName: '',
  password: '',
})

/**
 * 输入框自定义样式
 */
const inputCustomStyle = {
  padding: '0',
  height: '44px',
}

/**
 * 登录方法
 * 调用登录接口，存储用户信息并跳转到首页
 */
async function login(): Promise<void> {
  if (!formData.userName) {
    showToast('请输入账号')
    return
  }
  if (!formData.password) {
    showToast('请输入密码')
    return
  }

  try {
    const res = await SystemController.loginMobile({
      loginName: formData.userName,
      password: encrypt(formData.password),
    })
    // 存储登录信息
    localStorage.setItem('setHomeEntryList', JSON.stringify(res.mobileEntryList))
    localStorage.setItem('token', res.tokenData)
    localStorage.setItem('userInfo', JSON.stringify(res))
    console.log('登录成功，已存储 token:', res.tokenData)
    // 跳转到首页
    router.push('/home')
  }
  catch (e) {
    console.log(e)
    showToast('登录失败')
  }
}

/**
 * 打开修改密码页面
 */
function openModifyPassword(): void {
  router.push('/login/password')
}
</script>

<template>
  <div
    class="login-container"
    style="padding-top: 15vh; background-color: #ffffff; top: 0; bottom: 0; right: 0; left: 0"
  >
    <div class="logo">
      <van-image src="/static/logo/3001.png" width="50" height="50" />
      <div class="title">
        项目管理系统
      </div>
    </div>
    <div class="inputs">
      <van-field
        v-model="formData.userName"
        class="inp"
        placeholder="请输入账号"
        :style="inputCustomStyle"
      />
    </div>
    <div class="inputs">
      <van-field
        v-model="formData.password"
        class="inp"
        placeholder="请输入密码"
        :style="inputCustomStyle"
        type="password"
      />
    </div>
    <div class="forget-password">
      <span @click="openModifyPassword">修改密码</span>
    </div>
    <div style="margin: 3vh 24px 0 24px">
      <van-button type="primary" round block @click="login">
        登录
      </van-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  background-image: url(/static/login/login_bg2.png);
  background-size: 100% 100vh;
  background-repeat: no-repeat;
  background-position: center;
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  padding: 0;
  margin: 0;
}

.logo {
  width: 100%;
  margin-bottom: 7vh;
  display: flex;
  align-items: center;
  justify-content: center;

  .title {
    margin-left: 5px;
    font-size: 40px;
    color: #153057;
    font-weight: 500;
    height: 45px;
    line-height: 45px;
    font-family: 'YouSheBiaoTiHei';
  }
}

.inputs {
  padding: 0 20rpx;
  background: #fafafa;
  margin: 20rpx 48rpx;
  border-radius: 20px;
  background-color: transparent;
  border: 1px solid #ccc;
  margin-bottom: 4vh;

  .inp {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
  }
}

.forget-password {
  margin: 3vh 24px 0 24px;
  text-align: right;

  span {
    padding: 6rpx 0;
    color: #909399;
    font-size: 28rpx;

    &:active {
      text-decoration: underline;
    }
  }
}
</style>
