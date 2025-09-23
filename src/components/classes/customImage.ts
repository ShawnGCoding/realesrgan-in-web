export default class CustomImage {
  private width: number
  private height: number
  private data: Uint8ClampedArray
  constructor(width?: number, height?: number, data?: Uint8ClampedArray) {
    this.width = width ?? 0
    this.height = height ?? 0
    this.data = data ?? new Uint8ClampedArray(this.width * this.height * 4)
  }

  getFixedPositionBuffer(x1: number, x2: number, y1: number, y2: number) {
    const width = x2 - x1
    const height = y2 - y1
    const result = new Uint8ClampedArray(width * height * 4)
    for (let j = 0; j < height; j++) {
      const targetStart = j * width * 4
      const sourceStart = (y1 + j) * this.width * 4 + x1 * 4
      result.set(this.data.subarray(sourceStart, sourceStart + width * 4), targetStart)
    }

    return result
  }

  setFixedPositionBuffer(x1: number, x2: number, y1: number, y2: number, data: Uint8ClampedArray) {
    const width = x2 - x1
    const height = y2 - y1
    for (let j = 0; j < height; j++) {
      const targetStart = j * width * 4
      const sourceStart = (y1 + j) * this.width * 4 + x1 * 4
      this.data.set(data.subarray(sourceStart, sourceStart + width * 4), targetStart)
    }
  }

  setCroppedImage(x1: number, x2: number, y1: number, y2: number, otherImage: CustomImage, x: number, y: number) {
    const width = x2 - x1
    const height = y2 - y1
    for (let j = 0; j < height; j++) {
      const srcStart = (y1 + j) * otherImage.width * 4 + x1 * 4;
      const destStart = (y + j) * this.width * 4 + x * 4;
      this.data.set(otherImage.data.subarray(srcStart, srcStart + width * 4), destStart)
    }
  }

  tileSizePad(tileSize: number) {
    if (this.width >= tileSize && this.height >= tileSize) return;
    const newWidth = Math.max(tileSize, this.width);
    const newHeight = Math.max(tileSize, this.height);
    const newData = new Uint8ClampedArray(newWidth * newHeight * 4);
    // 复制原有的data
    for (let y = 0; y < this.height; y++) {
      const sourceStart = y * this.width * 4
      const destinationStart = y * newWidth * 4
      newData.set(this.data.subarray(sourceStart, sourceStart + this.width * 4), destinationStart)
    }

    // 如果宽度小于tileSize，则根据最右侧的像素填充右侧的空白
    if (this.width < newWidth) {
      for (let y = 0; y < this.height; y++) {
        const rightBorderStart = (y + 1) * this.width * 4 - 4;
        for (let x = this.width; x < newWidth; x++) {
          newData.set(this.data.subarray(rightBorderStart, rightBorderStart + 4), y * newWidth * 4 + x * 4)
        }
      }
    }

    // 如果高度小于tileSize，则根据最底部的像素填充底部的空白
    if (this.height < newHeight) {
      const bottomBorderStart = (this.height - 1) * newWidth * 4;
      // 获取最底部一行的像素
      const bottomLinePixels = this.data.subarray(bottomBorderStart, bottomBorderStart + newWidth * 4);
      for (let y = this.height; y < newHeight; y++) {
        const destinationStart = y * newWidth * 4;
        newData.set(bottomLinePixels, destinationStart)
      }
    }

    this.width = newWidth
    this.height = newHeight
    this.data = newData
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
