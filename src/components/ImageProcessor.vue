<script lang="ts" setup>
import { ref, useTemplateRef, watch, reactive, onMounted } from "vue"
import CustomImage from "./classes/customImage";
import * as tf from '@tensorflow/tfjs'
import { splitImage } from "@/utils";
import { WorkerPool } from "./classes/workerPool";
const canvasRef = useTemplateRef<HTMLCanvasElement>("canvasRef")
const shadowCanvasRef = useTemplateRef<HTMLCanvasElement>("shadowCanvasRef")
const containerRef = useTemplateRef<HTMLDivElement>("containerRef")
const props = defineProps<{
  uploadedFile: File
}>()
const image = reactive(new Image())
const myImage = ref()
const modelInfo = ref()

watch(() => props.uploadedFile, (newVal: File) => {
  updateCanvasSize()
  readFile(newVal)
})

onMounted(async () => {
  const model_url = 'https://cappuccino.moe/realcugan/4x-conservative-64/model.json'
  const model_name = 'realcugan_4x_conservative_64'
  // 加载模型到indexedDB
  try {
    modelInfo.value = await tf.loadGraphModel(`indexeddb://${model_name}`)
    console.log(modelInfo)
  } catch (err: unknown) {
    console.log(err)
    modelInfo.value = await (async () => {
      const fetchedModel = await tf.loadGraphModel(model_url);
      await fetchedModel.save(`indexeddb://${model_name}`);
      return fetchedModel;
    })();
  }
})

function updateCanvasSize() {
  canvasRef.value!.width = containerRef.value!.offsetWidth * window.devicePixelRatio
  canvasRef.value!.height = containerRef.value!.offsetHeight * window.devicePixelRatio
}

function readFile (file: File) {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = (e: ProgressEvent<FileReader>) => {
    const imageSrc = e.target?.result as string
    image.src = imageSrc

    image.onload = () => {
      shadowCanvasRef.value!.width = image.width
      shadowCanvasRef.value!.height = image.height
      const ctx = shadowCanvasRef.value!.getContext("2d")
      ctx?.drawImage(image, 0, 0, image.width, image.height)
      // Uint8ClampedArray
      const imageData = ctx?.getImageData(0, 0, image.width, image.height).data
      // ArrayBuffer
      const buffer = imageData?.buffer
      myImage.value = new CustomImage(image.width, image.height, imageData);

      const canvasWidth = canvasRef.value!.width
      const canvasHeight = canvasRef.value!.height

      // 将图片缩放到合适的大小
      const imageScale = Math.min(0.8 * canvasWidth / image.width, 0.8 * canvasHeight / image.height, 4);
      const canvasOffsetX = (canvasWidth - image.width * imageScale) / 2
      const canvasOffsetY = (canvasHeight - image.height * imageScale) / 2

      drawCanvasImage(imageScale, canvasOffsetX, canvasOffsetY)

      setTimeout(() => {
        processImage()
      }, 1000)
    }
  }
}

function drawCanvasImage(imageScale: number, canvasOffsetX: number, canvasOffsetY: number) {
  const ctx = canvasRef.value!.getContext("2d")
  ctx?.clearRect(0, 0, canvasRef.value!.width, canvasRef.value!.height)
  ctx?.drawImage(image, canvasOffsetX, canvasOffsetY, myImage.value.getWidth() * imageScale, myImage.value.getHeight() * imageScale)
}

async function processImage() {
  const workerPool = new WorkerPool('../../workers/task-worker.js')
  const tileSize = 64
  const { locationX, locationY, paddingLeft, paddingRight, paddingTop, paddingBottom, xNum, yNum } = splitImage({ tileSize: 64, minOverlap: 12, image: myImage.value })
  for (let i = 0; i < xNum; i++) {
    for (let j = 0; j < yNum; j++) {
      const tileImage = myImage.value.getFixedPositionBuffer(locationX[i], locationX[i] + tileSize, locationY[j], locationY[j] + tileSize)
      const tile = new CustomImage(tileSize, tileSize)
      tile.setFixedPositionBuffer(0, tileSize, 0, tileSize, tileImage)
      workerPool.addTask({image: tile}, `${i}-${j}`)
    }
  }

}

</script>
<template>
  <div class="image-processor" ref="containerRef">
    <canvas ref="canvasRef"></canvas>
    <canvas ref="shadowCanvasRef" v-show="false"></canvas>
  </div>
</template>
<style scoped lang="scss">
.image-processor {
  width: 100%;
  height: 100%;
  canvas {
    height: 100vh;
  }
}

</style>
