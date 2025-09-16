import { createRouter, createWebHistory } from 'vue-router'
import PictureCompare from '@/components/PictureCompare.vue'
import HomeView from '@/components/HomeView.vue'
import SinglePictureProcess from '@/components/SinglePictureProcess.vue'
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/picture-compare', component: PictureCompare },
    { path: '/single-picture', component: SinglePictureProcess },
  ],
})

export default router
