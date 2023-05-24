<template>
	<!-- s: pop -->
	<div id="pop_wrap">
		<div class="overlay"></div>
		<div class="pop_window cal" :class="{cal4 : now_weeksNum === 4 , cal6 : now_weeksNum === 6}">
			<div class="pop_tit">
				<div class="pop_tit_btn">
					<div class="pop_closed"><a @click="close"></a></div>
				</div>
				<div class="pop_date">
					<div class="date_btn first"><a @click="preYear">&nbsp;&nbsp;&nbsp;</a></div>
					<div class="date_btn prev"><a @click="preMonth">&nbsp;&nbsp;&nbsp;</a></div>
					<div class="date_box"><input type="text" v-model="year_month" @change="dateChange"/></div>
					<div class="date_btn next"><a @click="nextMonth">&nbsp;&nbsp;&nbsp;</a></div>
					<div class="date_btn end"><a @click="nextYear">&nbsp;&nbsp;&nbsp;</a></div>
				</div>
				<div class="btn_today"><a @click="onToday">오늘</a></div>
			</div>
			<div class="pop_cont">
				<ul class="weekdays">
					<li v-for="day in dayNames" :key="day">{{day}}</li>
				</ul>
				<ul class="days" style="display:none;" id="oneMonth">
					<li
							:class="{
							noday: i<=one_firstDay || i> one_daysEnd, day: i> one_firstDay && i<=one_daysEnd,
							today: showYear === today_year && Number(showMonth) === Number(today_month) && i-one_firstDay === today_day_date,
							on : one_year === sel_year && one_month === sel_month && i-one_firstDay === sel_day
							}"
					    v-for=" i in one_drawNum"  :key="i" >
						<a @click="goArtList(i-one_firstDay)" v-if="i>one_firstDay && i<=one_daysEnd  && getOneInfo ">
							<h2>{{i-one_firstDay}}</h2>
							<ul v-if="i>one_firstDay && i<=one_daysEnd && one_evalCntInfo['day'+(i-one_firstDay)].cnt>0">
								<li>총 기사건수 : {{one_evalCntInfo['day'+(i-one_firstDay)].cnt}}</li>
								<li>평가완료 : {{one_evalCntInfo['day'+(i-one_firstDay)]['cntDoneBoth']}}</li>
								<li class="gr">평가제외 : {{one_evalCntInfo['day'+(i-one_firstDay)]['cntExclude']}}</li>
								<li class="red">미평가 : {{one_evalCntInfo['day'+(i-one_firstDay)]['cntOngoingEither']}}</li>
							</ul>
							<div class="day_over" >
								<h2> {{i-one_firstDay}} </h2>
								<ul v-if=" i>one_firstDay && i<=one_daysEnd && one_evalCntInfo['day'+(i-one_firstDay)].cnt>0">
									<li>총 기사건수 : {{one_evalCntInfo['day'+(i-one_firstDay)].cnt}}</li>
									<li><span>평가 완료 건수 : {{one_evalCntInfo['day'+(i-one_firstDay)]['cntDoneBoth']}}</span>
										<ul>
											<li class="gr" v-if="eval1_use">- 평가항목1 : {{one_evalCntInfo['day'+(i-one_firstDay)]['cntDone1']}}</li>
											<li class="gr" v-if="eval2_use">- 평가항목2 : {{one_evalCntInfo['day'+(i-one_firstDay)]['cntDone2']}}</li>
										</ul>
									</li>
									<li>평가 제외 건수 : {{one_evalCntInfo['day'+(i-one_firstDay)]['cntExclude']}}</li>
									<li class="red"><span>미평가건수 : {{one_evalCntInfo['day'+(i-one_firstDay)]['cntOngoingEither']}}</span>
										<ul>
											<li class="gr" v-if="eval1_use">- 평가항목1 : {{one_evalCntInfo['day'+(i-one_firstDay)]['cntOngoing1']}}</li>
											<li class="gr" v-if="eval2_use">- 평가항목2 : {{one_evalCntInfo['day'+(i-one_firstDay)]['cntOngoing2']}}</li>
										</ul>
									</li>
								</ul>
								<ul v-else>
									<li>&nbsp;</li>
									<li>&nbsp;</li>
									<li>&nbsp;</li>
									<li>&nbsp;</li>
								</ul>
							</div>
						</a>
					</li>
				</ul>
				<ul class="days" style="display:block;" id="twoMonth">
					<li
							:class="{
							noday: i<=two_firstDay || i> two_daysEnd, day: i> two_firstDay && i<=two_daysEnd,
							today: showYear === today_year && Number(showMonth) === Number(today_month) && i-two_firstDay===today_day_date,
							on : two_year === sel_year && two_month === sel_month && i-two_firstDay === sel_day, fourweeks : total_weeks_in_month === 4, fiveweeks : total_weeks_in_month === 5, sixweeks : total_weeks_in_month === 6
							}"
					    v-for=" i in two_drawNum" :key="i" >
						<a @click="goArtList(i-two_firstDay)" v-if="i>two_firstDay && i<=two_daysEnd  && getTwoInfo ">
							<h2>{{i-two_firstDay}} </h2>
							<ul v-if="i>two_firstDay && i<=two_daysEnd && two_evalCntInfo['day'+(i-two_firstDay)].cnt>0 ">
								<li>총 기사건수 : {{two_evalCntInfo['day'+(i-two_firstDay)].cnt}}</li>
								<li>평가완료 : {{two_evalCntInfo['day'+(i-two_firstDay)]['cntDoneBoth']}}</li>
								<li class="gr">평가제외 : {{two_evalCntInfo['day'+(i-two_firstDay)]['cntExclude']}}</li>
								<li class="red">미평가 : {{two_evalCntInfo['day'+(i-two_firstDay)]['cntOngoingEither']}}</li>
							</ul>
							<div class="day_over" >
								<h2> {{i-two_firstDay}} </h2>
								<ul v-if=" i>two_firstDay && i<=two_daysEnd && two_evalCntInfo['day'+(i-two_firstDay)].cnt>0">
									<li>총 기사건수 : {{two_evalCntInfo['day'+(i-two_firstDay)].cnt}}</li>
									<li><span>평가 완료 건수 : {{two_evalCntInfo['day'+(i-two_firstDay)]['cntDoneBoth']}}</span>
										<ul>
											<li class="gr" v-if="eval1_use">- 평가항목1 : {{two_evalCntInfo['day'+(i-two_firstDay)]['cntDone1']}}</li>
											<li class="gr" v-if="eval2_use">- 평가항목2 : {{two_evalCntInfo['day'+(i-two_firstDay)]['cntDone2']}}</li>
										</ul>
									</li>
									<li>평가 제외 건수 : {{two_evalCntInfo['day'+(i-two_firstDay)]['cntExclude']}}</li>
									<li class="red"><span>미평가건수 : {{two_evalCntInfo['day'+(i-two_firstDay)]['cntOngoingEither']}}</span>
										<ul>
											<li class="gr" v-if="eval1_use">- 평가항목1 : {{two_evalCntInfo['day'+(i-two_firstDay)]['cntOngoing1']}}</li>
											<li class="gr" v-if="eval2_use">- 평가항목2 : {{two_evalCntInfo['day'+(i-two_firstDay)]['cntOngoing2']}}</li>
										</ul>
									</li>
								</ul>
								<ul v-else>
									<li>&nbsp;</li>
									<li>&nbsp;</li>
									<li>&nbsp;</li>
									<li>&nbsp;</li>
								</ul>
							</div>
						</a>
					</li>
				</ul>
				<ul class="days" style="display:none;" id="threeMonth">
					<li
					    :class="{
					    noday: i<= three_firstDay || i> three_daysEnd, day: i> three_firstDay && i<=three_daysEnd,
					    today: showYear === today_year && Number(showMonth) === Number(today_month) && i-three_firstDay===today_day_date,
					    on : three_year === sel_year && three_month === sel_month && i-three_firstDay === sel_day
					    }"
					    v-for=" i in three_drawNum" :key="i" >
						<a @click="goArtList(i-three_firstDay)" v-if="i>three_firstDay && i<=three_daysEnd  && getThreeInfo ">
							<h2>{{i-three_firstDay}}</h2>
							<ul v-if="i>three_firstDay && i<=three_daysEnd && three_evalCntInfo['day'+(i-three_firstDay)].cnt> 0">
								<li>총 기사건수 : {{three_evalCntInfo['day'+(i-three_firstDay)].cnt}}</li>
								<li>평가완료 : {{three_evalCntInfo['day'+(i-three_firstDay)]['cntDoneBoth']}}</li>
								<li class="gr">평가제외 : {{three_evalCntInfo['day'+(i-three_firstDay)]['cntExclude']}}</li>
								<li class="red">미평가 : {{three_evalCntInfo['day'+(i-three_firstDay)]['cntOngoingEither']}}</li>
							</ul>
							<div class="day_over" >
								<h2> {{i-three_firstDay}} </h2>
								<ul v-if=" i>three_firstDay && i<=three_daysEnd && three_evalCntInfo['day'+(i-three_firstDay)].cnt>0">
									<li>총 기사건수 : {{three_evalCntInfo['day'+(i-three_firstDay)].cnt}}</li>
									<li><span>평가 완료 건수 : {{three_evalCntInfo['day'+(i-three_firstDay)]['cntDoneBoth']}}</span>
										<ul>
											<li class="gr" v-if="eval1_use">- 평가항목1 : {{three_evalCntInfo['day'+(i-three_firstDay)]['cntDone1']}}</li>
											<li class="gr" v-if="eval2_use">- 평가항목2 : {{three_evalCntInfo['day'+(i-three_firstDay)]['cntDone2']}}</li>
										</ul>
									</li>
									<li>평가 제외 건수 : {{three_evalCntInfo['day'+(i-three_firstDay)]['cntExclude']}}</li>
									<li class="red"><span>미평가건수 : {{three_evalCntInfo['day'+(i-three_firstDay)]['cntOngoingEither']}}</span>
										<ul>
											<li class="gr" v-if="eval1_use">- 평가항목1 : {{three_evalCntInfo['day'+(i-three_firstDay)]['cntOngoing1']}}</li>
											<li class="gr" v-if="eval2_use">- 평가항목2 : {{three_evalCntInfo['day'+(i-three_firstDay)]['cntOngoing2']}}</li>
										</ul>
									</li>
								</ul>
								<ul v-else>
									<li>&nbsp;</li>
									<li>&nbsp;</li>
									<li>&nbsp;</li>
									<li>&nbsp;</li>
								</ul>
							</div>
						</a>
					</li>
				</ul>
			</div>
		</div>
	</div>
	<!-- e: pop -->
</template>
<script>
	import store from '../../../store'
	import {mapState,mapMutations} from 'vuex'
	export default{
		data() {
			const startDate = new Date();
			return {
				today_date : new Date(),
				today_day_date : (new Date()).getDate(),
				today_year : startDate.getFullYear(),
				today_month : startDate.getMonth()+1,
				openDate: this.$moment(startDate).format('YYYY-MM-DD'),
				dayNames: ['일','월', '화', '수', '목', '금', '토'],


				withOMonth :startDate.getMonth()+1,

				showYear : startDate.getFullYear(),
				showMonth : startDate.getMonth()+1,
				year_month : '',

				now_weeksNum: 0,

				two_year :startDate.getFullYear(),
				two_month :startDate.getMonth()+1,
				two_firstDay: 0,
				two_lastDay: 0,
				two_days: 0,
				two_drawNum : 0,
				two_daysEnd: 0,
				two_weeksNum : 0,

				one_year: 0,
				one_month: 0,
				one_firstDay: 0,
				one_lastDay : 0,
				one_days: 0,
				one_drawNum : 0,
				one_daysEnd: 0,
				one_weeksNum : 0,

				three_year : 0,
				three_month: 0,
				three_firstDay: 0,
				three_lastDay: 0,
				three_days: 0,
				three_drawNum : 0,
				three_daysEnd: 0,
				three_weeksNum : 0,

				one_evalCntInfo: [{ 'day1' : { 'cnt' : 0 }}],
				two_evalCntInfo: [{ 'day1' : { 'cnt' : 0 }}],
				three_evalCntInfo: [{ 'day1' : { 'cnt' : 0 }}],
				getOneInfo : false,
				getTwoInfo : false,
				getThreeInfo : false,

				sel_year : 0,
				sel_month : 0,
				sel_day : 0,
				eval1_use: false,
				eval2_use: false,
				getSummaryData1: false,
				getSummaryData2: false,
				getSummaryData3: false
			}
		},
		computed: {
			...mapState(['showPopCalender', 'selDate']),
			total_weeks_in_month() {
				let ym = this.year_month.split('-');
				let rtn = 5;
				if (ym.length === 2) {
					let year = Number(ym[0]);
					let month = Number(ym[1]);
					let day_count = new Date(year, month, 0).getDate();
					let day_start = new Date(year, month-1, 1).getDay();
					let day_compensate = (day_count + day_start) / 7;
					rtn = Math.trunc(day_compensate) + (day_compensate % 7 > 0 ? 1 : 0);
				}
				return rtn;
			}
		},
		beforeMount(){
			this.addKeyup();
		},
		beforeDestroy(){
			this.removeKeyup();
		},
		async mounted() {
			await this.getData();
		},
		watch :{
			showPopCalender (newVal) {
				if(newVal) {
					this.addKeyup();
					this.openProcess();
				} else {
					this.removeKeyup();
				}
			}
		},
		methods: {
			...mapMutations(['TOGGLE_SHOW_POP_CALENDER', 'SET_SEL_DATE']),
			async getData() {
				const dateInfo = this.selDate.split('-');
				this.two_year = Number(dateInfo[0]);
				this.two_month = Number(dateInfo[1]);
				this.showYear = this.two_year;
				if(this.two_month<10) {
					this.showMonth = '0'+this.two_month;
				} else {
					this.showMonth = this.two_month;
				}
				this.year_month = this.showYear + '-' + this.showMonth;
				this.one_year = this.getPre('year',this.two_year, this.two_month );
				this.one_month = this.getPre('month',this.two_year, this.two_month );
				this.three_year = this.getNext('year',this.two_year, this.two_month);
				this.three_month = this.getNext('month',this.two_year, this.two_month);

				await this.getDateInfoOne(this.one_year, this.one_month)
				await this.getDateInfoTwo(this.two_year, this.two_month)
				await this.getDateInfoThree(this.three_year, this.three_month)
				if (!this.getSummaryData1 || !this.getSummaryData2 || !this.getSummaryData3) {
					this.TOGGLE_SHOW_POP_CALENDER(false);
					this.$eventBus.$emit('kickOut');
				}
			},
			async openProcess(){
				const dateInfo = this.selDate.split('-');
				this.sel_year = Number(dateInfo[0]);
				this.sel_month = Number(dateInfo[1]);
				this.sel_day = Number(dateInfo[2]);
				await this.getDateInfoOne(this.one_year, this.one_month);
				await this.getDateInfoTwo(this.two_year, this.two_month);
				await this.getDateInfoThree(this.three_year, this.three_month);
				if (!this.getSummaryData1 || !this.getSummaryData2 || !this.getSummaryData3) {
					this.TOGGLE_SHOW_POP_CALENDER(false);
					this.$eventBus.$emit('kickOut');
				}
			},
			addKeyup(){
				window.addEventListener('keydown', this.arrowKeyup);
			},
			removeKeyup(){
				window.removeEventListener('keydown', this.arrowKeyup);
			},
			arrowKeyup(e){
				switch(e.which){
					case 27 :
						e.preventDefault ? e.preventDefault() : e.returnValue=false;
						e.stopPropagation();
						this.close(); break;
					case 37 :
						e.preventDefault ? e.preventDefault() : e.returnValue=false;
						e.stopPropagation(); this.preMonth(); break;
					case 39 :
						e.preventDefault ? e.preventDefault() : e.returnValue=false;
						e.stopPropagation(); this.nextMonth(); break;
				}
			},
			/**
			 * @param year
			 * @param month
			 * 두번째 달력 정보 가져오기
			 */
			async getDateInfoTwo(year, month){
				this.two_year = Number(year);
				this.two_month = Number(month);
				this.two_firstDay = (new Date(this.two_year, this.two_month-1, 1)).getDay();
				this.two_lastDay = (new Date(this.two_year, this.two_month, 0)).getDay();
				this.two_days = (new Date(this.two_year, this.two_month, 0)).getDate();
				this.two_drawNum = this.two_firstDay + this.two_days + (6-this.two_lastDay);
				this.two_daysEnd = this.two_firstDay + this.two_days;
				this.two_weeksNum = Math.ceil(this.two_daysEnd/7);
				return this.getSummaryData('two', this.two_year, this.two_month, this.two_days);
			},
			/**
			 * @param year
			 * @param month
			 * 첫번째 달력 정보 가져오기
			 */
			async getDateInfoOne(year, month) {
				this.one_year = Number(year);
				this.one_month = Number(month);
				this.one_firstDay = (new Date(this.one_year, this.one_month-1, 1)).getDay();
				this.one_lastDay = (new Date(this.one_year, this.one_month, 0)).getDay();
				this.one_days = (new Date(this.one_year, this.one_month, 0)).getDate();
				this.one_drawNum = this.one_firstDay + this.one_days + (6-this.one_lastDay);
				this.one_daysEnd = this.one_firstDay + this.one_days;
				this.one_weeksNum = Math.ceil(this.one_daysEnd/7);
				return this.getSummaryData('one', this.one_year, this.one_month, this.one_days);
			},
			/**
			 * @param year
			 * @param month
			 * 세번째 달력 정보 가져오기
			 */
			async getDateInfoThree(year, month){
				this.three_year = Number(year);
				this.three_month = Number(month);
				this.three_firstDay = (new Date(this.three_year, this.three_month-1, 1)).getDay();
				this.three_lastDay = (new Date(this.three_year, this.three_month, 0)).getDay();
				this.three_days = (new Date(this.three_year, this.three_month, 0)).getDate();
				this.three_drawNum = this.three_firstDay + this.three_days + (6-this.three_lastDay);
				this.three_daysEnd = this.three_firstDay + this.three_days;
				this.three_weeksNum = Math.ceil(this.three_daysEnd/7);
				return this.getSummaryData('three', this.three_year, this.three_month, this.three_days);
			},
			/**
			 * @param flag
			 * @param year
			 * @param month
			 * @param days
			 * @returns {Promise<void>}
			 * 해당 월의 기사 건수 가져오는 함수
			 */
			async getSummaryData(flag, year, month, days) {
				let ssdo = store.state.domainOrigin;
				let params = new FormData;
				params.append('year', year);
				params.append('month', month);
				params.append('days', days);

				await this.$axios({
					url : ssdo + '/popCalendar.php',
					method : 'post',
					data : params,
				}).then( res => {
					if (res.data.notice_code && res.data.notice_code === 'E001' && res.data.success === false) {
						switch(flag) {
							case 'one' :
								this.getSummaryData1 = false;
								break;
							case 'two' :
								this.getSummaryData2 = false;
								break;
							case 'three' :
								this.getSummaryData3 = false;
								break;
						}
					} else {
						switch(flag) {
							case 'one' :
								this.one_evalCntInfo = res.data.cntInfo;
								this.getOneInfo = true;
								this.getSummaryData1 = true;
								break;
							case 'two' :
								this.two_evalCntInfo = res.data.cntInfo;
								this.getTwoInfo = true;
								this.getSummaryData2 = true;
								break;
							case 'three' :
								this.getThreeInfo = true;
								this.three_evalCntInfo = res.data.cntInfo;
								this.getSummaryData3 = true;
								break;
						}
						this.eval1_use = res.data.cfgUse1;
						this.eval2_use = res.data.cfgUse2;
					}
				}).catch(err => {console.log(err)});
			},
			async preYear() {
				if (await this.$store.dispatch('loginCheckGentleAPI')) {
					this.twoStand(this.showYear-1, this.showMonth);
				} else {
					this.$eventBus.$emit('kickOut');
				}
			},
			/**
			 * 이전 월 이동시 수행되는 함수
			 */
			async preMonth() {
				if (!await this.$store.dispatch('loginCheckGentleAPI')) {
					this.$eventBus.$emit('kickOut');
					return false;
				}
				let oneMonth = document.querySelector('#oneMonth');
				let twoMonth = document.querySelector('#twoMonth');
				let threeMonth = document.querySelector('#threeMonth');
				let getFlag = '';

				if (twoMonth.style.display === 'block') {
					getFlag = 'three';
					twoMonth.style.display = 'none';
				} else if (oneMonth.style.display === 'block') {
					getFlag = 'two';
					oneMonth.style.display = 'none';
				} else if (threeMonth.style.display === 'block') {
					getFlag = 'one';
					threeMonth.style.display = 'none';
				}

				switch (getFlag) {
					case 'one':
					this.showYear = this.two_year;
					this.showMonth = this.two_month;
					twoMonth.style.display = 'block';
					this.now_weeksNum = this.two_weeksNum;
					this.getOneInfo = false;
					this.getDateInfoOne(this.getPre('year', this.showYear, this.showMonth), this.getPre('month', this.showYear, this.showMonth));
					break;
					case 'two':
					this.showYear = this.three_year;
					this.showMonth = this.three_month;
					threeMonth.style.display = 'block';
					this.now_weeksNum = this.three_weeksNum;
					this.getTwoInfo = false;
					this.getDateInfoTwo(this.getPre('year', this.showYear, this.showMonth), this.getPre('month', this.showYear, this.showMonth));
					break;
					case 'three':
					this.showYear = this.one_year;
					this.showMonth = this.one_month;
					oneMonth.style.display = 'block';
					this.now_weeksNum = this.one_weeksNum;
					this.getThreeInfo = false;
					this.getDateInfoThree(this.getPre('year', this.one_year, this.one_month), this.getPre('month', this.one_year, this.one_month));
					break;
				}
				this.makeShowDate(this.showYear, this.showMonth);
			},
			/**
			 * 다음달 이동시 수행되는 함수
			 */
			async nextMonth() {
				if (!await this.$store.dispatch('loginCheckGentleAPI')) {
					this.$eventBus.$emit('kickOut');
					return false;
				}
				let oneMonth = document.querySelector('#oneMonth');
				let twoMonth = document.querySelector('#twoMonth');
				let threeMonth = document.querySelector('#threeMonth');
				let getFlag = '';

				if (twoMonth.style.display === 'block') {
					getFlag = 'one';
					twoMonth.style.display = 'none';
				} else if (oneMonth.style.display === 'block') {
					getFlag = 'three';
					oneMonth.style.display = 'none';
				} else if (threeMonth.style.display === 'block') {
					getFlag = 'two';
					threeMonth.style.display = 'none';
				}

				switch (getFlag) {
					case 'one':
					this.showYear = this.three_year;
					this.showMonth = this.three_month;
					threeMonth.style.display = 'block';
					this.getOneInfo = false;
					this.getDateInfoOne(this.getNext('year', this.showYear, this.showMonth), this.getNext('month', this.showYear, this.showMonth));
					this.now_weeksNum = this.three_weeksNum;
					break;
					case 'two':
					this.showYear = this.one_year;
					this.showMonth = this.one_month;
					oneMonth.style.display = 'block';
					this.getTwoInfo = false;
					this.getDateInfoTwo(this.getNext('year', this.showYear, this.showMonth), this.getNext('month', this.showYear, this.showMonth));
					this.now_weeksNum = this.one_weeksNum;
					break;
					case 'three':
					this.showYear = this.two_year;
					this.showMonth = this.two_month;
					twoMonth.style.display = 'block';
					this.getThreeInfo = false;
					this.getDateInfoThree(this.getNext('year', this.one_year, this.one_month), this.getNext('month', this.one_year, this.one_month));
					this.now_weeksNum = this.two_weeksNum;
					break;
				}
				this.makeShowDate(this.showYear, this.showMonth);
			},
			/**
			 *
			 * @param showYear
			 * @param showMonth
			 * 이동하려는 연,월이 입력되거나 변경되었을 때 해당월 기준 양옆 달력 정보 처리해줌
			 */
			twoStand(showYear, showMonth) {
				this.showYear = showYear;
				this.showMonth = showMonth;
				this.two_year = showYear;
				this.two_month = showMonth;
				this.one_year = this.getPre('year', this.showYear, this.showMonth);
				this.one_month = this.getPre('month', this.showYear, this.showMonth);
				this.three_year = this.getNext('year', this.showYear, this.showMonth);
				this.three_month = this.getNext('month', this.showYear, this.showMonth);
				this.getOneInfo = false;
				this.getTwoInfo = false;
				this.getThreeInfo = false;
				this.getDateInfoOne(this.one_year, this.one_month);
				this.getDateInfoTwo(this.two_year, this.two_month);
				this.getDateInfoThree(this.three_year, this.three_month);
				document.querySelector('#oneMonth').style.display = 'none';
				document.querySelector('#twoMonth').style.display = 'block';
				document.querySelector('#threeMonth').style.display = 'none';
				this.now_weeksNum = this.two_weeksNum;
				this.makeShowDate(this.showYear, this.showMonth);
			},
			/**
			 * 다음 해 정보 가져오기
			 */
			async nextYear() {
				if (await this.$store.dispatch('loginCheckGentleAPI')) {
					this.twoStand(this.showYear+1, this.showMonth);
				} else {
					this.$eventBus.$emit('kickOut');
				}
			},
			/**
			 * 오늘날짜에 해당하는 연,월로 돌아가기
			 */
			onToday(){
				if(this.showYear !== this.today_year || Number(this.showMonth) !== Number(this.today_month)) {
					if(this.today_month<10) {
						this.today_month = '0'+this.today_month;
					}
					this.twoStand(this.today_year, this.today_month);
				}
			},
			/**
			 *
			 * @param showYear
			 * @param showMonth
			 * 달력 상단 날짜 맞춰주는 함수
			 * yyyy-mm
			 */
			makeShowDate(showYear, showMonth){
				let showM = Number(showMonth);
				if(showM < 10){
					showM = '0'+showM;
				}
				this.year_month = showYear+'-'+showM;
			},
			/**
			 *
			 * @param day
			 * 이동하려는 날짜 클릭시 날짜 전달 및 캘린더 닫음
			 */
			goArtList(day){
				let withODay = 0;
				if(day < 10){
					withODay = '0'+ day;
				} else {
					withODay = day;
				}
				if(this.showMonth<10){
					this.showMonth = Number(this.showMonth);
					this.showMonth = '0' + this.showMonth;
				}
				this.SET_SEL_DATE(this.showYear+'-'+this.showMonth+'-'+withODay);
				this.$eventBus.$emit('sendDateToArticleList', this.showYear, this.showMonth, withODay);
				this.TOGGLE_SHOW_POP_CALENDER(false);
			},
			/**
			 * 사용자가 연,월 직접 바꾸었을 때 함수
			 */
			dateChange(){
				const dateInfo = this.year_month.split('-');
				if(dateInfo[1]>0 && dateInfo[1]<13) {
					this.twoStand(dateInfo[0], dateInfo[1]);
				}
			},
			/**
			 *
			 * @param flag
			 * @param year
			 * @param month
			 * @returns {*}
			 * 이전 달 연,월 반환
			 */
			getPre(flag, year, month){
				let one_year = year;
				let one_month = Number(month) -1;
				if(one_month === 0) {
					one_year = year-1;
					one_month = 12;
				}
				if(flag ==='year') {
					return one_year
				} else if (flag === 'month'){
					return one_month
				}
			},
			/**
			 *
			 * @param flag
			 * @param year
			 * @param month
			 * @returns {*}
			 * 다음 달 연,월 반환
			 */
			getNext(flag, year, month){
				let three_year = year;
				let three_month = Number(month) + 1;
				if(three_month === 13) {
					three_year = year+1;
					three_month = 1;
				}
				if(flag ==='year') {
					return three_year
				} else if (flag === 'month'){
					return three_month
				}
			},
			close(){
				this.TOGGLE_SHOW_POP_CALENDER(false);
			},
		},
	}
</script>
<style scoped>
#pop_wrap .pop_window.cal .pop_cont .days .day h2{ float:left; width:28px; }
#pop_wrap .pop_window.cal .pop_cont .days .day ul{ width:calc(100% - 28px); }
#pop_wrap .pop_window.cal .pop_cont .days .day_over > h2{ float:none; width:auto; }
#pop_wrap .pop_window.cal .pop_cont .days .day_over > ul{ float:right; width:calc(100% - 24px); }
.days li.fourweeks { height: 25% !important; }
.days li.fiveweeks { height: 20% !important; }
.days li.sixweeks { height: 16.6% !important; }
</style>
