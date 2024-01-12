<template>
</template>
<script>
  import {mapActions, mapGetters} from 'vuex';
  import '@/assets/styles/login.css';

  export default {
    name: 'LoginAuto',
    data: () => ({
      username: '',
      password: '',
      isLoading: false
    }),
    mounted() {
      this.onSubmit();
    },
    computed: {
      ...mapGetters({
        resultMessage: 'getMessage',
        isAuth: 'getIsAuth', // cmlim: login 성공시, true
        isPeUser: 'getIsPeUser'
      })
    },
    methods: {
      ...mapActions(['loginAutoAPI', 'getMediaPolicyAPI', 'getMediaValueAPI']),
      async onSubmit() {
        try {
          let params = new FormData();
          if (this.$route.params.auth) {
            params.append('auth', this.$route.params.auth);
          } else {
            if (!this.$route.query.ev) {
              return false;
            }
            params.append('ev', this.$route.query.ev);
          }
          this.isLoading = true;

          let loginResult = await this.loginAutoAPI(params);
          // loginResult = loginResult && await this.$statConfig.checkUser();
          if (loginResult) {
            if (this.isPeUser) {
              let paramsP = new FormData();
              paramsP.set('m', 'p');
              let resultPolicy = await this.getMediaPolicyAPI(paramsP);
              if (resultPolicy && resultPolicy.success && resultPolicy.final === '2') {
                let uncheckedMediaCount = 0, uncheckedMediaCountRedirect = false;
                const paramsMedia = new FormData();
                paramsMedia.append('c', 't');
                paramsMedia.append('t', new Date());
                const resultMedia = await this.getMediaValueAPI(paramsMedia);
                if (resultMedia && resultMedia.success && resultMedia.final) {
                  uncheckedMediaCount = resultMedia.final;
                  if (uncheckedMediaCount > 0) {
                    if (confirm('새로 추가된 매체 ' + uncheckedMediaCount + '종을 확인합니다.')) {
                      uncheckedMediaCountRedirect = true;
                    }
                  }
                }
                if (uncheckedMediaCountRedirect) {
                  this.goToSettingEvalMedia();
                } else {
                  this.goToPages(); // 페이지 이동!
                }
              } else {
                this.goToPages();
              }
            } else {
              this.goToPages();
            }
          } else {
            this.isLoading = false;
            this.LOGOUT();
          }
        } catch (e) {
          this.isLoading = false;
          console.error(e);
        }
      },
      goToSettingEvalMedia() {
        this.isLoading = false;
        this.$router.replace({
          path: 'setting/eval-media'
        });
      },
      goToPages() {
        this.isLoading = false;
        this.$router.replace({
          path: this.$store.state.isPeUser ? '/eval' : '/old/eval'
        });
      },
      goToLogin() {
        this.$router.replace({
          name: 'login'
        });
      },
      LOGOUT() {
        this.isLoading = false;
        this.$store.dispatch('LOGOUT');
        // this.$store.commit('LOGOUT');
      }
    }
  };
</script>
