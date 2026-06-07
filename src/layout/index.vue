<script setup lang="ts">
import { computed } from 'vue'
import NavBar from '@/components/nav-bar/index.vue'
import tabbar from '@/components/tabbar/index.vue'
import { useCachedViewStore } from '@/store/modules/cached-view'
import { useDarkModeStore } from '@/store/modules/dark-mode'
import { useRoute } from 'vue-router'

const cachedViewStore = useCachedViewStore()
const { cachedViewList } = storeToRefs(cachedViewStore)

const darkModeStore = useDarkModeStore()
const { theme } = storeToRefs(darkModeStore)

const route = useRoute()

/** 隐藏布局导航栏的页面（这些页面自带导航栏） */
const hideNavBarRoutes = ['HandleFlowTask']
const showNavBar = computed(() => !hideNavBarRoutes.includes(route.name as string))

/** 隐藏 TabBar 的页面（详情页不需要底部导航） */
const hideTabBarRoutes = ['HandleFlowTask']
const showTabBar = computed(() => !hideTabBarRoutes.includes(route.name as string))
</script>

<template>
  <div class="app-wrapper">
    <van-config-provider :theme="theme">
      <NavBar v-if="showNavBar" />
      <router-view v-slot="{ Component }">
        <keep-alive :include="cachedViewList">
          <component :is="Component" />
        </keep-alive>
      </router-view>
      <tabbar v-if="showTabBar" />
    </van-config-provider>
  </div>
</template>

<style lang="less" scoped>
@import "@/styles/mixin.less";

.app-wrapper {
  .clearfix();
  position: relative;
  height: 100%;
  width: 100%;
}
</style>
