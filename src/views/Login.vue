<template>
  <div id="login">
    <div class="login-container">
      <div class="scrapmasterbi">
        <ul>
          <li>
            <img alt="ScrapMaster Premium Bi"
                 src="../assets/images/logo.png">
          </li>
          <li>
            <span>프리미엄</span>
          </li>
        </ul>
      </div>
      <div class="login-content">
        <template v-if="!isAuth">
          <form @submit.prevent="onSubmit">
            <div class="lgoin-form"  v-show="!isLoading">
              <input required
                     v-model="username"
                     maxlength="40"
                     name="username"
                     pattern="[a-zA-Z0-9\-]{1,40}"
                     placeholder="아이디"
                     style="ime-mode:disabled"
                     :disabled="isLoading"
                     title="영문과 숫자만 입력 가능합니다." type="text">
              <input required
                     v-model="password"
                     maxlength="40"
                     name="password"
                     :disabled="isLoading"
                     placeholder="패스워드"
                     style="ime-mode:disabled" type="password">
            </div>

            <div class="login-button">
              <button class="login-submit"
                      v-show="!isLoading"
                      type="submit">로그인
              </button>
              <div id="loading" v-if="isLoading"><img id="loading-image" :src="require('@/assets/images/loading.gif')"
                                                      alt="Loading..."/></div>
            </div>

          </form>
          <div v-if="resultMessage"
               class="alert-danger"> <!-- errorState가 있으면 표시한다 -->
            <p>{{resultMessage}}</p>
          </div>
          <div v-if="isLoading"
               class="alert-danger"> <!-- errorState가 있으면 표시한다 -->
            <p>초기 정보를 준비하는 중입니다. </p>
            <p>잠시만 기다려주세요.</p>

          </div>
        </template>
        <template v-else>
          <div class="login-button">
            <button class="login-submit"
                    type="button"
                    @click="LOGOUT">로그아웃
            </button>
          </div>
        </template>

      </div>


    </div>
    <div class="login_info">
      본 사이트는 HTML5로 제작되었습니다.
      <br>
      크롬, 파이어폭스 등 HTML5 표준 브라우저를 지원하며, 보다 원활한 사용을 위해 <b>크롬 브라우저를 권장</b>합니다<span style="cursor:pointer;" onclick="member_join();">.</span>
    </div>
    <div class="login_bottom">
      <ul>
        <li class="chrome" style="cursor:pointer;" onclick="window.open('https://www.google.com/intl/ko/chrome/')">
          구글 chrome 다운로드
        </li>
        <li class="firefox" style="cursor:pointer;" onclick="window.open('https://www.mozilla.org/ko/firefox/new/')">
          mozila firefox 다운로드
        </li>
      </ul>
    </div>
    <div id="footer">
      <div class="foot_lt">사업자등록번호 : 112-81-49789 대표이사 : 박용립<br>
        (주)다하미커뮤니케이션즈. 서울특별시 중구 마른내로 140, 5층 (쌍림동, 인쇄정보센터 )<br>
        5F, 140, Mareunnae-ro, Jung-gu, Seoul, Korea<br>
        TEL. 02 593 4174 &nbsp;&nbsp; FAX. 02 593 4175
      </div>
      <div class="foot_rt">
        <ul class="foot_menu">
          <li><a href="http://www.dahami.com/company/company.html" target="_blank">회사소개</a></li>
          <li><a href="http://www.dahami.com/common/policy.php" target="_blank" class="color">개인정보처리방침</a></li>
          <li id="family_site">
            <a id="select-title">Family Site</a>
            <div id="select-layer" >
              <ul class="site-list">
                <li><a href="http://www.dahami.com/" target="_blank">다하미커뮤니케이션즈</a></li>
                <li><a href="http://www.clippingon.co.kr/" target="_blank">클리핑온</a></li>
                <li><a href="http://www.t-paper.co.kr/" target="_blank">티페이퍼</a></li>
                <li><a href="http://www.newsbank.co.kr/" target="_blank">뉴스뱅크</a></li>
                <li><a href="http://www.news-plaza.co.kr/" target="_blank">뉴스플라자</a></li>
              </ul>
            </div>
          </li>
        </ul>

      </div>
      <div class="foot_bt">Copyright ⓒ DAHAMI Communications. All rights reserved.</div>
    </div>

  </div>
</template>

<script>
  import {mapActions, mapGetters} from 'vuex';
  import '@/assets/styles/login.css';

  export default {
    name: 'Login',
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
        isAuth: 'getIsAuth',
        isPeUser: 'getIsPeUser'
      })
    },
    methods: {
      ...mapActions(['loginAPI', 'getMediaPolicyAPI', 'getMediaValueAPI']),
      async onSubmit() {
        try {
          let params = new FormData();
          if (this.$route.params.auth) {                    // 이 분기의 실행은 언제인가?
            params.append('auth', this.$route.params.auth);
          } else {
            if (!this.username || !this.password) {
              return false;
            }
            params.append('uid', this.username);
            params.append('password', this.password);
          }



          this.isLoading = true;
          let loginResult = await this.loginAPI(params); // 로그인 성공 여부
          if (loginResult) {
            if (this.isPeUser) {
              let paramsP = new FormData();
              paramsP.set('m', 'p');
              let resultPolicy = await this.getMediaPolicyAPI(paramsP); //
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
        this.$store.commit('LOGOUT');
      }

    }
  };
</script>

<style scoped>
  a {
    text-decoration: none;
    color: #808080;
  }
  li.color{
    color: #ff2d19!important;
  }
  #footer {
    font-size: 13px;
    line-height: 21px;
    color: #808080;
    font-weight: 100;
  }
  .foot_menu li{
    margin: 5px auto;
    padding: 0px 10px;
    display: inline-block;
  }
  #select-title {
    cursor: pointer;
  }
  #family_site:hover #select-layer{
    display: block;
  }
  #footer .foot_rt {
    font-size: 12px;
    color: #808080;
    margin: 0px auto;
  }
  #footer .foot_rt #family_site {
    border: 1px #ccc solid;
  }
  #select-layer {
    border: 1px solid #ababab;
    background: #fff;
    z-index: 2000;
  }


  #select-layer {
    border: 1px solid #ababab;
    background: #fff;
    z-index: 2000;
  }
  #select-layer {
    display: none;
    position: absolute;
    margin: -180px 0px 0 -1px;
    width: 148px;
  }

  #select-layer li{
    width: 100%;
  }
  .login_bottom li.chrome {
    width: 323px;
    height: 57px;
    padding: 0 15px;
    display:inline-block;
    background: url(../assets/images/login_chrome.png) 72px 0 no-repeat;
    border-right: 1px #c6c6c6 solid;
  }

  .login_bottom li.firefox {
    width: 323px;
    height: 57px;
    padding: 0 15px;
    display:inline-block;
    background: url(../assets/images/login_firefox.png) 72px 0 no-repeat;
  }

  .login_bottom li {
    height: 80px;
    list-style: none;
    margin: 25px 0;
    text-indent: -9999px;
  }
</style>
