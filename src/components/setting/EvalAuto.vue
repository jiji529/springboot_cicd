<template>
	<div>
		<div class="cont_wrap" v-show="Object.keys(nameEvalList).length>0">
			<div class="set_box_area">
				<MediaImportance :class="{conceal : nameEvalList['매체 중요도'] && nameEvalList['매체 중요도']['isUse'] === 'N'}"></MediaImportance>
			</div>
			<div class="set_box_area">
				<ArticlePosition :class="{conceal : nameEvalList['기사위치'] && nameEvalList['기사위치']['isUse'] === 'N'}"></ArticlePosition>
				<Correspondent :class="{conceal : nameEvalList['출입기자'] && nameEvalList['출입기자']['isUse'] === 'N'}"></Correspondent>
			</div>
			<div class="set_box_area">
				<ArticleSize :class="{conceal : nameEvalList['크기'] && nameEvalList['크기']['isUse'] === 'N'}"></ArticleSize>
				<ArticleCharLen :class="{conceal : nameEvalList['글자수'] && nameEvalList['글자수']['isUse'] === 'N'}"></ArticleCharLen>
			</div>
		</div>
		<ul class="pre_group_set">
			<li>자동 평가 항목 사용</li>
			<template v-if="evalList">
				<li v-for="(item,key) in evalList" :key="key+'aeiu'">
					<input type="checkbox" :id="'grp0'+key" v-model="item.checkbox" @change="auto(item)" />
					<label :for="'grp0'+key" >
						<span></span>{{item.name}}
					</label>
				</li>
			</template>
		</ul>
	</div>
</template>

<script>
	import ArticleSize from './auto/ArticleSize';
	import ArticleCharLen from './auto/ArticleCharLen';
	import MediaImportance from './auto/MediaImportance';
	import Correspondent from './auto/Correspondent';
	import ArticlePosition from './auto/ArticlePosition';
	import {mapActions} from 'vuex';

	export default {
		name: 'EvalAuto',
		components: {Correspondent, MediaImportance, ArticleCharLen, ArticleSize, ArticlePosition},
		data(){
			return{
				evalList : [],
				nameEvalList : [],
			}
		},
		async mounted(){
			const data = await this.getEval2AutoAPI();
			this.evalList = data.eval2;
			this.nameEvalList = data.name_key_eval2;
		},
		methods:{...mapActions(['getEval2AutoAPI']),
			async auto(item) {
				let auto = {'seq' : item.seq , 'isUse' : item.checkbox};
				let params = new FormData();
				params.append('q' , JSON.stringify(auto));
				const data = await this.getEval2AutoAPI(params);
				if (data) {
					this.evalList = data.eval2;
					this.nameEvalList = data.name_key_eval2;
				} else {
					this.$eventBus.$emit('kickOut');
				}
			}
		}
	};
</script>

<style scoped>

</style>
