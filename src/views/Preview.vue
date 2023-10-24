<template>
  <div style="width: 100%;height: 100%">
    <!--:src="previewSrc"-->
    <iframe :src="viewerLogoutUri"
            style="width: 100%;height: 100%;border: none" v-if="previewSrc !== false"></iframe>
    <!-- <div class="loading" v-if="previewSrc === false">
      <img class="loading-image" :src="require('@/assets/images/loading.gif')" alt="Loading..."/>
    </div> -->
  </div>
</template>

<script>
  import store from '../store'
  import {mapState, mapGetters, mapMutations, mapActions} from 'vuex';
  
  export default {
    name: 'Preview',
    asyncComputed: {
      ...mapState(['viewerLogoutUri']),
      ...mapGetters({
        pid: 'getPremiumID',
        uid: 'getUserID'
      }),
      async previewSrc() {
        if (!this.uid || this.uid.length < 4) return false; 
        let params = new FormData();
        params.append('smId', this.uid);
        let result = await this.$axios.post(store.state.hiddenLink1 + '/getPremiumLink.php', params);

        if (result.data.tgtUrl && result.data.success) {
          this.viewerLogoutUri = result.data.tgtUrl;
        } else {
          this.SET_VIEWER_LOGOUT_URI(result.data.tgtUrl);
          this.viewerLogoutUri = 'https://view.scrapmaster.co.kr/admin/adminLogin.do';
          alert('서버 오류가 발생했습니다. 관리자에게 문의하여 주십시오!');
          
        }
        
        // await this.viewerLogout();
        // return false;
      }
    },
    methods: {
      ...mapMutations(['SET_VIEWER_LOGOUT_URI']),
      // ...mapActions(['viewerLogout'])
    }
  }
</script>

<style >
#wrap { height: 100%; }
.loading { width: 100%;height: 100%;top: 0px;left: 0px;position: fixed;display: block;opacity: 0.7;background-color: #fff;z-index: 99;text-align: center;vertical-align: middle;}
.loading-image {position: absolute;top: 50%;left: 50%;z-index: 100;}
.loading-message {position: relative;margin: 0 auto;z-index: 101;}
</style>
