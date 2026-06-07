import dayjs from 'dayjs'
import JSEncrypt from 'jsencrypt'
import { showDialog, showToast } from 'vant'
import projectConfig from '@/config'
import 'vant/es/dialog/style'
import 'vant/es/toast/style'

const publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCpC4QMnbTrQOFriJJCCFFWhlruBJThAEBfRk7pRx1jsAhyNVL3CqJb0tRvpnbCnJhrRAEPdgFHXv5A0RrvFp+5Cw7QoFH6O9rKB8+0H7+aVQeKITMUHf/XMXioymw6Iq4QfWd8RhdtM1KM6eGTy8aU7SO2s69Mc1LXefg/x3yw6wIDAQAB'

export function encrypt(value: string): string | null {
  if (value == null || value === '') return null
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey)
  const encrypted = encryptor.encrypt(value)
  return encrypted ? encodeURIComponent(encrypted) : null
}

export function getToken(): string | null {
  try {
    // 先尝试从 'token' key 获取
    const token = localStorage.getItem('token')
    console.log(`getToken: from 'token' key: ${token}`)
    if (token && token !== '') return token

    // 如果没有，从 userInfo.data.tokenData 获取
    const userInfoStr = localStorage.getItem('userInfo')
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null
    console.log(`getToken: userInfo exists: ${!!userInfo}`)
    if (userInfo) {
      const data = userInfo.data || userInfo
      const tokenData = data.tokenData || null
      console.log(`getToken: from userInfo.data.tokenData: ${tokenData}`)
      if (tokenData && tokenData !== '') {
        // 同时设置到 'token' key，方便下次获取
        localStorage.setItem('token', tokenData)
        return tokenData
      }
    }
    return null
  }
  catch (e) {
    console.error('getToken error:', e)
    return null
  }
}

export function setToken(token: string | null): void {
  if (token == null || token === '') {
    localStorage.removeItem('token')
  }
  else {
    localStorage.setItem('token', token)
  }
}

export function getAppId(): string | undefined {
  const appId = localStorage.getItem('appId')
  return appId != null ? appId : undefined
}

export function setAppId(appId: string | null): void {
  if (appId == null || appId === '') {
    localStorage.removeItem('appId')
  }
  else {
    localStorage.setItem('appId', appId)
  }
}

export function treeDataTranslate(
  data: Record<string, any>[],
  id: string = 'id',
  pid: string = 'parentId',
): Record<string, any>[] {
  const res: Record<string, any>[] = []
  const temp: Record<string, any> = {}
  for (let i = 0; i < data.length; i++) {
    temp[data[i][id]] = data[i]
  }
  for (let k = 0; k < data.length; k++) {
    if (temp[data[k][pid]] && data[k][id] !== data[k][pid]) {
      if (!temp[data[k][pid]].children) {
        temp[data[k][pid]].children = []
      }
      if (!temp[data[k][pid]]._level) {
        temp[data[k][pid]]._level = 1
      }
      data[k]._level = temp[data[k][pid]]._level + 1
      data[k]._parent = data[k][pid]
      temp[data[k][pid]].children.push(data[k])
    }
    else {
      res.push(data[k])
    }
  }
  return res
}

export function setObjectToSessionStorage(key: string, value: any): boolean {
  if (key == null || key === '') return false
  if (value == null) {
    localStorage.removeItem(key)
    return true
  }
  else {
    try {
      localStorage.setItem(key, JSON.stringify({ data: value }))
      return true
    }
    catch {
      return false
    }
  }
}

export function getObjectFromSessionStorage(key: string): any {
  if (key == null || key === '') return null
  try {
    const raw = localStorage.getItem(key)
    if (raw != null && raw !== '') {
      const jsonObj = JSON.parse(raw)
      return (jsonObj || {}).data
    }
  }
  catch {
    return null
  }
}

export function objectToQueryString(params: Record<string, any> | null | undefined): string | null {
  if (params == null) {
    return null
  }
  else {
    return Object.keys(params).map((key) => {
      if (params[key] !== undefined) {
        return `${key}=${params[key]}`
      }
      else {
        return undefined
      }
    }).filter(item => item != null).join('&')
  }
}

export function getHeadImageUrl(userInfo: Record<string, any> | null): string | null {
  if (userInfo == null || userInfo.headImageUrl == null) return null
  let url: any
  let params: Record<string, any> | undefined
  try {
    url = JSON.parse(userInfo.headImageUrl)
    const token = localStorage.getItem('token')
    if (Array.isArray(url)) {
      url = url[0]
      params = {
        filename: url.filename,
        Authorization: token,
      }
      url = url.downloadUri
    }
    else {
      url = null
    }
  }
  catch {
    url = null
  }
  if (url != null) {
    url = buildGetUrl(url, params)
  }
  return url
}

export function buildGetUrl(actionName: string, params?: Record<string, any>): string {
  const queryString = objectToQueryString(params)
  if (actionName != null && actionName !== '') {
    if (actionName.charAt(0) === '/') actionName = actionName.substring(1)
  }

  if (actionName.startsWith('http://') || actionName.startsWith('https://')) {
    return actionName + (queryString == null ? '' : `?${queryString}`)
  }
  else {
    const base = projectConfig.baseUrl
    const separator = base.endsWith('/') ? '' : '/'
    return base + separator + actionName + (queryString == null ? '' : `?${queryString}`)
  }
}

export function formatDate(date: string | number | Date, formatString: string): string {
  return dayjs(date).format(formatString)
}

/**
 * 从数组中查找某一项
 * @param list 要查找的数组
 * @param id 要查找的节点 id
 * @param idKey 主键字段名（如果为 null 则直接比较）
 * @param removeItem 是否从数组中移除查找到的节点
 * @returns 找到返回节点，没找到返回 null
 */
export function findItemFromList<T = any>(
  list: T[],
  id: any,
  idKey?: string | null,
  removeItem: boolean = false,
): T | T[] | null {
  if (Array.isArray(list) && list.length > 0 && (id != null || id !== undefined)) {
    if (Array.isArray(id)) {
      const idSet = new Set(id)
      const tempList = list.filter((item: any) => idSet.has(item[idKey!]))
      return tempList
    }
    else {
      for (let i = 0; i < list.length; i++) {
        const item = list[i] as any
        if (((idKey == null || idKey === '') && item === id) || (idKey != null && item[idKey] === id)) {
          if (removeItem) list.splice(i, 1)
          return item
        }
      }
    }
  }
  return null
}

export function megerList<T = any>(list1: T[], list2: T[], idKey: string = 'id'): T[] {
  const temp: Record<string, T> = {}
  if (idKey != null && idKey !== '') {
    if (Array.isArray(list1)) {
      list1.forEach((item: any) => {
        temp[item[idKey]] = item
      })
    }
    if (Array.isArray(list2)) {
      list2.forEach((item: any) => {
        temp[item[idKey]] = item
      })
    }
  }
  return Object.keys(temp).reduce((retObj: T[], key) => {
    if (temp[key] != null) {
      retObj.push(temp[key])
    }
    return retObj
  }, [])
}

/**
 * 通过 id 从树中获取指定的节点（内部递归函数）
 */
function findNode(
  node: Record<string, any>,
  id: any,
  list: Record<string, any>[] | undefined,
  idKey: string = 'id',
  childKey: string = 'children',
): Record<string, any> | undefined {
  if (Array.isArray(list)) list.push(node)
  if (node[idKey] === id) {
    return node
  }

  if (node[childKey] != null && Array.isArray(node[childKey])) {
    for (let i = 0; i < node[childKey].length; i++) {
      const tempNode = findNode(node[childKey][i], id, list, idKey, childKey)
      if (tempNode) return tempNode
    }
  }

  if (Array.isArray(list)) list.pop()
  return undefined
}

/**
 * 通过 id 返回从根节点到指定节点的路径
 * @param treeRoot 树根节点数组
 * @param id 要查询的节点的 id
 * @param idKey 主键字段名
 * @param childKey 子节点字段名
 */
export function findTreeNodeObjectPath(
  treeRoot: Record<string, any>[],
  id: any,
  idKey: string = 'id',
  childKey: string = 'children',
): Record<string, any>[] {
  const tempList: Record<string, any>[] = []
  for (let i = 0; i < treeRoot.length; i++) {
    if (findNode(treeRoot[i], id, tempList, idKey, childKey)) {
      return tempList
    }
  }
  return []
}

/**
 * 通过 id 从树中查找节点
 * @param treeRoot 根节点数组
 * @param id 要查找的节点的 id
 * @param idKey 主键字段名
 * @param childKey 子节点字段名
 */
export function findTreeNode(
  treeRoot: Record<string, any>[],
  id: any,
  idKey: string = 'id',
  childKey: string = 'children',
): Record<string, any> | undefined {
  for (let i = 0; i < treeRoot.length; i++) {
    const tempNode = findNode(treeRoot[i], id, undefined, idKey, childKey)
    if (tempNode) return tempNode
  }
  return undefined
}

/**
 * 深度遍历树节点
 */
export function traverseTree(
  root: Record<string, any> | Record<string, any>[],
  callback: (node: Record<string, any>) => void,
  childKey: string = 'children',
): void {
  function traverseNode(node: Record<string, any>): void {
    if (typeof callback === 'function') callback(node)
    if (Array.isArray(node[childKey])) {
      node[childKey].forEach((subNode: Record<string, any>) => {
        traverseNode(subNode)
      })
    }
  }

  if (Array.isArray(root)) {
    root.forEach((node) => {
      traverseNode(node)
    })
  }
}

/**
 * 大小驼峰变换函数
 * @param name 要转换的字符串
 * @param type 转换的类型 0：转换成小驼峰，1：转换成大驼峰
 */
export function nameTranslate(name: string, type: number): string {
  name = name.toLowerCase()
  let nameArray = name.split('_')
  nameArray.forEach((item, index) => {
    if (index === 0) {
      name = type === 1 ? item.charAt(0).toUpperCase() + item.slice(1) : item
    }
    else {
      name = name + item.charAt(0).toUpperCase() + item.slice(1)
    }
  })

  nameArray = name.split('-')
  nameArray.forEach((item, index) => {
    if (index === 0) {
      name = type === 1 ? item.charAt(0).toUpperCase() + item.slice(1) : item
    }
    else {
      name = name + item.charAt(0).toUpperCase() + item.slice(1)
    }
  })
  return name
}

export interface MenuButtonRect {
  top: number
  left: number
  width: number
  height: number
  isType: string
}

export function getBoundingClientRect(windowWidth: number, statusBarHeight: number): MenuButtonRect {
  const rect: MenuButtonRect = {
    top: 25,
    left: 0,
    width: windowWidth,
    height: statusBarHeight,
    isType: 'H5',
  }
  return rect
}

export function isObject(obj: any): obj is Record<string, any> {
  return obj != null && typeof obj === 'object' && Array.isArray(obj) === false
}

function copyObject<T>(obj: T): T {
  if (obj == null) return obj
  if (Array.isArray(obj)) {
    return obj.map((item: any) => copyObject(item)) as unknown as T
  }
  else if (isObject(obj)) {
    return Object.keys(obj).reduce((tempObj: Record<string, any>, key: string) => {
      tempObj[key] = copyObject((obj as Record<string, any>)[key])
      return tempObj
    }, {}) as unknown as T
  }
  else {
    return obj
  }
}

export function deepMerge<T = any>(obj1: T, obj2: T): T {
  const tempObj = copyObject(obj1) as Record<string, any>
  if (obj2 != null) {
    Object.keys(obj2 as Record<string, any>).forEach((key) => {
      const val2 = (obj2 as Record<string, any>)[key]
      const val1 = tempObj[key]
      console.log(key, val1, val2)
      if (isObject(val2)) {
        if (isObject(val1)) {
          tempObj[key] = deepMerge(val1, val2)
        }
        else {
          tempObj[key] = copyObject(val2)
        }
      }
      else if (Array.isArray(val2)) {
        if (Array.isArray(val1)) {
          tempObj[key] = val2.map((arrVal2: any, index: number) => {
            const arrVal1 = val1[index]
            return deepMerge(arrVal1, arrVal2)
          })
        }
        else {
          console.log(key, val2)
          tempObj[key] = copyObject(val2)
        }
      }
      else {
        tempObj[key] = val2
      }
    })
  }
  return tempObj as T
}

function getDataType(data: any): string {
  const temp = Object.prototype.toString.call(data)
  const type = temp.match(/\b\w+\b/g)
  return (type!.length < 2) ? 'Undefined' : type![1]
}

/**
 * 判断两个对象是否不同
 */
export function isObjectChanged(source: any, comparison: any): boolean {
  const iterable = (data: any): boolean => ['Object', 'Array'].includes(getDataType(data))
  if (!iterable(source)) {
    throw new Error(`source should be a Object or Array , but got ${getDataType(source)}`)
  }

  if (getDataType(source) !== getDataType(comparison)) {
    return true
  }

  const sourceKeys = Object.keys(source)
  const comparisonKeys = Object.keys({ ...source, ...comparison })

  if (sourceKeys.length !== comparisonKeys.length) {
    return true
  }

  return comparisonKeys.some((key) => {
    if (iterable(source[key])) {
      return isObjectChanged(source[key], comparison[key])
    }
    else {
      return source[key] !== comparison[key]
    }
  })
}

export interface RuleItem {
  required?: boolean
  [key: string]: any
}

export function isRequired(rulesItem: RuleItem | RuleItem[] | null | undefined): boolean {
  if (rulesItem) {
    if (rulesItem instanceof Array) {
      let required = false
      for (let i = 0; i < rulesItem.length; i++) {
        if (rulesItem[i].required) {
          required = rulesItem[i].required!
          break
        }
      }
      return required
    }
    else {
      return rulesItem.required || false
    }
  }
  else {
    return false
  }
}

export function showConfirm(content: string, title: string = '提示'): Promise<void> {
  return new Promise((resolve, reject) => {
    showDialog({
      title,
      message: content,
    }).then(() => {
      resolve()
    }).catch(() => {
      reject()
    })
  })
}

export function showMessage(title: string, _type: string = 'none'): Promise<void> {
  return new Promise((resolve) => {
    showToast({
      message: title,
      duration: 2000,
    })
    resolve()
  })
}

/**
 * 清理所有存储数据
 * 包括：localStorage, sessionStorage
 */
export function clearAllStorage(): void {
  try {
    localStorage.clear()
    console.log('clearAllStorage: localStorage 已清空')
  }
  catch (e) {
    console.error('clearAllStorage: 清理 localStorage 失败', e)
  }

  try {
    sessionStorage.clear()
    console.log('clearAllStorage: sessionStorage 已清空')
  }
  catch (e) {
    console.error('clearAllStorage: 清理 sessionStorage 失败', e)
  }
}
