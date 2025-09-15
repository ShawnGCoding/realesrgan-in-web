import type CustomImage from '@/components/classes/customImage'
/**
 * 分割图片
 * 1. 为什么要分块？
 *     解决显存限制 - 最直接的原因
 *     提升处理效率 - 每个小块可以独立处理，而不是一次性处理整个图片
 * 2. 为什么需要有重叠？
 *     为每个 Tile 的边缘像素提供真实的、充足的上下文信息。
 * @param factor 缩放因子
 * @param tileSize 切片大小
 * @param minOverlap 最小重叠
 * @param image 图片
 */
export function splitImage({
  tileSize,
  minOverlap,
  image,
}: {
  tileSize: number
  minOverlap: number
  image: CustomImage
}) {
  const width = image.getWidth()
  const height = image.getHeight()

  // x轴方向上需要分割的图片数量
  let xNum = 1
  // y轴方向上需要分割的图片数量
  let yNum = 1
  while (xNum * tileSize + (xNum - 1) * minOverlap < width) xNum++
  while (yNum * tileSize + (yNum - 1) * minOverlap < height) yNum++

  const locationX = new Array(xNum)
  const locationY = new Array(yNum)

  const paddingLeft = new Array<number>(xNum)
  const paddingRight = new Array<number>(xNum)
  const paddingTop = new Array<number>(yNum)
  const paddingBottom = new Array<number>(yNum)

  const totalOverlapX = (xNum - 1) * minOverlap
  const totalOverlapY = (yNum - 1) * minOverlap

  const baseOverlapX = Math.floor(totalOverlapX / (xNum - 1))
  const baseOverlapY = Math.floor(totalOverlapY / (yNum - 1))

  const extraOverlapX = totalOverlapX - (xNum - 1) * baseOverlapX
  const extraOverlapY = totalOverlapY - (yNum - 1) * baseOverlapY

  locationX[0] = 0
  locationY[0] = 0

  for (let i = 1; i < xNum; ++i) {
    if (i <= extraOverlapX) {
      locationX[i] = locationX[i - 1] + tileSize - baseOverlapX - 1
    } else {
      locationX[i] = locationX[i - 1] + tileSize - baseOverlapX
    }
  }

  for (let i = 1; i < yNum; ++i) {
    if (i <= extraOverlapY) {
      locationY[i] = locationY[i - 1] + tileSize - baseOverlapY - 1
    } else {
      locationY[i] = locationY[i - 1] + tileSize - baseOverlapY
    }
  }

  for (let i = 1; i < xNum; ++i) {
    paddingLeft[i] = Math.floor((locationX[i - 1] + tileSize - locationX[i]) / 2)
  }
  for (let i = 1; i < yNum; ++i) {
    paddingTop[i] = Math.floor((locationY[i - 1] + tileSize - locationY[i]) / 2)
  }

  for (let i = 0; i < xNum - 1; ++i) {
    paddingRight[i] = locationX[i] + tileSize - locationX[i + 1] - paddingLeft[i + 1]
  }
  for (let i = 0; i < yNum - 1; ++i) {
    paddingBottom[i] = locationY[i] + tileSize - locationY[i + 1] - paddingTop[i + 1]
  }

  return {
    locationX,
    locationY,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    xNum,
    yNum,
  }
}

export function checkIfImageHasAlpha(imageData: Uint8ClampedArray) {
  for (let i = 0; i < imageData.length; i += 4) {
    if (imageData[i + 3] !== 255) {
      return true
    }
  }
  return false
}