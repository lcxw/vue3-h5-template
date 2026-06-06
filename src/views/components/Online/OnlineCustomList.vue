<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import CustomList from '../CustomList.vue'
import ImageCard from '../ImageCard.vue'

/**
 * OnlineCustomList 在线自定义列表组件
 * 提供在线表单列表展示功能
 */

interface Operation {
  type: number
  name?: string
  enabled?: boolean
}

interface Widget {
  operationList?: Operation[]
  childWidgetList?: unknown[]
  relation?: unknown
  primaryColumnName?: string
}

interface Props {
  /** 数据列表 */
  value?: unknown[]
  /** 组件配置 */
  widget?: Widget
  /** 是否支持下拉刷新 */
  supportPullRefresh?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  value: () => [],
  widget: undefined,
  supportPullRefresh: true,
})

const emit = defineEmits<{
  (e: 'update:value', value: unknown[]): void
  (e: 'change', value: unknown[]): void
}>()

const listRef = ref<InstanceType<typeof CustomList> | null>(null)

/**
 * 获取操作
 * @param type 操作类型
 */
function getOperation(type: number): Operation | undefined {
  if (!props.widget?.operationList)
    return undefined
  return props.widget.operationList.find(op => op.type === type)
}

/**
 * 添加操作
 */
const addOperation = computed(() => getOperation(0))

/**
 * 编辑操作
 */
const editOperation = computed(() => getOperation(1))

/**
 * 删除操作
 */
const deleteOperation = computed(() => getOperation(2))

/**
 * 是否有添加操作
 */
const hasAddOperation = computed(() => addOperation.value?.enabled)

/**
 * 是否有编辑操作
 */
const hasEditOperation = computed(() => editOperation.value?.enabled)

/**
 * 是否有删除操作
 */
const hasDeleteOperation = computed(() => deleteOperation.value?.enabled)

/**
 * 卡片组件配置
 */
const cardWidget = computed(() => {
  if (Array.isArray(props.widget?.childWidgetList) && props.widget.childWidgetList.length > 0) {
    return props.widget.childWidgetList[0]
  }
  return undefined
})

/**
 * 添加点击处理
 */
function onAddClick() {
  // 这里可以触发添加操作
  console.log('添加')
}

/**
 * 编辑点击处理
 * @param data 数据项
 */
function onEditClick(data: unknown) {
  // 这里可以触发编辑操作
  console.log('编辑', data)
}

/**
 * 删除点击处理
 * @param data 数据项
 */
function onDeleteClick(data: unknown) {
  // 这里可以触发删除操作
  const tempList = props.value.filter(item => item !== data)
  emit('update:value', tempList)
  emit('change', tempList)
}

/**
 * 重置列表
 */
function reset() {
  nextTick(() => {
    if (listRef.value) {
      listRef.value.reset()
    }
  })
}

// 监听数据变化
watch(
  () => props.value,
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
  <div class="online-custom-list">
    <van-button
      v-if="hasAddOperation"
      type="success"
      plain
      block
      style="margin-bottom: 12px"
      @click="onAddClick"
    >
      <van-icon name="plus" color="#00AE1C" />
      {{ addOperation?.name || '添加' }}
    </van-button>
    <CustomList
      ref="listRef"
      class="list-box"
      :data-list="value"
      :support-pull-refresh="false"
    >
      <ImageCard
        v-for="(data, i) in value"
        :key="i"
        class="list-item"
        :data="data"
        :widget="cardWidget"
        :parent-widget="widget"
      >
        <template #menu>
          <div
            v-if="hasEditOperation || hasDeleteOperation"
            class="card-menu"
          >
            <van-icon
              v-if="hasDeleteOperation"
              name="delete-o"
              size="14px"
              color="var(--van-danger-color)"
              @click="onDeleteClick(data)"
            />
            <span
              v-if="hasDeleteOperation"
              style="margin-left: 4px; color: var(--van-danger-color)"
              @click="onDeleteClick(data)"
            >
              {{ deleteOperation?.name || '删除' }}
            </span>
            <van-icon
              v-if="hasEditOperation"
              name="edit"
              size="14px"
              color="var(--van-primary-color)"
              style="margin-left: 8px"
              @click="onEditClick(data)"
            />
            <span
              v-if="hasEditOperation"
              style="margin-left: 4px; color: var(--van-primary-color)"
              @click="onEditClick(data)"
            >
              {{ editOperation?.name || '编辑' }}
            </span>
          </div>
        </template>
      </ImageCard>
    </CustomList>
  </div>
</template>

<style scoped>
.online-custom-list {
  padding: 2px 4px;
}

.card-menu {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #D9DBDD;
  padding-top: 10px;
  width: 100%;
}
</style>
