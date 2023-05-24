<template>
  <div style="width: 100%;height: 100%">
    <iframe :src="oldLink"
            style="width: 100%;height: 100%;border: none"></iframe>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex';
  export default {
    name: 'Iframe',
    props: ['page'],
    data: () => {
      return {};
    },
    computed: {
      ...mapGetters({
        pid: 'getPremiumID',
        pwd: 'getPremiumPW',
        ev: 'getPremiumEV'
      }),
      oldLink ()  {
        switch (this.page) {
          case 'eval':
            return 'https://premium.scrapmaster.co.kr/server/vm_premium3/eval_v2.php?userinfo=' + this.pid;
          case 'stat':
            return 'https://premium.scrapmaster.co.kr/server/stat/item1_statMain.php?userinfo=' + this.pid;
          case 'search':
            return 'https://premium.scrapmaster.co.kr/server/vm_premium/search.php?userinfo=' + this.pid;
          case 'setting':
            return 'https://premium.scrapmaster.co.kr/server/vm_premium/evalConfig1.php?userinfo=' + this.pid;
          case 'preview':
            if (this.pid && this.pwd) {
              return 'https://premium.scrapmaster.co.kr/server/board/showAll_pv.php?id=' + this.pid + '&pwd=' + this.pwd;
            } else if (this.ev) {
              return 'https://premium.scrapmaster.co.kr/server/board/showAll_pv.php?ev=' + encodeURIComponent(this.ev);
            } else {
              return 'https://premium.scrapmaster.co.kr/server/vm_premium3/eval_v2.php?userinfo=' + this.pid;
            }
          case 'email':
            return 'https://viewer.scrapmaster.co.kr/mail/email_form.php?userinfo=' + this.pid;
          default:
            return 'https://premium.scrapmaster.co.kr/server/vm_premium3/eval_v2.php?userinfo=' + this.pid;
        }
      }
    }
  };
</script>

<style scoped>

</style>
