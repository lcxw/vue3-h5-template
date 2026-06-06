<script setup lang="ts">
/**
 * FieldLabel 标签字段组件
 * 提供标签展示功能
 */

interface Props {
  /** 标签 */
  label?: string
  /** 是否必填 */
  required?: boolean
  /** 字段属性名 */
  prop?: string
}

withDefaults(defineProps<Props>(), {
  label: undefined,
  required: false,
  prop: undefined,
})
</script>

<template>
  <div class="field-label field-form-item">
    <van-field :label="label" :required="required" :name="prop">
      <template #input>
        <slot />
      </template>
    </van-field>
  </div>
</template>

<style scoped>
.field-label {
  background: white;
}
</style>
