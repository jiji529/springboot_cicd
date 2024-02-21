<template>
	<div class="list_wrap" id="evalListWrap">
		<div class="cont_tit">
			<!-- <a @click="hideAndShowToggle" title="기사 목록 접기"></a> -->
			<a @click="toggleListLayout(0)" title="접기"></a>
			<span v-show="!searchFormSeen"><span v-show="!hideAndShowArticleList">평가 목록</span></span>
		</div>
		<!-- s: 평가목록 -->
		<div class="list" id="evalList" v-if="!hideAndShowArticleList" :class="{fold_inner : !listLayout0}">
			<!-- s : 기사목록 -->
			<div class="list_tit" v-if="classicViewMode">
				<input type="checkbox" id="evalAllCheck" :checked="isAll()" @change="checkAll($event, articleList)"/>
				<label for="evalAllCheck"><div class="li_chk"><span></span></div></label>
				<ul class="list_ul">
					<li class="list_li" style="background:#e6e6e6">
						<div class="li_item media_name cp" @click="softSort('media_name')" title="매체명 정렬">매체명<span v-if="softSortColumn === 'media_name'">{{softSortOrderValue[softSortOrderIndex]}}</span></div>
						<div class="li_item article_title cp" @click="softSort('article_title')" title="기사제목 정렬">기사제목<span v-if="softSortColumn === 'article_title'">{{softSortOrderValue[softSortOrderIndex]}}</span></div>
						<div class="li_item ev1">평가1</div>
						<div class="li_item ev2">평가2</div>
						<slot v-for="(column, cm1) in columnSettingWeb">
							<div v-if="(column.field !== 'article_title' && column.field !== 'media_name')" 
								class="li_item cp" :class="column.field" :title="column.alias + ' 정렬'" 
								@click="softSort(column.field)" :key="'col'+cm1">
								{{column.alias}}
								<span v-if="softSortColumn === column.field">{{softSortOrderValue[softSortOrderIndex]}}</span>
							</div>
						</slot>
					</li>
				</ul>
				<!--칼럼이름들-->
			</div>
			<div class="list_tit" v-if="!classicViewMode">
				<input type="checkbox" id="evalAllCheck" :checked="isAll()" @change="checkAll($event, articleList)"/>
				<label for="evalAllCheck"><div class="li_chk"><span></span></div></label>
				<ul class="list_ul">
					<li class="list_li" style="background:#e6e6e6">
						<div class="li_item cp" v-for="(column, cm2) in columnSettingWeb" :class="column.field" :title="column.alias + ' 정렬'" 
							@click="softSort(column.field)" :key="'col2'+cm2">
							{{column.alias}}
							<span v-if="softSortColumn === column.field">{{softSortOrderValue[softSortOrderIndex]}}</span>
						</div>
					</li>
				</ul>
			</div>
			<!-- <<예시>> 조간, 석간, 조간+석간 데이터 담은 articleList: [{미분류:[{},{},{},...], 분류2:[{},{},{},...]},[],[]] -->
			<!--뉴스그룹 -->
			<div class="list_con" v-for="(group, index) in articleList" :key="index+'-n-'">

				<!-- 그룹 -->
				<div class="list_grp" v-if="checkingNewsGroup(index, group)" >
					<input type="checkbox" :id="'news_group' + index" :checked="group2(group)" @change="checkGroup($event,group)"/>
					<label :for="'news_group' + index"><div class="li_chk" ><span></span></div>
						<div class="li_tit">{{newsGroup[index].sname}}</div>
					</label>
				</div>

				<!-- 폴더명 : 신문,방송,인터넷검색기사 등-->
				<div v-for=" (folder , foldername ) in group" :key="foldername+'-f-'">

					<!-- 폴더 -->
					<div class="list_media" v-if="getArticleListSource === 'header' && foldername !== 'ALL'">
						<input type="checkbox" :id="'folder_'+index+foldername" :checked="fold(folder)" @change="checkFolder($event, folder)"/>
						<label :for="'folder_'+index+foldername">
							<div class="li_chk"><span></span></div>
							<div class="li_tit"><span class="ico li0"></span>
								{{foldername}}
							</div>
						</label>
					</div>

					<!-- one : 기사 하나에 대한 정보 -->
					<ul class="list_ul">
						<slot v-for="(one, oneIdx) in folder">
							<!--소제목 -->
							<div class="list_cate" v-if="getArticleListSource === 'header' && one.subtitle" :key="oneIdx+'-o-'">
								<input type="checkbox" :id="'subtitle_'+index+foldername+oneIdx" :checked="subtitle(one.subtitleHas, folder)" @change="checkSubtitle($event,one.subtitleHas,folder)"/>
								<label :for="'subtitle_'+index+foldername+oneIdx">
									<div class="li_chk"><span></span></div>
									<div class="li_tit">
										<span class="ico li11"></span>
										{{one.subtitle}}
									</div>
								</label>
							</div>
							<!--기사 -->
							<li class="list_li" :class="{ on : one.news_id === news_id_local }" :key="oneIdx+'art'">
								<div class="li_chk">
									<input type="checkbox" :value="one" :id="'article_checkbox'+one.news_id"  v-model="selArticles"/>
									<label :for="'article_checkbox'+one.news_id" >
										<span></span>
									</label>
								</div>
								<div class="li_first" @click="oneCheck(one)"><!--:class="evalManualSetting.cssClassName"-->
									<span class="ico li1" v-if="one.part_name === '' && one.news_comment !== '1'"></span><!-- 지면-->
									<span class="ico li2" v-if="one.part_name === '' && one.news_comment === '1'"></span><!-- 지면&평가제외-->
									<span class="ico li3" v-if="one.part_name !== '' && one.news_comment !== '1'"></span><!-- 온라인-->
									<span class="ico li4" v-if="one.part_name !== '' && one.news_comment === '1'"></span><!-- 온라인&평가제외-->
								</div>
								<template v-if="classicViewMode">
									<div class="li_item media_name" :class="{red : one.news_comment === '1'}">{{one.media_name}}</div>
									<div class="li_item article_title" :class="{red : one.news_comment === '1'}" @click="oneCheck(one)">{{one.article_title}}</div>
									<div class="li_item ev1" v-if="one.news_comment !== '1'">
										<span v-if="getEvalInfo[one.news_id] && getEvalInfo[one.news_id].eval1">
											<span class="ico li5" v-if="getEvalInfo[one.news_id].eval1.eval1_seq"></span> <!--평가1 O -->
											<span v-else class="ico li7"></span> <!--평가1 X -->
										</span>
										<span v-else class="ico li7"></span>
									</div>
									<div class="li_item ev1" v-if="one.news_comment === '1'">
										<span v-if="getEvalInfo[one.news_id] && getEvalInfo[one.news_id].eval1">
											<span class="ico li8" v-if="getEvalInfo[one.news_id].eval1.eval1_seq"></span> <!--평가제외 평가1 O -->
											<span v-else class="ico li10"></span> <!--평가제외 평가1 X -->
										</span>
										<span v-else class="ico li7"></span>
									</div>
									<div class="li_item ev2" v-if="one.news_comment !== '1'">
										<span v-if="getEvalInfo[one.news_id]">
											<span class="ico li5" v-if="getEvalInfo[one.news_id].eval2m2Cnt === getEvalInfo[one.news_id].eval2m2CntMax"></span><!-- 평가2 ○ -->
											<span class="ico li7" v-else-if="getEvalInfo[one.news_id].eval2m2Cnt === 0"></span><!-- 평가2 X-->
											<span class="ico li6" v-else-if="getEvalInfo[one.news_id].eval2m2Cnt < getEvalInfo[one.news_id].eval2m2CntMax"></span><!-- 평가2 △-->
										</span>
									</div>
									<div class="li_item ev2" v-if="one.news_comment === '1'">
										<span v-if="getEvalInfo[one.news_id]">
											<span class="ico li8" v-if="getEvalInfo[one.news_id].eval2m2Cnt === getEvalInfo[one.news_id].eval2m2CntMax"></span><!-- 평가2 ○ -->
											<span class="ico li10" v-else-if="getEvalInfo[one.news_id].eval2m2Cnt === 0"></span><!-- 평가2 X-->
											<span class="ico li9" v-else-if="getEvalInfo[one.news_id].eval2m2Cnt < getEvalInfo[one.news_id].eval2m2CntMax"></span><!-- 평가2 △-->
										</span>
									</div>
								</template>
								<template v-for="(column, ci) in columnSettingWeb">
									<div v-if="!(classicViewMode && (column.field === 'media_name' || column.field === 'article_title'))" class="li_item" :class="getArticleClassName(one.news_comment, column.field)" :key="one.news_id + ci" @click="oneCheck(one, 'col to event')">{{addComma(column.field, one[column.field])}}</div>
								</template>
							</li>
						</slot>
					</ul>
				</div>
			</div>
		</div>
		<!-- e:기사목록 -->
		<!--하단버튼-->
		<div class="cont_btn" v-show="!hideAndShowArticleList" :class="{fold_inner : !listLayout0}">
			<ul class="btn_left">
				<li><a @click="showEvalMulti">다중평가</a></li>
				<li class="red"><a @click="excludeEval">평가제외</a></li>
				<li><a @click="includeEval">평가제외해제</a></li>
				<li><a @click="tempBtn">테스트 버튼</a></li>
			</ul>
			<ul class="btn_right">
			</ul>
		</div>
	</div>
</template>
<script>
	import store from '../../../store'
	import {mapActions, mapGetters, mapMutations, mapState} from 'vuex';
	export default {
		data() {
			return {
				selNewsMe: [0],
				list: {},
				newsGroupCheckForm: [],
				selArticles: ['선택된기사'],
				news_id_local: 0,
				classicViewMode: true,
				configEval: [],
				columnSettingWeb: [],
				evalManualSetting: [],
				// 정렬에 쓰이는 값들
				softSortColumn: 'news_id',
				softSortOrderIndex: 2,
				softSortOrderValue: ['▲', '▼'],
				//
				reComposition: {
					cnt: 0,
					oper: function() {
						if (this.cnt >= 100) {
							this.cnt = 0;
							return ;
						}
						this.cnt++;
					}
				}
			}
		},
		created() {
			//newsMe.vue에서 요청
			this.$eventBus.$on('sendNewsMeToArtList', selNewsMe => {
				this.SET_SELECTED_ARTICLE('');
				this.SET_ARTICLE_LIST('');
				this.selNewsMe = selNewsMe;
				this.SET_ARTICLE_LIST_SOURCE('header');
				if(selNewsMe.length > 0 && !this.searchFormSeen) // 다른 탭을 갔다왔을 때
					this.getArtListFromHeader(this.selDate, this.selNewsMe);
				this.selArticles = ['선택된기사'];
			});
			//EvalHeader.vue에서 요청
			this.$eventBus.$on('sendDateToArticleList', () => {
				this.getListWithAuth();
			});
			this.$eventBus.$on('alignEvalList', () => {
				this.manageArticleListToggle();
			});
		},
		async mounted() {
			let ssdo = store.state.hiddenLink1;
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
		},
		beforeDestroy() {
			this.SET_SELECTED_ARTICLE('');
            this.SET_ARTICLE_LIST([]);
			this.$eventBus.$off('sendNewsMeToArtList');
			this.$eventBus.$off('sendDateToArticleList');
		},
		watch: {
			selectedArticle(next) {
				console.log("watch: ", next);
				if(this.selectedArticle !== '' && this.selectedArticle !== undefined){
					this.news_id_local = this.selectedArticle.news_id;
				} else {
					this.news_id_local = 0;
				}
			},
			searchFormSeen(param) { // 검색접기 했을 때, 데이터가 없다면 검색.
				if (param) return;
				this.SET_ARTICLE_LIST_SOURCE("header");
				if (this.articleList.length > 0) {
					// 알아서 잘 됨.
					return ;
				} else {
					this.getListWithAuth();
				}
			}
		},
		computed: {
			...mapState([
				'newsGroup',
				'articleList',
				'expandArticleList',
				'hideAndShowArticleList',
				'selectedArticle',
				'searchFormSeen',
				'getArticleListFromSearchParams',
				'getArticleListSource',
				'getArticleListFromHeaderPayload',
				'evalInfo',
				'eval2Cnt',
				'pid',
				'newsIdList',
				'searchArticleList',
				'searchNewsIdLIst',
				'selDate',
				'listLayout0',
				'listLayout1',
				'listLayout2',
			]),
			...mapGetters(['getPremiumID','getEvalInfo', 'getEval2Cnt']),
			allLength() {
				const data =this.articleList; 

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
			}
		},
		methods: {
			tempBtn() {
				console.log(this.articleList);
			},
			...mapActions([
				'getArticleListFromHeaderAPI',
				'newsGroupAPI',
				'inExcludeEvalAPI',
				'getMediaPolicyAPI',
				'toggleListLayout',
				'getEval2ClassAPI'
			]),
			...mapMutations([
				'SET_ARTICLE_LIST',
				'SET_SELECTED_ARTICLE',
				'SET_MULTI_SELECTED_ARTICLE',
				'SET_GET_ARTICLE_LIST_FROM_SEARCH_PARAMS',
				'SET_GET_ARTICLE_LIST_FROM_HEADER_PAYLOAD',
				'INITIALIZE_ARTICLE_LIST',
				'INITIALIZE_SELECTED_ARTICLE',
				'TOGGLE_SHOW_DO_EVAL_MULTI',
				'SET_MULTI_EVAL_ARTICLE_LIST',
				'TOGGLE_EXPAND_ARTICLE_LIST',
				'TOGGLE_HIDE_AND_SHOW_ARTICLE_LIST',
				'SET_ARTICLE_LIST_SOURCE',
				'SET_NEWS_ID_LIST',
				'SET_MULTI_NEWS_ID_LIST',
				'SET_LOADING_GIF',
				'SET_SEL_DATE',
			]),
			checkingNewsGroup(index, group) {
				return (this.getArticleListSource === 'header' 
						&& this.newsGroup[index] 
						&& typeof(group) != null 
						&& typeof(group) !== 'undefined');
			},
			getArticleClassName(news_comment, field) {
				let rtn = field;
				if (Number(news_comment) === 1) {
					rtn += ' red';
				}
				return rtn;
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
			createCssClass(cssClassName, attrName, value) {
				var style = document.createElement('style');
				style.type = 'text/css';
				style.innerHTML = cssClassName + ' { ' + attrName + ' : ' + value + '  !important;}';
				document.getElementsByTagName('head')[0].appendChild(style);
			},
			findFirstArticle(list){
				if (this.allLength > 0) {
					if (this.selectedArticle === '' || this.selectedArticle === undefined) {
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
						this.SET_SELECTED_ARTICLE(firstArticle);
					}
				}
			},
			async getArtListFromHeader(openDate, selNewsMe) {
				let payload = [];
				payload['scrapDate'] = openDate;
				payload['newsMe'] = selNewsMe;
				this.SET_LOADING_GIF(true);
				this.SET_GET_ARTICLE_LIST_FROM_HEADER_PAYLOAD(payload);
				if (await this.getArticleListFromHeaderAPI(payload)) {
					await this.getEval2ClassAPI();
					if (selNewsMe !== 'none') {
						this.findFirstArticle(this.articleList);
					}
				} else {
					this.$eventBus.$emit('kickOut');
				}
				this.SET_LOADING_GIF(false);
			},
			async oneCheck(one, msg) {
				if (await this.$store.dispatch('loginCheckGentleAPI')) {
					this.SET_SELECTED_ARTICLE(one);
				} else {
					this.$eventBus.$emit('kickOut');
				}
				// this.$eventBus.$emit('toDoEvalFromPreview','fromButton');
			},
			async showEvalMulti() {
				if (!await this.$store.dispatch('loginCheckGentleAPI')) {
					this.$eventBus.$emit('kickOut');
					return false;
				}
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
			async excludeEval() {
				let news_id_arr = [];
				if (this.selArticles.length === 1) {
					alert('뉴스를 1개 이상 선택하세요.');
					return false;
				}

				this.selArticles.forEach((one, key)=> {
					if (key !== 0) news_id_arr.push(one.news_id);
				});

				let news_id_str = news_id_arr.join();

				let params = new FormData;
				params.append('news_id', news_id_str);
				params.append('flag', 'ex');

				await this.inExcludeEvalAPI(params);
				this.getArticleListFromHeaderAPI(this.getArticleListFromHeaderPayload);
				this.SET_ARTICLE_LIST_SOURCE('header');
				this.selArticles = ['선택된기사'];

				return true;
			},
			/*async excludePressToggle() {
				let news_id = this.selectedArticle.news_id;
				let isExclude = this.selectedArticle.news_comment;
				let list = this.articleList;
				let params = new FormData;
				params.append('news_id', news_id);
				outer : for (let key in list) {
					for (let key2 in list[key]) {
						for (let key3 in list[key][key2]) {
							if (list[key][key2][key3].news_id === news_id) {
								if(isExclude === '1') {
									this.$set(this.articleList[key][key2][key3], 'news_comment', '');
								} else {
									this.$set(this.articleList[key][key2][key3], 'news_comment', '1');
								}
								break outer;
							}
						}
					}
				}
			},*/
			async includeEval() {
				let news_id_arr = [];
				if(this.selArticles.length === 1) {
					alert('뉴스를 1개 이상 선택하세요.');
					return false;
				}

				this.selArticles.forEach((one, key)=> {
					if (key !== 0) news_id_arr.push(one.news_id);
				});

				let news_id_str = news_id_arr.join();

				let params = new FormData;
				params.append('news_id', news_id_str);
				params.append('flag', 'in');
				await this.inExcludeEvalAPI(params);
				this.getArticleListFromHeaderAPI(this.getArticleListFromHeaderPayload);
				this.SET_ARTICLE_LIST_SOURCE('header');
				this.selArticles = ['선택된기사'];
			},
			hideAndShowToggle() {
				this.TOGGLE_HIDE_AND_SHOW_ARTICLE_LIST(!this.hideAndShowArticleList);
			},
			async manageArticleListToggle() {
				let obj = this.$el.querySelector('#evalList');
				let objAlt = document.querySelector('#searchListWrap');
				let parentWidth = Number(obj.offsetWidth), entireWidth = 0;
				if (parentWidth === 0 && objAlt) {
					parentWidth = objAlt.offsetWidth;
					let br = this.$browserDetect;
					if (br.isChrome || br.isFirefox || br.isIE) {
						parentWidth += 3;
					} else {
						parentWidth -= 2;
					}
				}
				if (this.classicViewMode) {
					if (this.evalManualSetting['M1'] && this.evalManualSetting['M2']) {
						this.createCssClass('#evalList .article_title', 'width', (parentWidth - 75 - 180) + 'px');
						this.createCssClass('#evalList .ev1, #evalList .ev2', 'width', '45px');
					} else if (this.evalManualSetting['M1']) {
						this.createCssClass('#evalList .article_title', 'width', (parentWidth - 75 - 180 + 40) + 'px');
						this.createCssClass('#evalList .ev1', 'width', '45px');
						this.createCssClass('#evalList .ev2', 'width', '0');
					} else if (this.evalManualSetting['M2']) {
						this.createCssClass('#evalList .article_title', 'width', (parentWidth - 75 - 180 + 40) + 'px');
						this.createCssClass('#evalList .ev1', 'width', '0');
						this.createCssClass('#evalList .ev2', 'width', '45px');
					} else {
						this.createCssClass('#evalList .article_title', 'width', (parentWidth - 75 - 180 + 90) + 'px');
						this.createCssClass('#evalList .ev1, #evalList .ev2', 'width', '0');
					}
					this.createCssClass('#evalList .media_name', 'width', '90px');

					entireWidth = parentWidth;
					this.columnSettingWeb.forEach(s => {
						if (!s.field.includes('article_title') && !s.field.includes('media_name')) {
							entireWidth += 120;
						}
					});
					this.createCssClass('#evalList .list_tit', 'width', entireWidth + 'px');
					this.createCssClass('#evalList .list_con', 'width', entireWidth + 'px');
				} else {
					this.createCssClass('#evalList .media_name', 'width', '90px');
					this.createCssClass('#evalList .article_title', 'width', (parentWidth - 55 - 90) + 'px');
					entireWidth = parentWidth;
					this.columnSettingWeb.forEach(s => {
						if (!s.field.includes('article_title') && !s.field.includes('media_name')) {
							entireWidth += 120;
						}
					});
					this.createCssClass('#evalList .list_tit', 'width', entireWidth + 'px');
					this.createCssClass('#evalList .list_tit', 'padding-left', '53px');
					this.createCssClass('#evalList .list_con', 'width', entireWidth + 'px');
				}
			},
			async getArticleListToggle() {
				if (!this.configEval || Object.keys(this.configEval).length < 3)
					return;
				this.classicViewMode = (this.configEval['policy']['CS']['value'] === 'Y' && !this.expandArticleList);
				await this.manageArticleListToggle();
			},
			isAll() {
				if (this.allLength > 0) {
					return this.selArticles ? this.allLength === this.allSelectedLength : false;
				}
			},
			group2(group) {
				let $this = this;
				if(typeof group === "object" && group !== null && group !== undefined) {
					const g = Object.keys(group).map(e=>group[e]);
					if (this.groupLength(g) > 0) {
						return g.every(function (folder) {
							let f = Object.keys(folder).map(e=>folder[e]);
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
				if(typeof articleList === "object" && articleList !== null) {
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
				if(typeof group === "object" && group !== null && group !== undefined) {
					let $this = this;
					const g = Object.keys(group).map(e=>group[e]);
					if (g) {
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
			async getListWithAuth() {
				if (await this.$store.dispatch('loginCheckGentleAPI')) {
					this.SET_SELECTED_ARTICLE('');
					this.SET_ARTICLE_LIST([]);
					this.getArtListFromHeader(this.selDate, this.selNewsMe);
					this.SET_ARTICLE_LIST_SOURCE('header');
					this.selArticles = ['선택된기사'];
				} else {
					this.$eventBus.$emit('kickOut');
				}
			},

			//정렬방식 선택//
			async softSort(column) {
				//softSortOrderIndex가 2이고, softSortColumn이 'news_id'일 때 안 보이는 화살표 표현.
				this.softSortOrderIndex = (this.softSortColumn === column) ? (this.softSortOrderIndex + 1) % 3 : 0;
				this.softSortColumn = (this.softSortOrderIndex !== 2) ? column : 'news_id';

				//기사 묶음(articleList)에 대한 정보 -> 배열(Array)
				if (this.articleList && this.articleList.constructor.name === 'Array') {
					function fancyComparator(column, order) {
						return function(a, b) {
							return (order ? (a[column] < b[column]) : (a[column] > b[column])) ? -1 : 1;
						}
					}
					this.articleList.forEach(g => {
						//기사 하나에 대한 정보 -> 객체(object)
						if (g && g.constructor.name === 'Object') {
							Object.values(g).forEach(c => {
								c.sort(fancyComparator(this.softSortColumn, (this.softSortOrderIndex === 0)));
							});
						}
					});
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
	.red { color: #f1595d; }
	.loading {width: 100%; height: 100%; top: 0px; left: 0px; position: fixed; display: block; opacity: 0.7; background-color: #fff; z-index: 99; text-align: center; vertical-align: middle; }
	.loading-image { position: absolute; top: 50%;left: 50%;z-index: 100;}
	.loading-message {position: relative;margin: 0 auto;z-index: 101;}
	.veiled {display:none;}
	.li_tit.wfBoth { padding-right: 180px !important; }
	.list_rt.wfBoth { width: 180px !important; }
	.li_tit.wfSingle { padding-right: 135px !important; }
	.list_rt.wfSingle { width: 135px !important; }
	.li_tit.wfEmpty { padding-right: 90px !important; }
	.list_rt.wfEmpty { width: 90px !important; }
	.list_ul .list_li .li_first {
		cursor: pointer;
		padding-left: 30px;
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
		width: 1px !important;
	}
	#evalList {
		overflow-y: scroll;
	}
	.cp {
		cursor: pointer;
	}
</style>
