<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

/**
 * TabBar 组件
 * 底部导航栏，包含消息、工作台、我的三个Tab
 */

// 当前路由
const route = useRoute()

// 当前激活的Tab索引
const active = computed(() => {
  const path = route.path
  if (path.includes('/message') || path.includes('/workflow'))
    return 0
  if (path.includes('/home'))
    return 1
  if (path.includes('/my'))
    return 2
  return 1 // 默认工作台
})

// TabBar 数据配置
const tabbarData = [
  {
    icon: 'comment-o',
    title: '消息',
    to: { name: 'Message' },
  },
  {
    icon: 'wap-home-o',
    title: '工作台',
    to: { name: 'Home' },
  },
  {
    icon: 'user-o',
    title: '我的',
    to: { name: 'My' },
  },
]
</script>

<template>
  <van-tabbar v-model="active" :placeholder="true" :route="true" fixed>
    <van-tabbar-item
      v-for="(item, index) in tabbarData"
      :key="index"
      :icon="item.icon"
      :to="item.to"
    >
      {{ item.title }}
    </van-tabbar-item>
  </van-tabbar>
</template>
