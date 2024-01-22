<template>
	<div class="filter1">
		<div class="ft_title">
			<h5>
				<input type="checkbox" id="sch_ft1_all" />
				평가 1 항목</h5>
			<a @click="reset">초기화</a></div>
		<div class="ft_cont">
			<div class="ft1_top">
				<div class="ft_tit" @click.prevent="eval1AllCheck($event, 'sch_ft1_a00', getSearchEval1.major, 'div')" @keydown.space.prevent="eval1AllCheck($event, 'sch_ft1_a00',getSearchEval1.major, 'div')">
					<input type="checkbox" id="sch_ft1_a00" :checked="allCheck(getSearchEval1.major)" />
					<label for="sch_ft1_a00"><span></span>대분류</label>
				</div>
				<div class="ft_tit" @click.prevent="eval1AllCheck($event, 'sch_ft1_b00',mid, 'div')" @keydown.space.prevent="eval1AllCheck($event, 'sch_ft1_b00',mid, 'div')">
					<input type="checkbox" id="sch_ft1_b00"   :checked="allCheck(mid)"/>
					<label for="sch_ft1_b00" ><span></span>중분류</label>
				</div>
				<div class="ft_tit" @click.prevent="eval1AllCheck($event, 'sch_ft1_c00',minor, 'div')" @keydown.space.prevent="eval1AllCheck($event, 'sch_ft1_c00',minor, 'div')">
					<input type="checkbox" id="sch_ft1_c00" :checked="allCheck(minor)"/>
					<label for="sch_ft1_c00" ><span></span>소분류</label>
				</div>
			</div>
			<div class="ft1_box">
				<div class="ft1_val" v-for="major in getEval1CategoryNew" :key="major.seq" v-if="major.isUse === 'Y' || showUnusedEvalItem" :class="major.isUse === 'N' ? 'wither' : ''" :title="major.isUse === 'N' ? major.name + ' (미사용)' : major.name">
					<div class="ft_ch">
						<input type="checkbox" :id="'search_'+major.name+major.seq" :value="major.seq" v-model="getSearchEval1.selectedEval1" />
						<label :for="'search_'+major.name+major.seq"><span></span>{{major.name}}</label>
						<span class="btn_all" v-if="major.sub !== null"><a @click="eval1GroupAll(major)">ALL</a></span>
					</div>
					<dl class="ft1_li" v-if="major.sub != null && mid.isUse === 'Y' || showUnusedEvalItem" v-for="mid in major.sub" :key="mid.seq" :class="mid.isUse === 'N' ? 'wither' : ''" :title="mid.isUse === 'N' ? mid.name + ' (미사용)' : mid.name">
						<dt>
							<input type="checkbox" :id="'search_'+mid.name+mid.seq" :value="mid.seq" v-model="getSearchEval1.selectedEval1"/>
							<label :for="'search_'+mid.name+mid.seq"><span></span>{{mid.name}}</label>
							<span class="btn_all" v-if="mid.sub !== null"><a @click="eval1GroupAll(mid)">ALL</a></span>
						</dt>
						<dd v-if="mid.sub != null">
							<ul>
								<li v-for="minor in mid.sub" :key="minor.seq" v-if="minor.isUse === 'Y' || showUnusedEvalItem" :class="minor.isUse === 'N' ? 'wither' : ''" :title="minor.isUse === 'N' ? minor.name + ' (미사용)' : minor.name">
									<input type="checkbox" :id="'search_'+minor.name+minor.seq" :value="minor.seq" v-model="getSearchEval1.selectedEval1" />
									<label :for="'search_'+minor.name+minor.seq"><span></span>{{minor.name}}</label>
								</li>
							</ul>
						</dd>
					</dl>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	import {mapGetters} from 'vuex'
	export default {
		data() {
			return {
				major : [],
				mid : [],
				minor : [],
				selectedEval1: []
			}
		},
		computed: {
			...mapGetters(['getConfigEval','getSearchEval1']),
			getEval1CategoryNew() {
				let rtn = [], tmpGroup, tmpItem, tmpData, tmpIdx = -1, tmpIds = [];
				if (this.getConfigEval && this.getConfigEval['item'] && this.getConfigEval['item']['M1']) {
					tmpData = Object.values(this.getConfigEval['item']['M1']);
					tmpData.forEach(o => {
						if (o.group_seq === null) {
							tmpItem = new Object();
							tmpItem.isUse = o.isUse; tmpItem.name = o.value;
							tmpItem.order = Number(o.order); tmpItem.score = o.score;
							tmpItem.seq = String(o.seq); tmpItem.sub = [];
							tmpItem.subSeq = []; tmpItem.upperSeq = null;
							rtn.push(tmpItem);
							tmpIds.push(o.seq);
						}
					}); // step 1
					tmpData.forEach(o => {
						tmpIdx = tmpIds.indexOf(o.group_seq);
						if (o.group_seq > 0 && tmpIdx > -1) {
							tmpItem = new Object();
							tmpItem.isUse = o.isUse; tmpItem.name = o.value;
							tmpItem.order = Number(o.order); tmpItem.score = o.score;
							tmpItem.seq = String(o.seq); tmpItem.sub = [];
							tmpItem.subSeq = []; tmpItem.upperSeq = String(o.group_seq);
							rtn[tmpIdx].sub.push(tmpItem);
							rtn[tmpIdx].subSeq.push(o.seq);
						}
					}); // step 2
					tmpData.forEach(o => {
						tmpIdx = tmpIds.indexOf(o.group_seq);
						if (o.group_seq > 0 && tmpIdx === -1) {
							tmpItem = new Object();
							tmpItem.isUse = o.isUse; tmpItem.name = o.value;
							tmpItem.order = Number(o.order); tmpItem.score = o.score;
							tmpItem.seq = String(o.seq); tmpItem.sub = [];
							tmpItem.subSeq = []; tmpItem.upperSeq = String(o.group_seq);
							rtn.forEach(x => {
								tmpIdx = x.subSeq.indexOf(o.group_seq);
								if (tmpIdx > -1) {
									x.sub[tmpIdx].sub.push(tmpItem);
									x.sub[tmpIdx].subSeq.push(o.seq);
								}
							});
						}
					}); // step 3
					rtn.forEach(r => {
						r.sub.forEach(s => {
							s.sub.sort((a, b) => (a.order > b.order) ? 1 : -1);
						});
						r.sub.sort((a, b) => (a.order > b.order) ? 1 : -1);
					}); // sort by order
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
		watch: {
			getEval1CategoryNew () {
				let major = [];
				let mid = [];
				let minor = [];
				for(var key in this.getEval1CategoryNew){//대분류 회전
					major.push(this.getEval1CategoryNew[key].seq);
					for(var key2 in this.getEval1CategoryNew[key].sub) {//중분류 회전
						mid.push(this.getEval1CategoryNew[key].sub[key2].seq);
						for(var key3 in this.getEval1CategoryNew[key].sub[key2].sub){//소분류 회전
							minor.push(this.getEval1CategoryNew[key].sub[key2].sub[key3].seq);
						}
					}
				}
				this.getSearchEval1.major = major;
				this.getSearchEval1.mid = mid;
				this.getSearchEval1.minor = minor;
			},
			"getSearchEval1.selectedEval1": function () {
				this.eval1Change();
			}
		},
		created(){
			this.$eventBus.$on('searchEval1Reset', () => {
				this.reset();
			})
		},
		mounted() {
			this.evtrigger++;
		},
		methods : {
			eval1Change() {
				this.$emit('sendEval1'
				, this.getSearchEval1.selectedEval1
				, this.getSearchEval1.major
				, this.getSearchEval1.mid
				, this.getSearchEval1.minor);
			},
			allCheck(list){
				let $this = this;
				if(list.length >0) {
					return list.every(one => {
						if ($this.getSearchEval1.selectedEval1.indexOf(one) > -1) {
							return true
						}
					})
				}
			},
			eval1AllCheck($event, id, list, from) {
				let checkFlag = document.querySelector('#'+id).checked;
				if(from === 'div') {
					document.querySelector('#'+id).checked  = !checkFlag;
					checkFlag = !checkFlag;
				}
				let $this = this;
				list.forEach(one => {
					if(checkFlag){
						if($this.getSearchEval1.selectedEval1.indexOf(one) === -1) {
							this.getSearchEval1.selectedEval1.push(one);
						}
					} else {
						const delIdx = this.getSearchEval1.selectedEval1.indexOf(one);
						if(delIdx > -1) {
							this.getSearchEval1.selectedEval1.splice(delIdx, 1);
						}
					}
				});
				this.eval1Change();
			},
			eval1GroupAll(list) {
				if (!list) return;
				let _se1 = this.getSearchEval1.selectedEval1, majorIdx = _se1.indexOf(list.seq), midIdx, minorIdx;
				if (majorIdx === -1) {
					_se1.push(list.seq);
					if (list.sub) {
						list.sub.forEach(mid => {
							if (_se1.indexOf(mid.seq) === -1) {
								_se1.push(mid.seq);
							}
							if (mid.sub) {
								mid.sub.forEach(minor => {
									if (_se1.indexOf(minor.seq) === -1) {
										_se1.push(minor.seq);
									}
								})
							}
						});
					}
				} else {
					_se1.splice(majorIdx, 1);
					if (list.sub) {
						list.sub.forEach(mid => {
							midIdx = _se1.indexOf(mid.seq);
							if (midIdx > -1) {
								_se1.splice(midIdx, 1);
							}
							if (mid.sub) {
								mid.sub.forEach(minor => {
									minorIdx = _se1.indexOf(minor.seq);
									if (minorIdx > -1) {
										_se1.splice(minorIdx, 1);
									}
								});
							}
						});
					}
				}
				this.eval1Change();
			},
			reset() {
				this.getSearchEval1.selectedEval1 = [];
				this.eval1Change();
			}
		}
	}

</script>

<style scoped>

</style>
