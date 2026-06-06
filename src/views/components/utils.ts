/**
 * 组件工具函数
 * 用于替代uni API，提供Web端兼容的方法
 */

import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

/**
 * 获取系统信息（替代uni.getSystemInfoSync）
 * @returns 系统信息对象
 */
export function getSystemInfo(): {
  windowWidth: number
  windowHeight: number
  statusBarHeight: number
} {
  return {
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    statusBarHeight: 0
  }
}

/**
 * 获取边界矩形信息
 * @param windowWidth 窗口宽度
 * @param statusBarHeight 状态栏高度
 * @returns 边界矩形信息
 */
export function getBoundingClientRect(windowWidth: number, statusBarHeight: number): {
  top: number
  left: number
  width: number
  height: number
} {
  return {
    top: 44,
    left: 0,
    width: windowWidth,
    height: 44
  }
}

/**
 * 显示Toast消息（替代uni.showToast）
 * @param title 标题
 * @param icon 图标类型
 */
export function showToast(title: string, icon: 'success' | 'error' | 'none' = 'none'): void {
  // 使用vant的Toast
  import('vant').then(({ showToast }) => {
    showToast({
      message: title,
      position: 'top'
    })
  })
}

/**
 * 显示确认对话框（替代uni.showModal）
 * @param title 标题
 * @param content 内容
 * @returns Promise<boolean>
 */
export function showModal(title: string, content: string): Promise<boolean> {
  return new Promise((resolve) => {
    import('vant').then(({ showDialog }) => {
      showDialog({
        title,
        message: content,
        showCancelButton: true
      }).then(() => {
        resolve(true)
      }).catch(() => {
        resolve(false)
      })
    })
  })
}

/**
 * 从列表中查找项
 * @param list 列表数据
 * @param value 值
 * @param key 键名
 * @returns 找到的项或null
 */
export function findItemFromList<T>(list: T[], value: unknown, key: string): T | null {
  if (!Array.isArray(list)) return null
  return list.find(item => item && (item as Record<string, unknown>)[key] === value) || null
}

/**
 * 遍历树形数据
 * @param treeList 树形数据列表
 * @param callback 回调函数
 */
export function traverseTree<T extends Record<string, unknown>>(
  treeList: T[],
  callback: (node: T) => void,
  childrenKey = 'children'
): void {
  if (!Array.isArray(treeList)) return
  treeList.forEach(node => {
    callback(node)
    const children = node[childrenKey] as T[] | undefined
    if (Array.isArray(children)) {
      traverseTree(children, callback, childrenKey)
    }
  })
}

/**
 * 查找树节点对象路径
 * @param treeList 树形数据列表
 * @param value 值
 * @param valueKey 值键名
 * @param childrenKey 子节点键名
 * @returns 节点路径数组
 */
export function findTreeNodeObjectPath<T extends Record<string, unknown>>(
  treeList: T[],
  value: unknown,
  valueKey: string,
  childrenKey = 'children'
): T[] {
  const result: T[] = []
  
  function findPath(nodes: T[], target: unknown, path: T[]): boolean {
    for (const node of nodes) {
      path.push(node)
      if (node[valueKey] === target) {
        result.push(...path)
        return true
      }
      const children = node[childrenKey] as T[] | undefined
      if (Array.isArray(children) && findPath(children, target, path)) {
        return true
      }
      path.pop()
    }
    return false
  }
  
  findPath(treeList, value, [])
  return result
}

/**
 * 查找树节点
 * @param treeList 树形数据列表
 * @param value 值
 * @param valueKey 值键名
 * @param childrenKey 子节点键名
 * @returns 找到的节点或null
 */
export function findTreeNode<T extends Record<string, unknown>>(
  treeList: T[],
  value: unknown,
  valueKey: string,
  childrenKey = 'children'
): T | null {
  for (const node of treeList) {
    if (node[valueKey] === value) {
      return node
    }
    const children = node[childrenKey] as T[] | undefined
    if (Array.isArray(children)) {
      const found = findTreeNode(children, value, valueKey, childrenKey)
      if (found) return found
    }
  }
  return null
}

/**
 * 树形数据转换
 * @param data 数据列表
 * @param idKey ID键名
 * @param parentKey 父ID键名
 * @param childrenKey 子节点键名
 * @returns 树形数据
 */
export function treeDataTranslate<T extends Record<string, unknown>>(
  data: T[],
  idKey = 'id',
  parentKey = 'parentId',
  childrenKey = 'children'
): T[] {
  const result: T[] = []
  const map: Record<string, T> = {}
  
  // 创建映射
  data.forEach(item => {
    map[String(item[idKey])] = { ...item, [childrenKey]: [] as T[] }
  })
  
  // 构建树
  data.forEach(item => {
    const node = map[String(item[idKey])]
    const parentId = item[parentKey]
    if (parentId && map[String(parentId)]) {
      (map[String(parentId)][childrenKey] as T[]).push(node)
    } else {
      result.push(node)
    }
  })
  
  return result
}

/**
 * 名称转换
 * @param name 名称
 * @param type 类型
 * @returns 转换后的名称
 */
export function nameTranslate(name: string, type: number): string {
  if (!name) return ''
  if (type === 1) {
    return name.charAt(0).toUpperCase() + name.slice(1)
  }
  return name
}

/**
 * 格式化日期值
 * @param value 值
 * @param format 格式
 * @returns dayjs对象
 */
export function formatDateValue(value: string | number | Date, format: string): dayjs.Dayjs {
  if (format === 'timestamp') {
    return dayjs(value)
  } else if (typeof value === 'string') {
    return dayjs(value, format)
  } else {
    return dayjs(value)
  }
}