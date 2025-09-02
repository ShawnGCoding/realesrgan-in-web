import * as tf from '@tensorflow/tfjs'
import upscale from '../utils/upscale'
import CustomImage from '../components/classes/customImage'

let modelInfo = null

self.addEventListener("message", async (event) => {
  const { data } = event
  console.log(data.data.image)
  const image = data.data.image
  const customImage = new CustomImage(image.width, image.height, image.data)

  const model_url = 'https://cappuccino.moe/realcugan/4x-conservative-64/model.json'
  const model_name = 'realcugan_4x_conservative_64'
  // 加载模型到indexedDB
  try {
    modelInfo = await tf.loadGraphModel(`indexeddb://${model_name}`)
    console.log(modelInfo)
  } catch (err) {
    console.log(err)
    modelInfo = await (async () => {
      const fetchedModel = await tf.loadGraphModel(model_url);
      await fetchedModel.save(`indexeddb://${model_name}`);
      return fetchedModel;
    })();
  }
  const resultImage = await upscale(customImage, modelInfo)
  console.log(resultImage)
})
