<script setup lang="ts">
import { computed, ref, watch } from 'vue'

/**
 * CustomSelectPanel 自定义选择面板组件
 * 提供单选和多选功能
 */

interface Props {
  /** 选择值 */
  value?: number | string | unknown[]
  /** 是否禁用 */
  disabled?: boolean
  /** 是否多选 */
  multiple?: boolean
  /** 组件高度 */
  height?: string
  /** 列表数据 */
  dataList?: Record<string, unknown>[] | ((pageNum: number) => Promise<{ dataList: unknown[], totalCount: number }>)
  /** 属性映射 */
  props?: {
    text: string
    value: string
    disabled?: string | ((data: Record<string, unknown>) => boolean)
    pageSize?: number
  }
  /** 过滤函数 */
  filter?: (item: Record<string, unknown>) => boolean
}

const props = withDefaults(defineProps<Props>(), {
  value: undefined,
  disabled: false,
  multiple: false,
  height: undefined,
  dataList: () => [],
  props: () => ({
    text: 'text',
    value: 'id',
    disabled: undefined,
    pageSize: 20,
  }),
  filter: undefined,
})

const emit = defineEmits<{
  (e: 'update:value', value: unknown): void
  (e: 'changeCheck', value: unknown): void
}>()

const finalDataList = ref<Record<string, unknown>[]>([])
const status = ref('loadmore')
const pageNum = ref(1)

/**
 * 计算最终属性映射
 */
const finalProps = computed(() => ({
  text: props.props.text,
  value: props.props.value,
  disabled: props.props.disabled,
  pageSize: props.props.pageSize || 20,
}))

/**
 * 计算选项是否禁用
 * @param data 选项数据
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
 * 值变化处理
 * @param val 选择值
 */
function onValueChange(val: unknown) {
  emit('update:value', val)
  emit('changeCheck', val)
}

/**
 * 加载列表数据
 */
async function loadList() {
  if (typeof props.dataList === 'function') {
    try {
      const res = await props.dataList(pageNum.value)
      if (pageNum.value === 1) {
        finalDataList.value = res.dataList
      }
      else {
        finalDataList.value = [...finalDataList.value, ...res.dataList]
      }
      if (res.dataList.length === 0 || res.totalCount <= 0) {
        status.value = 'nomore'
      }
      else {
        status.value = 'loadmore'
      }
    }
    catch (error) {
      console.error('加载列表失败:', error)
    }
  }
  else if (Array.isArray(props.dataList)) {
    finalDataList.value = props.filter
      ? props.dataList.filter(props.filter)
      : props.dataList
  }
}

/**
 * 重置列表
 */
function reset() {
  pageNum.value = 1
  loadList()
}

// 监听数据列表变化
watch(
  () => props.dataList,
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
  <div class="custom-select-panel">
    <div class="select-wrap" :style="{ height }">
      <!-- 多选模式 -->
      <van-checkbox-group
        v-if="multiple"
        :model-value="Array.isArray(value) ? value : []"
        @update:model-value="onValueChange"
      >
        <div
          v-for="item in finalDataList"
          :key="item[finalProps.value]"
          class="cell-item"
        >
          <van-checkbox
            :name="item[finalProps.value]"
            :disabled="calcItemDisabled(item)"
            shape="square"
          >
            {{ item[finalProps.text] }}
          </van-checkbox>
        </div>
      </van-checkbox-group>
      <!-- 单选模式 -->
      <van-radio-group
        v-else
        :model-value="value"
        @update:model-value="onValueChange"
      >
        <div
          v-for="item in finalDataList"
          :key="item[finalProps.value]"
          class="cell-item"
        >
          <van-radio :name="item[finalProps.value]" :disabled="calcItemDisabled(item)">
            {{ item[finalProps.text] }}
          </van-radio>
        </div>
      </van-radio-group>
    </div>
  </div>
</template>

<style scoped lang="less">
.custom-select-panel {
  height: 100%;
  overflow: auto;
}

.select-wrap {
  padding: 0 16px;
}

.cell-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  box-sizing: border-box;
  width: 100%;
  padding: 10px 16px;
  font-size: 14px;
  line-height: 27px;
  color: #606266;
  background-color: #fff;
  text-align: left;
  border-bottom: 1px solid #ebedf0;
}
</style>
