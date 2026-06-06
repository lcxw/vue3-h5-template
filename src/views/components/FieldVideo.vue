<script setup lang="ts">
import { ref } from 'vue'

/**
 * FieldVideo 视频字段组件
 * 提供视频播放功能
 */

interface Props {
  /** 标签 */
  label?: string
  /** 视频地址 */
  value?: string | boolean | number
  /** 视频封面 */
  poster?: string
  /** 是否必填 */
  required?: boolean
  /** 验证规则 */
  rules?: unknown[]
  /** 是否禁用 */
  disabled?: boolean
  /** 字段属性名 */
  prop?: string
}

withDefaults(defineProps<Props>(), {
  label: undefined,
  value: undefined,
  poster: undefined,
  required: false,
  rules: undefined,
  disabled: false,
  prop: undefined,
})

const videoRef = ref<HTMLVideoElement | null>(null)
</script>

<template>
  <div class="field-video field-form-item">
    <van-field :label="label" :required="required" :name="prop">
      <template #input>
        <video
          ref="videoRef"
          class="video-player"
          :src="value ? String(value) : undefined"
          :poster="poster"
          controls
          style="width: 100%; height: 300px"
        />
      </template>
    </van-field>
  </div>
</template>

<style scoped>
.field-video {
  background: white;
}

.video-player {
  width: 100%;
  height: 200px;
  object-fit: contain;
}
</style>
