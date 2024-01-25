<template>
	<div class="list_wrap" id="searchListWrap">
		<div class="cont_tit">
			<!-- <a @click="hideAndShowToggleSearch">목록 접기</a> -->
			<a @click="toggleListLayout(0)" title="접기"></a>
			<span v-if="!hideAndShowArticleListSearch">검색결과목록</span>
		</div>
		<!-- s: sorting 검색하기 했을 때 정렬기능  -->
		<div class="list_range" v-if="!hideAndShowArticleListSearch" :class="{fold_inner : !listLayout0}">
			<h5>정렬</h5>
			<select v-model="sort" @change="sortChange" tabindex="0">
				<option v-for="sort in sortInfo" :key="sort.value" :value="sort.value">{{sort.text}}</option>
			</select>
			<select v-model="sortOrder" @change="sortChange" tabindex="0">
				<option v-for="sortOrder in sortOrderInfo" :key="sortOrder.value" :value="sortOrder.value" >{{sortOrder.text}}</option>
			</select>
			<ul class="btn_right_upper">
				<li><a @click="excelSave">엑셀저장</a></li>
				<li><a @click="listPrint">목록인쇄</a></li>
				<!--<li><a @click="viewerOpen">검색기사 관리</a></li>-->
			</ul>
		</div>
		<!-- e: sorting -->
		<!-- s: 평가목록 -->
		<div class="list sch_list" id="searchList" v-if="!hideAndShowArticleListSearch" :class="{fold_inner : !listLayout0, single : init || pageInfo[6].name === '1'}">
			<!-- s : 기사목록 -->
			<div class="list_tit" v-if="classicViewMode">
				<input type="checkbox" id="searchAllCheck" :checked="isAll()" @change="checkAll($event, searchArticleList)"/>
				<label for="searchAllCheck"><div class="li_chk"><span></span></div></label>
				<ul class="list_ul">
					<li class="list_li" style="background:#e6e6e6">
						<div class="li_item media_name cp" @click="softSort('media_name')" title="매체명 정렬">매체명<span v-if="softSortColumn === 'media_name'">{{softSortOrderValue[softSortOrderIndex]}}</span></div>
						<div class="li_item article_title cp" @click="softSort('article_title')" title="기사제목 정렬">기사제목<span v-if="softSortColumn === 'article_title'">{{softSortOrderValue[softSortOrderIndex]}}</span></div>
						<div class="li_item ev1">평가1</div>
						<div class="li_item ev2">평가2</div>
						<div class="li_item scrap_date cp" v-if="searchFormSeen" @click="softSort('scrap_date')" title="스크랩 정렬">스크랩일<span v-if="softSortColumn === 'media_name'">{{softSortOrderValue[softSortOrderIndex]}}</span></div>
						<slot v-for="(column) in columnSettingWeb">
							<div v-if="(column.field !== 'article_title' && column.field !== 'media_name' && column.field !== 'scrap_date')" class="li_item cp" :class="column.field" :title="column.alias + ' 정렬'" @click="softSort(column.field)">{{column.alias}}<span v-if="softSortColumn === column.field">{{softSortOrderValue[softSortOrderIndex]}}</span></div>
						</slot>
					</li>
				</ul>
			</div>

			<div class="list_tit" v-if="!classicViewMode">
				<input type="checkbox" id="searchAllCheck" :checked="isAll()" @change="checkAll($event, searchArticleList)"/>
				<label for="searchAllCheck"><div class="li_chk"><span></span></div></label>
				<ul class="list_ul">
					<li class="list_li" style="background:#e6e6e6">
						<div class="li_item cp" v-for="(column) in columnSettingWeb" :class="column.field" :title="column.alias" @click="softSort(column.field)">{{column.alias}}<span v-if="softSortColumn === column.field">{{softSortOrderValue[softSortOrderIndex]}}</span></div>
					</li>
				</ul>
			</div>
			<!--뉴스그룹-->
			<div class="list_con" v-for=" (group, index) in searchArticleList" :key="index">
				<!-- 폴더명 : 신문,방송,인터넷검색기사 등-->
				<div v-for=" (folder , foldername ) in group" :key="foldername">
					<ul class="list_ul">
						<div v-for="(one, oneIdx) in folder" :key="oneIdx">
							<!--기사 -->
							<li class="list_li" :class="{'on': one.news_id === news_id_local, 'gray-bg':one.hidden}" v-if="!one.hidden || articleHiddenShow">
								<div class="li_chk">
									<input type="checkbox" :value="one" :id="'search_article_checkbox'+one.news_id"  v-model="selArticles"/>
									<label :for="'search_article_checkbox'+one.news_id" >
										<span></span>
									</label>
								</div>
								<div class="li_first" @click="oneCheck(one)" :class="evalManualSetting.cssClassName">
									<span class="ico li1" v-if="one.part_name === '' && one.news_comment !== '1'"></span><!-- 지면-->
									<span class="ico li2" v-if="one.part_name === '' && one.news_comment === '1'"></span><!-- 지면&평가제외-->
									<span class="ico li3" v-if="one.part_name !== '' && one.news_comment !== '1'"></span><!-- 온라인-->
									<span class="ico li4" v-if="one.part_name !== '' && one.news_comment === '1'"></span><!-- 온라인&평가제외-->
									<span :class="{ red : one.news_comment === '1' }">{{one.news_title}}</span>
								</div>
								<template v-if="classicViewMode">
									<div class="li_item media_name" :class="{red : one.news_comment === '1'}">{{one.media_name}}</div>
									<div class="li_item article_title" :class="{red : one.news_comment === '1'}" @click="oneCheck(one)">{{one.article_title}}</div>
									<div class="li_item ev1" v-if="one.news_comment !== '1'">
										<span v-if="searchEvalInfo[one.news_id] && searchEvalInfo[one.news_id].eval1">
											<span class="ico li5" v-if="searchEvalInfo[one.news_id].eval1.eval1_seq"></span> <!--평가1 O -->
											<span v-else class="ico li7"></span> <!--평가1 X -->
										</span>
										<span v-else class="ico li7"></span>
									</div>
									<div class="li_item ev1" v-if="one.news_comment === '1'"><!--평가제외-->
										<span v-if="searchEvalInfo[one.news_id] && searchEvalInfo[one.news_id].eval1">
											<span class="ico li8" v-if="searchEvalInfo[one.news_id].eval1.eval1_seq"></span> <!--평가제외 평가1 O -->
											<span v-else class="ico li10"></span> <!--평가제외 평가1 X -->
										</span>
										<span v-else class="ico li7"></span>
									</div>
									<div class="li_item ev2" v-if="one.news_comment !== '1'">
										<span v-if="searchEvalInfo[one.news_id]">
											<span class="ico li5" v-if="searchEvalInfo[one.news_id].eval2m2Cnt === searchEvalInfo[one.news_id].eval2m2CntMax"></span><!-- 평가2 ○ -->
											<span class="ico li7" v-else-if="searchEvalInfo[one.news_id].eval2m2Cnt === 0"></span><!-- 평가2 X-->
											<span class="ico li6" v-else-if="searchEvalInfo[one.news_id].eval2m2Cnt < searchEvalInfo[one.news_id].eval2m2CntMax"></span><!-- 평가2 △-->
										</span>
									</div>
									<div class="li_item ev2" v-if="one.news_comment === '1'"><!-- 평가제외-->
										<span v-if="searchEvalInfo[one.news_id]">
											<span class="ico li8" v-if="searchEvalInfo[one.news_id].eval2m2Cnt === searchEvalInfo[one.news_id].eval2m2CntMax"></span><!-- 평가2 ○ -->
											<span class="ico li10" v-else-if="searchEvalInfo[one.news_id].eval2m2Cnt === 0"></span><!-- 평가2 X-->
											<span class="ico li9" v-else-if="searchEvalInfo[one.news_id].eval2m2Cnt < searchEvalInfo[one.news_id].eval2m2CntMax"></span><!-- 평가2 △-->
										</span>
									</div>
									<div class="li_item scrap_date">{{one.scrap_date}}</div>
								</template>
								<template v-for="(column, ci) in columnSettingWeb">
									<div v-if="!(classicViewMode && (column.field === 'media_name' || column.field === 'article_title' || column.field === 'scrap_date'))" class="li_item cp" :class="getArticleClassName(one.news_comment, column.field)" :key="one.news_id + ci" @click="oneCheck(one)">{{addComma(column.field, one[column.field])}}</div>
								</template>
							</li>
						</div>
					</ul>
				</div>
			</div>
		</div>
		<!-- e:기사목록 -->
		<!--하단버튼-->
		<div class="cont_btn" v-if="!hideAndShowArticleListSearch" :class="{fold_inner : !listLayout0, single : init || pageInfo[6].name === '1'}">
			<div v-if="!init && pageInfo[6].name !== '1'" style="height:39px">
				<h5>
					<span v-for="page in pageInfo" class="page">
						<span v-if="page.enable" :title="page.number" @click="setPageGetListWithAuth(page.number)">{{page.name}}</span>
						<span v-else class="conceal">{{page.name}}</span>
					</span>
				</h5>
			</div>
			<div style="height:40px">
				<ul class="btn_left" v-show="searchFormSeen">
					<li><a @click="showEvalMulti">다중평가</a></li>
					<li class="red"><a @click="inExcludeEval('ex')">평가제외</a></li>
					<li><a @click="inExcludeEval('in')">평가제외해제</a></li>
				</ul>
				<ul class="btn_right" v-show="searchFormSeen">
					<li><a @click="hideArticles">숨김</a></li>
					<li><a @click="showArticles">풀림</a></li>
				</ul>
				<span class="chk_right">
					<input type="checkbox" id="articleHiddenShow" :checked="articleHiddenShow" :value="true" @change="changeArticleHiddenShow">
					<label for="articleHiddenShow"><span>&nbsp;</span></label>
					<span class="fake_label">숨긴기사표시</span>
				</span>
			</div>
		</div>
		<div class="printTable" style="display:none;">
			<div class="list-print-div">
				<p style="margin-bottom:2mm;">검색 기사 수 : {{printArticleListBody.length}}</p>
				<table style="text-align:center;">
					<thead>
					<tr>
						<th v-for="(head, index) in printArticleListHead" :key="'printHead_'+index">{{head}}
						</th>
					</tr>
					</thead>
					<tbody>
						<tr v-for="(art, index) in printArticleListBody" :key="'printBody_'+index">
							<td v-for="(column, cindex) in art" :key="'printBodyC_'+cindex">
								{{column}}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<iframe width=0 height=0 name='hiddenframe' style='display:none;'></iframe>
	</div>
</template>
<script>
	import {mapActions, mapGetters, mapMutations, mapState} from 'vuex';
	import store from '../../../store';
	export default {
		data() {
			return {
				selNewsMe: [0],
				list: {},
				newsGroupCheckForm: [],
				selArticles: ['선택된기사'],
				selDate: '',

				sortInfo: [
					{text: '제목', value: 'news_title'},
					{text: '매체', value: 'media_name'},
					{text: '기사발행일', value: 'news_date'},
					{text: '스크랩일', value: 'scrap_date'},
					{text: '등록순서', value: 'news_id'}
				],
				sortOrderInfo: [
					{text: '오름차순', value: 'asc'},
					{text: '내림차순', value: 'desc'}
				],
				sort: 'news_date',
				sortOrder: 'asc',
				softSortColumn: 'news_id',
				softSortOrderIndex: 2,
				softSortOrderValue: ['▲', '▼'],

				printArticleList: [],
				printArticleListHead: [],
				printArticleListBody: [],

				news_id_local:0,

				classicViewMode: true,
				configEval: [],
				columnSettingWeb: [],
				evalManualSetting: [],
				countTotalArticle: -1,
				pageNoCurrent: 0,
				searchForm: {},
				init: true,
				excludedArticleList: [],
				unExcludedArticleList: []
			}
		},
		computed: {
			...mapState([
				'newsGroup',
				'searchArticleList',
				'hideAndShowArticleListSearch',
				'searchSelectedArticle',
				'searchFormSeen',
				'getArticleListFromSearchParams',
				'getArticleListSource',
				'getArticleListFromHeaderPayload',
				'pid',
				'searchNewsIdList',
				'searchEvalInfo',
				'listLayout0',
				'listLayout1',
				'listLayout2',
				'articleResultCount','articleHiddenShow','articleHiddenList'
				]),
			...mapGetters(['gethiddenLink1','getPremiumID','getEval2Cnt', 'getSearchEvalInfo']),
			allLength() {
				const data = this.searchArticleList;
				let allCnt = 0;
				if(typeof data === "object" && data !== null) {
					let list = Object.keys(data).map(e => data[e]);
					if (list.length > 0) {
						for (const newsGroup in list) {
							for (const folder in list[newsGroup]) {
								if (list[newsGroup].hasOwnProperty(folder)) {
									const f = list[newsGroup][folder];
									const contents = Object.keys(f).map(e => f[e]);
									allCnt += contents.length;
								}
							}
						}
					}
				}
				return allCnt;
			},
			allSelectedLength: function() {
				return this.selArticles.length - 1;
			},
			sel() {
				return this.selArticles;
			},
			pageInfo() {
				let pageInfo = [];
				let formDataType = Object.prototype.toString.call(this.searchForm);
				let pageSize = (this.searchForm && formDataType === '[object FormData]') ? this.searchForm.get('pageSize') : 25;
				pageSize = isNaN(pageSize) ? 25 : Number(pageSize);
				let pageMax = Math.trunc(this.articleResultCount / pageSize);
				if (this.articleResultCount % pageSize) pageMax++;
				if (isNaN(this.pageNoCurrent) || this.pageNoCurrent < 1 || this.pageNoCurrent > pageMax) this.pageNoCurrent = 1;
				pageInfo[0] = { 'name': '1', 'number': 1, 'enable': this.pageNoCurrent !== 1 };
				pageInfo[1] = { 'name': '≪', 'number': (this.pageNoCurrent - 10), 'enable': (this.pageNoCurrent - 10) > 0 };
				pageInfo[2] = { 'name': '<', 'number': (this.pageNoCurrent - 1), 'enable': (this.pageNoCurrent - 1) > 0 };
				pageInfo[3] = { 'name': String(this.pageNoCurrent), 'number': this.pageNoCurrent, 'enable': true };
				pageInfo[4] = { 'name': '>', 'number': (this.pageNoCurrent + 1), 'enable': (this.pageNoCurrent + 1) <= pageMax };
				pageInfo[5] = { 'name': '≫', 'number': (this.pageNoCurrent + 10), 'enable': (this.pageNoCurrent + 10) <= pageMax };
				pageInfo[6] = { 'name': String(pageMax), 'number': pageMax, 'enable': (this.pageNoCurrent !== pageMax) && (pageSize !== -1) };
				return pageInfo;
			}
		},
		created() {
			//검색하기에서 요청
			this.$eventBus.$on('fromSearchToArticleList', params => { // 검색!! 리스트 출력하러 ㄱ
				this.searchForm = params;
				let t = Number(params.get('pageNo'));
				this.pageNoCurrent = isNaN(t) ? 0 : t;
				this.getListWithAuth(this.searchForm);
			});
			this.$eventBus.$on("setSearchFormSeen", params => {
				this.getArticleListToggle(params);
			});
		},
		beforeDestroy() {
			this.SET_SEARCH_SELECTED_ARTICLE('');
			this.SET_SEARCH_ARTICLE_LIST([]);
			this.$eventBus.$off('fromSearchToArticleList');
			this.$eventBus.$off("setSearchFormSeen");
		},
		watch: {
			searchSelectedArticle(){
				if(this.searchSelectedArticle !== ''  && this.searchSelectedArticle !== undefined){
					this.news_id_local = this.searchSelectedArticle.news_id;
				} else {
					this.news_id_local = 0;
				}
			}
		},
		async mounted() {
			let ssdo = store.state.hiddenLink1;
			this.searchForm = new FormData();
			for (let i = 0; i < 8; i++) {
				this.newsGroupCheckForm[i] = false;
			}
			await this.getEvalManualSetting();
			await this.$axios.get(ssdo + '/getConfigEvalJson.php').then(r => {
				if (r.data.success) {
					this.configEval = r.data.config_eval;
				} else {
					// 로그인으로
					alert('설정을 불러오지 못 했습니다!');
				}
			}).catch(e=>console.error(e));
			await this.$axios.get(ssdo + '/columnSettingJson.php').then(r => {
				if (r.data.success) {
					this.columnSettingWeb = r.data.column_setting;
				} else {
					// 로그인으로
					alert('설정을 불러오지 못 했습니다!');
				}
			}).catch(e=>console.error(e));
			await this.getArticleListToggle();
			let ids = localStorage.getItem('excludedArticleList');
			if (ids) { this.excludedArticleList = ids.split(','); }
		},
		methods: {
			...mapActions([
				'getArticleListFromSearchAPI',
				'getArticleListFromHeaderAPI',
				'inExcludeEvalAPI',
				'getMediaPolicyAPI',
				'setListLayout',
				'toggleListLayout'
			]),
			...mapMutations([
				'SET_SEARCH_ARTICLE_LIST',
				'SET_SEARCH_SELECTED_ARTICLE',
				'SET_SEARCH_NEWS_ID_LIST',
				'SET_MULTI_EVAL_ARTICLE_LIST',
				'SET_MULTI_NEWS_ID_LIST',
				'SET_MULTI_SELECTED_ARTICLE',
				'SET_LOADING_GIF',
				'SET_GET_ARTICLE_LIST_FROM_SEARCH_PARAMS',
				'TOGGLE_SHOW_DO_EVAL_MULTI',
				'TOGGLE_HIDE_AND_SHOW_ARTICLE_LIST_SEARCH',
				'SET_ARTICLE_LIST_SOURCE',
			]),
			getArticleClassName(news_comment, field) {
				let rtn = field;
				if (Number(news_comment) === 1) {
					rtn += ' red';
				}
				return rtn;
			},
			async getArticleListToggle() {
				if (!this.configEval || Object.keys(this.configEval).length < 3)
					return;
				this.classicViewMode = (this.configEval['policy']['CS']['value'] === 'Y' && !this.expandArticleList);
				await this.manageArticleListToggle();
			},
			async manageArticleListToggle() {
				let obj = document.querySelector('#searchListWrap');
				let parentWidth = Number(obj.getAttribute('org')), entireWidth = 0;
				if (parentWidth === 0) {
					parentWidth = 627;
				} else {
					parentWidth -= 5;
				}
				if (this.classicViewMode) {
					if (this.evalManualSetting['M1'] && this.evalManualSetting['M2']) {
						this.createCssClass('#searchList .article_title', 'width', (parentWidth - 140 - 180) + 'px');
						this.createCssClass('#searchList .ev1, #searchListWrap .ev2', 'width', '45px');
					} else if (this.evalManualSetting['M1']) {
						this.createCssClass('#searchList .article_title', 'width', (parentWidth - 140 - 180 + 40) + 'px');
						this.createCssClass('#searchList .ev1', 'width', '45px');
						this.createCssClass('#searchList .ev2', 'width', '0');
					} else if (this.evalManualSetting['M2']) {
						this.createCssClass('#searchList .article_title', 'width', (parentWidth - 140 - 180 + 40) + 'px');
						this.createCssClass('#searchList .ev1', 'width', '0');
						this.createCssClass('#searchList .ev2', 'width', '45px');
					} else {
						this.createCssClass('#searchList .article_title', 'width', (parentWidth - 140 - 180 + 90) + 'px');
						this.createCssClass('#searchList .ev1, #searchListWrap .ev2', 'width', '0');
					}
					this.createCssClass('#searchList .media_name', 'width', '90px');
					this.createCssClass('#searchList .scrap_date', 'width', '90px');

					entireWidth = parentWidth + 100;
					this.columnSettingWeb.forEach(s => {
						if (!s.field.includes('article_title') && !s.field.includes('media_name') && !s.field.includes('scrap_date')) {
							entireWidth += 120;
						}
					});
					this.createCssClass('#searchList .list_tit', 'width', entireWidth + 'px');
					this.createCssClass('#searchList .list_con', 'width', entireWidth + 'px');
				} else {
					this.createCssClass('#searchList .media_name', 'width', '90px');
					this.createCssClass('#searchList .article_title', 'width', (parentWidth - 125 - 90) + 'px');
					entireWidth = parentWidth - 48;
					this.columnSettingWeb.forEach(s => {
						if (!s.field.includes('article_title') && !s.field.includes('media_name')) {
							entireWidth += 120;
						}
					});
					this.createCssClass('#searchList .list_tit', 'width', entireWidth + 'px');
					this.createCssClass('#searchList .list_tit', 'padding-left', '53px');
					this.createCssClass('#searchList .list_con', 'width', entireWidth + 'px');
				}
			},
			createCssClass(cssClassName, attrName, value) {
				var style = document.createElement('style');
				style.type = 'text/css';
				style.innerHTML = cssClassName + ' { ' + attrName + ' : ' + value + '  !important;}';
				document.getElementsByTagName('head')[0].appendChild(style);
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
			},
			async getArtListFromSearch(params) { // 리스트 출력하러 가보자
				this.init = false;
				this.SET_LOADING_GIF(true);
				this.SET_GET_ARTICLE_LIST_FROM_SEARCH_PARAMS(params);
				if (await this.getArticleListFromSearchAPI(params)) { // 여기서 setting searchArticleList
					this.findFirstArticle(this.searchArticleList);
					let idx = -1;
					if (this.searchArticleList && this.searchArticleList[0] && this.searchArticleList[0][0] && this.searchArticleList[0][0].constructor.name === 'Array') {
						this.searchArticleList[0][0].forEach(atc => {
							idx = this.excludedArticleList.indexOf(atc.news_id);
							if (idx > -1) atc.hidden = true;
						});
					}
				} else {
					this.$eventBus.$emit('kickOut');
				}
				this.SET_LOADING_GIF(false);
			},
			findFirstArticle(list){
				if (this.allLength > 0) {
					if (this.searchSelectedArticle === '' || this.searchSelectedArticle === undefined) {
						let firstArticle = [];
						outer : for (let key in list) {
							for (let key2 in list[key]) {
								for (let key3 in list[key][key2]) {
									if (list[key][key2] !== null) {
										firstArticle = list[key][key2][key3];
										break outer;
									}
								}
							}
						}
						this.SET_SEARCH_SELECTED_ARTICLE(firstArticle);
					}
				}
			},
			async sortChange() {
				let order_column = this.sort;
				let order = this.sortOrder;
				let params = this.getArticleListFromSearchParams;
				params.set('order_column', order_column);
				params.set('order', order);
				let paramsObj = {
					'order_column': this.sort,
					'order': this.sortOrder
				};
				this.$eventBus.$emit('setSearchOrderOption', paramsObj);
				await this.getArtListFromSearch(params);
				this.findFirstArticle(this.searchArticleList);
			},
			async oneCheck(one) {
				if (await this.$store.dispatch('loginCheckGentleAPI')) {
					this.SET_SEARCH_SELECTED_ARTICLE(one);
				} else {
					this.$eventBus.$emit('kickOut');
				}
			},
			showEvalMulti() {
				if (this.selArticles.length > 1) {
					let newsIdList = [];
					let origin = this.selArticles;
					let multilist = [];
					for (let key in origin) {
						if (key !== '0') {
							multilist.push(origin[key]);
							newsIdList.push(origin[key].news_id);
						}
					}
					this.TOGGLE_SHOW_DO_EVAL_MULTI(true);
					this.SET_MULTI_EVAL_ARTICLE_LIST(multilist);
					this.SET_MULTI_NEWS_ID_LIST(newsIdList);
					this.SET_MULTI_SELECTED_ARTICLE(multilist[0]);
					// this.selArticles = ['선택된기사'];
				} else {
					alert('뉴스를 1개 이상 선택하세요.');
				}
			},
			async inExcludeEval(flag) {
				if (this.selArticles.length === 1 || (flag !== 'in' && flag !== 'ex')) {
					alert('뉴스를 1개 이상 선택하세요.');
					return false;
				}

				let news_id_arr = [];
				let params = new FormData;
				this.selArticles.forEach((one, key)=> {
					if (key !== 0) news_id_arr.push(one.news_id);
				});
				params.append('news_id', news_id_arr.join());
				params.append('flag', flag);

				await this.inExcludeEvalAPI(params);
				this.$eventBus.$emit('triggerSearch', false); // 화면 깜빡임 문제
			},
			async showArticles() {
				let list = this.searchArticleList;
				let origin = this.sel;
				if (origin.length === 1) {
					alert('뉴스를 1개 이상 선택하세요.');
					return false;
				}

				for (const k in origin) {
					if (k !== '0') {
						if (this.unExcludedArticleList.indexOf(origin[k].news_id) === -1) {
							this.unExcludedArticleList.push(origin[k].news_id);
						}
					}
				}

				if (this.searchArticleList && this.searchArticleList[0] && this.searchArticleList[0][0] && this.searchArticleList[0][0].constructor.name === 'Array') {
					let idx = -1;
					this.searchArticleList[0][0].forEach(atc => {
						if (this.unExcludedArticleList.indexOf(atc.news_id) > -1) {
							atc.hidden = false;
						}
					});
				}
				this.selArticles = ['선택된기사'];

				let tmpArr = [];
				if (this.excludedArticleList.constructor.name === 'Array') {
					this.excludedArticleList.forEach(a => {
						if (this.unExcludedArticleList.indexOf(a) === -1 && tmpArr.indexOf(a) === -1 && !isNaN(a)) {
							tmpArr.push(a);
						}
					});
					tmpArr.sort(function(a, b) { return a < b ? -1 : 1; });
					localStorage.setItem('excludedArticleList', tmpArr);
					this.excludedArticleList = tmpArr;
				}
			},
			async hideArticles() {
				let list = this.searchArticleList;
				let origin = this.sel;
				if (origin.length === 1) {
					alert('뉴스를 1개 이상 선택하세요.');
					return false;
				}

				for (const k in origin) {
					if (k !== '0') {
						if (this.excludedArticleList.indexOf(origin[k].news_id) === -1) {
							this.excludedArticleList.push(origin[k].news_id);
						}
					}
				}

				if (this.searchArticleList && this.searchArticleList[0] && this.searchArticleList[0][0] && this.searchArticleList[0][0].constructor.name === 'Array') {
					let idx = -1;
					this.searchArticleList[0][0].forEach(atc => {
						if (this.excludedArticleList.indexOf(atc.news_id) > -1) {
							atc.hidden = true;
						}
					});
				}
				this.selArticles = ['선택된기사'];

				let tmpArr = [], tmpArr2 = [], tmpElm = -1;
				if (this.excludedArticleList.constructor.name === 'Array') {
					this.excludedArticleList.forEach(a => {
						tmpElm = Number(a);
						if (tmpArr.indexOf(tmpElm) === -1 && !isNaN(tmpElm)) {
							tmpArr.push(tmpElm);
						}
					});
					tmpArr.sort(function(a, b) { return a < b ? -1 : 1; });
					let idxStart = 0, idxEnd = tmpArr.length; // 0~255
					if (idxEnd > 256) {
						idxStart = idxEnd - 256;
					}
					for (var i = idxStart; i < idxEnd; i++) {
						tmpArr2.push(String(tmpArr[i]));
					}
					localStorage.setItem('excludedArticleList', tmpArr2);
					this.excludedArticleList = tmpArr2;
				}
			},
			hideAndShowToggleSearch() {
				this.TOGGLE_HIDE_AND_SHOW_ARTICLE_LIST_SEARCH(!this.hideAndShowArticleListSearch);
			},
			isAll() {
				if (this.allLength > 0) {
					return this.selArticles ? this.allLength === this.allSelectedLength : false;
				}
			},
			group2(group) {
				let $this = this;
				if(typeof group === "object" && group !== null) {
					const g = Object.keys(group).map(e => group[e]);
					if (this.groupLength(g) > 0) {
						return g.every(function (folder) {
							let f = Object.keys(folder).map(e => folder[e]);
							return f.every(one => {
								if ($this.selArticles.indexOf(one) > -1) {
									return true;
								}
							});
						});
					}
				}
			},
			groupLength(group) {
				let groupCnt = 0;
				if (this.allLength > 0) {
					group.forEach(folder => {
						if(typeof folder === "object" && folder !== null) {
							let f = Object.keys(folder).map(e => folder[e]);
							f.forEach(() => {
								groupCnt++;
							});
						}
					});
					return groupCnt;
				}
			},
			fold(folder) {
				let $this = this;
				if (folder) {
					if(typeof folder === "object" && folder !== null) {
						let f = Object.keys(folder).map(e => folder[e]);
						if (f.length > 0) {
							return f.every(one => {
								if ($this.selArticles.indexOf(one) > -1) {
									return true;
								}
							});
						}
					}
				}
			},
			subtitle(subIdx, folder) {
				let $this = this;
				if(typeof folder === "object" && folder !== null) {
					let f = Object.keys(folder).map(e => folder[e]);
					if (f.length > 0) {
						return f.every(function (one) {
							if (one.subtitleHas === Number(subIdx)) {
								if ($this.selArticles.indexOf(one) > -1) {
									return true;
								}
							} else {
								return true;
							}
						});
					}
				}
			},
			checkAll($event, articleList) {
				let $this = this;
				if (typeof articleList === "object" && articleList !== null) {
					let art = Object.keys(articleList).map(e=>articleList[e]);
					art.forEach(group => {
						let g = Object.keys(group).map(e=>group[e]);
						g.forEach(folder => {
							folder.forEach(one => {
								if ($event.target.checked) {
									if ($this.selArticles.indexOf(one) === -1) {
										$this.selArticles.push(one);
									}
								} else {
									const delIdx = $this.selArticles.indexOf(one);
									if (delIdx > -1) {
										$this.selArticles.splice(delIdx, 1);
									}
								}
							});
						});
					});
				}
			},
			checkGroup($event, group) {
				let $this = this;
				if (typeof group === "object" && group !== null) {
					const g = Object.keys(group).map(e => group[e]);
					g.forEach(folder => {
						folder.forEach(one => {
							if ($event.target.checked) {
								if ($this.selArticles.indexOf(one) === -1) {
									$this.selArticles.push(one);
								}
							} else {
								const delIdx = $this.selArticles.indexOf(one);
								if (delIdx > -1) {
									$this.selArticles.splice(delIdx, 1);
								}
							}
						});
					});
				}
			},
			checkFolder($event, folder) {
				let $this = this;
				if (folder) {
					folder.forEach(one => {
						if ($event.target.checked) {
							if ($this.selArticles.indexOf(one) === -1) {
								$this.selArticles.push(one);
							}
						} else {
							const delIdx = $this.selArticles.indexOf(one);
							if (delIdx > -1) {
								$this.selArticles.splice(delIdx, 1);
							}
						}
					});
				}
			},
			checkSubtitle($event, subIdx, folder) {
				let $this = this;
				if (folder) {
					folder.forEach(function(one) {
						if ($event.target.checked) {
							if (one.subtitleHas === subIdx) {
								if ($this.selArticles.indexOf(one) === -1) {
									$this.selArticles.push(one);
								}
							}
						} else {
							if (one.subtitleHas === subIdx) {
								const delIdx = $this.selArticles.indexOf(one);
								if (delIdx > -1) {
									$this.selArticles.splice(delIdx, 1);
								}
							}
						}
					});
				}

			},
			async excelSave() {
				let ssdo = store.state.hiddenLink1;
				let searchParam = new FormData();
				searchParam = this.getArticleListFromSearchParams;
				searchParam.set('exclude_ids', this.excludedArticleList.join(','));
				let file_name =  '검색자료.xlsx';
				this.SET_LOADING_GIF(true);
				await this.$axios({
					url: ssdo + '/saveExcel.php',
					method: 'post',
					data: searchParam,
					responseType: 'blob'
				}).then((res) => {
					const csvData = new Blob([res.data], { type: 'text/csv' });
					if (window.navigator && window.navigator.msSaveOrOpenBlob) { // for IE
						window.navigator.msSaveOrOpenBlob(csvData, file_name);
					} else { // for Non-IE (chrome, firefox etc.)
						let a = document.createElement("a");
						document.body.appendChild(a);
						a.style = "display: none";
						const csvUrl = URL.createObjectURL(csvData);
						a.href =  csvUrl;
						a.download = file_name;
						a.click();
						a.remove();
					}

					/* const url = window.URL.createObjectURL(new Blob([res.data]));
					 const link = document.createElement('a');
					 link.href = url;
					 link.setAttribute('download', '검색자료.xlsx');
					 document.body.appendChild(link);
					 link.click();
					 link.parentNode.removeChild(link);*/
					this.SET_LOADING_GIF(false);
				}).catch(e => {
					console.log(e);
					this.SET_LOADING_GIF(false);
				});
			},
			async listPrint() {
				if(this.searchNewsIdList.length >= 1) {
					let ssdo = store.state.hiddenLink1;
					const print = window.open('', '목록인쇄', 'width=1000, height=600');
					let searchParam = this.getArticleListFromSearchParams;
					searchParam.set('news_id_list', this.searchNewsIdList.join(','));
					let result = await this.$axios.post(ssdo + '/listPrint.php', searchParam);

					if (result.status === 200 && result.data.body && result.data.body.length > 0 && result.data.head && result.data.head.length > 0) {
						this.printArticleListHead = result.data.head;
						this.printArticleListBody = result.data.body;
						this.$nextTick(() => {
							const printContents = document.querySelector('.printTable').innerHTML;
							print.document.open();
							print.document.write(printContentsList(printContents));
							print.document.close();
						});
					} else {
						window.alert('fail');
					}
				}
				function printContentsList(source) {
					return '<html><head><script>\n' +
						'function step1(){ \n' +
						'window.print();window.close(); }\n' +
						'</scri' + 'pt> \n' +
						'<style>@page {size:A4 landscape; margin: 9mm 4mm} @media print {body{margin:0mm; padding:5mm; page-break-after: always;}' +
						'.list-print-div {font-size:13px}' +
						'.list-print-div table { border-collapse: collapse; font-size:12px; table-layout: fixed;}' +
						'.list-print-div table tr {page-break-after: always; }' +
						'.list-print-div table td{overflow:hidden; text-overflow:ellipsis; } ' +
						'.list-print-div table tbody td{border-bottom: 2px solid #fff;} ' +
						'.list-print-div table thead th{ height:20; border-bottom: 1px #666 double;' +
						'border-top: 1px #666 double; padding: 4px 2px; background-color:#cccccc;} ' +
						'.list-print-div table .no{ width: 14.5mm}' +
						'.list-print-div table .title{ width: 129.5mm}' +
						'.list-print-div table .media_name{ width: 43.5mm}' +
						'.list-print-div table .news_date{ width: 24.2mm}' +
						'.list-print-div table .news_size{ width: 24.2mm}' +
						'.list-print-div table .article_value{ width: 24.2mm}' +
						'.list-print-div table .reporter{ width: 43.5mm}' +
						'}' +
						'</style>' +
						'</head>' +
						'<body onload=\'step1()\'>' + source +
						'</body>' +
						'</html>';
				}
			},
			viewerOpen() {
				const pid = this.getPremiumID;
				const d = this.$moment(new Date()).format('YYYYMMDD') + '00';
				if (pid) {
					self.frames['hiddenframe'].location.href = 'dahamipremiumviewer://0||' + pid + '||PremiumViewer||PremiumViewer_info_Admin.txt||-Admi' + d + 'http://premium.scrapmaster.co.kr/' + pid;
				}
			},
			async setPageGetListWithAuth(pageNo) {
				if (this.pageNoCurrent === Number(pageNo)) return false;
				this.searchForm.set('pageNo', pageNo);
				this.pageNoCurrent = Number(pageNo);
				await this.getListWithAuth(this.searchForm);
			},
			async getListWithAuth(params) {
				if (await this.$store.dispatch('loginCheckGentleAPI')) {
					this.SET_ARTICLE_LIST_SOURCE('searchForm');
					this.SET_SEARCH_SELECTED_ARTICLE('');
					this.getArtListFromSearch(params); // 리스트 출력하러 가자
					this.selArticles = ['선택된기사'];
				} else {
					this.$eventBus.$emit('kickOut');
				}
			},
			async changeArticleHiddenShow($event) {
				this.$store.commit('SET_ARTICLE_HIDDEN_SHOW', $event.target.checked);
			},
			async softSort(column) {
				this.softSortOrderIndex = (this.softSortColumn === column) ? (this.softSortOrderIndex + 1) % 3 : 0;
				this.softSortColumn = (this.softSortOrderIndex !== 2) ? column : 'news_id';
				if (this.searchArticleList && this.searchArticleList[0] && this.searchArticleList[0][0] && this.searchArticleList[0][0].constructor.name === 'Array') {
					function fancyComparator(column, order) {
						return function(a, b) {
							return (order ? (a[column] < b[column]) : (a[column] > b[column])) ? -1 : 1;
						}
					}
					this.searchArticleList[0][0].sort(fancyComparator(this.softSortColumn, (this.softSortOrderIndex === 0)));
				}
			},
			addComma(field, value) {
				if (field === 'media_value' || field === 'eval_score') {
					let rtn = '-', num = Number(value);
					if (!isNaN(num) && num !== 0) {
						rtn = String(Math.trunc(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
					}
					return rtn;
				} else {
					return (value) ? value : '-';
				}
      }
		}
	}
</script>
<style scoped>
	.red { color: #f1595d;}
	.loading { width: 100%;height: 100%;top: 0px;left: 0px;position: fixed;display: block;opacity: 0.7;background-color: #fff;z-index: 99;text-align: center;vertical-align: middle;}
	.loading-image {position: absolute;top: 50%;left: 50%;z-index: 100;}
	.loading-message {position: relative;margin: 0 auto;z-index: 101;}
	.veiled {display:none;}
	.li_tit.wfBoth { padding-right: 270px !important; }
	.list_rt.wfBoth { width: 270px !important; }
	.li_tit.wfSingle { padding-right: 225px !important; }
	.list_rt.wfSingle { width: 225px !important; }
	.li_tit.wfEmpty { padding-right: 180px !important; }
	.list_rt.wfEmpty { width: 180px !important; }
	.list_ul .list_li .li_first {
		cursor: pointer;
		padding-left: 30px;
	}
	.list_tit, .list_con {
		width: auto;
		overflow: hidden;
	}
	.list_ul .list_li .li_item {
		display: inline-block;
		float: left;
		height: 17px;
		overflow: hidden;
		padding-left: 4px;
		text-align: center;
		width: 120px;
	}
	.article_title {
		text-align: inherit !important;
	}
	.article_title .columnTextWrap {
		margin: 0 !important;
	}
	.cont_wrap .list_wrap .list .list_ul .list_li {
		height: 34px;
	}
	.cont_wrap .list_wrap .list_tit {
		padding-left: 55px !important;
	}
	.fold_inner {
		height: 1px !important;
		overflow: hidden !important;
		padding: 0 !important;
		width: 1px !important;
	}
	#searchList {
		height: calc(100% - 155px);
		overflow-y: scroll;
	}
	.page {
		cursor: pointer;
		display: inline-block;
		text-align: center;
		width: 25px;
	}
	.btn_right_upper {
		float: right;
	}
	.btn_right_upper li {
		float: left;
    padding: 0 10px;
    height: 23px;
    line-height: 22px;
    font-size: 12px;
    font-weight: bold;
    background: #f2f2f2;
    border: 1px #aeaeae solid;
    margin: 0 3px;
	}
	.cont_btn h5 {
		float: right;
    font-size: 13px;
    color: #333;
    margin-right: 10px;
		margin-top: 8px;
    line-height: 22px;
	}
	.gray-bg {
		background-color: rgba(192,192,192,0.2) !important;
		color: #bbb;
	}
	.chk_right {
		float: right;
		margin-top: 10px;
	}
	.chk_right span.fake_label {
		float: left;
		margin-top: 1px;
	}
	.cont_btn.single {
		height: 40px !important;
	}
	#searchList.single {
		height: calc(100% - 115px);
	}
	.cp {
		cursor: pointer;
	}
</style>
