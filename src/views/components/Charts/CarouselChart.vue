<script setup lang="ts">
/**
 * CarouselChart 轮播图组件
 * 提供图片轮播展示功能
 */
import { computed, ref, watch } from 'vue'

interface Props {
  /** 图表数据 */
  data?: Record<string, unknown>[] | Record<string, unknown>
  /** 图表高度 */
  height?: string
  /** 图表配置 */
  options?: Record<string, unknown>
  /** 组件配置 */
  widget?: Record<string, unknown>
  /** 图片路径字段 */
  imagePath?: Record<string, unknown>[]
  /** 图片名称字段 */
  imageName?: Record<string, unknown>[]
}

const props = withDefaults(defineProps<Props>(), {
  data: undefined,
  height: undefined,
  options: undefined,
  widget: undefined,
  imagePath: () => [],
  imageName: () => [],
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

/** 是否准备就绪 */
const ready = ref(false)

/**
 * 获取列值
 * @param row 行数据
 * @param columnNameList 列名列表
 */
function getColumnValue(row: Record<string, any>, columnNameList: string | string[]): any {
  if (Array.isArray(columnNameList)) {
    let dataValue = columnNameList.length > 0 ? row : undefined
    for (let i = 0; i < columnNameList.length; i++) {
      const name = columnNameList[i]
      if (name == null || dataValue == null) {
        dataValue = undefined
        break
      }
      const dictName = `${name}__DictMap`
      const current = dataValue as Record<string, any>
      dataValue = current[dictName] ? (current[dictName] as Record<string, any>).name : current[name]
    }
    return dataValue
  }
  else {
    const columnName = columnNameList
    const dictName = `${columnName}__DictMap`
    return row[dictName] ? (row[dictName] as Record<string, any>).name : row[columnName]
  }
}

/**
 * 获取图片列值
 * @param data 数据
 * @param columnList 列配置列表
 */
function getImageColumnValue(data: Record<string, unknown>, columnList: Record<string, unknown>[]): unknown {
  if (columnList && columnList.length > 0) {
    return getColumnValue(data, columnList[0].columnName as string)
  }
  return undefined
}

/** 标题 */
const title = computed(() => {
  const opts = props.options as Record<string, any> | undefined
  if (opts == null || opts.title == null || !opts.title.show) return undefined
  return opts ? opts.title.text : undefined
})

/** 轮播数量 */
const carouselCount = computed(() => {
  if (Array.isArray(props.data)) {
    const opts = props.options as Record<string, any> | undefined
    return (opts && props.data.length >= (opts.pageParam?.pageSize || 10))
      ? opts.pageParam.pageSize
      : props.data.length
  }
  return 1
})

/** 轮播数据 */
const carouselData = computed(() => {
  const temp: { image: unknown, title: unknown }[] = []
  if (Array.isArray(props.data) && props.data.length > 0) {
    props.data.filter((_dataItem, index) => {
      if (index < carouselCount.value) {
        const dataRow = (props.data as Record<string, unknown>[])[index]
        temp.push({
          image: getImageColumnValue(dataRow, props.imagePath),
          title: getImageColumnValue(dataRow, props.imageName),
        })
      }
    })
  }
  else if (props.data && !Array.isArray(props.data)) {
    const imgVal = getImageColumnValue(props.data as Record<string, any>, props.imagePath)
    const nameVal = getImageColumnValue(props.data as Record<string, any>, props.imageName)
    if (imgVal && nameVal) {
      temp.push({ image: imgVal, title: nameVal })
    }
  }
  return temp
})

/**
 * 点击事件
 */
function onTableClick() {
  emit('click')
}

/** 构建数据定时器 */
let buildDataTimer: ReturnType<typeof setTimeout> | null = null

/**
 * 构建渲染信息
 */
function buildTableInfo() {
  if (buildDataTimer != null) clearTimeout(buildDataTimer)
  ready.value = false
  buildDataTimer = setTimeout(() => {
    buildDataTimer = null
    ready.value = true
  }, 50)
}

// 监听数据和配置变化
watch(() => props.data, () => { buildTableInfo() }, { immediate: true })
watch(() => props.options, () => { buildTableInfo() }, { deep: true, immediate: true })
</script>

<template>
  <div class="carousel-chart" @click.stop="onTableClick">
    <div
      v-if="title != null && title !== ''"
      class="title"
      :style="{
        color: (options as any)?.title?.textStyle?.color,
        fontSize: (options as any)?.title?.textStyle?.fontSize + 'px',
        fontWeight: (options as any)?.title?.bold ? 600 : undefined,
        textAlign: (options as any)?.title?.left,
        fontStyle: (options as any)?.title?.italics ? 'italic' : undefined,
      }"
    >
      {{ title }}
    </div>
    <div v-if="ready && carouselData.length > 0" class="carousel-box">
      <van-swipe :autoplay="3000" indicator-color="white">
        <van-swipe-item v-for="(item, index) in carouselData" :key="index">
          <van-image :src="String(item.image || '')" fit="cover" width="100%" height="200px" />
          <div v-if="item.title" class="carousel-text">{{ item.title }}</div>
        </van-swipe-item>
      </van-swipe>
    </div>
  </div>
</template>

<style scoped lang="less">
.carousel-chart {
  display: flex;
  flex-direction: column;
  background: white;

  .title {
    padding: 10px 4px;
    flex-grow: 0;
    flex-shrink: 0;
  }

  .carousel-box {
    width: 100%;

    .carousel-text {
      padding: 8px 16px;
      font-size: 14px;
      color: #333;
      background: rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
