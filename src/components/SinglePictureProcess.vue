<script lang="ts" setup>
import { ref, useTemplateRef, reactive } from 'vue'
import CustomImage from './classes/customImage'
import PictureCompare from './PictureCompare.vue'

const originImage = ref<HTMLImageElement>(new Image())
const originImageScale = ref(1)
const hasUploadedOriginImage = ref(false)
const canvasRef = useTemplateRef<HTMLCanvasElement>("canvasRef")
const shadowCanvasRef = useTemplateRef<HTMLCanvasElement>("shadowCanvasRef")
const containerRef = useTemplateRef<HTMLDivElement>("containerRef")
const originImageOffsetX = ref(0)
const originImageOffsetY = ref(0)
const drawer = ref(false)
const originCustomImage = ref<CustomImage>(new CustomImage())

const showResultImage = ref(false)

const worker = ref(new Worker(new URL('../workers/task-worker.js', import.meta.url), { type: 'module' }))

const OptionsForm = reactive({
  scaleValue: '4x',
  tileSize: 64
})


const handleOriginFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const imageSrc = e.target?.result as string
      originImage.value.src = imageSrc
      hasUploadedOriginImage.value = true
      originImage.value.onload = () => {
        updateCanvasSize()
        drawOriginImage()
        originCustomImage.value = createCustomImage()
      }
    }
  }
}

const drawOriginImage = () => {
  const ctx = canvasRef.value!.getContext("2d")
  originImageScale.value = Math.min(0.6 * canvasRef.value!.width / originImage.value.width, 0.6 * canvasRef.value!.height / originImage.value.height, 4)

  originImageOffsetX.value = (canvasRef.value!.width - originImage.value.width * originImageScale.value) / 2
  originImageOffsetY.value = (canvasRef.value!.height - originImage.value.height * originImageScale.value) / 2
  ctx?.drawImage(originImage.value, originImageOffsetX.value, originImageOffsetY.value, originImage.value.width * originImageScale.value, originImage.value.height * originImageScale.value)
}

const updateCanvasSize = () => {
  canvasRef.value!.width = containerRef.value!.offsetWidth * window.devicePixelRatio
  canvasRef.value!.height = containerRef.value!.offsetHeight * window.devicePixelRatio
  canvasRef.value!.style.width = containerRef.value!.offsetWidth + 'px'
  canvasRef.value!.style.height = containerRef.value!.offsetHeight + 'px'
}

const createCustomImage = () => {
  const canvasContext = shadowCanvasRef.value!.getContext("2d")
  canvasContext?.drawImage(originImage.value, 0, 0);
  const imageData = canvasContext?.getImageData(0, 0, originImage.value.width, originImage.value.height).data;
  return new CustomImage(originImage.value.width, originImage.value.height, imageData);
}

const targetImageData = ref()
const originImageData = ref()

const handleSubmit = () => {
  worker.value.addEventListener('message', (event) => {
    const { data } = event
    const { result, origin } = data
      console.log('!!!!!!!!!!!!!!!!!')
      console.log(result)
    targetImageData.value = result
    originImageData.value = origin
    showResultImage.value = true
  })
  worker.value.postMessage({
    image: originCustomImage.value.getData().buffer,
    width: originCustomImage.value.getWidth(),
    height: originCustomImage.value.getHeight()
  }, [originCustomImage.value.getData().buffer])
}
</script>
<template>
  <div>
    <div class="single-picture-process-container" ref="containerRef" v-if="!showResultImage">
      <template v-if="hasUploadedOriginImage">
        <canvas ref="canvasRef"></canvas>
        <canvas ref="shadowCanvasRef"></canvas>
        <div class="setting-btn" @click="drawer = true">
          设置
        </div>
      </template>
      <template v-else>
        <div class="upload-origin-btn">
          <input type="file" id="origin-file-input" accept="image/*" class="origin-file-input" @change="handleOriginFileChange"/>
          请上传需要超分的图片
        </div>
      </template>
      <el-drawer v-model="drawer" title="超分参数设置" direction="ltr">
        <div class="scale-select">
          <div>放大倍数:</div>
          <el-select v-model="OptionsForm.scaleValue" placeholder="Select" style="width: 240px">
            <el-option
              key="4x"
              label="4x"
              value="4x"
            />
            <el-option
              key="8x"
              label="8x"
              value="8x"
            />
          </el-select>
        </div>
        <div class="scale-select">
          <div>分片大小:</div>
          <el-select v-model="OptionsForm.tileSize" placeholder="Select" style="width: 240px">
            <el-option
              key="64"
              label="64"
              value="64"
            />
            <el-option
              key="32"
              label="32"
              value="32"
            />
          </el-select>
        </div>
        <div class="submit-btn">
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </el-drawer>
    </div>
    <div v-else>
      <PictureCompare :fromProcess="true" :targetImageData="targetImageData" :originImageData="originImageData" :originImageWidth="originCustomImage.getWidth()" :originImageHeight="originCustomImage.getHeight()" />
    </div>
  </div>
</template>
<style scoped lang="scss">
.single-picture-process-container {
  width: 100%;
  height: 100vh;
  background-color: #EBF2F4;
  opacity: 0.88;
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  .upload-origin-btn {
    width: 280px;
    height: 100px;
    background-color: #10121E;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
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
  .setting-btn {
    width: 100px;
    height: 50px;
    background-color: #10121E;
    position: absolute;
    bottom: 3%;
    left: 50%;
    transform: translateX(-50%);
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
    cursor: pointer;
  }
  .upload-origin-btn:hover, .setting-btn:hover {
    background-color: #ffffff;
    font-size: 22px;
    color: #10121E;
  }
}
.scale-select {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  .el-select {
    width: 240px;
  }
}
.submit-btn {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
