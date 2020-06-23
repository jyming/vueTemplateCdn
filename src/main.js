import App from './App.vue'
import router from './router'
import store from './store'
import api from 'assets/js/api'

Vue.config.productionTip = false

Vue.use(api, store)

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
