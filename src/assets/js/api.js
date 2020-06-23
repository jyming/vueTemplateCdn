var versions = (function () {
  var u = navigator.userAgent,
    p = navigator.platform
  return {
    trident: u.indexOf('Trident') > -1, //IE内核
    presto: u.indexOf('Presto') > -1, //opera内核
    webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
    gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
    mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
    ios: !!u.match(/i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
    android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器
    iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
    iPad: u.indexOf('iPad') > -1, //是否iPad
    weixin: u.indexOf('MicroMessenger') > -1, //是否微信
    webApp: u.indexOf('Safari') == -1, //是否web应用程序，没有头部与底部
    UCB: u.match(/UCBrowser/i) == 'UCBrowser',
    QQB: u.match(/MQQBrowser/i) == 'MQQBrowser',
    win: p.indexOf('Win') > -1, //判断是否是WIN操作系统
    mac: p.indexOf('Mac') > -1 //判断是否是Mac操作系统
  }
})()
exports.install = function (Vue, store) {
  Vue.prototype.$api = {
    versions,
    loading: function (boolean) {
      store.commit('set', {
        name: 'loading',
        params: boolean
      })
    }
  }
}
