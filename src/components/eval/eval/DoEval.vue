<template>
	<div class="val_wrap" id="evalValWrap">
		<div class="cont_tit">
			<a @click="toggleListLayout(1)" title="접기"></a>
			<span>평가하기</span>
		</div>
		<!-- s: 이전기사,다음기사 버튼, 기사제목 -->
		<div class="val_tit" :class="{fold_inner : !listLayout1}"><a v-on:click.prevent="goSave('pre')" class="prev">이전기사</a>
			<span>
        <span class="title" v-if="selectedArticle" >{{selectedArticle.article_title}}</span>
        <span class="title" v-else>선택된 기사가 없습니다.</span>
        <span class="nav">({{cntGroup.nowArt}}/{{cntGroup.cnt}})</span>
      </span>
			<a v-on:click.prevent="goSave('next')" class="next">다음기사</a>
		</div>
		<!-- e: 이전기사,다음기사 버튼, 기사제목 -->
		<div class="set_val" :class="{fold_inner : !listLayout1}">
			<div class="val_grp" v-show="selectedArticle">
				<dl class="val_item">
					<dt style="background-color:#f0f4f7">평가가치</dt>
					<dd>{{divKiloAddCommaFunc(selectedArticle.eval_score_db)}}&nbsp;<span>{{showEvalScoreChanged}}</span></dd>
					<dt style="background-color:#f0f4f7">평가제외</dt>
					<dd><input type="checkbox" id="do-grp01"
					           :checked="selectedArticle.news_comment==='1'"
					           @change="inExcludeEval($event)"/>
						<label for="do-grp01"><span></span>평가제외 하기</label>
					</dd>
				</dl>
			</div>
			<!-- s:기사정보 -->
			<div class="val_grp">
				<div class="val_grp_tit" :class="{closed : !showArticleInformation}"><a @click="showArticleInformation = !showArticleInformation"><span>기사정보</span></a></div>
				<dl class="val_item" v-if="showArticleInformation">
					<dt class="ellipsis">매체구분</dt>
					<dd v-if="selectedArticle">{{selectedArticle.category_name_new}}&nbsp;</dd>
					<dd v-else>&nbsp;</dd>
					<dt class="ellipsis">매체명</dt>
					<dd v-if="selectedArticle">{{selectedArticle.media_name}}&nbsp;</dd>
					<dd v-else>&nbsp;</dd>
					<dt class="ellipsis">기사 형식</dt>
					<dd v-if="selectedArticle">
						<span v-show="selectedArticle.part_name === ''">지면</span>
						<span v-show="selectedArticle.part_name !== ''">온라인</span>
					</dd><dd v-else>&nbsp;</dd>
					<dt class="ellipsis">게재면 (섹션)</dt>
					<dd v-if="selectedArticle">{{selectedArticle.news_group}}&nbsp;</dd> <dd v-else>&nbsp;</dd>

					<slot v-if="visibleEvalList[3]">
						<dt class="ellipsis">매체 중요도</dt>
						<dd v-if="selectedArticle && Object.keys(autoMediaImportance).length > 0">
							<select id="eval2-combo-3" v-model="selEval2[autoMediaImportance.upper_cate_seq]"  @change="eval2Combo($event,autoMediaImportance.upper_cate_seq)" tabindex="3" v-if="Object.keys(autoMediaImportance).length > 0">
								<option value="null">선택</option>
								<option v-for="val in autoMediaImportance.sub" :key="String(val.seq)" v-if="val.use === 'Y'" :value="String(val.seq)">{{val.name}}</option>
							</select>
							<select v-model="selEval2[autoMediaImportance.upper_cate_seq]"  @change="eval2Change()" tabindex="3" v-if="mediaImportanceNotUse.indexOf(selEval2[autoMediaImportance.upper_cate_seq]) > -1" disabled>
								<option v-for="val in autoMediaImportance.sub" :key="String(val.seq)" v-if="val.use === 'N'" :value="String(val.seq)" disabled>{{val.name}}</option>
							</select>
						</dd><dd v-else>&nbsp;</dd>
					</slot>

					<slot v-if="visibleEvalList[5]">
						<dt class="ellipsis">기사 위치</dt>
						<dd v-if="selectedArticle && Object.keys(autoLocation).length > 0">
							<select id="eval2-combo-5" v-model="selEval2[autoLocation.upper_cate_seq]" tabindex="3" @change="eval2Combo($event, autoLocation.upper_cate_seq)">
								<option value="null">선택</option>
								<option v-for="val in autoLocation.sub" :key="String(val.seq)" v-if="val.use === 'Y'" :value="String(val.seq)">{{val.name}}</option>
							</select>
						</dd>
						<dd v-else-if="selectedArticle">
							<span v-if="selectedArticle.article_page === '기타' || selectedArticle.article_page === null">{{selectedArticle.article_page}}&nbsp;</span>
							<span v-else>{{selectedArticle.article_page}}면</span>
						</dd>
						<dd v-else>&nbsp;</dd>
					</slot>

					<dt class="ellipsis">기자명</dt>
					<dd v-if="selectedArticle">
						<span v-if="selectedArticle.article_reporter !== ''">{{selectedArticle.article_reporter}}&nbsp;</span>
						<span v-else> &nbsp; </span>
					</dd>
					<dd v-else>&nbsp;</dd>

					<slot v-if="visibleEvalList[4]">
						<dt class="ellipsis">취재원</dt>
						<dd v-if="selectedArticle">
							<select id="eval2-combo-4" v-if="Object.keys(autoReporter).length > 0" v-model="selEval2[autoReporter.upper_cate_seq]" @change="eval2Combo($event, autoReporter.upper_cate_seq)" tabindex="3">
								<option value="null">선택</option>
								<option v-for="val in autoReporter.sub" :key="String(val.seq)" :value="String(val.seq)">{{val.name}}</option>
							</select>
						</dd>
						<dd v-else>&nbsp;</dd>
					</slot>

					<slot v-if="visibleEvalList[2]">
						<dt class="ellipsis">기사 글자수</dt>
						<dd v-if="selectedArticle">{{selectedArticle.article_length}}자
							<select id="eval2-combo-2" v-if="Object.keys(autoLetterCnt).length > 0" v-model="selEval2[autoLetterCnt.upper_cate_seq]" @change="eval2Combo($event, autoLetterCnt.upper_cate_seq)" tabindex="3">
								<option value="null">선택</option>
								<option v-for="val in autoLetterCnt.sub" :key="val.seq" v-if="val.use === 'Y'" :value="val.seq">{{val.name}}</option>
							</select>
						</dd>
						<dd v-else>&nbsp;</dd>
					</slot>

					<slot v-if="visibleEvalList[1]">
						<dt class="ellipsis">기사 크기</dt>
						<dd v-if="selectedArticle">{{selectedArticle.article_size_own}}㎠ ({{ Math.trunc(selectedArticle.article_size_pixel / selectedArticle.page_size_pixel * 100 * 1000) / 1000}}%)
							<select id="eval2-combo-1" v-if="Object.keys(autoSize).length > 0" v-model="selEval2[autoSize.upper_cate_seq]" @change="eval2Combo($event, autoSize.upper_cate_seq)" tabindex="3">
								<option value="null">선택</option>
								<option v-for="val in autoSize.sub" :key="val.seq" v-if="val.use === 'Y'" :value="val.seq">{{val.name}}</option>
							</select>
						</dd><dd v-else>&nbsp;</dd>
					</slot>
				</dl>
			</div>
			<!-- e:기사정보 -->
			<!-- s:eval1 -->
			<div class="filter1" :class="{veiled : !evalManualSetting['M1']}">
				<div class="val_grp">
					<div class="val_grp_tit" :class="{ closed : !showEval1}"><a @click="showEval1 = !showEval1"><span>평가 1 항목</span></a>
                        <div class="ft_sch">
                    	    <input type="text"
                                   placeholder="평가 항목 검색"
                                   id="sch_eval1_text"
                                   @input="eval1SearchTextEnter($event)"
                                   list="sch_eval1_list" tabindex="3"/>
                    		<datalist id="sch_eval1_list">
                    		       <option v-for="eval1 in fetchSearchData"
                    				:key="eval1.seq+eval1.name"
                    				:value="eval1.name"></option>
                    		</datalist>
                    		<button @click="eval1Search('sch_eval1_text')" tabindex="3">검색</button>
                        </div>
                    </div>
					<!--평가1 콤보박스-->
					<dl class="val_item" v-if="showEval1 && evalLayout===0">
						<dt>대</dt>
						<dd>
<!--
							<input type="text" list="val1-1" id="eval1-combo-1"
							       placeholder="평가항목 선택 또는 입력"
							       @change="eval1Combo($event, 'val1-1', 'major')"/>
							<datalist id="val1-1">
								<option v-for="major in fetchEval1Major"
								        :key="major.name+major.seq"
								        :data-value="major.seq"
								        :value="major.name"></option>
							</datalist>
 -->
							<select id="eval1-combo-1" @change="eval1Combo($event, 'major')">
                                <option value="">선택</option>
                                <option v-for="major in fetchEval1Major" :key="major.name+major.seq" :value="major.seq"> {{major.name}}</option>
                            </select>

						</dd>
						<dt>중</dt>
						<dd>
<!--
							<input type="text" list="val1-2" id="eval1-combo-2"
							       placeholder="평가항목 선택 또는 입력"
							       @input="eval1Combo($event,'val1-2', 'middle')"
							       :required="fetchEval1Middle.length>0"/>
							<datalist id="val1-2">
								<option v-for="mid in fetchEval1Middle"
								        :key="mid.name+mid.seq"
								        :data-value="mid.seq"
								        :value="mid.name"></option>
							</datalist>
-->
							<select id="eval1-combo-2" @change="eval1Combo($event, 'middle')" :required="fetchEval1Middle.length>0">
                                <option value="">선택</option>
                                <option v-for="mid in fetchEval1Middle" :key="mid.name+mid.seq" :value="mid.seq"> {{mid.name}}</option>
                            </select>
						</dd>
						<dt>소</dt>
						<dd>
<!--
							<input type="text" list="val1-3" id="eval1-combo-3"
							       placeholder="평가항목 선택 또는 입력"
							       @input="eval1Combo($event,'val1-3','minor')"
							       :required="fetchEval1Minor.length>0"/>
							<datalist id="val1-3">
								<option v-for="minor in fetchEval1Minor"
								        :key="minor.name+minor.seq"
								        :data-value="minor.seq"
								        :value="minor.name"></option>
							</datalist>
-->
                            <select id="eval1-combo-3" @change="eval1Combo($event, 'minor')" :required="fetchEval1Minor.length>0">
                                <option value="">선택</option>
                                <option v-for="minor in fetchEval1Minor" :key="minor.name+minor.seq" :value="minor.seq"> {{minor.name}}</option>
                            </select>
						</dd>
					</dl>
					<!--평가1 라디오 버튼-->
					<div class="ft_cont" v-if="showEval1 && evalLayout===1" >
						<div class="ft1_top">
							<div class="ft_tit"> 대분류 </div>
							<div class="ft_tit"> 중분류 </div>
							<div class="ft_tit"> 소분류 </div>
						</div>
						<div class="ft1_box">
							<div class="ft1_val" v-for="major in getEval1Category" :key="major.seq">
								<!--대분류-->
								<div class="ft_ch" :tabindex="major.sub.length  < 1 ? 3 : null" @keydown.space.prevent="pressSpace(major.seq, major.sub.length)" @click.prevent="pressSpace(major.seq, major.sub.length)" :id="'do_eval1_focus'+major.seq">
									<input  type="radio" :id="'do_eval1'+major.seq" v-if="major.sub.length < 1 " :value="major.seq" name="eval1"  v-model="selEval1"  wasChecked="false"/>
									<label :for="'do_eval1'+major.seq" :class="selClass(major.seq)"><span></span>{{major.name}}</label>
								</div>
								<!--중분류-->
								<dl class="ft1_li" v-if="major.sub.length > 0 " v-for="mid in major.sub" :key="mid.seq" >
									<dt :tabindex="mid.sub.length < 1 ? 3 : null" @keydown.space.prevent="pressSpace(mid.seq, mid.sub.length)" @click.prevent="pressSpace(mid.seq, mid.sub.length)" :id="'do_eval1_focus'+mid.seq">
										<input type="radio" :id="'do_eval1'+mid.seq" v-if="mid.sub.length < 1 " :value="mid.seq" name="eval1" v-model="selEval1" wasChecked="false"/>
										<label :for="'do_eval1'+mid.seq" :class="selClass(mid.seq)"><span></span>{{mid.name}}</label>
									</dt>
									<dd v-if="mid.sub.length > 0 " >
										<ul>
											<!--소분류-->
											<li v-for="minor in mid.sub" :key="minor.seq" tabindex="3" @keydown.space.prevent="pressSpace(minor.seq, minor.sub.length)" @click.prevent="pressSpace(minor.seq, minor.sub.length)" :id="'do_eval1_focus'+minor.seq">
												<input type="radio" :id="'do_eval1'+minor.seq" :value="minor.seq" name="eval1"  v-model="selEval1" wasChecked="false"/>
												<label :for="'do_eval1'+minor.seq" :class="{sel : selEval1 === minor.seq }"><span></span>{{minor.name}}</label>
											</li>
										</ul>
									</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>
			</div>
			<!-- e:eval1 -->
			<!-- s:eval2 -->
			<div class="filter2" :class="{veiled : !evalManualSetting['M2']}">
				<div class="val_grp">
					<div class="val_grp_tit" :class="{ closed : !showEval2}"><a @click="showEval2 = !showEval2"><span>평가 2 항목</span></a></div>
					<!--평가2 콤보박스-->
					<dl class="val_item" v-if="showEval2 && evalLayout===0">
						<div v-for="(eval2, key) in getEval2Class" :key="key+eval2.upper_cate_name" v-if="eval2.auto === 'N'">
							<dt class="ellipsis">{{eval2.upper_cate_name}}</dt>
							<dd>
<!--
								<input type="text" :list="'val2-'+(key+1)"
								       :id="'eval2-combo-'+eval2.upper_cate_seq"
								       placeholder="평가항목 선택 또는 입력"
								       @input="eval2Combo($event,'val2-'+(key+1),eval2.upper_cate_seq)"
								/>
								<datalist :id="'val2-'+(key+1)">
									<option v-for="cate in eval2.sub" :data-value="cate.seq" :value="cate.name"></option>
								</datalist>
-->
    							<select :id="'eval2-combo-'+eval2.upper_cate_seq" @change="eval2Combo($event,eval2.upper_cate_seq)">
                                    <option value="">선택</option>
                                    <option v-for="cate in eval2.sub" :key="cate.name+cate.seq" :value="cate.seq">{{cate.name}}</option>
                                </select>

							</dd>
						</div>
					</dl>
					<!--평가2 라디오 버튼-->
					<div class="ft_cont" v-if="showEval2 && evalLayout===1">
						<div class="ft2_box" v-for="(one, key) in getEval2Class" :key="key" v-if="one.auto === 'N'">
							<div class="ft_ch">{{one.upper_cate_name}}</div>
							<ul class="ft2_li"  >
								<li v-for="(one2, key2) in one.sub" :key="key2" v-if="one.sub.length > 0 && one.auto === 'N' && one2.use === 'Y' "
								    tabindex="3"
								    @keydown.space.prevent="pressSpace2(one.upper_cate_seq,one2.seq)"
								    @click.prevent="pressSpace2(one.upper_cate_seq,one2.seq)">
									<input type="radio" :id="'do_eval2'+one2.seq" :value="one2.seq"
									       v-model="selEval2[one.upper_cate_seq]" :name="'do_eval2' + one.upper_cate_seq"  wasChecked="false">
									<label :for="'do_eval2' + one2.seq" :class="{sel : selEval2[one.upper_cate_seq] === one2.seq }" ><span></span>{{one2.name}}</label>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
			<!-- e:eval2 -->
		</div>
		<div class="cont_btn" :class="{fold_inner : !listLayout1}">
			<ul class="btn_left">
				<li><a @click="reset('o')">초기화</a></li>
			</ul>
			<ul class="btn_right">
				<li class="btn_bl"><a @click="goSave('next')">저장&다음</a></li>
				<li class="btn_bl"><a @click="goSave('fromButton')">저장</a></li>
			</ul>
		</div>
	</div>
</template>
<script>
	import store from '../../../store'
	import {mapState, mapGetters, mapActions, mapMutations} from 'vuex'

	export default {
		props: ['evalManualSetting', 'configEval'],
		data() {
			return{
				selEval1: '',
				selEval2: [],
				oriEval1: '',
				news_id: '',
				subInfo: '',
				isEvalChange : false,
				isEval1Change: false,
				isEval2Change: false,

				autoEval2List: [],

				autoMediaImportance: [],
				mediaImportanceNotUse : [],
				mediaImportanceUse : [],
				autoLocation: [],
				autoReporter: [],
				autoLetterCnt: [],
				autoSize:[],

				sizeArray:[],
				letterCntArray: [],

				schEval1: '',
				focusIndex: 0,
				isFocus: false,

				showArticleInformation : true,
				showEval1: true,
				showEval2: true,
				articlesCnt: 0,
				notAutoCateSeq: [],
				autoCateSeq: [],
				cateSeq:[],

				normalReporterSeq : null,


				tempEvalShow : true,
				evalLayout: 0,
				inputMajor : "",
				inputMiddle : "",
				inputMinor : "",
				eval1Object : {'eval1_name': null, 'eval1_seq': null, 'eval1_upper': null},
				fetchEval1Major:[],
				fetchEval1Middle: [],
				fetchEval1Minor: [],

				//평가1 항목 검색
				fetchSearchData:[],

				visibleEvalList: [], // 자동|평가1|평가2 표시사용여부

				/* 원본 데이터를 저장하기 위한 변수 */
				originArticle: null
			}
		},
		computed: {
			...mapState([
				'newsGroup',
				'selectedArticle',
				'getArticleListFromSearchParams',
				'searchEvalInfo',
				'searchFormSeen',
				'articleList',
				'expandArticleList',
				'getArticleListSource',
				'getArticleListFromHeaderPayload',
				'evalInfo',
				'newsIdList',
				'loadingGif',
				'showDoEvalMulti',
				'showPopCalender', 'listLayout0', 'listLayout1', 'listLayout2']),
			...mapGetters([
				'getEval1Category',
				'getEval2Class',
				'getEvalInfo',
				'getEval1ByCategory',
				'getConfigEval'
			]),
			showEvalScoreChanged() {
				let _es = this.selectedArticle.eval_score || 0.01;
				let _esd = this.selectedArticle.eval_score_db || 0.01;
				let diff = Math.abs(_es) / Math.abs(_esd);
				return (diff < 1.05 && diff > 0.95) ? '' : ' → ' + this.divKiloAddCommaFunc(this.selectedArticle.eval_score);
			},
			cntGroup() {
				let cntGroup = [];
				cntGroup['nowArt'] = 0;
				cntGroup['cnt'] = 0;
				let list = this.articleList;
				for (let newsGroup in list) {
					for (let folder in list[newsGroup]) {
						for (let one in list[newsGroup][folder]) {
							cntGroup['cnt']++;
							if(this.selectedArticle) {
								if (list[newsGroup][folder][one].news_id === this.selectedArticle.news_id) cntGroup['nowArt'] = cntGroup['cnt'];
							}
						}

					}
				}
				return cntGroup;
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
			},
		},
		watch: {
			/* 선택된 기사의 eval값 가져오는 */
			selectedArticle(article) {
				if (!this.originArticle || typeof article == "object"
					&& article.article_serial != this.originArticle.article_serial)
					this.originArticle = JSON.parse(JSON.stringify(article));
				this.getEvalValue();
			},
			showDoEvalMulti(newVal){
				if(newVal) this.removeKeyup(); else this.addKeyup();
			},
			searchFormSeen(newVal){
				if(newVal)this.removeKeyup(); else this.addKeyup();
			},
			getEval2Class () {
				this.eval2Cate();
			},
			showPopCalender(newVal) {
				if(newVal) this.removeKeyup(); else this.addKeyup();
			},
		},
		created() {
			this.$eventBus.$on("toDoEvalFromPreview", (flag) => {
				this.goSave(flag);
			});
			this.$eventBus.$on("closeMultiEvalToDoEval", () => {this.getEvalValue()});
			this.$eventBus.$on("removeDoEvalKeyup", () => {this.removeKeyup()});
			this.$eventBus.$on("addDoEvalKeyup", ()=> {this.addKeyup()});
			this.$eventBus.$on("layoutChangeToEval", ()=> {this.getEvalValue();});
		},
		beforeMount(){
			this.addKeyup();
		},
		beforeDestroy(){
			this.removeKeyup();
			this.$eventBus.$off("toDoEvalFromPreview");
			this.$eventBus.$off("closeMultiEvalToDoEval");
			this.$eventBus.$off("removeDoEvalKeyup");
			this.$eventBus.$off("addDoEvalKeyup");
			this.$eventBus.$off("layoutChangeToEval");
		},

		async mounted() {
			await this.getEval1CategoryAPI();
			this.getEval2ClassAPI();
			let tmp = {};
			this.getEval2Class.forEach(function(e) {
				tmp[e.upper_cate_seq] = (e.upper_cate_use == 'Y') ? true : false;
			});
			this.visibleEvalList = tmp;
			this.fetchEval1Major = this.getEval1ByCategory.major;
			const display = await this.getLayoutSettingAPI();
			this.evalLayout = Number(display.layout);
			this.getNormalReporterSeq();
			this.eval2Cate();
			this.fetchSearchData = this.getEval1SearchList();
		},

		methods: {
			...mapMutations([
				'SET_SELECTED_ARTICLE',
				'SET_GET_ARTICLE_LIST_FROM_SEARCH_PARAMS',
				'SET_GET_ARTICLE_LIST_FROM_HEADER_PAYLOAD',
				'SET_LOADING_GIF', 'SET_EVAL_INFO'
			]),
			...mapActions([
				'getEval1CategoryAPI',
				'getLayoutSettingAPI',
				'inExcludeEvalAPI',
				'getEval2ClassAPI',
				'toggleListLayout'
			]),
			//기사 좌,우 키보드로 이전기사, 다음기사 이동을 위한 키보드 이벤트 추가
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
						e.stopPropagation(); this.goSave('pre'); break;
					case 39 :
						e.preventDefault ? e.preventDefault() : e.returnValue=false;
						e.stopPropagation();this.goSave('next'); break;
				}
			},
			/**
			 *
			 * @param seq
			 * 평가항목1에 TAB 포커스 했을 시 스페이스바 PRESS로 해당항목 선택
			 */
			pressSpace(seq, subLength){
				if(subLength === 0) {
					const subject = document.querySelector('input[id=do_eval1' + seq + ']');
					if (subject.attributes.wasChecked.value === 'true') {
						subject.attributes.wasChecked.value = 'false';
						this.selEval1 = null;
					} else {
						subject.attributes.wasChecked.value = 'true';
						this.selEval1 = seq;
					}
					const eval1CateList = document.querySelectorAll('input[name=eval1]');
					if (window.NodeList && !NodeList.prototype.forEach) {
						NodeList.prototype.forEach = Array.prototype.forEach;
					}
					eval1CateList.forEach(one => {
						if (one.attributes.id.value !== subject.id) {
							one.attributes.wasChecked.value = 'false';
						}
					});
					this.eval1Change();
					this.selectedArticle.eval_score = this.calcArticleValue(this.selectedArticle);
				}
			},
			/**
			 *
			 * @param upper
			 * @param seq
			 * 평가항목2에 TAB 포커스 했을 시 스페이스바 PRESS로 해당항목 선택
			 */
			pressSpace2(upper,seq){
				const subject = document.querySelector('input[id=do_eval2'+seq+']');
				if(subject.attributes.wasChecked.value === 'true') {
					subject.attributes.wasChecked.value = 'false';
					this.$set(this.selEval2, upper, null);
				}else {
					subject.attributes.wasChecked.value = 'true';
					this.$set(this.selEval2, upper, seq);
				}
				let eval1CateList = document.querySelectorAll('input[name=do_eval2' + upper +']');
				if (window.NodeList && !NodeList.prototype.forEach) {
					NodeList.prototype.forEach = Array.prototype.forEach;
				}
				eval1CateList.forEach( one => {
					if(one.attributes.id.value !== ('do_eval2'+seq))
						one.attributes.wasChecked.value = 'false';
				});
				this.eval2Change();
				this.selectedArticle.eval_score = this.calcArticleValue(this.selectedArticle);
			},
			eval1SearchTextEnter(e) {
				this.eval1Search(e.target.id);
			},
			eval1Search(id) {
				let searchInput, option, options = this.fetchSearchData;
				searchInput = document.querySelector('#' + id);
				if (searchInput.value.trim() !== '') {
					for (let i = 0; i < options.length; i++) {
						option = options[i];
						if (option.name === searchInput.value.trim()) {
							this.goSearch(option); break;
						}
					}
				}
			},
			eval1Combo(e, category) {
    			let middle = document.querySelector('#eval1-combo-2');
    			let minor = document.querySelector('#eval1-combo-3'); 
    			switch(category) {
					case "major" :
						this.selEval1 = e.target.value;
						this.inputMajor = e.target.value;
						if(this.getEval1ByCategory.all[this.selEval1]) {
							var eval1 = this.getEval1ByCategory.all[this.selEval1];
							this.fetchEval1Middle = eval1.sub;
							this.fetchEval1Minor = [];
							middle.focus();
						}else{
						    this.fetchEval1Middle = [];
						    this.fetchEval1Minor = [];
						}
						break;
    				case "middle" :
						this.selEval1 = e.target.value;
                        this.inputMiddle = e.target.value;
						if(this.getEval1ByCategory.all[this.selEval1]) {
							var eval1 = this.getEval1ByCategory.all[this.selEval1];
							this.fetchEval1Minor =eval1.sub;
//                           minor.focus();
						}else{
                            this.fetchEval1Minor = [];
                        }
						break;
					case "minor" :
					    this.selEval1 = e.target.value;
                        this.inputMinor = e.target.value;
                        break;
					default: break;
				}
				this.eval1Change();
				this.selectedArticle.eval_score = this.calcArticleValue(this.selectedArticle);
				return false;
			},
			eval2Combo(e,upper_seq){
				let select = e.target;
                this.selEval2[upper_seq] = select.value;
                this.eval2Change();
				this.selectedArticle.eval_score = this.calcArticleValue(this.selectedArticle);
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
			//자동평가 항목 관련 데이터 저장
			eval2Cate(){
				this.autoEval2List= [];
				this.autoCateSeq =[];
				this.cateSeq =[];
				this.notAutoCateSeq =[];
				if(this.getEval2Class !== '' && this.getEval2Class !== []) {
					this.getEval2Class.forEach(item => {
						if (item.auto === 'Y' && item.upper_cate_use === 'Y') {
							this.autoEval2List.push(item);
							if (item.upper_cate_name === '매체 중요도') {
								this.autoMediaImportance = item;
								item.sub.forEach(sub => {
									if(sub.use === "Y") this.mediaImportanceUse.push(sub.seq);
									else this.mediaImportanceNotUse.push(sub.seq);
								});
							} else if (item.upper_cate_name === '출입기자') {
								this.autoReporter = item;
							} else if (item.upper_cate_name === '크기') {
								this.autoSize = item;
								let i = 0;
								item.sub.forEach(subitem => {
									if(subitem.use === 'Y') {
										this.sizeArray[i] = [];
										this.sizeArray[i]['refValue'] = subitem.refValue;
										this.sizeArray[i]['seq'] = subitem.seq;
										i++;
									}
								});
								this.sizeArray.sort((a, b) => {
									if(Number(a.refValue) - Number(b.refValue) === 0) return Number(b.seq) - Number(a.seq);
									else return Number(a.refValue) - Number(b.refValue);
								});
							} else if (item.upper_cate_name === '글자수') {
								this.autoLetterCnt = item;
								let i = 0;
								item.sub.forEach(subitem => {
									if(subitem.use === 'Y') {
										this.letterCntArray[i] = [];
										this.letterCntArray[i]['refValue'] = subitem.refValue;
										this.letterCntArray[i]['seq'] = subitem.seq;
										i++;
									}
								});
								this.letterCntArray.sort((a, b) => {
									if(Number(a.refValue) - Number(b.refValue) === 0) return Number(b.seq) - Number(a.seq);
									else return Number(a.refValue) - Number(b.refValue);
								});
							} else if (item.upper_cate_name === '수록지면') this.autoLocation = item;
							this.autoCateSeq.push(item.upper_cate_seq);
						} else if( item.upper_cate_use === 'Y') {
							this.notAutoCateSeq.push(item.upper_cate_seq);
						}
						this.cateSeq.push(item.upper_cate_seq);
					});
				}
			},
			//일반기자 seq 가져오기
			async getNormalReporterSeq(){
				let ssdo = store.state.hiddenLink1;
				await this.$axios.get(ssdo + '/normalReporterSeq.php').then(r=> {
					this.normalReporterSeq = String(r.data);
				}).catch(e=>console.log(e));
			},
			//선택된 기사가 바뀔때마다 해당 기사의 평가정보 설정
			async getEvalValue(resetArticle) {
				if (this.selectedArticle && resetArticle 
					&& resetArticle.article_serial == this.selectedArticle.article_serial) {
					this.SET_SELECTED_ARTICLE(resetArticle);
				}
				this.isEvalChange=false;
				this.isEval1Change=false;
				this.isEval2Change=false;
				await this.eval1InfoReset();
				this.cateSeq.forEach(seq=>{
					this.$set(this.selEval2, seq, null);
					if(document.querySelector('#eval2-combo-'+seq)){
						document.querySelector('#eval2-combo-'+seq).value = "";
					}
				});
				const selArticle = this.selectedArticle;
				if (selArticle) {
					const news_id = selArticle.news_id;
					//라디오버튼일때 각 항목의 wasChecked false 로 바꿔줌
					if(this.evalLayout===1) {
						const eval1CateList = document.querySelectorAll('input[name=eval1]');
						if (window.NodeList && !NodeList.prototype.forEach) NodeList.prototype.forEach = Array.prototype.forEach;
						eval1CateList.forEach(one => {one.attributes.wasChecked.value = 'false';});
					}
					//평가 정보 있을 때
					if(this.getEvalInfo[news_id]) {
						//평가1 정보
						const eval1 = this.getEvalInfo[news_id].eval1;  //소항목이 있는지 가져온다.
						if (eval1 && eval1.eval1_seq) {
							this.selEval1 = eval1.eval1_seq;
							//평가1 라디오버튼 일때
							if(this.evalLayout===1) {
								const subject = document.querySelector('input[id=do_eval1' + eval1.eval1_seq + ']');
								subject.attributes.wasChecked.value = 'true';
							} else {
								//평가1 콤보박스 일때 넣어주기
								let majorDOM = document.querySelector('#eval1-combo-1');
								let middleDOM = document.querySelector('#eval1-combo-2');
								let minorDOM = document.querySelector('#eval1-combo-3');
								const doms = [majorDOM, middleDOM, minorDOM];
								const values = [];
								let sEval1 = eval1;
								while(true){
								    values.push(sEval1.eval1_seq);
								    if(sEval1.eval1_upper == null) break;
										if(!this.getEval1ByCategory.all[sEval1.eval1_upper]) {
											values.length = 0;
											break;
										}
								    sEval1 = this.getEval1ByCategory.all[sEval1.eval1_upper];
								}
								values.reverse();
								values.forEach(function(value, index){
								    doms[index].value = value;
								})

								switch(values.length) {
									case 3:
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
										case 1:
											this.inputMajor = values[0];
											this.fetchEval1Middle = this.getEval1ByCategory.all[values[0]].sub;
											this.fetchEval1Minor = [];
											break;
										default:
											this.inputMajor = "";
											this.inputMiddle = "";
											this.inputMinor = "";
								}
							}
						}else{
                            this.fetchEval1Middle = [];
                            this.fetchEval1Minor = [];
                        }
						if (this.getEvalInfo[news_id].eval2Value !== null) {
							let eval2Value = this.getEvalInfo[news_id]['eval2Value'];
							for (const index in eval2Value) {
								if (eval2Value[index]) this.selEval2[index] = String(eval2Value[index].eval2_seq);
								if (this.evalLayout == 0){
									if(document.querySelector('#eval2-combo-'+index)){
										document.querySelector('#eval2-combo-'+index).value = eval2Value[index].eval2_seq;
									}
								}
							}
						}
					}
					let autoClass = Object.keys(this.autoEval2List).map(e=>this.autoEval2List[e]);
					const letterCnt = selArticle.article_length;
					let size = String(selArticle.article_size);
					let location = null;
					if(selArticle.article_page !== null && selArticle.article_page !== "기타") location = selArticle.article_page;

					autoClass.forEach(async item => {
						if(item.upper_cate_use === 'Y') {
							if (item.upper_cate_name === "매체 중요도") {
								if (selArticle.mediaAuto !== null) {
									//자동값 갱신되었을 때 다시 넣어줌
									if (selArticle.mediaAuto !== this.selEval2[item.upper_cate_seq]) {
										//this.$set(this.selEval2, item.upper_cate_seq, selArticle.mediaAuto);
										this.eval2Change();
									}
								} else {
									this.$set(this.selEval2, item.upper_cate_seq, null);
								}
							} else if (item.upper_cate_name === "수록지면") {
								if (location !== null) {
									let etcSeq = '';
									item.sub.forEach(sub => {
										if (sub.name === String(location)) {
											if (sub.seq !== this.selEval2[item.upper_cate_seq]) {
												//this.$set(this.selEval2, item.upper_cate_seq, sub.seq);
												this.eval2Change();
											}
										}
										if (sub.name === '기타') etcSeq = sub.seq;
									});
									if (this.selEval2[item.upper_cate_seq] === null) {
										//this.$set(this.selEval2, item.upper_cate_seq, etcSeq);
										this.eval2Change();
									}
								} else {
									if (this.selEval2[item.upper_cate_seq] !== null) {
										//this.$set(this.selEval2, item.upper_cate_seq, null);
										this.eval2Change();
									}
								}
							} else if (item.upper_cate_name === "출입기자") {
								if (selArticle.reporterAuto !== null) {
									//자동값 갱신되었을 때 다시 넣어줌
									if (selArticle.reporterAuto !== this.selEval2[item.upper_cate_seq]) {
										//this.$set(this.selEval2, item.upper_cate_seq, selArticle.reporterAuto);
										this.eval2Change();
									}
								} else {
									//일반기자 seq가 selEva2에 안들어가 있을때
									if (this.normalReporterSeq !== this.selEval2[item.upper_cate_seq]) {
										//this.$set(this.selEval2, item.upper_cate_seq, this.normalReporterSeq);
										this.eval2Change();
									}
								}
							} else if (item.upper_cate_name === "크기") {
								if (size) {
									let seq = null;
									size = size.replace("㎠", "");
									size = Number(size);
									this.sizeArray.forEach((val) => {
										//자동평가값 기준 평가값 재할당
										if (size >= val.refValue) seq = val.seq;
									});
									if (seq !== this.selEval2[item.upper_cate_seq]) {
										//this.$set(this.selEval2, item.upper_cate_seq, seq);
										this.eval2Change();
									}
								}
							} else if (item.upper_cate_name === "글자수") {
								let seq = null;
								this.letterCntArray.forEach(val => {
									if (letterCnt >= val.refValue) seq = val.seq;
								});
								if (seq !== this.selEval2[item.upper_cate_seq]) {
									//this.$set(this.selEval2, item.upper_cate_seq, seq);
									this.eval2Change();
								}
							}
						}
					});

					this.selectedArticle.eval_score = this.calcArticleValue(this.selectedArticle);
				}
			},
			//평가항목1,2 초기화
			reset(type) {
				if (type == undefined || type == null
					|| !this.originArticle 
					|| !this.originArticle.eval2) return ;
				if (type === "o") {
					this.getEvalValue(this.originArticle);
				} else if (type === "n") {
					this.autoEvalInfoReset();
					this.eval2InfoReset();
					this.eval1Change();
					this.eval2Change();
					this.eval1InfoReset();
					this.fetchEval1Middle = [];
					this.fetchEval1Minor = [];
				}
			},
			autoEvalInfoReset() {
				const that = this;
				[this.autoSize.upper_cate_seq
				, this.autoLetterCnt.upper_cate_seq
				, this.autoMediaImportance.upper_cate_seq
				, this.autoReporter.upper_cate_seq
				, this.autoLocation.upper_cate_seq].forEach(e => {
					that.selEval2[e] = null;
				});
			},
			/* 기존 평가1 데이터 -> 원본 평가1 데이터 변경*/
			eval1InfoReset(){
				document.querySelector("#sch_eval1_text").value = "";
				this.selEval1 = null;
				if(this.evalLayout===0) {
					document.querySelector('#eval1-combo-1').value = "";
					document.querySelector('#eval1-combo-2').value = "";
					document.querySelector('#eval1-combo-3').value = "";
					this.inputMajor = null;
					this.inputMiddle = null;
					this.inputMinor = null;
					this.fetchEval1Major = this.getEval1ByCategory.major;
					this.fetchEval1Middle = this.getEval1ByCategory.middle;
					this.fetchEval1Minor = this.getEval1ByCategory.minor;
				}
			},
			/* 기존 평가2 데이터 -> 원본 평가2 데이터 변경*/
			eval2InfoReset() {
				this.notAutoCateSeq.forEach(seq=>{
					let tag = document.querySelector('#eval2-combo-'+seq);
					if (!tag) return;
					this.$set(this.selEval2, seq, null);
					tag.value = ""
				});
			},

			//평가 저장
			async goSave(flag) {
				if (!await this.$store.dispatch('loginCheckGentleAPI')) {
					this.$eventBus.$emit('kickOut');
					return false;
				}
				if (document.activeElement && document.activeElement.getAttribute('id') === 'sch_eval1_text') {
					return;
				}
				const selArticle = this.selectedArticle;
				if (selArticle !== null && selArticle !== "") {
					if (this.isEvalChange) {
						selArticle.eval_score = this.calcArticleValue(selArticle);
						selArticle.eval_score_db = selArticle.eval_score;
						if(this.evalLayout===0) {
							if (this.inputMajor) {
								if (this.fetchEval1Middle.length > 0) {
									if (!this.inputMiddle) {
										alert('평가1 항목의 중항목을 선택해 주세요.');
										document.getElementById('eval1-combo-2').focus();
										return true;
									} else if (this.fetchEval1Minor.length > 0 && !this.inputMinor) {
										alert('평가1 항목의 소항목을 선택해 주세요');
										document.getElementById('eval1-combo-3').focus();
										return true;
									}
								}
							}
						}
						let news_id = selArticle.news_id;
						let eval2Arr = [];
						let selEval2 = this.selEval2;
						let newEvalInfo = [];
						let tmpSelEval2Seq = 0;
						let tmpInput;
						newEvalInfo["eval1"]  = this.selEval1 === null ? this.eval1Object : this.selEval1 === '' ? this.eval1Object : this.getEval1ByCategory.all[this.selEval1];
						newEvalInfo["eval2Cnt"] = 0;
						newEvalInfo['eval2atCnt'] = 0;
						newEvalInfo['eval2m2Cnt'] = 0;
						newEvalInfo['eval2m2CntMax'] = this.evalInfo[news_id]['eval2m2CntMax'];
						newEvalInfo["eval2Value"] = [];
						Object.keys(selEval2).forEach(seq => {
							tmpSelEval2Seq = parseInt(selEval2[seq]);
							if(!isNaN(tmpSelEval2Seq)) {
								newEvalInfo['eval2Cnt']++;
								if (this.evalLayout === 0) {
									tmpInput = document.querySelector('#eval2-combo-' + seq);
								} else if (this.evalLayout === 1) {
									tmpInput = document.querySelector('#do_eval2' + tmpSelEval2Seq);
								}
								if (tmpInput) {
									newEvalInfo['eval2Value'][seq] = {'eval2_seq': tmpSelEval2Seq, 'eval2_name': tmpInput.value};
									newEvalInfo['eval2m2Cnt']++;
								} else {
									newEvalInfo['eval2Value'][seq] = {'eval2_seq': tmpSelEval2Seq, 'eval2_name': '자동평가항목'};
									newEvalInfo['eval2atCnt']++;
								}
								eval2Arr.push(tmpSelEval2Seq);
							}
						});
						let params = new FormData();
						params.append("eval1", this.selEval1);
						params.append("eval1Change", this.isEval1Change);
						params.append("eval2", eval2Arr.join(","));
						params.append("eval2Change", this.isEval2Change);
						params.append("news_id", news_id);
						let ssdo = store.state.hiddenLink1;
						await this.$axios.post(ssdo + "/saveEval.php", params).then(r=>console.log(r.data)).catch(e => console.log(e));
						this.$set(this.evalInfo, news_id, Object.assign({}, newEvalInfo));
						if(this.searchEvalInfo[news_id]){
							this.$set(this.searchEvalInfo, news_id, newEvalInfo);
						}

						this.isEval1Change = false;
						this.isEval2Change = false;
						this.isEvalChange = false;
					}
				}
				if (flag === "pre") this.preArticle();
				else if (flag === "next") this.nextArticle();
			},
			multiplyRealNumbers(num1, num2, digit = 3) {
				let num1p = Number(num1);
					if (isNaN(num1p)) num1p = 0;
				let num2p = Number(num2);
					if (isNaN(num2p)) num2p = 0;
				let multiplier = Math.pow(10, digit);
				return (Math.round(num1p * multiplier) * Math.round(num2p * multiplier)) / (multiplier * multiplier);
			},
			calcArticleValue(selArticle) {
				if (!selArticle) return 0;
				else if(Object.keys(this.configEval).length === 0) return selArticle.eval_score_db;
				let tmpResultEval = {}, configEval = this.configEval;
				tmpResultEval.article_size = parseFloat(selArticle.article_size_own);
				tmpResultEval.article_ratio = parseFloat(selArticle.article_size_pixel_ratio);
				tmpResultEval.eval_policy =  configEval['policy']['MD']['EVAL_VALUE_TYPE']['value'];
				if (parseInt(tmpResultEval.eval_policy) === 0) { // 0:전체(all)
					tmpResultEval.media_value = configEval['policy']['SV']['value'];
				} else if (parseInt(tmpResultEval.eval_policy) === 1) { // 1:유형(type)
					tmpResultEval.media_value = configEval['type'][selArticle.media_type]['evalValue'];
				} else if (parseInt(tmpResultEval.eval_policy) === 2) { // 2:매체별(media)
					tmpResultEval.media_value = parseInt(selArticle.media_value);
				} else if (parseInt(tmpResultEval.eval_policy) === 3) { // 3:분류별(category)
					tmpResultEval.media_value = configEval['category'][selArticle.media_category]['category_eval_value'];
				} else {
					return selArticle.eval_score_db;
				}

				tmpResultEval.excluded = (Number(selArticle.news_comment) > 0);
				tmpResultEval.applySize = (configEval['policy']['SZ']['value'] === 'Y');
				tmpResultEval.applyRatio = (configEval['policy']['RT']['value'] === 'Y');
				tmpResultEval.sizeOnline = (this.$as(configEval, 'policy', 'SO', 'value', 'N') === 'Y');
				tmpResultEval.ratioOnline = (configEval['policy']['RO']['value'] === 'Y');
				tmpResultEval.evalInfo = this.evalInfo[selArticle.news_id];
				tmpResultEval.selEval2 = this.selEval2;
				tmpResultEval.eval_score_org = tmpResultEval.excluded ? 0 : tmpResultEval.media_value;
				if (tmpResultEval.applySize && (selArticle.part_name === '' || tmpResultEval.sizeOnline)) {
					tmpResultEval.eval_score_org *= tmpResultEval.article_size;
				}
				if (tmpResultEval.applyRatio && (selArticle.part_name === '' || tmpResultEval.ratioOnline)) {
					tmpResultEval.eval_score_org *= tmpResultEval.article_ratio;
				}
				tmpResultEval.eval_score_org *= configEval['policy']['CV']['value'];
				tmpResultEval.eval1_seq = this.selEval1;

				let tmpEval2Seqs = [], tmpEval2Vals = [], tmpEval2Val, tmpCfgEv1, tmpCfgEv2, tmpEval1Total = 1, tmpEval2Total = 1, tmpEvalScoreMulti;
				let tmpEvalAutoSeqs = [], tmpEvalAutoVals = [], tmpEvalAutoVal, tmpCfgEvAt;

				tmpCfgEv1 = configEval['item']['M1'][tmpResultEval.eval1_seq];
				if (tmpCfgEv1 && tmpCfgEv1['group_isEval'] === 'Y' && tmpResultEval.eval1_seq) {
					tmpEval1Total = tmpCfgEv1['score'];
				} else {
					tmpEval1Total = 1;
				}

				if (configEval['policy']['US']['M2']['value'] === 'Y') {
					if (tmpResultEval.selEval2) {
						for (let [k,v] of Object.entries(this.selEval2)) {
							if (k > 1000 && v) {
								tmpCfgEv2 = configEval['item']['AT_M2'][v];
								if (tmpCfgEv2) {
									tmpEval2Seqs.push(v);
									if (tmpCfgEv2['group_isEval'] === 'Y') {
										tmpEval2Val = parseFloat(tmpCfgEv2['score']);
									} else {
										tmpEval2Val = 1;
									}
									tmpEval2Vals.push(tmpEval2Val);
									tmpEval2Total *= tmpEval2Val;
								}
							} else if (k < 1000 && v) {
								tmpCfgEvAt = configEval['item']['AT_M2'][v];
								if (tmpCfgEvAt) {
									tmpEvalAutoSeqs.push(v);
									if (tmpCfgEvAt['group_isEval'] === 'Y') {
										tmpEvalAutoVal = parseFloat(tmpCfgEvAt['score']);
									} else {
										tmpEvalAutoVal = 1;
									}
									tmpEvalAutoVals.push(tmpEvalAutoVal);
									tmpEval2Total *= tmpEvalAutoVal; // Manual2 += Auto
								}
							}
						}
					}
				} else {
					tmpEval2Total = 1;
				}

				tmpResultEval.policy_conjunction = parseInt(configEval['policy']['MD']['EVAL_CALC_TYPE']['value']);
				if (tmpResultEval.policy_conjunction === 1) { // 1 평균
					tmpEvalScoreMulti = (tmpEval1Total + tmpEval2Total) / 2;
				} else if (tmpResultEval.policy_conjunction === 2) { // 2 곱
					tmpEvalScoreMulti = tmpEval1Total * tmpEval2Total;
				} else {
					tmpEvalScoreMulti = 0;
				}
				tmpResultEval.eval_score = this.multiplyRealNumbers(tmpResultEval.eval_score_org, tmpEvalScoreMulti);

				Object.keys(selArticle).forEach(k => {
					if (k.includes('ev2_') || k.includes('eva_')) {
						selArticle[k] = null;
					}
				});
				tmpEval2Seqs.forEach(v => {
					tmpCfgEv2 = configEval['item']['AT_M2'][v];
					selArticle['ev2_' + tmpCfgEv2['group_seq']] = tmpCfgEv2['value'];
				});
				tmpEvalAutoSeqs.forEach(v => {
					tmpCfgEvAt = configEval['item']['AT_M2'][v];
					selArticle['eva_' + tmpCfgEvAt['group_seq']] = tmpCfgEvAt['value'];
				});

				tmpResultEval.eval1_seqs = this.getEval1NamesArray(this.selEval1);
				selArticle.ev1_big = tmpResultEval.eval1_seqs[0] ? tmpResultEval.eval1_seqs[0] : '';
				selArticle.ev1_mid = tmpResultEval.eval1_seqs[1] ? tmpResultEval.eval1_seqs[1] : '';
				selArticle.ev1_sml = tmpResultEval.eval1_seqs[2] ? tmpResultEval.eval1_seqs[2] : '';

				return Math.trunc(tmpResultEval.eval_score);
			},
			getEval1NamesArray(ev1Seq) {
				let rtn = [], tmpObj = this.configEval['item']['M1'][ev1Seq];
				while (tmpObj) {
					rtn.push(tmpObj['value']);
					if (!tmpObj['group_seq']) break;
					tmpObj = this.configEval['item']['M1'][tmpObj['group_seq']];
				}
				return rtn.reverse();
			},
			//이전기사
			preArticle() {
				let list = this.articleList;
				let newsIdList = this.newsIdList;
				let pre_news_id = "0";
				let newsIdListLastIndex = String(newsIdList.length - 1);
				for (let key in newsIdList) {
					if (newsIdList[key] === this.selectedArticle.news_id) {
						if (key === "0") {
							pre_news_id = newsIdList[newsIdListLastIndex];
							break;
						} else {
							pre_news_id = newsIdList[key - 1];
							break;
						}
					}
				}
				outer: for (let newsGroup in list) {
					for (let folder in list[newsGroup]) {//신문, 방송..
						for (let one in list[newsGroup][folder]) {//기사하나하나
							if (list[newsGroup][folder][one].news_id === pre_news_id) {
								this.SET_SELECTED_ARTICLE(list[newsGroup][folder][one]);
								break outer;
							}
						}
					}
				}
			},
			//다음기사
			nextArticle() {
				let list = this.articleList;
				let newsIdList = this.newsIdList;
				let next_news_id = "0";
				if(newsIdList.length>0) {
					let newsIdListLastIndex = String(newsIdList.length - 1);
					if (newsIdListLastIndex === "-1") return true;
					for (let key in newsIdList) {
						if (newsIdList[key] === this.selectedArticle.news_id) {
							if (key === newsIdListLastIndex) {
								next_news_id = newsIdList[0];
							} else {
								let nextIdx = Number(key) + 1;
								next_news_id = newsIdList[nextIdx];
							}
							break;
						}
					}
				}
				outer: for (let newsGroup in list) {
					for (let folder in list[newsGroup]) {//신문, 방송..
						for (let one in list[newsGroup][folder]) {//기사하나하나
							if (list[newsGroup][folder][one].news_id === next_news_id) {
								this.SET_SELECTED_ARTICLE(list[newsGroup][folder][one]);
								break outer;
							}
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
			//평가 제외 및 평가제외 해제 이벤트
			async inExcludeEval(e) {
				let params = new FormData();
				let flag = null;
				params.append('news_id', this.selectedArticle.news_id);
				if (e.target.checked) {
					params.append('flag', 'ex');
					flag = '1';
				}else {
					params.append('flag','in');
					flag = '0';
				}
				let update_result = {'update_count' : 0};
				update_result = await this.inExcludeEvalAPI(params);
				if(update_result['update_count'] >0 ) this.$set(this.selectedArticle, 'news_comment', flag);
				this.isEvalChange = true;
				this.goSave();
			},
			//평가항목 검색 리스트
			getEval1SearchList() {
				let reverse = this.$browserDetect.isIE || this.$browserDetect.isFirefox;
				const list = this.getEval1Category;
				let eval1List = [], tmpAval, tmpBval, tmpCval;
				for (let valA of list) {
					tmpAval = reverse ? (valA.name + '(대)') : ('(대)' + valA.name);
					eval1List.push({'seq': valA.seq, 'name': tmpAval, 'upperSeq': valA.upperSeq, 'flag': 'major'});
					if (valA.sub !== null) {
						for (let valB of valA.sub) {
							tmpBval = reverse ? (valB.name + '(중)') : ('(중)' + valB.name);
							eval1List.push({'seq': valB.seq, 'name': tmpBval, 'upperSeq': valB.upperSeq, 'flag': 'middle'});
							if (valB.sub !== null) {
								for (let valC of valB.sub) {
									tmpCval = reverse ? (valC.name + '(소)') : ('(소)' + valC.name);
									eval1List.push({'seq': valC.seq, 'name': tmpCval, 'upperSeq': valC.upperSeq, 'flag': 'minor'});
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
				    await this.eval1InfoReset();
					const selData = this.getEval1ByCategory.all[seq];
					let major,minor,middle;
					major = document.querySelector('#eval1-combo-1');
					middle = document.querySelector('#eval1-combo-2');
					minor = document.querySelector('#eval1-combo-3');
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
					document.querySelector("[id=do_eval1_focus" + seq + "]").scrollIntoView(false);
                }
			},
			divKiloAddCommaFunc(value) {
				if (Number(value) === value) {
					var num = new Number(value);
					if (num === 0) {
						return '0';
					} else {
						var tmpVal = Math.trunc(num) / 1000;
						if (tmpVal === 0) {
							return '0';
						} else {
							return String(tmpVal).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' (천원)';
						}
					}
				} else {
					return ' ';
				}
			}
		},
	}
</script>
<style scoped>
	.sch_eval1_list { top:29px; right:5px; width:130px;position: absolute; background-color:white; border:1px solid #ccc; border-radius:1px; padding:1px; display:none; max-height:250px; overflow:auto; z-index:11}
	.show {display: block;}
	.sch_eval1_list .item {padding: 3px; cursor: pointer;}
	.selected {background-color: #5ca5e6; color:white;}
	.ellipsis {text-overflow:ellipsis; white-space:nowrap; overflow:hidden}
	.veiled {display:none;}
	.cont_tit a {
		display: block;
    float: left;
    width: 28px;
    height: 38px;
    background: url(/img/ico_pre.467a0115.png) 0 -102px no-repeat;
    text-indent: -9999px;
	}
	.fold_inner {
		height: 1px !important;
		overflow: hidden !important;
		width: 1px !important;
	}
</style>
