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
const processedImage = reactive(new Image())
const processedImageUrl = ref("")
const imageScale = ref(1)
const myImage = ref()
const modelInfo = ref()
const outputImage = ref()

const paddingArray = reactive({
  paddingLeft: [] as number[],
  paddingRight: [] as number[],
  paddingTop: [] as number[],
  paddingBottom: [] as number[],
})

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

const originalCanvasOffsetX = ref(0)
const originalCanvasOffsetY = ref(0)

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
      // const buffer = imageData?.buffer
      myImage.value = new CustomImage(image.width, image.height, imageData);

      const canvasWidth = canvasRef.value!.width
      const canvasHeight = canvasRef.value!.height

      // 将图片缩放到合适的大小
      imageScale.value = Math.min(0.8 * canvasWidth / image.width, 0.8 * canvasHeight / image.height, 4);
      originalCanvasOffsetX.value = (canvasWidth - image.width * imageScale.value) / 2
      originalCanvasOffsetY.value = (canvasHeight - image.height * imageScale.value) / 2

      drawCanvasImage(imageScale.value, originalCanvasOffsetX.value, originalCanvasOffsetY.value, true)

      setTimeout(() => {
        processImage()
      }, 100)
    }
  }
}

function drawCanvasImage(imageScale: number, canvasOffsetX: number, canvasOffsetY: number, isOriginalImage: boolean) {
  const ctx = canvasRef.value!.getContext("2d")
  // ctx?.clearRect(0, 0, canvasRef.value!.width, canvasRef.value!.height)
  if (isOriginalImage) {
    ctx?.drawImage(image, canvasOffsetX, canvasOffsetY, myImage.value.getWidth() * imageScale, myImage.value.getHeight() * imageScale)
  } else {
    console.log(processedImage)
    console.log(image)
    console.log(canvasOffsetX, canvasOffsetY, outputImage.value.getWidth(), outputImage.value.getHeight())
    ctx?.drawImage(processedImage, canvasOffsetX, canvasOffsetY, outputImage.value.getWidth() * imageScale, outputImage.value.getHeight() * imageScale)
  }
}

async function processImage() {
  const workerPool = new WorkerPool('../../workers/task-worker.js', onSingleWorkerFinish, onAllWorkerFinish);
  const tileSize = 64
  const { locationX, locationY, paddingLeft, paddingRight, paddingTop, paddingBottom, xNum, yNum } = splitImage({ tileSize: 64, minOverlap: 12, image: myImage.value })
  paddingArray.paddingLeft = paddingLeft
  paddingArray.paddingRight = paddingRight
  paddingArray.paddingTop = paddingTop
  paddingArray.paddingBottom = paddingBottom
  for (let i = 0; i < xNum; i++) {
    for (let j = 0; j < yNum; j++) {
      const tileImage = myImage.value.getFixedPositionBuffer(locationX[i], locationX[i] + tileSize, locationY[j], locationY[j] + tileSize)
      const tile = new CustomImage(tileSize, tileSize)
      tile.setFixedPositionBuffer(0, tileSize, 0, tileSize, tileImage)
      workerPool.addTask({image: tile}, `${i}-${j}`)
    }
  }
}

function onSingleWorkerFinish(data: { taskId: string, result: any }) {
  const { taskId, result } = data
  const processResult = new CustomImage(result.width, result.height, result.data)
  const tileSize = 64;
  const [i, j] = taskId.split('-').map(Number)
  if (!outputImage.value) {
    outputImage.value = new CustomImage(myImage.value.getWidth() * 4, myImage.value.getHeight() * 4);
  }
  const tileImage = processResult.getFixedPositionBuffer(0, tileSize * 4, 0, tileSize * 4);
  outputImage.value.setFixedPositionBuffer(paddingArray.paddingLeft[i] * 4, outputImage.value.getWidth() - paddingArray.paddingRight[i] * 4, paddingArray.paddingTop[j] * 4, outputImage.value.getHeight() - paddingArray.paddingBottom[j] * 4, tileImage);
  console.log(outputImage.value)
  // const canvasContext = canvasRef.value!.getContext("2d");

  // const oImg = canvasContext?.createImageData(outputImage.value.getWidth(), outputImage.value.getHeight());
  // oImg?.data.set(outputImage.value.getData().buffer);
  // canvasContext?.putImageData(oImg!, 0, 0);
  // canvasRef.value?.toBlob((blob) => {
  //   const url = URL.createObjectURL(blob!);
  //   console.log(url)
  //   image.src = url;
  // })
}

function onAllWorkerFinish() {
  const canvasContext = canvasRef.value!.getContext("2d");

  const oImg = canvasContext?.createImageData(outputImage.value.getWidth(), outputImage.value.getHeight());
  oImg?.data.set(outputImage.value.getData().buffer);
  canvasContext?.putImageData(oImg!, 0, 0);
  canvasRef.value?.toBlob((blob) => {
    const url = URL.createObjectURL(blob!);
    processedImage.src = url;
    processedImageUrl.value = url;
    processedImage.onload = () => {
      drawCanvasImage(imageScale.value, originalCanvasOffsetX.value + myImage.value.getWidth(), originalCanvasOffsetY.value, false)
    }
  }, 'image/jpeg', 0.92)
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
