<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { findTreeNodeObjectPath } from '../utils'

/**
 * CustomCascaderPanel 级联选择面板组件
 * 提供级联选择面板功能
 */

interface TabData {
  id: number
  index: number
  value?: Record<string, unknown>
  checked?: boolean
}

interface Props {
  /** 选择值 */
  value?: unknown[] | string | number
  /** 是否禁用 */
  disabled?: boolean
  /** 组件高度 */
  height?: string
  /** 组件数据 */
  options?: Record<string, unknown>[]
  /** 属性映射 */
  props?: {
    text: string
    value: string
    children: string
    disabled?: string
    leaf?: string
    showCheckbox?: string
    data?: unknown
  }
  /** 过滤函数 */
  filter?: (item: Record<string, unknown>) => boolean
  /** 时间戳 */
  time?: number
}

const props = withDefaults(defineProps<Props>(), {
  value: undefined,
  disabled: false,
  height: undefined,
  options: () => [],
  props: () => ({
    text: 'name',
    value: 'id',
    children: 'children',
    disabled: 'disabled',
    leaf: undefined,
    showCheckbox: undefined,
    data: undefined,
  }),
  filter: undefined,
  time: 0,
})

const emit = defineEmits<{
  (e: 'update:value', value: unknown): void
  (e: 'changeCheck', value: unknown): void
}>()

const activePanel = ref(0)
const tabDataList = ref<TabData[]>([])

/**
 * 计算最终属性映射
 */
const finalProps = computed(() => ({
  text: props.props.text,
  value: props.props.value,
  children: props.props.children,
  disabled: props.props.disabled,
  leaf: props.props.leaf,
  showCheckbox: props.props.showCheckbox,
  data: props.props.data,
}))

/**
 * 当前Tab数据
 */
const currentTabData = computed(() => tabDataList.value[activePanel.value])

/**
 * 选中路径
 */
const selectPath = computed(() => {
  if (props.value == null || Array.isArray(props.value))
    return []
  return findTreeNodeObjectPath(props.options, props.value, finalProps.value.value, finalProps.value.children)
})

/**
 * 选中路径ID列表
 */
const selectPathId = computed(() => (selectPath.value || []).map(item => item[finalProps.value.value]))

/**
 * 检查是否选中
 * @param data 数据项
 */
function isChecked(data: Record<string, unknown>): boolean {
  if (data == null)
    return false
  if (Array.isArray(props.value)) {
    return props.value.includes(data[finalProps.value.value])
  }
  else {
    return props.value === data[finalProps.value.value]
  }
}

/**
 * 点击节点处理
 * @param data 数据项
 */
function onClickNode(data: Record<string, unknown>) {
  if (!hasChild(data) && finalProps.value.showCheckbox != null && !data[finalProps.value.showCheckbox]) {
    emit('update:value', data[finalProps.value.value])
    emit('changeCheck', data[finalProps.value.value])
    if (currentTabData.value) {
      tabDataList.value = tabDataList.value.slice(0, currentTabData.value.index + 1)
    }
  }
}

/**
 * 选择变化处理
 * @param detail 选择详情
 */
function onSelectChange(detail: { value: boolean, name: unknown }) {
  const temp = Array.isArray(props.value) ? [...props.value] : []
  if (detail.value) {
    temp.push(detail.name)
  }
  else {
    const index = temp.indexOf(detail.name)
    if (index !== -1)
      temp.splice(index, 1)
  }
  emit('update:value', temp)
  emit('changeCheck', temp)
}

/**
 * 切换Tab
 * @param index Tab索引
 */
function changeTab(index: number) {
  activePanel.value = index
}

/**
 * 计算选项是否禁用
 * @param data 数据项
 */
function calcItemDisabled(data: Record<string, unknown>): boolean {
  if (props.disabled)
    return true
  if (data == null)
    return false
  if (typeof finalProps.value.disabled === 'function') {
    return finalProps.value.disabled(data)
  }
  else {
    return finalProps.value.disabled == null ? false : Boolean(data[finalProps.value.disabled])
  }
}

/**
 * 检查是否包含子节点
 * @param data 数据项
 */
function hasChild(data: Record<string, unknown>): boolean {
  if (finalProps.value.leaf != null && finalProps.value.leaf !== '')
    return !data[finalProps.value.leaf]
  return Array.isArray(data[finalProps.value.children]) && data[finalProps.value.children].length > 0
}

/**
 * 获取Tab标题
 * @param tabData Tab数据
 */
function getTabItemTitle(tabData: TabData): string | null {
  if (!tabData || tabData.value == null)
    return null
  return String(tabData.value[finalProps.value.text])
}

/**
 * 获取Tab内容列表
 * @param index Tab索引
 */
function getTabContentList(index: number): Record<string, unknown>[] {
  if (index == null)
    return []
  const parentTab = tabDataList.value[index - 1]
  if (!parentTab) {
    return props.options || []
  }
  else {
    if (parentTab.value != null) {
      return (parentTab.value[finalProps.value.children] as Record<string, unknown>[] | undefined) || []
    }
    else {
      return []
    }
  }
}

/**
 * 获取子节点选中数量
 * @param data 数据项
 */
function getChildSelectCount(data: Record<string, unknown>): number | undefined {
  // 简化实现，返回undefined
  return undefined
}

/**
 * 点击内容项右侧箭头
 * @param tabData Tab数据
 * @param data 数据项
 */
function onSelectContentItem(tabData: TabData | undefined, data: Record<string, unknown>) {
  if (!hasChild(data) || !tabData)
    return
  let oldIndex = activePanel.value
  tabData.value = data
  const tempTime = Date.now()
  tabDataList.value = tabDataList.value.slice(0, tabData.index + 1)
  if (Array.isArray(data[finalProps.value.children]) && data[finalProps.value.children].length > 0) {
    tabDataList.value.push({
      id: tempTime,
      index: tabDataList.value.length,
      value: undefined,
      checked: false,
    })
    oldIndex++
  }
  activePanel.value = oldIndex
}

/**
 * 初始化Tab面板
 */
function initTabPanel() {
  activePanel.value = 0
  if (Array.isArray(props.options) && props.options.length > 0) {
    tabDataList.value = [{
      id: Date.now(),
      index: 0,
      value: undefined,
      checked: false,
    }]
  }
  else {
    tabDataList.value = []
  }
}

/**
 * 重置面板
 */
function reset() {
  initTabPanel()
}

// 监听值变化
watch(
  () => props.value,
  () => {
    if (props.value == null || (Array.isArray(props.value) && props.value.length === 0)) {
      initTabPanel()
    }
  },
  { immediate: true },
)

// 监听选项变化
watch(
  () => props.options,
  () => {
    reset()
  },
  { immediate: true },
)

// 暴露方法供父组件调用
defineExpose({
  reset,
})
</script>

<template>
  <div class="cascader-select-panel">
    <van-empty v-if="(tabDataList || []).length <= 0" description="暂无数据" />
    <div v-else class="tabs">
      <div class="tabs_wrap">
        <div class="tabs_nav">
          <div
            v-for="(tabData, index) in tabDataList"
            :key="tabData.id"
            class="tab"
            :class="{ active: index === activePanel, unselected: tabData.value == null }"
            @click="changeTab(index)"
          >
            <div class="tab_text">
              <span class="tab-item">{{ getTabItemTitle(tabData) || '请选择' }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="tabs_content">
        <div class="tab-content-item">
          <van-empty v-if="getTabContentList(currentTabData?.index).length <= 0" description="暂无数据" />
          <div
            v-for="(data, i) in getTabContentList(currentTabData?.index)"
            v-else
            :key="data[finalProps.value]"
            class="cell-item"
            @click="onClickNode(data)"
          >
            <div class="cell_title" style="min-width: 80%">
              <van-checkbox
                v-if="!finalProps.showCheckbox || data[finalProps.showCheckbox]"
                :name="data[finalProps.value]"
                :model-value="isChecked(data)"
                shape="square"
                :disabled="calcItemDisabled(data)"
                @update:model-value="onSelectChange"
              >
                {{ data[finalProps.text] }}
              </van-checkbox>
              <span
                v-else
                :style="{ color: (finalProps.showCheckbox && !data[finalProps.showCheckbox] && selectPathId.includes(data[finalProps.value])) ? '#fa3534' : undefined }"
              >
                {{ data[finalProps.text] }}
              </span>
            </div>
            <div class="cell_value">
              <van-badge v-if="hasChild(data) && getChildSelectCount(data)" :content="getChildSelectCount(data)" />
            </div>
            <van-icon
              v-if="hasChild(data)"
              name="arrow"
              class="icon-wrap"
              :color="(finalProps.showCheckbox != null && !data[finalProps.showCheckbox] && selectPathId.includes(data[finalProps.value])) ? '#fa3534' : undefined"
              @click="onSelectContentItem(currentTabData, data)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cascader-select-panel {
  width: 100%;
  height: 100%;

  .tabs {
    position: relative;

    &_wrap {
      height: 48px;

      .tabs_nav {
        padding-left: 6px !important;
        padding-right: 6px !important;
        overflow-x: auto;
        overflow-y: hidden;
        position: relative;
        display: flex;
        background-color: #fff;
        user-select: none;
        height: 100%;
        padding-bottom: 10px;
        padding-top: 10px;

        .tab {
          position: relative;
          color: #969799;
          font-size: 14px;
          line-height: 20px;
          cursor: pointer;
          flex: none;
          padding: 0 10px;

          &.active {
            color: #323233;
            font-weight: 500;
          }

          &.unselected {
            color: #969799;
            font-weight: normal;
          }

          &_text {
            .tab-item {
              display: inline-block;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              max-width: 30vw;
              min-width: 40px;
              text-align: center;
            }
          }
        }
      }
    }

    &_content {
      padding-top: 15px;
      border-top: 1px solid #F7F7F7;
      height: calc(100% - 64px);
      overflow: auto;

      .tab-content-item {
        flex-shrink: 0;
        width: 100%;
        height: max-content;

        .cell-item {
          display: flex;
          flex-direction: row;
          align-items: center;
          position: relative;
          box-sizing: border-box;
          width: 100%;
          padding: 13px 16px;
          font-size: 14px;
          line-height: 1.5;
          color: #606266;
          background-color: #fff;
          text-align: left;

          .cell_title {
            font-size: 14px;
          }

          .icon-wrap {
            margin-left: 5px;
            color: #969799;
            font-size: 14px;
            display: flex;
            flex-direction: row;
            align-items: center;
            height: 24px;
          }

          .cell_value {
            overflow: hidden;
            text-align: right;
            color: #969799;
            font-size: 13px;
            flex: 1;
          }
        }
      }
    }
  }
}
</style>
