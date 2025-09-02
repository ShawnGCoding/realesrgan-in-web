import CustomImage from '@/components/classes/customImage';
import * as tf from '@tensorflow/tfjs'


export default async function upscale(image: CustomImage, model: tf.GraphModel) {
  const result = tf.tidy(() => {
    const tensor = img2tensor(image)
    const result = model.predict(tensor) as tf.Tensor;
    return result;
  })
  const resultImage = await tensor2img(result)
  tf.dispose(result)
  return resultImage
}

function img2tensor(image: CustomImage): tf.Tensor {
  const imgdata = new ImageData(image.getWidth(), image.getHeight());
  imgdata.data.set(image.getData());
  const tensor = tf.browser.fromPixels(imgdata).div(255).toFloat().expandDims();
  return tensor;
}

async function tensor2img(tensor: tf.Tensor): Promise<CustomImage> {
  const [_, height, width, __] = tensor.shape;

  const clipped = tf.tidy(() =>
    tensor
      .reshape([height, width, 3])
      .mul(255)
      .cast("int32")
      .clipByValue(0, 255)
  );
  tensor.dispose();
  const data = await tf.browser.toPixels(clipped as tf.Tensor3D);
  clipped.dispose();
  const image = new CustomImage(width, height, data as unknown as Uint8ClampedArray);

  return image;
}
