const ansiRegex = require('ansi-regex')
const fs = require('fs')

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
    proxy: { 
      '/phpApi': {
        target: (process.env.VUE_APP_USE_SERVE_PHP === "true" ? 
            process.env.VUE_APP_PHP_SERVE_HOST + '/' + process.env.VUE_APP_PHP_SERVE_CONTEXT :
            "http://127.0.0.1:" + process.env.VUE_APP_PPORT + '/' + process.env.VUE_APP_PHP_SERVE_CONTEXT),
        changeOrigin: true,
        logLevel: 'debug',
        secure: false,
        ws: true,
        pathRewrite: {
          '^/phpApi': ''
        }
      }
      , '/javaApi': {
        target: (process.env.VUE_APP_USE_SERVE_JAVA === "true" ? 
            process.env.VUE_APP_JAVA_SERVE_HOST + '/' + process.env.VUE_APP_JAVA_SERVE_CONTEXT :
            "http://127.0.0.1:" + process.env.VUE_APP_JPORT + '/' + process.env.VUE_APP_JAVA_SERVE_CONTEXT),
        changeOrigin: true,
        logLevel: 'debug',
        secure: false,
        ws: true,
        pathRewrite: {
          '^/javaApi': ''
        }
      }
    }

    
    // 특정 포트 지정 가능
    
    // http로 사용할 시 포트 (https로 사용시 아래 주석)
    // 시작 / http
//    , port:80
    // 끝 / http
    // https로 사용 할 시 포트 (http로 사용시 아래 3개 항목 주석)
    // 시작 / https 
    , port:443
//	, host: 'eval.scrapmaster.co.kr'
	, host: 'local.scrapmaster.co.kr'
    , https: {
      key: fs.readFileSync('ssl/star_scrapmaster_co_kr.key'),
      cert: fs.readFileSync('ssl/star_scrapmaster_co_kr.crt'),
      ca: fs.readFileSync('ssl/star_scrapmaster_co_kr.ca_root'),
    }
    // 끝 / https
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
