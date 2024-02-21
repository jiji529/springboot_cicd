<template>
	<div>
		<div class="pre_top sch">
			<div class="pre_tit">검색하기</div>
			<div class="btn_sch off">
				<a @click="schOff">검색접기</a>
			</div>
		</div>
		<div class="sch_area" style="display:block;">
			<div class="sch_cont" style="margin-bottom:30px">
				<dl class="sch_element">
					<dt>기간 설정</dt>
					<dd class="datebox">
						<select v-model="searchConditionModel.selectedDateStand" >
							<option value="0">연간</option>
							<option value="1">월간</option>
							<option value="2">일</option>
							<option value="3">지정</option>
						</select>
						<select v-show="searchConditionModel.selectedDateStand !=='3'" v-model="searchConditionModel.selYear" v-if="yearList">
							<option v-for="i in yearList" :value="i">{{i}}</option>
						</select>
						<select v-show="mCondition" v-model="searchConditionModel.selMon" @change="lastDayCal()">
							<option v-for="i in 12" :value="i" :key="i">{{i}}</option>
						</select>
						<select v-show="dCondition" v-model="searchConditionModel.selDay" >
							<option v-for="i in lastDay" :value="i" :key="i">{{i}}</option>
						</select>
						<div class="date_box" v-show="searchConditionModel.selectedDateStand === '3'">
							<datepicker :disabledDates="disabledDates"
													:format="format"
													:language="ko"
													v-model="searchConditionModel.sDate"/>
							<span class="between" >~</span>
							<datepicker :disabledDates="disabledDates"
													:format="format"
													:language="ko"
													v-model="searchConditionModel.eDate"/>
						</div>
					</dd>
				</dl>
				<dl class="sch_element">
					<dt>검색 범위</dt>
					<dd class="border">
						<ul class="pre_group" id="news_group_select">
							<li>
								<input type="checkbox" id="search_form_all_check" :checked="searchRangeIsAll()" @change="searchRangeAllCheck($event)">
								<label for="search_form_all_check"><span></span>전체선택</label>
							</li>
							<li v-for="g in newsGroup" :key="g.lvalue">
								<input type="checkbox" :value="g.lvalue" :id="'search_form_'+g.lvalue" v-model="searchConditionModel.selNewsMe" >
								<label :for="'search_form_'+g.lvalue"><span></span> {{g.sname}} </label>
							</li>
						</ul>
					</dd>
				</dl>
				<dl class="sch_element">
					<dt>검색어</dt>
					<dd>
						<select v-model="searchConditionModel.search_range">
							<option value="0">제목+내용</option>
							<option value="1">기자명</option>
						</select>
						<input type="text" placeholder="검색어를 입력해 주세요" v-model="searchConditionModel.keyword" >
						<input type="radio" id="sch_key_and" name="src_key" value="and" v-model="searchConditionModel.keyword_condition" >
						<label for="sch_key_and"><span></span>AND</label>
						<input type="radio" id="sch_key_or" name="src_key" value="or" v-model="searchConditionModel.keyword_condition" >
						<label for="sch_key_or"><span></span>OR</label>
					</dd>
				</dl>
				<dl class="sch_element">
					<dt>배제어</dt>
					<dd class="border keyword">
						<input type="text" placeholder="배제어를 입력해 주세요" v-model="searchConditionModel.ex_keyword">
						<input type="radio" id="sch_exp_and" name="src_exp" value="and" v-model="searchConditionModel.ex_keyword_condition" >
						<label for="sch_exp_and"><span></span>AND</label>
						<input type="radio" id="sch_exp_or" name="src_exp" value="or" v-model="searchConditionModel.ex_keyword_condition" >
						<label for="sch_exp_or"><span></span>OR</label>
					</dd>
				</dl>
				<dl class="sch_element">
					<dt>검색조건</dt>
					<dd>
						<ul class="border">
							<li>
								<input type="checkbox" v-model="searchConditionModel.hUse" id="hUse" >
								<label for="hUse"><span></span>감춘 기사 포함</label>
							</li>
							<li>
								<input type="checkbox" v-model="searchConditionModel.news_comment" id="news_comment"	>
								<label for="news_comment"><span></span>평가제외 기사 포함</label>
							</li>
							<li>
								<input type="checkbox" v-model="searchConditionModel.sbUse" id="sbUse"	>
								<label for="sbUse"><span></span>비공개 스크랩 포함</label>
							</li>
						</ul>
					</dd>
				</dl>
				<dl class="sch_element">
					<dt>매체선택</dt>
					<dd id="media_group_select">
						<div class="fake_button_upper">
							<ul>
								<li>
									<input type="checkbox" id="sch_media_all"
												 @change="selectMediaAll($event)"
												 :checked="stateMediaAll()">
									<label for="sch_media_all"><span></span>전체 선택</label>
								</li>
								<li>
									<input type="radio" id="gic_true" name="gic_true" :value="true" v-model="getStatSetting.groupIsCategory" @change="changeMediaGroup()">
									<label for="gic_true"><span></span>분류</label>
									<input type="radio" id="gic_false" name="gic_false" :value="false" v-model="getStatSetting.groupIsCategory" @change="changeMediaGroup()">
									<label for="gic_false"><span></span>유형</label>
								</li>
							</ul>
							<p style="display:none">{{groupSelectList}}/{{partSelectMediaGroup}}</p>
						</div>
						<div class="fake_button">
							<div style="width:calc(100% - 26px);float:left">
								<ul>
									<li v-for="(g,gidx) in mediaLabel()" :key="'fbml_'+gidx">
										<input type="checkbox"
										:id="'fbmlcb_'+gidx"
										:value="g.id"
										@change="selectMediaGroup($event,g)"
										v-model="getStatSetting.mediaSelectionOptions">
										<label :for="'fbmlcb_'+gidx"><span :class="{'part_checked' : partSelectMediaGroup.indexOf(g.id) > -1}"></span>{{g.name}} {{g.countCur}}/{{g.count}}</label>
									</li>
								</ul>
							</div>
							<div style="width:26px;float:left">
								<button class="test_button" @click="showMediaSelection" title="매체목록 보기"></button>
							</div>
						</div>
						<MediaSelection v-show="isMediaSelectionVisible"
														@close="closeMediaSelection"
														:value="getStatSetting.evalSelectionMedium"
														@input="val => this.getStatSetting.evalSelectionMedium = val" :key="someVar"/>
					</dd>
				</dl>
				<dl class="sch_element">
					<dt>표시갯수</dt>
					<dd>
						<select v-model="searchConditionModel.pageSize">
							<option value="25">25</option>
							<option value="50">50</option>
							<option value="100">100</option>
							<option value="200">200</option>
						</select>
					</dd>
				</dl>
			</div>
			<search-eval0 v-on:sendEval0="getEval0"></search-eval0>
			<search-eval1 v-on:sendEval1="getEval1"></search-eval1>
			<search-eval2 v-on:sendEval2="getEval2"></search-eval2>
			<div class="sch_btn">
				<a class="btn_gr" @click="reset">초기화</a>
				<a class="btn_bl" @click="goSearch">검색</a>
			</div>
			<div class="sch_foot"> <a @click="showSearchTotalItem" :class="{'ico_open':!this.getStatSetting.searchTotalItemOpen}">{{totalItemLabel}}</a>
				<!-- 전체항목 펴기 할 때 display block-->
				<div class="sch_val" style="display:block;" v-show="this.getStatSetting.searchTotalItemOpen">
					<dl class="sch_value" v-show="selectMediaCount()>0">
						<dt>매체선택</dt>
						<dd v-if="stateMediaAll()"><b>전체선택</b></dd>
						<slot v-else>
							<dd v-for="(medium,key) in getStatSetting.evalSelectionMedium" :key="key" v-if="key!=='' && medium.length>0">
								<b>{{key}}</b> -
								<slot v-if="countMediaResult(key, medium)"><b>전체선택</b></slot>
								<slot v-else>{{selectMediaResult(medium)}}</slot>
							</dd>
						</slot>
					</dl>
					<dl class="sch_value" v-show="getSearchData.isCheckedEval0">
						<dt>자동평가 항목</dt>
						<template v-for="(eval0, ky) in getSearchData.eval0_presentChecked">
							<dd :key="ky+'auto-s-'" v-show="eval0.sub.length > 0">
								<b>{{eval0.upper_cate_name}}</b> -
								<span>{{eval0.sub.join()}}</span>
							</dd>
						</template>
					</dl>
					<dl class="sch_value" v-show="getSearchData.isCheckedEval1">
						<dt>평가 1 항목</dt>
						<template v-for="(category, ky) in getSearchData.eval1_presentChecked">
							<dd :key="ky+'eval1-s-'"  v-show="category.items.length>0">
								<b>{{category.cate}}</b> -
								<span>{{category.items.join()}}</span>
							</dd>
						</template>
					</dl>
					<dl class="sch_value" v-show="getSearchData.isCheckedEval2">
						<dt>평가 2 항목</dt>
						<template v-for="(checked, ky) in getSearchData.eval2_presentChecked">
							<dd :key="ky+'eval2-s-'"  v-show="checked.sub.length>0">
								<b>{{checked.upper_cate_name}}</b> -
								<span>{{checked.sub.join()}}</span>
							</dd>
						</template>
					</dl>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import SearchEval0 from './SearchEval0'
	import SearchEval1 from './SearchEval1'
	import SearchEval2 from './SearchEval2'
	import MediaSelection from '../../MediaSelection'
	import Datepicker from 'vuejs-datepicker'
	import {ko} from 'vuejs-datepicker/dist/locale'
	import {mapState, mapMutations, mapActions, mapGetters} from 'vuex'
	export default {
		data() {
			const startDate = new Date();
			const minDate = new Date(2017, 0, 1);
			const year = startDate.getFullYear();
			const month = (startDate.getMonth())+1;
			const day = startDate.getDate();
			return {
				//searchForm data
				openDate: new Date(),
				ko: ko,
				format: 'yyyy-MM-dd',
				datePickerClass: {
					wrapper: 'datepicker-wrapper',
					input: 'datepicker-input',
				},
				disabledDates: {
					from: startDate,
					to: minDate
				},
				lastDay : new Date(year, month, 0).getDate(),
				totalCategoryId : [],

				//검색 default값 -> Vue 전역변수(store)로 뺐음
				// searchConditionModel : {
				// 	selectedDateStand : "0",
				// 	selYear: year,
				// 	selMon: month,
				// 	selDay: day,
				// 	sDate: startDate,
				// 	eDate: startDate,
				// 	search_range: '0',
				// 	keyword: '',
				// 	keyword_condition: 'or',
				// 	ex_keyword: '',
				// 	ex_keyword_condition: 'or',
				// 	hUse: true,
				// 	news_comment: true,
				// 	sbUse: true,
				// 	selNewsMe : ["0"],
				// 	pageSize: 50,
				// 	pageNo: -1,
				// 	order_column: '',
				// 	order: ''
				// },
				searchConditionDefault : {
					selectedDateStand : "0",
					selYear: year,
					selMon: month,
					selDay: day,
					sDate: startDate,
					eDate: startDate,
					search_range: '0',
					keyword: '',
					keyword_condition: 'or',
					ex_keyword: '',
					ex_keyword_condition: 'or',
					hUse: true,
					news_comment: true,
					sbUse: true,
					selNewsMe : ["0"],
					pageSize: 50,
					pageNo: -1,
					order_column: '',
					order: ''
				},
				searchCondition : [],

				isMediaSelectionVisible: false,
				totalItemLabel : '전체 항목 접기',
				allCategoryFold : true,

				groupByCategory: true,
				partSelectMediaGroup: []
				, someVar: 36
			}
		},
		components: {
			SearchEval0,
			SearchEval1,
			SearchEval2,
			MediaSelection,
			Datepicker,
		},
		name: 'Search',
		computed: {
			...mapState(['searchConditionModel','initSearchForm','callApiSearch','searchFormSeen','searchSelectedArticle','newsGroup']),
			...mapGetters(['getSearchData','getEval1Category', 'getEval2Class', 'getStatSetting', 'getMediaList', 'getConfigEval']),
			yearOldest() {
				if (this.getConfigEval && this.getConfigEval['policy'] && this.getConfigEval['policy']['OY']) {
					return Number(this.getConfigEval['policy']['OY']['value']);
				} else {
					return 2010;
				}
			},
			yearList() {
				this.trigger;
				let rtn = [];
				let yearCurrent = new Date().getFullYear();
				let yearOldest = this.yearOldest;
				let yearPush = yearCurrent;
				while (yearPush >= yearOldest) {
					rtn.push(yearPush--);
				}
				return rtn;
			},
			groupSelectList: function() {
				let group = this.getStatSetting.groupIsCategory ? this.categoryList : this.typeList, rtn = [], rtn2 = [];
				// forEach문처럼 사용하기 위해서 사용하는가?
				for (let [k,v] of Object.entries(this.getStatSetting.evalSelectionMedium)) {
					for (let [gk,gv] of Object.entries(group)) {
						if (k === gv.name) {
							if (gv.count === v.length) {
								rtn.push(gv.id);
							} else if (v.length > 0) {
								rtn2.push(gv.id);
							}
						}
					}
				}
				this.getStatSetting.mediaSelectionOptions = rtn;
				this.partSelectMediaGroup = rtn2;
				return rtn;
			},
			categoryList: function() {
				const result = {};
				if (this.getMediaList) {
					let tmpId, tmpMedia, tmpGroup;
					for (const key in this.getMediaList) {
						tmpMedia = this.getMediaList[key];
						tmpId = tmpMedia.category_id;
						if (!result[tmpId]) {
							result[tmpId] = Object.assign({}, {
								id: tmpId,
								name: tmpMedia.category_name,
								count: 0,
								visible: true,
								media: []
							});
						}
						result[tmpId].count++;
						result[tmpId].media.push(tmpMedia);
					}
				}
				return result;
			},
			typeList: function() {
				const result = {};
				if (this.getMediaList) {
					let tmpId, tmpMedia, tmpGroup;
					for (const key in this.getMediaList) {
						tmpMedia = this.getMediaList[key];
						tmpId = tmpMedia.media_type;
						if (!result[tmpId]) {
							result[tmpId] = Object.assign({}, {
								id: tmpId,
								name: tmpMedia.media_type_name,
								count: 0,
								visible: true,
								media: []
							});
						}
						result[tmpId].count++;
						result[tmpId].media.push(tmpMedia);
					}
				}
				return result;
			},
			mCondition() {return this.searchConditionModel.selectedDateStand === "1" || this.searchConditionModel.selectedDateStand === "2"},
			dCondition() {return this.searchConditionModel.selectedDateStand === "2"},
			fullList: function() {
				const result = {};
				if (this.getMediaList) {
					let tmpId, tmpMedia, tmpGroup;
					for (const key in this.getMediaList) {
						tmpMedia = this.getMediaList[key];
						tmpId = (this.getStatSetting.groupIsCategory) ? tmpMedia.category_id : tmpMedia.media_type;
						if (!result[tmpId]) {
							result[tmpId] = Object.assign({}, {
								group_id: tmpId,
								group_name: (this.getStatSetting.groupIsCategory) ? tmpMedia.category_name : tmpMedia.media_type_name,
								mediaListRaw: [],
								mediaCount: 0
							});
						}
						result[tmpId].mediaCount++;
						result[tmpId].mediaListRaw.push(tmpMedia);
					} // group by category|type
					for (const key in result) {
						result[key].mediaList = this.mediaGroups(result[key].mediaListRaw, 'paper_category');
						delete result[key].mediaListRaw;
					} // group by paper_category
				}
				return result;
			}
		},
		watch: {
			getMediaList: function() {
				for(let [k,v] of Object.entries(this.getStatSetting.evalSelectionMedium)) {
					if (v.length > 0) return ;
				}
				let result = [];
				this.getStatSetting.evalSelectionMedium = {};
				for (let [k,v] of Object.entries(this.mediaLabel())) {
					if (v && v.media) {
						result = [];
						v.media.forEach(m => result.push(m));
						this.getStatSetting.evalSelectionMedium[v.name] = result;
					}
				}
			}
			, searchFormSeen(param) { // 검색접기 했을 때, 데이터가 없다면 검색.
				if (!param) return;
				this.SET_ARTICLE_LIST_SOURCE('searchForm');
				if (this.callApiSearch && typeof this.searchSelectedArticle != 'object') {
					this.goSearch();
				}
			}
		},
		created() {
			this.SET_LOADING_GIF(true);
			this.$eventBus.$on('triggerSearch', params => {
				this.goSearch();
			});
			this.$eventBus.$on('setSearchOrderOption', params => {
				this.searchConditionModel.order_column = params.order_column;
				this.searchConditionModel.order = params.order;
			});
		},
		async mounted() {
			if (!this.getConfigEval || !this.getConfigEval['policy'] || !this.getConfigEval['policy']['OY']) {
				await this.getConfigEvalAPI(null);
			}
			let params = new FormData();
			params.append('t', 's');
			await this.getEval2ClassAPI(params);
			await this.newsGroupAPI();
			this.searchRangeAllCheck({target: {checked: true}});
			if (this.searchFormSeen && this.callApiSearch) await this.goSearch();
			this.SET_LOADING_GIF(false);
		},
		beforeDestroy() {
			this.$eventBus.$off('triggerSearch');
			this.$eventBus.$off('setSearchOrderOption');
		},
		methods: {
			...mapActions(['getConfigEvalAPI', 'getEval2ClassAPI', 'newsGroupAPI']),
			...mapMutations(['SET_INIT_SEARCH_FORM',
				'SET_SEARCH_FORM_SEEN',
				'SET_ARTICLE_LIST_SOURCE',
				'SET_CALL_API_SEARCH',
				'SET_SELECTED_ARTICLE',
				'SET_ARTICLE_LIST',
				'SET_LOADING_GIF'
			]),
			lastDayCal(){
				this.lastDay = new Date(this.searchConditionModel.selYear,this.searchConditionModel.selMon, 0).getDate();
				if(this.searchConditionModel.selDay > this.lastDay) this.searchConditionModel.selDay = this.lastDay;
			},
			//매체선택열기
			showMediaSelection() {
				this.someVar++;
				this.isMediaSelectionVisible = true;
				this.$statConfig.bodyScrolling(false);
			},
			//매체선택닫기
			closeMediaSelection() {
				this.isMediaSelectionVisible = false;
				this.$statConfig.bodyScrolling(true);
			},
			removeMediaAll() {
				let newMediaList = {};
				Object.keys(this.getStatSetting.evalSelectionMedium).forEach(c => {
					newMediaList[c] = new Array();
				});
				this.getStatSetting.evalSelectionMedium = newMediaList;
			},
			//매체선택
			selectMediaAll($event) {
				if ($event.target.checked) {
					let groupList = this.getStatSetting.groupIsCategory ? this.categoryList : this.typeList, group;
					this.getStatSetting.mediaSelectionOptions = [];
					for (let [k,v] of Object.entries(groupList)) {
						this.getStatSetting.mediaSelectionOptions.push(k);
						this.selectMediaGroup($event, v);
					}
				} else {
					this.getStatSetting.evalSelectionMedium = {};
					this.getStatSetting.mediaSelectionOptions = [];
				}
			},
			//매체선택
			stateMediaAll() {
				if (this.getMediaList.length > 0) {
					let result = [];
					this.getMediaList.forEach(cate => {
						result.push(cate.category_id);
					});
					return result.every(item => {
						if (this.getStatSetting.mediaSelectionOptions.indexOf(item) > -1) {
							return true;
						}
					});
				}
			},
			//매체선택
			selectMediaGroup($event, group) {
				let result = [];
				if (group && group.media) {
					this.getStatSetting.evalSelectionMedium[group.name] = [];
					if (!$event.target.checked) {
						result = [];
					} else {
						group.media.forEach(media => {
							result.push(media);
						});
					}
					this.getStatSetting.evalSelectionMedium[group.name] = result;
				}
			},
			/**
			 * 매체 목록 버튼 라벨
			 * @returns {string}
			 */
			mediaLabel() {
				let result = [], count = 0, item = {};
				let group = this.getStatSetting.groupIsCategory ? this.categoryList : this.typeList;

				if (group) {
					for (let [k,v] of Object.entries(group)) {
						if (!this.getStatSetting.evalSelectionMedium[v.name]) {
							this.getStatSetting.evalSelectionMedium[v.name] = [];
						}
						item = v;
						item['countCur'] = this.getStatSetting.evalSelectionMedium[v.name].length;
						result.push(item);
					}
				}

				return result;
			},
			changeMediaGroup() {
				let group = this.getStatSetting.groupIsCategory ? this.categoryList : this.typeList, subGroup = '', rtn = {};
				for (let [k,v] of Object.entries(group)) {
					rtn[v.name] = [];
				}
				for (let [k,v] of Object.entries(this.getStatSetting.evalSelectionMedium)) {
					v.forEach(m => {
						// subGroup = this.getStatSetting.groupIsCategory ? m.category_name : m.media_type_name;
						rtn[this.getStatSetting.groupIsCategory ? m.category_name : m.media_type_name].push(m);
					});
				}
				this.getStatSetting.evalSelectionMedium = rtn;
			},
			//검색하기 초기화
			reset() { 
				this.$eventBus.$emit('searchEval0Reset');
				this.$eventBus.$emit('searchEval1Reset');
				this.$eventBus.$emit('searchEval2Reset');
				Object.keys(this.searchConditionModel).map(key => {
					this.$set(this.searchConditionModel, key, this.searchConditionDefault[key]);
				});
				this.searchRangeAllCheck({target: {checked: true}});
				this.selectMediaAll({target: {checked: true}});
			},
			countMediaResult(key, medium) {
				let groupList = this.getStatSetting.groupIsCategory ? this.categoryList : this.typeList, result = false;
				for (let [k,v] of Object.entries(groupList)) {
					if (v.name === key) {
						if (v.count === medium.length) result = true;
						break;
					}
				}
				return result;
			},
			//검색범위 전체선택 check 여부
			searchRangeIsAll() {
				// let $this = this;
				// const newsMe = this.newsGroup;
				// let rtn = true;
				// for (let [k,v] of Object.entries(this.newsGroup)) { // this.newsGroup은 메뉴리스트이다.
				// 	rtn = rtn && (this.searchConditionModel.selNewsMe.indexOf(v.lvalue) > -1);
				// }
				// return rtn;

				for (let [k,v] of Object.entries(this.newsGroup)) { // this.newsGroup은 메뉴리스트이다.
					// 하나라도 체크가 안되면 false
					if( !(this.searchConditionModel.selNewsMe.indexOf(v.lvalue) > -1) ) return false;
				}
				return true;
			},
			//검색범위 전체선택 체크박스 체크,체크해제 시
			searchRangeAllCheck($event) {
				for (let [k,v] of Object.entries(this.newsGroup)) {
					if ($event.target.checked) {
						if (this.searchConditionModel.selNewsMe.indexOf(v.lvalue) === -1) {
							this.searchConditionModel.selNewsMe.push(v.lvalue);
						}
					} else {
						const idx = this.searchConditionModel.selNewsMe.indexOf(v.lvalue);
						if (idx > -1) {
							this.searchConditionModel.selNewsMe.splice(idx, 1);
						}
					}
				}
			},
			showSearchTotalItem() {
				this.getStatSetting.searchTotalItemOpen = !this.getStatSetting.searchTotalItemOpen;
				if(this.getStatSetting.searchTotalItemOpen) this.totalItemLabel = '전체 항목 접기';
				else this.totalItemLabel = '전체 항목 펴기';
			},
			selectMediaCount() {
				let total = 0;
				if (this.getStatSetting.evalSelectionMedium) {
					for (let key in this.getStatSetting.evalSelectionMedium) {
						if (this.getStatSetting.evalSelectionMedium[key].length > 0) {
							total += this.getStatSetting.evalSelectionMedium[key].length;
						}
					}
				}
				return total;
			},
			/**
			 * 매체 선택 결과값 출력
			 * @returns {string}
			 */
			selectMediaResult(medium) {
				let result = '';
				if (medium.length > 0) {
					let mediaArray = [];
					medium.forEach(media=> {
						mediaArray.push(media.media_name);
					});
					result += mediaArray.join(', ');
				}
				return result;
			},
			getEval0(transData, eval0_condition) {
				let selEval0 = [];
				transData.forEach(one => {
					if (one !== null) { selEval0.push(one); }
				});
				this.getSearchData.oneRowEval0 = selEval0.join();
				this.getSearchData.eval0_condition = eval0_condition;

				//선택항목 보여주는 데이터
				let presentChecked = [], ev0 = {};
				for (let key1 in this.getEval2Class) {
					ev0 = this.getEval2Class[key1];
					presentChecked.push({
						upper_cate_name: ev0.upper_cate_name, sub: []
					});
					for (let key2 in ev0.sub) {
						for (let key3 in transData) {
							if (transData[key3] === ev0.sub[key2].seq) {
								presentChecked[key1].sub.push(ev0.sub[key2].name);
							}
						}
					}
				}
				
				this.getSearchData.eval0_presentChecked = presentChecked;
				this.getSearchData.isCheckedEval0 = (transData.length > 0);
			},
			//eval1.vue에서 넘어온 평가1 검색 체크된 값 api 전달 파라미터로 만들기
			getEval1(transData, major, mid, minor) {
				let presentChecked = [{cate: '대분류' , items : []}, {cate: '중분류', items : []}, {cate: '소분류', items : []}];
				let oneRow = transData, cfg = [], _depth, _cc, _cg;
				Object.values(this.getConfigEval['item']['M1']).forEach(v => { cfg[v.seq] = v });
				this.getSearchData.oneRowEval1 = transData;
				this.getSearchData.isCheckedEval1 = (this.getSearchData.oneRowEval1.length > 0);
				oneRow.forEach(v => {
					_cc = cfg[v]; if (!_cc) return;
					if (!_cc.group_seq) {
						presentChecked[0].items.push(_cc.value);
					} else {
						_cg = cfg[_cc.group_seq]; if (!_cg) return;
						if (!_cg.group_seq) {
							presentChecked[1].items.push(_cc.value);
						} else {
							presentChecked[2].items.push(_cc.value);
						}
					}
				});
				this.getSearchData.eval1_presentChecked = presentChecked;
			},
			//eval2.vue에서 넘어온 평가2 검색 체크된 값 api 전달 파라미터로 만들기
			getEval2 (transData, eval2_condition)	{
				let selEval2 = [];
				transData.forEach(one => {
					if (one !== null) { selEval2.push(one); }
				}),
				this.getSearchData.oneRowEval2 = selEval2.join();
				this.getSearchData.eval2_condition = eval2_condition;

				//선택항목 보여주는 데이터
				let presentChecked = [], ev2 = {};
				for (let key1 in this.getEval2Class) {
					ev2 = this.getEval2Class[key1];
					presentChecked.push({
						upper_cate_name : ev2.upper_cate_name, sub: []
					});
					for (let key2 in ev2.sub) {
						for (let key3 in transData) {
							if (transData[key3] === ev2.sub[key2].seq) {
								presentChecked[key1].sub.push(ev2.sub[key2].name);
							}
						}
					}
				}

				this.getSearchData.eval2_presentChecked = presentChecked;
				this.getSearchData.isCheckedEval2 = (transData.length > 0);
			},
			//검색접기
			schOff() {
				if (this.$store.dispatch('loginCheckGentleAPI')) {
					this.SET_SEARCH_FORM_SEEN(!this.searchFormSeen);
				} else {
					this.$eventBus.$emit('kickOut')
				}
			},
			//검색 버튼 클릭
			async goSearch() {
				if (this.searchConditionModel.selNewsMe.length === 0) {
					alert('검색범위를 1개 이상 선택하십시오!');
					document.getElementById('news_group_select').style.backgroundColor = '#e2effb';
					setTimeout(function() {
						document.getElementById('news_group_select').style.backgroundColor = 'rgb(255,255,255)';
						setTimeout(function() {
							document.getElementById('news_group_select').style.backgroundColor = '#e2effb';
							setTimeout(function() {
								document.getElementById('news_group_select').style.backgroundColor = 'rgb(255,255,255)';
							}, 500);
						}, 500);
					}, 500);
					return false;
				}
				let smp = this.getStatSetting.evalSelectionMedium;
				let selectMediumPreCount = 0;
				for (let key in smp) {
					selectMediumPreCount += smp[key].length;
				}
				if (selectMediumPreCount === 0) {
					alert('매체를 1개 이상 선택하십시오!');
					document.getElementById('media_group_select').style.backgroundColor = '#e2effb';
					setTimeout(function() {
						document.getElementById('media_group_select').style.backgroundColor = 'rgb(255,255,255)';
						setTimeout(function() {
							document.getElementById('media_group_select').style.backgroundColor = '#e2effb';
							setTimeout(function() {
								document.getElementById('media_group_select').style.backgroundColor = 'rgb(255,255,255)';
							}, 500);
						}, 500);
					}, 500);
					return false;
				}

				let params = new FormData;
				params.append('eval0', this.getSearchData.oneRowEval0);
				params.append('eval0_condition', this.getSearchData.eval0_condition);
				params.append('eval1', this.getSearchData.oneRowEval1);
				params.append('eval2', this.getSearchData.oneRowEval2);
				params.append('eval2_condition', this.getSearchData.eval2_condition);
				Object.keys(this.searchConditionModel).map(key => {
					switch(key) {
						case 'sDate':
							params.append(key, this.$moment(this.searchConditionModel[key]).format('YYYY-MM-DD'));
							break;
						case 'eDate' :
							params.append(key, this.$moment(this.searchConditionModel[key]).format('YYYY-MM-DD'));
							break;
						default :
							params.append(key, this.searchConditionModel[key]); break;
					}
				});
				let eval1Name = [];
				if(Object.keys(this.getSearchData.eval1_presentChecked).length>0) {
					Object.keys(this.getSearchData.eval1_presentChecked).forEach(key => {
						this.getSearchData.eval1_presentChecked[key].items.forEach(name => {
							eval1Name.push(name);
						})
					});
				}
				let eval1Str = eval1Name.join();
				params.append('eval1Name', eval1Str);
				let eval2Name = [];
				if(Object.keys(this.getSearchData.eval2_presentChecked).length>0) {
					Object.keys(this.getSearchData.eval2_presentChecked).forEach(key => {
						this.getSearchData.eval2_presentChecked[key].sub.forEach(name => {
							eval2Name.push(name);
						})
					});
				}
				let eval2Str = eval2Name.join();
				params.append('eval2Name', eval2Str);


				let sm = this.getStatSetting.evalSelectionMedium;
				if (sm) {
					let selectMediumCount = 0;
					for (let key in sm) {
						selectMediumCount += sm[key].length;
					}
					if (selectMediumCount === this.getMediaList.length) {
						params.append('media', '0');
					} else {
						let tmpMedia = [];
						for (let key in sm) {
							if (sm[key].length > 0) {
								sm[key].forEach(media => {
									tmpMedia.push(media.media_id);
								});
							}
						}
						params.append('media', tmpMedia.join(','));
					}
				}
				params.delete('pageNo');
				this.$eventBus.$emit('fromSearchToArticleList', params, this.newsGroup);
				this.SET_CALL_API_SEARCH(true);
			},
			/**
			 * 특정 그룹으로 묶기
			 * @param list
			 * @param key
			 */
			mediaGroups(list, key) {
				const result = {};
				if (Array.isArray(list)) {
					list.forEach(item => {
						if (item.used !== String(this.useCheck)) {
							if (!result[item[key]]) {
								result[item[key]] = [];
							}
							result[item[key]].push(item);
						}
					});
				}
				return result;
			}
		}
	}
</script>

<style scoped>
	.date_box, .datepicker-wrapper,	.datepicker-wrapper > div{ height: 100%;}
	input[type=text].datepicker-input { height: 100%; border: none; background-color: inherit; display: block; color: #333;width: 120px; padding-left: 30px; background: url(../../../assets/images/ico_pre.png) 0 -20px no-repeat;margin: 0 auto;}
	.fake_button_upper {
		overflow: hidden;
	}
	.fake_button {
		width: 100%;
		min-height: 26px;
		padding: 5px;
		overflow: hidden;
		border: 1px #aeaeae solid;
		background: #f2f2f2;
		vertical-align: middle;
		margin-top: 3px;
	}
	.test_button {
		background: url(/img/ico_pre.467a0115.png) -30px 0 no-repeat !important;
		border: 0 !important;
		max-height: 18px !important;
		min-height: 18px !important;
		margin: -8px 0 0 0 !important;
		text-indent: -9999px;
		cursor: pointer;
		padding: 0 !important;
	}
	.test_button:focus {
		outline: none;
	}
</style>
