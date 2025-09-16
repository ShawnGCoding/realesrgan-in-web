<script lang="ts" setup>
import { ref, computed } from 'vue'

const originImage = ref<HTMLImageElement>(new Image())
const hasUploadedOriginImage = computed(() => {
  return originImage.value.src !== ''
})
</script>
<template>
  <div class="single-picture-process-container">
    <template v-if="hasUploadedOriginImage">
      <canvas></canvas>
      <canvas></canvas>
    </template>
    <template v-else>
      <UploadButton @file-uploaded="handleFileUploaded" />
    </template>

  </div>

</template>
<style scoped lang="scss">
</style>
