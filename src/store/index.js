export default new Vuex.Store({
  state: {
    documentTitle: document.title,
    baseUrl: process.env.VUE_APP_API,
    loading: true
  },
  mutations: {
    set(state, opaction) {
      state[opaction.name] = opaction.params
    }
  }
})
