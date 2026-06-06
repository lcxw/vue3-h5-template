<template>
  <div class="online-custom-widget">
    <!-- 根据组件类型渲染不同的组件 -->
    <template v-if="widget?.widgetType">
      <!-- 筛选组件 -->
      <SelectFilter
        v-if="widget.widgetType === 'MobileRadioFilter' || widget.widgetType === 'MobileCheckBoxFilter'"
        :widget="widget"
        :data-list="widgetProps?.dataList || []"
        :label="widget.showName"
        :multiple="widget.widgetType === 'MobileCheckBoxFilter'"
        :value="bindValue"
        @update:value="onValueInput"
        @change="onValueChange"
      />
      <SearchFilter
        v-if="widget.widgetType === 'MobileInputFilter'"
        :label="widget.showName"
        :value="bindValue"
        @update:value="onValueInput"
        @change="onValueChange"
      />
      <SwitchFilter
        v-if="widget.widgetType === 'MobileSwitchFilter'"
        :label="widget.showName"
        :value="bindValue"
        @update:value="onValueInput"
        @change="onValueChange"
      />
      <NumberRangeFilter
        v-if="widget.widgetType === 'MobileNumberRangeFilter'"
        :label="widget.showName"
        :value="bindValue"
        @update:value="onValueInput"
        @change="onValueChange"
      />
      <DateRangeFilter
        v-if="widget.widgetType === 'MobileDateRangeFilter'"
        :widget="widget"
        :label="widget.showName"
        :value="bindValue"
        @update:value="onValueInput"
        @change="onValueChange"
      />
      
      <!-- 字段组件 -->
      <FieldRadio
        v-if="widget.widgetType === 'Radio'"
        :widget="widget"
        :label="widget.showName"
        :value="bindValue"
        :data-list="dictDataList"
        :direction="widgetProps?.direction"
        :required="widget.props?.required"
        :disabled="widgetProps?.disabled"
        :prop="widget.propString"
        @update:value="onValueInput"
        @change="onValueChange"
      />
      <FieldCheckBox
        v-if="widget.widgetType === 'CheckBox'"
        :label="widget.showName"
        :value="bindValue"
        :data-list="dictDataList"
        :direction="widgetProps?.direction"
        :required="widget.props?.required"
        :disabled="widgetProps?.disabled"
        :prop="widget.propString"
        @update:value="onValueInput"
        @change="onValueChange"
      />
      <FieldSelect
        v-if="widget.widgetType === 'Select'"
        :label="widget.showName"
        :disabled="widgetProps?.disabled"
        :placeholder="widgetProps?.placeholder"
        :required="widget.props?.required"
        :data-list="widgetProps?.dataList || []"
        :multiple="widget.widgetType === 'CheckBox'"
        :value="bindValue"
        :prop="widget.propString"
        @update:value="onValueInput"
        @change="onValueChange"
      />
      <FieldCascader
        v-if="widget.widgetType === 'Cascader'"
        :label="widget.showName"
        :data-list="widgetProps?.dataList || []"
        :multiple="widget.widgetType === 'CheckBox'"
        :value="bindValue"
        :required="widget.props?.required"
        :disabled="widgetProps?.disabled"
        :placeholder="widgetProps?.placeholder"
        :prop="widget.propString"
        @update:value="onValueInput"
        @change="onValueChange"
      />
      <FieldInput
        v-if="widget.widgetType === 'Input'"
        :label="widget.showName"
        :required="widget.props?.required"
        :type="widget.props?.type === 'textarea' ? 'textarea' : 'text'"
        :maxlength="widgetProps?.maxlength"
        :placeholder="widgetProps?.placeholder"
        :value="bindValue"
        :disabled="widgetProps?.disabled"
        :readonly="widgetProps?.readonly"
        :prop="widget.propString"
        @update:value="onValueInput"
        @change="onValueChange"
      />
      <FieldSwitch
        v-if="widget.widgetType === 'Switch'"
        :label="widget.showName"
        :required="widget.props?.required"
        :value="bindValue"
        :disabled="widgetProps?.disabled"
        :prop="widget.propString"
        @update:value="onValueInput"
        @change="onValueChange"
      />
      <FieldCalendar
        v-if="widget.widgetType === 'Calendar'"
        :widget="widget"
        :label="widget.showName"
        :required="widget.props?.required"
        :color="widgetProps?.color"
        :value="bindValue"
        :disabled="widgetProps?.disabled"
        :placeholder="widgetProps?.placeholder"
        :prop="widget.propString"
        @update:value="onValueInput"
        @change="onValueChange"
      />
      <FieldStepper
        v-if="widget.widgetType === 'Stepper'"
        :widget="widget"
        :label="widget.showName"
        :required="widget.props?.required"
        :step="widgetProps?.step || 1"
        :min="widgetProps?.min || 0"
        :max="widgetProps?.max || 9999"
        :value="bindValue"
        :disabled="widgetProps?.disabled"
        :prop="widget.propString"
        @update:value="onValueInput"
        @change="onValueChange"
      />
      <FieldRate
        v-if="widget.widgetType === 'Rate'"
        :label="widget.showName"
        :count="widgetProps?.count"
        :color="widgetProps?.color"
        :void-color="widgetProps?.voidColor"
        :required="widget.props?.required"
        :value="bindValue"
        :disabled="widgetProps?.disabled"
        :prop="widget.propString"
        @update:value="onValueInput"
        @change="onValueChange"
      />
      
      <!-- 图片和文本组件 -->
      <CustomImage
        v-if="widget.widgetType === 'Image'"
        :value="bindValue"
        :widget="widget"
        :src="widgetProps?.src"
        :fit="widgetProps?.fit"
        :round="widgetProps?.round"
        :width="widgetProps?.width"
        :height="widgetProps?.height"
        :radius="widgetProps?.radius"
      />
      <CustomText
        v-if="widget.widgetType === 'Text'"
        :value="bindValue"
        :align="widgetProps?.align"
        :valign="widgetProps?.valign"
        :font-size="widgetProps?.fontSize"
        :height="widgetProps?.height"
        :padding="widgetProps?.padding"
        :font-color="widgetProps?.fontColor"
        :font-bold="widgetProps?.fontBold"
        :font-italic="widgetProps?.fontItalic"
        :is-html="widget.column?.isRichText"
      />
      
      <!-- 图表组件 -->
      <BarChart
        v-if="widget.widgetType === 'BarChart'"
        :widget="widget"
        :value="bindValue"
        :data="widgetProps?.data"
        :options="widgetProps?.options"
      />
      <PieChart
        v-if="widget.widgetType === 'PieChart'"
        :widget="widget"
        :value="bindValue"
        :data="widgetProps?.data"
        :options="widgetProps?.options"
      />
      <LineChart
        v-if="widget.widgetType === 'LineChart'"
        :widget="widget"
        :value="bindValue"
        :data="widgetProps?.data"
        :options="widgetProps?.options"
      />
      
      <!-- 签名组件 -->
      <SignaturePad
        v-if="widget.widgetType === 'Signature'"
        :label="widget.showName"
        :value="bindValue"
        :required="widget.props?.required"
        :disabled="widgetProps?.disabled"
        :height="widget.props?.height"
        :prop="widget.propString"
        @update:value="onValueInput"
        @change="onValueChange"
      />
      
      <!-- 条形码和二维码组件 -->
      <FieldBarCode
        v-if="widget.widgetType === 'BARCODE'"
        :label="widget.showName"
        :value="bindValue"
        :text="widget.props?.text"
      />
      <FieldQRcode
        v-if="widget.widgetType === 'QRCODE'"
        :label="widget.showName"
        :value="bindValue"
      />
      
      <!-- 视频组件 -->
      <FieldVideo
        v-if="widget.widgetType === 'Video'"
        :label="widget.showName"
        :value="bindValue"
        :required="widget.props?.required"
        :disabled="widgetProps?.disabled"
        :prop="widget.propString"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import SelectFilter from '../SelectFilter.vue'
import SearchFilter from '../SearchFilter.vue'
import SwitchFilter from '../SwitchFilter.vue'
import NumberRangeFilter from '../NumberRangeFilter.vue'
import DateRangeFilter from '../DateRangeFilter.vue'
import FieldRadio from '../FieldRadio.vue'
import FieldCheckBox from '../FieldCheckBox.vue'
import FieldSelect from '../FieldSelect.vue'
import FieldCascader from '../FieldCascader.vue'
import FieldInput from '../FieldInput.vue'
import FieldSwitch from '../FieldSwitch.vue'
import FieldCalendar from '../FieldCalendar.vue'
import FieldStepper from '../FieldStepper.vue'
import FieldRate from '../FieldRate.vue'
import CustomImage from '../CustomImage.vue'
import CustomText from '../CustomText.vue'
import BarChart from '../Charts/BarChart.vue'
import PieChart from '../Charts/PieChart.vue'
import LineChart from '../Charts/LineChart.vue'
import SignaturePad from '../SignaturePad/index.vue'
import FieldBarCode from '../FieldBarCode.vue'
import FieldQRcode from '../FieldQRcode.vue'
import FieldVideo from '../FieldVideo.vue'

/**
 * OnlineCustomWidget 在线自定义组件
 * 根据组件类型动态渲染不同的组件
 */

interface Widget {
  widgetType: string
  showName?: string
  props?: Record<string, unknown>
  propString?: string
  column?: {
    isRichText?: boolean
    fieldType?: string
    objectFieldType?: string
  }
  eventInfo?: Record<string, unknown>
}

interface Props {
  /** 组件值 */
  value?: string | number | boolean | Date | unknown[] | Record<string, unknown>
  /** 组件配置 */
  widget?: Widget
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:value', value: unknown): void
  (e: 'change', value: unknown, extra?: unknown): void
}>()

const dictDataList = ref<Record<string, unknown>[]>([])

/**
 * 计算组件属性
 */
const widgetProps = computed(() => {
  return {
    ...props.widget?.props,
    dataList: dictDataList.value,
    disabled: false,
    readonly: false,
    clearable: true,
    filterable: true
  }
})

/**
 * 计算绑定值
 */
const bindValue = computed(() => {
  return props.value
})

/**
 * 值输入处理
 * @param val 输入值
 */
function onValueInput(val: unknown) {
  emit('update:value', val)
}

/**
 * 值变化处理
 * @param val 变化值
 * @param extra 额外信息
 */
function onValueChange(val: unknown, extra?: unknown) {
  emit('change', val, extra)
}

/**
 * 加载下拉数据
 */
function loadDropdownData() {
  // 这里可以调用API获取字典数据
  // 简化实现，使用空数组
  dictDataList.value = []
}

/**
 * 重置组件
 */
function reset() {
  loadDropdownData()
}

// 组件挂载后加载下拉数据
onMounted(() => {
  if (props.widget) {
    loadDropdownData()
  }
})

// 暴露方法供父组件调用
defineExpose({
  reset
})
</script>

<style scoped>
.online-custom-widget {
  width: 100%;
}
</style>