<template>
	<div class="pre_top" style="display:block;" >
		<div class="pop_date">
			<div class="date_btn prev" @click="preDay"></div>
			<div class="date_box">
				<a @click="openCalendar">{{selDate}}</a>
			</div>
			<div class="date_btn next" @click="nextDay"></div>
		</div>
		<news-me></news-me>
		<div class="btn_sch">
			<a @click="seenChange">검색하기</a>
		</div>
	</div>
</template>
<script>
	import Datepicker from 'vuejs-datepicker'
	import NewsMe from './NewsMe'
	import {ko} from 'vuejs-datepicker/dist/locale'
	//import {mapState, mapMutations} from 'vuex'
	import {mapActions, mapGetters, mapMutations, mapState} from 'vuex'
	export default {
		components: {
			Datepicker,
			NewsMe,
		},
		data() {
		    const startDate = new Date();
			const minDate = new Date(2017, 0, 1);
			return {
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
				selNewsMe: [0],
				news_id_local:0,
			}
		},
		computed:{
            ...mapState([
                    'searchFormSeen'
                    ,'selDate'
                    ,'articleList'
                    ,'selectedArticle'
            ]),
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
            }
		},
		async created(){
			let splitDate = this.selDate.split('-');
			let month = Number(splitDate[1]);
			let day = Number(splitDate[2]);
			if(month<10){
				month = '0'+month;
			}
			if(day<10){
				day = '0'+day;
			}
			this.SET_SEL_DATE(splitDate[0]+'-'+month+'-'+day);

			//newsMe.vue에서 요청
			this.$eventBus.$on('sendNewsMeToEvalHeader', selNewsMe => {
				this.selNewsMe = selNewsMe;
			});
		},
		watch:{
            selectedArticle(){
                if(this.selectedArticle !== '' && this.selectedArticle !== undefined){
                    this.news_id_local = this.selectedArticle.news_id;
                } else {
                    this.news_id_local = 0;
                }
            }
		},
		methods: {
			...mapActions([
                    'getArticleListFromHeaderAPI'
            ]),
			...mapMutations([
                'SET_SEARCH_FORM_SEEN'
                ,'TOGGLE_SHOW_POP_CALENDER'
                ,'SET_SELECTED_ARTICLE'
                ,'SET_SEL_DATE'
                ,'SET_SELECTED_ARTICLE'
                ,'SET_ARTICLE_LIST'
                ,'SET_ARTICLE_LIST_SOURCE'
                ,'SET_GET_ARTICLE_LIST_FROM_HEADER_PAYLOAD'
			]),
			async seenChange() {
				if (await this.$store.dispatch('loginCheckGentleAPI')) {
					this.SET_SEARCH_FORM_SEEN(!this.searchFormSeen);
					this.$eventBus.$emit('setSearchFormSeen');
				} else {
					this.$eventBus.$emit('kickOut');
				}
			},
			async openCalendar() {
				if (await this.$store.dispatch('loginCheckGentleAPI')) {
					this.TOGGLE_SHOW_POP_CALENDER(true);
				} else {
					this.$eventBus.$emit('kickOut');
				}
			},
			async preDay() {
				if (!await this.$store.dispatch('loginCheckGentleAPI')) {
					this.$eventBus.$emit('kickOut');
					return false;
				}
				let date = this.selDate.split('-');
				let year = Number(date[0]);
				let month = Number(date[1]);
				let day = Number(date[2]);
				if(month  === 1){
					if (day === 1 ){
						year = year -1;
						month = 12;
						day = new Date(year, (month-1), 0).getDate();
					} else {
						day = day-1;
					}
				} else {
					if(day === 1){
						month--;
						day = new Date(year, month, 0).getDate();
					} else {
						day = day-1;
					}
				}
				if(month< 10){
					month = '0'+month;
				}
				if(day<10){
					day = '0' + day;
				}
				this.SET_SEL_DATE(year +'-'+month+'-'+day);
				//this.$eventBus.$emit('sendDateToArticleList', year, month, day);
				this.searchArticleListWhyNot();
				/*let preDate = new Date(year, month-1, 0).getDate(); //전달 마지막 날
				let nextDaye = new Date(year, month, 1).getDate(); // 다음달 첫날*/
			},
			async nextDay() {
				if (!await this.$store.dispatch('loginCheckGentleAPI')) {
					this.$eventBus.$emit('kickOut');
					return false;
				}
				let date = this.selDate.split('-');
				let year = Number(date[0]);
				let month = Number(date[1]);
				let day = Number(date[2]);
				if(month  === 12){
					if(day === new Date(year, 0,0).getDate()){
						year++;
						month = 1;
						day= 1;
					} else {
						day = day+ 1;
					}
				} else {
					if(day === new Date(year, month,0).getDate()){
						day = 1;
						month++;
					} else {
						day++;
					}
				}
				if(month< 10){
					month = '0'+month;
				}
				if(day<10){
					day = '0' + day;
				}
				this.SET_SEL_DATE(year +'-'+month+'-'+day);
				//this.$eventBus.$emit('sendDateToArticleList');
				this.searchArticleListWhyNot();
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
            //어디서 중복 되는 지는 모르겠지만 계속해서 중복되어 실행 되는 문제가 있어 DoEvalArticleList의 eventBus를 사용하지 않고 옴겨왔다.
			searchArticleListWhyNot(){
                this.SET_SELECTED_ARTICLE('');
                this.SET_ARTICLE_LIST([]);
                this.getArtListFromHeader(this.selDate, this.selNewsMe);
                this.SET_ARTICLE_LIST_SOURCE('header');
                this.selArticles = ['선택된기사'];
            },
            async getArtListFromHeader(openDate, selNewsMe) { 
                let payload = [];
                payload['scrapDate'] = openDate;
                payload['newsMe'] = selNewsMe;
                this.SET_GET_ARTICLE_LIST_FROM_HEADER_PAYLOAD(payload);
                await this.getArticleListFromHeaderAPI(payload);
				await this.getEval2ClassAPI(); // 대소제목 때문에 추가
                if (selNewsMe !== 'none') {
                    this.findFirstArticle(this.articleList);
                }
            },
		}
	}
</script>
<style scoped>
	.date_box, .datepicker-wrapper,  .datepicker-wrapper > div{ height: 100%;}
	input[type=text].datepicker-input {height: 100%;border: none;display: block;color: #333;width: 120px;padding-left: 30px;background: url(../../../assets/images/ico_pre.png) 0 -20px no-repeat;margin: 0 auto;}
	.prev, .next{cursor:pointer;}
</style>
