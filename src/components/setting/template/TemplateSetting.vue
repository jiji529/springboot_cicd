<template>
  <div class="sch_area" v-if="getConfigEval">
    <div class="VOS-sorted">
        <div class="set-object-item-wrap">
          <div class="set-object-item-box">
            <div class="set_title">
              <h2>템플릿 리스트</h2>
              <p>* 항목을 클릭하여 데이터를 수정할 수 있습니다.</p>
              <div class="list-reset">새로고침 <div title="새로고침" @click="loadTemplate()"></div></div>
            </div>

            <div class="set_list_area tp-op-tp-ls">
              <div class="set_subtitle">
                > 전체 항목
              </div>
              <div class="item_list">
                <div class="item_list_title">
                  <div class="tem-header-title">제목 <a class="sort" @click="sorting"></a></div>
                  <div class="tem-header-des">상세설명</div>
                  <div></div>
                  <div>사용/비사용</div>
                </div>
                <template v-for="(template, templateIdx) in templateList">
                <li :key="'templateList' + templateIdx + ' ' +temListRen">
                  <div :class="[SINGLE_TEMPLATE.seq == template.seq ? 'highlight' : '']">
                    <div class="item_title short" @click="templateInfo($event, template)" title="템플릿 제목" 
                        :data-seq="template.seq">{{template.title}}</div>
                    <div class="item_description short" @click="templateInfo($event, template)">
                      <p>{{printDate(template.regDate, template.updDate)}}</p>
                      <span>{{template.description}}</span>
                    </div>
                    <div class="item_more">
                      <div v-if="isThereMoreWriting(template.title, template.description)"
                        class="rollup" @click="textView" data-nextAction="rolldown"></div>
                    </div>
                    <div>
                      <a :class="[template.active===1?'act':'inact']" data-active="1" @click="$statConfig.funcActive($event, template, 'template')">사용</a>
                      <a :class="[template.active===0?'act':'inact']" data-active="0" @click="$statConfig.funcActive($event, template, 'template')">비사용</a>
                    </div>
                  </div>

                </li>
                </template>
              </div>
              <div class="btn">
                <button class="left-btn" v-if="arrow" @click="spread()">전체 펼치기</button>
                <button class="left-btn" v-else @click="spread()">전체 접기</button>
                <button class="right-btn" @click="deleteTemplate">삭제</button>
                <button class="right-btn" @click="addTemplates">추가</button>
              </div>
            </div>
          </div>
        </div>


        


        <div class="set-object-item-wrap">
          <div class="set-object-item-box">
            <input type="hidden" id="templatesSeq" value="">
            <div class="set_title">
              <h2>템플릿 상세 설정</h2>
              <p>* 테이블, 차트, 텍스트 등을 생성 및 삭제하고 옵션을 수정할 수 있습니다.</p>
              <span v-if="SINGLE_TEMPLATE.seq === null" class="strong-font-right">템플릿 추가....</span>
              <span v-if="SINGLE_TEMPLATE.seq" class="strong-font-right">템플릿 조회/수정....</span>
            </div>
            
            <div class="set_text_area">
              <div class="set_subtitle"> 템플릿 제목 및 상세글 작성</div>
              <div class="template_text">
                <div class="template_title">
                  <p>템플릿 제목</p>
                  <input id="temTitle" name="temTitle" type="text" @click="wrongAction" v-model="SINGLE_TEMPLATE.title" maxlength="400">
                </div>
                <div class="template_detail">
                  <p>템플릿 설명글</p>
                  <textarea id="temDescription" name="temDescription"  @click="wrongAction" v-model="SINGLE_TEMPLATE.description"></textarea>
                </div>
              </div>
            </div>

            <div class="set_list_area">
              <div class="set_subtitle"> 시각객체 설정</div>
              <VsOjOption :SINGLE_TEMPLATE="SINGLE_TEMPLATE" @LoadTemplate="loadTemplate" @SearchTemplate="statSearch"></VsOjOption>

            </div>
          </div>
        </div> <!-- set-object-wrap [End] -->
    </div>

    <StatSearch v-if="showComp == 0"></StatSearch>
    <h2 class="no-data" v-if="noData">평가된 기사가 없음</h2>
    <div v-show="!noData">
      <MiddleManager v-if="SINGLE_TEMPLATE && SINGLE_TEMPLATE.config"  
                    :ref="type"
                    :componentType="type" 
                    :MMIdx="0"
                    @nothing="nothing"
                    key="TemplateSettingMM"></MiddleManager>
    </div>
  </div>
</template>


<script>
import {mapGetters, mapState} from 'vuex';
import draggable from "vuedraggable";
import StatSearch from './StatSearch';
import MiddleManager from './MiddleManager';
import VsOjOption from './VsOjOption';
export default {
    name: 'TemplateSetting'
    ,components: {draggable, StatSearch, MiddleManager, VsOjOption}
    ,model: {
      prop: ['emp-option'],
      event: 'set-option'
    },
    data() {
        return {
          type: 'templateSection'
          ,SINGLE_TEMPLATE: {}
          ,templateList: [] // 템플릿 리스트

          ,temListRen: 0 // 템플릿 리스트 길이
          ,arrow: true // 펼치기 / 접기
          ,arrowState: 0
          ,isAsc: 1
          ,noData: false
          
        }    
    }
    ,props: {'showComp': Number}

    // 템플릿 리스트 초기화
    ,beforeMount() {
      this.loadTemplate();
    }

    ,mounted() {
      window.addEventListener('click', function(e) { // 아래 함수와 중복 (methods로 따로 함수를 뺄 수 있음.)
        let screen = document.elementFromPoint(e.x, e.y);
        if(screen?.classList.contains('template-title-screen') || screen?.classList.contains('modal-background')) {
          let _t = document.querySelector('#trans-keyword-modal')
          if (_t === null) return ;
          _t.style.display = 'none';
        }
      }, false);
    }

    ,beforeDestroy() {
      window.removeEventListener('click', function(e) { // 위 함수와 중복 (methods로 따로 함수를 뺄 수 있음.)
        let screen = document.elementFromPoint(e.x, e.y);
        if(screen.classList.contains('template-title-screen') || screen.classList.contains('modal-background')){
          let _t = document.querySelector('#trans-keyword-modal')
          if (_t === null) return ;
          _t.style.display = 'none';
        }
      }, false);
    }

    ,computed: {
      // getter를 객체 전개 연산자(Object Spread Operator)로 계산하여 추가합니다.
      ...mapGetters([
        'getStatSetting',
        'getNewsGroupInfo',
        'getMediaList',
        'getEval1Category',
        'getEval2Class',
        'getConfigEval',
        'getDate',
      ]),
    }

    ,watch: {
      arrowState() { 
        const item_up = document.querySelector('.tp-op-tp-ls .rollup');
        const item_down = document.querySelector('.tp-op-tp-ls .rolldown');
        if (!item_up && item_down) this.arrow = false;
        else if (item_up && !item_down) this.arrow = true;
      }
    }

    ,methods: {

      nothing(value) {
        this.noData = value;
      },

      wrongAction() {
        if (this.SINGLE_TEMPLATE.seq === undefined) { 
          alert('템플릿을 추가해 주세요 ("추가" 버튼 클릭)'); return ;
        }
      },

      printDate(...date) {
        // date[0] = 등록날짜, date[1] = 수정날짜
        if (date[1] === null || date[1] === undefined) {
          return String(date[0]);
        } 
        return String(date[1]);
      },

      async resetPreview() {
        this.SINGLE_TEMPLATE = {};
        if (this.$refs[this.type])
          this.$refs[this.type].onSearch(null, {config:{tcObject:[]}}, false);
      },


      /**
       * @description : 옵션을 리렌더링 해준다.
       */
      tempRendering() {
        this.temListRen = this.temListRen > 100 ? 0 : this.temListRen +1;
      },


      /**
       * @description : 템플릿 리스트 불러오기
       */
      async loadTemplate(mode) {
        this.templateList = [];
        // API 호출
        // 템플릿 리스트 화면
        this.templateList = await this.$statConfig.funcLoadRecode('list', 'template');
        if (mode === 'create') { 
          let lastest = null;
          let __seq = null; 
          if (this.templateList) lastest = this.templateList[0].regDate;
          for (let [_, val] of Object.entries(this.templateList)) {
              if (new Date(lastest) <= new Date(val.regDate)) {
                  lastest = val.regDate;
                  __seq = val.seq;
              }
          }
          if (!__seq) {alert('TemplateSetting : Data output error'); return;}
          this.SINGLE_TEMPLATE.seq = __seq;
        }
        await this.$nextTick();
        this.isAsc = 1;
        this.arrow = true;
      }, // loadTemplate
      
      /**
         * @description :
         *    템플릿 삭제
         */
        async deleteTemplate() {
            if (this.SINGLE_TEMPLATE.seq === undefined) {alert('선택된 템를릿이 없습니다.'); return;}
            if (confirm("템플릿을 삭제하시겠습니까?")) {
              if (this.SINGLE_TEMPLATE.seq === null) { this.SINGLE_TEMPLATE = {}; return; }
              await this.$statConfig.funcDeleteRecode('template', this.SINGLE_TEMPLATE);
              await this.loadTemplate();
              this.SINGLE_TEMPLATE = {};
            }
        }, // deleteTemplate


      /**
       * @description :
       *    템플릿 추가하기
       */
      async addTemplates() { 
        this.SINGLE_TEMPLATE = { 
          seq: null,
          tKey: "template",
          title: "새 템플릿",
          description: "새 템플릿 설명",
          active: 1,
          regDate: null,
          updDate: null,
          config : {
            searchInfo: null,
            parentCrossCalc: {
              unify: false,
              isPrice: false,
              priceUnit: 1
            },
            tcObject: null, // SINGLE_TEMPLATE과 tableOrChart 연결
          },
        };
      }, // addTemplates

      /**
       * @description :
       *    템플릿 상세보기
       */
      async templateInfo(e, template) {
        if (this.$refs[this.type])
          this.$refs[this.type].onSearch(null, null, false); // 기존에 출력된 시각객체 지우기

        if (this.SINGLE_TEMPLATE.seq !== template.seq) {
          // 템플릿을 추가하고, 저장하지 않은 상태로 다른 액션을 취하면
          if (this.SINGLE_TEMPLATE.seq === null && !confirm('작업 중인 템플릿의 데이터가 소실됩니다.')) return ;
          let data = await this.$statConfig.funcLoadRecode('single', 'template', template);
          this.SINGLE_TEMPLATE = data[0];
            
          if ( this.SINGLE_TEMPLATE !== {}
            || this.SINGLE_TEMPLATE !== null
            || this.SINGLE_TEMPLATE !== undefined ) {
            document.getElementById("templatesSeq").value = this.SINGLE_TEMPLATE.seq;
          } else { alert("정보 불러오기 실패"); }
        } else {
          this.SINGLE_TEMPLATE = {};
        } // if-else
      },

      sorting() {
        const that = this;
        this.templateList.sort((a, b) => {
          return that.isAsc * a.title.localeCompare(b.title);
        });
        this.isAsc = (-1) * this.isAsc;
      },

      checkTagSize: function(basicTagSize, content) {
        const scale = document.createElement('DIV');
        scale.id = 'tag-size';
        scale.style.display = 'inline';
        scale.style.width = 'auto';
        scale.style.visibility = 'hidden';
        scale.textContent = content;
        document.querySelector('body').appendChild(scale);
        const tmpTag = document.getElementById('tag-size');
        let tag_size = tmpTag.offsetWidth;
        tmpTag.remove();
        return basicTagSize <= tag_size;
      },

      isThereMoreWriting(title, des) {
        let tagSize1 = document.querySelector('.tem-header-title').offsetWidth;
        let tagSize2 = document.querySelector('.tem-header-des').offsetWidth;;
        return this.checkTagSize(tagSize1, title) || this.checkTagSize(tagSize2, des);
      },

      spread() {
        const DIV = document.querySelectorAll('.tp-op-tp-ls .item_list > li > div');
        // 펼치기 - 접기
        if (this.arrow) DIV.forEach(el => this.textView(el ,'rolldown'));
        else DIV.forEach(el => this.textView(el ,'rollup'));
        this.arrowState = this.arrowState > 100 ? 1 : this.arrowState + 1; 
      },

      textView(e, paramNextAction) {
        let upDown = e.target;
        let isClickEvent = (upDown !== undefined); // 클릭이벤트인가? 아닌가?
        let nextAction = undefined;
        let DIV = isClickEvent ? undefined : e;
        let DIV_tit = undefined;
        let DIV_des = undefined;

        if (isClickEvent) {
          nextAction = upDown.getAttribute("data-nextAction");
          // LI 태그가 감싸고 있는 DIV 태그 찾기
          DIV = upDown.closest('li > div');
        }

        // LI > DIV > title, des 찾기
        Object.values(DIV.children).forEach(tag => {
            const tcn = tag.className;
            if (tcn.includes('item_title')) DIV_tit = tag;
            else if (tcn.includes('item_description')) DIV_des = tag;
            else if (!isClickEvent && tcn.includes('item_more')) {
              upDown = Object.values(tag.children)[0];
            }
        });
        if (upDown === null || upDown === undefined) return;
        upDown.className = isClickEvent ? nextAction : paramNextAction;
        upDown.setAttribute('data-nextAction' ,
          this.changeDesStyle(
            isClickEvent ? nextAction : paramNextAction
            , DIV_tit
            , DIV_des
          )
        );
        this.arrowState = this.arrowState > 100 ? 1 : this.arrowState + 1; 
      },

      changeDesStyle(nextAction, DIV_tit, DIV_des) {
        // 상세 설명글
        if (nextAction === 'rolldown') { // 펼치기
            DIV_tit.className = "item_title long";
            DIV_des.className = "item_description long";
            return 'rollup';
        } else { // 접기
            DIV_tit.className = "item_title short";
            DIV_des.className = "item_description short";
            return 'rolldown';
        }
      },

      async statSearch(config) {
        try {
          if (!await this.$store.dispatch('loginCheckGentleAPI')) {
              this.$eventBus.$emit('kickOut');
          }
          let result = [];
          this.getStatSetting.searchRange.forEach(e => {
            if (result.indexOf(e.trim()) < 0) result.push(e.trim());
          });
          this.getStatSetting.searchRange = result;
          let sm = this.getStatSetting.statSelectionMedium;
          let smc = 0;
          for (let key in sm) {
            smc += sm[key].length;
          }
          if (this.getStatSetting.searchRange.length < 1) {
            alert('[검색범위]를 1개 이상 선택하십시오!');
          } else if (smc === 0) {
            alert('[매체선택]를 1개 이상 선택하십시오!');
          } else if (config.tcObject.length <= 0) {
            alert('테이블 및 차트틑 추가해 주세요.');
          } else {
            this.SINGLE_TEMPLATE.config = JSON.parse(JSON.stringify(config));
            if (this.getStatSetting.crossCalcValue != 0) {
              let tcArr = this.SINGLE_TEMPLATE.config.tcObject; 
              let tcSize = tcArr.length;
              for (let _j = 0; _j < tcSize; _j++) {
                if (tcArr[_j].name != 'Text') {
                  tcArr[_j].crossCalc.isPrice = (this.getStatSetting.crossCalcValue == 2);
                  tcArr[_j].crossCalc.priceUnit = this.getStatSetting.numberScale;
                }
              }
            }
            this.$store.state.loadingGif = true;
            await this.$refs[this.type].dropSearchValue(); // 기존 데이터 초기화
            await this.$refs[this.type].settingSearchValue(); // 새 데이터 요청
            await this.$refs[this.type].onSearch(null, this.SINGLE_TEMPLATE, true);
            this.$store.state.loadingGif = false;
          }
        } catch (e) {
          console.error(e)
        }
      },



    } // method
    
} // export
</script>

<style scoped>

  .VOS-sorted {
    width: 1880px;
    height: 767px;
    display: flex;
    flex-direction: row;
    border-bottom: 2px solid rgba(173,173,173, 0.5); 
    box-shadow: 0 0 10px 0 #ddd;
  }

  .optionList {
    width: 720px; 
    height:auto; 
    border: 6px ridge rgba(173,173,173,0.75); 
    margin: 10px 0px 10px 0px;
    padding: 11px 0px 0px 0px;
  }

  /* ----------------------교차 기준---------------------- */
  .cross_std {
    display: flex;
    width: auto;
    height: 192px;
    margin: 0px 0px 0px 25px;
    padding: 0px 0px 0px 0px;
  }
  .cross_std_frame, .cross-calc {
    /* border-right: 1px solid; */
  }
  .cross_std_frame {
    display: flex;
    padding: 0px 0px 0px 0px;
    /* this height은 .cross_std에서 수정하면 된다. */
    width: auto;
    height: 100%;
    margin: 0 10px 0 0;
  }
  .cross-calc {
    display: flex;
    flex-direction: column;
    width: 157px;
    padding: 48px 0 0 0;
  }
  .table-op-calc {
    margin: 0 0 7px 0;
  }
  .chart-op-calc {
    margin: 0 0 19px 0;
  }



  .inner {
    /*width: 80%;*/
    display: flex;
  }
  .exc {
    margin: 0px 0px 0px 25px;
    position: relative;
    bottom: 6px;
  }
  .line-style {
    position: relative;
    top: -6px;
  }
  .groupT {
    display: flex;
    width: auto;
    height: auto;
    margin: 0px 0px 18px 25px;
  }
  .textOp-skin {
    display: flex;
    flex-direction: row;
    width: 250px;
  }
  .groupT > div > p.groupT-text {
    width: 408px;
    height: 72px;
    padding: 10px 10px 10px 10px;
    margin: 0px 21px 0px 0px;
    resize: vertical;

    overflow-x: auto;
    overflow-y: auto;
    text-rendering: auto;
    color: fieldtext;
    border-width: 1px;
    border-style: solid;
    border-color: -internal-light-dark(rgb(118, 118, 118), rgb(133, 133, 133));
  }


  .sub_frame {
    border: solid 3px gray;
    border-radius: 11px;
    padding: 0px 10px 0px 10px;
    margin: 0px 15px 0px 0px;
  }
  /* 테이블/차트 항목 리스트 제목(라벨) */
  label.tableLabel-row-column {
    float: none;
    display: inline-block;
    width: 40px;
    height: 20px;
    background-color: #fff;
    text-align: center;
    color: #808080;
    font-weight: 600;

    position: relative;
    left: 37%;
    top: -12px;
  }
  /* 차트 항목 리스트 제목(라벨) 위치만 조정 */
  .chartLabel-item, .chartLabel-std, .chartLabel-line {
    float: none;
    display: inline-block;
    width: 68px;
    height: 20px;
    background-color: #fff;
    text-align: center;
    color: #808080; 
    font-weight: 600;
    margin: 0px 0px 2px 0px;

    position: relative;
    left: 32%;
  }
  div.tableOp {
    padding: 6px 0px 0px 0px;
    height: 172px;
  }
  div.tableOp > .tableOp-row, div.tableOp > .tableOp-column {
    width: 196px;
    height: 165px;
  }
  div.tableOp > div.tableOp-row > div
    , div.tableOp > div.tableOp-column > div {
    height: 127px;
  }

  .table-list, .chart-list {
    display: flex;
  }
  .table-list > p {
    margin: 0px 0px 0px 5px;
    color: #808080;
    font-weight: 600;
    font-size: 5px;
  }
  .table-list > select {
    width: 145px;
    height: auto;
  }

  .chart-list > p {
    margin: 0px 0px 0px 5px;
    color: #808080;
    font-weight: 600;
    font-size: 5px;
  }
  .chart-list > select {
    max-width: 141px;
    height: auto;
  }

  /* ========================================================================================================= */
  .tableOp-skin { display: flex; flex-direction: column; width: 260px; height: auto; padding: 6px 0px 0px 0px; }
  .tableOp-top { display: flex; flex-direction: row; /*width: px; height: px;*/ }
  .tableOp-bottom { display: flex; flex-direction: row; /*width: px; height: px;*/ }

  div.checkItem {
    width: 170px;
    margin: 0px 0px 0px 0px;
    padding: 10px 0px 0px 0px;
  }
  div.checkItem > label {
    margin: 0px 0px 5px 0px;
    font-size: 12px;
    font-weight: bold;
  }
  .showOption {
    padding: 0 10px;
    height: 26px;
    line-height: 22px;
    font-size: 12px;
    font-weight: bold;
    background: #f2f2f2;
    border: 1px #aeaeae solid;

    margin: 0px 0px 11px 0px;
  }

  div.chartOp {
    flex-direction: column;
    margin: 0px 15px 0px 0px;
  }
  div.chartOp > .chartOp-main {
    width: 220px;
    height: 121px;
    margin: 15px 0px 5px 0px;
  }

  .chartOp > div.chart-type {
    display: flex;
    margin: 5px 0px 0px 0px;
  }
  .chartOp > div.chart-type > span {
    float: left;
    width: 60px;
    font-size: 13px;
    color: #808080;
    font-weight: 600;
    /* padding-bottom: 10px; */
    line-height: 23px;
  }

  .chartOp-skin { display: flex; flex-direction: column; width: 260px; height: auto; margin: 11px 0px 0px 20px; }
  .chartOp-top { display: flex; flex-direction: row; /*width: px; height: px;*/ }

  .titleO { display: flex; flex-direction: column; }
  .titleO > div { display: flex; flex-direction: row; }
  .titleO > div > input { width: 70px; }

  .second-op { width: 252px; height: 80px; display: flex; flex-wrap: wrap; margin: 20px 0px 0px 0px; }
  .second-op > div { width: 66px; display: flex; flex-direction: row; margin: 0px 17px 0px 0px; }
  .second-op > div > p { width: 39px; }




  /* Line Chart에 한에서 적용됨(row). */
  div.chartOp > .chartLineOp-fir {
      width: 220px;
      height: auto;
      margin: 15px 0px 5px 0px;
  }
  /* Line Chart에 한에서 적용됨(column). */
  div.chartOp > .chartLineOp-sec {
      width: 220px;
      height: auto;
      margin: 10px 0px 0px 0px;
  }
  .translocation {
    height: auto;
    position: relative;
    top: -2px;
    margin: -11px 0px 0px 0px;
  }


  div.chartOp > .chartOp-sub {
    width: 220px;
    height: 26px;
    margin: 0px 0px 0px 0px;
    padding: 0px 0px 0px 18px;
  }

  /* .chartOp-main > div > .cross-item > span
    , .chartLineOp-fir > div > .cross-item > span
    , .chartLineOp-sec > div > .cross-item > span { */
  .cross-item > span { flex-grow: 1; }
  .dragArea {
    width: 20px;
    height: 20px;
    margin: 0px 0px 0px 5px;
    padding: 0px 0px 0px 0px;
    background: url(../../../assets/images/drag.png);
    background-size: cover;
  }

  #axis1, #axis2, #axis3, #axis4 {
    width: 132px;
    margin: 0px 0px 13px 0px;
  }




  /* ----------------------차트 형태---------------------- */
  .src_chart_radar {
    width: 40px;
    height: 24px;
    margin: 0;
    border: 1px #aaa solid;
    border-left: 0;
    background-color: #E6E6E6;
    /* text-indent: -9999px; */
  }
  .src_chart_radar.on {
    background-color: #fff;
  }
  .src_chart_radar > img {
    width: 71%;
    height: 88%;
    padding: 3px 0px 0px 12px;
  }



  /* ---------------------차트 옵션--------------------- */
  /* common */
  div#chartFormatting{
    float: left;
    width: 1235px;
    height: 225px;
    margin: 8px 0px 0px 0px;
  }
  div.chartOption1, div.chartOption2, div.chartOption3, div.chartOption4 {
    width: auto;
  }
  .line1 {
    margin: 0px;
    padding: 0px;
    position: relative;
    top: 16px;
    height: 81px;
    border: solid 0.5px #e6e6e6;
  }
  .line2 {
    width: 94%;
    border: solid 0.5px #e6e6e6;
  }



  /* fir */ 
  .fir {
    display: flex;
    margin: 0px 0px 13px 0px;
  }
  /* chartOption 1 */
  div#chartFormatting > .fir > div.chartOption1 {
    margin: 0px 0px 0px 0px;
    padding: 10px 0px 0px 0px;
  }
  div#chartFormatting > .fir > div.chartOption1 > p {
    text-align: right;
    display: inline-block;
  }
  #chartFormatting > .fir > div.chartOption1 > p:nth-child(1) {
    width: 200px;
  }
  #chartFormatting > .fir > div.chartOption1 > p:nth-child(2) {
    width: 184px;
  }
  #chartFormatting > .fir > div.chartOption1 > p:nth-child(3) {
    width: 80px;
  }
  #chartFormatting > .fir > div.chartOption1 > p:nth-child(4) {
    width: 108px;
  }
  #chartFormatting > .fir > div.chartOption1 > p:nth-child(5) {
    width: 1px;
  }
  div#chartFormatting > .fir > div.chartOption1 > div {
    margin: 12px 20px 0px 0px;
  }
  div#chartFormatting > .fir > div.chartOption1 > div > label {
    width: 80px;
    font-size: 13px;
    color: #808080;
    font-weight: 600;
  }
  div#chartFormatting > .fir > div.chartOption1 > div > label + input:not([type='number']) {
    width: 208px;
  }
  div#chartFormatting > .fir > div.chartOption1 > div > input[type='number'] {
    margin: 0px 0px 0px 11px;
  }
  button.insertImg {
    width: 20px;
    height: 20px;
    margin: 0px 0px 0px 5px;
  }
  div#chartFormatting > .fir > div.chartOption1 > div > select {
    margin: 0px 0px 0px 10px;
    text-align: right;
  }



  /* chartOption 2 */
  input.xAxesLH, input.xAxesPadding {
    width: 66px;
  }
  div#chartFormatting > .fir > div.chartOption2 {
    margin: 0px 0px 0px 50px;
    padding: 10px 0px 0px 0px;
  }
  div#chartFormatting > .fir > div.chartOption2 > p:nth-child(1) {
    display: inline-block; width: 109px; text-align: right;
  }
  div#chartFormatting > .fir > div.chartOption2 > p:nth-child(2) {
    display: inline-block; width: 83px; text-align: right;
  }
  div#chartFormatting > .fir > div.chartOption2 > p:nth-child(3) {
    display: inline-block; width: 147px; text-align: right;
  }
  div#chartFormatting > .fir > div.chartOption2 > p:nth-child(4) {
    display: inline-block; width: 69px; text-align: right;
  }
  div#chartFormatting > .fir > div.chartOption2 > div {
    display: flex;
    margin: 12px 20px 0px 0px;
  }
  div#chartFormatting > .fir > div.chartOption2 > div > p {
    width: 30px;
    font-size: 13px;
    color: #808080;
    font-weight: 600;
  }
  div#chartFormatting > .fir > div.chartOption2 > div > select {
    margin: 0px 0px 0px 11px;
    text-align: right;
  }
  div#chartFormatting > .fir > div.chartOption2 > div > input[type=number] {
    margin: 0px 0px 0px 11px;
  }



  /* sec */
  .sec {
    width: auto;
    height: auto;
    display: flex;
    margin: 5px 0px 0px 0px;
  }
  /* chartOption 3 */
  div#chartFormatting > .sec > div.chartOption3 {
    margin: 0px 0px 0px 0px;
    padding: 30px 0px 0px 0px;
    display: flex;

  }
  div.chartOption3 > p {
    display: inline-block;
    margin: 0px 0px 0px 0px;
    width: 63px;
    font-size: 13px;
    color: #808080;
    font-weight: 600;
  }

  fieldset > legend.option-title {
    font-size: 15px;
    font-weight: bold;
    padding: 0 10px 0 10px;
    border: 1px solid black;
    border-radius: 3px;
    text-align: center;
  }



  /* chartOption 4 */
  div#chartFormatting > .sec > div.chartOption4 {
    padding: 10px 0px 0px 0px;
    margin: 0px 0px 0px 23px;
    display: flex;
  }
  div#chartFormatting > .sec > div.chartOption4 > div > p {
    padding: 21px 0px 0px 0px;
    font-size: 13px;
    color: #808080;
    font-weight: 600;
  }
  #chartFormatting > .sec > div.chartOption4 > div:nth-child(2) {
    margin: -7px 0px 0px 8px;
  }
  #chartFormatting > div > div.chartOption4 > div:nth-child(2) > div > p {
    margin: 5px 0px 5px 0px;
  }
  #chartFormatting > div.sec > div.chartOption4 > div > div > #fontSize6 {
    margin: 10px 0px 0px 0px;
  }


  /* 시각객체 옵션 추가하기
  
  
  */



  input[type="checkbox"]:checked + .viewBox {
    background: url(/img/ico_pre.467a0115.png) -240px 0 no-repeat;
  }
  input[type="checkbox"] + .viewBox {
    width: 100px;
    height: 14px;
    background: url(/img/ico_pre.467a0115.png) -210px 0 no-repeat;
    cursor: pointer;
    float: left;
    margin: 3px;
  }
  div.cross-std > label {
    width: 100px;
  }
  div.cross-std {
    width: 100px;
    height: 97px;
    margin: 0px 0px 0px 0px;
    padding: 4px 0px 0px 0px;
    background-color: #e9e9e9;

    animation: fadein 1s;
  }
  @keyframes fadein {
      from {
          opacity: 0;
      }
      to {
          opacity: 1;
      }
  }


  .cross-item { display: flex; cursor: pointer; }
  .cross-item > span {
    display: inline-block;
    width: 116px;
    font-size: 13px;
    font-weight: bold;
    line-height: 23px;
  }
  .cross-item > input[type='button'] {
    width: 22px;
    height: 22px;
    margin: 0px 0px 0px 7px;
    
    background-image: url('../../../assets/images/rotation_lock.png');
    background-size: cover;
    cursor:pointer;
  }

  .tableOp .cross-item {
    margin: 0px 0px 13px 0px;
    padding: 0px 0px 0px 0px;
  }
  .chartOp .cross-item {
    margin: 0px 0px 4px 0px;
    padding: 0px 0px 0px 0px;
  }

  .exe_btn {
    width: 100%;
    height: 55px;
    padding: 10px 0px 0px 0px;
  }
  .exe_btn #apply_btn {  
    height: 30px;
    margin: 0px 10px 0px 0px;
  }
  .exe_btn #spread_btn {
    height: 30px;
  }


  .strong { background-color:yellow; display:inline; font-weight: bold;}
  .pref {
    background-image: url('../../../assets/images/preference.png');
    background-size: cover;
    cursor: pointer;
    display: inline-block;
    width: 20px;
    height: 20px;
    margin: 1px 0px 0px 7px;
  }
  .non-pref {
    display: inline-block;
    width: 20px;
    height: 20px;
    margin: 1px 0px 0px 7px;
  }










  /* 항목 리스트 영역입니다.!!!!!!!!!!!!!! */
  .set-object-item-wrap {
    width: 50%;
    height: 100%;
    /* height: calc(100vh - 170px); */
    padding: 0 10px 10px;
    position: relative;
  }

  .set-object-wrap {
    width: 50%;
    height: calc(100% - 170px);
    padding: 0 10px 10px;
    position: relative;
  }

  .set-object-item-box {
    width: calc(100% - 10px);
    height: calc(100% - 20px);

    border: 1px #d9d9d9 solid;
    margin-top: 15px;
    padding: 20px;

    display: flex;
    flex-direction: column;
  }

  .set_title {
    width: 100%;
    border-bottom: 1px solid #d9d9d9;
    padding-bottom: 6px;
    height: 28px;
    line-height: 21px;
    display: flex;
  }
  .set_title h2 {
    font-size: 14px;
    color: #333;
  }
  .set_title h2:before {
    display: inline-block;
    content: "";
    width: 3px;
    height: 12px;
    margin: 4px 5px 0px 0px;
    background: #ff7e00;
    border-radius: 1px;
  }
  .set_title p {
    margin-left: 15px;
    font-size: 11px;
    color: grey;
    letter-spacing: -1px;
  }

  .set_list_area { /* skin */
    /* width: 100%; */
    height: 95%;
    display: flex;
    flex-direction: column;
    margin: 12px 0px 0px 0px;
    padding: 0px 0px 0px 0px;
  }
  .set_text_area {
    margin: 12px 0px 0px 0px;
  }
  .set_subtitle {
    font-weight: 600;
    font-size: 13px;
    margin: 0px 0px 5px 0px;
    flex: 0;
  } 



  /* .object-field ~ .object-list::-webkit-scrollbar-track
  
  
  
  
  */


  .item_list {
      flex: 1;
      border: 1px solid #9b9b9b;
      overflow: auto;
      padding: 15px 20px 15px 20px;
  }
  .visualObj_list {
      width:auto; 
      height: auto;
      max-height: 470px;
  }
  .item_list > div.item_list_title {
      display: flex;
      flex-direction: row;
      border-bottom: 1px solid #9b9b9b;
      margin: 0px 0px 10px 0px;
      padding: 0px 0px 3px 0px
  }
  .item_list > div.item_list_title > div { font-size: 13px; font-weight: bolder; }
  .item_list > div.item_list_title > div:nth-child(1) { width: 40%; display: flex;}
  .item_list > div.item_list_title > div:nth-child(2) { width: 35%; }
  .item_list > div.item_list_title > div:nth-child(3) { width: 10%; }
  .item_list > div.item_list_title > div:nth-child(4) { width: 15%; }
  .item_list > li {
      list-style: none;
      border-bottom: 1px solid #b1b1b1;
      margin: 5px 0px 5px 0px;
  }
  .item_list > li > div {
      display: flex;
      flex-direction: row;
      /* height: 33px; */
      line-height: 33px;
      margin: 0px 0px 5px 0px;
  }
  .item_list > li > div > div:nth-child(1) { width: 40%; font-size: 13px; margin-right: 10px; cursor: pointer; }
  .item_list > li > div > div:nth-child(2) { width: 35%; font-size: 13px; cursor: pointer; }
  .item_list > li > div > div:nth-child(3) { width: 10%; }
  .item_list > li > div > div:nth-child(4) { width: 15%; display: flex; padding: 3px 0px 0px 0px; }
  .item_list > li > div > div:nth-child(4) > a { width: 40px; height: 24px; text-align: center; line-height: 24px; margin: 1px 0px 0px 5px;}
  .item_list > li > div > div:nth-child(4) > a.act { border: 1px solid #3678b3; background: #5ca5e6; font-size: 12px; font-weight: 700; color:#fff; }
  .item_list > li > div > div:nth-child(4) > a.inact { border: 1px solid #ccc; background: #f2f2f2; font-size: 12px; font-weight: 700; color:#000000}
  
  .set_text_area, .template_text, .template_title, .template_detail { width: 100%; }
  .template_text {
      border: 1px solid #9b9b9b;
      padding: 0px 10px 0px 10px;
  }
  .template_title, .template_detail { margin: 10px 0px 10px 0px; }
  .template_title > p {
      font-weight: 900; font-size: 12px;
      padding: 0px 0px 0px 3px;
      margin: 0px 0px 3px 0px;
  }
  .template_title > input {
      width: 100%;
      height: 36px;
      border-radius: 5px;
      padding: 10px 10px 10px 10px;
  }
  .template_detail > p {
      font-weight: 900; font-size: 12px;
      padding: 0px 0px 0px 3px;
      margin: 0px 0px 3px 0px;
  }
  .template_detail > textarea {
      width: 100%;
      height: 100px;
      border-radius: 5px;
      padding: 10px 10px 10px 10px;
  }
  .btn {
      width: 100%;
      height: 40px;
      border-top: 1px solid #c3cbd9;
      background: #fff;
      font-size: 12px;
  }
  .right-btn {
      float: right;
  }
  .left-btn {
      float: left;
  }
  .right-btn, .left-btn {
      width: 100px;
      height: 26px;
      margin: 10px 10px 0px 0px;
      line-height: 22px;
      font-size: 12px;
      font-weight: 700;
      background: #f2f2f2;
      border: 1px solid #aeaeae;
  }
  html, body, p, ul{
      margin: 0; padding: 0;
  }
  .chartOp-skin p, .tableOp-skin p, .textOp-skin p {
      line-height: 22px;
  }
  .sort {
      width: 20px;
      height: 20px;
      background-image: url(../../../assets/images/sort.png);
      background-size: cover;
      margin: 0 10px;
  }
  .template-title-screen {
      position: absolute;
      top: 0px;
      left: 0px;
      width: 100%;
      height: 100%;
      z-index: -1;
  }
  
</style>