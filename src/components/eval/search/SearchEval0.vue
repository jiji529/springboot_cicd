<template>
	<div class="filter0">
		<div class="ft_title">
			<h5>자동평가 항목</h5>
			<a @click="reset">초기화</a>
			<span class="option">
				<input type="radio" id="sch_stat_auto_and" name="src_stat_auto" value="AND" v-model="eval0Condition" @click="eval0SearchCon('AND')">
					<label for="sch_stat_auto_and">AND</label>
				<input type="radio" id="sch_stat_auto_or" name="src_stat_auto" value="OR" v-model="eval0Condition" @click="eval0SearchCon('OR')">
					<label for="sch_stat_auto_or">OR</label>
			</span>
		</div>
		<div class="ft_cont" v-if="eval0Condition === 'OR'">
			<template v-for="(one, key) in getEval2ClassNew">
				<div v-if="one.upper_cate_use === 'Y' || showUnusedEvalItem" class="ft2_box" :class="one.upper_cate_use === 'N' ? 'wither' : ''">
					<div class="ft_ch" :title="one.upper_cate_use === 'N' ? one.upper_cate_name+' (미사용)' : one.upper_cate_name">
						<input type="checkbox" :id="'search_eval0_or'+one.upper_cate_seq" :checked="checkSubList(one)" @change="checkAll($event.target.checked, one)"/>
						<label :for="'search_eval0_or'+one.upper_cate_seq"><span></span>{{one.upper_cate_name}}</label>
					</div>
					<ul class="ft2_li">
						<li v-for="(one2, k) in one.sub" :key="k" v-if="one2.use === 'Y' || showUnusedEvalItem" :class="one2.use === 'N' ? 'wither' : ''" :title="one2.use === 'N' ? one2.name + ' (미사용)' : one2.name">
							<input type="checkbox" :id="'search_eval0_or_sub'+one2.name+one2.seq" :value="one2.seq" v-model="selEval0">
							<label :for="'search_eval0_or_sub'+one2.name+one2.seq"><span></span>{{one2.name}}</label>
						</li>
					</ul>
				</div>
			</template>
		</div>
		<div class="ft_cont" v-if="eval0Condition === 'AND'">
			<template v-for="(one, key) in getEval2ClassNew">
				<div v-if="one.upper_cate_use === 'Y' || showUnusedEvalItem" class="ft2_box" :class="one.upper_cate_use === 'N' ? 'wither' : ''">
					<div class="ft_ch" :title="one.upper_cate_use === 'N' ? one.upper_cate_name+' (미사용)' : one.upper_cate_name">{{one.upper_cate_name}}</div>
					<ul class="ft2_li">
						<li v-for="(one2, k) in one.sub" :key="k" v-if="one2.use ==='Y' || showUnusedEvalItem" :class="one2.use === 'N' ? 'wither' : ''" :title="one2.use === 'N' ? one2.name + ' (미사용)' : one2.name">
							<input type="radio" :name="'search_eval0_and'+one.upper_cate_seq" :id="'search_'+one2.seq" :value="one2.seq" @change.prevent="radioButtonToggle($event, one.upper_cate_seq, one2.seq)" v-model="selEval0AndDisplay[one.upper_cate_seq]">
							<label :for="'search_'+one2.seq"><span></span>{{one2.name}}</label>
						</li>
					</ul>
				</div>
			</template>
		</div>
	</div>
</template>
<script>
	import {mapGetters} from 'vuex'
	export default {
		data() {
			return {
				eval0Condition: 'OR',
				selEval0 : [],
				selEval0AndDisplay : {}
			}
		},
		computed: {
			...mapGetters(['getConfigEval']),
			getEval2ClassNew() {
				let rtn = [], tmpGroup, tmpItem;
				if (this.getConfigEval && this.getConfigEval['group'] && this.getConfigEval['group']['AT']) {
					Object.values(this.getConfigEval['group']['AT']).forEach(g => {
						tmpGroup = new Object();
						tmpGroup['upper_cate_seq'] = g['seq'];
						tmpGroup['upper_cate_name'] = g['name'];
						tmpGroup['upper_cate_order'] = Number(g['order']);
						tmpGroup['auto'] = 'Y';
						tmpGroup['upper_cate_use'] = g['isUse'];
						tmpGroup['upper_cate_eval'] = g['isEval'];
						tmpGroup['sub'] = [];
						tmpGroup['upper_cate_type'] = '자동';
						Object.values(this.getConfigEval['group_item'][g['seq']]).forEach(i => {
							tmpItem = new Object();
							tmpItem['seq'] = i['seq'];
							tmpItem['name'] = i['value'];
							tmpItem['score'] = i['score'];
							tmpItem['order'] = Number(i['order']);
							tmpItem['upperSeq'] = i['group_seq'];
							tmpItem['refValue'] = i['refValue'];
							tmpItem['use'] = i['isUse'];
							tmpGroup['sub'].push(tmpItem);
						});
						tmpGroup['sub'].sort((a, b) => (a.order > b.order) ? 1 : -1);
						rtn.push(tmpGroup);
					});
					rtn.sort((a, b) => (a.upper_cate_order > b.upper_cate_order) ? 1 : -1);
				}
				return rtn;
			},
			showUnusedEvalItem() {
				let rtn = false;
				if (this.getConfigEval && this.getConfigEval['policy'] && this.getConfigEval['policy']['NU']) {
					rtn = (this.getConfigEval['policy']['NU']['value'] === 'Y');
				}
				return rtn;
			}
		},
		created() {
			this.$eventBus.$on('searchEval0Reset', () => {
				this.reset();
			});
		},
		watch:{
			selEval0() {
				this.eval0Change();
			}
		},
		methods: {
			eval0SearchCon(con) {
				this.eval0Condition = con;
				this.selEval0 = [];
			},
			checkSubList(list) {
				let $this = this;
				if(list.sub.length>0) {
					return list.sub.every( subOne => {
						if($this.selEval0.indexOf(subOne.seq) > -1){
							return true
						}
					})
				} else {
					return false
				}
			},
			checkAll(checkFlag, list) {
				if (list.sub.length > 0) {
					list.sub.forEach(subOne => {
						if (checkFlag) {
							if (this.selEval0.indexOf(subOne.seq) === -1) {
								this.selEval0.push(subOne.seq);
							}
						} else {
							const delIdx = this.selEval0.indexOf(subOne.seq);
							if (delIdx > -1) {
								this.selEval0.splice(delIdx, 1);
							}
						}
					});
				}
			},
			reset() {
				this.selEval0 = [];
				this.selEval0AndDisplay = {};
			},
			eval0Change() {
				this.$emit('sendEval0', this.selEval0, this.eval0Condition);
			},
			//버튼 셀렉 및 해제 기능 (평가2 - and 조건일때)
			radioButtonToggle(e, upperCateSeq, seq) {
				this.selEval0AndDisplay[upperCateSeq] = seq;
				this.selEval0 = [];
				for (let v of Object.values(this.selEval0AndDisplay)) {
					this.selEval0.push(v);
				}
			}
		}
	}
</script>
<style scoped>
	.wither {
		opacity: 0.5;
	}
</style>
