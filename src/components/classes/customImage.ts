export default class CustomImage {
  private width: number
  private height: number
  private data: Uint8ClampedArray
  constructor(width?: number, height?: number, data?: Uint8ClampedArray) {
    this.width = width ?? 0
    this.height = height ?? 0
    this.data = data ?? new Uint8ClampedArray(0)
  }

  getFixedPositionBuffer(x1: number, x2: number, y1: number, y2: number) {
    const width = x2 - x1
    const height = y2 - y1
    const result = new Uint8ClampedArray(width * height * 4)
    for (let j = 0; j < height; j++) {
      const sourceStart = j * width * 4
      const targetStart = (y1 + j) * this.width * 4 + x1 * 4
      result.set(this.data.subarray(sourceStart, sourceStart + width * 4), targetStart)
    }
    return result
  }

  setFixedPositionBuffer(x1: number, x2: number, y1: number, y2: number, data: Uint8ClampedArray) {
    const width = x2 - x1
    const height = y2 - y1
    for (let j = 0; j < height; j++) {
      const sourceStart = j * width * 4
      const targetStart = (y1 + j) * this.width * 4 + x1 * 4
      this.data.set(data.subarray(sourceStart, sourceStart + width * 4), targetStart)
    }
  }

  getWidth() {
    return this.width
  }

  getHeight() {
    return this.height
  }

  getData() {
    return this.data
  }

  setData(data: Uint8ClampedArray) {
    this.data = data
  }

  setWidth(width: number) {
    this.width = width
  }

  setHeight(height: number) {
    this.height = height
  }
}
