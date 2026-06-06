export class DictionaryBase<K = any, V = any> extends Map<K, V> {
  showName: string
  [key: string]: any // for dynamic symbol access

  constructor(name: string, dataList: any[], keyId = 'id', symbolId = 'symbol') {
    super()
    this.showName = name
    this.setList(dataList, keyId, symbolId)
  }

  setList(dataList: any[], keyId = 'id', symbolId = 'symbol'): void {
    this.clear()
    if (Array.isArray(dataList)) {
      dataList.forEach((item) => {
        this.set(item[keyId], item)
        if (item[symbolId] != null) {
          (this as any)[item[symbolId]] = item[keyId]
        }
      })
    }
  }

  getList(valueId = 'name', parentIdKey = 'parentId', filter?: (item: any) => boolean): any[] {
    const temp: any[] = []
    this.forEach((value: any, key: K) => {
      let obj: any = {
        id: key,
        name: typeof value === 'string' ? value : value[valueId],
        parentId: value[parentIdKey],
        disabled: value.disabled || false,
      }
      if (typeof value !== 'string') {
        obj = {
          ...value,
          ...obj,
        }
      }
      if (typeof filter !== 'function' || filter(obj)) {
        temp.push(obj)
      }
    })

    return temp
  }

  getValue(id: any, valueId = 'name'): any {
    // 如果id为boolean类型，则自动转换为0和1
    if (typeof id === 'boolean') {
      id = id ? 1 : 0
    }
    return (this.get(id) || ({} as any))[valueId]
  }

  /**
   * 根据ID或symbol获取字典项
   * @param id - 字典项的ID或symbol
   * @returns 字典项对象，未找到返回undefined
   */
  getById(id: any): any {
    // 如果id为boolean类型，则自动转换为0和1
    if (typeof id === 'boolean') {
      id = id ? 1 : 0
    }
    // 先尝试直接通过ID获取
    const item = this.get(id)
    if (item)
      return item
    // 如果没找到，尝试通过symbol获取（symbol存储在类的属性中）
    if (typeof id === 'string' && (this as any)[id] != null) {
      return this.get((this as any)[id])
    }
    return undefined
  }
}
