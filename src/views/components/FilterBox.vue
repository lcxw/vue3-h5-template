<template>
  <div
    class="filter-box"
    style="display: flex; align-items: center; width: 100%; minHeight: 35px"
  >
    <div style="flex: 1">
      <div v-show="supportSort" class="sort-box">
        <div class="sort-wrap">
          <div
            v-for="sortItem in sortList"
            :key="sortItem.fieldName"
            class="sort-item"
            @click="onSortChange(sortItem)"
          >
            <span class="sort-txt" :class="{ sortActive: sortInfoActive === sortItem.fieldName }">
              {{ sortItem.showName }}
            </span>
            <van-icon :name="sortItem.asc ? 'arrow-up' : 'arrow-down'" color="#707070" size="14" />
          </div>
        </div>
      </div>
    </div>
    <slot name="right" />
    <slot name="filter" />
    <div style="display: flex; align-items: center; justify-content: flex-end; width: 60px">
      <div class="divider" />
      <span v-if="hasFilter" style="font-size: 14px; flex-shrink: 0" @click="showFilter = !showFilter">
        筛选<van-icon name="filter-o" style="margin-left: 1px" />
      </span>
    </div>

    <!-- 过滤弹窗 -->
    <van-popup
      v-if="hasFilter"
      v-model:show="showFilter"
      position="bottom"
      round
      closeable
      :style="{ height: '80%' }"
    >
      <div style="padding: 16px 24px; display: flex; flex-direction: column; height: 100%; box-sizing: border-box">
        <div style="margin-bottom: 12px">
          <div style="width: 100%; text-align: center; font-size: 14px; color: #333333">筛选</div>
        </div>

        <!-- 过滤组件 -->
        <div style="flex-grow: 1; width: 100%; overflow: auto">
          <slot />
        </div>

        <div class="menu-box" style="padding: 0">
          <van-button block @click="onReset">重置</van-button>
          <van-button block type="primary" style="margin-left: 8px" @click="onRefresh">确定</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

/**
 * FilterBox 筛选框组件
 * 提供排序和筛选功能
 */

interface SortItem {
  fieldName: string
  showName: string
  asc?: boolean
}

interface Props {
  /** 是否有筛选 */
  hasFilter?: boolean
  /** 排序列表 */
  sortList?: SortItem[]
}

const props = withDefaults(defineProps<Props>(), {
  hasFilter: true,
  sortList: () => []
})

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'reset'): void
  (e: 'sort-change', sortInfo: SortItem): void
}>()

const showFilter = ref(false)
const sortInfoActive = ref<string | undefined>(undefined)

/**
 * 是否支持排序
 */
const supportSort = computed(() => Array.isArray(props.sortList) && props.sortList.length > 0)

/**
 * 确定筛选
 */
function onRefresh() {
  emit('refresh')
  showFilter.value = false
}

/**
 * 重置筛选
 */
function onReset() {
  emit('reset')
  showFilter.value = false
}

/**
 * 排序变化
 * @param sortInfo 排序信息
 */
function onSortChange(sortInfo: SortItem) {
  if (sortInfo.asc == null) {
    sortInfo.asc = true
  } else if (sortInfo.asc === true) {
    sortInfo.asc = false
  } else if (sortInfo.asc === false) {
    sortInfo.asc = true
  }
  if (sortInfo.asc != null) {
    sortInfoActive.value = sortInfo.fieldName
  }
  emit('sort-change', sortInfo)
}
</script>

<style scoped lang="scss">
.filter-box {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background: white;

  .sort-box {
    flex-grow: 1;
    flex-shrink: 1;
    width: 100%;
    height: 40px;
    line-height: 40px;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
  }

  .sort-wrap {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .divider {
    width: 1px;
    height: 18px;
    background: #E8E8E8;
    margin: auto 8px;
  }

  .sort-item {
    display: inline-flex;
    align-items: center;
    margin-right: 8px;
    cursor: pointer;
  }

  .sort-txt {
    font-size: 14px;
    color: #333333;
  }

  .sortActive {
    color: var(--van-primary-color);
  }

  .menu-box {
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 8px;
  }
}
</style>