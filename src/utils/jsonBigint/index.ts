/**
 * JSON 大整数处理工具
 * 提供支持大整数（超过 JavaScript Number 安全范围）的 JSON 解析和序列化功能
 */

import { parse, ParseOptions } from './parse';
import { stringify } from './stringify';

/** JSON 大整数处理实例选项 */
interface JsonBigintOptions extends ParseOptions {
  /** 序列化时的缩进 */
  space?: number | string;
}

/**
 * 创建 JSON 大整数处理实例
 * @param options - 配置选项
 * @returns 包含 parse 和 stringify 方法的对象
 */
export function createJsonBigint(options: JsonBigintOptions = {}): {
  parse: (text: string, reviver?: (this: any, key: string, value: any) => any) => any;
  stringify: (value: any, replacer?: ((key: string, value: any) => any) | string[] | null, space?: number | string) => string;
} {
  return {
    /**
     * 解析 JSON 文本，支持大整数
     * @param text - JSON 文本
     * @param reviver - 转换函数（可选）
     * @returns 解析后的对象
     */
    parse: (text: string, reviver?: (this: any, key: string, value: any) => any) => {
      return parse(text, reviver, options);
    },
    /**
     * 序列化值为 JSON 字符串
     * @param value - 要序列化的值
     * @param replacer - 替换函数或键数组（可选）
     * @param space - 缩进（可选）
     * @returns JSON 字符串
     */
    stringify: (value: any, replacer?: ((key: string, value: any) => any) | string[] | null, space?: number | string) => {
      return stringify(value, replacer, space ?? options.space);
    }
  };
}

// 默认实例，用于向后兼容
const defaultInstance = createJsonBigint();

/**
 * 默认解析函数
 * @param text - JSON 文本
 * @param reviver - 转换函数（可选）
 * @returns 解析后的对象
 */
export const jsonParse = defaultInstance.parse;

/**
 * 默认序列化函数
 * @param value - 要序列化的值
 * @param replacer - 替换函数或键数组（可选）
 * @param space - 缩进（可选）
 * @returns JSON 字符串
 */
export const jsonStringify = defaultInstance.stringify;

// 导出 parse 和 stringify 函数
export { parse, stringify };

export default createJsonBigint;