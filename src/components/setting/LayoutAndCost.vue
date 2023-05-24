<template>
	<div class="cont_wrap">
		<layout></layout>
		<column></column>
		<div class="loading" v-if="loadingGif"><img class="loading-image" :src="require('@/assets/images/loading.gif')" alt="Loading..."/>
		</div>
	</div>
</template>

<script>
	import {mapState} from 'vuex';
	import Layout from './layout/Layout';
	import Column from './layout/Column';

  export default {
  	name : 'layout-and-cost',
	  components : {Layout, Column},
		computed: {...mapState(['loadingGif'])}
  }

</script>

<style scoped>
.loading { width: 100%;height: 100%;top: 0px;left: 0px;position: fixed;display: block;opacity: 0.7;background-color: #fff;z-index: 99;text-align: center;vertical-align: middle;}
.loading-image {position: absolute;top: 50%;left: 50%;z-index: 100;}
.loading-message {position: relative;margin: 0 auto;z-index: 101;}
</style>
