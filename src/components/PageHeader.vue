<template>
  <div class="header">
    <h1 v-if="!isEmbeddedMode"><a href="/" tabindex="-1"><span class="blind">ScrapMaster Premium</span></a></h1>
    <!-- <h2 v-if="this.$store.state.isPeUser && !isEmbeddedMode">
      <router-link :to=oldLink tabindex="-1">{{viewTitle}}</router-link>
    </h2> -->
    <!-- <app-menu :class="mbdClassName" v-bind="{old: isOld}" class="box-center"></app-menu> -->
    <app-menu :class="mbdClassName" v-bind="{old: false}" class="box-center"></app-menu>
    <div class="user" v-if="!isEmbeddedMode">
      <div class="user_id"><span @click.shift="destroyAuth">{{uid}}</span>님</div>
      <a @click="LOGOUT">로그아웃</a>

    </div>
  </div>
</template>

<script>
  import AppMenu from '@/components/AppMenu';
  import {mapState, mapGetters, mapMutations} from 'vuex';

  export default {
    name: 'page-header',
    data: () => {
      return {
        viewTitle: '구버전 보기',
        oldLink: '/old/eval',
        viewerLogoutUrl: null
      };
    },
    components: {
      AppMenu
    },
    computed: {
      ...mapState(['viewerLogoutUri']),
      ...mapGetters({
        uid: 'getUserID'
      })
      // , isOld() {
      //   return (!this.$store.state.isPeUser || this.$route.fullPath.includes('/old/'));
      // }
      , isEmbeddedMode() {
        return (localStorage.getItem('is-embedded'));
      }
      , mbdClassName() {
        return this.isEmbeddedMode ? 'mbd' : '';
      }
    },
    methods: {
      ...mapMutations(['SET_VIEWER_LOGOUT_URI']),
      LOGOUT() {
        this.$store.dispatch('LOGOUT').then(() => {
          if (this.viewerLogoutUri !== null) {
            this.viewerLogoutUrl = this.viewerLogoutUri;
          } else {
            this.$router.push('/login');
          }
        });
      },
      async destroyAuth() { // TEST
        this.$store.dispatch('LOGOUT');
        alert('auth destroyed');
      },
      async load() {
        this.viewerLogoutUrl = null;
        this.SET_VIEWER_LOGOUT_URI(null);
        this.$router.push('/login');
      }
    },
    // watch: {
    //   $route(to) {
    //     if (to.name === 'old') {
    //       // this.isOld = true;
    //       this.viewTitle = '신버전 보기';
    //       if (to.params.page === 'search') {
    //         this.oldLink = '/eval';
    //       } else {
    //         this.oldLink = '/' + to.params.page;
    //       }
    //     } else {
    //       let page = to.name;
    //       if (page === 'scrap' || page === 'value') {
    //         page = 'stat';
    //       } else if (page === 'setting-eval-item' || page === 'setting-eval-auto'|| page === 'setting-viewer'|| page === 'setting-email') {
    //         page = 'setting';
    //       }
    //       this.oldLink = '/old/' + page;
    //       this.viewTitle = '구버전 보기';
    //       // this.isOld = false;
    //     }
    //   }
    // }
  };
</script>

<style scoped>
  nav.box-center.mbd { margin: 0 0 0 0; }
</style>
