<template>
  <div class="contents">
    <SettingMenu></SettingMenu>
    <router-view/>
  </div>
</template>

<script>
  import SettingMenu from '../components/setting/SettingMenu';
  export default {
    name: 'Setting',
    components: {SettingMenu},
    created() {
      this.$eventBus.$off('kickOut');
      this.$eventBus.$on("kickOut", () => {
        alert('Logged out!');
        this.$store.dispatch('LOGOUT').then(() =>
          this.$router.push('/login')
        );
      });
    }
  };
</script>

<style scoped>

</style>