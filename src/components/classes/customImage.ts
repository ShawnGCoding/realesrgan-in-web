export default class CustomImage {
  private width: number
  private height: number
  private data: Uint8ClampedArray
  constructor(width?: number, height?: number, data?: Uint8ClampedArray) {
    this.width = width ?? 0
    this.height = height ?? 0
    this.data = data ?? new Uint8ClampedArray(0)
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