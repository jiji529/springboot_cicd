<template>
	<div class="list_wrap">
		<div class="cont_tit">다중 평가 목록</div>
		<div class="list" id="multiList">
			<div class="list_tit">
				<input type="checkbox" id="multiAllCheck" :checked="multiIsAll()" @change="allCheck($event, multiEvalArticleList)" />
				<label for="multiAllCheck"><div class="li_chk"><span></span></div><div class="li_tit">기사제목</div></label>
				<ul class="list_rt" :class="evalManualSetting.cssClassName">
					<li class="li_media">매체명</li>
					<li class="li_val" :class="{veiled : !evalManualSetting['M1']}">평가1</li>
					<li class="li_val" :class="{veiled : !evalManualSetting['M2']}">평가2</li>
				</ul>
			</div>
			<!--기사 -->
			<ul class="list_ul">
				<div v-for=" (one , index) in multiEvalArticleList" :key="index" >
					<li class="list_li"  :class="{ on : one.news_id === news_id_local }">
						<div class="li_chk">
							<input type="checkbox" :value="one" :id="'multi_art_checkbox'+one.news_id"  v-model="selArticles" />
							<label :for="'multi_art_checkbox'+one.news_id"><span></span>
							</label>
						</div>
						<div class="li_tit" :class="evalManualSetting.cssClassName" @click="oneSelect(one)">
							<span class="ico li1" v-if="one.part_name === '' && one.news_comment !== '1'"></span><!-- 지면-->
							<span class="ico li2" v-if="one.part_name === '' && one.news_comment === '1'"></span><!-- 지면&평가제외-->
							<span class="ico li3" v-if="one.part_name !== '' && one.news_comment !== '1'"></span><!-- 온라인-->
							<span class="ico li4" v-if="one.part_name !== '' && one.news_comment === '1'"></span><!-- 온라인&평가제외-->
							<span :class="{ red : one.news_comment === '1' }">{{one.article_title}}</span>
						</div>
						<ul class="list_rt" :class="evalManualSetting.cssClassName" v-if="!searchFormSeen" @click="oneSelect(one)">
							<li class="li_media" :class="{ red : one.news_comment === '1'  }">{{one.media_name}}</li>
							<li class="li_val" v-if="one.news_comment !== '1'" :class="{veiled : !evalManualSetting['M1']}">
							  <span v-if="evalInfo[one.news_id] && evalInfo[one.news_id].eval1">
							    <span class="ico li5" v-if="evalInfo[one.news_id].eval1.eval1_seq"></span> <!--평가1 O -->
							    <span v-else class="ico li7"></span><!--평가1 X -->
							  </span>
							  <span v-else class="ico li7"></span>
							</li>
							<li class="li_val" v-if="one.news_comment === '1'" :class="{veiled : !evalManualSetting['M1']}"><!--평가제외-->
							  <span v-if="evalInfo[one.news_id] && evalInfo[one.news_id].eval1">
							    <span class="ico li8" v-if="evalInfo[one.news_id].eval1.eval1_seq"></span> <!--평가제외 평가1 O -->
							    <span v-else class="ico li10"></span> <!--평가제외 평가1 X -->
							  </span>
							  <span v-else class="ico li10"></span>
							</li>
							<li class="li_val" v-if="one.news_comment !== '1'" :class="{veiled : !evalManualSetting['M2']}">
							  <span v-if="evalInfo[one.news_id] && evalInfo[one.news_id].eval2m2Cnt && evalInfo[one.news_id].eval2m2CntMax">
							    <span class="ico li5" v-if="evalInfo[one.news_id].eval2m2Cnt === evalInfo[one.news_id].eval2m2CntMax"></span><!-- 평가2 ○ -->
							    <span class="ico li7" v-else-if="evalInfo[one.news_id].eval2m2Cnt === 0"></span><!-- 평가2 X-->
							    <span class="ico li6" v-else-if="evalInfo[one.news_id].eval2m2Cnt < evalInfo[one.news_id].eval2m2CntMax"></span><!-- 평가2 △-->
							  </span>
							  <span v-else class="ico li7"></span>
							</li>
							<li class="li_val" v-if="one.news_comment === '1'" :class="{veiled : !evalManualSetting['M2']}"><!-- 평가제외-->
							  <span v-if="evalInfo[one.news_id] && evalInfo[one.news_id].eval2m2Cnt && evalInfo[one.news_id].eval2m2CntMax">
							    <span class="ico li8" v-if="evalInfo[one.news_id].eval2m2Cnt === evalInfo[one.news_id].eval2m2CntMax"></span><!-- 평가2 ○ -->
							    <span class="ico li10" v-else-if="evalInfo[one.news_id].eval2m2Cnt === 0"></span><!-- 평가2 X-->
							    <span class="ico li9" v-else-if="evalInfo[one.news_id].eval2m2Cnt < evalInfo[one.news_id].eval2m2CntMax"></span><!-- 평가2 △-->
							  </span>
							  <span v-else class="ico li10"></span>
							</li>
						</ul>
						<ul class="list_rt" :class="evalManualSetting.cssClassName" v-if="searchFormSeen">
							<li class="li_media" :class="{ red : one.news_comment === '1'  }">{{one.media_name}}</li>
							<li class="li_val" v-if="one.news_comment !== '1'" :class="{veiled : !evalManualSetting['M1']}">
							  <span v-if="searchEvalInfo[one.news_id] && searchEvalInfo[one.news_id].eval1">
							    <span class="ico li5" v-if="searchEvalInfo[one.news_id].eval1.eval1_seq"></span> <!--평가1 O -->
							    <span v-else class="ico li7"></span> <!--평가1 X -->
							  </span>
							  <span v-else class="ico li7"></span>
							</li>
							<li class="li_val" v-if="one.news_comment === '1'" :class="{veiled : !evalManualSetting['M1']}"><!--평가제외-->
							  <span v-if="searchEvalInfo[one.news_id] && searchEvalInfo[one.news_id].eval1"></span> <!--평가제외 평가1 O -->
							    <span class="ico li8" v-if="searchEvalInfo[one.news_id].eval1.eval1_seq"></span> <!--평가제외 평가1 O -->
							    <span v-else class="ico li10"></span> <!--평가제외 평가1 X -->
							  </span>
							  <span v-else class="ico li10"></span>
							</li>
							<li class="li_val" v-if="one.news_comment !== '1'" :class="{veiled : !evalManualSetting['M2']}">
							  <span v-if="searchEvalInfo[one.news_id] && searchEvalInfo[one.news_id].eval2m2Cnt && searchEvalInfo[one.news_id].eval2m2CntMax">
							    <span class="ico li5" v-if="searchEvalInfo[one.news_id].eval2m2Cnt === searchEvalInfo[one.news_id].eval2m2CntMax"></span><!-- 평가2 ○ -->
							    <span class="ico li7" v-else-if="searchEvalInfo[one.news_id].eval2m2Cnt === 0"></span><!-- 평가2 X-->
							    <span class="ico li6" v-else-if="searchEvalInfo[one.news_id].eval2m2Cnt < searchEvalInfo[one.news_id].eval2m2CntMax"></span><!-- 평가2 △-->
							  </span>
								<span v-else class="ico li7"></span>
							</li>
							<li class="li_val" v-if="one.news_comment === '1'" :class="{veiled : !evalManualSetting['M2']}"><!-- 평가제외-->
								<span v-if="searchEvalInfo[one.news_id] && searchEvalInfo[one.news_id].eval2m2Cnt && searchEvalInfo[one.news_id].eval2m2CntMax">
									<span class="ico li8" v-if="searchEvalInfo[one.news_id].eval2m2Cnt === searchEvalInfo[one.news_id].eval2m2CntMax"></span><!-- 평가2 ○ -->
									<span class="ico li10" v-else-if="searchEvalInfo[one.news_id].eval2m2Cnt === 0"></span><!-- 평가2 X-->
									<span class="ico li9" v-else-if="searchEvalInfo[one.news_id].eval2m2Cnt < searchEvalInfo[one.news_id].eval2m2CntMax"></span><!-- 평가2 △-->
								</span>
								<span v-else class="ico li10"></span>
							</li>
						</ul>
					</li>
				</div>
			</ul>
			<!--기사뿌려주기 끝-->
		</div>
		<!--하단버튼-->
		<div class="cont_btn" v-if="!hideAndShowMultiArticleList">
			<ul class="btn_left">
				<li><a @click="remove">선택제거</a></li>
			</ul>
		</div>
	</div>
</template>
<script>
	import {mapState, mapGetters, mapMutations} from 'vuex'
	export default {
		props: ['evalManualSetting'],
		data() {
			return{
				newsGroupAllCheck :[],
				selNewsMe : [],
				grouping : {},
				checkForm : [],
				selArticles : [],

				multi_str : 'multi',
				params : [],

				news_file_name: '',
				openDate: new Date(),
				eval2ClassCnt : 0,
				news_id_local : 0,

				isAllCheck : false
			}
		},
		computed: {
			...mapState([
				'newsGroup',
				'hideAndShowMultiArticleList',
				'multiEvalArticleList',
				'multiSelectedArticle',
				'multiNewsIdList',
				'evalInfo',
				'eval2Cnt',
				'searchEvalInfo',
				'searchFormSeen'
			]),

		},
		mounted () {
			this.news_id_local = this.multiSelectedArticle.news_id;
		},
		watch:{
			multiSelectedArticle(){
				if(this.multiSelectedArticle !== '' && this.multiSelectedArticle !== undefined){
					this.news_id_local = this.multiSelectedArticle.news_id;
				} else {
					this.news_id_local = 0;
				}
			}
		},
		methods: {
			...mapMutations([
				'SET_MULTI_SELECTED_ARTICLE',
				'TOGGLE_HIDE_AND_SHOW_MULTI_ARTICLE_LIST',
				'SET_MULTI_EVAL_ARTICLE_LIST',
				'SET_MULTI_NEWS_ID_LIST',
				'TOGGLE_SHOW_DO_EVAL_MULTI',
			]),
			async oneSelect(thisOne) {
				if (await this.$store.dispatch('loginCheckGentleAPI')) {
					this.$eventBus.$emit('toMultiDoEval', 'formData');
					this.SET_MULTI_SELECTED_ARTICLE(thisOne);
				} else {
					this.$eventBus.$emit('kickOut')
				}
			},
			multiIsAll() {
				this.isAllCheck = this.selArticles.length === this.multiEvalArticleList.length;
				return this.selArticles.length === this.multiEvalArticleList.length;
			},
			allCheck($event, list){
				let $this = this;
				list.forEach(one=> {
					if($event.target.checked) {
						if($this.selArticles.indexOf(one) === -1) {
							$this.selArticles.push(one);
						}
					} else {
						const delIdx = $this.selArticles.indexOf(one);
						if(delIdx > -1) {
							$this.selArticles.splice(delIdx, 1);
						}
					}
				});
				this.isAllCheck = $event.target.checked;
			},
			hideAndShowToggle() {
				this.TOGGLE_HIDE_AND_SHOW_MULTI_ARTICLE_LIST(!this.hideAndShowMultiArticleList);
			},
			/**
			 *
			 * @returns {boolean}
			 */
			remove() {
				//전체 선택 일 때 분기
				if(this.isAllCheck === true) {
					let total_remove = false;
					//기사가 1개 남았을 때
					if(this.selArticles.length === 1) {
						this.TOGGLE_SHOW_DO_EVAL_MULTI(false);
						this.$eventBus.$emit('closeMultiEvalToDoEval');
						this.selArticles = [];
						return false;
					} else {
						total_remove = window.confirm("전체 기사를 제거할 경우 창이 닫힙니다. \n전체 기사를 제거하시겠습니까?");
					}
					if(total_remove) {
						this.TOGGLE_SHOW_DO_EVAL_MULTI(false);
						this.$eventBus.$emit('closeMultiEvalToDoEval');
						this.selArticles = [];
						return false;
					} else {
						return false;
					}
				}


				let list = this.multiEvalArticleList;
				let remove = this.selArticles;
				for(const key in remove) {
					for(const key1 in list){
						if(remove[key].news_id === list[key1].news_id){
							list.splice(key1,1);
						}
					}
				}

				let newsIdList = this.multiNewsIdList;
				for(const keyA in remove) {
					for(const keyB in newsIdList){
						if(remove[keyA].news_id === newsIdList[keyB]){
							newsIdList.splice(keyB,1);
						}
					}
				}
				this.selArticles = [];
				this.SET_MULTI_EVAL_ARTICLE_LIST(list);
				this.SET_MULTI_NEWS_ID_LIST(newsIdList);

				if(list.length === 0){
					this.SET_MULTI_SELECTED_ARTICLE('');
				} else {
					this.SET_MULTI_SELECTED_ARTICLE(list[0]);
				}
				return true;
			},
		}
	}
</script>

<style scoped>
	.red {color : #f1595d;}
	.veiled {display:none;}
	.li_tit.wfBoth { padding-right: 180px !important; }
	.list_rt.wfBoth { width: 180px !important; }
	.li_tit.wfSingle { padding-right: 135px !important; }
	.list_rt.wfSingle { width: 135px !important; }
	.li_tit.wfEmpty { padding-right: 90px !important; }
	.list_rt.wfEmpty { width: 90px !important; }
</style>
