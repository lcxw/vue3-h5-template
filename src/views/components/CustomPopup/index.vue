<script setup lang="ts">
/**
 * CustomPopup 自定义弹出组件
 * 提供底部弹出面板功能
 */

interface Props {
  /** 标题 */
  title?: string
  /** 是否显示弹窗 */
  showPickerDlg?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '标题',
  showPickerDlg: false,
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
  (e: 'reset'): void
  (e: 'update:showPickerDlg', value: boolean): void
}>()

/**
 * 关闭弹窗
 */
function onCancel() {
  emit('close')
  emit('update:showPickerDlg', false)
}

/**
 * 确认选择
 */
function onConfirm() {
  emit('confirm')
}

/**
 * 重置选择
 */
function onReset() {
  emit('reset')
}
</script>

<template>
  <van-popup
    v-model:show="showPickerDlg"
    position="bottom"
    round
    closeable
    :style="{ height: '60%' }"
  >
    <div class="custom-popup">
      <!-- 标题栏 -->
      <div class="title">
        {{ title }}
      </div>
      <!-- 选项区域 -->
      <div class="content-box">
        <slot />
      </div>
      <!-- 底部按钮栏 -->
      <div class="menu flex-row-between">
        <van-button block @click="onReset">
          重选
        </van-button>
        <van-button block type="primary" @click="onConfirm">
          确定
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<style scoped lang="less">
.custom-popup {
  display: flex;
  flex-direction: column;
  background: white;
  height: 100%;

  .title {
    color: #323233;
    font-weight: 500;
    font-size: 16px;
    text-align: center;
    width: 100%;
    height: 44px;
    line-height: 44px;
    flex-grow: 0;
    flex-shrink: 0;
    background: white;
    margin-bottom: 15px;
    border-bottom: 1px solid #F5F6F7;
  }

  .content-box {
    flex-grow: 1;
    flex-shrink: 1;
    height: 100px;
    overflow: hidden;
  }

  .menu {
    height: 64px;
    flex-grow: 0;
    flex-shrink: 0;
    border-top: 1px solid #F5F6F7;
    padding: 0px 16px;
    margin-top: 5px;
    background: white;
    display: flex;
    flex-direction: row;
    gap: 8px;
  }
}

.flex-row-between {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>
