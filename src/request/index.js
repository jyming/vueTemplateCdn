import store from '../store'
// 创建一个错误
function errorCreate(msg) {
  console.error(msg)
}

// 创建一个 axios 实例
const request = axios.create({
  baseURL: store.state.baseUrl,
  timeout: 30000 // 请求超时时间
})

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    if (response.data.code !== 'P00000') {
      vant.Notify(response.data.msg)
    }
    return response.data
  },
  (error) => {
    if (error && error.response) {
      switch (error.response.status) {
        case 400:
          error.message = '请求错误'
          break
        case 401:
          error.message = '未授权，请登录'
          break
        case 403:
          error.message = '拒绝访问'
          break
        case 404:
          error.message = '请求地址出错'
          break
        case 408:
          error.message = '请求超时'
          break
        case 500:
          error.message = '服务器内部错误'
          break
        case 501:
          error.message = '服务未实现'
          break
        case 502:
          error.message = '网关错误'
          break
        case 503:
          error.message = '服务不可用'
          break
        case 504:
          error.message = '网关超时'
          break
        case 505:
          error.message = 'HTTP版本不受支持'
          break
        default:
          break
      }
      vant.Notify(error.message)
      error.message += '：' + error.response.config.url
    } else {
      vant.Notify('网络波动')
    }
    errorCreate(error.message)
    return Promise.reject(error)
  }
)

export default request
