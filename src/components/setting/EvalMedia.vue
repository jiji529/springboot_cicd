<template>
	<div>
		<ul class="pre_group_set">
			<li>매체별 광고단가 사용유형</li>
			<template v-for="(item,key) in mediaPolicyList">
				<li>
					<input type="radio" :id="'plc'+key" v-model="mediaPolicy" @change="applyPolicy(item)" :value="item.seq" />
					<label :for="'plc'+key">
						<span></span>{{item.name}}
					</label>
				</li>
			</template>
		</ul>
		<div class="cont_wrap" style="margin-top:40px">
			<div id="policyFirst" class="policyArea" :class="{'dn':mediaPolicy !== '0'}">
				<div class="set_box_area">
					<div class="set_auto_box box4">
						<div class="set_title">
							<h2>전체단일</h2>
							<p>* 모든 매체의 광고단가가 동일하게 적용됩니다.</p>
							<div class="set_tit_btn">
								<a @click="applyValueFirst('hole')" class="btn_na">저장</a>
							</div>
						</div>
						<div class="set_cont">
							<div>
								<dl class="set_report_val">
									<dt>전체</dt>
									<dd><input type="number" v-model="mediaValue0" style="text-align:right" /></dd>
								</dl><span>(단위 : 천원)</span>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div id="policySecond" class="policyArea" :class="{'dn':mediaPolicy !== '1'}">
				<div class="set_box_area">
					<div class="set_auto_box box4" style="height:auto">
						<div class="set_title">
							<h2>유형별공유</h2>
							<p>* 매체유형별로 값을 지정하고 같은 유형끼리 공유합니다.</p>
							<div class="set_tit_btn">
								<a @click="applyValueSecond('hole')" class="btn_na">저장</a>
							</div>
						</div>
						<div class="set_cont">
							<template v-for="(item,key) in mediaValue1">
								<div>
									<dl class="set_report_val" style="width:55%">
										<dt>유형별 - {{item.alias}}</dt>
										<dd><input type="number" pattern="(\d*\.?\d+)"
											autocomplete="off" v-model.number="item.value" style="text-align:right" /></dd>
									</dl><span>(단위 : 천원)</span>
								</div>
							</template>
						</div>
					</div>
				</div>
			</div>
			<div id="policyFourth" class="policyArea" :class="{'dn':mediaPolicy !== '3'}">
				<div class="set_box_area">
					<div class="set_auto_box box4" style="height:auto">
						<div class="set_title">
							<h2>분류별공유</h2>
							<p>* 사용자 지정 분류에 따라 값을 지정하고 같은 분류끼리 공유합니다.</p>
							<div class="set_tit_btn">
								<a @click="applyValueFourth('add')" class="btn_na">저장</a>
							</div>
						</div>
						<div class="set_cont">
							<template v-for="(item,key) in mediaValue3">
								<div>
									<dl class="set_report_val">
										<dt>분류별 - {{item.category_name}}</dt>
										<dd><input type="number" pattern="(\d*\.?\d+)"
											autocomplete="off" v-model.number="item.eval_value" style="text-align:right" /></dd>
									</dl><span>(단위 : 천원)</span>
								</div>
							</template>
						</div>
					</div>
				</div>
			</div>
			<div id="policyThird" class="policyArea" :class="{'dn':mediaPolicy !== '2'}">
				<div class="set_box_area media_category left">
					<div class="set_auto_box box2">
						<div class="set_title">
							<h2>매체유형</h2>
							<div class="set_tit_btn">
								<!--<a @click="" class="btn_gr">취소</a>-->
								<a @click="applyDefaultValue()" class="btn_na">저장</a>
							</div>
						</div>
						<div class="set_cont">
							<div class="set_list_tb">
								<div class="set_list_th">
									<div class="md col1-1">
										<input type="checkbox" title="전체선택" id="mediaTypeAll" v-model="mediaTypeAll" @change="filterMedia()" />
										<label for="mediaTypeAll"><span></span></label>
									</div>
									<div class="md col1-2">매체유형</div>
									<div class="md col1-3">기본단가</div>
									<div class="md col1-4">매체갯수</div>
								</div>
								<ul>
									<template v-for="(item, index) in mediaTypeList">
										<li class="set_list_td" :key="index">
											<input type="checkbox" :id="'type'+index" v-model="item.isChecked" @change="filterMedia(item.value)" />
											<label :for="'type'+index">
												<div class="md col1-1"><span></span></div>
												<div class="md col1-2">{{item.alias}}</div>
												<div class="md col1-3"><input v-if="edit"
																type="number"
																pattern="(\d*\.?\d+)"
																autocomplete="off"
																v-model.number="item.valueDefault"
																style="text-align:right" /></div>
												<div class="md col1-4">{{item.count || 0}}</div>
											</label>
										</li>
									</template>
								</ul>
							</div>
						</div>
					</div>
					<div class="set_auto_box box2">
						<div class="set_title">
							<h2>신규 매체 추가 단가설정</h2>
							<div class="set_tit_btn">
								<!--<a @click="" class="btn_gr">취소</a>-->
								<a @click="applyDefaultValue()" class="btn_na">저장</a>
							</div>
						</div>
						<div class="set_cont">
							<div class="set_list_tb">
								<div class="set_list_th">
									<div class="md col1-1"></div>
									<div class="md col1-2" style="width:calc(100% - 40px); text-align:left">설정</div>
									<!-- <div class="md col1-3"></div>
									<div class="md col1-4"></div> -->
								</div>
								<ul>
									<li v-if="mapMedia && mapMedia[0]" class="set_list_td">
										<input type="checkbox" :id="'mapMediaChkbox'"
										true-value="1" false-value="0" v-model="mapMedia[0].value" />
										<label :for="'mapMediaChkbox'">
											<div class="md col1-1"><span></span></div>
											<div class="md col1-2" style="width:calc(100% - 40px)">{{mapMedia[0].alias}}</div>
										</label>
									</li>
									<li v-if="paperKind && paperKind[0]" class="set_list_td">
										<input type="checkbox" :id="'paperKindChkbox'"
										true-value="1" false-value="0" v-model="paperKind[0].value" />
										<label :for="'paperKindChkbox'">
											<div class="md col1-1"><span></span></div>
											<div class="md col1-2" style="width:calc(100% - 40px)">{{paperKind[0].alias}}</div>
										</label>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
				<div class="set_box_area media_value right">
					<div class="set_auto_box box2" style="width:100%">
						<div class="set_title">
							<h2>매체별 광고단가 설정</h2>
							<p>* 단가에 평가 항목을 곱하여 기사 가치를 산출합니다. (단위 : 천원)</p>
							<div class="set_tit_btn">
								<slot v-if="edit">
									<!--<a @click="onSetting()" class="btn_gr">취소</a>-->
									<a @click="apply()" class="btn_na">저장</a>
								</slot>
								<slot v-else>
									<a @click="edit=false" class="btn_wh">취소</a>
									<a @click="edit=true" class="btn_gr">편집</a>
								</slot>
							</div>
						</div>
						<div class="set_cont">
							<p style="height:34px"></p>
							<div class="ft_sch" style="left:0;right:auto">
	              <input type="text" placeholder="검색어 입력" v-model="mediaInputKeyword" @input="typing">
	              <button type="submit">검색</button>
		          </div>
							<div class="set_list_tb">
								<template v-if="mediaCategoryList.length>0" v-for="(itemCat, indexCat) in mediaCategoryList">
									<div v-if="itemCat.mediaVisibleCount>0" style="overflow:hidden">
										<div class="set_list_th">
											<div class="md col1-1"></div>
											<div class="md col1-2">{{itemCat.paper_category || '미분류'}}</div>
											<div class="md col1-3"></div>
										</div>
										<ul>
											<template v-show="itemCat.category_count>0" v-for="(itemVal, indexVal) in itemCat.media">
												<li v-if="itemVal.isVisible" class="set_list_td">
													<div class="md col1-1"></div>
													<div class="md col1-2">{{itemVal.media_name}} ({{itemVal.mediaTypeName}})</div>
													<div class="md col1-3">
														<input v-if="edit"
																		 type="number"
																		 pattern="(\d*\.?\d+)"
																		 autocomplete="off"
																		 v-model.number.lazy="itemVal.evalValue"
																		 style="text-align:right"
																		 :class="{'unchecked':itemVal.evalInitCheck==1}"
																		 :title="[(itemVal.evalInitCheck==1) ? '신규등록매체 단가등록필요' : '']"
														/>
														<slot v-else>{{ itemVal.evalValue | toCurrency }}</slot>
													</div>
													<slot v-if="itemVal.mapCount>0">
														<template v-if="mediaCategoryList.length>0" v-for="(itemCat1, indexCat1) in mediaCategoryList">
															<template v-if="itemCat1['media']&&itemCat1['media'].length>0" v-for="(mediaVal, mediaIdx) in itemCat1['media']">
																<template v-if="(itemVal.mapCode==mediaVal.paper_code||itemVal.mapCode==mediaVal.mapCode||itemVal.paper_code==mediaVal.mapCode)&&itemVal.media_id!=mediaVal.media_id">
																	<div class="sub md col1-1"></div>
																	<div class="sub md col1-2">┗ {{mediaVal.media_name}} ({{mediaVal.mediaTypeName}})</div>
																	<div class="md col1-3">
																		<input type="number"
																					 pattern="(\d*\.?\d+)"
																					 autocomplete="off"
																					 v-model.number.lazy="mediaVal.evalValue"
																					 style="text-align:right"
																					 :class="{'unchecked':mediaVal.evalInitCheck==1}"
																					 :title="[(mediaVal.evalInitCheck==1) ? '신규등록매체 단가등록필요' : '']"
																		/>
																	</div>
																</template>
															</template>
														</template>
													</slot>
												</li>
												<hr v-if="(indexVal+1)%3==0" style="border:0">
											</template>
											<li v-if="itemCat.mediaVisibleCount > 3 && itemCat.mediaVisibleCount % 3 == 1" class="set_list_td"></li>
											<li v-if="itemCat.mediaVisibleCount > 3 && itemCat.mediaVisibleCount % 3 != 0" class="set_list_td"></li>
										</ul>
									</div>
								</template>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="loading" v-if="loadingGif"><img class="loading-image" :src="require('@/assets/images/loading.gif')" alt="Loading..."/>
		</div>
	</div>
</template>

<script>
	import {mapActions, mapState} from 'vuex';
	import Vue from 'vue';
	export default {
		name: 'EvalMedia',
		components: {
		},
		data(){
			return{
				mediaPolicy: 0, // 광고단가유형지정 0|1|2|3
				mediaPolicyList : [], // 광고단가유형지정 화면표시용
				mediaValue0: 0, // 광고단가유형지정-0 기준값
				mediaValue1: [], // 광고단가유형지정-1 기준값
				mediaValue3: [], // 광고단가유형지정-3 카테고리별 기준값
				mediaTypeAll: false, // 매체유형목록-전체
				mediaTypeList: [], // 매체유형목록
				mediaTypeRef: [], // 매체유형목록-참조
				mediaTypeTmpArr: [], // 매체유형목록-임시
				mediaCategoryList: [], // 매체 종류 목록
				mediaCategoryListPicked: [], // 매체 종류 목록 선택
				mapMedia: 0, // 온라인 매체 추가시 평가가치 초기값 설정
				paperKind: 0, // 새로추가
				mediaValueVisibleData: [], // 표시정보
				edit: true, // 편집 여부
				mediaValueList: [], // 매체별광고단가 데이터
				mediaInputKeyword: '', // 매체입력검색어
				mediaInputKeywordPattern: /^[A-Za-z가-힣]{2,}$/, // pattern
				mediaInputKeywordCount: 0
			}
		},
		filters: {
			toCurrency(value) {
				return !value ? 0 : new Intl.NumberFormat().format(value);
			}
		},
		async mounted(){
			this.onSetting();
		},
		methods:{
			...mapActions(['getMediaCategoryAPI', 'getMediaPolicyAPI', 'getMediaValueAPI']),
			methodThatForcesUpdate() {
				this.$forceUpdate();
			},
			/**
			 * 초기 API 요청
			 **/
			async onSetting() {
				try {
					let auto = [];
					auto.push({'seq' : '0' , 'name' : '전체단일'});
					auto.push({'seq' : '1' , 'name' : '유형별'});
					auto.push({'seq' : '2' , 'name' : '매체별'});
					auto.push({'seq' : '3' , 'name' : '분류별'});
					this.mediaPolicyList = auto;

					const params = new FormData();
					params.append('m', 'p');
					const result = await this.getMediaPolicyAPI(params);
					this.mediaPolicy = result.final;
					await this.getMediaValueByPolicy();
				} catch(e) {
					console.error(e);
				}
			},
			/**
			 * 지정 항목 표시 - value by policy
			 **/
			async getMediaValueByPolicy() {
				if (this.mediaPolicy == 0) {
					await this.applyValueFirst();
				} else if (this.mediaPolicy == 1) {
					await this.applyValueSecond();
				} else if (this.mediaPolicy == 2) {
					await this.applyValueThird(true);
				} else if (this.mediaPolicy == 3) {
					await this.applyValueFourth();
				}
			},
			/**
			 * 지정 항목 적용 - policy
			 **/
			async applyPolicy() {
				const params = new FormData();
				params.append('m', 'p');
				params.append('q', this.mediaPolicy);
				const result = await this.getMediaPolicyAPI(params);
				if (result) {
					this.mediaPolicy = result.final;
					await this.getMediaValueByPolicy();
				} else {
					this.$eventBus.$emit('kickOut');
				}
			},
			/**
			 * 지정 항목 적용 - defaultValueUnified
			 **/
			async applyValueFirst(arg) {
				const params = new FormData();
				params.append('m', 'u');
				if (arg) params.append('q', this.mediaValue0);
				const result = await this.getMediaPolicyAPI(params);
				if (result) {
					this.mediaValue0 = result.final;
				} else {
					this.$eventBus.$emit('kickOut');
				}
			},
			/**
			 * 지정 항목 적용 - defaultValueGrouped
			 **/
			async applyValueSecond(arg) {
				const params = new FormData();
				params.append('m', 't');
				if (arg) {
					let list = [];
					let tmp;
					this.mediaValue1.map(e => {
						tmp = {
							tkey : e.tKey,
							value : e.value
						}
						list.push(tmp);
					});
					params.append('q', JSON.stringify(list));
				}

				const result = await this.getMediaPolicyAPI(params);
				if (result && result.final) {
					this.mediaValue1 = result.final;
				} else {
					this.$eventBus.$emit('kickOut');
				}
			},
			/**
			 * 지정 항목 적용 - defaultValueGrouped
			 **/
			async applyValueThird() {
				let result = await this.getMediaCategoryAPI();
				if (result) {
					this.mediaCategoryList = result.final;
					this.mediaTypeList = result.final_type;
					this.mediaTypeList.forEach(type => {
						this.mediaTypeRef[type['value']] = type['alias'];
						type['isChecked'] = false;
					});
					this.mapMedia = result.final_mapmedia;
					this.paperKind = result.final_paperkind;

					result = await this.getMediaValueAPI();
					this.mediaValueList = result.final;
					this.attachValueToCategory();
					// if (this.mediaTypeAll) this.mediaTypeList.forEach(v => { v.isChecked = true });
					this.methodThatForcesUpdate();
				} else {
					this.$eventBus.$emit('kickOut');
				}
			},
			/**
			 * 지정 항목 적용 - defaultValueCategory
			 **/
			async applyValueFourth(arg) {
				const params = new FormData();
				params.append('m', 'c');
				if (arg) {
					let list = [];
					let tmp;
					this.mediaValue3.map(e => {
						tmp = {
							category_id : e.category_id,
							eval_value : e.eval_value
						}
						list.push(tmp);
					});
					params.append('q', JSON.stringify(list));
				}

				const result = await this.getMediaPolicyAPI(params);
				if (result) {
					this.mediaValue3 = result.final;
				} else {
					this.$eventBus.$emit('kickOut');
				}
			},

			async applyDefaultValue() {
				let mediaTypeListRequest = [];
				let params = new FormData();
				this.mediaTypeList.forEach(type => {
					mediaTypeListRequest.push({
						tkey: type.sKey,
						value: type.valueDefault
					});
				});
				params.append('m', 't');
				params.append('q', JSON.stringify(mediaTypeListRequest));
				params.append('mm', JSON.stringify(this.mapMedia[0]));
				params.append('pk', JSON.stringify(this.paperKind[0]));
				const result = await this.getMediaPolicyAPI(params);
				if (result) {
					window.alert((result.success !== false) ? '유형분류별 광고 단가가 저장되었습니다.' : 'Error!');
				} else {
					this.$eventBus.$emit('kickOut');
				}
			},
			/**
			 * 편집 항목 저장
			 **/
			async apply() {
				let params = new FormData(), mediaValuelistRequest = [], tmp;
				for (var key in Object.keys(this.mediaCategoryList)) {
					if (!this.mediaCategoryList[key]['media']) continue;
					tmp = this.mediaCategoryList[key]['media'];
					for (var keyInner in Object.keys(tmp)) {
						mediaValuelistRequest.push({
							media_id: tmp[keyInner].media_id || '',
							isUse : tmp[keyInner].isUse || 0,
							evalValue : tmp[keyInner].evalValue || 0
						});
					}
				}
				params.append('q', JSON.stringify(mediaValuelistRequest));
				const result = await this.getMediaValueAPI(params);
				if (result) {
					this.mediaValueList = result.final;
					window.alert((result.success !== false) ? '광고 단가가 저장되었습니다.' : 'Error!');
					this.attachValueToCategory();
					this.filterMedia(true);
				} else {
					this.$eventBus.$emit('kickOut');
				}
			},
			/**
			 * category <= value, type.count
			 **/
			async attachValueToCategory() {
				let tmp;
				this.mediaTypeTmpArr = [];
				this.mediaCategoryList.forEach(category => {
					tmp = "'" + category.paper_category + "'"
					for (var key in this.mediaValueList) {
						if (key == tmp) {
							for (var keyinner in this.mediaValueList[key]) {
								this.mediaValueList[key][keyinner]['mediaTypeName']
										= this.mediaTypeRef[this.mediaValueList[key][keyinner]['mediaType']];
								this.mediaValueList[key][keyinner]['isVisible'] = true;
								this.mediaValueList[key][keyinner]['isModified'] = false;
								if (!this.mediaTypeTmpArr[this.mediaValueList[key][keyinner]['mediaType']]) {
									this.mediaTypeTmpArr[this.mediaValueList[key][keyinner]['mediaType']] = 0;
								}
								this.mediaTypeTmpArr[this.mediaValueList[key][keyinner]['mediaType']]++;
							}
							category['mediaVisibleCount'] = this.mediaValueList[key].length;
							category['media'] = this.mediaValueList[key];
							delete this.mediaValueList[key];
							break;
						}
					}
				});
				this.mediaTypeList.forEach(type => {
					type['count'] = this.mediaTypeTmpArr[type['value']];
				});
			},
			typing: function(e) {
				let message = e.target.value;
				if ((message.length > 1 && (this.mediaInputKeywordPattern).test(message))) {
					this.mediaInputKeyword = message;
					this.filterMedia();
				} else if (message.length == 0) {
					this.filterMedia();
				}
			},
			async filterMedia(arg) {
				let mediaTypeListChecked = [], mediaVisibleCount = 0;
				let mediaVisible = false, mediaInputKeywordValid = false;
				this.mediaInputKeywordCount = 0;

				let _allChecked = true;
				this.mediaTypeList.forEach(mediaType => {
					_allChecked = _allChecked && mediaType.isChecked;
					if (!arg) mediaType.isChecked = this.mediaTypeAll;
					if (mediaType.isChecked) mediaTypeListChecked.push(mediaType.value);
				});
				if (arg) this.mediaTypeAll = _allChecked;
				if (mediaTypeListChecked.length === 0) {
					mediaTypeListChecked = this.mediaTypeList.map(v => { return v.value; });
				} // 개별선택 없어도 전체 목록 표시

				if (this.mediaInputKeyword.length > 1
						&& (this.mediaInputKeywordPattern).test(this.mediaInputKeyword)) {
					mediaInputKeywordValid = true;
				}

				this.mediaCategoryList.forEach(category => {
					mediaVisibleCount = 0;
					if (!category['media']) return;
					category['media'].forEach(media => {
						mediaVisible = (this.mediaTypeAll ||
								mediaTypeListChecked.includes(media.mediaType));
						if (mediaInputKeywordValid) {
							mediaVisible = mediaVisible && (media.media_name).includes(this.mediaInputKeyword);
						}
						media.isVisible = mediaVisible;
						if (mediaVisible) {
							mediaVisibleCount++;
							this.mediaInputKeywordCount++;
						}
					});
					category['mediaVisibleCount'] = mediaVisibleCount;
				});
				this.methodThatForcesUpdate();
			}
		},
		computed: {
			...mapState(['loadingGif'])
		}
	};
</script>

<style scoped>
	.dn {display: none}
	.policyArea {overflow: hidden}
	.media_category.left {width:20%}
	.media_value.right {width:calc(80% - 24px)}
	.media_category .set_list_td > label {width:100%}
	.media_category .md {
		position:static!important;
	}
	.media_category .md.col1-1 {
		color:red;
		width:40px!important;
		padding-right:10px!important;
		text-align:center!important;
	}
	.media_category .md.col1-2 {
		/*width:calc(100% - 125px)!important;*/
		border-left:0!important;
		line-height:1.5!important;
	}
	.media_category .md.col1-3 {
		width:98px!important;
	}
	.media_category .md.col1-4 {
		width:68px!important;
		border-right:0!important;
		text-align:right!important;
		line-height:1.5;
	}/*
	.media_category ul li:last-child {
		border-top:1px #ccc solid;
		margin-top:24px;
	}
	.media_category ul li:last-child .md.col1-2 {
		width:calc(100% - 40px) !important;
	}*/
	.media_value .md.col1-1 {width:80px!important;padding-right:10px!important;position:static!important;text-align:center!important}
	.media_value .md.col1-2 {
		text-align:left!important;width:calc(100% - 245px)!important;border-left:0!important;border-right:0!important;position:static!important;right:0;white-space:nowrap;
	}
	.media_value .md.col1-3 {width:165px!important;border-right:0!important;position:static!important;right:0;
		text-align:right !important;
		padding-right:55px !important;
	}
	hr {clear:both;position:relative;top:-1px}
	.media_value .set_list_tb > div {margin-top:-1px}
	.media_value .set_list_th {border-top: 1px #ccc solid;}
	.media_value .set_list_th .md.col1-2 {font-weight:bold}
	.media_value .set_list_td .md.col1-1 {padding-left:48px!important}
	.media_value .set_list_td {
		position:static!important;
		overflow:hidden;
		width:33.3%!important;
		border-top: 1px #ccc solid!important;
		border-bottom: 0 !important;
	}
	.media_value ul li:nth-child(0n+1) {
		border-top: 0!important;
	}
	.media_value ul li:nth-child(0n+2) {
		border-top: 0!important;
	}
	.media_value ul li:nth-child(0n+3) {
		border-top: 0!important;
	}
	.margin-top-minus {
		margin-top: -1px !important;
	}
	#inputKeyword {
		margin-bottom: 16px;
		width: 100px;
	}
	.set_list_tb > div {overflow:hidden;margin-bottom:4px}
	.set_cont > div {overflow:hidden;}
	.set_cont > div > dl {border-bottom:0;}
	input.unchecked {
		background-color: rgba(192,0,0,0.1);
		border: 1px solid red !important;
	}
	.loading { width: 100%;height: 100%;top: 0px;left: 0px;position: fixed;display: block;opacity: 0.7;background-color: #fff;z-index: 99;text-align: center;vertical-align: middle;}
	.loading-image {position: absolute;top: 50%;left: 50%;z-index: 100;}
	.loading-message {position: relative;margin: 0 auto;z-index: 101;}
</style>
