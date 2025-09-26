<template>
  <div class="picture-compare-container" ref="containerRef" @mousemove="dragCanvas" @mousedown="startDragCanvas" @mouseup="endDragCanvas" @wheel="resizeCanvas">
    <div>
      <a href="#" class="back-btn back-btn-dark" @click="router.push('/')">
          < 返回
      </a>
    </div>
    <canvas id="canvas" ref="canvasRef"></canvas>
    <canvas ref="shadowCanvasRef"></canvas>
    <div class="upload-origin-btn left-btn" v-if="!fromProcess">
      <input type="file" id="origin-file-input" accept="image/*" class="origin-file-input" @change="handleOriginFileChange"/>
      上传原图
    </div>
    <div class="upload-target-btn right-btn" v-if="!fromProcess">
      <input type="file" id="target-file-input" accept="image/*" class="target-file-input" @change="handleTargetFileChange"/>
      上传超分后的图片
    </div>
    <div class="line" :style="{ left: `${linePosition / devicePixelRatio}px` }"
     @mousedown.stop.prevent="startDragLine" @mousemove.stop.prevent="updateLinePosition">
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
import { onMounted, ref, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import CustomImage from './classes/customImage'

const router = useRouter()

const devicePixelRatio = window.devicePixelRatio

const canvasRef = useTemplateRef<HTMLCanvasElement>("canvasRef")
const shadowCanvasRef = useTemplateRef<HTMLCanvasElement>("shadowCanvasRef")
const containerRef = useTemplateRef<HTMLDivElement>("containerRef")
const originImage = ref<HTMLImageElement>(new Image())
const targetImage = ref<HTMLImageElement>(new Image())
const originImageScale = ref(1)
const targetImageScale = ref(1)
const originImageOffsetX = ref(0)
const originImageOffsetY = ref(0)
const targetImageOffsetX = ref(0)
const targetImageOffsetY = ref(0)
const isDraggingLine = ref(false)
const isDraggingCanvas = ref(false)
const linePosition = ref(0)

onMounted(() => {
  if (props.targetImageData && props.originImageData && props.originImageWidth && props.originImageHeight) {

    const targetImage = new CustomImage(props.originImageWidth * 4, props.originImageHeight * 4, new Uint8ClampedArray(props.targetImageData))

    const shadowCanvasContext = shadowCanvasRef.value!.getContext("2d")
    shadowCanvasRef.value!.width =  targetImage.getWidth()
    shadowCanvasRef.value!.height = targetImage.getHeight()


    const targetImageData = shadowCanvasContext!.createImageData(targetImage.getWidth(), targetImage.getHeight())
    targetImageData.data.set(props.targetImageData)
    shadowCanvasContext?.putImageData(targetImageData, 0, 0)




    shadowCanvasContext?.drawImage(targetImage, 0, 0, targetImage.getWidth(), targetImage.getHeight())
    shadowCanvasContext?.drawImage(originImage.value, 0, 0, props.originImageWidth, props.originImageHeight)
    originImage.value.src = props.originImageData
    targetImage.value.src = props.targetImageData
    originImage.value.onload = () => {
      drawCanvasImage('origin')
    }
    targetImage.value.onload = () => {
      drawCanvasImage('target')
    }
  }
})

const props = defineProps<{
  fromProcess?: boolean
  targetImageData?: any
  originImageData?: any
  originImageWidth?: number
  originImageHeight?: number
}>()


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
  debugger
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
  if (!isDraggingLine.value) {
    return
  }
  const left = canvasRef.value!.getBoundingClientRect().left
  linePosition.value = event.clientX * window.devicePixelRatio - left
  drawLineChangedImage();
}
const drawLineChangedImage = () => {
  requestAnimationFrame(_drawImage)
}
const _drawImage = () => {
  const canvasContext = canvasRef.value!.getContext("2d")
  canvasContext?.clearRect(0, 0, canvasRef.value!.width, canvasRef.value!.height)
  drawSplitOriginalImage()
  drawSplitTargetImage()
}
const startDragLine = () => {
  isDraggingLine.value = true
}

const dragCanvas = (event: MouseEvent) => {
  if (isDraggingLine.value) {
    updateLinePosition(event)
  }
  if (!originImage.value.src || !targetImage.value.src) {
    return
  }
  if (isDraggingCanvas.value) {
    originImageOffsetX.value += event.movementX * window.devicePixelRatio
    originImageOffsetY.value += event.movementY * window.devicePixelRatio
    _drawImage();
  }
}
const startDragCanvas = (event: MouseEvent) => {
  if (!originImage.value.src || !targetImage.value.src) {
    return
  }
  const left = canvasRef.value!.getBoundingClientRect().left
  const mouseX = event.clientX - left;
  if (Math.abs(mouseX - linePosition.value / window.devicePixelRatio) < 10) {
    isDraggingLine.value = true
    return
  }
  isDraggingCanvas.value = true
}
const endDragCanvas = () => {
  isDraggingCanvas.value = false
  isDraggingLine.value = false
}
const resizeCanvas = (event: WheelEvent) => {
  if (!originImage.value.src || !targetImage.value.src) {
    return
  }
  const prevScale = originImageScale.value
  const maxScale = 20 * prevScale;
  const minScale = 0.05 * prevScale;
  const top = canvasRef.value!.getBoundingClientRect().top
  const left = canvasRef.value!.getBoundingClientRect().left
  const mouseX = (event.clientX - left) * window.devicePixelRatio
  const mouseY = (event.clientY - top) * window.devicePixelRatio
  if (event.deltaY > 0) {
    originImageScale.value = Math.min(maxScale, prevScale * 1.1)
  } else {
    originImageScale.value = Math.max(minScale, prevScale * 0.9)
  }
  const ratio = originImageScale.value / prevScale
  originImageOffsetX.value = mouseX - (mouseX - originImageOffsetX.value) * ratio
  originImageOffsetY.value = mouseY - (mouseY - originImageOffsetY.value) * ratio
  _drawImage()

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
  cursor: grab;
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
.back-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 14px 28px;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: none;
    border-radius: 50px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.4s ease;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    text-decoration: none;
    top: 10px;
    left: 10px;
}

.back-btn i {
    margin-right: 10px;
    transition: transform 0.3s ease;
}

.back-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    color: #10121E;
}

.back-btn:hover i {
    transform: translateX(-5px);
}

.back-btn:active {
    transform: translateY(1px);
}

.back-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: all 0.6s ease;
    transform: translateX(-100%);
}

.back-btn:hover::before {
    transform: translateX(100%);
}
.back-btn-dark {
    background: rgba(0, 0, 0, 0.7);
}
</style>
