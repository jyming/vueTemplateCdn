const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

function addStyleResource(rule) {
  rule
    .use('style-resource')
    .loader('style-resources-loader')
    .options({
      patterns: [path.resolve(__dirname, 'src/assets/style/common.less')]
    })
}

module.exports = {
  pages: {
    index: {
      entry: "src/main.js",
      title: "h5111"
    }
  },
  publicPath: './',
  productionSourceMap: false,
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@$', resolve('src'))
      .set('assets', resolve('src/assets'))
      .set('request', resolve('src/request'))
      .set('components', resolve('src/components'))
    const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
    types.forEach((type) =>
      addStyleResource(config.module.rule('less').oneOf(type))
    )
  },
  devServer: {
    proxy: {
      '/': {
        target: 'http://192.168.1.125:8091',
        ws: false,
        changeOrigin: true
      }
    }
  },
  css: {
    loaderOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  }
}
