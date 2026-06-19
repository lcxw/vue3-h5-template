<script setup lang="ts">
/**
 * OnlineCustomFilterBox 在线自定义筛选组件
 * 底部弹出式筛选面板，支持排序和筛选功能
 * 遍历 widget 子组件列表，渲染对应的筛选组件
 */
import { computed, inject, ref } from 'vue'
import { SysCustomWidgetType } from '@/staticDict/index'
import { getDictDataList } from '@/views/online/utils'
import OnlineCustomBlock from './OnlineCustomBlock.vue'
import SearchFilter from '../SearchFilter.vue'
import SelectFilter from '../SelectFilter.vue'
import SwitchFilter from '../SwitchFilter.vue'
import DateRangeFilter from '../DateRangeFilter.vue'
import NumberRangeFilter from '../NumberRangeFilter.vue'

interface Props {
  /** 组件配置，包含子组件列表等 */
  widget?: any
  /** 是否支持排序 */
  supportSort?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  widget: undefined,
  supportSort: true,
})

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'reset'): void
}>()

/** 注入表单上下文 */
const formInject = inject<(() => any) | undefined>('form', undefined)

/**
 * 安全获取表单上下文
 */
function form(): any {
  if (formInject == null) return {}
  return formInject() || {}
}

/** 控制筛选弹窗显示 */
const showFilter = ref(false)

/**
 * 获取组件值
 * @param widget 组件信息
 */
function getWidgetValue(widget: any): any {
  return form().getWidgetValue(widget)
}

/**
 * 组件值变更处理
 * @param widget 组件信息
 * @param val 新值
 */
function onWidgetValueChange(widget: any, val: any): void {
  form().onValueChange(widget, val)
}

/**
 * 确定筛选，触发 refresh 事件并关闭弹窗
 */
function onRefresh(): void {
  emit('refresh')
  showFilter.value = false
}

/**
 * 重置筛选，触发 reset 事件并关闭弹窗
 */
function onReset(): void {
  emit('reset')
  showFilter.value = false
}

/**
 * 过滤出可见的子组件列表
 */
const filterWidgetList = computed(() => {
  const list = props.widget?.childWidgetList
  if (!Array.isArray(list)) return []
  return list.filter((w: any) => form().getWidgetVisible(w))
})

/**
 * 获取字典数据列表
 * @param widget 组件配置
 */
function getDictList(widget: any): any[] {
  const dictInfo = widget.props?.dictInfo
  if (dictInfo == null) return []
  const dictCall = getDictDataList(null, dictInfo.dict || dictInfo, form().getDropdownParams?.(widget))
  dictCall.then((res: any[]) => {
    res.forEach((item: any) => {
      item.id = item.id + ''
      if (item.parentId) item.parentId = item.parentId + ''
    })
    return res
  }).catch(() => [])
  return []
}

/**
 * 判断是否为多选筛选
 * @param widget 组件配置
 */
function isMultiSelect(widget: any): boolean {
  if (widget.widgetType === SysCustomWidgetType.MobileCheckBoxFilter) return true
  return false
}
</script>

<template>
  <div class="online-filter-box" :class="{ end: !supportSort }">
    <!-- 排序区域 -->
    <div v-if="supportSort" class="sort-box">
      <slot name="sort" />
    </div>
    <!-- 筛选区域 -->
    <slot name="filter" />
    <div v-if="supportSort" class="divider" />
    <!-- 筛选按钮 -->
    <div class="filter" @click="showFilter = !showFilter">
      <van-icon name="filter-o" size="14" style="margin-right: 2px" />
      筛选
    </div>

    <!-- 过滤弹窗 -->
    <van-popup
      v-model:show="showFilter"
      position="bottom"
      round
      closeable
      :style="{ height: '80%' }"
    >
      <div class="pop-con">
        <div class="top">
          <span>筛选</span>
        </div>
        <div class="main">
          <!-- 默认插槽，支持外部传入自定义筛选内容 -->
          <slot>
            <!-- 根据子组件列表渲染筛选组件 -->
            <template v-for="childWidget in filterWidgetList" :key="childWidget.variableName">
              <!-- 文本搜索筛选 -->
              <SearchFilter
                v-if="childWidget.widgetType === SysCustomWidgetType.MobileInputFilter"
                :label="childWidget.showName"
                :value="getWidgetValue(childWidget)"
                @update:value="(val: any) => onWidgetValueChange(childWidget, val)"
              />
              <!-- 单选/多选筛选 -->
              <SelectFilter
                v-else-if="
                  childWidget.widgetType === SysCustomWidgetType.MobileRadioFilter ||
                  childWidget.widgetType === SysCustomWidgetType.MobileCheckBoxFilter
                "
                :label="childWidget.showName"
                :value="getWidgetValue(childWidget)"
                :data-list="getDictList(childWidget)"
                :multiple="isMultiSelect(childWidget)"
                @update:value="(val: any) => onWidgetValueChange(childWidget, val)"
              />
              <!-- 开关筛选 -->
              <SwitchFilter
                v-else-if="childWidget.widgetType === SysCustomWidgetType.MobileSwitchFilter"
                :label="childWidget.showName"
                :value="getWidgetValue(childWidget)"
                @update:value="(val: any) => onWidgetValueChange(childWidget, val)"
              />
              <!-- 日期范围筛选 -->
              <DateRangeFilter
                v-else-if="childWidget.widgetType === SysCustomWidgetType.MobileDateRangeFilter"
                :label="childWidget.showName"
                :value="getWidgetValue(childWidget)"
                @update:value="(val: any) => onWidgetValueChange(childWidget, val)"
              />
              <!-- 数字范围筛选 -->
              <NumberRangeFilter
                v-else-if="childWidget.widgetType === SysCustomWidgetType.MobileNumberRangeFilter"
                :label="childWidget.showName"
                :value="getWidgetValue(childWidget)"
                @update:value="(val: any) => onWidgetValueChange(childWidget, val)"
              />
              <!-- 其他类型：使用通用渲染块 -->
              <OnlineCustomBlock
                v-else
                :widget-list="[childWidget]"
              />
            </template>
          </slot>
        </div>
        <div class="bottom">
          <van-button block @click="onReset">重置</van-button>
          <van-button block type="primary" @click="onRefresh">确定</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style scoped lang="scss">
.online-filter-box {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  &.end {
    justify-content: flex-end;
  }

  .sort-box {
    flex-grow: 1;
    flex-shrink: 1;
    width: 100px;
    height: 40px;
    line-height: 40px;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
  }

  .divider {
    width: 1px;
    height: 18px;
    background: #e8e8e8;
    margin: auto 8px;
  }

  .filter {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    font-size: 14px;
    color: #333333;
    cursor: pointer;
  }
}

.pop-con {
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;

  .top {
    margin-bottom: 12px;
    text-align: center;

    span {
      width: 100%;
      text-align: center;
      font-size: 14px;
      color: #333333;
    }
  }

  .main {
    flex-grow: 1;
    overflow: auto;
    width: 100%;
  }

  .bottom {
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 8px;
    flex-shrink: 0;
  }
}
</style>
