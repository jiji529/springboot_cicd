const ansiRegex = require('ansi-regex')

module.exports = {
  publicPath: '/',
  // publicPath: '', /* 배포 단계에서 Failed to load resource: ~ 오류 출력 시 */

  /* 
    [배포 단계에서 vue.js와 API의 출처(origin)이 다를 때, 처리 방법]
    먼저, 실제 배포할 때 devServer는 작동하지 않는다. 

    1. store.js에서 hiddenLink1에 요청할 API 전체 경로를 입력한다.
    2. API 서버에서 access-control-allow-origin 응답헤더를 세팅한다.
  */
  devServer: { // 배포 시, 적용 안해도 됨.
    proxy: { // proxyTable 설정
      '/premium_eval-phpAPI/evalApi': {
        target: (process.env.VUE_APP_USE_SERVE_PHP === "true" ? 
          process.env.VUE_APP_SERVE_HOST + process.env.VUE_APP_PHP_PATH :
          "http://127.0.0.1" + process.env.VUE_APP_PHP_PATH),
        changeOrigin: true,
        ws: true,
        logLevel: 'debug',
        pathRewrite: {
          '^/premium_eval-phpAPI/evalApi': ''
        }
      }
    } // proxy
  },
  
  // chainWebpack: config => {
  //   config.resolve.alias.set('@', path.resolve(__dirname, 'src/'))
  // },
  outputDir: undefined,
  assetsDir: undefined,
  runtimeCompiler: undefined,
  productionSourceMap: undefined,
  parallel: undefined,
  css: undefined
  , transpileDependencies: [ansiRegex]
  ,lintOnSave : false
};
