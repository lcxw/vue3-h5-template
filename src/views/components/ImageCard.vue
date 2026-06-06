<script setup lang="ts">
import CustomImage from './CustomImage.vue'

/**
 * ImageCard 图片卡片组件
 * 提供带图片的卡片展示功能
 */

interface ImageInfo {
  show?: boolean
  imageAlign?: string
  imagePosition?: string
  src?: string
  fit?: string
  width?: string
  height?: string
  round?: boolean
  radius?: string | number
}

interface Props {
  /** 卡片绑定的数据 */
  data?: Record<string, unknown>
  /** 是否选中 */
  isSelect?: boolean
  /** 选中是否灰化 */
  disabledSelect?: boolean
  /** 是否显示选择框 */
  supportSelect?: boolean
  /** 图片信息 */
  imageInfo?: ImageInfo
  /** 自定义类名 */
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  data: undefined,
  isSelect: false,
  disabledSelect: false,
  supportSelect: false,
  imageInfo: () => ({
    show: false,
    imageAlign: 'center',
    imagePosition: 'left',
    src: undefined,
    fit: 'fill',
    width: '100px',
    height: '100px',
    round: false,
    radius: '3px',
  }),
  customClass: undefined,
})

const emit = defineEmits<{
  (e: 'select', data: Record<string, unknown> | undefined, value: boolean): void
  (e: 'click', data: Record<string, unknown> | undefined): void
}>()

/**
 * 选择变化处理
 * @param val 选择值
 */
function onSelectChange(val: boolean) {
  emit('select', props.data, val)
}

/**
 * 点击卡片处理
 */
function onClick() {
  emit('click', props.data)
}
</script>

<template>
  <div
    class="image-card"
    :class="customClass"
    :style="{ paddingLeft: supportSelect ? '28px' : undefined }"
  >
    <div class="card-box" @click="onClick">
      <CustomImage
        v-if="imageInfo.show && imageInfo.imagePosition === 'left'"
        class="image"
        style="margin-right: 10px"
        :style="{ alignSelf: imageInfo.imageAlign }"
        :src="imageInfo.src"
        :fit="imageInfo.fit"
        :width="imageInfo.width"
        :height="imageInfo.height"
        :round="imageInfo.round"
        :radius="imageInfo.radius"
      />
      <div class="card-content">
        <slot />
      </div>
      <CustomImage
        v-if="imageInfo.show && imageInfo.imagePosition === 'right'"
        class="image"
        style="margin-left: 10px"
        :style="{ alignSelf: imageInfo.imageAlign }"
        :src="imageInfo.src"
        :fit="imageInfo.fit"
        :width="imageInfo.width"
        :height="imageInfo.height"
        :round="imageInfo.round"
        :radius="imageInfo.radius"
      />
    </div>
    <div v-if="$slots.menu" class="card-menu-box">
      <slot name="menu" />
    </div>
    <van-checkbox
      v-if="supportSelect"
      class="select"
      :model-value="isSelect"
      shape="square"
      icon-size="16px"
      :disabled="disabledSelect"
      @update:model-value="onSelectChange"
    />
  </div>
</template>

<style scoped>
.image-card {
  position: relative;
  padding: 16px 16px;
  border-radius: 10px;
}

.card-box {
  display: flex;
  justify-content: flex-start;
}

.card-content {
  flex-grow: 1;
  flex-shrink: 1;
  width: 100px;
}

.select {
  position: absolute;
  left: 8px;
  top: 17px;
}
</style>
