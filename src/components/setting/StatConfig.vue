<template>
	<div>
		<ul class="pre_group_set">
			<template v-for="(item,key) in settingList">
				<li class="sub-category" :key="'settingType'+item.seq">
					<input type="radio" :id="'settingType'+key" v-model="settingType" :value="item.seq"/>
					<div v-if="key < 2" style="display:inline; opacity:0.5;">&gt;</div>
					<label :for="'settingType'+key" @click="newLoadData($event, key)"> 
						<p v-if="settingType === key" class="stat-setting-selected">{{item.name}}</p>
						<p v-else >{{item.name}}</p>
					</label>
				</li>
			</template>
		</ul>
		<div class="cont_wrap2">
			<div id="settingType1" class="statSettingArea" :class="{'dn':settingType !== 0}">
				<TemplateSetting ref="template" :show-comp="settingType"></TemplateSetting>
			</div>
			<div id="settingType2" class="statSettingArea" :class="{'dn':settingType !== 1}">
				<ReportSetting ref="report" :show-comp="settingType"></ReportSetting>
			</div>
			<div id="settingType3" class="statSettingArea" :class="{'dn':settingType !== 2}">
				<TabSetting ref="tab"></TabSetting>
			</div>
			<div class="loading" v-if="loadingGif">
				<img class="loading-image" :src="require('@/assets/images/loading.gif')" alt="Loading..."/>
				<div v-show="getStatSetting.imgDownloadInfo">
					<section>
						<span>[시각객체 수]&nbsp;-&nbsp;</span>
						<span id="voc" class="visual-object-count">/</span>
					</section>
					<section>
						<span>[이미지 높이]&nbsp;-&nbsp;</span>
						<span id="voh" class="visual-object-height">0px</span>
					</section>
				</div>
			</div>
			<!-- <div class="floating-menu"></div> -->
		</div>

	</div>
</template>

<script>
	import {mapGetters, mapState} from 'vuex';
	import TemplateSetting from './template/TemplateSetting';
	import ReportSetting from './template/ReportSetting';
	import TabSetting from './template/TabSetting';

	export default {
		name: 'StatConfig',
		components: {TemplateSetting, ReportSetting, TabSetting},
		data(){
			return{
				settingType: 0, // 0|1|2
				settingList : [
					{seq:0, name:'템플릿 설정'},
					{seq:1, name:'보고서 설정'},
					{seq:2, name:'(통계) 탭 배치 설정'}
				],
			}
		},
		filters: {
			toCurrency(value) {
				return !value ? 0 : new Intl.NumberFormat().format(value);
			}
		},

		computed: {
			...mapGetters(['getStatSetting']),
			...mapState(['loadingGif'])
		},
		
		methods:{

			methodThatForcesUpdate() {
				this.$forceUpdate();
			},

			initsSearchList() {
				this.getStatSetting.searchList.data = [];
				this.getStatSetting.searchList.exist = false;
			},

			searchOpen: function() {
				let rst = false;
				if (!this.getStatSetting.searchOpen) {
					rst = true;
				}
				this.getStatSetting.searchOpen = rst;
				this.$store.commit('SET_STAT_OPTION', this.getStatSetting);
			},

			async newLoadData(event, k) {
				switch(k) {
					case 0:
						await this.$refs.template.loadTemplate();
						await this.$refs.report.resetPreview();
						await this.$refs.report.closeValueCalc();
						this.initsSearchList();
						break;
					case 1: // 보고서 설정
						await this.$refs.template.resetPreview();
						await this.$refs.report.loadTemplate();
						await this.$refs.report.loadReport();
						this.initsSearchList();
						break;
					case 2: // 탭 설정
						await this.$refs.tab.loadReport();
						await this.$refs.tab.loadTab();
						await this.$refs.template.resetPreview();
						await this.$refs.report.resetPreview();
						await this.$refs.report.closeValueCalc();
						this.initsSearchList();
						break;
					default:
				}
			},
			

		}, // methods

	};
</script>

<style scoped>
	.dn {display: none}
	.pre_group_set > li.sub-category {
		margin: 0 0px;
	}
	.pre_group_set > li.sub-category label {
		cursor: pointer;
		margin: 0 17px;
	}
	.local_btn_sch {
		float: right;
		background-position: 60px -310px;
	}
	.wrap-margin {
		margin-top:55px;
		margin-bottom: 50px;
	}
	.pre_group .local_btn_sch {
		float: right;
		height: 30px;
		line-height: 28px;
		padding: 0 20px 0 8px;
		font-size: 13px;
		font-weight: 700;
		border: 1px solid #aeaeae;
		background: url(../../assets/images/ico_pre.png) 60px -280px no-repeat;
		background-color: #f2f2f2;
	}
	.pre_group .local_btn_sch a {
		color: #4d4d4d;
	}

	.sub-category label p {
		padding: 0 8px;
	}
	.sub-category label p.stat-setting-selected {
		border: 1px solid;
		border-radius: 5px;
		box-shadow: rgb(181 181 181) 2px 2px 0px 0px;
	}
	

</style>
