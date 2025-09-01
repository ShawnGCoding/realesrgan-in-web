<script lang="ts" setup>
const emit = defineEmits<{
  (e: 'file-uploaded', file: File): void
}>()

const handleFileUploaded = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    emit('file-uploaded', file)
  }
}
</script>
<template>
  <div class="upload-container">
    <label for="file-input">
        <div class="upload-btn">
            <div class="pulse"></div>
            <i class="fas fa-cloud-upload-alt"></i>
            <h3>点击或拖放图片到这里</h3>
            <p>PNG, JPG, JPEG</p>
        </div>
    </label>
    <input type="file" id="file-input" accept="image/*" @change="handleFileUploaded">
</div>
</template>
<style scoped lang="scss">
.upload-container {
    width: 600px;
    position: relative;
}
.upload-btn {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px 30px;
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 10px 30px rgba(0, 242, 254, 0.3);
    position: relative;
    overflow: hidden;
    border: 2px dashed rgba(255, 255, 255, 0.4);
}

.upload-btn:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 242, 254, 0.4);
    background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
}

.upload-btn:hover i {
    transform: scale(1.1);
}

.upload-btn:hover .pulse {
    opacity: 1;
}

.upload-btn i {
    font-size: 60px;
    margin-bottom: 15px;
    transition: transform 0.4s ease;
}

.upload-btn h3 {
    font-size: 24px;
    font-weight: 500;
    margin-bottom: 10px;
}

.upload-btn p {
    font-size: 16px;
    opacity: 0.9;
}

.pulse {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: radial-gradient(circle at center, transparent, rgba(255, 255, 255, 0.2));
    opacity: 0;
    transition: opacity 0.4s ease;
}

#file-input {
    display: none;
}

.drop-area {
    border: 2px dashed rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    padding: 25px;
    margin-top: 25px;
    background: rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;
}

.drop-area.active {
    background: rgba(255, 255, 255, 0.1);
    border-color: #00f2fe;
}

.drop-area p {
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 15px;
}
</style>
