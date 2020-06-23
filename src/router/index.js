import store from '@/store'
const routes = [
  {
    path: '/news/:id',
    name: 'news',
    component: () => import('../views/news')
  },
  {
    path: '*',
    name: 'error',
    component: () => import('../views/error')
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.news !== 'news') {
    document.title = store.state.documentTitle
  }
  next()
})

export default router
