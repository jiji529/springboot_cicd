<template>
	<div>
		<EvalHeader></EvalHeader>
		<div class="cont_wrap" :class="{hide : hideAndShowArticleList }">
			<!--기사리스트-->
			<DoEvalArticleList :class="{fold : !this.listLayout0}"></DoEvalArticleList>
			<!--평가하기-->
			<DoEval v-bind:evalManualSetting="evalManualSetting" v-bind:configEval="configEval" :class="{fold : !this.listLayout1}"></DoEval>
			<!--미리보기-->
			<Preview :class="{fold : !this.listLayout2}"></Preview>
		</div>
		<div class="loading" v-if="loadingGif"><img class="loading-image" :src="require('@/assets/images/loading.gif')" alt="Loading..."/>
		</div>
	</div>
</template>

<script>
	import EvalHeader from './eval/EvalHeader'
	import DoEvalArticleList from './eval/DoEvalArticleList'
	import DoEval from './eval/DoEval'
	import Preview from './eval/PreviewNew'
	import store from '../../store'
	import {mapActions, mapState, mapMutations} from 'vuex'

	export default {
		components: {
			EvalHeader,
			DoEvalArticleList,
			DoEval,
			Preview,
		},
		data() {
			return {
				evalManualSetting: [{'value':false},{'value':false}], // 평가1|평가2 전체표시사용여부
				configEval: [],
				columnSettingWeb: [] // 칼럼 사용 설정
			}
		},
		computed:mapState(['hideAndShowArticleList', 'listLayout0', 'listLayout1', 'listLayout2', 'loadingGif']),
		async mounted() {
			let ssdo = store.state.hiddenLink1;
			await this.getEvalManualSetting();
			await this.$axios.get(ssdo + '/getConfigEvalJson.php').then(r => {
				if (r.data.success) {
					this.configEval = r.data.config_eval;
				} else {
					alert('설정을 불러오지 못 했습니다!');
				}
			}).catch(e=>console.error(e));
			await this.$axios.get(ssdo + '/columnSettingJson.php').then(r => {
        if (r.data.success) {
          this.columnSettingWeb = r.data.column_setting;
        } else {
          alert('설정을 불러오지 못 했습니다!');
        }
      }).catch(e=>console.error(e));
		},
		methods: {
			...mapActions(['getMediaPolicyAPI']),
			...mapMutations(['LOGIN', 'SET_LOADING_GIF']),
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
		},
		created() {
			this.$eventBus.$off("kickOut");
      this.$eventBus.$on("kickOut", () => {
        alert('Logged out!');
        this.$store.dispatch('LOGOUT').then(() =>
          this.$router.push('/login')
        );
      });
			this.SET_LOADING_GIF(false);
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
