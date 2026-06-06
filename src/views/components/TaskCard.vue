<script setup lang="ts">
import dayjs from 'dayjs'
import { computed } from 'vue'

/**
 * TaskCard 任务卡片组件
 * 提供任务信息展示功能
 */

interface TaskData {
  title?: string
  description?: string
  status?: string
  statusText?: string
  createTime?: string | Date | number
  assignee?: string
}

interface Props {
  /** 任务数据 */
  data?: TaskData
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'click', data: TaskData): void
}>()

/**
 * 获取状态类型
 * @param status 状态
 */
function getStatusType(status?: string): 'success' | 'primary' | 'warning' | 'danger' | 'default' {
  switch (status) {
    case 'completed':
      return 'success'
    case 'processing':
      return 'primary'
    case 'pending':
      return 'warning'
    case 'failed':
      return 'danger'
    default:
      return 'default'
  }
}

/**
 * 格式化日期
 * @param date 日期值
 */
function formatDate(date?: string | Date | number): string {
  if (!date)
    return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}
</script>

<template>
  <div class="task-card">
    <van-cell-group inset>
      <van-cell :title="data?.title" :label="data?.description">
        <template #value>
          <van-tag :type="getStatusType(data?.status)">
            {{ data?.statusText || '待处理' }}
          </van-tag>
        </template>
      </van-cell>
      <van-cell v-if="data?.createTime" title="创建时间" :value="formatDate(data?.createTime)" />
      <van-cell v-if="data?.assignee" title="负责人" :value="data?.assignee" />
    </van-cell-group>
  </div>
</template>

<style scoped>
.task-card {
  margin-bottom: 16px;
}
</style>
