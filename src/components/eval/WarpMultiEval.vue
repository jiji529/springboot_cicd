<template>
	<div id="pop_wrap">
		<div class="overlay"></div>
		<div class="pop_close"><a @click="closeEvalMulti">닫기</a></div>
		<!-- 기사목록 닫으면 .hide 추가 -->
		<div class="cont_wrap" :class="{ hide : hideAndShowMultiArticleList }">
			<!--기사리스트-->
			<multi-do-eval-article-list v-bind:evalManualSetting="evalManualSetting"></multi-do-eval-article-list>
			<!--평가하기-->
			<do-multi-eval v-bind:evalManualSetting="evalManualSetting"></do-multi-eval>
			<!--미리보기-->
			<multi-preview></multi-preview>
		</div>
	</div>
</template>

<script>
	import MultiPreview from './multi/MultiPreview'
	import DoMultiEval from './multi/MultiDoEval'
	import MultiDoEvalArticleList from './multi/MultiDoEvalArticleList'
	import {mapActions, mapMutations, mapState} from 'vuex'
	export default {
		components: {
			MultiPreview,
			DoMultiEval,
			MultiDoEvalArticleList
		},
		data() {
			return{
				selEval1: '',
				selEval2: '',
				evalManualSetting: [{'value':false},{'value':false}] // 평가1|평가2 전체표시사용여부
			}
		},
		computed: mapState(['hideAndShowMultiArticleList', 'multiEvalArticleList', 'showDoEvalMulti']),
		async mounted() {
			this.SET_SELECTED_ARTICLE(this.multiEvalArticleList[0]);
			await this.getEvalManualSetting();
		},
		beforeMount(){
			this.addKeyup();
		},
		beforeDestroy(){
			this.removeKeyup();
		},
		methods: {
			...mapActions([
				'getMediaPolicyAPI'
			]),
			...mapMutations([
				'TOGGLE_SHOW_DO_EVAL_MULTI',
				'SET_MULTI_EVAL_ARTICLE_LIST',
				'SET_SELECTED_ARTICLE']),
			addKeyup(){
				window.addEventListener('keydown', this.arrowKeyup);
			},
			removeKeyup(){
				window.removeEventListener('keydown', this.arrowKeyup);
			},
			arrowKeyup(e){
				switch(e.which){
					case 27 :
						e.preventDefault ? e.preventDefault() : e.returnValue=false;
						e.stopPropagation();
						this.closeEvalMulti(); break;
				}
			},
			closeEvalMulti() {
				this.TOGGLE_SHOW_DO_EVAL_MULTI(false);
				this.SET_MULTI_EVAL_ARTICLE_LIST([]);
				this.$eventBus.$emit('closeMultiEvalToDoEval');
			},
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
