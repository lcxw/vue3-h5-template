<script setup lang="ts">
import { showSuccessToast, showToast } from 'vant'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { SystemController } from '@/api'
import { encrypt } from '@/utils'

/**
 * 路由实例
 */
const router = useRouter()

/**
 * 表单引用
 */
const formRef = ref()

/**
 * 加载状态
 */
const loading = ref(false)

/**
 * 表单数据
 */
const form = reactive({
  loginName: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

/**
 * 表单验证规则
 */
const rules: Record<string, any[]> = {
  loginName: [
    { required: true, message: '请输入登录名称' },
  ],
  oldPassword: [
    { required: true, message: '请输入旧密码' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码' },
    {
      validator: (value: string) => value !== form.oldPassword,
      message: '新密码不能与旧密码相同',
    },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码' },
    {
      validator: (value: string) => value === form.newPassword,
      message: '两次输入的密码不一致',
    },
  ],
}

/**
 * 提交修改密码
 * 验证表单后调用修改密码接口
 */
async function handleSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
    loading.value = true
    const params = {
      loginName: form.loginName,
      oldPass: encrypt(form.oldPassword),
      newPass: encrypt(form.newPassword),
    }
    await SystemController.changePasswordWithoutLogin(params)
    showSuccessToast('密码修改成功')
    setTimeout(onCancel, 1000)
  }
  catch (e) {
    console.log(e)
  }
  finally {
    loading.value = false
  }
}

/**
 * 返回上一页
 */
function onCancel(): void {
  router.back()
}
</script>

<template>
  <div class="password-page">
    <van-nav-bar title="修改密码" left-arrow @click-left="onCancel" />
    <div class="page-body">
      <div class="item-body">
        <van-form ref="formRef">
          <van-field
            v-model="form.loginName"
            name="loginName"
            label="登录名称"
            placeholder="登录名称"
            required
            :rules="rules.loginName"
          />
          <van-field
            v-model="form.oldPassword"
            name="oldPassword"
            label="旧密码"
            placeholder="旧密码"
            type="password"
            required
            :rules="rules.oldPassword"
          />
          <van-field
            v-model="form.newPassword"
            name="newPassword"
            label="新密码"
            placeholder="新密码"
            type="password"
            required
            :rules="rules.newPassword"
          />
          <van-field
            v-model="form.confirmPassword"
            name="confirmPassword"
            label="新密码确认"
            placeholder="新密码确认"
            type="password"
            required
            :rules="rules.confirmPassword"
          />
        </van-form>
      </div>
      <van-button type="primary" :loading="loading" class="btn-body" block @click="handleSubmit">
        确认修改
      </van-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.password-page {
  height: 100vh;
  background: #f5f5f5;
}

.page-body {
  padding: 30rpx;

  .item-body {
    border-radius: 16rpx;
    background-color: #ffffff;
    padding: 8rpx 46rpx;
    margin-bottom: 40rpx;
  }

  .btn-body {
    width: 100%;
    border-radius: 16rpx;
  }
}
</style>
