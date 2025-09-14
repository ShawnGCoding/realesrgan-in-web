<template>
  <div class="picture-compare-container" ref="containerRef" @mousemove.stop.prevent="updateLinePosition">
    <canvas id="canvas" ref="canvasRef"></canvas>
    <div class="upload-origin-btn left-btn">
      <input type="file" id="origin-file-input" accept="image/*" class="origin-file-input" @change="handleOriginFileChange"/>
      上传原图
    </div>
    <div class="upload-target-btn right-btn">
      <input type="file" id="target-file-input" accept="image/*" class="target-file-input" @change="handleTargetFileChange"/>
      上传超分后的图片
    </div>
    <div class="line" :style="{ left: `${linePosition / devicePixelRatio}px` }" 
     @mousedown.stop.prevent="startDragLine" @mouseup.stop.prevent="endDragLine">
    <div class="dragBall">
        <svg width="30" viewBox="0 0 27 20">
          <path fill="#ff3484" d="M9.6 0L0 9.6l9.6 9.6z"></path>
          <path fill="#5fb3e5" d="M17 19.2l9.5-9.6L16.9 0z"></path>
        </svg>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'

const devicePixelRatio = window.devicePixelRatio

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
const isDragging = ref(false)
const linePosition = ref(0)


const handleOriginFileChange = (event: Event) => {
  handleFileChange(event, 'origin')
}
const handleTargetFileChange = (event: Event) => {
  handleFileChange(event, 'target')
}

const handleFileChange = (event: Event, type: 'origin' | 'target') => {
  const file = (event.target as HTMLInputElement).files?.[0]
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
  canvasRef.value!.width = containerRef.value!.offsetWidth * window.devicePixelRatio
  canvasRef.value!.height = containerRef.value!.offsetHeight * window.devicePixelRatio
}

const drawCanvasImage = (type: 'origin' | 'target') => {
  updateCanvasSize()
  if (type === 'origin') {
    drawOriginalImage()
    // 画超分后的图片，使用分割线分割
    if (targetImage.value.src) {
      drawSplitTargetImage(true)
    }
  } else if (type === 'target') {
    if (!originImage.value.src) {
      drawTargetImage()
    } else {
      drawOriginalImage()
      drawSplitTargetImage(true)
    }

  }
}
const drawOriginalImage = () => {
  const canvasContext = canvasRef.value!.getContext("2d")
  canvasContext?.clearRect(0, 0, canvasRef.value!.width, canvasRef.value!.height)
  originImageScale.value = Math.min(0.6 * canvasRef.value!.width / originImage.value.width, 0.6 * canvasRef.value!.height / originImage.value.height, 4)
    originImageOffsetX.value = (canvasRef.value!.width - originImage.value.width * originImageScale.value) / 2
    originImageOffsetY.value = (canvasRef.value!.height - originImage.value.height * originImageScale.value) / 2
    canvasContext?.drawImage(originImage.value, originImageOffsetX.value, 
      originImageOffsetY.value, originImage.value.width * originImageScale.value, 
      originImage.value.height * originImageScale.value)
}

const drawTargetImage = () => {
  const canvasContext = canvasRef.value!.getContext("2d")
  canvasContext?.clearRect(0, 0, canvasRef.value!.width, canvasRef.value!.height)
  targetImageScale.value = Math.min(0.6 * canvasRef.value!.width / targetImage.value.width, 0.6 * canvasRef.value!.height / targetImage.value.height, 4)
  targetImageOffsetX.value = (canvasRef.value!.width - targetImage.value.width * targetImageScale.value) / 2
  targetImageOffsetY.value = (canvasRef.value!.height - targetImage.value.height * targetImageScale.value) / 2
  canvasContext?.drawImage(targetImage.value, targetImageOffsetX.value, targetImageOffsetY.value, targetImage.value.width * targetImageScale.value, targetImage.value.height * targetImageScale.value)
}

const drawSplitTargetImage = (isInitial: boolean = false) => {
  const canvasContext = canvasRef.value!.getContext("2d")
  if (isInitial) {
    linePosition.value = canvasRef.value!.width / 2
  }
  if (linePosition.value > originImageOffsetX.value) {
    canvasContext?.drawImage(targetImage.value, 
      (targetImage.value.width / originImage.value.width) * (linePosition.value - originImageOffsetX.value) / originImageScale.value,
      0,
      targetImage.value.width - (targetImage.value.width / originImage.value.width) * (linePosition.value - originImageOffsetX.value) / originImageScale.value,
      targetImage.value.height,
      linePosition.value,
      originImageOffsetY.value,
      originImageOffsetX.value + originImage.value.width * originImageScale.value - linePosition.value,
      originImage.value.height * originImageScale.value
    )
  } else {
    canvasContext?.drawImage(targetImage.value, 
      0,
      0,
      targetImage.value.width,
      targetImage.value.height,
      originImageOffsetX.value,
      originImageOffsetY.value,
      originImage.value.width * originImageScale.value,
      originImage.value.height * originImageScale.value
    )
  }
}

const drawSplitOriginalImage = () => {
  const canvasContext = canvasRef.value!.getContext("2d")
  if (linePosition.value > originImageOffsetX.value && linePosition.value < originImageOffsetX.value + originImage.value.width * originImageScale.value) {
    canvasContext?.drawImage(originImage.value, 0, 0, 
      (linePosition.value - originImageOffsetX.value) / originImageScale.value, 
      originImage.value.height,
      originImageOffsetX.value,
      originImageOffsetY.value,
      (linePosition.value - originImageOffsetX.value),
      originImage.value.height * originImageScale.value
    )
  } else {
    canvasContext?.drawImage(originImage.value, 0, 0, 
      originImage.value.width,
      originImage.value.height,
      originImageOffsetX.value,
      originImageOffsetY.value,
      originImage.value.width * originImageScale.value,
      originImage.value.height * originImageScale.value
    )
  }
}

const updateLinePosition = (event: MouseEvent) => {
  if (!isDragging.value) {
    return
  }
  const left = canvasRef.value!.getBoundingClientRect().left
  linePosition.value = event.clientX * window.devicePixelRatio - left
  drawLineChangedImage();
}
const drawLineChangedImage = () => {
  requestAnimationFrame(_drawLineChangedImage)
}
const _drawLineChangedImage = () => {
  drawSplitOriginalImage()
  drawSplitTargetImage()
}
const startDragLine = () => {
  isDragging.value = true
}
const endDragLine = () => {
  isDragging.value = false
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
    z-index: 1000;
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
    left: 35%;
  }
  .right-btn {
    right: 35%;
  }
}
.line {
  width: 5px;
  height: 100vh;
  background-color: #10121E;
  position: absolute;
  top: 0;
}
.dragBall {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: ew-resize;
}
</style>
