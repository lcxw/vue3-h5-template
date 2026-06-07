<script setup lang="ts">
/**
 * OnlineCustomWidget 在线自定义组件分发器
 * 根据 widgetType 分发到不同的表单控件，支持递归渲染
 */
import { computed, inject, onMounted, ref } from 'vue'
import { findItemFromList } from '@/utils/index'
import { SysCustomWidgetType, SysOnlineFieldKind, SysOnlineFormType, SysOnlineColumnFilterType } from '@/staticDict/index'
import { getDictDataList } from '@/views/online/utils'
import { isChart } from './utils'
import OnlineCustomGroup from './OnlineCustomGroup.vue'
import OnlineFieldLabel from './OnlineFieldLabel.vue'
import OnlineCustomList from './OnlineCustomList.vue'
import FieldInput from '../FieldInput.vue'
import FieldSelect from '../FieldSelect.vue'
import FieldRadio from '../FieldRadio.vue'
import FieldCheckBox from '../FieldCheckBox.vue'
import FieldSwitch from '../FieldSwitch.vue'
import FieldCalendar from '../FieldCalendar.vue'
import FieldStepper from '../FieldStepper.vue'
import FieldRate from '../FieldRate.vue'
import FieldCascader from '../FieldCascader.vue'
import FieldUpload from '../FieldUpload.vue'
import CustomText from '../CustomText.vue'
import OnlineCustomImage from './OnlineCustomImage.vue'

interface Props {
  /** 组件值 */
  value?: any
  /** 组件配置 */
  widget: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:value', value: any): void
  (e: 'change', value: any, detail?: any): void
}>()

/** 注入表单上下文 */
const formInject = inject<() => any>('form', undefined)

/**
 * 安全获取表单上下文
 */
function form(): any {
  if (formInject == null) return {}
  return formInject() || {}
}

/** 字典数据列表 */
const dictDataList = ref<any[]>([])

/**
 * 判断是否为字典组件
 */
const isDictWidget = computed(() => {
  return [
    SysCustomWidgetType.Radio,
    SysCustomWidgetType.CheckBox,
    SysCustomWidgetType.Select,
    SysCustomWidgetType.Cascader,
    SysCustomWidgetType.Tree,
    SysCustomWidgetType.MobileRadioFilter,
    SysCustomWidgetType.MobileCheckBoxFilter,
  ].includes(props.widget.widgetType)
})

/**
 * 判断是否为只读标签组件
 */
const isLabelWidget = computed(() => {
  const tempList = [
    SysCustomWidgetType.Label,
    SysCustomWidgetType.Input,
    SysCustomWidgetType.Switch,
    SysCustomWidgetType.Radio,
    SysCustomWidgetType.CheckBox,
    SysCustomWidgetType.Select,
    SysCustomWidgetType.Cascader,
    SysCustomWidgetType.Calendar,
    SysCustomWidgetType.Stepper,
    SysCustomWidgetType.Rate,
  ]
  return props.widget.widgetType === SysCustomWidgetType.Label
    || (tempList.includes(props.widget.widgetType) && form().readOnly)
})

/**
 * 获取字段数据类型
 */
const columnDataType = computed(() => {
  if (props.widget == null || props.widget.column == null) return undefined
  switch (props.widget.column.objectFieldType) {
    case 'String': return 'String'
    case 'Date': return 'Date'
    case 'Boolean': return 'Boolean'
    case 'Integer':
    case 'Long':
    case 'Float':
    case 'Double':
    case 'BigDecimal':
      return 'Number'
    default: return undefined
  }
})

/**
 * 是否多选
 */
const multiSelect = computed(() => {
  const nonMultiTypes = [
    SysCustomWidgetType.Select,
    SysCustomWidgetType.Cascader,
    SysCustomWidgetType.Tree,
    SysCustomWidgetType.MobileRadioFilter,
    SysCustomWidgetType.MobileCheckBoxFilter,
  ]
  if (!nonMultiTypes.includes(props.widget.widgetType)) {
    return false
  }
  if (props.widget.widgetType === SysCustomWidgetType.CheckBox) return true
  const formType = form().formType
  if (formType === SysOnlineFormType.QUERY || formType === SysOnlineFormType.ADVANCE_QUERY) {
    return props.widget.column && props.widget.column.filterType === SysOnlineColumnFilterType.MULTI_SELECT_FILTER
  }
  else if (formType === SysOnlineFormType.REPORT) {
    return props.widget.widgetType === SysCustomWidgetType.CheckBox
  }
  else {
    return props.widget.column && props.widget.column.fieldKind === SysOnlineFieldKind.MULTI_SELECT
  }
})

/**
 * 计算绑定值（根据组件类型做值的转换）
 */
const bindValue = computed(() => {
  let tempValue = props.value
  // 开关组件值转换
  if (props.widget.widgetType === SysCustomWidgetType.Switch) {
    const dictInfo = props.widget.column?.dictId
    if ((form().readOnly || props.widget.props?.readOnly) && dictInfo != null) {
      return tempValue
    }
    if (columnDataType.value === 'Number') {
      tempValue = tempValue !== 0 && tempValue != null
    }
    else if (columnDataType.value === 'String') {
      tempValue = tempValue === 'true'
    }
    else if (columnDataType.value !== 'Boolean') {
      tempValue = false
    }
    return tempValue
  }
  // 文本或只读标签
  if (props.widget.widgetType === SysCustomWidgetType.Text || isLabelWidget.value) {
    return (tempValue || props.widget.props?.text || '') + ''
  }
  // 多选值转换
  if (multiSelect.value) {
    if (Array.isArray(tempValue)) return tempValue
    return (tempValue || '').split(',').filter((item: string) => item !== '')
  }
  if (tempValue == null) return tempValue
  // 字典组件值转为字符串
  return isDictWidget.value ? (tempValue + '') : tempValue
})

/**
 * 获取列表组件数据
 */
const listWidgetDataList = computed(() => {
  if (props.widget.widgetType === SysCustomWidgetType.List) {
    if (props.widget.table && props.widget.table.relation) {
      return form().formData[props.widget.table.relation.variableName]
    }
  }
  return undefined
})

/**
 * 获取禁用状态
 */
const disabledStatus = computed(() => {
  try {
    const formAuthData = form().formAuth || null
    if (formAuthData && formAuthData.mobile) {
      const formWidgetAuth = formAuthData.mobile[props.widget.variableName]
      if (formWidgetAuth && formWidgetAuth.disabled) return true
    }
  }
  catch {
    // formAuth 可能不可用
  }
  if (props.widget.eventInfo && typeof props.widget.eventInfo[3] === 'function') {
    // OnlineFormEventType.DISABLE = 3
    return props.widget.eventInfo[3]()
  }
  return (props.widget.props || {}).disabled
})

/**
 * 计算组件属性
 */
const widgetProps = computed(() => {
  const p = { ...(props.widget.props || {}) }
  return {
    ...p,
    disabled: disabledStatus.value,
    clearable: true,
    filterable: true,
    readonly: form().readOnly || p.readonly,
    dataList: dictDataList.value,
    label: props.widget.showName,
    widget: props.widget,
    placeholder: p.placeholder || `请输入${props.widget.showName}`,
  }
})

/**
 * 解析值（根据字段类型转换数据格式）
 * @param val - 原始值
 */
function parseValue(val: any): any {
  if (props.widget.widgetType === SysCustomWidgetType.Switch) {
    if (columnDataType.value === 'Number') {
      return val ? 1 : 0
    }
    else if (columnDataType.value === 'String') {
      return val ? 'true' : 'false'
    }
    else if (columnDataType.value !== 'Boolean') {
      return false
    }
    else {
      return val
    }
  }
  if (props.widget.widgetType === SysCustomWidgetType.Cascader) {
    if (multiSelect.value) {
      return val
    }
    else {
      return Array.isArray(val) ? val[val.length - 1] : val
    }
  }
  return val
}

/**
 * 值输入处理
 * @param val - 输入值
 */
function onValueInput(val: any): void {
  let tempValue = parseValue(val)
  if (multiSelect.value) {
    tempValue = (Array.isArray(tempValue) && tempValue.length > 0) ? tempValue.join(',') : undefined
  }
  emit('update:value', tempValue)
}

/**
 * 值变化处理
 * @param val - 变化值
 * @param selectRow - 选中的行数据
 */
function onValueChange(val: any, selectRow?: any): void {
  let tempVal = parseValue(val)
  let dictData = null
  if (multiSelect.value) {
    dictData = val.map((item: any) => {
      return findItemFromList(dictDataList.value, item, 'id')
    }).filter((item: any) => item != null)
  }
  else {
    dictData = findItemFromList(dictDataList.value, val, 'id')
  }
  emit('change', tempVal, {
    dictData,
    selectRow,
  })
}

/**
 * 加载下拉字典数据
 */
function loadDropdownData(): void {
  if (props.widget == null || !isDictWidget.value) return
  dictDataList.value = []
  if (form().getDictDataList) {
    const dictInfo = (props.widget.props?.dictInfo || {}).dict
    if (dictInfo == null) return
    const dictCall = getDictDataList(null, dictInfo, form().getDropdownParams(props.widget))
    dictCall.then((res: any[]) => {
      res.forEach((item: any) => {
        item.id = item.id + ''
        if (item.parentId) item.parentId = item.parentId + ''
      })
      if (props.widget.eventInfo && typeof props.widget.eventInfo[7] === 'function') {
        // OnlineFormEventType.DROPDOWN_CHANGE = 7
        res = props.widget.eventInfo[7](res)
      }
      dictDataList.value = res
    }).catch(() => {})
  }
}

/**
 * 重置组件
 */
function reset(): void {
  loadDropdownData()
}

// 组件挂载后加载下拉数据并注册到 widgetImplList
onMounted(() => {
  if (props.widget) {
    loadDropdownData()
    if (form().widgetImplList) {
      form().widgetImplList[props.widget.variableName] = { reset }
    }
  }
})

defineExpose({ reset })
</script>

<template>
  <div class="online-custom-widget">
    <!-- 分组容器 -->
    <OnlineCustomGroup
      v-if="widget.widgetType === SysCustomWidgetType.CellGroup"
      :widget="widget"
    />

    <!-- 只读标签 -->
    <OnlineFieldLabel
      v-if="isLabelWidget"
      :value="bindValue"
      :widget="widget"
    />

    <!-- 输入框 -->
    <FieldInput
      v-if="widget.widgetType === SysCustomWidgetType.Input && !form().readOnly"
      :label="widget.showName"
      :required="widget.props?.required"
      :type="widget.props?.type === 'textarea' ? 'textarea' : 'text'"
      :maxlength="(widgetProps.maxlength != null && widgetProps.maxlength > 0) ? widgetProps.maxlength : -1"
      :placeholder="widgetProps.placeholder"
      :value="bindValue"
      :disabled="widgetProps.disabled"
      :readonly="widgetProps.readonly"
      :prop="widget.propString"
      @update:value="onValueInput"
      @change="onValueChange"
    />

    <!-- 下拉选择 -->
    <FieldSelect
      v-if="widget.widgetType === SysCustomWidgetType.Select && !form().readOnly"
      :label="widget.showName"
      :disabled="widgetProps.disabled"
      :placeholder="widgetProps.placeholder"
      :required="widget.props?.required"
      :data-list="dictDataList"
      :multiple="multiSelect"
      :value="bindValue"
      :prop="widget.propString"
      @update:value="onValueInput"
      @change="onValueChange"
    />

    <!-- 单选框 -->
    <FieldRadio
      v-if="widget.widgetType === SysCustomWidgetType.Radio && !form().readOnly"
      :label="widget.showName"
      :value="bindValue"
      :data-list="dictDataList"
      :direction="widgetProps.direction"
      :required="widget.props?.required"
      :disabled="widgetProps.disabled"
      :prop="widget.propString"
      @update:value="onValueInput"
      @change="onValueChange"
    />

    <!-- 复选框 -->
    <FieldCheckBox
      v-if="widget.widgetType === SysCustomWidgetType.CheckBox && !form().readOnly"
      :label="widget.showName"
      :value="bindValue"
      :data-list="dictDataList"
      :direction="widgetProps.direction"
      :required="widget.props?.required"
      :disabled="widgetProps.disabled"
      :prop="widget.propString"
      @update:value="onValueInput"
      @change="onValueChange"
    />

    <!-- 开关 -->
    <FieldSwitch
      v-if="widget.widgetType === SysCustomWidgetType.Switch && !form().readOnly"
      :label="widget.showName"
      :required="widget.props?.required"
      :value="bindValue"
      :disabled="widgetProps.disabled"
      :prop="widget.propString"
      @update:value="onValueInput"
      @change="onValueChange"
    />

    <!-- 日期选择 -->
    <FieldCalendar
      v-if="widget.widgetType === SysCustomWidgetType.Calendar && !form().readOnly"
      :label="widget.showName"
      :required="widget.props?.required"
      :value="bindValue"
      :disabled="widgetProps.disabled"
      :placeholder="widgetProps.placeholder"
      :color="widgetProps.color"
      :prop="widget.propString"
      @update:value="onValueInput"
      @change="onValueChange"
    />

    <!-- 步进器 -->
    <FieldStepper
      v-if="widget.widgetType === SysCustomWidgetType.Stepper && !form().readOnly"
      :label="widget.showName"
      :required="widget.props?.required"
      :step="widgetProps.step || 1"
      :min="widgetProps.min || 0"
      :max="widgetProps.max || 9999"
      :value="bindValue"
      :disabled="widgetProps.disabled"
      :prop="widget.propString"
      @update:value="onValueInput"
      @change="onValueChange"
    />

    <!-- 评分 -->
    <FieldRate
      v-if="widget.widgetType === SysCustomWidgetType.Rate && !form().readOnly"
      :label="widget.showName"
      :count="widgetProps.count"
      :color="widgetProps.color"
      :void-color="widgetProps.voidColor"
      :required="widget.props?.required"
      :value="bindValue"
      :disabled="widgetProps.disabled"
      :prop="widget.propString"
      @update:value="onValueInput"
      @change="onValueChange"
    />

    <!-- 级联选择 -->
    <FieldCascader
      v-if="widget.widgetType === SysCustomWidgetType.Cascader && !form().readOnly"
      :label="widget.showName"
      :data-list="dictDataList"
      :multiple="multiSelect"
      :value="bindValue"
      :required="widget.props?.required"
      :disabled="widgetProps.disabled"
      :placeholder="widgetProps.placeholder"
      :prop="widget.propString"
      @update:value="onValueInput"
      @change="onValueChange"
    />

    <!-- 图片展示 -->
    <OnlineCustomImage
      v-if="widget.widgetType === SysCustomWidgetType.Image && !form().readOnly"
      :value="bindValue"
      :widget="widget"
      :src="widgetProps.src"
      :fit="widgetProps.fit"
      :round="widgetProps.round"
      :width="widgetProps.width || '100%'"
      :height="widgetProps.height || '200px'"
      :radius="widgetProps.radius"
      :form-fn="form"
    />

    <!-- 文件上传 -->
    <FieldUpload
      v-if="widget.widgetType === SysCustomWidgetType.Upload"
      :label="widget.showName"
      :required="widget.props?.required"
      :value="bindValue"
      :disabled="widgetProps.disabled"
      :read-only="widgetProps.readonly"
      :prop="widget.propString"
      :widget="widget"
      :form-fn="form"
      @update:value="onValueInput"
      @change="onValueChange"
    />

    <!-- 列表（一对多从表） -->
    <OnlineCustomList
      v-if="widget.widgetType === SysCustomWidgetType.List"
      :widget="widget"
      :value="listWidgetDataList || []"
      :support-pull-refresh="false"
      @update:value="onValueInput"
      @change="onValueChange"
    />

    <!-- 文本 -->
    <CustomText
      v-if="widget.widgetType === SysCustomWidgetType.Text"
      :value="bindValue"
      :align="widgetProps.align"
      :valign="widgetProps.valign"
      :font-size="widgetProps.fontSize"
      :height="widgetProps.height"
      :padding="widgetProps.padding"
      :font-color="widgetProps.fontColor"
      :font-bold="widgetProps.fontBold"
      :font-italic="widgetProps.fontItalic"
      :is-html="widget.column?.isRichText"
    />
  </div>
</template>

<style scoped>
.online-custom-widget {
  width: 100%;
}
</style>
