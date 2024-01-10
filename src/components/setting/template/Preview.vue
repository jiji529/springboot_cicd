<template>
  <div class="statBox" :style="{width:statWidth}" ref="statBox">
    <div class="cont_wrap stat_cont"> <!-- v-if="ready" -->
      <div :class="'stat_tc_area total_chart'+etcData.index" v-if="crossChart !== null">
        <section class="changeMediaGroup" v-if="req_evg_seq.includes('100555') && !req_evg_seq.includes('111111') && !req_evg_seq.includes('100111') && !req_evg_seq.includes('100222') && !req_evg_seq.includes('100333')">
          <ul>
            <li><input type="checkbox" :id="'mediaGroupByName'+etcData.index" v-model="byName" :value="true" @change="redrawVO">
                <label :for="'mediaGroupByName'+etcData.index"><span></span>이름별 매체 묶어보기</label></li>
            <li><input type="checkbox" :id="'mediaGroupByCode'+etcData.index" v-model="byCode" :value="true" @change="redrawVO">
                <label :for="'mediaGroupByCode'+etcData.index"><span></span>코드별 매체 묶어보기</label></li>
          </ul>
        </section>
        <BarChart v-if="chartType==='1'" :chart-data="crossChart" :chart-options="crossChart.options" :chart-id="'bar'+etcData.index" :plugins="plugins" :width="etcData.size.chrWidth" :height="etcData.size.chrHeight" :etc="etcData"/>
        <HorizontalChart v-else-if="chartType==='2'" :chart-data="crossChart" :chart-options="crossChart.options" :chart-id="'hor'+etcData.index" :plugins="plugins" :width="etcData.size.chrWidth" :height="etcData.size.chrHeight" :etc="etcData"/>
        <LineChart v-else-if="chartType==='3'" :chart-data="crossChart" :chart-options="crossChart.options" :chart-id="'line'+etcData.index" :plugins="plugins" :width="etcData.size.chrWidth" :height="etcData.size.chrHeight" :etc="etcData"/>
        <PieChart v-else-if="chartType==='4'" :chart-data="crossChart" :chart-options="crossChart.options" :chart-id="'pie'+etcData.index" :plugins="plugins" :width="etcData.size.chrWidth" :height="etcData.size.chrHeight" :etc="etcData"/>
        <!-- checkchart -->
      </div> <!-- chart -->

      <div :class="'stat_tc_area total_table'+etcData.index" v-if="crossTable !== null">
        <section class="changeMediaGroup" v-if="req_evg_seq.includes('100555') && !req_evg_seq.includes('111111') && !req_evg_seq.includes('100111') && !req_evg_seq.includes('100222') && !req_evg_seq.includes('100333')">
          <ul>
            <li><input type="checkbox" :id="'mediaGroupByName'+etcData.index" v-model="byName" :value="true" @change="redrawVO">
                <label :for="'mediaGroupByName'+etcData.index"><span></span>이름별 매체 묶어보기</label></li>
            <li><input type="checkbox" :id="'mediaGroupByCode'+etcData.index" v-model="byCode" :value="true" @change="redrawVO">
                <label :for="'mediaGroupByCode'+etcData.index"><span></span>코드별 매체 묶어보기</label></li>
          </ul>
        </section>
        <div>
          <input type="checkbox" id="select" class="selectTable">
          <table v-if="crossTable" :id="'crossChartTable'+etcData.index" :style="{width: etcData.size.width, height: etcData.size.height}"
                border="0" cellspacing="0" cellpadding="0" class="stat_table" data-chartno="7">
            <colgroup>
              <template v-if="rowCnt===1"><col span="1"  width="30%"/></template>
              <template v-if="rowCnt===2"><col span="2"  width="20%"/></template>
              <template v-if="rowCnt===3"><col span="3"  width="10%"/></template>
            </colgroup>

            <thead v-html="crossTable.headTxt">
            </thead>
            <tbody v-if="crossTable.bodyTxt" v-html="crossTable.bodyTxt">
            </tbody>
            <tfoot v-html="crossTable.footTxt">
            </tfoot>
          </table>
        </div>
      </div> <!-- table -->
    </div> <!-- ready -->
  </div> <!-- statBox -->
</template>
<script>
  /* eslint-disable no-console */

  import {mapGetters} from 'vuex';
  import BarChart from '@/components/chart/BarChart';
  import HorizontalChart from '@/components/chart/HorizontalBarChart';
  import LineChart from '@/components/chart/LineChart';
  import PieChart from '@/components/chart/PieChart';

  export default {
    name: 'Preview',
    components: {BarChart, HorizontalChart, LineChart, PieChart},
    
    data() {
      return {
        req_evg_seq: [],
        req_evg_name: [],
        option: {},
        // rawCrossData: {},
        lastEval2Code: [],
        eval1TopInclusion: false,
        calcValue: false,
        calcUnit: null,
        searchDateRange: {},

        byName: false,
        byCode: false,

        testResult: [],
        selectTable: false,

        dateIndex: -1,
        crossTableOp: false,
        loaded: false,
        rowCnt: 0,
        colCnt: 0,
        etcData: {},

        pivot1:0 , // 차트 하단 라벨 조작을 위해 필요한 변수
        pivot2:0 ,

        statWidth: 'auto',
        selectedIndex: undefined,
        selectedDatasetIndex: undefined,

        crossCalcValueDupe: false,
        numberScaleDupe: 1,
        numberScaleTexts: ['원', '천원', '백만원'],
        chartType: '1',
        defaultColors: ['#FFB1C1', '#FFE6AA', '#A0DADA', '#9AD0F5', '#CCB2FF', '#E4E5E7', '#FFD99F', '#86E57F'],
        crossChart: null,
        crossTable: null,
        chartOptions: null,
        commonLabels: [],
        plugins: [],

        totalAxesList: null
      };
    },
    computed: {
      ...mapGetters(['getStatSetting', 'getConfigEval', 'getConfigEvalItem', 'getConfigEvalGroup', 'getDate', 'getNewsGroupInfo', 'getMediaList']),
      mapIndex() {
        let rtn = {mid:[], oid:[]};
        this.getMediaList.forEach(m => {
          rtn.mid[m.media_id] = m;
          rtn.oid[m.media_oid] = m;
        });
        return rtn;
      },
    },

    methods: {

      totalAxes(num) { return this.totalAxesList[num]; },

      async redrawVO() { 
        await this.chartParse();
      },

      // 차트 개별 옵션
      copiesPieProperties(obOption, position='datasets') {
        let obj = {};
        if (obOption.chartType !== '4') return {};
        // 첫번째 옵션 Pie Chart Slice Standout on Hover
        if (obOption.details[3].MouseHoverEvent && position === 'datasets') {
          obj.borderWidth = 1;
          obj.hoverOffset = 10;
        }

        if (obOption.details[3].doughnutFlag && position === 'datasets') {
          obj.borderWidth = 1;
          obj.cutout = obOption.details[3].doughnutHoleSize + '%';
        }
        return obj;
      },
      
      /*
        > 데이터 생성
          this.req_evg_seq
          this.option
          this.eval1TopInclusion
          this.calcValue

        > 테이블 / 차트 정보
          this.crossTable
          this.crossChart

          위와 같은 것들이 메소드에 파라미터로 들어오는 것이 아닌
          전역변수로써 들어온다.
          때문에 위에 변수 각각의 값들을 지역변수로 만들어줘야 한다.
      */
      // 차트 세팅 및 생성
      async chartParse(obIndex, req_evg_seq, option, lineCnt) {
        this.crossTable = null;
        this.crossChart = null; // 초기화 코드가 빠지면 차트의 사이즈를 변경할 때, 오류가 발생할 수 있음.
        const copyConfigEvalItem = JSON.parse(JSON.stringify(this.getConfigEvalItem));
        if(obIndex !== null && obIndex !== undefined && req_evg_seq && option) {
          this.etcData['index'] = obIndex;
          this.req_evg_seq = req_evg_seq;
          this.option      = option;
          this.eval1TopInclusion   = req_evg_seq.includes("10022") || req_evg_seq.includes("10033");
          this.chartType   = option.chartType; // 차트 모형

          this.calcValue   = option.crossCalc ? option.crossCalc.isPrice : null; // 교차-계산 : 건수 | 가치
          this.crossCalcValueDupe = this.calcValue;                              // 교차-계산 : 건수 | 가치
          this.numberScaleDupe = this.calcValue ? option.crossCalc.priceUnit : null;// 금액단위 : 원 | 천원 | 백만원
          if (this.numberScaleDupe !== null) {
            switch(Number(this.numberScaleDupe)) {
              case 0: this.calcUnit = '원'; break;
              case 1: this.calcUnit = '천원'; break;
              case 2: this.calcUnit = '백만원'; break;
              default: '';
            }
          } else {
            this.calcUnit = null;
          }
          if (option.name !== 'Text') {
            this.totalAxesList = [];
            this.option.rowList.crossAxes.forEach(el => {this.totalAxesList.push(el.name);});
            this.option.columnList.crossAxes.forEach(el => {this.totalAxesList.push(el.name);});
          }
        }

        // 시각객체 사이즈 변경
        if (obIndex != undefined && this.option.size !== undefined) { 
          this.etcData['size'] = {};
          // 전부 픽셀로 사이즈를 조정하고 예외적으로 퍼센트 단위가 들어온다면 로직에서 %를 px로 변환하여 값을 넣는다.
          let IsRowSizeInPixels = this.option.size.isPixel;
          this.statWidth = 'auto';
          const W = Number(this.option.size.voWidth) - 10; // margin
          const H = Number(this.option.size.voHeight);
          // if (IsRowSizeInPixels) {
          this.etcData['size']['chrWidth'] = W // chart
          this.etcData['size']['chrHeight'] = H // chart
          this.etcData['size']['width'] = W+'px'; // common
          this.etcData['size']['height'] = H+'px'; // common
          // if (this.option.name == 'Chart' && H == 0) { // 차트는 0픽셀 처리가 어려움으로
          //   this.etcData['size']['chrHeight'] = 450; // chart
          //   this.etcData['size']['height'] = '450px'; // common
          // } else
          if (this.option.name == 'Text' && H == 0) { // 차트는 0픽셀 처리가 어려움으로
            this.etcData['size']['height'] = 'auto'; // common
          }
          // } 
          // else {
          //   const rate = (percentage, fullSize) => {
          //     return parseFloat((percentage / 100) * fullSize);
          //   };
          //   this.etcData['size']['chrWidth'] = rate( W, 1879-(10*lineCnt) ); // padding size를 고려해서
          //   this.etcData['size']['chrHeight'] = H; // chart
          //   this.etcData['size']['width'] = this.etcData['size']['chrWidth']+'px';
          //   this.etcData['size']['height'] = H+'px';
          //   if (this.option.name == 'Text' && H == 0) { // 차트는 0픽셀 처리가 어려움으로
          //     this.etcData['size']['height'] = 'auto'; // common
          //   }
          //   // 단위가 %로 들어왔을 때, 로직
          // }
        }


        if (this.option && this.option.name === 'Text') {
          const op = this.option;
          const parentDiv = this.$refs.statBox; //.querySelector('.statBox');
          const divTag = document.createElement('div');   // span을 감싸는 태그 (위치 조정할 때 쓰임)
          const spanTag = document.createElement('span'); // 글씨의 style을 줄 때 사용

          spanTag.style.fontSize = op.fontSize +'px';
          spanTag.style.color = op.fontColor;
          if (op.fontFamily !== 'none') spanTag.style.fontFamily = op.fontFamily;
          spanTag.style.fontStyle = op.fontStyle;
          spanTag.style.fontWeight = op.fontWeight;
          spanTag.style.letterSpacing = op.fontLetterSpacing + 'px';
          spanTag.style.textDecoration = op.fontTextDecoration;
          spanTag.style.whiteSpace = 'pre-wrap';
          spanTag.textContent = this.fnTitleCodeParser(op.value.text, copyConfigEvalItem);

          divTag.style.textAlign = op.position;
          divTag.style.width = this.etcData['size']['width'];
          divTag.style.height = this.etcData['size']['height'];
          divTag.className = 'text-design';
          divTag.appendChild(spanTag);
          parentDiv.appendChild(divTag);
          return ;
        } 
        if (this.option.name === 'Chart') {
          if (this.option.details[0].legendFlag) {
            this.etcData['legend'] = 
              (this.req_evg_seq.length == 1
                && this.option.details[1].bar
                && this.option.details[0].labelInsteadOfLegend)
              ? false : true;
          } else this.etcData['legend'] = false;
        }
        
        let tableData = {}, tableSumTmp = {}, tableSumRow = {}, tableSumAll = 0, tableASize=0;
        let setting = this.getStatSetting;
        this.searchDateRange = {};
        this.lastEval2Code  = [];  // r축(4차원) 전체 카테고리 종류
        let rawCrossData = {};

        const isFullMedia = this.req_evg_seq.includes('111111');
        const isAutoEval = this.req_evg_seq.includes('100111');
        const isEvalOne = this.req_evg_seq.includes('100222');
        const isEvalTwo = this.req_evg_seq.includes('100333');
        const isEachMedia = this.req_evg_seq.includes('100555');
        if (isEachMedia) {
          for (let [_, type] of Object.entries(this.getStatSetting.mediaTypeList)) {
            for (let [__, info] of Object.entries(type.media)) {
              this.prepareMediaSpecificItems(copyConfigEvalItem, info, info.media_type_name, false);
            }
          }
        }
        let isSPECIAL_GATEGORY = isFullMedia || isAutoEval || isEvalOne || isEvalTwo || isEachMedia;
        // shuffleMedia는 isEvalTwo와 기타 특수항목들은 서로 일반적인 로직으로 계층화를 구현하지 못하므로 새로운 분기점 생성.
        const isM1 = this.req_evg_seq.filter(x => ['10001','10002','10003','10022','10033'].includes(String(x))).length > 1;
        const SPECIAL_GATEGORY = ['111111','100111','100222','100333','100555'];
        this.req_evg_name = [];

        if (this.getStatSetting.statValue.length > 0) {
          let dateRange = [];
          // let dateRangeIrrColStartIdx = this.$moment(setting['dateRange'].startDate).format('MM');
          let rawCrossDataFull = [];
          let ev2ObjMatchAll = true, ev2Objs = {}, ev2ObjIdx = [null, null, null, null];
          let _i0 = '', etc123 = '';
          let ev2Arr = [[],[],[],[]]; 

          
          if (setting.dateType === 1) {
            dateRange = this.getDates(setting.dateRange.startDate, setting.dateRange.endDate, 'MM');
          } else if (setting.dateType === 2) {
            dateRange = this.getDates(setting.dateRange.startDate, setting.dateRange.endDate, 'YYYYMMDD');
          } else if (setting.dateType === 3) { 
            dateRange = this.getDates(setting.dateRange.startDate, setting.dateRange.endDate, 'YYYYMM');
          }
          
          // 이것은 getConfigEvalItem에 날짜에 대한 정보를 삽입하는 과정이다.
          dateRange.map((s) => {
            let s_str = s.toString(), f_str, t_str = s.toString();
            if (setting.dateType === 1) {
              f_str = s_str + '월';
              t_str = '00' + t_str;
              t_str = t_str.substring(t_str.length - 2);
            } else if (setting.dateType === 2) {
              f_str = s_str.substr(6, 2) + '일';
              t_str = s_str;
            } else if (setting.dateType === 3) {
              if (s_str.length === 6) {
                f_str = s_str.substr(0, 4) + '년 ' + s_str.substr(4, 2) + '월';
              } else {
                f_str = s_str.substr(0, 4) + '년 ' + s_str.substr(4, 2) + '월 ' + s_str.substr(6, 2) + '일';
              }
              t_str = s_str;
            }
            // this.commonLabels.push(f_str);
            if (this.req_evg_seq.includes('100001')) {
              let __tmp = {
                class: 'T', group_name: '기간', group_seq: '100001'
                , seq: s, upper_seq: 0, value: f_str
              };
              copyConfigEvalItem['T' + t_str] = __tmp;
              this.searchDateRange['T' + t_str] = __tmp;
            }
          }); // dateRange
          let mediaCategoryOldListRevIdx = [];
          for (let [k,v] of Object.entries(setting.mediaCategoryOldList)) {
            mediaCategoryOldListRevIdx[v.name] = k;
          }


          // 검색된 매체 정보
          // MiddleManager.vue에서 세팅된 값
          for (let rs of this.getStatSetting.statValue) { 
            // let s = JSON.parse(JSON.stringify(rs));
            let s = this.$statConfig.deepCopy(rs);
            // 가격
            s.eval_score_old = s.eval_score; 
            // s.eval_score = Math.trunc(s.eval_score / Math.pow(1000, this.numberScaleDupe));
            // s.eval_score_org = Math.trunc(s.eval_score_org / Math.pow(1000, this.numberScaleDupe));
            s.eval_score = (s.eval_score / Math.pow(1000, this.numberScaleDupe));
            s.eval_score_org = (s.eval_score_org / Math.pow(1000, this.numberScaleDupe));
            
            // let news_date_tmp, news_date_split_tmp = s.scrap_date.split('-'); // 매체 날짜(년-월-일)
            // if (setting.dateType === 1) {                       // 연도 검색
            //   news_date_tmp = Number(news_date_split_tmp[1])-1;
            // } else if (setting.dateType === 2) {                // 연-월 검색
            //   news_date_tmp = Number(news_date_split_tmp[2])-1;
            // } else if (setting.dateType === 3) {                // 연-월-일 검색
            //   news_date_tmp = Number(news_date_split_tmp[1]-dateRangeIrrColStartIdx);
            // }
            
            /*
              기사의 평가항목을 추가
              교차-기준 리스트에 있는 항목들
            */
            if (this.req_evg_seq.includes('100001')) {
              s.eval2.unshift({
                eval2_group_seq: '100001', eval2_name: 'day', eval2_score: 0,
                eval2_seq: 'T' + s.target_date, eval2_upper_name: null
              });
            } // 기간을 기준으로 지정했다면... t를 '평가2'로서 변형해 넣음
            if (this.req_evg_seq.includes('100002')) {
              s.eval2.unshift({
                eval2_group_seq: '100002', eval2_name: 'media_category', eval2_score: 0,
                eval2_seq: 'MC' + s.media_category, eval2_upper_name: null
              });
            } // 매체분류을 기준으로 지정했다면... '평가2'로서 변형해 넣음
            if (this.req_evg_seq.includes('100003')) {
              s.eval2.unshift({
                eval2_group_seq: '100003', eval2_name: 'media_type', eval2_score: 0,
                eval2_seq: 'MT' + s.media_type, eval2_upper_name: null
              });
            } // 매체유형을 기준으로 지정했다면... '평가2'로서 변형해 넣음
            if (this.req_evg_seq.includes('100004')) {
              s.eval2.unshift({
                eval2_group_seq: '100004', eval2_name: 'media_category_name_old', eval2_score: 0,
                eval2_seq: 'MO' + mediaCategoryOldListRevIdx[s.category_name_old], eval2_upper_name: null
              });
            } // 매체구분류을 기준으로 지정했다면... '평가2'로서 변형해 넣음
            if (this.req_evg_seq.includes('100111')) {
              s.eval2.unshift({
                eval2_group_seq: '100111', eval2_name: 'auto_eval', eval2_score: 0,
                eval2_seq: null ,  eval2_upper_name: '전체'
              });
            } // 교차-기준 (자동평가)를 기준으로 지정했다면... '평가2'로서 변형해 넣음
            if (this.req_evg_seq.includes('100333')) {
              s.eval2.unshift({
                eval2_group_seq: '100333', eval2_name: 'eval_two', eval2_score: 0,
                eval2_seq: null ,  eval2_upper_name: '평가별(평가2)'
              });
            } // 교차-기준 (평가2)를 기준으로 지정했다면... '평가2'로서 변형해 넣음
            if (this.req_evg_seq.includes('100555')) {
              s.eval2.unshift({
                eval2_group_seq: '100555', eval2_name: 'e_media', eval2_score: 0,
                eval2_seq: null ,  eval2_upper_name: null
              });
            } // 교차-기준 (매체별)를 기준으로 지정했다면... '평가2'로서 변형해 넣음
            if (this.req_evg_seq.includes('111111')) {
              s.eval2.unshift({
                eval2_group_seq: '111111', eval2_name: 'full_media', eval2_score: 0,
                eval2_seq: null ,  eval2_upper_name: null
              });
            } // 교차-기준 (전체)를 기준으로 지정했다면... '평가2'로서 변형해 넣음
            
            let tmpCfg = null;
            let dupl_seq = null;
            if (s.eval1_seq) { // 평가 1 항목이 존재한다면.
              tmpCfg = copyConfigEvalItem['M1' + s.eval1_seq];
              if (this.req_evg_seq.includes('111111') || this.req_evg_seq.includes('100222')) { 
                // 평가별(전체) 항목이 평가1를 읽어들일 수 있도록...
                s.eval2.unshift({
                  eval2_group_seq: '100222', eval2_name: 'eval_one', eval2_score: 0,
                  eval2_seq: 'M1-f'+s.eval1_seq ,  eval2_upper_name: '평가별(평가2)'
                });
              } // 교차-기준 (평가1)를 기준으로 지정했다면... '평가2'로서 변형해 넣음
              if (this.eval1TopInclusion) { // 평가1에 대해서는 예외적인 데이터 세팅이 필요함.
                if (this.req_evg_seq.includes('10022')) {
                  s.eval2.push({
                    eval2_group_seq: '10022',
                    eval2_name: 'b' + 2,
                    eval2_score: 'c' + 2,
                    eval2_seq: 'M1-m' + tmpCfg.rel_seq[1],
                    eval2_upper_name: 'e' + 2
                  });
                }
                if (this.req_evg_seq.includes('10033')) {
                  s.eval2.push({
                    eval2_group_seq: '10033',
                    eval2_name: 'b' + 3,
                    eval2_score: 'c' + 3,
                    eval2_seq: 'M1-s' + tmpCfg.rel_seq[2],
                    eval2_upper_name: 'e' + 3
                  });
                }
              } 
              for (let [k,v] of Object.entries(tmpCfg.rel_seq)) { // 평가1 기본값 세팅
                if (dupl_seq == v) continue;
                dupl_seq = v;
                s.eval2.push({
                  eval2_group_seq: 10001 + Number(k),
                  eval2_name: 'b' + k,
                  eval2_score: 'c' + k,
                  eval2_seq: 'M1' + v,
                  eval2_upper_name: 'e' + k
                });
              } dupl_seq = null;
            } // if s.eval1_seq
            
            
            // 교차 기준에 있는 데이터 찾기
            ev2Objs = new Object();      // 임시 저장변수
            s.eval2.forEach((v,i)=> {    // s: 기사 or v: eval2               
              /* 
                s: (statValue-기사)
                  L v: (eval2)
                      L eval2_group_seq
                      L eval2_seq
              */
              ev2Objs[v.eval2_group_seq] = v.eval2_seq;
            });
            /* eval2에 항목(교차-기준)를 전부 가지고 있는 s(기사)만 골라낸다. (필터)
              ex) s.eval2        ---> {크기, 글자수}
                  항목(교차-기준) ---> [크기]
                  위와 같은 조건일 경우, 필터링 통과 (=ev2ObjMatchAll true)
              ex) s.eval2        ---> {크기, 글자수}
                  항목(교차-기준) ---> [글자수, 출입기자]
                  위와 같은 조건일 경우, 필터링 불통과 (=ev2ObjMatchAll false)
            */
            ev2ObjMatchAll = true;
            this.req_evg_seq.forEach(q => {
              if (SPECIAL_GATEGORY.includes(q)) return;
              ev2ObjMatchAll = ev2ObjMatchAll && ev2Objs.hasOwnProperty(q);
            });

            // 옵 1 => [x..][...]
            // 옵 2 => [x..][y..][...]
            // 옵 2 => [x..][y..][z..][...]
            if (ev2ObjMatchAll) { // 데이터 필터링
              ev2Arr = [[],[],[],[]];
              let crossLength = this.req_evg_seq.length;
              let _code = null;
              ev2ObjIdx[0] = ev2Objs[this.req_evg_seq[0]];
              ev2ObjIdx[1] = ev2Objs[this.req_evg_seq[1]];
              ev2ObjIdx[2] = ev2Objs[this.req_evg_seq[2]];
              ev2ObjIdx[3] = ev2Objs[this.req_evg_seq[3]];

              //===================================================================================================//
              //=============================================[media eval]==========================================//
              //===================================================================================================//
              if (isEachMedia) { // 매체별 데이터 세팅 (반복문을 필요로 하지 않는 상황)
                let mmi = this.req_evg_seq.indexOf('100555');
                let mt = this.getStatSetting.mediaTypeList[s.media_type]['name'];
                ev2ObjIdx[mmi] = null;
                _code = this.prepareMediaSpecificItems(copyConfigEvalItem, s, mt, true);
                
                ev2ObjIdx[mmi] = _code;
              }

              for (let att of s.eval2) { // 평가2 속성 반복
                let valueNotSearched = String(att.eval2_group_seq);
                
                //===================================================================================================//
                //=============================================[auto eval]===========================================//
                //===================================================================================================//
                if (isAutoEval) { // [자동평가] 데이터 세팅
                  let ami = this.req_evg_seq.indexOf('100111');
                  ev2ObjIdx[ami] = null;
                  const _seq = att.eval2_seq;
                  if (this.checkItemGroup(this.getConfigEval, att.eval2_group_seq, "AT")) { // AT (=자동평가)
                    ev2ObjIdx[ami] = 'AM-' + _seq;
                  } // if (this.checkItemGroup)
                }
                
                //===================================================================================================//
                //===============================================[eval 2]============================================//
                //===================================================================================================//
                if (isEvalTwo) { // [평가2] 데이터 세팅 
                  let tmti = this.req_evg_seq.indexOf('100333');
                  ev2ObjIdx[tmti] = null;
                  const _seq = att.eval2_seq;
                  if (this.checkItemGroup(this.getConfigEval, att.eval2_group_seq, "M2")) { // M2 (=평가2)
                    ev2ObjIdx[tmti] = 'E2-' + _seq;
                  } // if (this.checkItemGroup)
                  
                }

                //===================================================================================================//
                //==============================================[all eval]===========================================//
                //===================================================================================================// 
                if (isFullMedia) { // [평가별 전체]에 대한 데이터 세팅이 이루어지는 곳 
                  let fmi = this.req_evg_seq.indexOf('111111'); 
                  ev2ObjIdx[fmi] = null;
                  const _seq = att.eval2_seq;
                  if (_seq && valueNotSearched != '100001' &&
                      ! (valueNotSearched == '10001' 
                      || valueNotSearched == '10002' 
                      || valueNotSearched == '10003'
                      || valueNotSearched == '10022' 
                      || valueNotSearched == '10033')) {
                    ev2ObjIdx[fmi] = 'FM-'+_seq;
                  }
                }
              
                //===================================================================================================//
                //===============================================[eval 1]============================================//
                //===================================================================================================//
                if (isEvalOne) { // [평가1] 데이터 세팅 
                  let tmoi = this.req_evg_seq.indexOf('100222');
                  ev2ObjIdx[tmoi] = null;
                  if ( s.eval1_seq && valueNotSearched == '100222') {
                    ev2ObjIdx[tmoi] = att.eval2_seq;
                  }
                }

                //===================================================================================================//
                //==========================================[eval 1 top level]=======================================//
                //===================================================================================================//
                if (this.eval1TopInclusion && s.eval1_seq) {
                  let moi = this.req_evg_seq.indexOf('10022'); ev2ObjIdx[moi] = null;
                  let loi = this.req_evg_seq.indexOf('10033'); ev2ObjIdx[loi] = null;
                  

                  if (['10022','10033'].includes(valueNotSearched)) {
                    if (valueNotSearched == '10022' && moi != -1) ev2ObjIdx[moi] = att.eval2_seq;
                    if (valueNotSearched == '10033' && loi != -1) ev2ObjIdx[loi] = att.eval2_seq;
                  }
                }

                // 데이터 축적하기
                if (ev2ObjIdx[0]) ev2Arr[0].push(ev2ObjIdx[0]);
                if (ev2ObjIdx[1]) ev2Arr[1].push(ev2ObjIdx[1]);
                if (ev2ObjIdx[2]) ev2Arr[2].push(ev2ObjIdx[2]);
                if (ev2ObjIdx[3]) ev2Arr[3].push(ev2ObjIdx[3]);
                ev2ObjIdx[0] = null;
                ev2ObjIdx[1] = null;
                ev2ObjIdx[2] = null;
                ev2ObjIdx[3] = null;

                if (!isFullMedia && 
                    !isAutoEval &&
                    !isEvalOne && 
                    !isEvalTwo && 
                    !this.eval1TopInclusion) break;
              } // for-eval2
              _code = null;

              /**
               * @description 축적된 데이터 세팅하기
               */
              if (this.option.chartType !== '3' && ev2Arr[0]) {
                for(let a of ev2Arr[0]) { // 첫번째 반복문은 사용될 이유가 없음
                  if (crossLength == 1) this.dataIntersection(rawCrossData, crossLength, s, a, null, null, null);
                  for(let b of ev2Arr[1]) {
                    if (crossLength == 2) this.dataIntersection(rawCrossData, crossLength, s, a, b, null, null);
                    for(let c of ev2Arr[2]) {
                      if (crossLength == 3) this.dataIntersection(rawCrossData, crossLength, s, a, b, c, null);
                      for(let d of ev2Arr[3]) {
                        this.dataIntersection(rawCrossData, crossLength, s, a, b, c, d);
                      } // 4
                    } // 3
                  } // 2
                } // 1
              } else if (this.option.chartType === '3' && ev2Arr[0]) {
                /*
                  교차-기준 1개     => obj[0]    = data
                  교차-기준 2 ~ 4개 => obj[0][0] = data
                */
                // 가정 : 무조건 하나 이상의 교차-기준(데이터)가 들어온다.
                for(let a of ev2Arr[0]) { // 첫번째 반복문은 사용될 이유가 없음
                  _i0 = 'x' + a;
                  if (!rawCrossData[_i0]) rawCrossData[_i0] = []; // 사전에 1차원 배열 생성
                  if (crossLength == 1) rawCrossData[_i0].push(s);
                  if (crossLength >= 2) {
                    etc123 = '';
                    for(let b of ev2Arr[1]) {
                      etc123 = 'r' + b;
                      if (!rawCrossData[_i0][etc123]) rawCrossData[_i0][etc123] = [];
                      if (!this.lastEval2Code.includes(etc123)) this.lastEval2Code.push(etc123);
                      rawCrossData[_i0][etc123].push(s);
                    } // for
                  } // if - 2
                  if (crossLength >= 3) {
                    etc123 = '';
                    for(let b of ev2Arr[2]) {
                      etc123 = 'r' + b;
                      if (!rawCrossData[_i0][etc123]) rawCrossData[_i0][etc123] = [];
                      if (!this.lastEval2Code.includes(etc123)) this.lastEval2Code.push(etc123);
                      rawCrossData[_i0][etc123].push(s);
                    } // for
                  } // if - 3
                  if (crossLength == 4) {
                    etc123 = '';
                    for(let b of ev2Arr[3]) {
                      etc123 = 'r' + b;
                      if (!rawCrossData[_i0][etc123]) rawCrossData[_i0][etc123] = [];
                      if (!this.lastEval2Code.includes(etc123)) this.lastEval2Code.push(etc123);
                      rawCrossData[_i0][etc123].push(s);
                    } // for
                  } // if - 4
                }
              } // else-if [데이터 세팅]
              ev2Arr = null;
            } // ev2ObjMatchAll-if

          } // [END] statValue
          
          for (let a of this.req_evg_seq) {
            this.req_evg_name.push(this.getConfigEvalGroup[a].name);
          }

          if(this.option.chartType === '3') {
            if (this.req_evg_seq.length === 1) {
              rawCrossDataFull['e0'] = {};
              rawCrossDataFull['e0']['e0'] = {};
              rawCrossDataFull['e0']['e0']['e0'] = rawCrossData;
            } else {
              rawCrossDataFull['e0'] = {};
              rawCrossDataFull['e0']['e0'] = rawCrossData;
            }
          } else {
            if (this.req_evg_seq.length === 1) {
              rawCrossDataFull['e0'] = {};
              rawCrossDataFull['e0']['e0'] = {};
              rawCrossDataFull['e0']['e0']['e0'] = rawCrossData;
            } else if (this.req_evg_seq.length === 2) { // 옵션 택2
              rawCrossDataFull['e0'] = {};
              rawCrossDataFull['e0']['e0'] = rawCrossData;
            } else if (this.req_evg_seq.length === 3) { // 옵션 택3
              rawCrossDataFull['e0'] = rawCrossData;
            } else {                                    // 옵션 택4
              rawCrossDataFull = rawCrossData;
            } // xyz 갯수대로 밀어내기
          }
          rawCrossData = null;
          
          // 알고리즘
          /* 
            ex) 기간   - 1 ~ 12월 12개 배열 생성 -> 값 삽입
                글자수 - 소, 중, 대 3개 배열 생성 -> 값 삽입
                크기   - 소, 중, 대 3개 배열 생성 -> 값 삽입
          */
          for (let [xk,xv] of Object.entries(rawCrossDataFull)) { // ex) xk: xT05 ..., xv: [y2:Array, y3:Array, y1:Array]
            if (!tableData[xk]) { //tableData[] 선언
              tableData[xk] = {};
            }

            for (let [yk,yv] of Object.entries(xv)) { // ex) yk:y2..., yv:Array...
              if (!tableData[xk][yk]) { //tableData[][] 선언
                tableData[xk][yk] = {};
              }

              for (let [zk,zv] of Object.entries(yv)) { // ex) zk:z4..., zv:t05...
                if (!tableData[xk][yk][zk]) { //tableData[][][] 선언
                  tableData[xk][yk][zk] = {};
                }
                tableSumTmp = 0;

                if (this.option.chartType === '3') {
                  for (let [tk,tv] of Object.entries(zv)) { // real data
                      if (!tableData[xk][yk][zk][tk]) tableData[xk][yk][zk][tk] = 0
                      tv.forEach(tvs => { //tvs: 기사
                        /* line Chart는 무조건 2차원이다. */
                        let addValue = this.calcValue ? Number(tvs.eval_score) : 1;
                        tableData[xk][yk][zk][tk] = this.prn(tableData[xk][yk][zk][tk], addValue);
                        tableSumAll = this.prn(tableSumAll, addValue);
                      });
                  }// for
                
                } else {
                  for (let lastCode of this.lastEval2Code) {
                    if (!zv[lastCode]) continue; // If the code does not exist
                    if (!tableData[xk][yk][zk][lastCode]) tableData[xk][yk][zk][lastCode] = 0
                    for (let media of zv[lastCode]) {
                      let addValue = this.calcValue ? Number(media.eval_score) : 1;
                      tableData[xk][yk][zk][lastCode] = this.prn(tableData[xk][yk][zk][lastCode], addValue);
                      tableSumAll = this.prn(tableSumAll, addValue);
                    }
                  }
                } // if-else 
                tableSumRow[xk + '_' + yk + '_' + zk] = tableSumTmp;
                tableASize++;
              }
            } // for tableData
          } // for rawCrossDataFull
          
          // 정렬
          let tableDataSort = {}; // WIP
          Object.keys(tableData).sort().forEach(xk => {
            if (!tableDataSort[xk]) {
              tableDataSort[xk] = {};
            }
            Object.keys(tableData[xk]).sort().forEach(yk => {
              if (!tableDataSort[xk][yk]) {
                tableDataSort[xk][yk] = {};
              }
              Object.keys(tableData[xk][yk]).sort().forEach(zk => {
                if (!tableDataSort[xk][yk][zk]) {
                  tableDataSort[xk][yk][zk] = {};
                }
                tableDataSort[xk][yk][zk] = tableData[xk][yk][zk];
              });
            });
          });
          tableData = tableDataSort; // 카테고리별 건수 데이터를 확보
          rawCrossDataFull = null;

          if (this.option.name === 'Table') {
            // 테이블
            this.crossTable = 
              Object.freeze(
                await this.makeCrossTable(tableData, this.req_evg_seq, setting, copyConfigEvalItem
                                          , dateRange, this.option, tableASize, isM1));
            this.$nextTick(() => {
              this.alignTable(this.getStatSetting.numberScale);
            });
          } else {
            // 차트
            const tempChart =
              await this.makeCrossChart(tableData, this.req_evg_seq, copyConfigEvalItem, this.option
                                      , this.chartOptions, this.calcValue, tableSumAll, tableASize, isSPECIAL_GATEGORY );
            await tempChart.setPieMode(this.chartType);
            this.crossChart = Object.freeze(tempChart);
          }
          this.commonLabels = [];
        } // statValue.length > 0
        this.loaded = true; // 모든 옵션이 세팅된 후에 차트가 그려져야 한다.
      }, // chartParse





      //==================================================== [Make Table] ====================================================//
      /**
       * @description : 테이블 객체 구현
       * 
       * @param :
       *     dateRange
       *    ,req_evg_seq
       *    ,getStatSetting
       *    ,getConfigEvalItem
       *    ,tableData
       *    ,option
       *    ,tableASize
       *    ,isM1
       * @returns : Object
       */
      async makeCrossTable(tableData
                        , req_evg_seq
                        , getStatSetting
                        , getConfigEvalItem
                        , dateRange
                        , option
                        , tableASize
                        , isM1 ) {
                          
        // 비어있는 데이터 삭제하기
        let eraseZeroData = {}; 
        for (let [xk,xv] of Object.entries(tableData)) {
          if(!eraseZeroData[xk]) eraseZeroData[xk] = {};
          for (let [yk,yv] of Object.entries(xv)) { 
            if(!eraseZeroData[xk][yk]) eraseZeroData[xk][yk] = {};
            for (let [zk,zv] of Object.entries(yv)) { 
              if(!eraseZeroData[xk][yk][zk]) eraseZeroData[xk][yk][zk] = {};
              for (let [rk,rv] of Object.entries(zv)) {
                if (Number(rv) !== 0) {
                  if(!eraseZeroData[xk][yk][zk][rk]) eraseZeroData[xk][yk][zk][rk] = rv;
                }
              } if (!Object.keys(eraseZeroData[xk][yk][zk]).length) delete eraseZeroData[xk][yk][zk];
            } if (!Object.keys(eraseZeroData[xk][yk]).length) delete eraseZeroData[xk][yk];
          } if (!Object.keys(eraseZeroData[xk]).length) delete eraseZeroData[xk];
        } 
        tableData = null;

        // 데이터 형태 바꾸기
        let changeData = {};
        for (let [xk,xv] of Object.entries(eraseZeroData)) {
          if (xk !== 'e0') { changeData = eraseZeroData; break; }
          for (let [yk,yv] of Object.entries(xv)) { 
            if (yk !== 'e0') { changeData = xv; break; }
            for (let [zk,zv] of Object.entries(yv)) { 
              if (zk !== 'e0') { changeData = yv; break; }
              changeData = zv;
            }
          }
        }
        eraseZeroData = null;

        // ======== 변수 선언 ========
        let optionLength = option.crossAxesLength;     // 설정 전체 길이
        let showBlank    = option.showBlank;           // 항목 표시/삭제 옵션
        let dateType     = getStatSetting.dateType;
        let row          = option.rowList.itemLen;     // row 수
        let col          = option.columnList.itemLen;  // column 수
        let rowArr=[],   columnArr=[];
        let selectItem = [];
        const __op = option.optionName;
        const __len= __op.length
        for (let i=0; i<__len; i++) { selectItem.push(__op[i].act) }
        // ======== 변수 초기화 ========
        this.rowCnt         = row;

      
        /* --알고리즘--
          ex) req_evg_seq[크기, 글자수, 매체중요도, 출입기자]
              행- 크기(index: 0), 글자수(index: 1)
              열- 매체중요도(index: 2), 출입기자(index: 3)
              rowArr    = for 0~1
              columnArr = for 2~3
        */
        // ======== 항목 목록 생성 ========
        rowArr = await this.setSubcodeForSpecificGroup(req_evg_seq, getConfigEvalItem
          , dateType, dateRange // 날짜
          , 0, row);            // row 범위
        columnArr = await this.setSubcodeForSpecificGroup(req_evg_seq, getConfigEvalItem
          , dateType, dateRange // 날짜
          , row, optionLength); // column 범위
          
        let axisIdx=0;
        let rStruc = {}, cStruc = {};
        // row
        [rStruc, axisIdx] = await this.codeLayering(rowArr, optionLength, axisIdx);
        // column
        [cStruc, axisIdx] = await this.codeLayering(columnArr, optionLength, axisIdx);

        if (option.M1Active && isM1) {
          if (row > 1) await this.snatcher(rStruc, getConfigEvalItem, req_evg_seq.slice(0,row), changeData);
          if (col > 1) await this.snatcher(cStruc, getConfigEvalItem, req_evg_seq.slice(row, row+col), changeData);
        }
		
        /* rt (run time)
          changeData : table data를 변형한 것
          row        : 행의 수 (number)
          col        : 열의 수 (number)
          rStruc     : 행의 구조 (object)
          cStruc     : 열의 구조 (object)
          showBlank  : 항목 표시/삭제/선택
          selectItem : 선택된 항목 목록
        */
        let [head, body, foot] = await this.run(getConfigEvalItem, changeData, row, col, rStruc, cStruc, showBlank, selectItem);

        return {
          headTxt:head
          ,bodyTxt:(body.trim()=='') ? null : body
          ,footTxt:foot
          ,tableASize:tableASize
        }

      }, // makeCrossTable [End]

      // tableHeight(rowArray, colArray) {
      //   let result;
      //   if (rowArray[0]) result = Object.values(rowArr[0]).length
        
      // },





      //==================================================== [Make Chart] ====================================================//
      /**
       * @description : 차트 객체 구현
       * 
       * @param : .
       * 
       * @returns : Object
       */
      async makeCrossChart(chartData, req_evg_seq, evalItem, obOption
                        , baseChartOptions, calcValue, tableSumAll, tableASize, isSPECIAL_GATEGORY ) { // 교차분석
        // 교차-기준 : true=원,천원,백만원  / false='건'
        let finalSuffix = calcValue ? this.numberScaleTexts[this.numberScaleDupe] : '건';
        if (!calcValue) { this.numberScaleDupe = 1; }

        let crossDatasetsX = [], crossDatasetsY = [], crossDatasetsZ = [], crossDatasetsR = []
          , crossBackgroundColorsBar = [], crossBackgroundColorsBarSingle = '', crossHoverBackgroundColorsBar = []
          , crossBackgroundColorsPie = [], crossHoverBackgroundColorsPie = []; // CHART_COMMON
        let crossLabelsBar = [], crossDatasetsBar = []; // CHART_BAR -- 'rgba(' + (randomRtmp + 25) + ', ' + (randomGtmp + 25) + ', ' + (randomBtmp + 25) + ', 0.6)';
        let crossLabelsPieText = [], crossDatasetsPie = [], crossDatasetsSumTree = {}, crossLabelsPieKeys = [], crossLabelsPieGroupKeys = [], crossLabelsPieRootKeys = []; // CHART_PIE
        let tableDataCountTree = {}; // TABLE
        let /*tableSumTmp = 0,*/ tmpCrossDataBar, tmpCrossDataPie = []; // TMP
        let crossDatasetsPieX = [], crossDatasetsPieY = [];
        let crossPieSumX=[], crossPieSumY=[], crossPieSumZ=[], originData=[];
        this.pivot1 = 0, this.pivot2 = 0;

        // 활성 상태인 교차-기준(항목) 옵션 뽑아내기
        let _itemOption = obOption.rowList.crossAxes.filter(e => {
          if (e.useTheOption) {
            return e.chartItemOption;
          }
        });

        let funcSort = (obj) => {
          return Object.keys(obj).sort().reduce(function (newObj, key) {
                    newObj[key] = obj[key];
                    return newObj;
                  }, {});
        };
        
        // 컬러 랜덤생성 함수
        let backgroundColors = [], hoverBackgroundColors = [];
        const randColor = (x) => {
          let randomRtmp = Math.floor((Math.random() * 130) + 100);
          let randomGtmp = Math.floor((Math.random() * 130) + 100);
          let randomBtmp = Math.floor((Math.random() * 130) + 100);
          backgroundColors[x] = 'rgba(' + randomRtmp + ', ' + randomGtmp + ', ' + randomBtmp + ', 0.8)';
          hoverBackgroundColors[x] = 'rgba(' + (randomRtmp + 25) + ', ' + (randomGtmp + 25) + ', ' + (randomBtmp + 25) + ', 0.6)';
        };

        // 데이터 모양 바꾸기
        let changeData = {};
        for (let [xk,xv] of Object.entries(chartData)) {
          if (xk !== 'e0') { changeData = chartData; break; }
          for (let [yk,yv] of Object.entries(xv)) { 
            if (yk !== 'e0') { changeData = xv; break; }
            for (let [zk,zv] of Object.entries(yv)) { 
              if (zk !== 'e0') { changeData = yv; break; }
              changeData = zv;
            }
          }
        }

        let chartTitleText = '', chartSubtitleText = '';
        this.etcData['text'] = {};
        let mainTitle = null;
        let subTitle = null;
        if (this.option['title'] !== undefined) {
          mainTitle = this.option.title.main.text;
          subTitle = this.option.title.sub.text;
          if (mainTitle !== '' && mainTitle !== undefined) { // 제목 키워드 분석
            mainTitle = mainTitle.replace('#{제목}#', () => {
              let str = [];
              this.req_evg_seq.forEach((el, i) => {
                str.push("#{통계항목"+(i+1)+"}#");
              });
              return "#{검색기간}# : " + str.join(' - ');
            });
            
            chartTitleText = this.fnTitleCodeParser(mainTitle);  
          }
          if ( subTitle !== '' && subTitle !== undefined) {  // 부제목 키워드 분석
            chartSubtitleText = this.fnTitleCodeParser(subTitle);
            this.etcData['text']['subtitle'] = { // 차트로 부제목 전달
              message: chartSubtitleText
              ,color: 'gray'
              ,font: {weight:'bold',size: '15px'}
            };
          }
        } 
        this.etcData['text']['title'] = {  // 차트로 제목 전달
          message: chartTitleText
          ,color: 'black'
          ,font: { weight:'bold',size: '20px'}
        };

        if (!Object.keys(changeData).length) {
          this.etcData['text']['title']['message'] = this.req_evg_name.join(' > ');
        }
        
        // 스크랩 기사 통계를 구현하기 위한 날짜 로직
        // 지정 기간에 해당하는 값을 불러온다.
        if (this.req_evg_seq.includes('100001') && obOption.details[1].date12 && req_evg_seq.length == 2) {
          let one = true;
          let keyDupl = {};
          for(let [_k, _v] of Object.entries(changeData)) {
            if (_k.includes("T")) {
              if (one) {
                for (let [dk, dv] of Object.entries(this.searchDateRange)) {
                  if (!changeData['x'+dk]) changeData['x'+dk] = {};
                }
                one = false;
              } // if(one)
              for(let [_k2, _v2] of Object.entries(_v)) {
                if (!keyDupl[_k2]) keyDupl[_k2] = {};
              }
            } else {
              for(let [_k2, _v2] of Object.entries(_v)) {
                for (let __d = 1; __d <= 12; __d++) {
                  if (!changeData[_k]) changeData[_k] = {};
                  for (let [dk, dv] of Object.entries(this.searchDateRange)) {
                    if (!changeData[_k]['r'+dk]) changeData[_k]['r'+dk] = 0;
                  }
                }
              }
            } // if-else
          } // for
          for(let [_k, _v] of Object.entries(changeData)) {
            let tmpCnt = Object.values(_v).length;
            for(let [name, __] of Object.entries(keyDupl)) {
              if (tmpCnt === 0) {
                if (!changeData[_k][name]) changeData[_k][name] = 0;
              }
            }
          }
        } // if

        /**
         * @description
         *   - 아래의 데이터 구조 생성
         *    ex) 3차원일 때, 데이터 구조
         *          crossDatasetX : [x1, x2, x3]
         *          crossDatasetY : [y4, y5, y6]
         *          crossDatasetZ : [r11, r12]
         *          ...
         *        1차원일 때, 데이터 구조
         *          crossDatasetZ : [r1, r2, r3]
         * 
         *   - Pie 차트를 만들때 사용할 데이터 구조 생성
         *     ex) 3차원일 때, 구조 (X-크기, Y-글자수, Z-매체중요도)
         *           crossPieSumX    :
         *              [3, 5, 2] // 대, 중 소
         *           crossPieSumY    : 
         *              [
         *                1, 2,   // 대- 대
         *                2, 2, 1 // 중- 대,중,소
         *                2,      // 소- 소
         *              ]
         *           originData(meta):
         *              [
         *                1, 1, 1, // 대-대- A, B, C
         *                1,1,2,1, // 대-대- A, B, C, 미할당
         *                2        // 대-대- 미할당
         *              ]
         */
        let checkItem = []; 
        changeData = funcSort(changeData);
        for (let [xk,xv] of Object.entries(changeData)) {
          if (!crossDatasetsX.includes(xk)) {
            crossDatasetsX.push(xk);
            randColor(xk);
          }
          if (Object.keys(xv).length === 0) originData.push(xv);

          xv = funcSort(xv);
          for (let [yk,yv] of Object.entries(xv)) {
            if (!crossDatasetsY.includes(yk)) {
              crossDatasetsY.push(yk);
              randColor(yk);
            }
            if (Object.keys(yv).length === 0) {
              if (!crossPieSumX[xk+'Sum']) crossPieSumX[xk+'Sum'] = 0;
              if (Object.keys(crossPieSumX).includes(xk+'Sum')) crossPieSumX[xk+'Sum'] += yv;
              originData.push(yv);
              checkItem.push(xk + yk);
            } 

            yv = funcSort(yv);
            for (let [zk,zv] of Object.entries(yv)) {
              if (!crossDatasetsZ.includes(zk)) {
                crossDatasetsZ.push(zk);
                randColor(zk);
              }
              if (Object.keys(zv).length === 0) {
                if (!crossPieSumX[xk+'Sum']) crossPieSumX[xk+'Sum'] = 0;
                if (!crossPieSumY[xk+yk+'Sum']) crossPieSumY[xk+yk+'Sum'] = 0;
                if (Object.keys(crossPieSumX).includes(xk+'Sum')) crossPieSumX[xk+'Sum'] += zv;
                if (Object.keys(crossPieSumY).includes(xk+yk+'Sum')) crossPieSumY[xk+yk+'Sum'] += zv;
                originData.push(zv);
                checkItem.push(xk + yk);
                checkItem.push(xk + yk + zk);
              }

              zv = funcSort(zv);
              for (let [rk,rv] of Object.entries(zv)) {
                if (!crossDatasetsR.includes(rk)) {
                  crossDatasetsR.push(rk);
                  randColor(rk);
                }
                if (!crossPieSumX[xk+'Sum']) crossPieSumX[xk+'Sum'] = 0;
                if (!crossPieSumY[xk+yk+'Sum']) crossPieSumY[xk+yk+'Sum'] = 0;
                if (!crossPieSumY[xk+yk+zk+'Sum']) crossPieSumY[xk+yk+zk+'Sum'] = 0;
                if (Object.keys(crossPieSumX).includes(xk+'Sum')) crossPieSumX[xk+'Sum'] += rv;
                if (Object.keys(crossPieSumY).includes(xk+yk+'Sum')) crossPieSumY[xk+yk+'Sum'] += rv;
                if (Object.keys(crossPieSumZ).includes(xk+yk+zk+'Sum')) crossPieSumZ[xk+yk+zk+'Sum'] += rv;
                originData.push(rv);
                checkItem.push(xk + yk);
                checkItem.push(xk + yk + zk);
                checkItem.push(xk + yk + zk + rk);
              }
            }
          }
        }

        // crossDatasetsX = crossDatasetsX.sort();
        // crossDatasetsY = crossDatasetsY.sort();
        // crossDatasetsZ = crossDatasetsZ.sort();
        // crossDatasetsR = crossDatasetsR.sort(); 
        
        let xPluginsLabel = [], yPluginsLabel = []; 
        let checkLabel = {};
        let xItemSequence = 0, yItemSequence = 0, zItemSequence = 0, rItemSequence = 0;
        let xItem_info = {}, yItem_info = {}, zItem_info = {}, rItem_info = {};
        let legendFlg = obOption.details[0].legendFlag;
        let labelInsteadOfLegend = obOption.details[0].labelInsteadOfLegend;

        if (obOption.chartType === '3'){ //================================================= Line차트
        
          if (req_evg_seq.length === 1) { // ---------------------- 1차원
            tmpCrossDataBar = new Array();
            crossLabelsBar = new Array();
            crossBackgroundColorsBar = new Array();
            crossHoverBackgroundColorsBar = new Array();
            for (let [xk,xv] of Object.entries(crossDatasetsX)) {
              xItemSequence = xv.replace(/[xyzr]/,'');
              xItem_info = evalItem[xItemSequence];

              let d = changeData[xv];
              if (!d !== undefined) {
                tmpCrossDataBar.push(d);
                tmpCrossDataPie.push(d);
              } else {
                tmpCrossDataBar.push(0);
                tmpCrossDataPie.push(0);
              }
              
              crossLabelsBar.push(xItem_info['value']);
              crossBackgroundColorsBar.push(backgroundColors[xv]);
              crossBackgroundColorsBarSingle = this.transColorExpr(backgroundColors[xv]);
              crossHoverBackgroundColorsBar.push(hoverBackgroundColors[xv]);
              crossBackgroundColorsPie.push(backgroundColors[xv]);
              crossHoverBackgroundColorsPie.push(hoverBackgroundColors[xv]);
            } // for
            let tempObj = {
              label: xItem_info['group_name'],
              fill: false,
              backgroundColor: crossBackgroundColorsBar,
              backgroundColorArr: crossBackgroundColorsBar,
              backgroundColorSingle: crossBackgroundColorsBarSingle,
              hoverBackgroundColor: crossHoverBackgroundColorsBar,
              hoverBackgroundColorArr: crossHoverBackgroundColorsBar,
              data: tmpCrossDataBar,
            };

            // 그래프 속성들 (line)
            tempObj.pointStyle= obOption.details[2].pointStyle;               // 정점 모양
            tempObj.pointBorderColor= obOption.details[2].pointBorderColor;
            tempObj.pointBorderWidth= Number(obOption.details[2].pointBorderWidth);
            tempObj.pointRadius= Number(obOption.details[2].pointRadius);      // 반지름 (사이즈)
            tempObj.pointRotation= Number(obOption.details[2].pointRotation);  // 정점 각도
            if (obOption.details[2].mouseHover) {
              tempObj.pointHoverRadius = Number(obOption.details[2].mouseHoverSize);             // 정점 사이즈(Hober action)
              tempObj.pointHoverBorderWidth = Number(obOption.details[2].mouseHoverBorderWidth); // 둘레 사이즈(Hober action)
              tempObj.pointHoverBorderColor = obOption.details[2].mouseHoverBorderColor;         // 둘레 색깔(Hober action)
            }
            if (obOption.details[2].stack) tempObj.stack = 'a';
            if (obOption.details[2].isFill) tempObj.fill = 'start';
            crossDatasetsBar.push(tempObj); // y datasets => y bars
          }  // [End] req_evg_seq === 1
          else { // -------------------------------------------------- 2차원
            for (let [yk,yv] of Object.entries(crossDatasetsY)) {
              yItemSequence = yv.replace(/[xyzr]/,'');
              yItem_info = evalItem[yItemSequence];

              tmpCrossDataBar = new Array();
              crossBackgroundColorsBar = new Array();
              crossHoverBackgroundColorsBar = new Array();
              for (let [xk,xv] of Object.entries(crossDatasetsX)) {
                xItemSequence = xv.replace(/[xyzr]/,''); 
                xItem_info = evalItem[xItemSequence]; 
                let xLabel = xItem_info['group_name'] + '-' + xItem_info['value'];
                if(!checkLabel[xLabel]) { 
                  checkLabel[xLabel] = {};
                  crossLabelsBar.push(xLabel);
                } 
                try {
                  if (!changeData[xv][yv]) tmpCrossDataBar.push(0); //  ~ 없음
                  else tmpCrossDataBar.push(changeData[xv][yv]);    // 문자열에 해당하는 data 존재
                } catch(e) { tmpCrossDataBar.push(0); }             //  ~ 없음                
                crossBackgroundColorsBar.push(backgroundColors[yv]);
                crossBackgroundColorsBarSingle = this.transColorExpr(backgroundColors[yv]);
                crossHoverBackgroundColorsBar.push(hoverBackgroundColors[yv]);
              } // x-for
              let tempObj = {
                label: yItem_info['group_name'] + '-' + yItem_info['value'],
                fill: false,
                backgroundColor: crossBackgroundColorsBar,
                backgroundColorArr: crossBackgroundColorsBar,
                backgroundColorSingle: crossBackgroundColorsBarSingle,
                hoverBackgroundColor: crossHoverBackgroundColorsBar,
                hoverBackgroundColorArr: crossHoverBackgroundColorsBar,
                data: tmpCrossDataBar
              };
              
              // 그래프 속성들 (line)
              tempObj.pointStyle= obOption.details[2].pointStyle;               // 정점 모양
              tempObj.pointBorderColor= obOption.details[2].pointBorderColor;
              tempObj.pointBorderWidth= Number(obOption.details[2].pointBorderWidth);
              tempObj.pointRadius= Number(obOption.details[2].pointRadius);      // 반지름 (사이즈)
              tempObj.pointRotation= Number(obOption.details[2].pointRotation);  // 정점 각도
              if (obOption.details[2].mouseHover) {
                tempObj.pointHoverRadius = Number(obOption.details[2].mouseHoverSize);             // 정점 사이즈(Hober action)
                tempObj.pointHoverBorderWidth = Number(obOption.details[2].mouseHoverBorderWidth); // 둘레 사이즈(Hober action)
                tempObj.pointHoverBorderColor = obOption.details[2].mouseHoverBorderColor;         // 둘레 색깔(Hober action)
              }
              if (obOption.details[2].stack) tempObj.stack = 'a';
              if (obOption.details[2].isFill) tempObj.fill = 'start';
              crossDatasetsBar.push(tempObj); // y datasets => y bars
            } // y-for CHART_BAR
          } // 2, 3, 4

        } else if (obOption.chartType === '4') { //========================================= Pie차트
          let pieInfoContainer = {
            'numOfVcc':[], 
            'BGColor':[],
            'HVColor':[]
          };
          let beforVacancy = [];
          if (req_evg_seq.length === 1) { // ---------------------- 1차원
            crossDatasetsX.forEach(x => {
              xItemSequence = x.replace(/[xyzr]/,'');
              xItem_info = evalItem[xItemSequence];
              // 메인 데이터
              pieInfoContainer.BGColor.push(backgroundColors[x]);
              pieInfoContainer.HVColor.push(hoverBackgroundColors[x]);
              // 서브 데이터
              crossLabelsPieText.push(xItem_info['group_name'] + '-' + xItem_info['value']);
              crossLabelsPieKeys.push(x);
            });
            
            crossDatasetsPie.unshift({ // pie-inner
              fill: false,
              data: originData,
              backgroundColor: pieInfoContainer.BGColor,
              hoverBackgroundColor: pieInfoContainer.HVColor,
              ...this.copiesPieProperties(obOption)
            });
          } // [End] req_evg_seq === 1

          else if (req_evg_seq.length === 2) { // ---------------------- 2차원
            crossDatasetsX.forEach(x => {
              xItemSequence = x.replace(/[xyzr]/,'');
              xItem_info = evalItem[xItemSequence];
              // 메인 데이터
              crossDatasetsPieX.push(crossPieSumX[x+'Sum']);
              pieInfoContainer.numOfVcc.push(0);
              pieInfoContainer.BGColor.push(backgroundColors[x]);
              pieInfoContainer.HVColor.push(hoverBackgroundColors[x]);
              // 서브 데이터
              crossLabelsPieText.push(xItem_info['group_name'] + '-' + xItem_info['value']);
              crossLabelsPieKeys.push(x);
            }); 
            crossDatasetsPie.unshift({ // pie-inner
              fill: false,
              data: crossDatasetsPieX,
              backgroundColor: pieInfoContainer.BGColor,
              hoverBackgroundColor: pieInfoContainer.HVColor,
              ...this.copiesPieProperties(obOption)
            });

            
            crossDatasetsX.forEach(x => {
              crossDatasetsY.forEach(y => {
                if (!checkItem.includes(x+y)) return;
                yItemSequence = y.replace(/[xyzr]/,'');
                yItem_info = evalItem[yItemSequence];
                // 메인 데이터
                // 마지막 써클의 데이터는 originData로 한다.
                // 마지막 써클에는 pieInfoContainer.data을 사용 안함.
                pieInfoContainer.BGColor.push(backgroundColors[y]);
                pieInfoContainer.HVColor.push(hoverBackgroundColors[y]);
                // 서브 데이터
                crossLabelsPieText.push(yItem_info['group_name'] + '-' + yItem_info['value']);
                crossLabelsPieKeys.push(y);
              });
            });
            crossDatasetsPie.unshift({ // pie-outer
              fill: false,
              data: pieInfoContainer.numOfVcc.concat(originData),
              backgroundColor: pieInfoContainer.BGColor,
              hoverBackgroundColor: pieInfoContainer.HVColor,
              ...this.copiesPieProperties(obOption)
            }); 
          } // [End] req_evg_seq === 2

          else if (req_evg_seq.length === 3) { // ---------------------- 3차원
            crossDatasetsX.forEach(x => {
              xItemSequence = x.replace(/[xyzr]/,'');
              xItem_info = evalItem[xItemSequence];
              // 메인 데이터
              crossDatasetsPieX.push(crossPieSumX[x+'Sum']);
              pieInfoContainer.numOfVcc.push(0);
              pieInfoContainer.BGColor.push(backgroundColors[x]);
              pieInfoContainer.HVColor.push(hoverBackgroundColors[x]);
              // 서브 데이터
              crossLabelsPieText.push(xItem_info['group_name'] + '-' + xItem_info['value']);
              crossLabelsPieKeys.push(x);
            });
            crossDatasetsPie.unshift({ // pie-inner
              fill: false,
              data: crossDatasetsPieX,
              backgroundColor: pieInfoContainer.BGColor,
              hoverBackgroundColor: pieInfoContainer.HVColor,
              ...this.copiesPieProperties(obOption)
            });
            
            
            beforVacancy = pieInfoContainer.numOfVcc.slice();
            crossDatasetsX.forEach(x => {
              crossDatasetsY.forEach(y => {
                if (!checkItem.includes(x+y)) return;
                yItemSequence = y.replace(/[xyzr]/,'');
                yItem_info = evalItem[yItemSequence];
                // 메인 데이터
                crossDatasetsPieY.push(crossPieSumY[x+y+'Sum']);
                pieInfoContainer.numOfVcc.push(0);
                pieInfoContainer.BGColor.push(backgroundColors[y]);
                pieInfoContainer.HVColor.push(hoverBackgroundColors[y]);
                // 서브 데이터
                crossLabelsPieText.push(yItem_info['group_name'] + '-' + yItem_info['value']);
                crossLabelsPieKeys.push(y);
              });
            });
            crossDatasetsPie.unshift({ // pie-outer
              fill: false,
              data: beforVacancy.concat(crossDatasetsPieY),
              backgroundColor: pieInfoContainer.BGColor,
              hoverBackgroundColor: pieInfoContainer.HVColor,
              ...this.copiesPieProperties(obOption)
            });


            crossDatasetsX.forEach(x => {
              crossDatasetsY.forEach(y => {
                crossDatasetsZ.forEach(z => {
                  if (!checkItem.includes(x+y+z)) return;
                  zItemSequence = z.replace(/[xyzr]/,'');
                  zItem_info = evalItem[zItemSequence];
                  // 메인 데이터
                  // 마지막 써클의 데이터는 originData로 한다.
                  // 마지막 써클에는 pieInfoContainer.data을 사용 안함.
                  pieInfoContainer.BGColor.push(backgroundColors[z]);
                  pieInfoContainer.HVColor.push(hoverBackgroundColors[z]);
                  // 서브 데이터
                  crossLabelsPieText.push(zItem_info['group_name'] + '-' + zItem_info['value']);
                  crossLabelsPieKeys.push(z);
                });
              });
            });
            crossDatasetsPie.unshift({ // pie-outer2
              fill: false,
              data: pieInfoContainer.numOfVcc.concat(originData),
              backgroundColor: pieInfoContainer.BGColor,
              hoverBackgroundColor: pieInfoContainer.HVColor,
              ...this.copiesPieProperties(obOption)
            });
            
            
          } // [End] req_evg_seq === 3

          else if (req_evg_seq.length === 4) { // ---------------------- 4차원
            crossDatasetsX.forEach(x => {
              xItemSequence = x.replace(/[xyzr]/,'');
              xItem_info = evalItem[xItemSequence];
              // 메인 데이터
              crossDatasetsPieX.push(crossPieSumX[x+'Sum']);
              pieInfoContainer.numOfVcc.push(0);
              pieInfoContainer.BGColor.push(backgroundColors[x]);
              pieInfoContainer.HVColor.push(hoverBackgroundColors[x]);
              // 서브 데이터
              crossLabelsPieText.push(xItem_info['group_name'] + '-' + xItem_info['value']);
              crossLabelsPieKeys.push(x);
            });
            crossDatasetsPie.unshift({ // pie-inner
              fill: false,
              data: crossDatasetsPieX,
              backgroundColor: pieInfoContainer.BGColor,
              hoverBackgroundColor: pieInfoContainer.HVColor,
              ...this.copiesPieProperties(obOption)
            });
            
            
            beforVacancy = pieInfoContainer.numOfVcc.slice();
            crossDatasetsX.forEach(x => {
              crossDatasetsY.forEach(y => {
                if (!checkItem.includes(x+y)) return;
                yItemSequence = y.replace(/[xyzr]/,'');
                yItem_info = evalItem[yItemSequence];
                // 메인 데이터
                crossDatasetsPieY.push(crossPieSumY[x+y+'Sum']);
                pieInfoContainer.numOfVcc.push(0);
                pieInfoContainer.BGColor.push(backgroundColors[y]);
                pieInfoContainer.HVColor.push(hoverBackgroundColors[y]);
                // 서브 데이터
                crossLabelsPieText.push(yItem_info['group_name'] + '-' + yItem_info['value']);
                crossLabelsPieKeys.push(y);
              });
            });
            crossDatasetsPie.unshift({ // pie-inner2
              fill: false,
              data: beforVacancy.concat(crossDatasetsPieY),
              backgroundColor: pieInfoContainer.BGColor,
              hoverBackgroundColor: pieInfoContainer.HVColor,
              ...this.copiesPieProperties(obOption)
            });


            beforVacancy = pieInfoContainer.numOfVcc.slice();
            crossDatasetsX.forEach(x => {
              crossDatasetsY.forEach(y => {
                crossDatasetsZ.forEach(z => {
                  if (!checkItem.includes(x+y+z)) return;
                  zItemSequence = z.replace(/[xyzr]/,'');
                  zItem_info = evalItem[zItemSequence];
                  // 메인 데이터
                  crossDatasetsPieY.push(crossPieSumZ[x+y+z+'Sum']);
                  pieInfoContainer.numOfVcc.push(0);
                  pieInfoContainer.BGColor.push(backgroundColors[z]);
                  pieInfoContainer.HVColor.push(hoverBackgroundColors[z]);
                  // 서브 데이터
                  crossLabelsPieText.push(zItem_info['group_name'] + '-' + zItem_info['value']);
                  crossLabelsPieKeys.push(z);
                });
              });
            });
            crossDatasetsPie.unshift({ // pie-outer
              fill: false,
              data: beforVacancy.concat(crossDatasetsPieY),
              backgroundColor: pieInfoContainer.BGColor,
              hoverBackgroundColor: pieInfoContainer.HVColor,
              ...this.copiesPieProperties(obOption)
            });


            crossDatasetsX.forEach(x => {
              crossDatasetsY.forEach(y => {
                crossDatasetsZ.forEach(z => {
                  crossDatasetsR.forEach(r => {
                    if (!checkItem.includes(x+y+z+r)) return;
                    rItemSequence = r.replace(/[xyzr]/,'');
                    rItem_info = evalItem[rItemSequence];
                    // 메인 데이터
                    // 마지막 써클의 데이터는 originData로 한다.
                    // 마지막 써클에는 pieInfoContainer.data을 사용 안함.
                    pieInfoContainer.BGColor.push(backgroundColors[r]);
                    pieInfoContainer.HVColor.push(hoverBackgroundColors[r]);
                    // 서브 데이터
                    crossLabelsPieText.push(rItem_info['group_name'] + '-' + rItem_info['value']);
                    crossLabelsPieKeys.push(z);
                  });
                });
              });
            });
            crossDatasetsPie.unshift({ // pie-outer2
              fill: false,
              data: pieInfoContainer.numOfVcc.concat(originData),
              backgroundColor: pieInfoContainer.BGColor,
              hoverBackgroundColor: pieInfoContainer.HVColor,
              ...this.copiesPieProperties(obOption)
            });
          } // [End] req_evg_seq === 4

        } else { // ======================================================================== Bar차트
          if (req_evg_seq.length === 1) { //----------------------교차-기준 1개
            if (legendFlg && labelInsteadOfLegend) { // 범례 대신 라벨 사용하기
              crossLabelsBar = new Array();
              crossBackgroundColorsBar = new Array();
              crossHoverBackgroundColorsBar = new Array();
              tmpCrossDataBar = new Array();
            }
            for (let [xk,xv] of Object.entries(crossDatasetsX)) {
              xItemSequence = xv.replace(/[xyzr]/,'');
              xItem_info = evalItem[xItemSequence];
              if (!legendFlg || (legendFlg && !labelInsteadOfLegend)) { // 라벨 대신 범례 사용하기
                crossLabelsBar = new Array();
                crossBackgroundColorsBar = new Array();
                crossHoverBackgroundColorsBar = new Array();
                tmpCrossDataBar = new Array();
              }
              let d = changeData[xv];
              if (!d !== undefined) {
                tmpCrossDataBar.push(d);
                tmpCrossDataPie.push(d);
              } else {
                tmpCrossDataBar.push(0);
                tmpCrossDataPie.push(0);
              }
              
              if (legendFlg && labelInsteadOfLegend) {
                crossLabelsBar.push(isSPECIAL_GATEGORY 
                  ? xItem_info['value'] : xItem_info['group_name'] + "-" + xItem_info['value']);
              } else {
                crossLabelsBar.push(xItem_info['group_name']);
              }
              crossBackgroundColorsBar.push(backgroundColors[xv]);
              crossBackgroundColorsBarSingle = this.transColorExpr(backgroundColors[xv]);
              crossHoverBackgroundColorsBar.push(hoverBackgroundColors[xv]);
              crossBackgroundColorsPie.push(backgroundColors[xv]);
              crossHoverBackgroundColorsPie.push(hoverBackgroundColors[xv]);
              if(!legendFlg || (legendFlg && !labelInsteadOfLegend)) { // 라벨 대신 범례 사용하기
                let tempObj = {
                  label: xItem_info['value'],
                  fill: false,
                  backgroundColor: crossBackgroundColorsBar,
                  backgroundColorArr: crossBackgroundColorsBar,
                  backgroundColorSingle: crossBackgroundColorsBarSingle,
                  hoverBackgroundColor: crossHoverBackgroundColorsBar,
                  hoverBackgroundColorArr: crossHoverBackgroundColorsBar,
                  data: tmpCrossDataBar,
                };
                if (obOption.verticalSplit) tempObj.stack = 'a';
                if (obOption.details[1].emphasize) {
                  tempObj.hoverBorderWidth = 5;
                  tempObj.hoverBorderColor = 'yellow';
                }
                if (obOption.details[1].radiusFlag) {
                  tempObj.borderRadius = obOption.details[1].radiusValue;
                  tempObj.borderSkipped = false;
                  tempObj.borderSkipped = 2;
                }
                crossDatasetsBar.push(tempObj);
              }
            } // -for
            if(legendFlg && labelInsteadOfLegend) { // 범례 대신 라벨 사용하기
              let tempObj = {
                label: xItem_info['value'],
                fill: false,
                backgroundColor: crossBackgroundColorsBar,
                backgroundColorArr: crossBackgroundColorsBar,
                backgroundColorSingle: crossBackgroundColorsBarSingle,
                hoverBackgroundColor: crossHoverBackgroundColorsBar,
                hoverBackgroundColorArr: crossHoverBackgroundColorsBar,
                data: tmpCrossDataBar,
              };
              if (obOption.verticalSplit) tempObj.stack = 'a';
              if (obOption.details[1].emphasize) {
                tempObj.hoverBorderWidth = 5;
                tempObj.hoverBorderColor = 'yellow';
              }
              if (obOption.details[1].radiusFlag) {
                tempObj.borderRadius = obOption.details[1].radiusValue;
                tempObj.borderSkipped = false;
                tempObj.borderSkipped = 2;
              }
              crossDatasetsBar.push(tempObj);
            }
          }  // [End] req_evg_seq === 1
          else if(req_evg_seq.length === 2) { //----------------------교차-기준 2개
            for (let [yk,yv] of Object.entries(crossDatasetsY)) {
              yItemSequence = yv.replace(/[xyzr]/,'');
              yItem_info = evalItem[yItemSequence];

              tmpCrossDataBar = new Array();
              crossBackgroundColorsBar = new Array();
              crossHoverBackgroundColorsBar = new Array();
              for (let [xk,xv] of Object.entries(crossDatasetsX)) {
                xItemSequence = xv.replace(/[xyzr]/,'');
                xItem_info = evalItem[xItemSequence];
                let xLabel = xItem_info['group_name'] + '-' + xItem_info['value'];
                if(!checkLabel[xLabel]) { 
                  checkLabel[xLabel] = {};
                  crossLabelsBar.push(xLabel);
                } 
                try {
                  if (!changeData[xv][yv]) tmpCrossDataBar.push(0); //  ~ 없음
                  else tmpCrossDataBar.push(changeData[xv][yv]);    // 문자열에 해당하는 data 존재
                } catch(e) { tmpCrossDataBar.push(0); }             //  ~ 없음                
                crossBackgroundColorsBar.push(backgroundColors[yv]);
                crossBackgroundColorsBarSingle = this.transColorExpr(backgroundColors[yv]);
                crossHoverBackgroundColorsBar.push(hoverBackgroundColors[yv]);
              } // x-for
              let tempObj = {
                label: yItem_info['group_name'] + '-' + yItem_info['value'],
                fill: false,
                backgroundColor: crossBackgroundColorsBar,
                backgroundColorArr: crossBackgroundColorsBar,
                backgroundColorSingle: crossBackgroundColorsBarSingle,
                hoverBackgroundColor: crossHoverBackgroundColorsBar,
                hoverBackgroundColorArr: crossHoverBackgroundColorsBar,
                data: tmpCrossDataBar
              };
              if (obOption.verticalSplit) tempObj.stack = 'a';
              if (obOption.details[1].emphasize) {
                tempObj.hoverBorderWidth = 5;
                tempObj.hoverBorderColor = 'yellow';
              }
              if (obOption.details[1].radiusFlag) {
                tempObj.borderRadius = obOption.details[1].radiusValue;
                tempObj.borderSkipped = false;
                tempObj.borderSkipped = 2
              }
              crossDatasetsBar.push(tempObj); // y datasets => y bars
            } // y-for CHART_BAR

          } // [End] req_evg_seq === 2
          else if (req_evg_seq.length === 3) { //----------------------교차-기준 3개
            let i = 0, labelsFlag = true;
            for (const [zk, zv] of Object.entries(crossDatasetsZ)) {
              zItemSequence = zv.replace(/[xyzr]/,'');
              zItem_info = evalItem[zItemSequence];
              let t = zItem_info['group_name'] + '-' + zItem_info['value'];
              
              crossDatasetsBar.push({
                label: t,
                fill: false,
                backgroundColor: backgroundColors[zv],
                backgroundColorArr: backgroundColors[zv],
                backgroundColorSingle: this.transColorExpr(backgroundColors[zv]),
                hoverBackgroundColor: hoverBackgroundColors[zv],
                hoverBackgroundColorArr: hoverBackgroundColors[zv],
                minBarLength: 1, // 확인필요
                // borderColor: crossBackgroundColorsBar,
                // borderWidth: 2,
                // borderRadius: 20,
                data: []
              });
              if (obOption.verticalSplit) crossDatasetsBar[i].stack = 'a';
              if (obOption.details[1].emphasize) {
                crossDatasetsBar[i].hoverBorderWidth = 5;
                crossDatasetsBar[i].hoverBorderColor = 'yellow';
              }
              if (obOption.details[1].radiusFlag) {
                crossDatasetsBar[i].borderRadius = obOption.details[1].radiusValue;
                crossDatasetsBar[i].borderSkipped = false;
                crossDatasetsBar[i].borderSkipped = 2
              }

              for (const [xk, xv] of Object.entries(crossDatasetsX)) {
                  for (const [yk, yv] of Object.entries(crossDatasetsY)) {
                      yItemSequence = yv.replace(/[xyzr]/,'');
                      yItem_info = evalItem[yItemSequence];
                      try { crossDatasetsBar[i].data.push(changeData[xv][yv][zv]); }
                      catch { crossDatasetsBar[i].data.push(0); }
                      if (labelsFlag) crossLabelsBar.push(yItem_info['group_name'] + '-' + yItem_info['value']);
                  }
              }
              i++; labelsFlag = false;
            }
            // x 라벨 (큰 카테고리)
            for (let [xk,xv] of Object.entries(crossDatasetsX)) {
              xItemSequence = xv.replace(/[xyzr]/,'');
              xItem_info = evalItem[xItemSequence];
              let xLabel = xItem_info['group_name'] + '-' + xItem_info['value'];
              if(!checkLabel[xLabel]) { 
                checkLabel[xLabel] = {};
                xPluginsLabel.push(xLabel);
              } 
            }
            // y 라벨 (작은 카테고리)
            let Ylength = 0;
            for (let [xk,xv] of Object.entries(crossDatasetsX)) {
              for (let [yk,yv] of Object.entries(crossDatasetsY)) {
                Ylength++;
              }
            }
            // if (!obOption.verticalSplit) {
              this.pivot1 = crossLabelsBar.length / Ylength;
              this.pivot2 = this.pivot1 * (Ylength / xPluginsLabel.length);
            // }
          } // [End] req_evg_seq === 3
          else if (req_evg_seq.length === 4) { //----------------------교차-기준 4개
            let i = 0, labelsFlag = true;
            for (const [rk, rv] of Object.entries(crossDatasetsR)) {
              rItemSequence = rv.replace(/[xyzr]/,'');
              rItem_info = evalItem[rItemSequence];
              let t = rItem_info['group_name'] + '-' + rItem_info['value'];
              
              crossDatasetsBar.push({
                label: t,
                fill: false,
                backgroundColor: backgroundColors[rv],
                backgroundColorArr: backgroundColors[rv],
                backgroundColorSingle: this.transColorExpr(backgroundColors[rv]),
                hoverBackgroundColor: hoverBackgroundColors[rv],
                hoverBackgroundColorArr: hoverBackgroundColors[rv],
                stack: 'a', // 세로 쌓기
                minBarLength: 1, // 확인필요
                // borderColor: crossBackgroundColorsBar,
                // borderWidth: 2,
                data: []
              });
              
              if (obOption.details[1].emphasize) {
                crossDatasetsBar[i].hoverBorderWidth = 5;
                crossDatasetsBar[i].hoverBorderColor = 'yellow';
              }
              if (obOption.details[1].radiusFlag) {
                crossDatasetsBar[i].borderRadius = obOption.details[1].radiusValue;
                crossDatasetsBar[i].borderSkipped = false;
                crossDatasetsBar[i].borderSkipped = 2
              }

              for (const [xk, xv] of Object.entries(crossDatasetsX)) {
                  for (const [yk, yv] of Object.entries(crossDatasetsY)) {
                      for (const [zk, zv] of Object.entries(crossDatasetsZ)) {
                          zItemSequence = zv.replace(/[xyzr]/,'');
                          zItem_info = evalItem[zItemSequence];
                          try { crossDatasetsBar[i].data.push(changeData[xv][yv][zv][rv]); }
                          catch { crossDatasetsBar[i].data.push(0); }
                          if (labelsFlag) crossLabelsBar.push(zItem_info['value']);
                      }
                  }
              }
              i++; labelsFlag = false;
            }
            
            
            // x 라벨
            for (let [xk,xv] of Object.entries(crossDatasetsX)) {
              xItemSequence = xv.replace(/[xyzr]/,'');
              xItem_info = evalItem[xItemSequence];
              let xLabel = xItem_info['group_name'] + '-' + xItem_info['value'];
              if(!checkLabel[xLabel]) { 
                checkLabel[xLabel] = {};
                xPluginsLabel.push(xLabel);
              } 
            }
            // y 라벨
            for (let [xk,xv] of Object.entries(crossDatasetsX)) {
              for (let [yk,yv] of Object.entries(crossDatasetsY)) {
                yItemSequence = yv.replace(/[xyzr]/,'');
                yItem_info = evalItem[yItemSequence];
                yPluginsLabel.push(yItem_info['group_name'] + '-' + yItem_info['value']);
              }
            }
            this.pivot1 = crossLabelsBar.length / yPluginsLabel.length;
            this.pivot2 = this.pivot1 * (yPluginsLabel.length / xPluginsLabel.length);
          } // [End] req_evg_seq === 4
        } // chartType if-else
        
        const crossSource = this;
        this.plugins = [{
          afterDatasetsDraw(chart) {
            const { ctx, chartArea: {left, right, top, bottom, width, height} } = chart;
            // subLabel 생성로직
            ctx.save();
            let graphCnt = new Map();
            function tooltipText(text, x, y, fontSize) {
              ctx.font = "normal"+fontSize+"px \'맑은고딕\',malgun gothic,\'돋움\',Dotum,\'Apple SD Gothic Neo\',Helvetica,sans-serif";
              ctx.fillStyle = 'rgb(0, 0, 0)';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'bottom'; // top, middle, bottom
              ctx.fillText(text, x, y);
            }
            function subLabelText(text, x, y, font, level) {
              ctx.font = font.labelWeight + ' ' + String(font.labelSize) + 'px sans-serif';
              ctx.fillStyle = font.labelColor; 
              ctx.textAlign = 'center';
              ctx.fillText (text, x, bottom + y); // hor
            }
            function subLabelText2(text, x, y, font, level) {
              ctx.font = font.labelWeight + ' ' + String(font.labelSize) + 'px sans-serif';
              ctx.fillStyle = font.labelColor;
              ctx.textAlign = 'center';
              ctx.fillText (text, left - x, y); // ver
            }
            function drawText(arrLabel2, arrLabel3, graphCnt, padding, font, chartType) {
              let i = 0;
              for (const [pos, v] of graphCnt) {
                // pluginsLabel crossDataset을 생성하는 곳에서 만들어짐.
                if (v === -1) graphCnt.set(pos, i++);
              }

              let pivot1 = graphCnt.size / arrLabel2.length;
              let pivot2 = pivot1 * (arrLabel2.length / arrLabel3.length);
              let sum = 0, j = 0; // 합산, 인덱스
              /**
               * ex)
               * <init>
               *   graphCnt      : 1 2 3 4 5 6 7 8 9 
               *   v             : 라벨 인덱스
               *   xPluginsLabel : 3 (대 중 소)
               * 
               * <res>
               *   pivot         : 3
               * 
               * <Structure>
               *  1  2  3  4  5  6  7  8  9
               *        v        v        v
               * 
               * fir Sum : (1 + 2 + 3) / 2 = 3
               * ser Sum : (4 + 5 + 6) / 2 = 7.x
               * thi Sum : (7 + 8 + 9) / 2 = 12
               * 3 = 대  /  7.x = 중  /  12 = 소
               */ 
              try {
                for (const [pos, v] of graphCnt) {
                  if (arrLabel2.length < 1) break;
                  if (v % pivot1 == 0 && v !== 0) {
                    if (chartType==='1') subLabelText(arrLabel2[j++], sum/pivot1, padding * 2, font[0], 2);
                    else                subLabelText2(arrLabel2[j++], 120, (sum/pivot1), font[0], 2);
                    sum = 0;
                    sum += Number(pos);
                  } else {
                    sum += Number(pos);
                  }
                }
                if (chartType==='1') subLabelText(arrLabel2[j++], sum/pivot1, padding * 2, font[0], 2);
                else                subLabelText2(arrLabel2[j++], 120, (sum/pivot1), font[0], 2);
              } catch(e) {
                console.error('StatCross plugins error', e);
              }
              
              sum = 0, j = 0; // 합산, 인덱스
              if (arrLabel3.length < 1) return;
              try {
                for (const [pos, v] of graphCnt) {
                  if (v % pivot2 == 0 && v !== 0) {
                    if (chartType==='1') subLabelText(arrLabel3[j++], (sum/pivot2), padding * 3, font[1], 3);
                    else                subLabelText2(arrLabel3[j++], 220, (sum/pivot2), font[1], 3); 
                    sum = 0;
                    sum += Number(pos);
                  } else {
                    sum += Number(pos);
                  }
                }
                if (chartType==='1') subLabelText(arrLabel3[j++], (sum/pivot2), padding * 3, font[1], 3);
                else                subLabelText2(arrLabel3[j++], 220, (sum/pivot2), font[1], 3); 
              } catch(e) {
                console.error('StatCross plugins error', e);
              }

            } // func drawText


            let type = chart.config.type;
            let isVerticalBar = obOption.chartType === '1' ? true : false; // ver:1, hor:2 ...
            chart.data.datasets.forEach((dataset, i) => {
              const meta = chart.getDatasetMeta(i);
              if (!meta.hidden) { 
                meta.data.forEach((element, index) => {
                  const fontSize = 13;
                  const dataString = dataset.data[index] ? dataset.data[index].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
                  const position = element.tooltipPosition();
                  let x_pos = position.x;
                  let y_pos = position.y + (fontSize);

                  if (type === 'bar') {
                    let positionNum;
                    if (isVerticalBar) { // 수직 막대차트
                      positionNum = Math.round(position.x * 100) / 100;
                    } else {             // 수평 막대차트
                      positionNum = Math.round(position.y * 100) / 100;
                    }
                    if (!graphCnt.has(positionNum)) graphCnt.set(positionNum, -1);
                    
                  }  else if (type === 'pie') {
                    y_pos = position.y;
                  }
                  // 차트에 수치 항상 띄우기
                  tooltipText(dataString, x_pos, y_pos, fontSize);
                });
              }
            });
            
            
            // graphCnt : 데이터(element)의 위치(position)
            let _length = req_evg_seq.length;
            if ( graphCnt.size !== 0 && _length > 2 
              && (obOption.chartType === '1' || obOption.chartType === '2') ) {
              graphCnt = crossSource.compare_objectOfTypeNumber(graphCnt); // 정렬 (그래프의 위치)
              
              let font = [];
              try { 
                switch(_length) {
                  case 4:
                    font.push(_itemOption[1].chartItemOption);
                  case 3:
                    font.push(_itemOption[0].chartItemOption); break;
                  default:  break;
                }
              } catch(e) { console.error('error array index'); }
              if (_length === 3) {        // 교차-기준 3
                drawText(xPluginsLabel
                      , []
                      , graphCnt
                      , 35
                      , font
                      , obOption.chartType
                );
              } else if (_length === 4) { // 교차-기준 4
                drawText(yPluginsLabel
                      , xPluginsLabel
                      , graphCnt
                      , 30
                      , font
                      , obOption.chartType
                );
              } // if-else [END]
            }


            // Show onclick text in Center of Doughnut Chart
            // if (true && true) {
              
            //   if (selectedDatasetIndex >= 0) { 
                
            //     const value = chart.metasets[selectedDatasetIndex]._parsed[selectedIndex];
            //     // const sum = chart._metasets[this.selectedDatasetIndex].total; // total data
            //     // const percentage = (value / sum * 100).toFixed(1); 
            //     // const color = chart.data.dataset[this.selectedDatasetIndex]
            //     //           .borderColor[this.selectedIndex]
                
            //     ctx.save();
            //     ctx.font = 'bolder 60px Arial';
            //     ctx.fillStyle = 'blue';
            //     ctx.textAlign = 'center';
            //     ctx.textBaseLine = 'middle';
            //     ctx.fillText(1 + '건', width / 2, height / 2 + top);
            //   }
            // }
          }, // afterDatasetsDraw
          beforeDraw: (chart, args, options) => {
            const {ctx, chartArea: {left, top, width, height}} = chart;

            /**
             * @description : 배경색
             * @default : #fff (white)
             */
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = obOption.details[0].color;
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
            
            /**
             * @description : 차트 외곽선
             * @default : .
             */
            if (obOption.details[0].outlineFlag) {
              ctx.strokeStyle = obOption.details[0].outlineColor;
              ctx.lineWidth = obOption.details[0].outlineThickness;
              let dash = [obOption.details[0].outlineLength, obOption.details[0].outlineSpace];
              ctx.setLineDash(dash || []);
              ctx.lineDashOffset = 2; // 테두리 대시 간격띄우기, 근데 바꾸지 않음
              ctx.strokeRect(left, top, width, height);
              ctx.restore();
            }
          }, // beforeDraw
          beforeInit(chart) {
            chart.legend.afterFit = ()=> {
              this.height = this.height + 30;
            };
          },
        }];

        let configEvalItem = evalItem;
        
        return {
          pivot1: this.pivot1,
          pivot2: this.pivot2,
          chartTitle: chartTitleText,
          chartSubTitle: chartSubtitleText,
          labels: crossLabelsBar,
          labelsBar: crossLabelsBar,
          labelsPie: crossLabelsPieText,
          labelsPieKeys: crossLabelsPieKeys,
          labelsPieGroupKeys: crossLabelsPieGroupKeys,
          labelsPieRootKeys: crossLabelsPieRootKeys,
          datasets: crossDatasetsBar,
          datasetsBar: crossDatasetsBar,
          datasetsPie: crossDatasetsPie,
          tableDataCountTree: tableDataCountTree,
          tableASize: tableASize,
          crossDatasetsX: crossDatasetsX, // DEBUG
          crossDatasetsSumTree: crossDatasetsSumTree,
          configEvalItem: configEvalItem,
          axis: req_evg_seq,
          options: baseChartOptions,
          pieMode: false,
          
		      // arg1 (chart mode)
          setPieMode: async function(arg = 0) {
            // 통합변수 선언
            let isAnimation = false;
            let legendCount = this.datasets.length;
            let tooltipCallbaks = {
              /**
               * des  : Customzie ToolTip-Label
               * 
               * param: item => tooltipItem
               * type : Object
               * key  :   chart, dataIndex, dataset
               *        , datasetIndex, element
               *        , formattedValue, label
               *        , parsed, raw
               * value: ...
               */
              label: function(item) {
                let rtn              // 반환값
                  , percentage       // 이벤트 발생 객체의 백분율
                  , labelTextHeadTmp // 임시 라벨 텍스트
                  , total = 0        // ~ 전체 수
                  , dataIndex = item['dataIndex']       // 데이터셋 안에서 데이터의 위치
                  , value = Number(item['dataset']['data'][dataIndex]); // 이벤트 객체의 값
                  if (!value) return;
                if (obOption.chartType !== '4') {
                  percentage = ( value / Number(tableSumAll) * 100  // (유효한 값 ÷ 전체 수) * 100 >> 백분율
                                ).toFixed(1)                        // 소수점을 하나까지만 표시
                  labelTextHeadTmp = 
                    ((legendFlg && labelInsteadOfLegend) ? '' : item['dataset']['label'] + ' ')
                    + value 
                    + finalSuffix 
                    + ' ' 
                    + (isNaN(percentage) ? '' : percentage + '%');
                  rtn = labelTextHeadTmp;
                  return rtn;
                } else {
                  const labelIndex = (item['datasetIndex'] * 2) + dataIndex;
                  return item['chart']['data']['labels'][dataIndex] + ': ' + item.formattedValue;
                  // return item['chart']['data']['labels'][labelIndex] + ': ' + item.formattedValue;
                }
              }

            };

            this.options = {
              ...crossSource.copiesPieProperties(obOption, 'options'),
              responsive: true, // Resizes the chart canvas when its container does
              maintainAspectRatio: false, //  상위 div에 구속
              layout: { // background padding
                padding: {
                  // right: 50
                }
              },
              indexAxis: 'x', // x:vertical, y:horizontal
              plugins: {
                // title
                // subtitle
                tooltip: {
                  // mode: 'index',
                  // intersect: false,
                  animationDuration: 0,
                  // filter을 통해서 tooltip 이벤트가 발생한 
                  filter: function (tooltipItem) {
                    return (tooltipItem['dataset']['data'][tooltipItem.dataIndex] !== 0);
                  },
                  callbacks: tooltipCallbaks,
                  // usePointStyle: true,
                  enabled: true,
                }, // plugins.tooltip
                legend: {
                  display: false,
                },
              }, // plugins
              
              scales: {
                x: {
                  display: true,
                  title: {
                    display: true,
                    // text: xAxisTitle,
                    // color: '#911',
                    font: {
                      family: 'Comic Sans MS',
                      size: 0,
                      weight: 'bold',
                      lineHeight: 1.2,
                    },
                    // padding: {top: 20, left: 0, right:0, bottom: 30}
                    padding: {top: 0, left: 0, right:0, bottom: 0}
                  },
                  ticks: {
                    // precision: 0, 소수점 빼기
                    color: 'black',
                    font: { size: 15, weight: 'bold' },
                  },
                }, // scales.x
                y: {
                  display: true,
                  // type: 'logarithmic',
                  title: {
                    display: true,
                    // text: yAxisTitle,
                    color: '#911',
                    font: {
                      family: 'Comic Sans MS',
                      size: 0,
                      weight: 'bold',
                      lineHeight: 1.2
                    },
                    // padding: {top: 30, left: 0, right: 0, bottom: 20},
                    padding: {top: 0, left: 0, right: 0, bottom: 0},
                  },
                  ticks: { 
                    // precision: 0, 소수점 빼기
                    color: 'black',
                    font: {
                      size: 13,
                      weight: 'bold',
                    },
                  },
                } // scales.y
              }, // scale
              animation: {
                radius: {},
              },
            }; // chartOptions

            // tooltip setting
            let tip = obOption.details[4];
            // 상단 텍스트
            this.options.plugins.tooltip.titleColor       = tip.titleColor;      // 색깔 string
            this.options.plugins.tooltip.titleFont = {};
            this.options.plugins.tooltip.titleFont.style  = tip.titleFontStyle; // 스타일 string
            this.options.plugins.tooltip.titleFont.weight = tip.titleFontWeight; // 스타일 string
            this.options.plugins.tooltip.titleAlign       = tip.titleAlign;       // 정렬 string
            // this.options.plugins.tooltip.titleSpacing     = tip.titleSpacing;    // 상하 공간 int (적용안됨)
            this.options.plugins.tooltip.titleMarginBottom= Number(tip.titleMarginBottom);// 바닥 간격 int
            // 중간 텍스트
            this.options.plugins.tooltip.bodyColor      = tip.bodyColor;     // string
            this.options.plugins.tooltip.bodyFont = {};
            this.options.plugins.tooltip.bodyFont.style = tip.bodyFontStyle; // string
            this.options.plugins.tooltip.bodyFont.weight= tip.bodyFontWeight; // string
            // this.options.plugins.tooltip.bodySpacing    = tip.bodySpacing;   // int
            // 기타
            this.options.plugins.tooltip.padding=      Number(tip.padding);     // tooltip 내부 int 
            this.options.plugins.tooltip.caretPadding= Number(tip.caretPadding);// 그래프와 tooltip의 간격 int
            this.options.plugins.tooltip.caretSize=    Number(tip.caretSize);   // 화살표 사이즈 int 
            this.options.plugins.tooltip.cornerRadius= Number(tip.cornerRadius);// tooltip 외곽 굴곡 int
            // this.options.plugins.tooltip.multiKeyBackground= tip.multiKeyBackground; // multi tooltip일 경우 배경색상 설정 string
            this.options.plugins.tooltip.boxWidth=     Number(tip.boxWidth);    // tooltip 안 색상박스의 넓이 int
            this.options.plugins.tooltip.boxHeight=    Number(tip.boxHeight);   // tooltip 안 색상박스의 높이 int 
            this.options.plugins.tooltip.boxPadding=   Number(tip.boxPadding);  // tooltip 안 색상박스과 텍스트의 간격 int
            this.options.plugins.tooltip.borderColor=  tip.borderColor;         // 윤곽선 색 string
            this.options.plugins.tooltip.borderWidth=  Number(tip.borderWidth); // 윤곽선 두께 int
            this.options.plugins.tooltip.rtl=          tip.rtl;                 // tooltip 내부의 텍스트의 시작 위치 (right to left)
            // this.options.plugins.tooltip.backgroundColor= 'lightgreen'; // tooltip 전체 배경색 string

            if (Number(arg) === 4) { // chartMode = [pie]
              this.pieMode = true;
              this.labels = this.labelsPie;
              this.datasets = this.datasetsPie;
              this.options.scales.x.display = false;
              this.options.scales.y.display = false;

            } else { // chartMode = [ bar(ver, hor), line ]
                            
              // X 라벨 및 data 라벨(Y)
              if (Number(arg) !== 2) {
                // x Label
                let tempLen = _itemOption.length - 1;
                if (tempLen >= 0) {
                  this.options.scales.x.ticks.color 
                    = _itemOption[tempLen].chartItemOption.labelColor;
                  this.options.scales.x.ticks.font.size
                    = _itemOption[tempLen].chartItemOption.labelSize;
                  // normal, bold, lighter, bolder, number: 100~
                  this.options.scales.x.ticks.font.weight 
                    = _itemOption[tempLen].chartItemOption.labelWeight;
                }

                // data label
                this.options.scales.y.ticks.color = obOption.details[5].labelColor;
                this.options.scales.y.ticks.font.size = obOption.details[5].labelSize;
                // normal, bold, lighter, bolder, number: 100~
                this.options.scales.y.ticks.font.weight = obOption.details[5].labelWeight;
                // y Step
                if (obOption.details[5].gridFlag) {
                  this.options.scales.y.min = Number(obOption.details[5].gridMin);
                  this.options.scales.y.max = Number(obOption.details[5].gridMax);
                  this.options.scales.y.ticks.stepSize = Number(obOption.details[5].gridStep);
                }

              } else if (Number(arg) === 2) {
                // x Label
                let tempLen = _itemOption.length - 1;
                if (tempLen >= 0) {
                  this.options.scales.y.ticks.color 
                    = _itemOption[tempLen].chartItemOption.labelColor;
                  this.options.scales.y.ticks.font.size
                    = _itemOption[tempLen].chartItemOption.labelSize;
                  // normal, bold, lighter, bolder, number: 100~
                  this.options.scales.y.ticks.font.weight 
                    = _itemOption[tempLen].chartItemOption.labelWeight;
                }

                // data label
                this.options.scales.x.ticks.color = obOption.details[6].labelColor;
                this.options.scales.x.ticks.font.size = obOption.details[6].labelSize;
                // normal, bold, lighter, bolder, number: 100~
                this.options.scales.x.ticks.font.weight = obOption.details[6].labelWeight;
                // x Step
                if (obOption.details[6].gridFlag) {
                  this.options.scales.x.min = Number(obOption.details[6].gridMin);
                  this.options.scales.x.max = Number(obOption.details[6].gridMax);
                  this.options.scales.x.ticks.stepSize = Number(obOption.details[6].gridStep);
                }
              }

              // Horizontal Bar, Vertical Bar
              if (Number(arg) !== 3 && obOption.verticalSplit) {
                this.options.interaction = {
                  mode: 'index', // index , point , nearest , dataset
                  axis: 'xy',
                  intersect: false,
                };
                this.options.plugins.tooltip.position= 'average'; // average , nearest
              } else if (Number(arg) !== 3 && !obOption.verticalSplit) {
                this.options.interaction = {
                  mode: 'point', // index , point , nearest , dataset
                  axis: 'xy',
                  intersect: false,
                };
                this.options.plugins.tooltip.position= 'nearest'; // average , nearest
              }



              // 오류 발생.. 다른 옵션들 중에 충돌하는 요소가 있는 듯
              // if (obOption.details[3].gridLog) this.options.scales.y.type = 'logarithmic'; 

              // chart type
              if(Number(arg) === 1) { // bar(ver)
                // Vertical bar
                this.options.indexAxis = 'x';

                // x축 라벨 선, 글자 디자인
                if (obOption.crossAxesLength === 3) {
                  this.options.scales.x.title.font.size = 35;
                } else if (obOption.crossAxesLength === 4) {
                  this.options.scales.x.title.font.size = 55;
                }

                // delay animation
                if (obOption.details[1].delayAnimation) {
                  this.options.animation.delay =
                    (context) => {
                      let delay = 0;
                      if (context.type === 'data' && context.mode == "default" && isAnimation) {
                        delay = context.dataIndex * 500 + context.datasetIndex * 150;
                      }
                      return delay;
                    }
                }

                // 선으로 항목 나누기
                if (this.pivot1 !== 0 && this.pivot2 !== 0) {
                  let thisCross = this;
                  this.options.scales.x.grid = {
                    lineWidth: function (c) {
                      if (c.tick) {
                        if (c.tick.value !== 0 && c.tick.value % thisCross.pivot2 === 0) {
                          return _itemOption[0].chartItemOption.gridThickness;
                        } else if (c.tick.value !== 0 && c.tick.value % thisCross.pivot1 === 0 
                                    && (!obOption.verticalSplit || obOption.crossAxesLength === 4)) {
                          return _itemOption[1].chartItemOption.gridThickness;
                        }
                      }
                    },
                    color: function(c) {
                      if (c.tick) {
                        if (c.tick.value !== 0 && c.tick.value % thisCross.pivot2 === 0) {
                          return _itemOption[0].chartItemOption.gridColor;
                        } else if (c.tick.value !== 0 && c.tick.value % thisCross.pivot1 === 0 
                                    && (!obOption.verticalSplit || obOption.crossAxesLength === 4)) {
                          return _itemOption[1].chartItemOption.gridColor;
                        }
                      }
                    }
                  }
                } // if grid
              } // Number(arg) === 1
  
              else if(Number(arg) === 2) { // bar(hor)
                this.options.indexAxis = 'y';

                // x축 라벨 선, 글자 디자인
                if (obOption.crossAxesLength === 3) {
                  this.options.scales.y.title.font.size = 35;
                } else if (obOption.crossAxesLength === 4) {
                  this.options.scales.y.title.font.size = 55;
                }

                if (obOption.rowList.itemLen === 3) {
                  this.options.scales.y.title.padding = 50;
                }
                if (obOption.rowList.itemLen === 4) {
                  this.options.scales.y.title.padding = 100;
                  this.options.scales.y.title.font.size = 35;
                }

                // 선으로 항목 나누기
                if (this.pivot1 !== 0 && this.pivot2 !== 0) {
                  let thisCross = this;
                  this.options.scales.y.grid = {
                    lineWidth: function (c) {
                      if (c.tick) {
                        if (c.tick.value !== 0 && c.tick.value % thisCross.pivot2 === 0) {
                          return _itemOption[0].chartItemOption.gridThickness;
                        } else if (c.tick.value !== 0 && c.tick.value % thisCross.pivot1 === 0 
                                    && (!obOption.verticalSplit || obOption.crossAxesLength === 4)) {
                          return _itemOption[1].chartItemOption.gridThickness;
                        }
                      }
                    },
                    color: function(c) {
                      if (c.tick) {
                        if (c.tick.value !== 0 && c.tick.value % thisCross.pivot2 === 0) {
                          return _itemOption[0].chartItemOption.gridColor;
                        } else if (c.tick.value !== 0 && c.tick.value % thisCross.pivot1 === 0 
                                    && (!obOption.verticalSplit || obOption.crossAxesLength === 4)) {
                          return _itemOption[1].chartItemOption.gridColor;
                        }
                      }
                    }
                  }
                } // if grid
                
              }  // Number(arg) === 2
              
              else if (Number(arg) === 3) {
                this.options.plugins.tooltip.enabled = true; // usePointStyle: true
                if (obOption.details[2].mouseHover) {
                  this.options.animation.radius = {
                    duration: 400,
                    easing: 'linear',
                    loop: (context) => context.active
                  };
                }
                this.options.showLine = obOption.details[2].showLine;
                // 멀티 툴팁 여부
                if (obOption.details[2].interaction) {
                  this.options.plugins.tooltip.position= 'average'; // average , nearest
                  this.options.interaction = {
                    mode: 'index', // index , point , nearest , dataset
                    axis: 'xy',
                    intersect: false,
                  };
                } else {
                  this.options.plugins.tooltip.position= 'nearest'; // average , nearest
                  this.options.interaction = {
                    mode: 'point', // index , point , nearest , dataset
                    axis: 'xy',
                    intersect: false,
                  };
                }

              } // Number(arg) === 3

              this.pieMode = false;
              this.labels = this.labelsBar;
              this.datasets = this.datasetsBar;
              this.datasets.forEach(d => {
                if (Number(arg) === 3) {
                  d.backgroundColor = d.backgroundColorSingle;
                  d.hoverBackgroundColor = d.backgroundColorSingle;
                  d.borderColor = d.backgroundColorSingle;
                } else {
                  d.backgroundColor = d.backgroundColorArr;
                  d.hoverBackgroundColor = d.hoverBackgroundColorArr;
                  delete d.borderColor;
                }
              });

            } // else Number(arg) === 4

          } // setPieMode
        }; // return 
      }, // makeCrossChart [End]

      searchCode(key, evalItem) {
        let mid;
        let res = '';
        // 현재 날짜를 이용하고 싶다면 let arr = this.getDate[key].split('/'); 를 사용하라!
        if ('dateType' === key) {
          mid = this.getStatSetting[key];
          switch(mid) {
            case 1: res = '연간'; break;
            case 2: res = '월간'; break;
            case 3: res = '지정'; break;
            default : res = 'error'; break;
          }
        }
        else if (['startDate', 'endDate'].includes(key)) {
          mid = this.getStatSetting['dateType'];
          let arr = this.getStatSetting['dateRange'][key]
                      .toLocaleDateString().slice(0, -1)
                      .split('. ');
          switch(mid) {
            // 연간
            case 3: res = arr[2] + '일'; 
            case 2: res = arr[1] + '월' + res; 
            case 1: res = arr[0] + '년' + res; break;
            default : res = 'error'; break;
          }
          res = res;
        }
        else if ('strDate' === key) { // #{검색일시}#
          mid = this.getStatSetting['dateType'];
          let arrS = this.getStatSetting['dateRange']['startDate']
                .toLocaleDateString().slice(0, -1).split('. ');
          let arrE = this.getStatSetting['dateRange']['endDate']
                .toLocaleDateString().slice(0, -1).split('. ');
          if (mid === 3) {
            let tempStr = '';
            tempStr = arrS[0]+'년' + arrS[1]+'월' + arrS[2] +'일';
            tempStr += '~';
            tempStr += arrE[0]+'년' + arrE[1]+'월' + arrE[2] +'일';
            res = tempStr;
          } else {
            // 연간, 월간
            switch(mid) {
              case 2: res = arrS[1] + '월' + res; 
              case 1: res = arrS[0] + '년' + res; break;
              default : res = 'error'; break;
            }
          }
          
        }
        else if ('searchRange' === key) {
          mid = this.getStatSetting[key];
          for (let [k, v] of Object.entries(mid)) {
            res += this.getNewsGroupInfo[v]['sname'] + ', ';
          }
          res = res.slice(0,-2);
        }

        else if (['keyword','notKeyword'].includes(key)) {
          res = this.getStatSetting[key];
        }
        else if (['keywordOption','notKeywordOption'].includes(key)) {
          res = this.getStatSetting[key] == 1 ? 'AND' : 'OR';
        }
        else if ('searchCriteria' === key) {
          res = this.getStatSetting[key]['includeHideArticles'] ? '감춘 기사 포함 / ' : '';
          res += this.getStatSetting[key]['includingNot'] ? '평가 제외 기사 포함 / ' : '';
          res += this.getStatSetting[key]['includingPrivate'] ? '비공개 스크랩 포함 / ' : '';
          res = res.slice(0, -3);
        }
        else if ('selectionMediumCount' === key) {
          mid = this.getStatSetting['selectionMedium'];
          let total = {};
          let dupl = {};
          // 전체 매체
          for (let k of this.getMediaList) {
            if (total['media'] === undefined) 
              total['media'] = 1;
            else 
              total['media'] += 1;
          }

          // 개별 매체
          for (let [k,v] of Object.entries(mid)) {
            v.forEach(el => { 
              if (dupl['media'] === undefined) 
                dupl['media'] = 1;
              else 
                dupl['media'] += 1;
            });
          }

          let txt = '[';
          for (let [k, v] of Object.entries(dupl)) {
              txt += v + '/' + total[k];
          };
          txt += ']';
          res = txt;
        }
        else if ('groupIsCategory' === key) {
          res = this.getStatSetting['groupIsCategory'] ? '분류' : '유형';
        }
        else if ('selectionMedium' === key) { 
          mid = this.getStatSetting[key];
          let txt = '';
          for (let [k,v] of Object.entries(mid)) {
            txt += k + ' (';
            v.forEach(el => {
              txt += el.media_name + ', ';
            });
            txt = txt.slice(0, -2);
            txt += ') / ';
          }
          txt = txt.slice(0, -3);
          res = txt;
        }
        else if ('selectionMediumType' === key) {
          mid = this.getStatSetting['selectionMedium'];
          let dupl = {};
          for (let [k,v] of Object.entries(mid)) {
            v.forEach(el => { if (!dupl[el.media_type_name]) dupl[el.media_type_name] = k; });
          }
          let txt = '매체타입 (';
          for (let [v, k] of Object.entries(dupl)) {
              txt += v + ', ';
          };
          txt = txt.slice(0, -2);
          txt += ') / ';
          
          txt = txt.slice(0, -3);
          res = txt;
        }
        else if ('selectionMediumTypeCount' === key) {
          mid = this.getStatSetting['selectionMedium'];
          let dupl = {};
          for (let [k,v] of Object.entries(mid)) {
            v.forEach(el => { 
              if (dupl[el.media_type_name] === undefined) 
                dupl[el.media_type_name] = 1;
              else 
                dupl[el.media_type_name] += 1;
            });
          }
          let txt = '[매체타입] ';
          for (let [k, v] of Object.entries(dupl)) {
              txt += k + '(' + v + '), ';
          };
          txt = txt.slice(0, -2);
          res = txt;
        }
        else if ('selectionMediumTypeRate' === key) {
          mid = this.getStatSetting['selectionMedium'];
          let total = {};
          let dupl = {};
          // 전체 매체
          for (let k of this.getMediaList) {
            if (total[k.media_type_name] === undefined) 
              total[k.media_type_name] = 1;
            else 
              total[k.media_type_name] += 1;
          }

          // 개별 매체
          for (let [k,v] of Object.entries(mid)) {
            v.forEach(el => { 
              if (dupl[el.media_type_name] === undefined) 
                dupl[el.media_type_name] = 1;
              else 
                dupl[el.media_type_name] += 1;
            });
          }

          let txt = '[매체타입] ';
          for (let [k, v] of Object.entries(dupl)) {
              txt += k + '(' + v + '/' + total[k] + '), ';
          };
          txt = txt.slice(0, -2);
          res = txt;
        }
        else if (['evaluationItem0', 'evaluationItem2'].includes(key)) { 
          mid = this.getStatSetting[key];
          let txt = '';
          for (let v of mid) {
            txt += evalItem[v].value + ', ';
          }
          res = txt.slice(0, -2);
        }
        else if ('evaluationItem1' == (key)) { 
          mid = this.getStatSetting[key];
          let txt = '';
          for (let v of mid) {
            txt += evalItem['M1'+v].value + ', ';
          }
          res = txt.slice(0, -2);
        }
        else if (['0','1','2','3'].includes(key)) {
          res = this.totalAxesList[key] === undefined ? '미선택-항목'+(parseInt(key)+1) : this.totalAxesList[key];
        } else if (key == "calcValue-numberScaleDupe") {
          let divi = key.split('-');
          res = '건수';
          if (this[divi[0]]) {
            res = '가치-';
            mid = Number(this[divi[1]]);
            switch(mid) {
              case 0: res += '원'; break;
              case 1: res += '천원'; break;
              case 2: res += '백만원'; break;
              default : console.error("keyword error"); break;
            }
          }
        } else {
          return null;
        }
        return res === '' ? 'None' : res;
      },


      fnTitleCodeParser(text, evalItem) {
        const OPEN = "#{";
        const CLOSE = "}#";
        let sentence = [];
        let word = '';
        let keyword='', v='', res='', nextidx=0;
        let size = text.length;
        for (let i=0; i<size; i++) {
          if (text.substring(i, i+2) == CLOSE 
              && sentence.slice(nextidx).join('').includes(OPEN)) {
            keyword = CLOSE;
            i = i+2;
            while((word=sentence.pop()) != undefined) {
              keyword = word + keyword;
              if (keyword.includes(OPEN)) break;
            }
            v = this.$keywordMap[keyword]
            res = this.searchCode(v, evalItem);
            sentence.push(res !== null ? res : keyword);
            nextidx = sentence.length;
          }
          text[i] && sentence.push(text[i]);
        }
        return sentence.join('');
      },

      /**
       * @param {object} configEvalItem
       * @param {object} media
       * @param {boolean} doesItReturnCode 코드의 반환이 필요한가?
       */
      prepareMediaSpecificItems(configEvalItem, media, type, doesItReturnCode) {
        // 언론사 이름(=mn)
        // 유형(=mt : 지면, 온라인, 바송, 사용자매체)
        let _code = null;
        let mnmt = null;
        let mn = media.media_name;
        let mt = type;

        if (this.byName && this.byCode) {
          let _media_ids = [], _media_name, _media_by_map = null;
          let _media_by_mid = this.mapIndex.mid[media.media_id];
          _media_ids.push(_media_by_mid.media_id);
          if (_media_by_mid.media_oid_map !== null) { // 매칭되는 매체 존재 (복수)
            _media_by_map = this.mapIndex.oid[_media_by_mid.media_oid_map];
            if (_media_by_map) {
              _media_ids.push(_media_by_map.media_id);
            }
          
            let _media_ids_exists = false, _media_ids_empty = [];
            _media_ids.forEach(i => {
              let  _mn = this.mapIndex.mid[i].media_name;
              if (configEvalItem['EM-'+_mn]) {
                _media_ids_exists = i;
              } else {
                _media_ids_empty.push(i);
              }
            });
            // if (this.mapIndex.mid[_media_ids_exists].media_name.includes("조선비즈")) console.log(___t);
            if (!_media_ids_exists && _media_ids_empty[0]) {
              let ___t = this.mapIndex.mid[_media_ids_empty[0]];
              // let ___t_for_mn = null;
              // if (___t['media_type'] === '0') {
              //   ___t_for_mn = ___t;
              // } else if (_media_ids_empty.length > 1) {
              //   if (this.mapIndex.mid[_media_ids_empty[1]].media_type !== '0') {
              //     ___t_for_mn = ___t;
              //   } else {
              //     ___t_for_mn = this.mapIndex.mid[_media_ids_empty[1]];
              //   }
              // } else {
              //   ___t_for_mn = ___t;
              // }
              // mnmt = (___t_for_mn.media_type == 0) ? ___t_for_mn.media_name : ___t_for_mn.media_name + '(' + ___t_for_mn.media_type_name + ')';
              // _media_name = ___t_for_mn.media_name;
              mnmt = (___t.media_type == 0) ? ___t.media_name : ___t.media_name + '(' + ___t.media_type_name + ')';
              _media_name = ___t.media_name;
            } else { // 매칭되는 매체 없음 (단일)
              mnmt = (_media_by_mid.media_type == 0) ? _media_by_mid.media_name : _media_by_mid.media_name + '(' + _media_by_mid.media_type_name + ')';
              _media_name = _media_by_mid.media_name;
            }
            _code = 'EM-' + _media_name;
          } else {
            // let __mn = _media_by_mid.media_name;
            // _code = 'EM-' + __mn;
            // mnmt = __mn;
            mnmt = (_media_by_mid.media_type == 0) ? _media_by_mid.media_name : _media_by_mid.media_name + '(' + _media_by_mid.media_type_name + ')';
            _code = 'EM-' + _media_by_mid.media_name;
          }
        }
        else if (this.byName && !this.byCode) {
          _code = 'EM-' + mn;
          mnmt = mn;
        }
        else if (!this.byName && this.byCode) {
          // 지면(코드)과 온라인(코드)이 있다면 지면으로 통일(값 합치기)하여 데이터 출력
          let _media_ids = [], _media_id, _media_by_map = null;
          let _media_by_mid = this.mapIndex.mid[media.media_id];
          _media_ids.push(_media_by_mid.media_id);
          if (_media_by_mid.media_oid_map !== null) {
            _media_by_map = this.mapIndex.oid[_media_by_mid.media_oid_map];
            if (_media_by_map) {
              _media_ids.push(_media_by_map.media_id);
            }
          }
          let _media_ids_exists = false, _media_ids_empty = [];
          _media_ids.forEach(i => {
            if (configEvalItem['EM-'+i]) {
              _media_ids_exists = i;
            } else {
              _media_ids_empty.push(i);
            }
          });

          if (!_media_ids_exists && _media_ids_empty[0]) {
            let ___t = this.mapIndex.mid[_media_ids_empty[0]];
            // let ___t_for_mn = null;
            // if (___t['media_type'] === '0') {
            //   ___t_for_mn = ___t;
            // } else if (_media_ids_empty.length > 1) {
            //   if (this.mapIndex.mid[_media_ids_empty[1]].media_type !== '0') {
            //     ___t_for_mn = ___t;
            //   } else {
            //     ___t_for_mn = this.mapIndex.mid[_media_ids_empty[1]];
            //   }
            // } else {
            //   ___t_for_mn = ___t;
            // }
            // mnmt = (___t_for_mn.media_type == 0) ? ___t_for_mn.media_name : ___t_for_mn.media_name + '(' + ___t_for_mn.media_type_name + ')';
            mnmt = (___t.media_type == 0) ? ___t.media_name : ___t.media_name + '(' + ___t.media_type_name + ')';
            _media_id = media.media_id;
          } else {
            _media_id = _media_ids_exists;
          }
          _code = 'EM-' + _media_id;
        }
        else {
          _code = 'EM-' + media.media_id + '-' + media.media_type;
          if (mt && mt !== "지면") mnmt = mn + "("+mt+")";
          else mnmt = mn;
        }

        if (doesItReturnCode) return _code;
        // configEvalItem 값 추가
        if (!configEvalItem[_code]) {
          configEvalItem[_code] = {
            group_seq: "100555",
            group_name: '매체별',
            value: mnmt
          };
        }
      },

      /**
       * @description: group에 속하는 항목이 존재하는지 확인하는 함수
       * @param : getConfigEval (=String)
       * @param : eval2_seq     (=String)
       * @param : group         (=String)
       * @return: boolean
       */
      checkItemGroup(configEval, eval2_seq, group) {
        if (eval2_seq === null || eval2_seq === undefined) return false;
        if (group == "M1") {
          const m1Group = configEval.item.M1
          for (const [_, list] of Object.entries(m1Group)) {
            if (list.group_seq == eval2_seq) return true;
          }
          return false;
        } else {
          for (const [_, list] of Object.entries(configEval.group[group])) {
            if (list.seq === eval2_seq) return true;
          }
          return false;
        } // if-else
      },

      /* 
        lastEval2Code는 [기사의 건수 및 가치]를 부여하는 로직에서
        해당 평가 항목 (크기면 크기, 글자수면 글자수..)의 속성을 필요로 하기 때문에, (현)로직에서 데이터가 세팅된다.
        ** 마지막 항목을 기준으로 데이터가 초기화 된다.
      */
      dataIntersection(rawCrossData, crossLength, newS, ev2ObjIdx0, ev2ObjIdx1, ev2ObjIdx2, ev2ObjIdx3) {
        if (crossLength === 1) { 
          this.settingRawCrossData(rawCrossData, crossLength, newS, 'r'+ev2ObjIdx0);
          if (!this.lastEval2Code.includes('r'+ev2ObjIdx0)) this.lastEval2Code.push('r'+ev2ObjIdx0);
        } else if (crossLength === 2) {
          this.settingRawCrossData(rawCrossData, crossLength, newS, 'x'+ev2ObjIdx0, 'r'+ev2ObjIdx1);
          if (!this.lastEval2Code.includes('r'+ev2ObjIdx1)) this.lastEval2Code.push('r'+ev2ObjIdx1);
        } else if (crossLength === 3) {
          this.settingRawCrossData(rawCrossData, crossLength, newS, 'x'+ev2ObjIdx0, 'y'+ev2ObjIdx1, 'r'+ev2ObjIdx2);
          if (!this.lastEval2Code.includes('r'+ev2ObjIdx2)) this.lastEval2Code.push('r'+ev2ObjIdx2);
        } else { 
          this.settingRawCrossData(rawCrossData, crossLength, newS, 'x'+ev2ObjIdx0, 'y'+ev2ObjIdx1, 'z'+ev2ObjIdx2, 'r'+ev2ObjIdx3);
          if (!this.lastEval2Code.includes('r'+ev2ObjIdx3)) this.lastEval2Code.push('r'+ev2ObjIdx3);
        }
      },

      settingRawCrossData(rawCrossData, crossLength, newS, ...args) { 
        if (args.includes(null)) {
          console.error('function settingRawCrossData : Set cross-std error');
          return ;
        }
        // if(crossLength > 4 || crossLength < 1) return console.error('function settingRawCrossData error : "args" expected to be null. ', e);
        // 
        // function eptCreateArr(obj, argsSSS) {
        //   let key = argsSSS.shift();
        //   let rObj = obj[key];
        //   if( argsSSS.length == 0 ) {
        //     if(!rObj) obj[key] = [];
        //     return obj[key];
        //   } else {
        //     if(!rObj) obj[key] = {};
        //     eptCreateArr(obj[key], argsSSS);
        //   }
        // }
        
        // let obj = eptCreateArr(this.rawCrossData, args);
        // obj.push(newS);

        switch(crossLength) {
          case 1:
            if (!rawCrossData[args[0]]) rawCrossData[args[0]] = [];
            rawCrossData[args[0]].push(newS);
            break;
          case 2:
            if (!rawCrossData[args[0]]) rawCrossData[args[0]] = {};
            if (!rawCrossData[args[0]][args[1]]) rawCrossData[args[0]][args[1]] = [];
            rawCrossData[args[0]][args[1]].push(newS);
            break;
          case 3:
            if (!rawCrossData[args[0]]) rawCrossData[args[0]] = {};
            if (!rawCrossData[args[0]][args[1]]) rawCrossData[args[0]][args[1]] = {};
            if (!rawCrossData[args[0]][args[1]][args[2]]) rawCrossData[args[0]][args[1]][args[2]] = [];
            rawCrossData[args[0]][args[1]][args[2]].push(newS);
            break;
          case 4:
            if (!rawCrossData[args[0]]) rawCrossData[args[0]] = {};
            if (!rawCrossData[args[0]][args[1]]) rawCrossData[args[0]][args[1]] = {};
            if (!rawCrossData[args[0]][args[1]][args[2]]) rawCrossData[args[0]][args[1]][args[2]] = {};
            if (!rawCrossData[args[0]][args[1]][args[2]][args[3]]) rawCrossData[args[0]][args[1]][args[2]][args[3]] = [];
            rawCrossData[args[0]][args[1]][args[2]][args[3]].push(newS);
            break;
          default:
            console.error('function settingRawCrossData error : "args" expected to be null. ', e);
            return;
        } 

      }, // [END] settingRawCrossData()


      /* --알고리즘--
        funcExtrac  : 교차-기준(this.req_evg_seq)에 따른 평가항목 추출 함수
        req_evg_seq : 교차-기준
        evalItem    : 평가 항목들(=configEvalItem)
        last_idx    : 교차-기준(=this.req_evg_seq)의 마지막 인덱스
        dateType    : 날짜 유형 (연간, 월간, 일간)
        dateRange   : 날짜
        start       : 시작 인덱스
        end         : 마지막 인덱스

        ex) row    : 크기(대, 중, 소), 글자수(대, 중, 소, 테)
            column : 출입기자(출입기자, 특수기자), 수록지면(1,2,3,4, 기타)
            return - Type Array
                    - row > 0:[대, 중, 소]        1:[대, 중, 소, 테]
                    - col > 0:[출입기자, 특수기자} 1:[1, 2, 3, 4, 기타]
      */
      setSubcodeForSpecificGroup(req_evg_seq, evalItem, dateType, dateRange, start, end) {
        /* EvalClassify(DB테이블)에 있는 데이터 테이블 항목(헤더) 가져오기
          @des : 데이터가 없는 항목도 가져오기 위한 코드
                ex) evalItem(1, 2, 3, 4, ...) = configEvalItem
                    req_evg_seq [1, ..., ..., ...]
                    
                사용되는 이름 :
                    L group_seq : number (1, 2, 3, ...) -> 전체(공통) 항목 코드 (크기-대=1, 크기-중-2, ...)
                    L res       : number (1, 2, 3, ...) -> 교차기준 항목 코드 (크기-대=1, 크기-중-2, ...)
                    L group_name: string (크기, 글자수, 매체 중요도)
        */
        const funcExtrac = (res, evalItem) => { // 행/열의 테이블 항목(헤더) 뽑아내기
          let item = {};
          for (let [key, val] of Object.entries(evalItem)) {
            let equalGroup = String(val.group_seq) === String(res);
            if (equalGroup) { 
              item[key] = {};
            } 
          }
          return item;
        }
        // 날짜 계산
        const dayCalc = (code, dateType, dateRange) => {
          let date = 0;
          if (dateType === 1) date = 12;
          else date = dateRange.length; 
          let item = {};
          for (let k = 1; k <= date; k++) {
            if (dateType === 1) item[code+fillZero(k)] = {};
            else item[code+dateRange[k-1]] = {};
          }
          return item;
        }
        // fillzero: 01, 02, ..., 11, 12
        const fillZero = (str, width=2) => {
          str = String(str);
          return str.length >= width ? str : new Array((width-str.length)+1).join('0') + str;
        }

        let RowOrColArr = [];
        for (let i = start; i < end; i++) {
          let item_group = Number(req_evg_seq[i]); // 그룹 시퀀스
          if ( item_group === 100001 ) {
            RowOrColArr.push(dayCalc('T', dateType, dateRange));
          } else {
            RowOrColArr.push(funcExtrac(item_group, evalItem)); 
          }
        }
        return RowOrColArr;
      }, // [end] setSubcodeForSpecificGroup



      /*
        create Object
        ex) row       : 크기(대, 중, 소), 글자수(대, 중, 소, 테)
            colunm    : 출입기자(출입기자, 특수기자), 수록지면(1,2,3,4, 기타)
            integrated: row Struc[대][대]={}     column Struc[출입기자][1]={}
                        row Struc[대][중]={}     column Struc[출입기자][2]={}
                        row Struc[대][소]={}     column Struc[출입기자][3]={}
                        row Struc[대][테]={}     column Struc[출입기자][4]={}
                        ...etc
            arr       : 일차원 배열
                        0: {1: {}, 2: {}, 3: {}} (크기-대=1, 중=2, 소=3)
                        1: {4: {}, 5: {}, 6: {}} (글자수-대=4, 중=5, 소=6)
            opLen     : 옵션 길이 (교차-기준)
            axisIdx   : axisArr의 인덱스
            axisArr   : x -> z 순으로.. r은 끝 데이터
                        {x1:{y4:{r12:0}}}
                        {x1:{r4:1}}
                        ...
      */
      codeLayering(arr, opLen, axisIdx, axisArr=['x','y','z','r']) {
        let object = {};
        for (let idx = 0; idx < arr.length; idx++) {
          let isData = (opLen==(axisIdx+1)) ? true : false; // 마지막 옵션('r~':데이터)인가?
          if (idx===0) {
            for (let [key, v] of Object.entries(arr[idx])){
              if (isData) axisIdx = 3;
              object[axisArr[axisIdx]+key] = {};
            }axisIdx++;
          } else if (idx===1) {
            for (let [rcKey, rcV] of Object.entries(object)){
              for (let [key, v] of Object.entries(arr[idx])){
                if (isData) axisIdx = 3;
                object[rcKey][axisArr[axisIdx]+key] = {};
              } 
            }axisIdx++;
          } else if (idx===2) {
            for (let [rcKey, rcV] of Object.entries(object)){
              for (let [rc2Key, rc2V] of Object.entries(rcV)){
                for (let [key, v] of Object.entries(arr[idx])) {
                  if (isData) axisIdx = 3;
                  object[rcKey][rc2Key][axisArr[axisIdx]+key] = {};
                }
              } 
            }axisIdx++;
          } else if (idx===3) {
            for (let [rcKey, rcV] of Object.entries(object)){
              for (let [rc2Key, rc2V] of Object.entries(rcV)){
                for (let [rc3Key, rc3V] of Object.entries(rc2V)) {
                  for (let [key, v] of Object.entries(arr[idx])) {
                    if (isData) axisIdx = 3;
                    object[rcKey][rc2Key][rc3Key][axisArr[axisIdx]+key] = {};
                  }
                }
              } 
            }axisIdx++;
          }
        } // for
        
        return [object, axisIdx];
      },

      snatcher(rc, evalItem, req_evg_seq, changeData) {
        let gen = ['10001', '10002', '10003'];
        let top_inc = ['10022','10033'];
        if (!req_evg_seq.filter(x=> gen.includes(x) || top_inc.includes(x))) return;

        let top = {};
        let middle = {};
        let bottom = {};
        // 대분류, 중분류, 소분류 나누기
        for (let [code, value] of Object.entries(evalItem)) {
          if (code.includes('M1')) {
            if (value.upper_seq == 0 && value.group_name.includes('대분류')) top[code] = value;
            if (value.group_name.includes('중분류')) middle[code] = value;
            if (value.group_name.includes('소분류')) bottom[code] = value;
          }
        }
        // 대-중 관계 찾기
        let top_middle = {}
        for (let [tc, tv] of Object.entries(top)) {
          for (let [mc, mv] of Object.entries(middle)) {
            if (tv.seq == mv.rel_seq[0]) {
              if (!top_middle[tc]) top_middle[tc] = {};
              if (!top_middle[tc][mc]) top_middle[tc][mc] = {};
            }
          }
        }

        // 중-소 관계 찾기
        let middle_bottom_G = {}
        let middle_bottom_T = {}
        for (let [mc, mv] of Object.entries(middle)) {
          for (let [bc, bv] of Object.entries(bottom)) {
            if (mv.seq == bv.rel_seq[1] && !bc.includes('-')) {
              if (!middle_bottom_G[mc]) middle_bottom_G[mc] = {};
              if (!middle_bottom_G[mc][bc]) middle_bottom_G[mc][bc] = {};
            }
            if (mv.seq == bv.rel_seq[1]) {
              if (!middle_bottom_T[mc]) middle_bottom_T[mc] = {};
              if (!middle_bottom_T[mc][bc]) middle_bottom_T[mc][bc] = {};
            }
          }
        }

        // 대-중-소 관계 찾기
        // 대-소 관계 찾기
        let top_middle_bottom_G = {}
        let top_middle_bottom_T = {}
        let top_bottom_G = {};
        let top_bottom_T = {};
        for (let [tc, tv] of Object.entries(top)) {
          for (let [mc, mv] of Object.entries(middle)) {
            if (tv.seq == mv.rel_seq[0]) {
              if (!top_middle_bottom_G[tc]) top_middle_bottom_G[tc] = {};
              if (!top_middle_bottom_G[tc][mc]) top_middle_bottom_G[tc][mc] = {};
              if (!top_middle_bottom_T[tc]) top_middle_bottom_T[tc] = {};
              if (!top_bottom_G[tc]) top_bottom_G[tc] = {};
              if (!top_bottom_T[tc]) top_bottom_T[tc] = {};
              if (!top_middle_bottom_T[tc][mc]) top_middle_bottom_T[tc][mc] = {};
            }
            for (let [bc, bv] of Object.entries(bottom)) {
              if (mv.seq == bv.rel_seq[1] && !bc.includes('-')) {
                if (!top_middle_bottom_G[tc]) continue;
                if (!top_middle_bottom_G[tc][mc]) continue;
                if (!top_middle_bottom_G[tc][mc][bc]) top_middle_bottom_G[tc][mc][bc] = {};
              }
              if (mv.seq == bv.rel_seq[1]) {
                if (!top_middle_bottom_T[tc]) continue;
                if (!top_middle_bottom_T[tc][mc]) continue;
                if (!top_middle_bottom_T[tc][mc][bc]) top_middle_bottom_T[tc][mc][bc] = {};
              }
              if (tv.seq == bv.rel_seq[0] && !bc.includes('-')) {
                if (!top_bottom_G[tc]) continue;
                if (!top_bottom_G[tc][bc]) top_bottom_G[tc][bc] = {};
              }
              if (tv.seq == bv.rel_seq[0]) {
                if (!top_bottom_T[tc]) continue;
                if (!top_bottom_T[tc][bc]) top_bottom_T[tc][bc] = {};
              }
            }
          }
        }
        // manual
        // 대 20003 20004 20023 20034
        // 중 20005 20035
        // 소 

        // 3 대 중 v
        // 4 대 소
        // 5 중 소 v
        // 8 대 중 소
        const req_code = req_evg_seq.map(x => {
          if (gen.includes(x) || top_inc.includes(x)) return "o";
          else return "_";
        }).join("");
        let order = req_evg_seq.filter(e => gen.includes(e) || top_inc.includes(e)).map(x => Number(x));
        let relation = 0;
        const ol = order.length;
        for (let i = 0; i < ol-1; i++) {
          relation += (order[i] + order[i+1]) % 10; // 10001 & 99992 || 10001 & 99993
        }

        for (let [p1, c1] of Object.entries(rc)) {
          for (let [p2, c2] of Object.entries(c1)) {
            if (req_code == "oo" || req_code == "oo_" || req_code == "oo__") {
              this.relationshipAnalysis(gen, req_evg_seq[1], relation, rc
                , req_code, p1, p2, null, null
                , top_middle, middle_bottom_G, middle_bottom_T, top_bottom_G, top_bottom_T
              );
            }

            for (let [p3, c3] of Object.entries(c2)) {
              if (req_code == "o_o" || req_code == "o_o_" || req_code == "_oo" || req_code == "_oo_") {
                this.relationshipAnalysis(gen, req_evg_seq[2], relation, rc
                  , req_code, p1, p2, p3, null
                  , top_middle, middle_bottom_G, middle_bottom_T, top_bottom_G, top_bottom_T
                );
              }
              if (req_code == "ooo" || req_code == "ooo_" ) {
                this.relationshipAnalysis(gen, req_evg_seq[2], relation, rc
                  , req_code, p1, p2, p3, null
                  , top_middle_bottom_G, top_middle_bottom_T, null, null, null
                );
              }

              for (let [p4, _] of Object.entries(c3)) {
                
                if (req_code == "_o_o" || req_code == "__oo" || req_code == "o__o") {
                  this.relationshipAnalysis(gen, req_evg_seq[3], relation, rc
                    , req_code, p1, p2, p3, p4
                    , top_middle, middle_bottom_G, middle_bottom_T, top_bottom_G, top_bottom_T
                  );
                }
                if (req_code == "oo_o" || req_code == "o_oo" || req_code == "_ooo") {
                  this.relationshipAnalysis(gen, req_evg_seq[3], relation, rc
                    , req_code, p1, p2, p3, p4
                    , top_middle_bottom_G, top_middle_bottom_T, null, null, null
                  );
                }

              } // for-4
            } // for-3
          } // for-2
        } // for
      },

      relationshipAnalysis(gen, r_e_s, relation, row, req_code, p1, p2, p3, p4, $tm, $mb, $mb_, $tb, $tb_) {
        if (relation !== 8) {
          if (gen.includes(r_e_s)) {
            if (relation == 3) this.delAttr(row, $tm, req_code, p1, p2, p3, p4);
            else if (relation == 4) this.delAttr(row, $tb, req_code, p1, p2, p3, p4);
            else if (relation == 5) this.delAttr(row, $mb, req_code, p1, p2, p3, p4);
          }
          else {
            if (relation == 3) this.delAttr(row, $tm, req_code, p1, p2, p3, p4);
            else if (relation == 4) this.delAttr(row, $tb_, req_code, p1, p2, p3, p4);
            else if (relation == 5) this.delAttr(row, $mb_, req_code, p1, p2, p3, p4);
          }
        } else {
          if (gen.includes(r_e_s)) this.delAttr(row, $tm, req_code, p1, p2, p3, p4); 
          else this.delAttr(row, $mb, req_code, p1, p2, p3, p4);
        }
      },

      delAttr(row, source, code, p1, p2, p3, p4) {
        if (code == 'oo' || code == 'oo_' || code == 'oo__') {
          if (!row[p1]) return;
          if (!source[p1.slice(1)]) delete row[p1];
          else {
            if (!source[p1.slice(1)][p2.slice(1)]) delete row[p1][p2];
            if (Object.keys(row[p1]).length == 0) delete row[p1];
          } // if-else
        }
        else if (code == 'o_o' || code == 'o_o_') {
          if (!row[p1] || !row[p1][p2]) return;
          if (!source[p1.slice(1)]) delete row[p1];
          else {
            if (!source[p1.slice(1)][p3.slice(1)]) delete row[p1][p2][p3];
            if (Object.keys(row[p1][p2]).length == 0) delete row[p1][p2];
            if (Object.keys(row[p1]).length == 0) delete row[p1];
          } // if-else
        }
        else if (code == '_oo' || code == '_oo_') {
          if (!row[p1] || !row[p1][p2]) return;
          if (!source[p2.slice(1)]) delete row[p1][p2];
          else {
            if (!source[p2.slice(1)][p3.slice(1)]) delete row[p1][p2][p3];
            if (Object.keys(row[p1][p2]).length == 0) delete row[p1][p2];
          } // if-else
          if (Object.keys(row[p1]).length == 0) delete row[p1];
        }
        else if (code == 'ooo' || code == 'ooo_') {
          if (!row[p1] || !row[p1][p2]) return;
          if (!source[p1.slice(1)]) delete row[p1];
          else {
            if (!source[p1.slice(1)][p2.slice(1)]) {
              delete row[p1][p2];
            } else {
              if (!source[p1.slice(1)][p2.slice(1)][p3.slice(1)]) delete row[p1][p2][p3];
              if (Object.keys(row[p1][p2]).length == 0) delete row[p1][p2];
            }
            if (Object.keys(row[p1]).length == 0) delete row[p1];
          } // if-else
        }
        else if (code == '_o_o') {
          if (!row[p1] || !row[p1][p2] || !row[p1][p2][p3]) return;
          if (!source[p2.slice(1)]) { 
            delete row[p1][p2];
          } else {
            if (!source[p2.slice(1)][p4.slice(1)]) delete row[p1][p2][p3][p4];
            if (Object.keys(row[p1][p2][p3]).length == 0) delete row[p1][p2][p3];
            if (Object.keys(row[p1][p2]).length == 0) delete row[p1][p2];
          } // if-else
          if (Object.keys(row[p1]).length == 0) delete row[p1];
        }
        else if (code == '__oo') {
          if (!row[p1] || !row[p1][p2] || !row[p1][p2][p3]) return;
          if (!source[p3.slice(1)]) {
            delete row[p1][p2][p3];
          } else {
            if (!source[p3.slice(1)][p4.slice(1)]) delete row[p1][p2][p3][p4];
            if (Object.keys(row[p1][p2][p3]).length == 0) delete row[p1][p2][p3];
          } // if-else
          if (Object.keys(row[p1][p2]).length == 0) delete row[p1][p2];
          if (Object.keys(row[p1]).length == 0) delete row[p1];
        }
        else if (code == 'o__o') {
          if (!row[p1] || !row[p1][p2] || !row[p1][p2][p3]) return;
          if (!source[p1.slice(1)])  {
            delete row[p1];
          } else {
            if (!source[p1.slice(1)][p4.slice(1)]) delete row[p1][p2][p3][p4];
            if (Object.keys(row[p1][p2][p3]).length == 0) delete row[p1][p2][p3];
            if (Object.keys(row[p1][p2]).length == 0) delete row[p1][p2];
            if (Object.keys(row[p1]).length == 0) delete row[p1];
          } // if-else
          
        }
        else if (code == 'oo_o') {
          if (!row[p1] || !row[p1][p2] || !row[p1][p2][p3]) return;
          if (!source[p1.slice(1)]) delete row[p1];
          else {
            if (!source[p1.slice(1)][p2.slice(1)]) {
              delete row[p1][p2];
            } else {
              if (!source[p1.slice(1)][p2.slice(1)][p4.slice(1)]) delete row[p1][p2][p3][p4];
              if (Object.keys(row[p1][p2][p3]).length == 0) delete row[p1][p2][p3];
              if (Object.keys(row[p1][p2]).length == 0) delete row[p1][p2];
            }
            if (Object.keys(row[p1]).length == 0) delete row[p1];
          } // if-else
        }
        else if (code == 'o_oo') {
          if (!row[p1] || !row[p1][p2] || !row[p1][p2][p3]) return;
          if (!source[p1.slice(1)]) delete row[p1];
          else {
            if (!source[p1.slice(1)][p3.slice(1)]) {
              delete row[p1][p2][p3];
            } else {
              if (!source[p1.slice(1)][p3.slice(1)][p4.slice(1)]) delete row[p1][p2][p3][p4];
              if (Object.keys(row[p1][p2][p3]).length == 0) delete row[p1][p2][p3];
            }
            if (Object.keys(row[p1][p2]).length == 0) delete row[p1][p2];
            if (Object.keys(row[p1]).length == 0) delete row[p1];
          } // if-else
        }
        else if (code == '_ooo') {
          if (!row[p1] || !row[p1][p2] || !row[p1][p2][p3]) return;
          if (!source[p2.slice(1)]) delete row[p1][p2];
          else {
            if (!source[p2.slice(1)][p3.slice(1)]) {
              delete row[p1][p2][p3];
            } else {
              if (!source[p2.slice(1)][p3.slice(1)][p4.slice(1)]) delete row[p1][p2][p3][p4];
              if (Object.keys(row[p1][p2][p3]).length == 0) delete row[p1][p2][p3];
            }
            if (Object.keys(row[p1][p2]).length == 0) delete row[p1][p2];
          } // if-else
          if (Object.keys(row[p1]).length == 0) delete row[p1];
        }
        
      }, // delAttr()


      /* 테이블 항목(헤더)의 이름을 출력
        headerName에서 x, y, z, r, rt, T, emp 문자열을 제거하고,
        남은 code를 getConfigEvalItem에 적용하여 항목(헤더)-값['value']을 뽑아냄.
      */
      eval2HeaderName: function (headerName, evalitem) {
        try { 
          if (headerName.includes('T') && !headerName.includes('M') && !this.$regex.test(headerName)) {
            let hn = headerName.replace(/[xyzr][T]/,'');
            if (this.getStatSetting.dateType === 1) 
              return hn + '월';
            else if (this.getStatSetting.dateType === 2) 
              return hn.substring(6) + '일';
            else if (this.getStatSetting.dateType === 3) {
              if (hn.length > 6) 
                return hn.substring(4,6) + '월 ' + hn.substring(6) + '일';
              else 
                return hn.substring(0,4) + '년 ' + hn.substring(4, 6) + '월';
            }
          }
          else if (headerName.includes('emp')) 
            return headerName.replace(/emp/,'') + '.';
          else 
            return evalitem[headerName.replace(/[rxyz]/,'')]['value'];
        } catch (e) {
          console.error('headerName: ',headerName, ' / ', e);
        }
      },
      
      /* 테이블 항목(헤더)의 제목(ex 크기, 글자수, 기간 등등)을 출력
        headerName에서 x, y, z, r, rt, T, emp 문자열을 제거하고,
        남은 code를 getConfigEvalItem에 적용하여 제목-그룹이름['group_name']을 뽑아냄.
      */
      evalTitle(evalitem, headerName, pos, isCol=true) {
        const _itemCode = headerName.replace(/[xyzr]/,'');
        try { 
          if (_itemCode.match( new RegExp(/^T/, 'g') ) !== null) return '< 기간 ><br/>';
          else if (_itemCode.includes('t')) return '< 기간 ><br/>';
          // 'emp'가 맨 앞으로 나오면 제목 처리가 달라짐.
          else if (_itemCode.includes('emp')) { 
            return '< '+ this.option.optionName[pos].name +' ><br/>';
            // if (isCol) {
            //   return '< '+ this.option.optionName[pos].name +' ><br/>';
            // } else {
            //   return '< '+ this.option.optionName[pos].name +' ><br/>';
            // }
          }
          else return '< '+evalitem[_itemCode]['group_name']+' ><br/>';
        } catch(e) {
          console.error(e);
        }
      },

      makeTableColumnHeader: function (evalitem, cStruc, row=1, col=1) { 
        let entr = ob => { return (ob!=null) ? Object.entries(ob) : null; };
        let th = (title, header, colSpan=1) => { return '<th colspan="'+colSpan+'">'+title+""+this.eval2HeaderName(header, evalitem)+'</th>' }; /* <th> Text </th>를 구성해줌 */
        let onlyOneItemName = {'fir':true, 'sec':true, 'thi':true, 'fou':true}; /* 항목의 제목(ex 크기, 글자수, 기간 등등)을 한번만 등장시켜줌. */
        let text = '<tr>' + '<th class="table_name" colspan="'+row+'", rowspan="'+col+'">'; /* 전체 Text */ 
        text += this.req_evg_name.join(' > ') + '</th>';

        if (col === 0) {
          text += '<th class="last_head" rowspan="'+col+'">합계'+(this.calcUnit != null ? '('+this.calcUnit+')': '(건)')+'</th>';
        } else if (col === 1) { // column이 1개일 때
          for (let [firHeader, f] of entr(cStruc)) { 
            text += th( onlyOneItemName['fir'] ? this.evalTitle(evalitem, firHeader, 0) : '',
                        firHeader);
            onlyOneItemName['fir'] = false;
          } 
          text += '<th class="last_head" rowspan="'+col+'">합계'+(this.calcUnit != null ? '('+this.calcUnit+')': '(건)')+'</th>';

        } else if(col === 2) { // column이 2개일 때
          let firSpan=0, totalTxt={'fir':'','sec':''};
          for (let [firHeader, f] of entr(cStruc)) {
            for (let [secHeader, s] of entr(f)) {
                totalTxt['sec'] += th( onlyOneItemName['sec'] ? this.evalTitle(evalitem, secHeader, 1) : '',
                                      secHeader);
                onlyOneItemName['sec'] = false;
                firSpan++;
            }
            totalTxt['fir'] += th( onlyOneItemName['fir'] ? this.evalTitle(evalitem, firHeader, 0) : '',
                                  firHeader, firSpan);
            onlyOneItemName['fir'] = false;
            firSpan = 0;
          }
          // text(그림판)에 옮기기
          text += totalTxt['fir'];
          text += '<th class="last_head" rowspan="'+col+'">합계'+(this.calcUnit != null ? '('+this.calcUnit+')': '(건)')+'</th>';
          text += '</tr><tr>';
          text += totalTxt['sec'];

        } else if(col === 3) { // column이 3개일 때
          let firSpan=0, secSpan=0, totalTxt={'fir':'','sec':'','thi':''};
          for (let [firHeader, f] of entr(cStruc)) {
              for (let [secHeader, s] of entr(f)) {
                  for (let [thiHeader, t] of entr(s)) {
                      totalTxt['thi'] += th( onlyOneItemName['thi'] ? this.evalTitle(evalitem, thiHeader, 2) : '',
                                            thiHeader);
                      onlyOneItemName['thi'] = false;
                      secSpan++; firSpan++;
                  }
                  totalTxt['sec'] += th( onlyOneItemName['sec'] ? this.evalTitle(evalitem, secHeader, 1) : '',
                                        secHeader, secSpan);
                  onlyOneItemName['sec'] = false;
                  secSpan=0;
              }
              totalTxt['fir'] += th( onlyOneItemName['fir'] ? this.evalTitle(evalitem, firHeader, 0) : '',
                                    firHeader, firSpan);
              onlyOneItemName['fir'] = false;
              firSpan = 0;
          }
          // text(그림판)에 옮기기
          text += totalTxt['fir'];
          text += '<th class="last_head" rowspan="'+col+'">합계'+(this.calcUnit != null ? '('+this.calcUnit+')': '(건)')+'</th>';
          text += '</tr><tr>';
          text += totalTxt['sec'];
          text += '</tr><tr>';
          text += totalTxt['thi'];
        } else if(col === 4) {
          let firSpan=0, secSpan=0, thiSpan=0, totalTxt={'fir':'','sec':'','thi':'', 'fou':''};
          for (let [firHeader, f] of entr(cStruc)) {
              for (let [secHeader, s] of entr(f)) {
                  for (let [thiHeader, t] of entr(s)) {
                      for (let [fouHeader, f] of entr(t)) {
                          totalTxt['fou'] += th( onlyOneItemName['fou'] ? this.evalTitle(evalitem, fouHeader, 3) : '',
                                            fouHeader);
                          onlyOneItemName['fou'] = false;
                          secSpan++; firSpan++; thiSpan++;
                      }
                      totalTxt['thi'] += th( onlyOneItemName['thi'] ? this.evalTitle(evalitem, thiHeader, 2) : '',
                                            thiHeader, thiSpan);
                      onlyOneItemName['thi'] = false;
                      thiSpan=0;
                  }
                  totalTxt['sec'] += th( onlyOneItemName['sec'] ? this.evalTitle(evalitem, secHeader, 1) : '',
                                        secHeader, secSpan);
                  onlyOneItemName['sec'] = false;
                  secSpan=0;
              }
              totalTxt['fir'] += th( onlyOneItemName['fir'] ? this.evalTitle(evalitem, firHeader, 0) : '',
                                    firHeader, firSpan);
              onlyOneItemName['fir'] = false;
              firSpan = 0;
          }
          // text(그림판)에 옮기기
          text += totalTxt['fir'];
          text += '<th class="last_head" rowspan="'+col+'">합계'+(this.calcUnit != null ? '('+this.calcUnit+')': '(건)')+'</th>';
          text += '</tr><tr>';
          text += totalTxt['sec'];
          text += '</tr><tr>';
          text += totalTxt['thi'];
          text += '</tr><tr>';
          text += totalTxt['fou'];
        }
        text += '</tr>';
        return text;
      }, // makeTableColumnHeader
      
      
      makeTableRowHeaderWithBody: function (dataProcessing, evalitem, row, col) {
        let entr = ob => { return (ob!=null) ? Object.entries(ob) : null; };
        let td = (title, headerName, row=1) => { 
          if (title === '') return '<td rowspan="'+row+'">'+headerName+'</td>'; 
          else return '<td class="rowsize" rowspan="'+row+'">'+title+''+headerName+'</td>'; 
        };
        let onlyOneItemName = {'fir':true, 'sec':true, 'thi':true, 'fou':true};
        let text = '';


        if (col === 0) { 
            let firTxt='', secTxt='', thiTxt='', fouTxt='';
            let firSpan=0, secSpan=0, thiSpan=0;
            let firTr=false, secTr=false, thiTr=false, fouTr=false;
            for (let [xRowHeader, xObject] of entr(dataProcessing)) { // [start] 1차원
                if(row===1) {
                  text += '<tr>';
                  text += td( onlyOneItemName['fir'] ? this.evalTitle(evalitem, xRowHeader, 0, false) : '',
                              this.eval2HeaderName(xRowHeader, evalitem));
                  onlyOneItemName['fir']=false;
                  text += td('', xObject);
                }

                if(row===2) firTxt += '<tr>';
                if(row===3) firTxt += '<tr>';
                if(row===4) firTxt += '<tr>';

                for (let [yRowHeader, yObject] of entr(xObject)) { // [start] 2차원
                    if(row===2) {
                        secTxt += td( onlyOneItemName['sec'] ? this.evalTitle(evalitem, yRowHeader, 1, false) : '',
                                      this.eval2HeaderName(yRowHeader, evalitem) );
                        onlyOneItemName['sec']=false;
                        secTxt += td('', yObject);
                        secTxt += '</tr>';
                        secTxt += '<tr>';

                        firSpan++;
                    }
                    if(row===3) if(secTr) secTxt += '<tr>';
                    if(row===4) if(secTr) secTxt += '<tr>';

                    for (let [zRowHeader, zObject] of entr(yObject)) { // [start] 3차원
                        if(row===3) {
                            thiTxt += td( onlyOneItemName['thi'] ? this.evalTitle(evalitem, zRowHeader, 2, false) : '',
                                          this.eval2HeaderName(zRowHeader, evalitem) );
                            onlyOneItemName['thi']=false;
                            thiTxt += td('', zObject);
                            thiTxt += '</tr>';
                            thiTxt += '<tr>';

                            secSpan++;
                            firSpan++;
                        }

                      
                        for (let [rRowHeader, rObject] of entr(zObject)) { // [start] 4차원
                            if(row===4) {
                                fouTxt += td( onlyOneItemName['fou'] ? this.evalTitle(evalitem, rRowHeader, 3, false) : '',
                                              this.eval2HeaderName(rRowHeader, evalitem) );
                                onlyOneItemName['fou']=false;
                                fouTxt += td('', rObject);
                                fouTxt += '</tr>';
                                fouTxt += '<tr>';

                                thiSpan++;
                                secSpan++;
                                firSpan++;
                            }
                        } // [end] 4차원

                        if(row===4) {
                            if (thiTxt.slice(-4).includes('<tr>')) thiTxt = thiTxt.slice(0, -4);
                            thiTxt += td( onlyOneItemName['thi'] ? this.evalTitle(evalitem, zRowHeader, 2, false) : '',
                                          this.eval2HeaderName(zRowHeader, evalitem), thiSpan ) + fouTxt;
                            onlyOneItemName['thi']=false;
                            fouTxt = '';
                            
                            thiSpan = 0;
                        }
                    } // [end] 3차원


                    if(row===3) {
                        if (thiTxt.slice(-4).includes('<tr>')) thiTxt = thiTxt.slice(0, -4);
                        secTxt += td( onlyOneItemName['sec'] ? this.evalTitle(evalitem, yRowHeader, 1, false) : '',
                                      this.eval2HeaderName(yRowHeader, evalitem), secSpan ) + thiTxt;
                        onlyOneItemName['sec']=false;
                        thiTxt = '';
                        secTr = true;
                        secSpan = 0;
                    }
                    if(row===4) {
                        if (thiTxt.slice(-4).includes('<tr>')) thiTxt = thiTxt.slice(0, -4);
                        secTxt += td( onlyOneItemName['sec'] ? this.evalTitle(evalitem, yRowHeader, 1, false) : '',
                                      this.eval2HeaderName(yRowHeader, evalitem), secSpan ) + thiTxt;
                        onlyOneItemName['sec']=false;
                        thiTxt = '';
                        
                        secSpan = 0;
                    }
                } // [end] 2차원


                if(row===1) text += '</tr>';
                if(row===2) {
                    if (secTxt.slice(-4).includes('<tr>')) secTxt = secTxt.slice(0, -4);
                    firTxt += td( onlyOneItemName['fir'] ? this.evalTitle(evalitem, xRowHeader, 0, false) : '',
                                  this.eval2HeaderName(xRowHeader, evalitem), firSpan) + secTxt;
                    onlyOneItemName['fir']=false;
                    firSpan = 0;

                    text += firTxt;
                    secTxt = '';
                    firTxt = '';
                }
                if(row===3) {
                    firTxt += td( onlyOneItemName['fir'] ? this.evalTitle(evalitem, xRowHeader, 0, false) : '',
                                  this.eval2HeaderName(xRowHeader, evalitem), firSpan) + secTxt;
                    onlyOneItemName['fir']=false;
                    firSpan = 0;

                    text += firTxt;
                    secTr = false;
                    secTxt = '';
                    firTxt = '';
                }
                if(row===4) {
                    firTxt += td( onlyOneItemName['fir'] ? this.evalTitle(evalitem, xRowHeader, 0, false) : '',
                                  this.eval2HeaderName(xRowHeader, evalitem), firSpan) + secTxt;
                    onlyOneItemName['fir']=false;
                    firSpan = 0;

                    text += firTxt;
                    secTr = false;
                    thiTr = false;
                    secTxt = '';
                    firTxt = '';
                } 
            }  // [end] 1차원
        } else if (row===1) {
            for (let [xRowHeader, xObject] of entr(dataProcessing)) {
                text += '<tr>';
                text += td( onlyOneItemName['fir'] ? this.evalTitle(evalitem, xRowHeader, 0, false) : '',
                            this.eval2HeaderName(xRowHeader, evalitem));
                onlyOneItemName['fir'] = false;
                for (let [yRowHeader, yObject] of entr(xObject)) {    
                    if (typeof(yObject)==='object') {
                        for (let [zRowHeader, zObject] of entr(yObject)) {
                            if (typeof(zObject)==='object') {
                                for (let [rRowHeader, rObject] of entr(zObject)) {
                                    text += td('',rObject);
                                }
                            } else {
                                text += td('',zObject);
                            }
                        }
                    } else {
                        text += td('',yObject);
                    }
                }
                text += '</tr>';
            }
            // row===1

        } else if (row===2) {
            let firTxt='', secTxt='', thiTxt='';
            let firSpan=0, secSpan=0;
            let firTr=false, secTr=false, thiTr=false, fouTr=false;
            for (let [xRowHeader, xObject] of entr(dataProcessing)) {
                if (firTr) firTxt += '<tr>';
                for (let [yRowHeader, yObject] of entr(xObject)) {
                    if (secTr) secTxt += '<tr>';
                    for (let [zRowHeader, zObject] of entr(yObject)) {
                        if (typeof(zObject) === 'object') {
                            for (let [rRowHeader, rObject] of entr(zObject)) {
                                thiTxt += td('',rObject);
                            }
                        } else {
                            thiTxt += td('',zObject);
                        }
                    }
                    if (thiTxt.slice(-5)!=='</tr>')
                        thiTxt += '</tr>';
                    
                    secTxt += td( onlyOneItemName['sec'] ? this.evalTitle(evalitem, yRowHeader, 1, false) : '',
                                  this.eval2HeaderName(yRowHeader, evalitem)) + thiTxt;
                                  onlyOneItemName['sec']=false;                    
                    secTr = true;
                    thiTr = false;
                    fouTr = false;
                    secSpan = 0;
                    thiTxt = '';

                    firSpan++;
                }
                firTxt += td( onlyOneItemName['fir'] ? this.evalTitle(evalitem, xRowHeader, 0, false) : '',
                              this.eval2HeaderName(xRowHeader, evalitem), firSpan) + secTxt;
                              onlyOneItemName['fir']=false;
                firTr = true;
                secTr = false;
                thiTr = false;
                fouTr = false;
                firSpan = 0;
                secTxt = '';

                text += firTxt;
                firTxt = '';
            }
            // row===2

        } else if (row===3) {
            let firTxt='', secTxt='', thiTxt='', fouTxt='';
            let firSpan=0, secSpan=0;
            let firTr=false, secTr=false, thiTr=false, fouTr=false;
            for (let [xRowHeader, xObject] of entr(dataProcessing)) {
                if (firTr) firTxt += '<tr>';
                for (let [yRowHeader, yObject] of entr(xObject)) {
                    if (secTr) secTxt += '<tr>';
                    for (let [zRowHeader, zObject] of entr(yObject)) {
                        if (thiTr) thiTxt += '<tr>';
                        for (let [rRowHeader, rObject] of entr(zObject)) {
                            fouTxt += td('',rObject);
                        }
                        if (fouTxt.slice(-5)!=='</tr>')
                            fouTxt += '</tr>';
                            
                        thiTxt += td( onlyOneItemName['thi'] ? this.evalTitle(evalitem, zRowHeader, 2, false) : '',
                                      this.eval2HeaderName(zRowHeader, evalitem)) + fouTxt;
                                      onlyOneItemName['thi']=false; 
                        thiTr = true;
                        fouTr = false;
                        fouTxt = '';

                        firSpan++; secSpan++;
                    }
                    secTxt += td( onlyOneItemName['sec'] ? this.evalTitle(evalitem, yRowHeader, 1, false) : '',
                                  this.eval2HeaderName(yRowHeader, evalitem), secSpan) + thiTxt;
                                  onlyOneItemName['sec']=false; 
                    secTr = true;
                    thiTr = false;
                    fouTr = false;
                    secSpan = 0;
                    thiTxt = '';

                }
                firTxt += td( onlyOneItemName['fir'] ? this.evalTitle(evalitem, xRowHeader, 0, false) : '',
                              this.eval2HeaderName(xRowHeader, evalitem), firSpan) + secTxt;
                              onlyOneItemName['fir']=false; 
                firTr = true;
                secTr = false;
                thiTr = false;
                fouTr = false;
                firSpan = 0;
                secTxt = '';

                text += firTxt;
                firTxt = '';
            }
        } // row===3

        return text;
      },

      // 테이블 구조의 데이터 계층 만들기 //
      concatRowAndColumn: function(rowStruc, columnStruc, row, col) {
          let entr = ob => { return (ob!=null) ? Object.entries(ob) : null; };
          let completedStruc = {};
          // column 교차-기준 옵션이 없을 경우
          if (col!==0) {
            // Column 우측끝에 '합계'란 추가하기
            for (let [colHeader, colObject] of entr(columnStruc)) {
              if (!columnStruc['sum']) columnStruc['sum'] = {};
            }
          }

          /*
          행/열 이어붙이기
          ex)
            row: x1 - y1, y2, y3\
            col: z1 - r1, r2, r3
            
            <row + col>
            x1 - y1 + z1 - r1, r2, r3
            x1 - y2 + z1 - r1, r2, r3
            x1 - y3 + z1 - r1, r2, r3
          */
          for (let [xRowHeader, xObject] of entr(rowStruc)) {
              if (row===1 && !completedStruc[xRowHeader]) completedStruc[xRowHeader] = columnStruc;
              else if (row!==1 && !completedStruc[xRowHeader]) completedStruc[xRowHeader] = {};
              for (let [yRowHeader, yObject] of entr(xObject)) {
                  if (row===2 && !completedStruc[xRowHeader][yRowHeader]) completedStruc[xRowHeader][yRowHeader] = columnStruc;
                  else if (row!==2 && !completedStruc[xRowHeader][yRowHeader]) completedStruc[xRowHeader][yRowHeader] = {};
                  for (let [zRowHeader, zObject] of entr(yObject)) {
                      if (row===3 && !completedStruc[xRowHeader][yRowHeader][zRowHeader]) completedStruc[xRowHeader][yRowHeader][zRowHeader] = columnStruc;
                      else if (row!==3 && !completedStruc[xRowHeader][yRowHeader][zRowHeader]) completedStruc[xRowHeader][yRowHeader][zRowHeader] = {};
                      for (let [rRowHeader, rObject] of entr(zObject)) {
                          if (row===4 && !completedStruc[xRowHeader][yRowHeader][zRowHeader][rRowHeader]) 
                            completedStruc[xRowHeader][yRowHeader][zRowHeader][rRowHeader] = columnStruc;
                      }
                  }  
              }
          }
          return completedStruc;
      },


      /**
       * @description :
       *    각 테이블 항목에 해당하는 데이터를 초기화 해준다.
       *    ex) table-data[크기-대][글자수-중]
       *        위 데이터 구조에 데이터가 존재하면 ... 아니면 0 
       *    
       *    makeFooter 함수의 파라미터 값도 생성한다. (colSum)
       */
      makeTableForm: function(rawObject, completedStruc, row, col) {
        let entr = ob => { return (ob!=null) ? Object.entries(ob) : null; };
        let dataProcessing = {};
        let tempSum = 0, notEnterd = {'z':true, 'r':true};
        // 모든 테이블 위치를 '0'으로 초기화하기
        for (let [xRowHeader, xObject] of entr(completedStruc)) { // fir
            if (Object.keys(xObject).length < 1) {
                dataProcessing[xRowHeader] = '-';
            } else {
                if (!dataProcessing[xRowHeader]) dataProcessing[xRowHeader] = {}; 
                for (let [yRowHeader, yObject] of entr(xObject)) { // sec
                    if (Object.keys(yObject).length < 1) {
                        dataProcessing[xRowHeader][yRowHeader] = '-';
                    } else {
                        if (!dataProcessing[xRowHeader][yRowHeader]) dataProcessing[xRowHeader][yRowHeader] = {}; // [][y]
                        for (let [zRowHeader, zObject] of entr(yObject)) { // thi
                            if (Object.keys(zObject).length < 1) {
                                dataProcessing[xRowHeader][yRowHeader][zRowHeader] = '-';
                            } else {
                                if (!dataProcessing[xRowHeader][yRowHeader][zRowHeader]) dataProcessing[xRowHeader][yRowHeader][zRowHeader] = {}; // [][][z]
                                for (let [rRowHeader, rObject] of entr(zObject)) { // fou
                                    if (!dataProcessing[xRowHeader][yRowHeader][zRowHeader][rRowHeader]) 
                                      dataProcessing[xRowHeader][yRowHeader][zRowHeader][rRowHeader] = '-';
                                } // -for
                            }
                        } // -for
                    }
                } // -for
            }
        } // for
        
        // 교차-기준 행/열의 배치 경우에 수
        let row1col1 = (row===1 && col===1), row2col1 = (row===2 && col===1), row3col1 = (row===3 && col===1);
        let row1col2 = (row===1 && col===2), row2col2 = (row===2 && col===2);
        let row1col3 = (row===1 && col===3);
        // '0'이 아닌 데이터(수)가 존재하면, 해당 값으로 바꾸기
        // sum-합계 계산
        let colSum  = [], tempColSum = {};
        // row 1,2,3, col 1
        if (row1col1 || row2col1 || row3col1) {
          for (let [xRowHeader, xObject] of entr(rawObject)) { // fir
              notEnterd['z'] = true; notEnterd['r'] = true;
              for (let [yRowHeader, yObject] of entr(xObject)) { // sec
                  if (Object.keys(yObject).length < 1) { try{
                      dataProcessing[xRowHeader][yRowHeader] = yObject;}catch(e) {console.error(xRowHeader, yRowHeader,'::', e)}
                      if (typeof(yObject) === 'number') { tempSum += yObject; tempColSum[yRowHeader] = yObject;}
                      else { tempSum += 0; }
                  } else {
                      notEnterd['z'] = false;
                      for (let [zRowHeader, zObject] of entr(yObject)) { // thi
                          if (Object.keys(zObject).length < 1) {
                              dataProcessing[xRowHeader][yRowHeader][zRowHeader] = zObject;
                              if (typeof(zObject) === 'number') { tempSum += zObject; tempColSum[zRowHeader] = zObject;}
                              else { tempSum += 0; }
                          } else {
                              notEnterd['r'] = false;
                              for (let [rRowHeader, rObject] of entr(zObject)) { // fou
                                  dataProcessing[xRowHeader][yRowHeader][zRowHeader][rRowHeader] = rObject;
                                  if (typeof(rObject) === 'number') { tempSum += rObject; tempColSum[rRowHeader] = rObject;}
                                  else { tempSum += 0; }
                              } 
                              dataProcessing[xRowHeader][yRowHeader][zRowHeader]['sum'] = tempSum;
                              tempColSum['sum'] = tempSum;  tempSum = 0;
                              colSum.push(tempColSum); tempColSum = {};
                          }
                      } 
                      if (notEnterd['r']) {
                        dataProcessing[xRowHeader][yRowHeader]['sum'] = tempSum;
                        tempColSum['sum'] = tempSum;  tempSum = 0; 
                        colSum.push(tempColSum); tempColSum = {};
                      }
                  }
              }
              if (notEnterd['z']) {
                dataProcessing[xRowHeader]['sum'] = tempSum;
                tempColSum['sum'] = tempSum; tempSum = 0; 
                colSum.push(tempColSum); tempColSum = {};
              }   
          } // for
        }
        // row 1 col 2
        else if (row1col2) {
          for (let [xRowHeader, xObject] of entr(rawObject)) { // fir
              for (let [yRowHeader, yObject] of entr(xObject)) { // sec
                  if (!tempColSum[yRowHeader]) tempColSum[yRowHeader] = {};
                  for (let [zRowHeader, zObject] of entr(yObject)) { // thi
                      dataProcessing[xRowHeader][yRowHeader][zRowHeader] = zObject;
                      
                      if (typeof(zObject) === 'number') { 
                        tempSum += zObject; 
                        tempColSum[yRowHeader][zRowHeader] = zObject;
                      }
                      else {
                        tempSum += 0; 
                      }
                  }
              }
              dataProcessing[xRowHeader]['sum'] = tempSum;
              if (!tempColSum['sum']) tempColSum['sum'] = {};
              tempColSum['sum']['sum'] = tempSum;
              colSum.push(tempColSum);
              tempColSum = {}; tempSum = 0;
          } // for
        }
        // row 2 col 2
        else if (row2col2) {
          for (let [xRowHeader, xObject] of entr(rawObject)) { // fir
              for (let [yRowHeader, yObject] of entr(xObject)) { // sec
                  for (let [zRowHeader, zObject] of entr(yObject)) { // thi
                      if (!tempColSum[zRowHeader]) tempColSum[zRowHeader] = {};
                      for (let [rRowHeader, rObject] of entr(zObject)) { // fou
                          dataProcessing[xRowHeader][yRowHeader][zRowHeader][rRowHeader] = rObject;
                          if (typeof(rObject) === 'number') { tempSum += rObject; tempColSum[zRowHeader][rRowHeader] = rObject; }
                          else tempSum += 0;
                      }
                  }
                  dataProcessing[xRowHeader][yRowHeader]['sum'] = tempSum;
                  if (!tempColSum['sum']) tempColSum['sum'] = {};
                  tempColSum['sum']['sum'] = tempSum;
                  colSum.push(tempColSum);
                  tempColSum = {}; tempSum = 0;
              }
          } // for
        }
        // row 1 col 3
        else if (row1col3) {
          for (let [xRowHeader, xObject] of entr(rawObject)) { // fir
              for (let [yRowHeader, yObject] of entr(xObject)) { // sec
                  if (!tempColSum[yRowHeader]) tempColSum[yRowHeader] = {};
                  for (let [zRowHeader, zObject] of entr(yObject)) { // thi
                    if (!tempColSum[yRowHeader][zRowHeader]) tempColSum[yRowHeader][zRowHeader] = {};
                      for (let [rRowHeader, rObject] of entr(zObject)) { // fou
                          dataProcessing[xRowHeader][yRowHeader][zRowHeader][rRowHeader] = rObject;
                          if (typeof(rObject) === 'number') { 
                            tempSum += rObject;
                            tempColSum[yRowHeader][zRowHeader][rRowHeader] = rObject;
                          }
                          else tempSum += 0;
                      }
                  }
              }
              dataProcessing[xRowHeader]['sum'] = tempSum;
              if (!tempColSum['sum']) tempColSum['sum'] = {};
              if (!tempColSum['sum']['sum']) tempColSum['sum']['sum'] = {};
              tempColSum['sum']['sum']['sum'] = tempSum;
              colSum.push(tempColSum);
              tempColSum = {}; tempSum = 0;
          } // for
        }
        // row 1~4 col 0 
        else if (col === 0) {
          for (let [xRowHeader, xObject] of entr(rawObject)) { // fir
            if (typeof(xObject) !== 'object') { 
              dataProcessing[xRowHeader] = xObject; 
              if (!tempColSum['sum']) tempColSum['sum'] = xObject;
              else tempColSum['sum'] += xObject;
            }
            else {
              for (let [yRowHeader, yObject] of entr(xObject)) { // sec
                if (typeof(yObject) !== 'object') {
                  dataProcessing[xRowHeader][yRowHeader] = yObject;
                  if (!tempColSum['sum']) tempColSum['sum'] = yObject;
                  else tempColSum['sum'] += yObject;
                }
                else {
                  for (let [zRowHeader, zObject] of entr(yObject)) { // thi
                    if (typeof(zObject) !== 'object') { 
                      dataProcessing[xRowHeader][yRowHeader][zRowHeader] = zObject;
                      if (!tempColSum['sum']) tempColSum['sum'] = zObject;
                      else tempColSum['sum'] += zObject;
                    }
                    else {
                      for (let [rRowHeader, rObject] of entr(zObject)) { // fou
                          dataProcessing[xRowHeader][yRowHeader][zRowHeader][rRowHeader] = rObject;
                          if (!tempColSum['sum']) tempColSum['sum'] = rObject;
                          else tempColSum['sum'] += rObject;
                      } // fou-for
                    }
                  } // thi-for

                }
              } // sec-for 
            }
            colSum.push(tempColSum);
            tempColSum = {};
          } // fir-for
        }
        /**
         * // row 0 col 1~4 
         */
        else if (row === 0) {
          for (let [xRowHeader, xObject] of entr(rawObject)) { // fir
            if (typeof(xObject) === 'number') {
              if(!tempColSum[xRowHeader]) tempColSum[xRowHeader] = xObject;
              if(!tempColSum['sum']) tempColSum['sum'] = xObject;
              else tempColSum['sum'] += xObject;      
            }
            for (let [yRowHeader, yObject] of entr(xObject)) { // sec
              if (typeof(yObject) === 'number') {
                if(!tempColSum[xRowHeader]) tempColSum[xRowHeader] = {};
                if(!tempColSum[xRowHeader][yRowHeader]) tempColSum[xRowHeader][yRowHeader] = yObject;
                if(!tempColSum['sum']) tempColSum['sum'] = {};
                if(!tempColSum['sum']['sum']) tempColSum['sum']['sum'] = yObject;
                else tempColSum['sum']['sum'] += yObject;
              }
              for (let [zRowHeader, zObject] of entr(yObject)) { // thi
                if (typeof(zObject) === 'number') {
                  if(!tempColSum[xRowHeader]) tempColSum[xRowHeader] = {};
                  if(!tempColSum[xRowHeader][yRowHeader]) tempColSum[xRowHeader][yRowHeader] = {};
                  if(!tempColSum[xRowHeader][yRowHeader][zRowHeader]) tempColSum[xRowHeader][yRowHeader][zRowHeader] = zObject;
                  if(!tempColSum['sum']) tempColSum['sum'] = {};
                  if(!tempColSum['sum']['sum']) tempColSum['sum']['sum'] = {};
                  if(!tempColSum['sum']['sum']['sum']) tempColSum['sum']['sum']['sum'] = zObject;
                  else tempColSum['sum']['sum']['sum'] += zObject;
                }
                for (let [rRowHeader, rObject] of entr(zObject)) { // fou
                  if(!tempColSum[xRowHeader]) tempColSum[xRowHeader] = {};
                  if(!tempColSum[xRowHeader][yRowHeader]) tempColSum[xRowHeader][yRowHeader] = {};
                  if(!tempColSum[xRowHeader][yRowHeader][zRowHeader]) tempColSum[xRowHeader][yRowHeader][zRowHeader] = {};
                  if(!tempColSum[xRowHeader][yRowHeader][zRowHeader][rRowHeader]) 
                    tempColSum[xRowHeader][yRowHeader][zRowHeader][rRowHeader] = rObject;
                  if(!tempColSum['sum']) tempColSum['sum'] = {};
                  if(!tempColSum['sum']['sum']) tempColSum['sum']['sum'] = {};
                  if(!tempColSum['sum']['sum']['sum']) tempColSum['sum']['sum']['sum'] = {};
                  if(!tempColSum['sum']['sum']['sum']['sum']) tempColSum['sum']['sum']['sum']['sum'] = rObject;
                  else tempColSum['sum']['sum']['sum']['sum'] += rObject;
                }
              }
            }
          }
          colSum.push(tempColSum);
        }
        return [dataProcessing, colSum];
      },

      // 열에 대한 합계 계산
      makeFooter(row, col, colSum, columnStruc) {
        // 변수
        let dict = {}, text = '';
        // 객체 정렬
        let funcSort = (obj) => {
          return Object.keys(obj).sort().reduce(function (newObj, key) {
                    newObj[key] = obj[key];
                    return newObj;
                  }, {});
        };
        // 초기화
        for (let [key1, val1] of Object.entries(columnStruc)) {
          if (Object.keys(val1).length < 1) {
            if (!dict[key1]) dict[key1] = 0;
          } else {
            if (!dict[key1]) dict[key1] = {};
            for (let [key2, val2] of Object.entries(val1)) {
              if (Object.keys(val2).length < 1) {
                if (!dict[key1][key2]) dict[key1][key2] = 0;
              } else {
                if (!dict[key1][key2]) dict[key1][key2] = {};
                for (let [key3, val3] of Object.entries(val2)) {
                  if (Object.keys(val3).length < 1) {
                    if (!dict[key1][key2][key3]) dict[key1][key2][key3] = 0;
                  } else {
                    if (!dict[key1][key2][key3]) dict[key1][key2][key3] = {};
                    for (let [key4, val4] of Object.entries(val3)) {
                      if (!dict[key1][key2][key3][key4]) dict[key1][key2][key3][key4] = 0;
                    }
                  }
                }
              }
            }
          }
        }
        
        if (col === 0) {
          // 합산
          for (let i = 0; i < colSum.length; i++) {
            for (let [key, val] of Object.entries(colSum[i])) {
              if (!dict[key]) dict[key] = val;
              else dict[key] += val;
            }
          }
          // 출력
          for (let [key, val] of Object.entries(dict)) {
            if (val===0) val = '-';
            text += '<td>'+val+'</td>';
          }
        } else if (col === 1) {
          dict['sum'] = 0;
          // 합산
          for (let i = 0; i < colSum.length; i++) {
            let sortedObj = funcSort(colSum[i]);
            for (let [key, val] of Object.entries(sortedObj)) {
              if (!dict[key]) dict[key] = val;
              else dict[key] += val;
            }
          }
          // 출력
          for (let [key, val] of Object.entries(dict)) {
            if (val===0) val = '-';
            text += '<td>'+val+'</td>';
          }
        } else if( col === 2) {
          dict['sum'] = {};
          dict['sum']['sum'] = 0;
          // 합산
          for (let i = 0; i < colSum.length; i++) {
            let sortedObj = funcSort(colSum[i]);
            for (let [key1, val1] of Object.entries(sortedObj)) {
              if (!dict[key1]) dict[key1] = {};
              for (let [key2, val2] of Object.entries(val1)) {
                if (!dict[key1][key2]) dict[key1][key2] = val2;
                else dict[key1][key2] += val2;
              }
            }
          }
          // 출력
          for (let [key1, val1] of Object.entries(dict)) {
            for (let [key2, val2] of Object.entries(val1)) {
              if (val2===0) val2 = '-';
              text += '<td>'+val2+'</td>';
            }
          }
        } else if ( col === 3 ) {
          dict['sum'] = {};
          dict['sum']['sum'] = {};
          dict['sum']['sum']['sum'] = 0;
          // 합산
          for (let i = 0; i < colSum.length; i++) {
            let sortedObj = funcSort(colSum[i]);
            for (let [key1, val1] of Object.entries(sortedObj)) {
              if (!dict[key1]) dict[key1] = {};
              for (let [key2, val2] of Object.entries(val1)) {
                if (!dict[key1][key2]) dict[key1][key2] = {};
                for (let [key3, val3] of Object.entries(val2)) {
                  if (!dict[key1][key2][key3]) dict[key1][key2][key3] = val3;
                  else dict[key1][key2][key3] += val3;
                }
              }
            }
          }
          // 출력
          for (let [key1, val1] of Object.entries(dict)) {
            for (let [key2, val2] of Object.entries(val1)) {
              for (let [key3, val3] of Object.entries(val2)) {
                if (val3===0) val3 = '-';
                text += '<td>'+val3+'</td>';
              }
            }
          }
        } else if ( col === 4 ) {
          dict['sum'] = {};
          dict['sum']['sum'] = {};
          dict['sum']['sum']['sum'] = {};
          dict['sum']['sum']['sum']['sum'] = 0;
          // 합산
          for (let i = 0; i < colSum.length; i++) {
            let sortedObj = funcSort(colSum[i]);
            for (let [key1, val1] of Object.entries(sortedObj)) {
              if (!dict[key1]) dict[key1] = {};
              for (let [key2, val2] of Object.entries(val1)) {
                if (!dict[key1][key2]) dict[key1][key2] = {};
                for (let [key3, val3] of Object.entries(val2)) {
                  if (!dict[key1][key2][key3]) dict[key1][key2][key3] = {};
                  for (let [key4, val4] of Object.entries(val3)) {
                    if (!dict[key1][key2][key3][key4]) dict[key1][key2][key3][key4] = val4;
                    else dict[key1][key2][key3][key4] += val4;
                  }
                }
              }
            }
          }
          // 출력
          for (let [key1, val1] of Object.entries(dict)) {
            for (let [key2, val2] of Object.entries(val1)) {
              for (let [key3, val3] of Object.entries(val2)) {
                for (let [key4, val4] of Object.entries(val3)) {
                  if (val4===0) val4 = '-';
                  text += '<td>'+val4+'</td>';
                }
              }
            }
          }
        }
        if (text === "") text += "<td>0</td>";
        return '<tr><td class="footer" colspan="'+row+'">합계'
              +(this.calcUnit != null ? '('+this.calcUnit+')': '(건)')
              +'</td>'+text+'</tr>';
      },


      columnHeader(rawObject, cStruc, selectItem, tempColumn) {
        for (let [xColHeader, xObject] of Object.entries(cStruc)) {
          if (selectItem[0]) tempColumn[xColHeader] = {};              // 옵션 "전체"
          else if (!selectItem[0] && !rawObject[xColHeader]) continue; // 가장 첫 번째 항목(header)의 존재(x)
          else if (!selectItem[0] && rawObject[xColHeader]) tempColumn[xColHeader] = {}; // 실제 데이터가 존재할 때
          for (let [yColHeader, yObject] of Object.entries(xObject)) {
            if (selectItem[1]) tempColumn[xColHeader][yColHeader] = {}; // 옵션 "전체"
            else if (!selectItem[1] && !rawObject[xColHeader] && tempColumn[xColHeader]) tempColumn[xColHeader]['emp'] = {}; 
            else if (!selectItem[1] && !rawObject[xColHeader][yColHeader]) continue; // 바로 앞 항목(header)가 존재(x)
            else if (!selectItem[1] && rawObject[xColHeader][yColHeader]) tempColumn[xColHeader][yColHeader] = {}; // 실제 데이터가 존재할 때
            for (let [zColHeader, zObject] of Object.entries(yObject)) {
              if (selectItem[2] && !tempColumn[xColHeader]['emp']) tempColumn[xColHeader][yColHeader][zColHeader] = {}; // 옵션 전체
              else if (selectItem[2] && tempColumn[xColHeader]['emp']) tempColumn[xColHeader]['emp'][zColHeader] = {}; // Y축은 존재(x) > Z축은 존재(o) 
              else if (!selectItem[2]) {
                if (!rawObject[xColHeader]) { // rawObject에 존재하지 않는 헤더들
                  if (tempColumn[xColHeader][yColHeader]) tempColumn[xColHeader][yColHeader]['emp'] = {};
                  // 'emp'
                  else tempColumn[xColHeader]['emp']['emp'] = {};
                } 
                else { // rawObject에 존재하는 헤더들
                  if (!rawObject[xColHeader][yColHeader]) {
                    if (tempColumn[xColHeader][yColHeader]) tempColumn[xColHeader][yColHeader]['emp'] = {}; 
                  } else { // tempRow[xRowHeader][yColHeader]
                    if (rawObject[xColHeader][yColHeader][zColHeader]) tempColumn[xColHeader][yColHeader][zColHeader] = {}; // 실제 데이터가 존재할 때
                  }
                }
              }
              for (let [rColHeader, rObject] of Object.entries(zObject)) {
                if (selectItem[3]) { // 4번째가 checked 됐을 때
                  if (tempColumn[xColHeader][yColHeader]){ // 2번째가 checked 됐을 때
                    if (tempColumn[xColHeader][yColHeader][zColHeader]) {
                      tempColumn[xColHeader][yColHeader][zColHeader][rColHeader] = {};
                    } else if (tempColumn[xColHeader][yColHeader]['emp']){
                      tempColumn[xColHeader][yColHeader]['emp'][rColHeader] = {};
                    }
                  }
                  else if (tempColumn[xColHeader]['emp']){ // 2번째가 unchecked 됐을 때
                    if (tempColumn[xColHeader]['emp'][zColHeader]) {
                      tempColumn[xColHeader]['emp'][zColHeader][rColHeader] = {};
                    } else if (tempColumn[xColHeader]['emp']['emp']){
                      tempColumn[xColHeader]['emp']['emp'][rColHeader] = {};
                    }
                  }
                }
                else {  // 4번째가 unchecked 됐을 때
                  if (tempColumn[xColHeader][yColHeader]){ // 2번째가 checked 됐을 때
                    if (tempColumn[xColHeader][yColHeader][zColHeader]) {
                      try {
                        if (rawObject[xColHeader][yColHeader][zColHeader][rColHeader]) {
                          tempColumn[xColHeader][yColHeader][zColHeader][rColHeader] = {};
                        }
                      } catch (e) { // rawObject 키-값 오류
                        tempColumn[xColHeader][yColHeader][zColHeader]['emp'] = {};
                      }
                    } else if (tempColumn[xColHeader][yColHeader]['emp']){
                      tempColumn[xColHeader][yColHeader]['emp']['emp'] = {};
                    }
                  }
                  else if (tempColumn[xColHeader]['emp']){ // 2번째가 unchecked 됐을 때
                    if (tempColumn[xColHeader]['emp'][zColHeader]) {
                      tempColumn[xColHeader]['emp'][zColHeader]['emp'] = {};
                    } else {
                      tempColumn[xColHeader]['emp']['emp']['emp'] = {};
                    }
                  }
                }
              } // for-4
            } // for-3
          } // for-2
        } // for-1
        return tempColumn;
      },

      settingTableHeader(rawObject, rStruc, cStruc, row, col, selectItem) { 
        let entr = ob => { return (ob!=null) ? Object.entries(ob) : null; };
        let funcSort = (obj) => { // 객체 정렬
          return Object.keys(obj).sort().reduce(function (newObj, key) {
                    newObj[key] = obj[key];
                    return newObj;
                  }, {});
        };
        let tempRow = {}, tempColumn = {};

        // ===== row ===== 
        /*
          ## selectItem = false && rawObject = null ##
          위와 같은 조건이라면 tempRow에는 빈 항목이 들어가야 한다.
        */
        for (let [xRowHeader, xObject] of entr(rStruc)) {
          if (selectItem[0]) tempRow[xRowHeader] = {};                 // 옵션 "전체"
          else if (!selectItem[0] && !rawObject[xRowHeader]) continue; // 가장 첫 번째 항목(header)의 존재(x)
          else if (!selectItem[0] && rawObject[xRowHeader]) tempRow[xRowHeader] = {}; // 실제 데이터가 존재할 때
          if (row == 1) { // setting column
            // 실제 데이터가 존재하는 헤더 값만 넣겨주면 된다.
            if (col != 0 && rawObject[xRowHeader]) 
              tempColumn = this.columnHeader(rawObject[xRowHeader], cStruc, selectItem.slice(1), tempColumn);
            continue;
          }

          for (let [yRowHeader, yObject] of entr(xObject)) {
            if (selectItem[1]) tempRow[xRowHeader][yRowHeader] = {}; // 옵션 "전체"
            else if (!selectItem[1] && !rawObject[xRowHeader] && tempRow[xRowHeader]) tempRow[xRowHeader]['emp'] = {}; 
            else if (!selectItem[1] && !rawObject[xRowHeader][yRowHeader]) continue; // 바로 앞 항목(header)가 존재(x)
            else if (!selectItem[1] && rawObject[xRowHeader][yRowHeader]) tempRow[xRowHeader][yRowHeader] = {}; // 실제 데이터가 존재할 때
            if (row == 2) { // setting column
              // 실제 데이터가 존재하는 헤더 값만 넣겨주면 된다.
              if (col != 0 && rawObject[xRowHeader] && rawObject[xRowHeader][yRowHeader]) 
                tempColumn = this.columnHeader(rawObject[xRowHeader][yRowHeader], cStruc, selectItem.slice(2), tempColumn);
              continue;
            }


            for (let [zRowHeader, zObject] of entr(yObject)) {
              if (selectItem[2] && !tempRow[xRowHeader]['emp']) tempRow[xRowHeader][yRowHeader][zRowHeader] = {}; // 옵션 전체
              else if (selectItem[2] && tempRow[xRowHeader]['emp']) tempRow[xRowHeader]['emp'][zRowHeader] = {}; // Y축은 존재(x) > Z축은 존재(o) 
              else if (!selectItem[2]) {
                if (!rawObject[xRowHeader]) { // rawObject에 존재하지 않는 헤더들
                  if (tempRow[xRowHeader][yRowHeader]) tempRow[xRowHeader][yRowHeader]['emp'] = {};
                  // 'emp'
                  else tempRow[xRowHeader]['emp']['emp'] = {};
                } 
                else { // rawObject에 존재하는 헤더들
                  if (!rawObject[xRowHeader][yRowHeader]) {
                    if (tempRow[xRowHeader][yRowHeader]) tempRow[xRowHeader][yRowHeader]['emp'] = {}; 
                  } else { // tempRow[xRowHeader][yRowHeader]
                    if (rawObject[xRowHeader][yRowHeader][zRowHeader]) tempRow[xRowHeader][yRowHeader][zRowHeader] = {}; // 실제 데이터가 존재할 때
                  }
                }
              }
              if (row == 3) { // setting column
                // 실제 데이터가 존재하는 헤더 값만 넣겨주면 된다.
                if (col != 0 && rawObject[xRowHeader] && rawObject[xRowHeader][yRowHeader] && rawObject[xRowHeader][yRowHeader][zRowHeader]) 
                  tempColumn = this.columnHeader(rawObject[xRowHeader][yRowHeader][zRowHeader], cStruc, selectItem.slice(3), tempColumn); 
                continue;
              }


              for (let [rRowHeader, rObject] of entr(zObject)) {
                if (selectItem[3]) { // 4번째가 checked 됐을 때
                  if (tempRow[xRowHeader][yRowHeader]){ // 2번째가 checked 됐을 때
                    if (tempRow[xRowHeader][yRowHeader][zRowHeader]) {
                      tempRow[xRowHeader][yRowHeader][zRowHeader][rRowHeader] = {};
                    } else if (tempRow[xRowHeader][yRowHeader]['emp']){
                      tempRow[xRowHeader][yRowHeader]['emp'][rRowHeader] = {};
                    }
                  }
                  else if (tempRow[xRowHeader]['emp']){ // 2번째가 unchecked 됐을 때
                    if (tempRow[xRowHeader]['emp'][zRowHeader]) {
                      tempRow[xRowHeader]['emp'][zRowHeader][rRowHeader] = {};
                    } else if (tempRow[xRowHeader]['emp']['emp']){
                      tempRow[xRowHeader]['emp']['emp'][rRowHeader] = {};
                    }
                  }
                }
                else {  // 4번째가 unchecked 됐을 때
                  if (tempRow[xRowHeader][yRowHeader]){ // 2번째가 checked 됐을 때
                    if (tempRow[xRowHeader][yRowHeader][zRowHeader]) {
                      try {
                        if (rawObject[xRowHeader][yRowHeader][zRowHeader][rRowHeader]) {
                          tempRow[xRowHeader][yRowHeader][zRowHeader][rRowHeader] = {};
                        }
                      } catch (e) { // rawObject 키-값 오류
                        tempRow[xRowHeader][yRowHeader][zRowHeader]['emp'] = {};
                      }
                    } else if (tempRow[xRowHeader][yRowHeader]['emp']){
                      tempRow[xRowHeader][yRowHeader]['emp']['emp'] = {};
                    }
                  }
                  else if (tempRow[xRowHeader]['emp']){ // 2번째가 unchecked 됐을 때
                    if (tempRow[xRowHeader]['emp'][zRowHeader]) {
                      tempRow[xRowHeader]['emp'][zRowHeader]['emp'] = {};
                    } else {
                      tempRow[xRowHeader]['emp']['emp']['emp'] = {};
                    }
                  }
                }
              } // for-4
            }
          }
        }
         // setting column
        if (row === 0) tempColumn = this.columnHeader(rawObject, cStruc, selectItem, tempColumn);
        
        // column 정렬 
        let sortedCol = {};
        tempColumn = funcSort(tempColumn);
        for (let [xkey, xObject] of entr(tempColumn)) {
          if (!sortedCol[xkey]) sortedCol[xkey] = {};
          xObject = funcSort(xObject);
          for (let [ykey,yObject] of entr(xObject)) {
            if (!sortedCol[xkey][ykey]) sortedCol[xkey][ykey] = {};
            yObject = funcSort(yObject);
            for (let [zkey,zObject] of entr(yObject)) {
              if (!sortedCol[xkey][ykey][zkey]) sortedCol[xkey][ykey][zkey] = {};
              zObject = funcSort(zObject);
              for (let [rkey,rObject] of entr(zObject)) {
                if (!sortedCol[xkey][ykey][zkey][rkey]) sortedCol[xkey][ykey][zkey][rkey] = {};
              }
            }
          }
        }
        return [tempRow, sortedCol];
      },

      async run(evalItem, rawObject, row, col, rStruc, cStruc, showBlank, selectItem) {
        let completedStruc = {}; 
        let dataProcessing = {};
        let colSum = {};

        if (Object.keys(rawObject).length && !selectItem.every(e => e.act)) 
          [rStruc, cStruc] = this.settingTableHeader(rawObject, rStruc, cStruc, row, col, selectItem);
        
        // make column
        let headTxt = this.makeTableColumnHeader(evalItem, cStruc, row, col);
        // table Structure 
        completedStruc = await  this.concatRowAndColumn(rStruc, cStruc, row, col);
        rStruc = null;
        // refine data
        [dataProcessing, colSum] = await this.makeTableForm(rawObject, completedStruc, row, col);
        completedStruc = null;
        // make row
        let bodyTxt = await this.makeTableRowHeaderWithBody(dataProcessing, evalItem, row, col);
        dataProcessing = null;
        // make footer
        let footTxt = await this.makeFooter(row, col, colSum, cStruc);
        cStruc = null;

        return [headTxt, bodyTxt, footTxt];

      }, // func run

      compare_objectOfTypeNumber(map) {
          let arr = [];
          for (let data of map) { arr.push(data); }

          let len = arr.length;
          for (let i = 0; i < len-1; i++) {
              for (let j = i+1; j < len; j++) {
                  if ( Number(arr[i][0]) > Number(arr[j][0]) ) {
                      let temp = arr[i];
                      arr[i] = arr[j];
                      arr[j] = temp;
                  }
              }
          }

          let _map = new Map();
          for (let i = 0; i < len; i++) { _map.set(arr[i][0], arr[i][1]) }
          return _map;
      },


      getDates(startDate, endDate, format = 'YYYYMMDD') {
        let dateArray = [];

        let currentDate = this.$moment(startDate);
        let targetDate = this.$moment(endDate);
        if (format !== 'MM' && this.$moment.duration(targetDate.diff(currentDate)).asDays() < 31) {
          format = 'YYYYMMDD';
        }
        while (currentDate <= targetDate) {
          dateArray.push(Number(this.$moment(currentDate).format(format)));
          if (format === 'YYYYMMDD') {
            currentDate = this.$moment(currentDate).add(1, 'days');
          } else {
            currentDate = this.$moment(currentDate).add(1, 'months');
          }
        }
        return dateArray;
      },

      tableHeadText(value) {
        return (value.length === 13) ? value.substr(10, 3) : value;
      },
      getDateTimeString() {
        const d = new Date();
        let r = String(d.getFullYear())
            + ('0' + String(d.getMonth() + 1)).substr(-2)
            + ('0' + String(d.getDate())).substr(-2) + '_'
            + ('0' + String(d.getHours())).substr(-2)
            + ('0' + String(d.getMinutes())).substr(-2)
            + ('0' + String(d.getSeconds())).substr(-2);
        return r;
      },
      restoreDateRange(date) {
        let rtn;
        if (!isNaN(Number(date))) {
          rtn = ('0' + String(date)).substr(-2)
        } else {
          rtn = false;
        }
        return rtn;
      },
      prn(num1, num2) {
        return this.plusRealNumbers(num1, num2);
      },
      plusRealNumbers(num1, num2, digit = 3) {
        let num1p = Number(num1);
          if (isNaN(num1p)) num1p = 0;
        let num2p = Number(num2);
          if (isNaN(num2p)) num2p = 0;
        let multiplier = Math.pow(10, digit);
        return (Math.trunc(num1p * multiplier) + Math.trunc(num2p * multiplier)) / multiplier;
      },
      addCommaFunc(value, ignoreZero = true) {
        let rtn = '-', num = Number(value);
        let cdt = !isNaN(num) && (ignoreZero ? num !== 0 : true);
        if (cdt) {
          rtn = String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        return rtn;
      },
      divKiloAddCommaFunc(value) {
        if (Number(value) === value) {
          var num = new Number(value);
          if (num === 0) {
            return '0';
          } else {
            if (this.crossCalcValueDupe) {
              let scale = Math.pow(1000, this.numberScaleDupe - 1);
              num = num / scale;
            }
            var tmpVal = Math.trunc(num);
            if (tmpVal === 0) {
              return '-';
            } else {
              return String(tmpVal).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
          }
        } else {
          return '-';
        }
      },
      async alignTable(arg) {
        if (!this.crossChart) return;
        this.getStatSetting.numberScale = Number(arg);
        let truncAll = Math.trunc(this.crossChart.tableSumAll);

        let table = this.$el.querySelector('#crossChartTable');
        if (table) {
          let tableWidth = table.offsetWidth;
          let tdHeadWidth = 0;
          let thHeadObj = table.querySelectorAll('thead th.head');
          [].forEach.call(thHeadObj, t => {
            tdHeadWidth += 150;
          });
          let tdData = table.querySelectorAll('thead th.data');
          let tdDataLength = tdData.length;
          let tdDataWidth = (tableWidth - tdHeadWidth) / (tdDataLength + 2);
          [].forEach.call(tdData, td => {
            td.style.width = tdDataWidth + 'px';
          });
          table.querySelector('thead th.sum').style.width = (tdDataWidth) * 2 + 'px';
        }
      },
      transColorExpr(arg) {
        let tmpArr = String(arg).replace(/[rgba().]/gi, '').split(','), rtn;
        if (tmpArr.length === 4) {
          rtn = '#' + Number(tmpArr[0]).toString(16) + Number(tmpArr[1]).toString(16) + Number(tmpArr[2]).toString(16);
        } else {
          rtn = '#dddddd';
        }
        return rtn;
      },
            async mouseOut() {
        let obj = document.querySelectorAll('table#crossChartTable tbody td');
        [].forEach.call(obj, e => {
          e.classList.remove('colored');
        });
      },
      async mouseOver(meow) {
        let className;
        let classNames = meow.replace(/e0/g, '').split('_').filter(function (e) { return (e); });

        let objTd = document.querySelectorAll('table#crossChartTable tbody td');
        [].forEach.call(objTd, e => { e.classList.remove('colored'); });

        let objTdMeow = document.querySelectorAll('table#crossChartTable tbody td.' + meow);
        [].forEach.call(objTdMeow, e => { e.classList.add('colored'); });

        if (classNames.length === 2) {
          className = classNames[0];
          let objTd1 = document.querySelectorAll('table#crossChartTable tbody td.t1');
          [].forEach.call(objTd1, e => {
            [].forEach.call(e.classList, f => {
              if (f.includes(className)) {
                e.classList.add('colored');
              }
            });
          });
        } else if (classNames.length === 3) {
          className = classNames[0];
          let objTd2 = document.querySelectorAll('table#crossChartTable tbody td.t2');
          [].forEach.call(objTd2, e => {
            [].forEach.call(e.classList, f => {
              if (f.includes(className)) {
                e.classList.add('colored');
              }
            });
          });
          className = classNames[0] + '_' + classNames[1];
          let objTd1 = document.querySelectorAll('table#crossChartTable tbody td.t1');
          [].forEach.call(objTd1, e => {
            [].forEach.call(e.classList, f => {
              if (f.includes(className)) {
                e.classList.add('colored');
              }
            });
          });
        }
      },
    }
  };
</script>
<style scoped>
.cont_wrap .stat_tc_area .stat_table th:first-child, .cont_wrap .stat_tc_area .stat_table td:first-child {
  border-right: 1px #ccc solid;
}
.sch_area .sch_cont {
  height: 550px !important;
}
.loading { width: 100%;height: 100%;top: 0px;left: 0px;position: fixed;display: block;opacity: 0.7;background-color: #fff;z-index: 99;text-align: center; vertical-align: middle;}
.loading-image {position: absolute;top: 50%;left: 50%;z-index: 100;}
.loading-message {position: relative;margin: 0 auto;z-index: 101;}

.cont_wrap .stat_tc_area .stat_table tbody tr:nth-child(odd):hover {
  background-color: #ffffff !important;
}

.cont_wrap .stat_tc_area .stat_table tbody tr:nth-child(even):hover {
  background-color: #fafafa !important;
}


td.colored {background-color: #f0f0f2;}
th.head {width:150px !important;}


</style>
