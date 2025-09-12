<template>
  <div class="picture-compare-container" ref="containerRef">
    <canvas id="canvas" ref="canvasRef"></canvas>
    <div class="upload-origin-btn left-btn">
      <input type="file" id="origin-file-input" accept="image/*" class="origin-file-input" @change="handleOriginFileChange"/>
      上传原图
    </div>
    <div class="upload-target-btn right-btn">
      <input type="file" id="target-file-input" accept="image/*" class="target-file-input" @change="handleTargetFileChange"/>
      上传超分后的图片
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'

const canvasRef = useTemplateRef<HTMLCanvasElement>("canvasRef")
const containerRef = useTemplateRef<HTMLDivElement>("containerRef")
const originImage = ref<HTMLImageElement>(new Image())
const targetImage = ref<HTMLImageElement>(new Image())
const originImageScale = ref(1)
const targetImageScale = ref(1)
const originImageOffsetX = ref(0)
const originImageOffsetY = ref(0)
const targetImageOffsetX = ref(0)
const targetImageOffsetY = ref(0)

const hasUploadOriginImage = computed(() => {
  return originImage.value.src !== ''
})
const hasUploadTargetImage = computed(() => {
  return targetImage.value.src !== ''
})

const handleOriginFileChange = (event: Event) => {
  handleFileChange(event, 'origin')
}
const handleTargetFileChange = (event: Event) => {
  handleFileChange(event, 'target')
}

const handleFileChange = (event: Event, type: 'origin' | 'target') => {
  const file = (event.target as HTMLInputElement).files?.[0]
  console.log(file)
  if (file) {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const imageSrc = e.target?.result as string
      if (type === 'origin') {
        originImage.value.src = imageSrc
        originImage.value.onload = () => {
          drawCanvasImage(type)
        }
      } else {
        targetImage.value.src = imageSrc
        targetImage.value.onload = () => {
          drawCanvasImage(type)
        }
      }

    }
  }
}

function updateCanvasSize() {
  console.log(containerRef.value!.offsetWidth, containerRef.value!.offsetHeight)
  console.log(window.devicePixelRatio)
  canvasRef.value!.width = containerRef.value!.offsetWidth * window.devicePixelRatio
  canvasRef.value!.height = containerRef.value!.offsetHeight * window.devicePixelRatio
}

const drawCanvasImage = (type: 'origin' | 'target') => {
  updateCanvasSize()
  console.log(canvasRef.value!.width, canvasRef.value!.height)
  const canvasContext = canvasRef.value!.getContext("2d")
  canvasContext?.clearRect(0, 0, canvasRef.value!.width, canvasRef.value!.height)
  console.log(originImage.value.width, originImage.value.height)
  if (type === 'origin') {
    originImageScale.value = Math.min(0.6 * canvasRef.value!.width / originImage.value.width, 0.6 * canvasRef.value!.height / originImage.value.height, 4)
    originImageOffsetX.value = (canvasRef.value!.width - originImage.value.width * originImageScale.value) / 2
    originImageOffsetY.value = (canvasRef.value!.height - originImage.value.height * originImageScale.value) / 2
    canvasContext?.drawImage(originImage.value, originImageOffsetX.value, originImageOffsetY.value, originImage.value.width * originImageScale.value, originImage.value.height * originImageScale.value)
  } else {
    targetImageScale.value = Math.min(0.6 * canvasRef.value!.width / targetImage.value.width, 0.6 * canvasRef.value!.height / targetImage.value.height, 4)
    targetImageOffsetX.value = (canvasRef.value!.width - targetImage.value.width * targetImageScale.value) / 2
    targetImageOffsetY.value = (canvasRef.value!.height - targetImage.value.height * targetImageScale.value) / 2
    canvasContext?.drawImage(targetImage.value, targetImageOffsetX.value, targetImageOffsetY.value, targetImage.value.width * targetImageScale.value, targetImage.value.height * targetImageScale.value)
  }
}
</script>
<style scoped lang="scss">
.picture-compare-container {
  width: 100%;
  height: 100vh;
  background-color: #EBF2F4;
  opacity: 0.88;
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  #canvas {
    height: 100vh;
  }
  .upload-origin-btn, .upload-target-btn {
    width: 200px;
    height: 100px;
    background-color: #10121E;
    position: absolute;
    bottom: 3%;
    z-index: 1;
    border-radius: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
    font-weight: 500;
    color: #fff;
    transition: all 0.3s ease;
    .origin-file-input, .target-file-input {
      opacity: 0;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
  }
  .upload-origin-btn:hover, .upload-target-btn:hover {
    background-color: #ffffff;
    font-size: 22px;
    color: #10121E;
  }
  .left-btn {
    left: 40%;
  }
  .right-btn {
    right: 40%;
  }
}
</style>
