<template>
  <div class="love-page">
    <!-- 背景装饰 -->
    <div class="background">
      <div class="stars"></div>
      <div class="hearts-container">
        <div
          v-for="i in 30"
          :key="i"
          class="heart"
          :style="getHeartStyle()"
        ></div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="content">
      <div class="main-card" :class="{ 'show': showContent }">
        <div class="card-inner">
          <!-- 标题 -->
          <h1 class="title" :class="{ 'animate': showContent }">
            <span class="title-line">给</span>
            <span class="title-line">最</span>
            <span class="title-line">珍</span>
            <span class="title-line">贵</span>
            <span class="title-line">的</span>
            <span class="title-line">你</span>
          </h1>

          <!-- 副标题 -->
          <div class="subtitle" :class="{ 'animate': showContent }">
            <p class="subtitle-text">💕 我想对你说 💕</p>
          </div>

          <!-- 文字内容 -->
          <div class="text-content" :class="{ 'animate': showContent }">
            <div class="message-card" v-for="(message, index) in messages" :key="index">
              <p class="message-text">{{ message }}</p>
            </div>
          </div>

          <!-- 按钮区域 -->
          <div class="button-area" :class="{ 'animate': showContent }">
            <button class="love-button" @click="showMore = !showMore">
              {{ showMore ? '收起' : '查看更多' }}
            </button>
          </div>

          <!-- 更多内容 -->
          <transition name="fade">
            <div v-if="showMore" class="more-content">
              <div class="more-card" v-for="(item, index) in moreMessages" :key="index">
                <div class="more-icon">{{ item.icon }}</div>
                <p class="more-text">{{ item.text }}</p>
              </div>
            </div>
          </transition>

          <!-- 底部装饰 -->
          <div class="footer" :class="{ 'animate': showContent }">
            <p class="footer-text">❤️ Forever & Always ❤️</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showContent = ref(false)
const showMore = ref(false)

const messages = [
  '遇见你，是我生命中最美好的意外',
  '你的笑容，是我每天最想看到的风景',
  '和你在一起的每一刻，都让我感到无比幸福',
  '我想和你一起，走过每一个春夏秋冬',
]

const moreMessages = [
  { icon: '🌹', text: '愿我们的爱情如玫瑰般美丽' },
  { icon: '⭐', text: '你是我生命中最亮的星' },
  { icon: '🌙', text: '每个夜晚，都想和你说晚安' },
  { icon: '☀️', text: '你是我心中的太阳，温暖我的每一天' },
  { icon: '💝', text: '想把全世界最好的都给你' },
  { icon: '🎈', text: '和你在一起的每一天都是节日' },
]

const getHeartStyle = () => {
  const delay = Math.random() * 5
  const duration = 3 + Math.random() * 2
  const left = Math.random() * 100
  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  }
}

onMounted(() => {
  setTimeout(() => {
    showContent.value = true
  }, 300)
})
</script>

<style scoped lang="scss">
.love-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  z-index: 0;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.stars {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 20% 30%, white, transparent),
    radial-gradient(2px 2px at 60% 70%, white, transparent),
    radial-gradient(1px 1px at 50% 50%, white, transparent),
    radial-gradient(1px 1px at 80% 10%, white, transparent),
    radial-gradient(2px 2px at 90% 40%, white, transparent),
    radial-gradient(1px 1px at 33% 60%, white, transparent),
    radial-gradient(1px 1px at 55% 80%, white, transparent);
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: sparkle 3s linear infinite;
  opacity: 0.8;
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
}

.hearts-container {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.heart {
  position: absolute;
  width: 20px;
  height: 20px;
  background: #ff6b9d;
  transform: rotate(45deg);
  bottom: -20px;
  opacity: 0.7;
  animation: floatUp linear infinite;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background: #ff6b9d;
    border-radius: 50%;
  }

  &::before {
    top: -10px;
    left: 0;
  }

  &::after {
    left: -10px;
    top: 0;
  }
}

@keyframes floatUp {
  0% {
    transform: translateY(0) rotate(45deg) scale(0.5);
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) rotate(45deg) scale(1.2);
    opacity: 0;
  }
}

.content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 800px;
}

.main-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 30px;
  padding: 50px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transform: translateY(30px) scale(0.9);
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);

  &.show {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 3.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;

  .title-line {
    display: inline-block;
    opacity: 0;
    transform: translateY(-20px);
    transition: all 0.5s ease;

    .title.animate & {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .title-line:nth-child(1) { transition-delay: 0.1s; }
  .title-line:nth-child(2) { transition-delay: 0.2s; }
  .title-line:nth-child(3) { transition-delay: 0.3s; }
  .title-line:nth-child(4) { transition-delay: 0.4s; }
  .title-line:nth-child(5) { transition-delay: 0.5s; }
  .title-line:nth-child(6) { transition-delay: 0.6s; }
}

.subtitle {
  text-align: center;
  margin-bottom: 40px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease 0.7s;

  &.animate {
    opacity: 1;
    transform: translateY(0);
  }

  .subtitle-text {
    font-size: 1.5rem;
    color: #764ba2;
    font-weight: 500;
  }
}

.text-content {
  margin-bottom: 30px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease 0.9s;

  &.animate {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-left: 4px solid #764ba2;
  border-radius: 15px;
  padding: 20px 25px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  animation: slideInLeft 0.6s ease forwards;

  @for $i from 1 through 4 {
    &:nth-child(#{$i}) {
      animation-delay: #{0.9 + ($i - 1) * 0.15}s;
      opacity: 0;
    }
  }

  &:hover {
    transform: translateX(10px);
    box-shadow: 0 5px 20px rgba(118, 75, 162, 0.3);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.message-text {
  font-size: 1.2rem;
  line-height: 1.8;
  color: #333;
  margin: 0;
}

.button-area {
  text-align: center;
  margin-bottom: 30px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease 1.5s;

  &.animate {
    opacity: 1;
    transform: translateY(0);
  }
}

.love-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 1.1rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(118, 75, 162, 0.4);
  font-weight: 600;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(118, 75, 162, 0.6);
  }

  &:active {
    transform: translateY(-1px);
  }
}

.more-content {
  margin-top: 30px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.more-card {
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.2) 0%, rgba(79, 172, 254, 0.2) 100%);
  border-radius: 15px;
  padding: 25px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(118, 75, 162, 0.2);
  }
}

.more-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.more-text {
  font-size: 1rem;
  color: #555;
  margin: 0;
  line-height: 1.6;
}

.footer {
  text-align: center;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid rgba(118, 75, 162, 0.2);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease 1.8s;

  &.animate {
    opacity: 1;
    transform: translateY(0);
  }
}

.footer-text {
  font-size: 1.3rem;
  color: #764ba2;
  font-weight: 600;
  margin: 0;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

// 响应式设计
@media (max-width: 768px) {
  .main-card {
    padding: 30px 20px;
  }

  .title {
    font-size: 2.5rem;
  }

  .subtitle-text {
    font-size: 1.2rem;
  }

  .message-text {
    font-size: 1rem;
  }

  .more-content {
    grid-template-columns: 1fr;
  }
}
</style>