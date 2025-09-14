<template>
  <div class="background-container">
      <div class="background-image"></div>
      <div class="background-overlay"></div>
  </div>
  
  <!-- 主要内容 -->
  <div class="container">
      <div class="logo">
          <h1><span>AI超分辨率</span></h1>
      </div>
      
      <p class="tagline">
          使用尖端人工智能技术提升您的图像质量。我们的超分辨率算法能够将低分辨率图像转换为高清版本，保留细节并增强清晰度。
      </p>
      
      <div class="buttons-container">
          <button class="btn btn-primary" @click="router.push('/picture-compare')">
              超分对比图片
          </button>
          <button class="btn btn-secondary" disabled>
              AI超分图片(待开发)
          </button>
      </div>
      
      <div class="features">
          <div class="feature">
              <div class="feature-icon">
              </div>
              <h3>智能增强</h3>
              <p>利用深度学习算法智能识别图像内容，提升分辨率同时保持自然外观。</p>
          </div>
          <div class="feature">
              <div class="feature-icon">
              </div>
              <h3>无损放大</h3>
              <p>最高支持4倍无损放大，不损失图像质量，保持细节清晰。</p>
          </div>
          <div class="feature">
              <div class="feature-icon">
              </div>
              <h3>快速处理</h3>
              <p>优化算法实现快速处理，无需漫长等待即可获得高质量结果。</p>
          </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

</script>

<style scoped>
/* 基础样式 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
    color: #fff;
    overflow-x: hidden;
    background: #0f1120;
}

/* 背景样式 */
.background-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: -1;
    overflow: hidden;
}

.background-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80');
    background-size: cover;
    background-position: center;
    filter: brightness(0.3);
    transform: scale(1.1);
    transition: transform 8s ease, filter 8s ease;
    z-index: 10;
}

.background-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(34, 46, 95, 0.85) 0%, rgba(12, 18, 45, 0.9) 100%);
}

/* 内容样式 */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.logo {
    margin-bottom: 40px;
    opacity: 0;
    animation: fadeInDown 1s ease forwards 0.5s;
}

.logo h1 {
    font-size: 2.5rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
}


.logo span {
    background: linear-gradient(135deg, #6b7ff7 0%, white 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.tagline {
    font-size: 1.2rem;
    margin-bottom: 60px;
    max-width: 700px;
    line-height: 1.6;
    opacity: 0;
    animation: fadeInUp 1s ease forwards 0.8s;
    color: white;
}

/* 按钮样式 */
.buttons-container {
    display: flex;
    gap: 25px;
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 80px;
    opacity: 0;
    animation: fadeInUp 1s ease forwards 1.1s;
}

.btn {
    position: relative;
    padding: 18px 35px;
    border-radius: 50px;
    font-size: 1.1rem;
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.4s ease;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.btn i {
    margin-right: 10px;
    font-size: 1.3rem;
}

.btn-primary {
    background: linear-gradient(135deg, #6b7ff7 0%, #4f6df5 100%);
    color: white;
    border: none;
}

.btn-primary:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 25px rgba(79, 109, 245, 0.3);
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 25px rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.15);
}

/* 特性展示 */
.features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    margin-top: 40px;
    width: 100%;
    opacity: 0;
    animation: fadeInUp 1s ease forwards 1.4s;
}

.feature {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 30px;
    text-align: center;
    transition: transform 0.4s ease, box-shadow 0.4s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color:aliceblue
}

.feature:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.feature-icon {
    width: 70px;
    height: 70px;
    background: linear-gradient(135deg, #6b7ff7 0%, #4f6df5 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    font-size: 1.8rem;
}

.feature h3 {
    font-size: 1.4rem;
    margin-bottom: 15px;
}

.feature p {
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
}

/* 动画定义 */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .buttons-container {
        flex-direction: column;
        align-items: center;
    }
    
    .btn {
        width: 100%;
        max-width: 300px;
    }
    
    .features {
        grid-template-columns: 1fr;
    }
    
    .logo h1 {
        font-size: 2rem;
    }
    
    .tagline {
        font-size: 1rem;
        padding: 0 10px;
    }
}

/* 背景动画效果 */
.background-image.zoomed {
    transform: scale(1);
    filter: brightness(0.4);
}

/* 按钮涟漪效果 */
.btn-ripple {
    position: absolute;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 0.6s linear;
}

@keyframes ripple {
    to {
        transform: scale(2.5);
        opacity: 0;
    }
}
</style>