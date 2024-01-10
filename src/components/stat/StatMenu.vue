<template>
  <div> <!-- basic -->
    <div v-if="tabList && tabList.length">
      <div class="pre_top sch">
        <ul class="stat">
          <template v-for="(value, index) in tabList">
            <li v-if="!inactive(value)" :class="[index === tabMenuIndex ? 'on common' : 'common']" :key="index"
                @click="selectComponent(index, value)">
              <a :title="value.alias">{{value.alias}}</a>
            </li>
          </template>
        </ul>
        <div v-show="getStatSetting.searchOpen" class="btn_sch off">
          <a @click="searchOpen">검색접기</a>
        </div>
        <div v-show="!getStatSetting.searchOpen" class="btn_sch">
          <a @click="searchOpen">검색열기</a>
        </div>
      </div> <!-- [End] pre_top sch -->
      
      <div v-if="!noReport"> <!-- [Start] StatSearch, MiddleManager -->
        <StatSearch @newModal="fromTabToSearchComponent" @input="statSearch"></StatSearch>
        <h2 class="no-data" v-if="noData">평가된 기사가 없음</h2>
        <div v-show="!noData"> <!-- single-template을 감싸고 있는 태그 -->
          <template v-for="(temp, templIdx) in template_group">
              <MiddleManager :ref="type+templIdx"
                              :componentType="type"
                              :MMIdx="templIdx"
                              @nothing="nothing"
                              :key="'some'+templIdx"></MiddleManager>
          </template>
          <div class="loading" v-if="loadingGif"><img class="loading-image" :src="require('@/assets/images/loading.gif')" alt="Loading..."/></div>
        </div>
      </div>
    </div><!-- [End] StatSearch, MiddleManager -->
    <a v-else-if="loading && (!tabList || !tabList.length)" @click="newTemplate">
      <Alert :kind="'Warning'" :message="'등록된 탭이 존재하지 않습니다. (클릭하여 통계설정 이동)'"/>
    </a>
    <a v-if="loading && (tabList && tabList.length) && noReport" @click="newTemplate">
      <Alert :kind="'Warning'" :message="'보고서 / 템플릿이 존재하지 않습니다. (클릭하여 통계설정 이동)'" />
    </a>

<!-- ************************************************************************************************ -->
<!-- *******************************************보고서 목록****************************************** -->
<!-- ************************************************************************************************ -->
    <input type="checkbox" id="chooseReport" v-model="reportModal"
        @change="(e=>{if(!e.target.checked) getStatSetting.chooseReportSeq = -1;})">
    <label for="chooseReport"></label>
    <div>
      <p class="title">보고서 선택</p>
      <main class="cont">
        <fieldset class="repList">
          <legend>목 록</legend>
          <ul>
            <template v-for="(rep, key) in reportList">
            <li v-if="repListIndex === key" @click="selecting(false, rep, key)" class="normal-font" :key="'tab-rep'+key">{{rep.title}}</li>
            <li v-else @click="selecting(false, rep, key)" :key="'tab-rep'+key">{{rep.title}}</li>
            </template>
          </ul>
        </fieldset>
        <div class="repInfo" :key="'report-list'+reRenRep">
          <fieldset class="choose-rep-title">
            <legend>제 목</legend>
            <span v-if="report != null">{{report.title}}</span>
          </fieldset>

          <fieldset class="choose-rep-des">
            <legend>상세 설명</legend>
            <pre v-if="report != null">{{report.description}}</pre>
          </fieldset>
        </div>
      </main>
      <button class="btn_bl" @click="selecting(true, null)">확인</button>
      <button class="btn_gr" @click="canceling('report')">최소</button>
    </div>

<!-- ************************************************************************************************ -->
<!-- *******************************************사용자 지정****************************************** -->
<!-- ************************************************************************************************ -->
      <input type="checkbox" id="customTemplate" v-model="templateModal">
      <label for="customTemplate"></label>
      <div>
        <p class="title">사용자 지정 통계</p>
        <main class="cont">
          <VsOjOption :SINGLE_TEMPLATE="templArgs" @SearchTemplate="SaveTemporarily"></VsOjOption>
        </main>
      </div>

  </div> <!-- basic -->
</template>

<script>
  import {mapGetters, mapState} from 'vuex';
  import StatSearch from './StatSearch';
  import MiddleManager from '../setting/template/MiddleManager';
  import VsOjOption from '../setting/template/VsOjOption';
  import Alert from '../Alert';
  export default {
    name: 'stat-menu',
    components: {StatSearch, MiddleManager, VsOjOption, Alert},
    computed: {
      // getter를 객체 전개 연산자(Object Spread Operator)로 계산하여 추가합니다.
      ...mapState(['loadingGif']),
      ...mapGetters(['getStatSetting'])
    },
    data() {
      return {
        type: 'statSection'
        // list
        ,tabList: []
        ,reportList: []
        // single
        ,tab: null
        ,report: null
        // etc
        ,tabMenuIndex: 0
        ,repListIndex: -1
        ,template_group: []
        ,temporarySeq: 0
        ,reRenRep: 0

        ,templArgs: null

        ,loading: false
        ,noData: false
        ,noReport: true

        ,reportModal: false
        ,templateModal: false
      }
    },
    async mounted() {
      await this.loadData();
      await this.$nextTick();
      this.loading = true;
      if (!this.tabList || !this.tabList.length) return ;
      let fir = null;
      let idx = 0;
      for (let tab of this.tabList) {
        for (let rep of this.reportList) {
          if ([1,2].includes(tab.skey) || (tab.skey == rep.seq && rep.active == 1)) {
            fir = tab;
            break;
          }
        }
        if (fir != null) break;
        idx++;
      } 
      await this.selectComponent(idx, fir);
      this.getStatSetting.statValue = null; 
      await this.$nextTick();
      // 이 방법 아니면 selectComponent에서 교차-기준으로 진입했을 경우에 this.templateInfo를 세팅해주자
      this.templArgs = {
        seq: null ,
        config: {
          voAlign: null,
          tcObject: null
        }
      }
    },
    watch: {
      reportModal: function(value) { 
        if(value) this.$statConfig.bodyScrolling(false);
        else this.$statConfig.bodyScrolling(true);
      },
      templateModal: function(value) {
        if(value) this.$statConfig.bodyScrolling(false);
        else this.$statConfig.bodyScrolling(true);
      }
    },
    methods: {
      reRenReportList() { this.reRenRep = this.reRenRep > 100 ? 0 : this.reRenRep + 1},
      nothing(value) { this.noData = value; },
      newTemplate() {
        document.location.href = document.location.origin + '/setting/stat-config';
      },
      inactive(tab) {
        for (let re of this.reportList) {
          if (tab.skey == re.seq) {
            return !(re.active == 1);
          }
        }
        return ![1,2].includes(tab.skey);
      },
      searchOpen: function() {
        let rst = false;
        if (!this.getStatSetting.searchOpen) {
          rst = true;
        }
        this.getStatSetting.searchOpen = rst;
        this.$store.commit('SET_STAT_OPTION', this.getStatSetting);
      },

      /**
       * @description: 
       *  report[seq] === tab[skey]
       *  1 : 보고서 목록
       *  2 : 사용자 지정
       * @param: modal = new window
       * @param: _idx = tab index
       * @param: nowReportSeq = now report seq(primary key)
       * @param: pastSeq = past report seq(primary key) - statSearch에서 호출할 때, 사용됨.
       */
      selectComponent(_idx, tab) {
        let nowReportSeq = tab.skey;
        let tabSettingValue = null
        if (tab || tab.value || tab.value.selectTabStatValue)
          tabSettingValue = tab.value.selectTabStatValue;

        this.tabMenuIndex = _idx; // 탭 선택
        this.getStatSetting.preTabMenuIndex = _idx; // 이전 탭 기억
        this.initMiddleManager(); // <MiddleManager> 초기화
        if (this.notFindReportConfig(nowReportSeq)) return ;
        this.getStatSetting.chooseReportSeq = nowReportSeq; // 선택된 탭과 매핑되는 보고서 시퀀스
        
        if (nowReportSeq == 1 || nowReportSeq == 2) {
          this.getStatSetting.report = null; // rep
          this.repListIndex = -1; // rep
          this.getStatSetting.templInfoSettings = []; // templ
          this.template_group = []; // templ
          this.fromTabToSearchComponent(true, nowReportSeq, tabSettingValue);
        }
        else this.fromTabToSearchComponent(false, nowReportSeq, tabSettingValue);
      },

      /**
       * @description: tab과 연결된 report의 config정보(template)를 확인하는 함수
       * @param {number} report.seq
       */
      notFindReportConfig(repSeq) {
        if (repSeq == 1 || repSeq == 2) {
          // (1: 보고서 목록, 2: 사용자 지정)에 해당한다.
          this.noReport = false;
          return false;
        }
        for (let rep of this.reportList) {
          if (repSeq == rep.seq && rep.config.length) {
            this.noReport = false;
            return false;
            // 보고서에 config가 존재할 경우
          }
        } // for
        this.noReport = true;
        return true;
        // 보고서에 config가 없는 경우
      },

      /**
       * @description: <MiddleManager> 초기화
       */
      initMiddleManager() {
        for (let [_, comp] of Object.entries(this.$refs)) {
          if (comp.length <= 0) continue;
          comp[0].onSearch(null, null, false);
        }
      },

      /**
       * @description: 탭의 화면구성, <StatSearch>에 데이터 전달 등을 수행함.
       * @param: modal   (모달창의 활성화 여부)
       * @param: SEQ     (보고서 시퀀스 -기본키)
       * @param: pastSeq (이전 보고서 시퀀스 -기본키)
       */
      async fromTabToSearchComponent(modal, SEQ, tabSettingValue) {
        const isStatReport = (SEQ == 1); // 보고서 목록 띄우기
        const isStatCustom = (SEQ == 2); // 커스텀 템플릿 띄우기
        if (isStatReport) {
          if (modal) {
            this.reportList = await this.$statConfig.funcLoadRecode("list-exc","report");
            await this.$nextTick();
          }
          this.reportModal = modal; // 보고서-목록 모달창 띄우기
        } else if (isStatCustom) {
          this.templateModal = modal; // 사용자-지정-템플릿 모달창 띄우기
        }
        this.getStatSetting.reportInTabView = isStatReport;
        this.getStatSetting.crossInTabView  = isStatCustom;
        this.getStatSetting.showCrossCalc = tabSettingValue.show;
        this.getStatSetting.crossCalcValue = tabSettingValue.tabCalcType;
        this.getStatSetting.numberScale = tabSettingValue.priceUnit;
      },  

      /**
       * @description: 선택된 보고서 시퀀스 임시저장
       */
      async selecting(save, rep, repListIndex) { 
        this.repListIndex = repListIndex;
        if (!save) this.temporarySeq = rep.seq;
        else {
          this.getStatSetting.chooseReportSeq = this.temporarySeq;
          this.reportModal = false;
          this.getStatSetting.report = this.report; // <StatSearch>로 데이터를 보내는 역할
        }
        this.report = rep;
        this.reRenReportList();
      },
      canceling(name) {
        if (name.toLowerCase() === 'report') {
          this.reportModal = false; // 보고서 상세 목록 모달창을 띄우기
          this.getStatSetting.chooseReportSeq = 1 ;
        }
      },

      async SaveTemporarily(config) {
        this.templateModal = false; // 사용자-지정-템플릿 모달창 감추기
        this.getStatSetting.templInfoSettings = config.tcObject;
        this.templArgs.config = config; // 템플릿 만들어내기
        this.template_group = [this.templArgs]; // 템플릿 리스트에 넣기 
      },

      findTemplateInReport(SEQ, template) {
        this.template_group = [];
        for(let [_k, report] of Object.entries(this.reportList)) {
          if (SEQ === report.seq) {
            this.report = report;
            let config = typeof(report.config) === "string" ? JSON.parse(report.config) : report.config;
            for (let [__k, repCig] of Object.entries(config)) {
              for(let [___k, tpe] of Object.entries(template)) {
                if (tpe.active == 1 && repCig.seq === tpe.seq) {this.template_group.push(tpe); break;}
              } 
            } // in-for
            break;
          }
        } // out-for
      },

      async statSearch() {
        try {
          if (!await this.$store.dispatch('loginCheckGentleAPI')) {
              this.$eventBus.$emit('kickOut');
          }
          let num = this.getStatSetting.chooseReportSeq;
          let template = null;
          if (num != 2) { // "사용자 지정"이 아닐 때
            this.reportList = await this.$statConfig.funcLoadRecode("list-exc","report");
            template = await this.$statConfig.funcLoadRecode("list","template");
            await this.findTemplateInReport(num, template);
            // let res = await this.$statConfig.funcJSONRequest(
            //   "/get/template/associated/report.do", {'seq':num}, null, true
            // );
            // this.template_group = res;
            await this.$nextTick();
          }
          template = JSON.parse(JSON.stringify(this.template_group));
          if (template.length == 0) { alert('등록된 템플릿이 없습니다.'); return;}
          this.$store.state.loadingGif = true;
          await this.$refs[this.type + '0'][0].dropSearchValue(); // 기존 데이터 초기화
          await this.$refs[this.type + '0'][0].settingSearchValue(); // 새 데이터 요청
          await this.searchLogic(template);
          this.$store.state.loadingGif = false;
        } catch(e) {
          console.error(e);
        }
      },

      searchLogic(template) {
        const Size = template.length;
        let over = null;
        let tcArr = null;
        let tcSize = 0;
        for (let _i = 0; _i < Size; _i++) {
            if (this.report) over = this.report.config[_i].parentCrossCalc;
            if (this.getStatSetting.crossCalcValue != 0) {
                tcArr = template[_i].config.tcObject;
                tcSize = tcArr.length;
                for (let _j = 0; _j < tcSize; _j++) {
                    if (tcArr[_j].name != 'Text') {
                        tcArr[_j].crossCalc.isPrice = (this.getStatSetting.crossCalcValue == 2);
                        tcArr[_j].crossCalc.priceUnit = this.getStatSetting.numberScale;
                    }
                }
            } else if (over && over.type != 0) { // 0:원본, 1:건수, 2:가치
                tcArr = template[_i].config.tcObject;
                tcSize = tcArr.length;
                for (let _j = 0; _j < tcSize; _j++) {
                    if (tcArr[_j].name != 'Text') {
                        tcArr[_j].crossCalc.isPrice = (over.type == 2);
                        tcArr[_j].crossCalc.priceUnit = over.priceUnit;
                    }
                }
            }
            // dispatcher component로 넘기기
            this.$refs[this.type+ _i][0].onSearch(_i, template[_i], true);
        }
      },


      /**
       * @description : 템플릿 리스트 불러오기
       */
      async loadData() {
        this.reportList = [];
        this.tabList = [];
        // API 호출
        this.reportList = await this.$statConfig.funcLoadRecode("list-exc","report");
        this.tabList = await this.$statConfig.funcLoadRecode("list","tab");
      }, // loadData



    }
  };
</script>

<style>
</style>