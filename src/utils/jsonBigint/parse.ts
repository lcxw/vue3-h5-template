/**
 * JSON 大整数解析器
 * 支持将 JSON 中的大整数解析为 BigNumber 或 BigInt
 */

import BigNumber from 'bignumber.js'

// 正则表达式，用于检测可疑的 __proto__ 和 constructor 属性
const suspectProtoRx =
  /(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])/;
const suspectConstructorRx =
  /(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)/;

/** 解析选项 */
interface ParseOptions {
  /** 是否严格模式，严格模式下重复键会报错 */
  strict?: boolean;
  /** 是否将大整数存储为字符串 */
  storeAsString?: boolean;
  /** 是否总是解析为 BigNumber */
  alwaysParseAsBig?: boolean;
  /** 是否使用原生 BigInt */
  useNativeBigInt?: boolean;
  /** 对 __proto__ 属性的处理方式 */
  protoAction?: 'error' | 'ignore' | 'preserve';
  /** 对 constructor 属性的处理方式 */
  constructorAction?: 'error' | 'ignore' | 'preserve';
}

/**
 * 创建 JSON 解析函数
 * @param options - 解析选项
 * @returns JSON 解析函数
 */
function createJsonParse(options: ParseOptions = {}) {
  // 默认选项
  const _options: Required<ParseOptions> = {
    strict: false,
    storeAsString: false,
    alwaysParseAsBig: false,
    useNativeBigInt: false,
    protoAction: 'error',
    constructorAction: 'error'
  };

  // 应用用户选项
  if (options.strict === true) {
    _options.strict = true;
  }
  if (options.storeAsString === true) {
    _options.storeAsString = true;
  }
  _options.alwaysParseAsBig = options.alwaysParseAsBig === true;
  _options.useNativeBigInt = options.useNativeBigInt === true;

  if (typeof options.constructorAction !== 'undefined') {
    if (
      options.constructorAction === 'error' ||
      options.constructorAction === 'ignore' ||
      options.constructorAction === 'preserve'
    ) {
      _options.constructorAction = options.constructorAction;
    } else {
      throw new Error(
        `Incorrect value for constructorAction option, must be "error", "ignore" or undefined but passed ${options.constructorAction}`
      );
    }
  }

  if (typeof options.protoAction !== 'undefined') {
    if (
      options.protoAction === 'error' ||
      options.protoAction === 'ignore' ||
      options.protoAction === 'preserve'
    ) {
      _options.protoAction = options.protoAction;
    } else {
      throw new Error(
        `Incorrect value for protoAction option, must be "error", "ignore" or undefined but passed ${options.protoAction}`
      );
    }
  }

  let at: number; // 当前字符索引
  let ch: string; // 当前字符
  const escapee: Record<string, string> = {
    '"': '"',
    '\\': '\\',
    '/': '/',
    b: '\b',
    f: '\f',
    n: '\n',
    r: '\r',
    t: '\t'
  };
  let text: string;

  /**
   * 抛出语法错误
   * @param m - 错误消息
   */
  function error(m: string): never {
    throw {
      name: 'SyntaxError',
      message: m,
      at: at,
      text: text
    };
  }

  /**
   * 获取下一个字符
   * @param c - 期望的字符（可选）
   * @returns 下一个字符
   */
  function next(c?: string): string {
    if (c && c !== ch) {
      error(`Expected '${c}' instead of '${ch}'`);
    }
    ch = text.charAt(at);
    at += 1;
    return ch;
  }

  /**
   * 解析数字
   * @returns 解析后的数字或 BigNumber
   */
  function number(): number | string | BigNumber | bigint {
    let numberValue: number;
    let string = '';

    if (ch === '-') {
      string = '-';
      next('-');
    }
    while (ch >= '0' && ch <= '9') {
      string += ch;
      next();
    }
    if (ch === '.') {
      string += '.';
      while (next() && ch >= '0' && ch <= '9') {
        string += ch;
      }
    }
    if (ch === 'e' || ch === 'E') {
      string += ch;
      next();
      if (ch === '-' || ch === '+') {
        string += ch;
        next();
      }
      while (ch >= '0' && ch <= '9') {
        string += ch;
        next();
      }
    }
    numberValue = +string;
    if (!isFinite(numberValue)) {
      error('Bad number');
    } else {
      // 如果数字长度超过 15 位，使用 BigNumber 或 BigInt
      if (string.length > 15) {
        return _options.storeAsString
          ? string
          : _options.useNativeBigInt
          ? BigInt(string)
          : new BigNumber(string);
      } else {
        return !_options.alwaysParseAsBig
          ? numberValue
          : _options.useNativeBigInt
          ? BigInt(numberValue)
          : new BigNumber(numberValue);
      }
    }
  }

  /**
   * 解析字符串
   * @returns 解析后的字符串
   */
  function string(): string {
    let hex: number;
    let i: number;
    let result = '';
    let uffff: number;
    let startAt = at;

    if (ch === '"') {
      while (next()) {
        if (ch === '"') {
          if (at - 1 > startAt) result += text.substring(startAt, at - 1);
          next();
          return result;
        }
        if (ch === '\\') {
          if (at - 1 > startAt) result += text.substring(startAt, at - 1);
          next();
          if (ch === 'u') {
            uffff = 0;
            for (i = 0; i < 4; i += 1) {
              hex = parseInt(next(), 16);
              if (!isFinite(hex)) {
                break;
              }
              uffff = uffff * 16 + hex;
            }
            result += String.fromCharCode(uffff);
          } else if (typeof escapee[ch] === 'string') {
            result += escapee[ch];
          } else {
            break;
          }
          startAt = at;
        }
      }
    }
    error('Bad string');
  }

  /**
   * 跳过空白字符
   */
  function white(): void {
    while (ch && ch <= ' ') {
      next();
    }
  }

  /**
   * 解析单词（true、false、null）
   * @returns 解析后的布尔值或 null
   */
  function word(): boolean | null {
    switch (ch) {
      case 't':
        next('t');
        next('r');
        next('u');
        next('e');
        return true;
      case 'f':
        next('f');
        next('a');
        next('l');
        next('s');
        next('e');
        return false;
      case 'n':
        next('n');
        next('u');
        next('l');
        next('l');
        return null;
    }
    error(`Unexpected '${ch}'`);
  }

  /**
   * 解析数组
   * @returns 解析后的数组
   */
  function array(): any[] {
    const result: any[] = [];

    if (ch === '[') {
      next('[');
      white();
      if (ch === ']') {
        next(']');
        return result; // 空数组
      }
      while (ch) {
        result.push(value());
        white();
        if (ch === ']') {
          next(']');
          return result;
        }
        next(',');
        white();
      }
    }
    error('Bad array');
  }

  /**
   * 解析对象
   * @returns 解析后的对象
   */
  function object(): Record<string, any> {
    let key: string;
    const result: Record<string, any> = {};

    if (ch === '{') {
      next('{');
      white();
      if (ch === '}') {
        next('}');
        return result; // 空对象
      }
      while (ch) {
        key = string();
        white();
        next(':');
        if (_options.strict === true && Object.hasOwnProperty.call(result, key)) {
          error(`Duplicate key "${key}"`);
        }

        if (suspectProtoRx.test(key) === true) {
          if (_options.protoAction === 'error') {
            error('Object contains forbidden prototype property');
          } else if (_options.protoAction === 'ignore') {
            value();
          } else {
            result[key] = value();
          }
        } else if (suspectConstructorRx.test(key) === true) {
          if (_options.constructorAction === 'error') {
            error('Object contains forbidden constructor property');
          } else if (_options.constructorAction === 'ignore') {
            value();
          } else {
            result[key] = value();
          }
        } else {
          result[key] = value();
        }

        white();
        if (ch === '}') {
          next('}');
          return result;
        }
        next(',');
        white();
      }
    }
    error('Bad object');
  }

  /**
   * 解析 JSON 值
   * @returns 解析后的值
   */
  function value(): any {
    white();
    switch (ch) {
      case '{':
        return object();
      case '[':
        return array();
      case '"':
        return string();
      case '-':
        return number();
      default:
        return ch >= '0' && ch <= '9' ? number() : word();
    }
  }

  /**
   * 解析 JSON 文本
   * @param source - JSON 文本
   * @param reviver - 转换函数
   * @returns 解析后的对象
   */
  return function (source: string, reviver?: (this: any, key: string, value: any) => any): any {
    let result: any;

    text = source + '';
    at = 0;
    ch = ' ';
    result = value();
    white();
    if (ch) {
      error('Syntax error');
    }

    // 如果有 reviver 函数，递归遍历结果
    return typeof reviver === 'function'
      ? (function walk(holder: any, key: string): any {
          let v: any;
          const value = holder[key];
          if (value && typeof value === 'object') {
            Object.keys(value).forEach(function (k: string) {
              v = walk(value, k);
              if (v !== undefined) {
                value[k] = v;
              } else {
                delete value[k];
              }
            });
          }
          return reviver.call(holder, key, value);
        })({ '': result }, '')
      : result;
  };
}

// 创建默认解析函数
const jsonParse = createJsonParse();

/**
 * 解析 JSON 文本，支持大整数
 * @param text - JSON 文本
 * @param reviver - 转换函数（可选）
 * @param options - 解析选项（可选）
 * @returns 解析后的对象
 */
export function parse(
  text: string,
  reviver?: (this: any, key: string, value: any) => any,
  options?: ParseOptions
): any {
  if (options) {
    const customParse = createJsonParse(options);
    return customParse(text, reviver);
  }
  return jsonParse(text, reviver);
}

export default createJsonParse;