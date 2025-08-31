<script lang="ts" setup>
import "@/components/uploadSinglePic.scss"
import UploadButton from "./UploadButton.vue"
import ImageProcessor from "./ImageProcessor.vue"
import { ref } from "vue"

const uploadedFile = ref<File>(new File([], "uploadedFile"))
const showImageProcessor = ref(false)
function handleFileUploaded (file: File): void {
  uploadedFile.value = file
  showImageProcessor.value = true
}

</script>
<template>
  <div class="container">
    <div class="upload-container" v-if="!showImageProcessor">
      <UploadButton @file-uploaded="handleFileUploaded" />
    </div>
    <div class="image-processor-container">
      <ImageProcessor :uploadedFile="uploadedFile" />
    </div>
  </div>
</template>