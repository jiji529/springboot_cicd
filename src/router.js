/* eslint-disable no-console */
import Vue from 'vue';
import Router from 'vue-router';
import Email from './views/Email.vue';
import Eval from './views/Eval.vue';
import Login from './views/Login.vue';
import LoginAuto from './views/LoginAuto.vue';
import Preview from './views/Preview.vue';
import Setting from './views/Setting.vue';
import Stat from './views/Stat.vue';
import EvalAuto from './components/setting/EvalAuto';
import EvalItem from './components/setting/EvalItem';
import EvalValue from './components/setting/EvalValue';
import EvalMedia from './components/setting/EvalMedia';
import StatConfig from './components/setting/StatConfig';
import SettingEmail from './components/setting/Email';
import SettingMediaCategory from './components/setting/MediaCategory';
import LayoutAndCost from './components/setting/LayoutAndCost';
import store from '@/store';

Vue.use(Router);

// const requireAuth = () => (to, from, next) => {
//   // store.dispatch('loginCheckGentleAPI')
// 	// .then(() => {
//     store.getters.getIsAuth ? next() : next('login');
// 	// }).catch(() => {
// 	// 	store.getters.getIsAuth ? next() : next('login');
// 	// })
// };
let isNewMode = (localStorage.getItem('is-new-mode') === 'true');
let basePath = isNewMode ? '/eval' : '/old/eval';

const router = new Router({
  mode: 'history',
  routes: [{
    path: '*',
    meta: {
      public: true
    },
    redirect: {
      path: '/404'
    }
  }, {
    path: '/',
    name: 'root',
    meta: {},
    redirect: {
      path: basePath //'eval'
    }
  }, {
    path: '/eval',
    name: 'eval',
    component: Eval
  }, {
    path: '/stat',
    name: 'stat',
    component: Stat
  }, {
    path: '/setting',
    name: 'setting',
    component: Setting,
    redirect: {
      path: '/setting/eval-item'
    },
    children: [
      {path: '/setting/eval-item', name: 'setting-eval-item', component: EvalItem},
      {path: '/setting/eval-auto', name: 'setting-eval-auto', component: EvalAuto},
      {path: '/setting/eval-value', name: 'setting-eval-value', component: EvalValue},
      {path: '/setting/eval-media', name: 'setting-eval-media', component: EvalMedia},
      {path: '/setting/layout', name: 'setting-layout', component: LayoutAndCost},
      {path: '/setting/stat-config', name: 'setting-stat-config', component: StatConfig},
      {path: '/setting/email', name: 'setting-email', component: SettingEmail},
      {path: '/setting/media-category', name: 'setting-media-category', component: SettingMediaCategory}
    ],
  }, {
    path: '/preview',
    name: 'preview',
    component: Preview
  }, {
    path: '/email',
    name: 'email',
    component: Email
  }, {
    path: '/login',
    name: 'login',
    meta: {
      public: true
    },
    component: Login,
    children: [
      {path: '/login/:auth', name: 'auto-login', component: Login, meta: {public: true}}
    ]
  }, {
    path: '/loginAuto',
    name: 'loginAuto',
    meta: {
      public: true
    },
    component: LoginAuto
  }, {
    path: '/404',
    meta: {
      public: true
    },
    name: 'NotFound',
    component: () => import(
      `@/views/NotFound.vue`
    )
  } 
  // ,{
  //   path: '/old/:page',
  //   name: 'old',
  //   props: true,
  //   component: () => import(
  //     `@/components/Iframe.vue`
  //   )
  // }
  ]
});

router.beforeEach((to, from, next) => {
  const routeNew = ['/eval', '/stat', '/stat/scrap', '/stat/value', '/stat/cross', '/setting', '/setting/eval-item', '/setting/eval-auto', '/setting/eval-value', '/setting/eval-media', '/setting/layout', '/setting/email', '/setting/media-category', '/preview', '/email']; // 신판전용
  const routeOld = '/old/'; // 구판전용
  const routeOldArr = ['/old/eval', '/old/stat', '/old/setting', '/old/preview', '/old/email']; // 구판전용
  store.dispatch('loginCheckAPI').then(() => {
    if (routeNew.indexOf(to.fullPath) > -1) {
      if (store.getters.getIsAuth && store.getters.getIsPeUser) {
        localStorage.setItem('is-new-mode', true);
        next();
      } else if (store.getters.getIsAuth) {
        let estimatedPathArr = to.fullPath.split('/');
        let estimatedPath = '/old/eval', estimatedPathTmp = '';
        if (estimatedPathArr.length > 1) {
          estimatedPathTmp = '/old/' + estimatedPathArr[1];
          if (routeOldArr.includes(estimatedPathTmp)) {
            estimatedPath = estimatedPathTmp;
          }
        }
        localStorage.setItem('is-new-mode', false);
        next(estimatedPath);
      } else {
        localStorage.setItem('is-new-mode', false);
        next('login');
      }
    } else if (to.fullPath.indexOf(routeOld) > -1) {
      localStorage.setItem('is-new-mode', false);
      store.getters.getIsAuth ? next() : next('login');
    }
    next();
  }).catch(() => {
    next();
  });
});

export default router;
