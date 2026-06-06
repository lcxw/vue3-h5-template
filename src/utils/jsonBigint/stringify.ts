/**
 * JSON 大整数序列化器
 * 支持将 BigNumber 或 BigInt 序列化为 JSON 字符串
 */

import BigNumber from 'bignumber.js'

/** 字符替换表 */
const meta: Record<string, string> = {
  '\b': '\\b',
  '\t': '\\t',
  '\n': '\\n',
  '\f': '\\f',
  '\r': '\\r',
  '"': '\\"',
  '\\': '\\\\'
};

/** 需要转义的字符正则 */
const escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

let gap: string = '';
let indent: string = '';

/**
 * 对字符串进行引号和转义处理
 * @param string - 要处理的字符串
 * @returns 处理后的字符串
 */
function quote(string: string): string {
  escapable.lastIndex = 0;
  return escapable.test(string)
    ? '"' + string.replace(escapable, function (a: string): string {
        const c = meta[a];
        return typeof c === 'string'
          ? c
          : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
      }) + '"'
    : '"' + string + '"';
}

/**
 * 格式化整数，确保至少两位
 * @param n - 数字
 * @returns 格式化后的字符串
 */
function f(n: number): string {
  return n < 10 ? '0' + n : String(n);
}

/**
 * 序列化值
 * @param key - 键名
 * @param holder - 值持有对象
 * @param rep - 替换函数或数组
 * @returns 序列化后的字符串
 */
function str(
  key: string,
  holder: any,
  rep?: ((key: string, value: any) => any) | string[]
): string | undefined {
  let i: number;
  let k: string;
  let v: any;
  let length: number;
  const mind = gap;
  let partial: string[] = [];
  const value = holder[key];
  const isBigNumber =
    value != null && (value instanceof BigNumber || BigNumber.isBigNumber(value));

  // 如果值有 toJSON 方法，调用它
  if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
    value = value.toJSON(key);
  }

  // 如果有替换函数，调用它
  if (typeof rep === 'function') {
    value = rep.call(holder, key, value);
  }

  // 根据值的类型进行处理
  switch (typeof value) {
    case 'string':
      if (isBigNumber) {
        return value;
      } else {
        return quote(value);
      }

    case 'number':
      // JSON 数字必须是有限的
      return isFinite(value) ? String(value) : 'null';

    case 'boolean':
    case 'null':
    case 'bigint':
      // 布尔值、null 和 BigInt 直接转换为字符串
      return String(value);

    case 'object':
      // null 或对象
      if (!value) {
        return 'null';
      }

      gap += indent;
      partial = [];

      // 数组
      if (Object.prototype.toString.apply(value) === '[object Array]') {
        length = value.length;
        for (i = 0; i < length; i += 1) {
          partial[i] = str(String(i), value, rep) || 'null';
        }

        v =
          partial.length === 0
            ? '[]'
            : gap
            ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
            : '[' + partial.join(',') + ']';
        gap = mind;
        return v;
      }

      // 如果替换器是数组，使用它选择成员
      if (rep && typeof rep === 'object') {
        length = rep.length;
        for (i = 0; i < length; i += 1) {
          if (typeof rep[i] === 'string') {
            k = rep[i];
            v = str(k, value, rep);
            if (v) {
              partial.push(quote(k) + (gap ? ': ' : ':') + v);
            }
          }
        }
      } else {
        // 否则遍历所有键
        Object.keys(value).forEach(function (k: string) {
          const v = str(k, value, rep);
          if (v) {
            partial.push(quote(k) + (gap ? ': ' : ':') + v);
          }
        });
      }

      v =
        partial.length === 0
          ? '{}'
          : gap
          ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
          : '{' + partial.join(',') + '}';
      gap = mind;
      return v;

    default:
      return undefined;
  }
}

/**
 * 将值序列化为 JSON 字符串
 * @param value - 要序列化的值
 * @param replacer - 替换函数或键数组
 * @param space - 缩进空格数或字符串
 * @returns JSON 字符串
 */
export function stringify(
  value: any,
  replacer?: ((key: string, value: any) => any) | string[] | null,
  space?: number | string
): string {
  gap = '';
  indent = '';

  // 处理缩进参数
  if (typeof space === 'number') {
    for (i = 0; i < space; i += 1) {
      indent += ' ';
    }
  } else if (typeof space === 'string') {
    indent = space;
  }

  let i: number;

  // 如果有替换器，必须是函数或数组
  const rep = replacer;
  if (
    replacer &&
    typeof replacer !== 'function' &&
    (typeof replacer !== 'object' || typeof replacer.length !== 'number')
  ) {
    throw new Error('JSON.stringify');
  }

  // 返回序列化结果
  return str('', { '': value }, rep) || '';
}

export default stringify;