<template>
	<!-- s: set_auto_box -->
	<div class="set_auto_box box7">
		<div class="set_title">
			<h2>기사 위치</h2>
			<p>* 기사정보의 기사 위치 값을 설정할 수 있습니다.</p>
			<div class="set_tit_btn">
				<slot v-if="edit">
					<a @click="edit=false;onSetting()" class="btn_wh">취소</a>
					<a @click="apply()" class="btn_na">저장</a>
				</slot>
				<slot v-else>
					<a @click="edit=true" class="btn_gr">편집</a>
				</slot>
			</div>
		</div>
		<!-- s: set_cont -->
		<div class="set_cont">
			<div class="set_list_tb">
				<div class="set_report">
					<!-- s: set_list_tb -->
					<div class="set_list_tb">
						<div class="set_list_th">
							<div class="md col1-1">항목</div>
							<div class="md col1-3" style="border-left:1px #fff solid">가치</div>
							<div class="md col1-4">상태</div>
						</div>
						<ul>
							<template v-if="evalList.list" v-for="(item, index) in evalList.list">
								<li class="set_list_td" :key="index">
									<div class="md col1-1" :class="{'conceal':item.isUse ==='N'}">
										<span v-if="edit">
										<input type="text"
										       v-model="item.value"
										       autocomplete="off"
										       placeholder="항목명 입력"
										       name="value">면</span>
										<slot v-else>{{item.value}}{{!isNaN(item.value) ? '면' : ''}}</slot>
									</div>
									<div class="md col1-3" :class="{'conceal':item.isUse ==='N'}">
										<input v-if="edit" type="number" v-model="item.score">
										<slot v-else>{{item.score}}</slot>
									</div>
									<div class="md col1-4">
										<slot v-if="edit">
											<a class="btn" :class="{'btn_bl':item.isUse==='Y','btn_gr':item.isUse!=='Y'}" @click="item.isUse='Y'">사용</a>
											<a class="btn" :class="{'btn_bl':item.isUse==='N','btn_gr':item.isUse!=='N'}" @click="item.isUse='N'">비사용</a>
										</slot>
										<slot v-else><span :class="{'conceal':item.isUse === 'N'}">{{getUseLabel(item.isUse)}}</span></slot>
									</div>
								</li>
							</template>
							<template v-show="addList.length>0" v-for="(item, index) in addList">
								<li class="set_list_td" :key="'a'+index">
									<div class="md col1-1">
										<input type="number"
										       v-model="item.value"
										       min="1"
										       max="50"
										       step="1"
										       autocomplete="off"
										       placeholder="항목명 입력"
										       name="value">면
									</div>
									<div class="md col1-3">
										<input type="number" v-model="item.score">
									</div>
									<div class="md col1-4">
										<div class="btn" :class="{'btn_bl':item.isUse==='Y','btn_gr':item.isUse!=='Y'}"><a
												@click="reporter.isUse='Y'">사용</a></div>
										<div class="btn" :class="{'btn_bl':item.isUse==='N','btn_gr':item.isUse!=='N'}"><a
												@click="reporter.isUse='N'">비사용</a></div>
										<div class="btn btn_wh"><a
												@click="$delete(addList,index);">취소</a>
										</div>
										<div class="btn btn_na" v-if="!edit"><a @click="apply">저장</a></div>
									</div>
								</li>

							</template>
						</ul>

					</div>
					<!-- e: set_list_tb -->
				</div>
			</div>
		</div>
		<!-- e: set_cont -->
		<div class="set_list_tf"><a @click="insertCategory">+ 항목추가</a></div>
	</div>
	<!-- e: set_auto_box -->
</template>

<script>
	/* eslint-disable no-console */

	import {mapActions} from 'vuex';

	export default {
		name: 'ArticlePosition',
		data() {
			return {
				edit: false,
				etc : { 'score' : 1 },
				evalList: [],
				addList: []
			};
		},
		mounted() {
			this.onSetting();
		},
		methods: {
			...mapActions(['getArticlePositionAPI']),
			/**
			 * 초기 API 요청
			 **/
			async onSetting() {
				this.addList = [];
				try {
					this.evalList = await this.getArticlePositionAPI();
				} catch (e) {
					console.error(e);
				}
			},
			/**
			 * 편집 저장
			 **/
			async apply() {
				try {
						let params = new FormData();
						let list = [];
						if (this.addList.length > 0) {
							this.addList.map(a => {
								this.$set(list, list.length, a);
							});
							//this.$delete(this.addList, 0);
						}
						if (this.edit && this.evalList['list'].length > 0) {
							this.evalList['list'].map(e => {
								this.$set(list, list.length, e);
							});
						}
						// this.$set(list, list.length, this.etc);
					if (!this.validationEval(list)) {
						list.sort((a, b) => {
							return String(a.value) > String(b.value) ? 1 : -1;
						});
						params.append('q', JSON.stringify(list));
						const result = await this.getArticlePositionAPI(params);
						if (result) {
							this.evalList = result;
							this.addList = [];
							this.edit = false;
						} else {
							this.$eventBus.$emit('kickOut');
						}
					} else {
						const node = this.$el.querySelectorAll('[name=\'value\']');
						for (let i = 0; i < node.length; i++) {
							if (node[i].value.trim() === '' || node[i].value.trim() > 50 ) {
								node[i].focus();
								break;
							}
						}
					}
				} catch (e) {
					console.error(e);
				}
			},
			/**
			 * 편집시 공백 체크
			 **/
			validationEval(list) {
				if (list.length > 0) {
					return list.some((ev) => {
						let v = (ev && ev.value) ? ev.value.trim() : '';
						if (v === '') {
							alert("항목명을 입력하세요.");
							return true;
						} else if (Number(v) > 50) {
							alert("50면 이하로 설정 가능합니다.");
							return true;
						}
					});
				} else {
					return false;
				}
			},

			/**
			 * 매체구분 상태 라벨
			 */
			getUseLabel(isUse) {
				if (isUse === 'N') {
					return '미사용';
				} else {
					return '사용';
				}
				/**
				 * 매체구분 가중치 라벨
				 */
			},
			insertCategory() {
				//this.edit = true;
				if(this.edit === false) {
					if (this.addList.length > 0) {
						this.$delete(this.addList, 0);
						return;
					}
				}

				const newLine = {
					isUse: 'Y',
					refValue: '',
					score: '1',
					seq: '',
					value: ''
				};
				this.$set(this.addList, this.addList.length, newLine);
				this.$nextTick(()=>{
					const node = this.$el.querySelectorAll('[name=\'value\']');
					for (let i = 0; i < node.length; i++) {
						if (node[i].value.trim() === '') {
							node[i].focus();
							break;
						}
					}
				})
			}
		}
	};
</script>

<style scoped>

</style>
