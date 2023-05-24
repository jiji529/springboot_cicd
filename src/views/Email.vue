<template>
  <div style="width: 100%;height: 100%;">
    <iframe :src="emailSrc"
            style="width: 100%;height: 100%;border: none"></iframe>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex';
  export default {
    name: 'Email',
    computed: {
      ...mapGetters({
        pid: 'getPremiumID'
      }),
      emailSrc: function() {
        return 'https://viewer.scrapmaster.co.kr/mail/email_form.php?userinfo=' + this.pid;
      }
    }
  };
</script>

<style scoped>

</style>

