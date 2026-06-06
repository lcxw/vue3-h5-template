/**
 * 判断路径是否为外部链接
 * @param path - 要检查的路径
 * @returns 是否为外部链接
 */
export function isExternal(path: string) {
  return /^(?:https?:|mailto:|tel:)/.test(path)
}

const pattern = {
  mobie: /^((\+?86)|(\(\+86\)))?(13[0-35-9]\d{8}|15[0-35-9]\d{8}|17[0-35-9]\d{8}|19[0-35-9]\d{8}|18[0235-9]\d{8}|147\d{8}|1349\d{7})$/,
  english: /^[a-z]+$/i,
  englishAndNumber: /^[a-z0-9]+$/i,
}

/** 校验规则 */
export interface ValidateRule {
  required?: boolean
  type?: 'email' | 'integer' | 'number' | 'string'
  pattern?: RegExp
  message?: string
  min?: number
  max?: number
  transform?: (value: any) => any
  trigger?: 'onBlur' | 'onChange' | 'onFocus' | ('onBlur' | 'onChange' | 'onFocus')[]
}

/**
 * 邮箱
 * @param str - 要检查的字符串
 */
export function isEmail(str: string): boolean {
  return /^([\w-])+@([\w-])+((\.[\w-]{2,3}){1,2})$/.test(str)
}

/**
 * 手机号码
 * @param str - 要检查的字符串
 */
export function isMobile(str: string): boolean {
  return pattern.mobie.test(str)
}

/**
 * 电话号码
 * @param str - 要检查的字符串
 */
export function isPhone(str: string): boolean {
  return /^(\d{3,4}-)?\d{7,8}$/.test(str)
}

/**
 * 通用字段校验
 * @param rule - 校验规则
 * @param value - 要校验的值
 * @returns 错误信息，空字符串表示校验通过
 */
export function validate(rule: ValidateRule | null | undefined, value: any): string {
  if (rule == null)
    return ''
  const tempValue = rule.transform ? rule.transform(value) : value
  if (rule.required && (tempValue == null || tempValue === '')) {
    return rule.message || '不能为空!'
  }
  if (rule.pattern && !rule.pattern.test(tempValue)) {
    return rule.message || '格式错误!'
  }
  switch (rule.type) {
    case 'email':
      if (!isEmail(tempValue)) {
        return rule.message || '邮箱格式错误!'
      }
      break
    case 'integer':
      if (!/^-?\d+$/.test(tempValue)) {
        return rule.message || '请输入整数!'
      }
      break
    case 'number':
      if (!/^-?\d+$/.test(tempValue)) {
        return rule.message || '请输入数字!'
      }
      else {
        if (rule.min != null && tempValue < rule.min) {
          return rule.message || '数值太小!'
        }
        if (rule.max != null && tempValue > rule.max) {
          return rule.message || '数值太大!'
        }
      }
      break
    case 'string':
      if (rule.min != null && tempValue.length < rule.min) {
        return rule.message || '长度不足!'
      }
      if (rule.max != null && tempValue.length > rule.max) {
        return rule.message || '超出长度!'
      }
      break
    default:
      break
  }
  return ''
}

/**
 * 校验组件的规则列表
 * @param rules - 校验规则数组
 * @param value - 要校验的值
 * @returns Promise，校验失败时 reject 错误信息
 */
export function validateWidget(rules: ValidateRule[], value: any): Promise<void> {
  return new Promise((resolve, reject) => {
    if (Array.isArray(rules)) {
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i]
        const errorMessage = validate(rule, value)
        if (errorMessage !== '') {
          reject(errorMessage)
          return
        }
      }
    }
    resolve()
  })
}

/** 组件校验规则 mixin（用于 Vue 3 组合式 API 参考） */
export const widgetRuleMixin = {
  props: {
    rules: {
      type: Array as () => ValidateRule[],
      default: () => [],
    },
  },
  data() {
    return {
      errorMessage: '',
    }
  },
  methods: {
    validate(this: { rules: ValidateRule[], value: any, errorMessage: string }) {
      return new Promise<void>((resolve, reject) => {
        if (Array.isArray(this.rules)) {
          for (let i = 0; i < this.rules.length; i++) {
            const rule = this.rules[i]
            this.errorMessage = validate(rule, this.value)
            if (this.errorMessage !== '') {
              reject(this.errorMessage)
              return
            }
          }
          this.errorMessage = ''
          resolve()
        }
      })
    },
    resetField(this: { errorMessage: string }) {
      this.errorMessage = ''
    },
  },
}

/** 表单校验规则 mixin（用于 Vue 3 组合式 API 参考） */
export const formRuleMixin = {
  data() {
    return {
      widgetImplList: [] as any[],
    }
  },
  methods: {
    validateForm(this: { widgetImplList: any[] }) {
      return new Promise<void>((resolve, reject) => {
        if (Array.isArray(this.widgetImplList)) {
          const tempWidgetList = this.widgetImplList.filter((widget) => {
            return widget && widget.$refs.widgetImpl && widget.$refs.widgetImpl.validateWidget
          })
          const tempList = tempWidgetList.map((widget) => {
            return widget.$refs.widgetImpl.validateWidget()
          })
          Promise.all(tempList).then((res) => {
            res.filter((item: string) => item !== '' && item != null).length > 0 ? reject() : resolve()
          }).catch((e: unknown) => {
            reject(e)
          })
        }
        else {
          resolve()
        }
      })
    },
  },
}

export default {
  pattern,
}
