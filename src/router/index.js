import { createRouter, createWebHistory } from 'vue-router'
import { getRoutes } from '~/packages/utils'

const routerFiles = import.meta.globEager('../views/**/index.vue')
export const routes = [{ path: '/', name: '首页', component: '', redirect: '/index' }].concat(getRoutes(routerFiles))

console.log('routes', routes)
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})
export default router