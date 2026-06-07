  import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/config'
  },
  {
    path: '/config',
    name: 'Config',
    component: () => import('@/views/ConfigView.vue')
  },
  {
    path: '/preview',
    name: 'Preview',
    component: () => import('@/views/PreviewView.vue'),
    children: []
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
