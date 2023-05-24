<template>
  <div class="contents">
    <StatMenu></StatMenu>
    <router-view/>
  </div>
</template>

<script>
  import StatMenu from '../components/stat/StatMenu';

  export default {
    name: 'Stat',
    components: {StatMenu}

  };
</script>