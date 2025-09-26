import * as tf from '@tensorflow/tfjs'
import upscale from '../utils/upscale'
import CustomImage from '../components/classes/customImage'

let modelInfo = null

self.addEventListener("message", async (event) => {
  console.log('!!!!!!!!!!!')
  console.log(event)
  const { data } = event
  const image = data.image
  const { width, height, factor = 4 } = data
  const customImage = new CustomImage(width, height, image.data)

  const model_url = 'https://cappuccino.moe/realcugan/4x-conservative-64/model.json'
  const model_name = 'realcugan_4x_conservative_64'
  // 加载模型到indexedDB
  try {
    modelInfo = await tf.loadGraphModel(`indexeddb://${model_name}`)
  } catch (err) {
    console.log(err)
    modelInfo = await (async () => {
      const fetchedModel = await tf.loadGraphModel(model_url);
      await fetchedModel.save(`indexeddb://${model_name}`);
      return fetchedModel;
    })();
  }
  const result = await splitImageWithLap(customImage, 64, 12, 4)
  self.postMessage({
    result: result.data.buffer,
    origin: data.image,
    width: width * factor,
    height: height * factor
  }, [result.data.buffer])
})

async function splitImageWithLap(image, tileSize, minOverlap, factor = 4) {
  const width = image.getWidth()
  const height = image.getHeight()

  const result = new CustomImage(width * factor, height * factor)
  let xNum = 1, yNum = 1
  while(xNum * tileSize - (xNum - 1) * minOverlap < width) xNum++
  while (yNum * tileSize - (yNum - 1) * minOverlap < height) yNum++

  console.log('xNum', xNum)
  console.log('yNum', yNum)

  const totalOverlapX = tileSize * xNum - width
  const totalOverlapY = tileSize * yNum - height

  const baseOverlapX = Math.floor(totalOverlapX / (xNum - 1))
  const baseOverlapY = Math.floor(totalOverlapY / (yNum - 1))

  const extraOverlapX = totalOverlapX - (xNum - 1) * baseOverlapX
  const extraOverlapY = totalOverlapY - (yNum - 1) * baseOverlapY

  const locationX = new Array(xNum)
  const locationY = new Array(yNum)

  locationX[0] = 0
  locationY[0] = 0
  for(let i = 1; i < xNum; i++) {
    if(i <= extraOverlapX) {
      locationX[i] = locationX[i - 1] + tileSize - baseOverlapX - 1
    } else {
      locationX[i] = locationX[i - 1] + tileSize - baseOverlapX
    }
  }
  for(let i = 1; i < yNum; i++) {
    if(i <= extraOverlapY) {
      locationY[i] = locationY[i - 1] + tileSize - baseOverlapY - 1
    } else {
      locationY[i] = locationY[i - 1] + tileSize - baseOverlapY
    }
  }

  const paddingLeft = new Array(xNum)
  const paddingRight = new Array(xNum)
  const paddingTop = new Array(yNum)
  const paddingBottom = new Array(yNum)

  for(let i = 1; i < xNum; i++) {
    paddingLeft[i] = Math.floor((locationX[i - 1] + tileSize - locationX[i]) / 2)
  }
  for(let i = 1; i < yNum; i++) {
    paddingTop[i] = Math.floor((locationY[i - 1] + tileSize - locationY[i]) / 2)
  }
  for(let i = 0; i < xNum - 1; i++) {
    paddingRight[i] = locationX[i] + tileSize - locationX[i + 1] - paddingLeft[i + 1]
  }
  for(let i = 0; i < yNum - 1; i++) {
    paddingBottom[i] = locationY[i] + tileSize - locationY[i + 1] - paddingTop[i + 1]
  }
  for (let i = 0; i < xNum; i++) {
    for (let j = 0; j < yNum; j++) {
      const tile = new CustomImage(tileSize, tileSize)
      tile.setCroppedImage(locationX[i], locationX[i] + tileSize, locationY[j], locationY[j] + tileSize, image, 0, 0)
      const upScaledTile = await upscale(tile, modelInfo)
      result.setCroppedImage(
        paddingLeft[i] * factor,
        upScaledTile.width - paddingRight[i] * factor,
        paddingTop[j] * factor,
        upScaledTile.height - paddingBottom[j] * factor,
        upScaledTile,
        (locationX[i] + paddingLeft[i]) * factor,
        (locationY[j] + paddingTop[j]) * factor
      )
    }
  }
  return result

}
