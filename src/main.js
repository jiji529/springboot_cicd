import '@babel/polyfill'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import moment from 'moment'
import VueMomentJS from 'vue-momentjs'
import VeeValidate from 'vee-validate';
import ko from 'vee-validate/dist/locale/ko.js'
import AsyncComputed from 'vue-async-computed'
import browserDetect from "vue-browser-detect-plugin";
import common from './common.js'
import statConfig from './template.js'

ko.messages.required = (field) => `'${field}'은/는 필수입력란 입니다.`
ko.messages.regex = (field) => `'${field}'의 형식이 올바르지 않습니다.`
Vue.use(VeeValidate,{
  locale: 'ko',
  dictionary: {
    ko
  }
});

Vue.config.productionTip = false;
Vue.prototype.$axios = axios;
Vue.prototype.$moment = moment;
Vue.prototype.$eventBus = new Vue();

Vue.use(browserDetect);
Vue.use(VueMomentJS, moment);
Vue.use(AsyncComputed);
Vue.use(common);
Vue.use(statConfig);

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app');

require('formdata-polyfill');

const ssdo = store.state.hiddenLink1;
axios.interceptors.request.use(
  async function (config) {
    let uris = [ssdo+'/login.php', ssdo+'/loginAuto.php', ssdo+'/auth.php'];
    if (uris.indexOf(config.url.trim()) === -1) {
      if (!await store.dispatch('loginCheckGentleAPI')) {
        if (router.history.current.name !== 'login') {
          alert('Logged out!');
          router.push('/login');
        }
      }
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  return Promise.reject(error);
});
axios.defaults.withCredentials = false; // 지정된 도메인으로 서버에서 받을 경우 true
