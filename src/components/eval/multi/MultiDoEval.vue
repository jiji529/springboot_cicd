<template>
	<div class="val_wrap">
		<!--다중평가하기 제목 -->
		<div class="cont_tit">다중 평가하기</div>
		<div class="val_tit"><a @click="confirm('pre')" class="prev">이전기사</a>
			<span class="title" v-if="multiSelectedArticle">{{multiSelectedArticle.article_title}}</span>
			<span class="title" v-else>선택된 기사가 없습니다.</span>
			<span class="nav">({{cntGroup.nowArt}}/{{cntGroup.cnt}})</span><a @click="confirm('next')" class="next">다음기사</a>
		</div>
		<!--평가하기-->
		<div class="set_val">
			<!--평가1-->
			<div class="filter1" :class="{veiled : !evalManualSetting['M1']}">
				<div class="val_grp">
					<div class="val_grp_tit " :class="{closed : !showEval1}"><a @click="showEval1 = !showEval1"><span>평가 1 항목</span></a>
						<div class="ft_sch">
							<input type="text" placeholder="평가 항목 검색" id="multi_sch_eval1_text" @input="eval1SearchTextEnter($event)" list="multi_sch_eval1_list" tabindex="3" />
							<datalist id="multi_sch_eval1_list">
								<option v-for="eval1 in fetchSearchData" :key="eval1.seq+eval1.name" :value="eval1.name"></option>
							</datalist>
							<button @click="eval1Search('multi_sch_eval1_text')" tabindex="3">검색</button>
						</div>
					</div>
					<div class="sch_eval1_list" :class="{show: isFocus}" v-if="searchData.length>0">
						<ul>
							<li class="item" v-for="(eval1, index) of searchData" :class="{selected : index === focusIndex}" :key="eval1.seq" @mousemove="setHover(index)" @mousedown="selectIdx(index)" :id="'schScrollMulti'+index">{{eval1.name}}</li>
						</ul>
					</div>
					<!--평가1 콤보박스-->
					<dl class="val_item" v-if="showEval1 && evalLayout===0">
						<dt>대</dt>
						<dd>
							<select id="multi-eval1-combo-1" @change="eval1Combo($event, 'major')">
								<option v-if="hiddenEval1" value="maintainValue">유지</option>
								<option value="">선택</option>
								<option v-for="major in fetchEval1Major" :key="major.name+major.seq" :value="major.seq"> {{major.name}}</option>
							</select>
						</dd>
						<dt>중</dt>
						<dd v-show="!hiddenEval1"> 
							<select id="multi-eval1-combo-2" @change="eval1Combo($event, 'middle')" :required="fetchEval1Middle.length>0" >
								<option value="">선택</option>
								<option v-for="mid in fetchEval1Middle" :key="mid.name+mid.seq" :value="mid.seq"> {{mid.name}}</option>
							</select>
						</dd><dd v-show="hiddenEval1">&nbsp;</dd>
						<dt>소</dt>
						<dd v-show="!hiddenEval1">
							<select id="multi-eval1-combo-3" @change="eval1Combo($event, 'minor')" :required="fetchEval1Minor.length>0" >
								<option value="">선택</option>
								<option v-for="minor in fetchEval1Minor" :key="minor.name+minor.seq" :value="minor.seq"> {{minor.name}}</option>
							</select>
						</dd><dd v-show="hiddenEval1">&nbsp;</dd>
					</dl>
					<!--평가1 라디오 버튼-->
					<div class="ft_cont" v-if="showEval1 && evalLayout===1" >
						<div class="ft1_top">
							<div class="ft_tit"> 대분류 </div>
							<div class="ft_tit"> 중분류 </div>
							<div class="ft_tit"> 소분류 </div>
						</div>
						<div class="ft1_box">

							<!-- 유지버튼 / 개발자: 최지현 -->
							<div class="ft1_val">	
								<div class="ft_ch">
									<input type="radio" id="maintainYn-eval1-radio" name="eval1" v-model="selEval1" wasChecked="false" value="maintainValue"/>
									<label class="maintainRadio" for="maintainYn-eval1-radio" :class="{ sel : selEval1 === 'maintainValue' }"><span></span>유지</label>
								</div>
							</div>

							<div class="ft1_val" v-for="major in getEval1Category" :key="major.seq">
								<!--대분류-->
								<!-- v-if="major.sub.length < 1" -->
								<div class="ft_ch" :tabindex="major.sub.length  < 1 ? 0 : null" @keydown.space.prevent="pressSpace(major.seq, major.sub.length)" @click.prevent="pressSpace(major.seq, major.sub.length)" :id="'multi_eval1_focus'+major.seq">			
									<input type="radio" :id="'multi_do_eval1'+major.seq" :value="major.seq" name="multi_eval1" v-model="selEval1" wasChecked="false"/>
									<label :for="'multi_do_eval1'+major.seq" :class="selClass(major.seq)"><span></span>{{major.name}}</label>
								</div>
								<!--중분류-->
								<!-- v-if="mid.sub.length < 1" -->
								<dl class="ft1_li" v-if="major.sub.length > 0 " v-for="mid in major.sub" :key="mid.seq">
									<dt :tabindex="mid.sub.length < 1 ? 0 : null" @keydown.space.prevent="pressSpace(mid.seq, mid.sub.length)" @click.prevent="pressSpace(mid.seq, mid.sub.length)" :id="'multi_eval1_focus'+mid.seq">
										<input type="radio" :id="'multi_do_eval1'+mid.seq" :value="mid.seq" name="multi_eval1" v-model="selEval1" wasChecked="false"/>
										<label :for="'multi_do_eval1'+mid.seq" :class="selClass(mid.seq)"><span></span>{{mid.name}}</label>
									</dt>
									<!-- 소분류 나오는 경우-->
									<dd v-if="mid.sub.length > 0 ">
										<ul>
											<li v-for="minor in mid.sub" :key="minor.seq" tabindex="0" @keydown.space.prevent="pressSpace(minor.seq, minor.sub.length)" @click.prevent="pressSpace(minor.seq, minor.sub.length)" :id="'multi_eval1_focus'+minor.seq">
												<input type="radio" :id="'multi_do_eval1'+minor.seq" :value="minor.seq" name="multi_eval1" v-model="selEval1" wasChecked="false"/>
												<label :for="'multi_do_eval1'+minor.seq" :class="{ sel : selEval1 === minor.seq }"><span></span>{{minor.name}}</label>
											</li>
										</ul>
									</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>
			</div>
			<!--평가2-->
			<div class="filter2" :class="{veiled : !evalManualSetting['M2']}">
				<div class="val_grp">
					<div class="val_grp_tit" :class="{ closed : !showEval2}"><a @click="showEval2 = !showEval2"><span>평가 2 항목</span></a></div>
					<!--평가2 콤보박스-->
					<dl class="val_item" v-if="showEval2 && evalLayout===0">
						<div v-for="(eval2, key) in getEval2Class" :key="key+eval2.upper_cate_name" v-if="eval2.auto === 'N'">
							<dt class="ellipsis">{{eval2.upper_cate_name}}</dt>
							<dd>
								<select :id="'multi-eval2-combo-'+eval2.upper_cate_seq" @change="eval2Combo($event,eval2.upper_cate_seq)">
									<option value="maintainValue">유지</option>
									<option value="">선택</option>
									<option v-for="cate in eval2.sub" :value="cate.seq">{{cate.name}}</option>
								</select>
							</dd>
						</div>
					</dl>
					<!--평가2 라디오 버튼-->
					<div class="ft_cont" v-if="showEval2 && evalLayout===1">
						<div class="ft2_box" v-for="(one, key) in getEval2Class" :key="key" v-if="one.auto === 'N'">
							<div class="ft_ch">{{one.upper_cate_name}}</div>
							<ul class="ft2_li"  >
								<!-- 유지버튼 / 개발자: 최지현 -->
								<li tabindex="0">
									<input type="radio" :id="'maintainYn-radio'+one.upper_cate_seq" :name="'multi_eval2'+one.upper_cate_seq" v-model="selEval2[one.upper_cate_seq]" wasChecked="false" value="maintainValue"/>
									<label :for="'maintainYn-radio'+one.upper_cate_seq" :class="{ sel : selEval2 === 'maintainValue' }"><span></span>유지</label>
								</li>

								<li v-for="(one2, key2) in one.sub" :key="key2" v-if="one.sub.length > 0 && one.auto === 'N' && one2.use === 'Y'" tabindex="0" @keydown.space.prevent="pressSpace2(one.upper_cate_seq,one2.seq)" @click.prevent="pressSpace2(one.upper_cate_seq,one2.seq)">	
									<input type="radio" :id="'multi_do_eval2'+one2.seq" :value="one2.seq" v-model="selEval2[one.upper_cate_seq]" :name="'multi_eval2'+one.upper_cate_seq" wasChecked="false">
									<label :for="'multi_do_eval2'+one2.seq" :class="{sel : selEval2[one.upper_cate_seq] === one2.seq}"><span></span>{{one2.name}}</label>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!--평가하기끝-->
		<!--하단버튼-->
		<div class="cont_btn">
			<ul class="btn_left">
				<li><a @click="reset('o')">초기화</a></li>
			</ul>
			<ul class="btn_right">
				<li class="btn_bl"><a @click="goSave('formData')">저장</a></li>
			</ul>
		</div>
		<!--하단버튼끝-->
		<div id="loading" v-if="isLoading"><img id="loading-image" :src="require('@/assets/images/loading.gif')" alt="Loading..."/></div>
	</div>
	<!--다중평가하기 끝-->
</template>
<script>
	import store from '../../../store'
	import {mapGetters, mapMutations, mapState, mapActions} from 'vuex'
import { nextTick } from 'process'
	export default {
		props: ['evalManualSetting'],
		data() {
			return{
				//개발자: 최지현
				conditionMajor: null,
				conditionMiddle: null,
				conditionMinor: null,
				conditionEval1: null,
				duplArr: {},
				hiddenEval1: true,

				selEval1 : [],
				selEval2 : [],
				showEval1 : true,
				showEval2 : true,
				articlesCnt: 0,
				isLoading: false,
				isEvalChange: false,
				isEval1Change: false,
				isEval2Change: false,

				schEval1: '',
				focusIndex: 0,
				isFocus: false,
				searchData : [],

				notAutoCateSeq : [],
				cateSubSeq : [],
				cateGroupSeq : {},
				cateSeq: [],

				evalLayout: 0,
				inputMajor : "",
				inputMiddle : "",
				inputMinor : "",
				eval1Object : {'eval1_name': null, 'eval1_seq': null, 'eval1_upper': null},
				fetchEval1Major: [],
				fetchEval1Middle: [],
				fetchEval1Minor: [],

				//평가1 항목 검색
				fetchSearchData: [],

				/* 원본 데이터를 저장하기 위한 변수 */
				originArticle: null
			}
		},
		computed: {
			...mapState([
				'multiSelectedArticle',
				'multiEvalArticleList',
				'getArticleListSource',
				'hideAndShowMultiArticleList',
				'newsGroup',
				'newsIdList',
				'searchNewsIdList',
				'multiNewsIdList',
				'getArticleListFromHeaderPayload',
				'getArticleListFromSearchParams',
				'evalInfo',
				'searchEvalInfo',
				'searchFormSeen',
			]),
			...mapGetters([
				'getEval1Category',
				'getEval2Class',
				'getEval1ByCategory'
			]),
			cntGroup ()  {
				let cntGroup = [];
				cntGroup['nowArt'] = 0;
				cntGroup['cnt'] = 0;
				let list = this.multiEvalArticleList;
				for(let key in list){
					cntGroup['cnt']++;
					if(list[key].news_id === this.multiSelectedArticle.news_id) cntGroup['nowArt'] = cntGroup['cnt'];
				}
				return cntGroup
			},
			sub() {
				let eval1 = this.getEval1Category;
				let subList = [];
				for (const key in eval1) {
					subList[eval1[key].seq] = [];
					if(eval1[key.sub] !== null) {
						for (const key1 in eval1[key].sub) {
							subList[eval1[key].sub[key1].seq] = [];
							subList[eval1[key].seq].push(eval1[key].sub[key1].seq);
							if (eval1[key].sub[key1].sub !== null) {
								for (const key2 in eval1[key].sub[key1].sub) {
									subList[eval1[key].seq].push(eval1[key].sub[key1].sub[key2].seq);
									subList[eval1[key].sub[key1].seq].push(eval1[key].sub[key1].sub[key2].seq);
								}
							}
						}
					}
				}
				return subList;
			}
		},
		created() {
			this.$eventBus.$on("toMultiDoEval", (flag) => {this.confirm(flag)});
		},
		watch: {
			multiSelectedArticle(article) {
				if (article == undefined || article == null || 
					(typeof article == "string" && article == "")) return ;
				if (!this.originArticle || typeof article == "object"
					&& article.article_serial != this.originArticle.article_serial)
					this.originArticle = JSON.parse(JSON.stringify(article));
				this.getEvalValue();
				this.isEvalChange = false;
			},
		},
		beforeMount(){
			this.addKeyup();
		},
		beforeDestroy(){
			this.removeKeyup();
		},
		async mounted(){
			this.eval2Cate();
			const display = await this.getLayoutSettingAPI();
			this.evalLayout = Number(display.layout);
			this.getEvalValue("mounted");
			this.isEvalChange = false;
			// 대 평가항목
			this.fetchEval1Major = this.getEval1ByCategory.major;
			this.fetchSearchData = this.getEval1SearchList();

		},
		methods: {
			...mapActions([
				'getEval1CategoryAPI',
				'getEvalInfoAPI',
				'getLayoutSettingAPI'
			]),
			...mapMutations([
				'SET_SHOW_DO_EVAL_MULTI',
				'SET_MULTI_EVAL_ARTICLE_LIST',
				'SET_MULTI_NEWS_ID_LIST',
				'SET_MULTI_SELECTED_ARTICLE',
				'SET_EVAL_INFO',
				'SET_SEARCH_EVAL_INFO',
				'TOGGLE_SHOW_DO_EVAL_MULTI'
			]),
			addKeyup(){
				window.addEventListener('keydown', this.arrowKeyup);
			},
			//기사 좌,우 키보드로 이전기사, 다음기사 이동 키보드 이벤트 삭제
			removeKeyup(){
				window.removeEventListener('keydown', this.arrowKeyup);
			},
			//KEYBOARD이벤트
			arrowKeyup(e){
				switch(e.which){
					case 37 :
						e.preventDefault ? e.preventDefault() : e.returnValue=false;
						e.stopPropagation();this.confirm('pre'); break;
					case 39 :
						e.preventDefault ? e.preventDefault() : e.returnValue=false;
						e.stopPropagation();this.confirm('next'); break;
				}
			},
			/**
			 *
			 * @param seq
			 * 평가항목1에 TAB 포커스 했을 시 스페이스바 PRESS로 해당항목 선택
			 */
			pressSpace(seq, subLength){
				if(subLength >= 0) {
					const subject = document.querySelector('input[id=multi_do_eval1' + seq + ']');
					if (subject.attributes.wasChecked.value === 'true') {
						subject.attributes.wasChecked.value = 'false';
						this.selEval1 = null;
					} else {
						subject.attributes.wasChecked.value = 'true';
						this.selEval1 = seq;
					}
					const eval1CateList = document.querySelectorAll('input[name=multi_eval1]');
					if (window.NodeList && !NodeList.prototype.forEach) {
						NodeList.prototype.forEach = Array.prototype.forEach;
					}
					eval1CateList.forEach(one => {
						if (one.attributes.id.value !== subject.id) {
							one.attributes.wasChecked.value = 'false';
						}
					});
					this.eval1Change();
				}
			},
			/**
			 *
			 * @param upper
			 * @param seq
			 * 평가항목2에 TAB 포커스 했을 시 스페이스바 PRESS로 해당항목 선택
			 */
			pressSpace2(upper,seq){
				const subject = document.querySelector('input[id=multi_do_eval2'+seq+']');
				if(subject.attributes.wasChecked.value === 'true') {
					subject.attributes.wasChecked.value = 'false';
					this.$set(this.selEval2, upper, null);
				}else {
					subject.attributes.wasChecked.value = 'true';
					this.$set(this.selEval2, upper, seq);
				}
				let eval2CateList = document.querySelectorAll('input[name=multi_eval2' + upper +']');
				if (window.NodeList && !NodeList.prototype.forEach) {
					NodeList.prototype.forEach = Array.prototype.forEach;
				}
				eval2CateList.forEach( one => {
					if(one.attributes.id.value !== subject.id)
						one.attributes.wasChecked.value = 'false';
				});
				this.eval2Change();
			},
			eval1SearchTextEnter(e) {
				this.eval1Search(e.target.id);
			},
			eval1Search(id) {
				let searchInput, option, options = this.getEval1SearchList();
				searchInput = document.querySelector('#' + id);
				if (searchInput.value.trim() !== '') {
					for (let i = 0; i < options.length; i++) {
						option = options[i];
						if (option.name === searchInput.value.trim()) {
							this.goSearch(option);
						}
					}
				}
			},
			eval1Combo(e, category) { 
				
				/* maintainValue == "유지" */
				if (e.target.value == "maintainValue") {
					this.hiddenEval1 = true;
				} else {
					this.hiddenEval1 = false;
				}
				
				//개발자: 최지현
				//평가 1항목 중, 소 셀렉트박스 없는 경우 -> 클릭 시 다시 생기도록.
				switch (category) {
					case "major" :
						this.selEval1 = e.target.value; // 라디오 버튼
						this.inputMajor = e.target.value;
						if (this.getEval1ByCategory.all[this.selEval1]) {
							var eval1 = this.getEval1ByCategory.all[this.selEval1];
							this.fetchEval1Middle = eval1.sub;
							this.fetchEval1Minor = [];
						} else {
							this.fetchEval1Middle = [];
							this.fetchEval1Minor = [];
						}
						break;
					case "middle" :
						this.selEval1 = e.target.value;
						this.inputMiddle = e.target.value;
						if (this.getEval1ByCategory.all[this.selEval1]) {
							var eval1 = this.getEval1ByCategory.all[this.selEval1];
							this.fetchEval1Minor = eval1.sub;
						} else {
							this.fetchEval1Minor = [];
						}
						break;
					case "minor" :
						this.selEval1 = e.target.value;
						this.inputMinor = e.target.value;
						break;
					default : break;
				}

console.log(this.selEval1);

				this.eval1Change();
				return false;
			},
			eval2Combo(e,upper_seq) {
				let select = e.target;
				this.selEval2[upper_seq] = select.value;
				this.eval2Change();
			},
			/**
			 * @param seq
			 * @returns {{sel: boolean}}
			 * 평가1 항목 선택시 해당 항목의 상위 항목에 파란글씨 클래스 주기 위해서
			 */
			selClass(seq) {
				const subSeq = this.sub;
				const list = subSeq[seq];
				if (list !== null) {
					for (const key in list) {
						if (this.selEval1 === list[key]) {
							return {sel: true};
						}
					}
				}
				return {sel: this.selEval1 === seq}
			},
			eval2Cate(){
				if(this.getEval2Class !== '' && this.getEval2Class !== []) {
					this.getEval2Class.forEach(item => {
						if (item.auto === 'N') {
							this.notAutoCateSeq.push(item.upper_cate_seq);
						} 
						if (item.sub !== null) {
							item.sub.forEach(subItem => {
								this.cateSubSeq.push(subItem.seq);
								if (!this.cateGroupSeq[item.upper_cate_seq])
									this.cateGroupSeq[item.upper_cate_seq] = [];
								this.cateGroupSeq[item.upper_cate_seq].push(subItem.seq);
							});
						}
						this.cateSeq.push(item.upper_cate_seq);
					});
				}
			},


			async getEvalValue(resetArticle) {
				/* 초기화 또는 선택에 따른 기사 세팅  */
				if (this.multiSelectedArticle && resetArticle 
					&& resetArticle.article_serial == this.multiSelectedArticle.article_serial) {
					this.SET_MULTI_SELECTED_ARTICLE(resetArticle);
				} else if (resetArticle == "mounted") {
					this.originArticle = JSON.parse(JSON.stringify(this.multiSelectedArticle));
				}
				/* 특정 옵션값 초기화 */
				this.isEvalChange = false;
				this.isEval1Change = false;
				this.isEval2Change = false;
				await this.evalInfoReset();
				this.cateSeq.forEach(seq=>{
					this.$set(this.selEval2, seq, null);
					if (document.querySelector('#multi-eval2-combo-' + seq)) {
						document.querySelector('#multi-eval2-combo-' + seq).value = "";
					}
				});

				/* 값 세팅 */
				const selArticle = this.multiSelectedArticle;
				if(selArticle) {
					const newsId = selArticle.news_id;
					let evalInfo = [];
					if (this.searchFormSeen) {
						evalInfo = this.searchEvalInfo;
					} else { 
						evalInfo = this.evalInfo;
					}
					//라디오버튼일때 각 항목의 wasChecked false 로 바꿔줌
					if (this.evalLayout === 1) {
						const eval1CateList = document.querySelectorAll('input[name=multi_eval1]');
						if (window.NodeList && !NodeList.prototype.forEach) NodeList.prototype.forEach = Array.prototype.forEach;
						eval1CateList.forEach(one => {
							one.attributes.wasChecked.value = 'false';
						});
					}

					////////////////////////////////////
					//해당 기사에 대한 평가 정보를 eval1에 넣어주는 부분.
					const eval1 = evalInfo[newsId].eval1;

					//개발자: 최지현
					//평가1 콤보박스 일때 넣어주기
					let majorDOM = document.querySelector('#multi-eval1-combo-1');
					let middleDOM = document.querySelector('#multi-eval1-combo-2');
					let minorDOM = document.querySelector('#multi-eval1-combo-3');
					const doms = [majorDOM, middleDOM, minorDOM];
					const values = [];

					if (eval1.eval1_seq !== null) {
						this.selEval1 = eval1.eval1_seq;
						// //대
						// this.conditionMajor = this.multiEvalArticleList.every(
						// 	function(multiEvalArticles) {return multiEvalArticles.ev1_big == selArticle.ev1_big;}
						// )
						// //중
						// this.conditionMiddle = this.multiEvalArticleList.every(
						// 	function(multiEvalArticles) {return multiEvalArticles.ev1_mid == selArticle.ev1_mid;}
						// )
						// //소
						// this.conditionMinor = this.multiEvalArticleList.every(
						// 	function(multiEvalArticles) {return multiEvalArticles.ev1_sml == selArticle.ev1_sml;}
						// )
						
						this.conditionEval1 
							= this.multiEvalArticleList.every((ma) => {
								return (ma.ev1_big == selArticle.ev1_big
									&& ma.ev1_mid == selArticle.ev1_mid
									&& ma.ev1_sml == selArticle.ev1_sml);
							}); // every()
						
						//평가1 라디오버튼일때
						if (this.evalLayout === 1) {
							// const subject = document.querySelector('input[id=multi_do_eval1' + seq + ']');
							// subject.attributes.wasChecked.value = 'true';
						} else {
							let sEval1 = eval1;
							while (true) {
								values.push(sEval1.eval1_seq);
								if (sEval1.eval1_upper == null) break;
								sEval1 = this.getEval1ByCategory.all[sEval1.eval1_upper];
							}
							values.reverse();
							switch (values.length) {
								case 3 :
									this.inputMajor = values[0];
									this.inputMiddle = values[1];
									this.inputMinor = values[2];
									this.fetchEval1Middle = this.getEval1ByCategory.all[values[0]].sub;
									this.fetchEval1Minor = this.getEval1ByCategory.all[values[1]].sub;
									break;
								case 2:
									this.inputMajor = values[0];
									this.inputMiddle = values[1];
									this.fetchEval1Minor = this.getEval1ByCategory.all[values[1]].sub;
									break;
								default:
									this.inputMajor = values[0];
									this.fetchEval1Middle = this.getEval1ByCategory.all[values[0]].sub;
									this.fetchEval1Minor = [];
									break;
							}
							/* "유지" 상태라면 SELECTBOX는 하나만 */
							if (this.conditionEval1) {
								this.hiddenEval1 = false;
							}
						}
					} else {
						this.fetchEval1Middle = [];
						this.fetchEval1Minor = [];
					}
					//DOM이 완성된 후 '유지' 선택 경우 추가
					const that = this;
					this.$nextTick(() => {
						values.forEach(function(value, index) {
							doms[index].value = value;
						})

						//개발자: 최지현
						//평가1항목 중복 비교
						if(!this.conditionEval1){
							let combo = document.querySelector('#multi-eval1-combo-1');
							let radio = document.querySelector('#maintainYn-eval1-radio');
							if (combo) {
								combo.value = "maintainValue";
							}
							if (radio) {
								that.selEval1 = "maintainValue"
							}
						}
						// if(!this.conditionMiddle){
						// 	// document.querySelector('#multi-eval1-combo-2').value = "maintainValue";
						// 	let combo = document.querySelector('#multi-eval1-combo-2');
						// 	let radio = document.querySelector('#maintainYn-eval1-radio');
						// 	if (combo) {
						// 		combo.value = "maintainValue";
						// 	}
						// 	if (radio) {
						// 		that.selEval1 = "maintainValue"
						// 	}
						// }
						
						// if(!this.conditionMinor){
						// 	// document.querySelector('#multit-eval1-combo-3').value = "maintainValue";
						// 	let combo = document.querySelector('#multi-eval1-combo-3');
						// 	let radio = document.querySelector('#maintainYn-eval1-radio');
						// 	if (combo) {
						// 		combo.value = "maintainValue";
						// 	}
						// 	if (radio) {
						// 		that.selEval1 = "maintainValue"
						// 	}
						// }
						/* 평가1의 모든 값이 동일하면 "유지" 라디오버튼 숨기기 */
						if (that.evalLayout == 1 && that.selEval1 != "maintainValue") {
							document.querySelector("#maintainYn-eval1-radio")
								.parentNode
								.parentNode
								.style.display = "none";
						}
					}); // $nextTick()



					//개발자: 최지현
					//평가2항목 중복 비교.
					const list = {}; 
					for (let klass of this.getEval2Class) {
						if (klass.auto !== "Y") {
							list[klass.upper_cate_seq] = [];
						}
					}
					for (let art of this.multiEvalArticleList) {
						let e2 = evalInfo[art.news_id]["eval2Value"]
						for (let [groupSeq, value] of Object.entries(e2)) {
							if (!list[groupSeq]) continue;
							list[groupSeq].push(value.eval2_seq);
						}
					}
					let totalCnt = this.multiEvalArticleList.length;
					for (let [groupSeq, evalSeq] of Object.entries(list)) {
						let partCnt = evalSeq.length;
						if (totalCnt != partCnt) {
							let remain = totalCnt - partCnt
							for (let i=0; i<remain; i++) {
								evalSeq.push(-1);
							}
						}
						for (let [idx1, value1] of Object.entries(evalSeq)) {
							let dupl = true;
							for (let [idx2, value2] of Object.entries(evalSeq)) {
								if (idx1 != idx2 && value1 != value2) {
									dupl = false;
									break;
								}
							}
							this.duplArr[groupSeq] = dupl;
						}
					}
					//개발자: 최지현
					//평가2항목 값 있으면 값, 화면 넣어주기
					this.$nextTick(() => {
						for (const [groupSeq, flag] of Object.entries(that.duplArr)) {
							const tag = document.querySelector('#multi-eval2-combo-' + groupSeq)
							if (that.evalLayout === 0 && tag){ /* SELECTBOX BUTTON */
								//개발자: 지현
								if (flag) {
									if (evalInfo[newsId]["eval2Value"][groupSeq] != null) {
										tag.value = evalInfo[newsId]["eval2Value"][groupSeq]["eval2_seq"];
									} else {
										tag.value = "";
									}
									document.querySelector("#multi-eval2-combo-"+groupSeq+" > option[value='maintainValue']").hidden = true;

								} else {
									tag.value = "maintainValue";
								}
							} else if (that.evalLayout === 1 && !tag) {/* RADIO BUTTON */
								if (flag) {
									if (evalInfo[newsId]["eval2Value"][groupSeq] != null) {
										that.selEval2[groupSeq] = evalInfo[newsId]["eval2Value"][groupSeq]["eval2_seq"];
									} else {
										that.selEval2[groupSeq] = "";
									}
									document.querySelector("#maintainYn-radio" + groupSeq).parentNode.style.display = "none";
								} else {
									that.selEval2[groupSeq] = "maintainValue";
								}
							}
						}
					}); // $nextTick()

				} // if(selArticle)
			}, // getEvalValue


			closeEvalMulti() {
				this.SET_SHOW_DO_EVAL_MULTI(false);
			},
			reset(type) {
				if (type == undefined || type == null
					|| !this.originArticle 
					|| !this.originArticle.eval2) return ;
				if (type === "o") { 
					this.getEvalValue(this.originArticle);
				} else if (type === "n") {
					this.notAutoCateSeq.forEach(seq=>{
						this.$set(this.selEval2, seq, null);
						// this.$set(this.inputEval2, seq, null);
					});
					this.eval1Change();
					this.eval2Change();
					this.evalInfoReset();
					this.fetchEval1Middle = [];
					this.fetchEval1Minor = [];
				}
			},
			evalInfoReset() { // 화면 요소만 초기화
				this.$el.querySelector('#multi_sch_eval1_text').value = '';
				this.selEval1 = null;
				if (this.evalLayout === 0) {
					this.$el.querySelector('#multi-eval1-combo-1').value = '';
					this.$el.querySelector('#multi-eval1-combo-2').value = '';
					this.$el.querySelector('#multi-eval1-combo-3').value = '';
					//this.inputMajor = null;
					this.inputMiddle = null;
					this.inputMinor = null;
					this.fetchEval1Major = this.getEval1ByCategory.major;

					this.fetchEval1Middle = this.getEval1ByCategory.middle;
					this.fetchEval1Minor = this.getEval1ByCategory.minor;
					this.notAutoCateSeq.forEach(e => {
						this.$el.querySelector('#multi-eval2-combo-' + e).value = '';
					});
				}
			},
			//평가 저장
			async goSave(flag) {
				if (!await this.$store.dispatch('loginCheckGentleAPI')) {
					this.$eventBus.$emit('kickOut');
					return false;
				}
				if (document.activeElement && document.activeElement.getAttribute('id') === 'multi_sch_eval1_list') {
					return;
				}
				if( this.isEvalChange ) {
					//EVAL2 세팅하기
					let eval2 = this.selEval2;
					let eval2Arr = [];
					const that = this;
					this.notAutoCateSeq.forEach(seq => {
						if(eval2[seq] != null && eval2[seq] != "" && eval2[seq] != "maintainValue") { // 삭제, 삽입
							eval2Arr.push(eval2[seq]);

							for (let [k, v] of Object.entries(that.cateGroupSeq[seq])) {
								let i = that.cateSubSeq.indexOf(v);
								that.cateSubSeq.splice(i, 1);
							}
						} else if (eval2[seq] != null && eval2[seq] == "") { // 삭제
							for (let [k, v] of Object.entries(that.cateGroupSeq[seq])) {
								let i = that.cateSubSeq.indexOf(v);
								that.cateSubSeq.splice(i, 1);
							}
						}
					});
					let eval2Str = eval2Arr.join();
					let newsIdStr = this.multiNewsIdList.join();
					
					//EVAL1 세팅하기
					if (this.selEval1 == "maintainValue") {
						this.isEval1Change = false;
					}

					let params = new FormData();
					params.append('eval1', this.selEval1);
					params.append('eval1Change', this.isEval1Change);
					params.append('eval2', eval2Str);
					params.append('eval2Change', this.isEval2Change);
					params.append('news_id', newsIdStr);
					params.append('autoCateSubSeq', this.cateSubSeq);


/*
					유지
						[1001:주목도]
						eval2: -
						autoCateSubSeq: 17 18 19 20 21
					
					삭제
						[1001:주목도]
						eval2: -
						autoCateSubSeq: -
					
					삽입
						[1001:주목도]
						eval2: 17
						autoCateSubSeq: -
					
*/

					//eval 값 저장
					this.isLoading=true;
					let ssdo = store.state.hiddenLink1;
					await this.$axios.post(ssdo + '/saveMultiEval.php',params).then().catch(e => console.log(e));
					let paramsA = new FormData();
					let paramsB = new FormData();
					paramsA.append('news_id', this.newsIdList);
					paramsA.append('flag','do');
					paramsB.append('news_id', this.searchNewsIdList);
					paramsB.append('flag','search');
					await this.getEvalInfoAPI(paramsA);
					await this.getEvalInfoAPI(paramsB);
					this.isLoading=false;
					this.isEvalChange = false;
					this.isEval1Change = false;
					this.isEval2Change = false;
					if (this.searchFormSeen) {
						this.$eventBus.$emit('triggerSearch');
					} else {
						this.$eventBus.$emit('sendDateToArticleList');
					}
					this.TOGGLE_SHOW_DO_EVAL_MULTI(false);
				}
				if(flag === 'pre') {
					this.preArticle();
				} else if(flag === 'next'){
					this.nextArticle();
				}
			},
			confirm(flag) {
				if (document.activeElement && document.activeElement.getAttribute('id') === 'multi_sch_eval1_list') {
					return;
				}
				if(this.isEvalChange) {
					if(this.evalLayout === 0) {
						if (this.inputMajor && this.fetchEval1Middle.length > 0) {
							if (!this.inputMiddle) {
								alert('평가1 항목의 중항목을 선택해 주세요.');
								document.getElementById('multi-eval1-combo-2').focus();
								return true;
							} else if (this.fetchEval1Minor.length > 0 && !this.inputMinor) {
								alert('평가1 항목의 소항목을 선택해 주세요.');
								document.getElementById('multi-eval1-combo-3').focus();
								return true;
							}
						}
					}
					if(window.confirm('현재 평가 값이 다중 평가목록의 모든 기사에 적용됩니다')) {
						this.goSave(flag);
					}
				}
				if (flag === "pre") this.preArticle();
				else if (flag === "next") this.nextArticle();
			},
			//이전기사
			preArticle() {
				let list =this.multiEvalArticleList;
				let newsIdList = this.multiNewsIdList;
				if(newsIdList.length>0) {
					let pre_news_id = '0';
					let newsIdListLastIndex = String(newsIdList.length - 1);
					for (let key in newsIdList) {
						if (newsIdList[key] === this.multiSelectedArticle.news_id) {
							if (key === '0') {
								pre_news_id = newsIdList[newsIdListLastIndex];
							} else {
								pre_news_id = newsIdList[key - 1];
							}
							break;
						}
					}
					for (let one in list) {
						if (list[one].news_id === pre_news_id) {
							this.SET_MULTI_SELECTED_ARTICLE(list[one]);
							break;
						}
					}
				}

			},
			nextArticle() {
				let newsIdList = this.multiNewsIdList;
				if(newsIdList.length>0) {
					let next_news_id = '0';
					let newsIdListLastIndex = String(newsIdList.length - 1);
					if(newsIdListLastIndex === "-1") return true;
					for (let key in newsIdList) {
						if (newsIdList[key] === this.multiSelectedArticle.news_id) {
							if (key === newsIdListLastIndex) {
								next_news_id = newsIdList[0];
							} else {
								let nextIdx = Number(key) + 1;
								next_news_id = newsIdList[nextIdx];
							}
							break;
						}
					}
					let list = this.multiEvalArticleList;
					for (let one in list) {
						if (list[one].news_id === next_news_id) {
							this.SET_MULTI_SELECTED_ARTICLE(list[one]);
							break;
						}
					}
				}
			},
			//평가1항목 바뀌었을때
			eval1Change(){
				this.isEval1Change = true;
				this.isEvalChange = true;
			},
			//평가2항목 바뀌었을때
			eval2Change(){
				this.isEval2Change = true;
				this.isEvalChange = true;
			},
			getEval1SearchList() {
				let reverse = this.$browserDetect.isIE || this.$browserDetect.isFirefox;
				const list = this.getEval1Category;
				let eval1List = [], tmpAval, tmpBval, tmpCval;
				for (let valA of list) {
					tmpAval = reverse ? (valA.name + '(대)') : ('(대)' + valA.name);
					eval1List.push({'seq': valA.seq, 'name': tmpAval, 'upperSeq': valA.upperSeq});
					if (valA.sub !== null) {
						for (let valB of valA.sub) {
							tmpBval = reverse ? (valB.name + '(중)') : ('(중)' + valB.name);
							eval1List.push({'seq': valB.seq, 'name': tmpBval, 'upperSeq': valB.upperSeq});
							if (valB.sub !== null) {
								for (let valC of valB.sub) {
									tmpCval = reverse ? (valC.name + '(소)') : ('(소)' + valC.name);
									eval1List.push({'seq': valC.seq, 'name': tmpCval, 'upperSeq': valC.upperSeq});
								}
							}
						}
					}
				}
				return eval1List;
			},
            //평가항목검색 찾기 이벤트
			async goSearch(eval1) {
				const seq = eval1.seq;
				if(this.evalLayout===0){
					await this.evalInfoReset();
					const selData = this.getEval1ByCategory.all[seq];
					let major,minor,middle;
					major = document.querySelector('#multi-eval1-combo-1');
					middle = document.querySelector('#multi-eval1-combo-2');
					minor = document.querySelector('#multi-eval1-combo-3');
					let midData, majorData;
					switch(selData.flag) {
						case "minor" :
							minor.value = selData.eval1_seq;
							this.inputMinor = selData.eval1_seq;
							midData = this.getEval1ByCategory.all[selData.eval1_upper];
							middle.value = midData.eval1_seq;
							this.inputMiddle = midData.eval1_seq;
							majorData = this.getEval1ByCategory.all[midData.eval1_upper];
							major.value = majorData.eval1_seq;
							this.inputMajor = majorData.eval1_seq;
							this.fetchEval1Minor = midData.sub;
							this.fetchEval1Middle = majorData.sub;
							break;
						case "middle" :
							middle.value = selData.eval1_seq;
							this.inputMiddle = selData.eval1_seq;
							majorData = this.getEval1ByCategory.all[selData.eval1_upper];
							major.value = majorData.eval1_seq;
							this.inputMajor = majorData.eval1_seq;
							this.fetchEval1Minor = selData.sub;
							this.fetchEval1Middle = majorData.sub;
							break;
						case "major" :
							major.value = selData.eval1_seq;
							this.inputMajor = selData.eval1_seq;
							this.fetchEval1Middle = selData.sub;
							this.fetchEval1Minor = [];
					}
				}
				this.selEval1 =seq;
				this.eval1Change();
				if(this.evalLayout===1){
					document.querySelector("[id=do_eval1_focus" + seq + "]").focus();
					document.querySelector("[id=do_eval1_focus" + seq + "]").scrollIntoView();
				}
            }
		}
	}
</script>
<style scoped>
	#loading {width: 100%;height: 100%;top:0; left:0; position:fixed; display:block; opacity: 0.7; background-color:#fff; z-index: 99; text-align: center;}
	#loading-image {position: absolute;top: 50%;left: 50%;z-index: 100;}
	.sch_eval1_list { top:29px; right:5px; width:130px;position: absolute; background-color:white; border:1px solid #ccc; border-radius:1px; padding:1px; display:none; max-height:250px; overflow:auto;z-index:11;}
	.show {display: block;}
	.sch_eval1_list .item {padding: 3px; cursor: pointer;}
	.selected {background-color: #5ca5e6; color:white;}
	.ellipsis {text-overflow:ellipsis; white-space:nowrap; overflow:hidden}
	.veiled {display:none;}

	.maintainRadio{font-weight: bold;}
	.ft1_box .ft1_val .sel{font-weight:bold; color:#477acc;}
</style>
