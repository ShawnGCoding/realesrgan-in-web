<script lang="ts" setup>
import { ref, useTemplateRef, watch, reactive } from "vue"
import CustomImage from "./classes/customImage";
const canvasRef = useTemplateRef<HTMLCanvasElement>("canvasRef")
const shadowCanvasRef = useTemplateRef<HTMLCanvasElement>("shadowCanvasRef")
const containerRef = useTemplateRef<HTMLDivElement>("containerRef")
const props = defineProps<{
  uploadedFile: File
}>()
const image = reactive(new Image())
const myImage = ref(new CustomImage())

watch(() => props.uploadedFile, (newVal: File) => {
  updateCanvasSize()
  readFile(newVal)
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
      const imageData = ctx?.getImageData(0, 0, image.width, image.height).data
      myImage.value = new CustomImage(image.width, image.height, imageData);
      
      const canvasWidth = canvasRef.value!.width
      const canvasHeight = canvasRef.value!.height

      // 将图片缩放到合适的大小
      const imageScale = Math.min(0.8 * canvasWidth / image.width, 0.8 * canvasHeight / image.height, 4);
      const canvasOffsetX = (canvasWidth - image.width * imageScale) / 2
      const canvasOffsetY = (canvasHeight - image.height * imageScale) / 2

      drawCanvasImage(imageScale, canvasOffsetX, canvasOffsetY)
    }
  }
}

function drawCanvasImage(imageScale: number, canvasOffsetX: number, canvasOffsetY: number) {
  const ctx = canvasRef.value!.getContext("2d")
  ctx?.clearRect(0, 0, canvasRef.value!.width, canvasRef.value!.height)
  ctx?.drawImage(image, canvasOffsetX, canvasOffsetY, myImage.value.getWidth() * imageScale, myImage.value.getHeight() * imageScale)
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