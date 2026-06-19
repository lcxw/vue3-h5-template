/**
 * 手写签名工具类
 * 适配 Web 环境，使用 Canvas API 实现签名功能
 */

/** 笔迹点信息 */
interface PointInfo {
  time?: number
  dis?: number
  x: number
  y: number
  r?: number
}

/** 裁剪区域 */
interface CutArea {
  top: number
  right: number
  bottom: number
  left: number
}

/** 贝塞尔曲线点 */
interface BezierPoint {
  mx?: string
  my?: string
  c1x?: string
  c1y?: string
  c2x?: string
  c2y?: string
  ex?: string
  ey?: string
  color?: string
}

/** 签名选项 */
interface HandwritingOptions {
  penColor?: string
  slideValue?: number
  canvasName?: string
  ctx: CanvasRenderingContext2D
}

/**
 * 手写签名类
 * 使用 Canvas API 实现平滑的手写签名效果
 */
export class Handwriting {
  /** Canvas 绑定上下文 */
  ctx: CanvasRenderingContext2D
  /** Canvas 宽度 */
  canvasWidth = 300
  /** Canvas 高度 */
  canvasHeight = 900
  /** 划线轨迹，生成线条的实际点 */
  linePrack: PointInfo[][] = []
  /** 当前线条 */
  currentLine: PointInfo[] = []
  /** 透明度 */
  transparent = 1
  /** 默认压力 */
  pressure = 0.5
  /** 顺滑度，用 60 的距离来计算速度 */
  smoothness = 100
  /** 笔记倍数 */
  lineSize = 1.5
  /** 最小笔画半径 */
  lineMin = 0.5
  /** 最大笔画半径 */
  lineMax = 2
  /** 当前点 */
  currentPoint: PointInfo = { time: 0, dis: 0, x: 0, y: 0 }
  /** 第一次触发 */
  firstTouch = true
  /** 画圆的半径 */
  radius = 1
  /** 裁剪区域 */
  cutArea: CutArea = { top: 0, right: 0, bottom: 0, left: 0 }
  /** 上一个点 */
  lastPoint: PointInfo | number = 0
  /** 笔迹 */
  chirography: { lineSize: number; penColor: string }[] = []
  /** 笔颜色 */
  penColor: string
  /** 滑动值 */
  slideValue: number
  /** Canvas 名称 */
  canvasName: string
  /** 开始值（用于判断是否为空） */
  startValue = 0

  /**
   * 创建手写签名实例
   * @param opts - 签名选项
   */
  constructor(opts: HandwritingOptions) {
    this.penColor = opts.penColor || '#1A1A1A'
    this.slideValue = opts.slideValue || 50
    this.canvasName = opts.canvasName || 'handWriting'
    this.ctx = opts.ctx
    this.init()
  }

  /**
   * 初始化签名工具
   */
  init(): void {
    this.selectSlideValue(this.slideValue)
  }

  /**
   * 设置 Canvas 尺寸
   * @param rect - 尺寸信息
   */
  setSize(rect: { width: number; height: number }): void {
    this.canvasWidth = rect.width
    this.canvasHeight = rect.height
  }

  /**
   * 笔迹开始（触摸开始）
   * @param event - 触摸事件
   */
  uploadScaleStart(event: TouchEvent): boolean {
    if (event.type !== 'touchstart') return false

    this.ctx.fillStyle = this.penColor
    this.ctx.globalAlpha = this.transparent

    const touch = event.touches[0]
    const x = touch.clientX
    const y = touch.clientY

    this.currentPoint = { time: Date.now(), dis: 0, x, y }
    this.currentLine.unshift({
      time: Date.now(),
      dis: 0,
      x: this.currentPoint.x,
      y: this.currentPoint.y
    })

    if (this.firstTouch) {
      this.cutArea = {
        top: this.currentPoint.y,
        right: this.currentPoint.x,
        bottom: this.currentPoint.y,
        left: this.currentPoint.x
      }
      this.firstTouch = false
    }
    this.pointToLine(this.currentLine)
    return true
  }

  /**
   * 笔迹移动（触摸移动）
   * @param event - 触摸事件
   */
  uploadScaleMove(event: TouchEvent): boolean {
    if (event.type !== 'touchmove') return false
    event.preventDefault()

    const touch = event.touches[0]
    const x = touch.clientX
    const y = touch.clientY

    const point: PointInfo = { time: Date.now(), dis: 0, x, y }

    // 测试裁剪
    if (point.y < this.cutArea.top) {
      this.cutArea.top = point.y
    }
    if (point.y < 0) this.cutArea.top = 0

    if (point.x > this.cutArea.right) {
      this.cutArea.right = point.x
    }
    if (this.canvasWidth - point.x <= 0) {
      this.cutArea.right = this.canvasWidth
    }
    if (point.y > this.cutArea.bottom) {
      this.cutArea.bottom = point.y
    }
    if (this.canvasHeight - point.y <= 0) {
      this.cutArea.bottom = this.canvasHeight
    }
    if (point.x < this.cutArea.left) {
      this.cutArea.left = point.x
    }
    if (point.x < 0) this.cutArea.left = 0

    this.lastPoint = this.currentPoint
    this.currentPoint = point
    this.currentLine.unshift({
      time: Date.now(),
      dis: this.distance(this.currentPoint, this.lastPoint as PointInfo, 'move'),
      x: point.x,
      y: point.y
    })
    this.pointToLine(this.currentLine)
    return true
  }

  /**
   * 笔迹结束（触摸结束）
   * @param event - 触摸事件
   */
  uploadScaleEnd(event: TouchEvent): number {
    if (event.type !== 'touchend') return 0

    const touch = event.changedTouches[0]
    const x = touch.clientX
    const y = touch.clientY

    const point: PointInfo = { time: Date.now(), dis: 0, x, y }

    this.lastPoint = this.currentPoint
    this.currentPoint = point
    this.currentLine.unshift({
      time: Date.now(),
      dis: this.distance(this.currentPoint, this.lastPoint!, 'end'),
      x: point.x,
      y: point.y
    })

    if (this.currentLine.length > 2) {
      const info = ((this.currentLine[0] as any).time - (this.currentLine[this.currentLine.length - 1] as any).time) / this.currentLine.length
      // 可用于调试
    }

    this.pointToLine(this.currentLine)
    const currentChirography = {
      lineSize: this.lineSize,
      penColor: this.penColor
    }
    this.chirography.unshift(currentChirography)
    this.linePrack.unshift(this.currentLine)
    this.currentLine = []
    return this.linePrack.length
  }

  /**
   * 重绘 Canvas
   */
  retDraw(): void {
    this.ctx.clearRect(0, 0, this.canvasWidth || 700, this.canvasHeight || 730)
    this.cutArea = { top: 0, right: 0, bottom: 0, left: 0 }
    this.firstTouch = true
  }

  /**
   * 清空签名
   */
  clear(): void {
    this.linePrack = []
    this.currentLine = []
    this.startValue = 0
    this.retDraw()
  }

  /**
   * 判断签名是否为空
   * @returns 是否为空
   */
  isEmpty(): boolean {
    if (this.startValue === 1) {
      return false
    } else {
      return this.linePrack.length === 0
    }
  }

  /**
   * 画两点之间的线条
   * @param line - 线条点数组
   */
  pointToLine(line: PointInfo[]): void {
    this.calcBethelLine(line)
  }

  /**
   * 计算贝塞尔曲线插值
   * @param line - 线条点数组
   */
  calcBethelLine(line: PointInfo[]): void {
    if (line.length <= 1) {
      line[0].r = this.radius
      return
    }

    let x0: number, x1: number, x2: number
    let y0: number, y1: number, y2: number
    let r0: number, r1: number, r2: number
    let len: number
    let lastRadius: number
    let dis = 0
    let time = 0
    const curveValue = 0.5

    if (line.length <= 2) {
      x0 = line[1].x
      y0 = line[1].y
      x2 = line[1].x + (line[0].x - line[1].x) * curveValue
      y2 = line[1].y + (line[0].y - line[1].y) * curveValue
      x1 = x0 + (x2 - x0) * curveValue
      y1 = y0 + (y2 - y0) * curveValue
    } else {
      x0 = line[2].x + (line[1].x - line[2].x) * curveValue
      y0 = line[2].y + (line[1].y - line[2].y) * curveValue
      x1 = line[1].x
      y1 = line[1].y
      x2 = x1 + (line[0].x - x1) * curveValue
      y2 = y1 + (line[0].y - y1) * curveValue
    }

    len = this.distance({ x: x2, y: y2 }, { x: x0, y: y0 }, 'calc')
    lastRadius = this.radius

    for (let n = 0; n < line.length - 1; n++) {
      dis += (line[n] as any).dis
      time += (line[n] as any).time - (line[n + 1] as any).time
      if (dis > this.smoothness) break
    }

    this.radius = Math.min(time / len * this.pressure + this.lineMin, this.lineMax) * this.lineSize
    line[0].r = this.radius

    if (line.length <= 2) {
      r0 = (lastRadius + this.radius) / 2
      r1 = r0
      r2 = r1
    } else {
      r0 = (line[2].r! + line[1].r!) / 2
      r1 = line[1].r!
      r2 = (line[1].r! + line[0].r!) / 2
    }

    const n = 5
    let point: PointInfo[] = []

    for (let i = 0; i < n; i++) {
      const t = i / (n - 1)
      const x = (1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * x1 + t * t * x2
      const y = (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * y1 + t * t * y2
      const r = lastRadius + (this.radius - lastRadius) / n * i
      point.push({ time: 0, dis: 0, x, y, r })

      if (point.length === 3) {
        const a = this.ctaCalc(
          point[0].x, point[0].y, point[0].r!,
          point[1].x, point[1].y, point[1].r!,
          point[2].x, point[2].y, point[2].r!
        )
        this.bethelDraw(a, 1)
        point = [{ time: 0, dis: 0, x: point[2].x, y: point[2].y, r: point[2].r }]
      }
    }
  }

  /**
   * 计算两点之间的距离
   * @param a - 点 a
   * @param b - 点 b
   * @param type - 计算类型
   * @returns 距离值
   */
  distance(a: PointInfo, b: PointInfo, type: string): number {
    const x = b.x - a.x
    const y = b.y - a.y
    return Math.sqrt(x * x + y * y) * 5
  }

  /**
   * CTA 计算（用于贝塞尔曲线绘制）
   * @param x0 - 点 0 x 坐标
   * @param y0 - 点 0 y 坐标
   * @param r0 - 点 0 半径
   * @param x1 - 点 1 x 坐标
   * @param y1 - 点 1 y 坐标
   * @param r1 - 点 1 半径
   * @param x2 - 点 2 x 坐标
   * @param y2 - 点 2 y 坐标
   * @param r2 - 点 2 半径
   * @returns 贝塞尔曲线点数组
   */
  ctaCalc(
    x0: number, y0: number, r0: number,
    x1: number, y1: number, r1: number,
    x2: number, y2: number, r2: number
  ): BezierPoint[] {
    const a: BezierPoint[] = []
    let vx01: number, vy01: number, norm: number
    let n_x0: number, n_y0: number
    let vx21: number, vy21: number
    let n_x2: number, n_y2: number

    vx01 = x1 - x0
    vy01 = y1 - y0
    norm = Math.sqrt(vx01 * vx01 + vy01 * vy01 + 0.0001) * 2
    vx01 = vx01 / norm * r0
    vy01 = vy01 / norm * r0
    n_x0 = vy01
    n_y0 = -vx01

    vx21 = x1 - x2
    vy21 = y1 - y2
    norm = Math.sqrt(vx21 * vx21 + vy21 * vy21 + 0.0001) * 2
    vx21 = vx21 / norm * r2
    vy21 = vy21 / norm * r2
    n_x2 = -vy21
    n_y2 = vx21

    a.push({
      mx: (x0 + n_x0).toFixed(1),
      my: (y0 + n_y0).toFixed(1),
      color: this.penColor
    })
    a.push({
      c1x: (x1 + n_x0).toFixed(1),
      c1y: (y1 + n_y0).toFixed(1),
      c2x: (x1 + n_x2).toFixed(1),
      c2y: (y1 + n_y2).toFixed(1),
      ex: (x2 + n_x2).toFixed(1),
      ey: (y2 + n_y2).toFixed(1),
      color: this.penColor
    })
    a.push({
      c1x: (x2 + n_x2 - vx21).toFixed(1),
      c1y: (y2 + n_y2 - vy21).toFixed(1),
      c2x: (x2 - n_x2 - vx21).toFixed(1),
      c2y: (y2 - n_y2 - vy21).toFixed(1),
      ex: (x2 - n_x2).toFixed(1),
      ey: (y2 - n_y2).toFixed(1),
      color: this.penColor
    })
    a.push({
      c1x: (x1 - n_x2).toFixed(1),
      c1y: (y1 - n_y2).toFixed(1),
      c2x: (x1 - n_x0).toFixed(1),
      c2y: (y1 - n_y0).toFixed(1),
      ex: (x0 - n_x0).toFixed(1),
      ey: (y0 - n_y0).toFixed(1),
      color: this.penColor
    })
    a.push({
      c1x: (x0 - n_x0 - vx01).toFixed(1),
      c1y: (y0 - n_y0 - vy01).toFixed(1),
      c2x: (x0 + n_x0 - vx01).toFixed(1),
      c2y: (y0 + n_y0 - vy01).toFixed(1),
      ex: (x0 + n_x0).toFixed(1),
      ey: (y0 + n_y0).toFixed(1),
      color: this.penColor
    })

    return a
  }

  /**
   * 绘制贝塞尔曲线
   * @param point - 贝塞尔曲线点数组
   * @param is_fill - 是否填充
   * @param color - 可选的颜色
   */
  bethelDraw(point: BezierPoint[], is_fill?: number, color?: string): void {
    this.ctx.beginPath()
    this.ctx.moveTo(parseFloat(point[0].mx!), parseFloat(point[0].my!))

    if (color !== undefined) {
      this.ctx.fillStyle = color
      this.ctx.strokeStyle = color
    } else {
      this.ctx.fillStyle = point[0].color!
      this.ctx.strokeStyle = point[0].color!
    }

    this.ctx.bezierCurveTo(
      parseFloat(point[1].c1x!), parseFloat(point[1].c1y!),
      parseFloat(point[1].c2x!), parseFloat(point[1].c2y!),
      parseFloat(point[1].ex!), parseFloat(point[1].ey!)
    )
    this.ctx.bezierCurveTo(
      parseFloat(point[2].c1x!), parseFloat(point[2].c1y!),
      parseFloat(point[2].c2x!), parseFloat(point[2].c2y!),
      parseFloat(point[2].ex!), parseFloat(point[2].ey!)
    )
    this.ctx.bezierCurveTo(
      parseFloat(point[3].c1x!), parseFloat(point[3].c1y!),
      parseFloat(point[3].c2x!), parseFloat(point[3].c2y!),
      parseFloat(point[3].ex!), parseFloat(point[3].ey!)
    )
    this.ctx.bezierCurveTo(
      parseFloat(point[4].c1x!), parseFloat(point[4].c1y!),
      parseFloat(point[4].c2x!), parseFloat(point[4].c2y!),
      parseFloat(point[4].ex!), parseFloat(point[4].ey!)
    )
    this.ctx.closePath()

    if (is_fill !== undefined) {
      this.ctx.fill()
    }
    this.ctx.stroke()
  }

  /**
   * 选择笔颜色
   * @param penColor - 笔颜色
   */
  selectColorEvent(penColor: string): void {
    this.penColor = penColor
  }

  /**
   * 设置滑动值（笔迹粗细）
   * @param slideValue - 滑动值 (0-100)
   */
  selectSlideValue(slideValue: number): void {
    switch (slideValue) {
      case 0:
        this.lineSize = 0.1
        this.lineMin = 0.1
        this.lineMax = 0.1
        break
      case 25:
        this.lineSize = 1
        this.lineMin = 0.5
        this.lineMax = 2
        break
      case 50:
        this.lineSize = 1.5
        this.lineMin = 1
        this.lineMax = 3
        break
      case 75:
        this.lineSize = 1.5
        this.lineMin = 2
        this.lineMax = 3.5
        break
      case 100:
        this.lineSize = 3
        this.lineMin = 2
        this.lineMax = 3.5
        break
      default:
        // 默认值
        this.lineSize = 1.5
        this.lineMin = 1
        this.lineMax = 3
    }
  }

  /**
   * 从 DataURL 加载图片到 Canvas（用于加载已有签名）
   * @param dataUrl - 图片的 DataURL
   * @param options - 加载选项
   */
  fromDataURL(dataUrl: string, options: { xOffset?: number; yOffset?: number; width?: number; height?: number } = {}): void {
    try {
      this.startValue = 0
      const ctx = this.ctx
      const opts = {
        xOffset: options.xOffset || 0,
        yOffset: options.yOffset || 0,
        width: options.width || this.canvasWidth,
        height: options.height || this.canvasHeight
      }

      const image = new Image()
      image.onload = () => {
        ctx.drawImage(image, opts.xOffset, opts.yOffset, opts.width, opts.height)
        this.startValue = 1
      }
      image.onerror = () => {
        console.error('fromDataURL: 加载图片失败')
      }
      image.src = dataUrl
    } catch (error) {
      console.error('fromDataURL Error:', error)
    }
  }

  /**
   * 将签名转换为 DataURL
   * @param format - 图片格式，默认 'png'
   * @param quality - 图片质量 (0-1)，仅对 jpeg 格式有效
   * @returns 图片的 DataURL
   */
  toDataURL(format: 'png' | 'jpeg' = 'png', quality?: number): string {
    return this.ctx.canvas.toDataURL(`image/${format}`, quality)
  }
}

export default Handwriting