<template>
	<div>
		<search></search>
		<div class="cont_wrap" :class="{hide : hideAndShowArticleListSearch}">
			<!--기사리스트-->
			<search-result-list :class="{fold : !this.listLayout0}"></search-result-list>
			<!--평가하기-->
			<search-do-eval v-bind:evalManualSetting="evalManualSetting" :class="{fold : !this.listLayout1}"></search-do-eval>
			<!--미리보기-->
			<search-preview :class="{fold : !this.listLayout2}"></search-preview>
		</div>
		<div class="loading" v-if="loadingGif"><img class="loading-image" :src="require('@/assets/images/loading.gif')" alt="Loading..."/></div>
	</div>
</template>
<script>
	import SearchResultList from './search/SearchResultList'
	import SearchDoEval from './search/SearchDoEval'
	import SearchPreview from './search/SearchPreview'
	import Search from './search/Search'
	import {mapActions, mapState} from 'vuex'

	export default {
		components: {
			SearchResultList,
			SearchDoEval,
			SearchPreview,
			Search
		},
		data() {
			return {
				evalManualSetting: [{'value':false},{'value':false}] // 평가1|평가2 전체표시사용여부
			}
		},
		computed:mapState(['hideAndShowArticleListSearch', 'listLayout0', 'listLayout1', 'listLayout2', 'loadingGif']),
		async mounted() {
			await this.getEvalManualSetting();
			await this.getNsConfigEvalAPI();
		},
		methods: {
			...mapActions([
				'getMediaPolicyAPI', 'getNsConfigEvalAPI'
			]),
			async getEvalManualSetting() {
				const params = new FormData();
				params.append('m', 'e');
				const result = await this.getMediaPolicyAPI(params);
				if(result && result.success) { 
					let final = {}, cssClassName = 'wfBoth';
					for (let [k, v] of Object.entries(result.final)) {
						final[v.sKey] = v.value;
					}
					if(final['M1'] && final['M2']) {
						cssClassName = 'wfBoth';
					} else if(final['M1'] || final['M2']) {
						cssClassName = 'wfSingle';
					} else {
						cssClassName = 'wfEmpty';
					}
					final['cssClassName'] = cssClassName;
					this.evalManualSetting = final;
				}
			}
		}
	}
</script>
<style scoped>
  .fold {
		background-color: #ffffff !important;
		overflow: hidden;
		width:30px !important;
	}
	.loading { width: 100%;height: 100%;top: 0px;left: 0px;position: fixed;display: block;opacity: 0.7;background-color: #fff;z-index: 99;text-align: center;vertical-align: middle;}
  .loading-image {position: absolute;top: 50%;left: 50%;z-index: 100;}
  .loading-message {position: relative;margin: 0 auto;z-index: 101;}
</style>
