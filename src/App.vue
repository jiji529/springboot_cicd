<template>
  <div id="wrap">

    <template v-if="!$route.meta.public">
      <page-header></page-header>
      <router-view/>
    </template>

    <template v-else>
      <transition>
        <keep-alive>
          <router-view></router-view>
        </keep-alive>
      </transition>
    </template>
    
  </div>
</template>
<script>
  var vueThis = null;
  import '@/assets/styles/style.css'
  import PageHeader from '@/components/PageHeader';
  import axios from 'axios';

  export default {
    name: 'SrcApp',
    components: {
      PageHeader
    },
    methods: {
      
    },
    created: function() {
      vueThis = this;
      let vThis = this;
      window.addEventListener('beforeunload', async function(e) {
        try {
          let res = await viewerLogout(e);
          e.preventDefault();
        }catch(ex) {
        }
      });
    },

    beforeRouteLeave(to, from, next) {
      console.log(from.path);
    }
  };

  function viewerLogout(e) {
    let viewerLogoutUrl = "https://wv.scrapmaster.co.kr/admin/adminLogout.do";
    // let viewerLogoutUrl = "http://localhost/admin/adminLogout.do";
    self.frames['viewerLogoutFrame'].location.href=viewerLogoutUrl;
    // window.location.href = window.location.origin;
  }  
</script>
<style>


</style>

