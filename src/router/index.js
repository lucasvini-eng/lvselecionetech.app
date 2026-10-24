import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    // Painel de cadastro (protegido por ADMIN_TOKEN no backend; não indexar)
    { path: '/admin', name: 'admin', component: () => import('../views/AdminView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior(to) {
    // Âncoras (#monitores etc.) usam rolagem suave, respeitando redução de movimento
    if (to.hash) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      return { el: to.hash, behavior: reduce ? 'auto' : 'smooth', top: 88 }
    }
    return { top: 0 }
  }
})

export default router
