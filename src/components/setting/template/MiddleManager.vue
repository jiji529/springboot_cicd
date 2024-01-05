<template>
  <div class="single-template" v-show="createTag.length">
    <div class="setting_btn_area" v-if="notEnough">
      <button @click="imageDownload2('.mm-line-group'+MMIdx)">이미지저장</button>
      <button @click="tableToExcel('e', '.mm-line-group'+MMIdx, MMIdx)">엑셀다운</button>
      <button style="width:100px;" @click="tableToExcel('a', '.mm-line-group'+MMIdx)">엑셀다운(전체)</button>
      <button @click="print('.mm-line-group'+MMIdx)">인쇄</button>
      <button @click="word('a')">워드다운</button>
    </div>

    <!-- 
      "align-items-left"
      "align-items-center"
      "align-items-right"
    -->
    <div :class="'mm-line-group mm-line-group'+MMIdx" :data-idx="MMIdx">
      <input type="text" :class="'template-name'+MMIdx" value="" hidden>
      <template v-for="(ct, pidx) in createTag">
        <div :class="ct.align + ' mm-line-object'" :key="'lo'+pidx">
          <template v-for="(_, idx) in ct.list">
            <Preview :ref="pidx+'voo'+idx" :key="pidx+'statcross'+idx+' '+reRenPreview"></Preview>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
  import { mapActions, mapGetters, mapState } from 'vuex';
  import Preview from './Preview';
  import html2canvas from 'html2canvas'
  import XLSX from 'xlsx';

  export default {
    name: 'MiddleManager',
    components: {Preview},
    data() {
      return {
        createTag: [],
        req_evg_seq: [],
        calcValue: true,
        eval1TopInclusion: false,
        reRenPreview: 0,
      };
    },
    props: ['componentType', 'MMIdx'], 
    computed: {
      ...mapGetters(['getStatSetting', 'getMediaList']),
      notEnough() {
        return ( this.createTag.length 
          && this.getStatSetting.statValue 
          && this.getStatSetting.statValue.length );
      }
    },
    methods: {
      ...mapActions(['getStatValueAPI']),

      repOption() {
        this.reRenPreview = this.reRenPreview > 100 ? 0 : this.reRenPreview+1;
      },

      // 검색 -> 차트 생성을 위한 액션
      /**
       * @description
       *    검색 -> 차트 생성을 위한 함수.
       * 
       *    **선행 작업**
       *    1. dropSearchValue() 기존 데이터 초기화
       *    2. settingSearchValue() 새 데이터 요청
       * @param {int} number -order
       * @param {object} TEMPLATE -template
       * @param {boolean} ready -is search
       */
      async onSearch(number, TEMPLATE, ready) {
        this.createTag = [];
        if (!ready || 
          (!TEMPLATE &&
            !TEMPLATE.config &&
            TEMPLATE.config.tcObject.length < 1)
        ) return ;

        const gt = document.querySelectorAll('.text-design'); // 기존 텍스트 객체 삭제
        if (gt !== undefined) gt.forEach(e => e.remove());
        try {
          // 통계 개별 옵션 설정
          const OPTION = await this.setOption(TEMPLATE.config.tcObject);
          const tagConfig = {};
          let i = 0;
          for (let [idx, tag] of this.createTag.entries()) {
            for (let [jdx, _] of tag.list.entries()) {
              if (!tagConfig[idx+'voo'+jdx]) {
                tagConfig[idx+'voo'+jdx] = {
                  index : this.MMIdx + '-' + i // index
                  ,res : this.req_evg_seq[i]
                  ,op :OPTION[i]
                  ,lineCnt : tag.list.length
                };
                i++
              }
            }
          }

          // 엑셀 시트에 필요한 템플릿 제목 세팅
          const templateName = document.querySelector('.template-name'+this.MMIdx);
          if (templateName) templateName.value = TEMPLATE.title || "sheet" + (this.MMIdx + 1);
          
          if (this.getStatSetting.statValue.length) {
            this.$emit( "nothing", false );
            await this.$nextTick(); // 렌더링을 기다려주기 위한 코드
            
            let i = 0;
            for (const [_, val] of Object.entries(this.$refs)) {
              if (!val.length || OPTION[i] === undefined) continue;
              val[0].chartParse(
                tagConfig[_].index
                ,tagConfig[_].res
                ,tagConfig[_].op
                ,tagConfig[_].lineCnt
              ); 
              i++;
            } // for
            
          } else {
            this.$emit( "nothing", true );
            console.error("No search results");
          }
        } catch (e) {
          console.error(e);
        }
        this.req_evg_seq = null;
      }, // [END] onSearch()

      /**
       * @description 검색조건에 의한 검색 결과를 받는 함수이다. (stat_value_wip.php)
       */
      async settingSearchValue() {
        // category, hnp_news, newsEval, evalClassify, scrapBook
        let params = await this.makeFormData(); // API 던질 검색 옵션 값들
        this.getStatSetting.statValue 
          = Object.freeze((await this.getStatValueAPI(params)).data); // 검색 조건에 따른 데이터 수집
      },

      /**
       * @description 검색되어 나온 데이터를 삭제한다.
       */
      dropSearchValue() {
        this.getStatSetting.statValue = null;
      },

      /**
       * @description
       *    핵심 변수 선언 로직
       *    option : 테이블 및 차트의 옵션에 대한 정보
       */
      setOption(config) {
        this.createTag = [];
        this.req_evg_seq = []; // req_evg_seq : 교차-기준 : 평가 항목들
        const tempLine = [];
        const objName = [];
        const options = JSON.parse(JSON.stringify(config));
        options.forEach((voo, idx) => {
          // voo : { align / linebreak }
          let line = {
            list: [],
            align : 'align-items-left',
          };
          if (idx == 0 || voo.relation.linebreak) {
            line.align = voo.relation.align;
            line.list.push(1);
            tempLine.push(line);
          } else {
            line = tempLine.at(-1);
            line.list.push(1);
          }

          if (voo.name === 'Text') { 
            this.req_evg_seq.push([]);
            return ; 
          }
          
          // 비활성화(=0)된 항목들은 포함시키지 않는다
          // 올바른 카운트를 위하여
          let length_ = 0;
          let tempObj = [];
          for (let type of ['rowList', 'columnList']) {
            length_ = voo[type].crossAxes.length;
            for (let i = 0; i < length_; i++) {
              let _val = String(voo[type].crossAxes[i].val);
              if (_val !== "0") {
                tempObj.push(_val);
              } else {
                voo[type].crossAxes.splice(i,1);
                length_--;
                i--;
              }
            } 
          }
          this.req_evg_seq.push(tempObj);
        });
        this.createTag = tempLine;
        return options;
      }, // [End] setOption

      // API 던질 검색 옵션 값들 세팅
      async makeFormData() {
        let setting = this.getStatSetting;  // Stat setting
        try {
          let params = new FormData();
          // start 간단한 파라미터 세팅
          params.append('dt', setting['dateType']);
          params.append('ds', this.$moment(setting['dateRange'].startDate).format('YYYY-MM-DD'));
          params.append('de', this.$moment(setting['dateRange'].endDate).format('YYYY-MM-DD'));
          if (setting['searchRange'].length > 0) {
            let newsGroupResult = [];
            setting['searchRange'].forEach(function(ng) {
              if (newsGroupResult.indexOf(ng) < 0) {
                newsGroupResult.push(ng);
              }
            });
            params.append('nm', newsGroupResult.join(','));
          }
          params.append('so', setting['searchOption']);
          params.append('ko', setting['keywordOption']);
          params.append('k', setting['keyword']);
          params.append('nk', setting['notKeyword']);
          params.append('nko', setting['notKeywordOption']);
          params.append('ah', setting['searchCriteria'].includeHideArticles ? 1 : 0);
          params.append('ne', setting['searchCriteria'].includingNot ? 1 : 0);
          params.append('hs', setting['searchCriteria'].includingPrivate ? 1 : 0);
          // end 간단한 파라미터 세팅

          // start 매체 파라미터 세팅
          if (setting['selectionMedium']) {
            // 선택된 매체의 전체 수 구하기
            let selectMediumCount = 0;
            for (let key in setting['selectionMedium']) {
              selectMediumCount += setting['selectionMedium'][key].length;
            }

            // [선택된 매체 수]와 [사용자의 전체 매체 수]를 비교
            // IF   - m : 0
            // ELSE - m : 선택된 매체의 아이디 (media-id)
            if (selectMediumCount === this.getMediaList.length) {
              params.append('m', '0');
            } else {
              let tmpMedia = [];
              for (let key in setting['selectionMedium']) {
                if (setting['selectionMedium'][key].length > 0) {
                  setting['selectionMedium'][key].forEach(media => {
                    tmpMedia.push(media.media_id);
                  });
                }
              }
              params.append('m', tmpMedia.join(','));
            }
          }
          // end 매체 파라미터 세팅

          // 자동평가 항목
          if (setting['evaluationItem0'].length > 0) {
            params.append('e0', setting['evaluationItem0'].join(','));
          }
          // 평가 1 항목
          if (setting['evaluationItem1'].length > 0) {
            params.append('e1', setting['evaluationItem1'].join(','));
          }
          // 평가 2 항목
          if (setting['evaluationItem2'].length > 0) {
            params.append('e2', setting['evaluationItem2'].join(','));
          }
          params.append('e0o', setting['evaluation0Options']); // 자동평가 항목 [and / or]
          params.append('e2o', setting['evaluation2Options']); // 평가 2 항목 [and / or]

          return params;
        } catch (e) {
          console.error(e);
        }
      }, // [END] makeFormData()


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


      async imageDownload2(t) {
        const filename = '통계-' + this.getStatSetting.chartExportName[6] + '_' + this.getDateTimeString() + '.png';
        // <Preview>안에 존재하고 항목-매체별에만 있는 checkbox를 지워주는 역할을 한다.
        const inputbox = document.querySelectorAll('.changeMediaGroup'); 
        // 저장할 이미지의 element를 가져온다.
        let htmlElement = document.querySelector(t);
        
        this.$store.state.loadingGif = true; 
        if (!await this.makeImage(htmlElement, filename)
          && await this.imgDownloadAlert(1) ) {
          const element = Object.values(htmlElement.children);
          const total = element.length;
          if (inputbox !== undefined) inputbox.forEach(inp=>inp.style.display = 'none');
          let voc = document.getElementById("voc");
          let voh = document.getElementById("voh");
          if (total == 1) await this.imgDownloadAlert(2);
          await this.showImageInfo(true, voc, voh, total+"/"+total, htmlElement.clientHeight); 

          for (let i=(total-1); i > 0; i--) {
            element[i].style.display = "none";
            await this.showImageInfo(true, voc, voh, i+"/"+total, htmlElement.clientHeight); 
            if (await this.makeImage(htmlElement, filename)) break;
            if (i == 1) await this.imgDownloadAlert(3);
          }

          await this.showImageInfo(false, null, null); 
          for (let e of element) { if (e.style.display == "none") e.style.display = "flex"; }
          if (inputbox !== undefined) inputbox.forEach(inp=>inp.style.display = 'block');
        }
        this.$store.state.loadingGif = false;
      },


      imgDownloadAlert(order) {
        if (order == 1) {
          // 처음 이미지 다운이 실패했을 때
          return window.confirm(
            "이미지로 전환 기능한 크기를 넘어섰습니다.\n"
          + "이미지로 전환 가능한 요소를 탐색 및 출력하시겠습니까?\n"
          + "(최하단 시각객체부터 제거해 나가며 탐색이 이뤄집니다.)\n"
          + "[로딩이 오래 걸릴 수 있습니다.]");
        } else if(order == 2) {
          // 전체 시각객체의 수가 1일 때
          alert("시각객체가 하나만 존재하므로 요소 검색이 불가능합니다.");
          return true;
        } else {
          // 요소 탐색 중, 마지막 요소만 남았을 때
          alert("모든 객체의 크기가 한계에 도달하여 이미지로 전환할 수 없습니다.");
          return true;
        }
      },


      showImageInfo(run, voc, voh, chtml, hhtml) {
        if (this.getStatSetting.imgDownloadInfo != run) {
          this.getStatSetting.imgDownloadInfo = run;
        }
        if (run && voc && voh) {
          voc.innerHTML = chtml;
          voh.innerHTML = hhtml;
        }
      },


      async makeImage(html, filename) {
        const canvas = await html2canvas(html); 
        let myImage = canvas.toDataURL('image/png'); 
        if (myImage.length < 10)  {
          return false;
        }
        // 이미지 다운받기
        let link = document.createElement('a');
        link.href = myImage;
        link.target = '_blank';
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        return true;
      }, // makeImage


      /**
       * @param {string} type 'A': all , 'e': each
       * @param {string} t group className
       */
      tableToExcel(type, t) {
        let group = [];
        if (type == "a") {
          let temp = document.querySelectorAll(".mm-line-group");
          let NM = 0;
          for(let me of Object.values(temp)) {
            NM = me.getAttribute('data-idx');
            group.push({
              NM : me.querySelectorAll("table")
            });
          }
        } else {
          group = [{
            "group1": document.querySelectorAll(t + " table")
          }];
        }
        if (group == null || !Object.values(group).length) return;
        const filename = '통계-테이블_' + this.getDateTimeString();
        let node = null;
        let excel = [];
        let tables = [];
        let table = {};
        let cnt = 0, temp = 0;
        for (let [gi, g] of Object.entries(group)) {
          tables = [];
          cnt = 0;
          node = Object.values(g)[0];
          for (let [tn, t] of Object.entries(node)) {
            [table, temp] = this.analytics(t, cnt);
            cnt += temp + 1;
            tables.push(table);
          } 
          excel.push({
            "tables": tables,
            "name": document.querySelector("input.template-name"+gi).value
          });
        } // for
        this.$statConfig.downloadOffice(filename, 'xlsx', excel);
      },


      analytics(table, startRow) {
        let cellOriented = true
            , gap = cellOriented ? 0 : 1
            , mergeInfo = []
            , dataInfo = []
            , startX = 0, startY = 0
            , trs = Array.from(table.rows)
            , except = {}; // row index : [ x좌표,... ]
        startRow = startRow || 0;
        //시작 cellIndex
        function startXPoint(y, x) {
            let idx = 0, arr = except[y];
            if (arr === undefined) return x;
            //연속 적으로 rowspan이 나올 경우를 대비하여 
            function nextXCheck(idx, max) {
                if (arr[++idx]?.[0] == max + gap) { return nextXCheck(idx, arr[idx][1]); }
                return max + gap;
            }
            //해당 cell 좌표가 병합 된 영역에 존재하는지 확인하여 병합 이후 좌표를 리턴
            for (let a of arr) {
                if (a[0] <= x && x <= a[1]) { return nextXCheck(idx, a[1]); }
                idx++;
            }
            return x;
        }
        //병합 + 데이터 뽑아내기 
        trs.forEach(function (e, i) {
            let x = 0
                , dArr = []
                , ri = e.rowIndex;
            for (let el of e.children) {
                let cs = (el.colSpan <= 0 ? 1 : el.colSpan) - gap //간혹가다가 임의로 0을 주는 바람에 0이 들어올때가 있다.
                    , rs = (el.rowSpan <= 0 ? 1 : el.rowSpan) - gap;
                if (ri == 0 && el.cellIndex == 0) { startX = cs + gap; startY = rs + gap; } //항목 영역을 지정
                x = startXPoint(ri, x);
                if (x < startX || ri < startY) { //항목인지 데이터인지 구분 
                    if (rs > gap) { // row 가 위로는 갈 수 없고 밑으로만 간다는 특성을 이용한다.
                        for (let zi = ri + 1; zi < ri + rs + gap; zi++) {
                            except[zi] = except[zi] || [];
                            except[zi].push([x, x + cs]);
                        }
                    }
                    mergeInfo.push([x + ':' + (ri + startRow), (x += cs) + ':' + (ri + rs + startRow), el.outerText]);
                } else {
                    dArr.push(el.outerText);
                }
                x += gap;
            }
            if (dArr.length > 0) dataInfo.push(dArr);
        }); 
        //결과값을 담는다 || 병합, 데이터, 데이터 시작 좌표
        return [{ "merge": mergeInfo, "data": dataInfo, "dataCoordinate": [startX, startY+startRow] }, trs.length];
      },

      async print(t) {
        await this.printPageLoad('A');
        let img = new Image();
        let node = document.querySelector('body');
        let canvas = await html2canvas(node); // html2canvas

        img.onload = () => {
          document.getElementById('wrap').style.display = 'none';
          document.title = '통계_' + this.getDateTimeString();
          let printImg = document.createElement('img');
          printImg.src = canvas.toDataURL('image/png');
          printImg.style.width = '100%';

          printImg.onload = function() { 
            document.body.style.minWidth = '0px';
            window.print(); 
            document.body.style.cssText = '';
            document.title = '스크랩마스터 프리미엄';
            document.getElementById('wrap').style.display = 'block';
            document.getElementById('print-wrap').remove();
          }
        }
        img.src = canvas.toDataURL();
      },

      async word(type='e') {
        await this.printPageLoad(type); 
        await this.$nextTick();
        const that = this;
        setTimeout(function(){
          const element = document.getElementById('print-wrap');
          let html = 
            "<html><body>" + element.outerHTML + "</body></html>";
          // document.querySelector('body').style.minHeight = "auto";
          document.querySelector('#wrap').removeAttribute('hidden');
          element.remove();
          // (window.open()).document.body.innerHTML = element.outerHTML; // 새 창 띄워서 확인하기
          that.$statConfig.downloadOffice("word", 'docx', html);
        },50);
      },

      /*
       * @Param type : 전체(아무 문자열 ex) 'A')  or 템플릿 하나(인쇄 하려는 템플릿 인덱스 ex) 1)
       * @Param tempidx : 인쇄할 템플릿 인덱스
       */
      printPageLoad(type) {
        let imgsLoadChk = this.$statConfig.waitImageLoading();
        // break-after: avoid-page; // 페이지변경 css
        //print max height : 1656px
        /*
            .statBox : 템플릿 내 객체 한개 
            .single-template : 템플릿 한개 
            .text-design : 내부 span 태그에 적용됨 
            .stat_table : table에 직접 적용됨
            .chartBox : html2canvas
            .mm-line-object : 템플릿 내 그룹된 애들 뭉텅이 바로 아래 statBox가 존재 

            .statBox parent에 정렬 기준이 있음
            .single-template parent가 보고서 전체를 나타낸다.

            .single-template > .mm-line-object > .statBox > .text-design, .stat_table, .chartBox
        */
        let whiteSpace = 20;	//여백 지정 ( 첫 페이지만 상단 여백, 나머진 다 좌우 여백만 적용됨 )
        let percent = 1 || 0.75;	//배율 지정 ( 간혹 저장 플렛폼에 따라 cm to px 시 배율이 안맞는 경우들이 있음 )
        let cmTOpx = 3.775;
        let a4width = Math.round(210*cmTOpx*percent);
        let a4Height = Math.round(297*cmTOpx*percent);	//792.75(793), 1121.175(1121)
        let totalWidth = 1860.00;
        let gap = (a4width - (whiteSpace*2))/totalWidth;
        let pageHeight = a4Height;
        //global style을 불러와 리사이징 하기 위해 
        let resizing = pxStr => { return Math.ceil(parseInt(pxStr)*gap)+'px'; }
        //인쇄를 하려는 객체 전체를 감싸는 객체
        let section = document.createElement('section');
        section.id = 'print-wrap';
        Object.assign(section.style, {
            width: a4width+'px'
            , padding: whiteSpace+'px'
            , position: 'absolute'
            , left: '-99999px'
        });
        // 문자열로 args를 전달할 경우 출력된 모든 객체를 한번에 인쇄 
        let elms, main;
        if ( typeof type === 'string' ){
            main = document.querySelector('.single-template').parentNode;
        } else if( typeof type === 'number' ){
            main = document.querySelectorAll('.single-template')[type];
        } else if( Array.isArray(type) ){
            elms = [];
            let allTemplate = document.querySelectorAll('.single-template');
            type.map(function(idx, i){
                elms = elms.concat(Array.from(allTemplate[idx].querySelectorAll('.mm-line-object')));
            });
        }
        //객체 묶음(group)을 모두 호출
        elms = elms || Array.from(main.querySelectorAll('.mm-line-object'));
        const that = this;
        elms.map(function(line, i){
            let statBoxs = Array.from(line.querySelectorAll('.statBox'));
            let orgGStyle = getComputedStyle(line);
            let groupDiv = document.createElement('div');
            Object.assign(groupDiv.style, {
                display: 'flex'
                ,justifyContent: orgGStyle.justifyContent
                ,width: resizing(orgGStyle.width)
            })

            let imgGroup = false
            , multiGroup = statBoxs.length > 1 ? true : false
            , tempDiv = null;
            if( multiGroup ){
                tempDiv = groupDiv;
                let groupTable = document.createElement('table');
                groupDiv = document.createElement('tr');
                groupTable.append( groupDiv );
                tempDiv.append( groupTable );	
            }
            const that2 = that;
            statBoxs.map(function(one, i){
                let orgEl = one.querySelector('.text-design, .stat_table, .chartBox')
                , el = orgEl.cloneNode(true)	// 기존의 객체에 영향을 주지 않기 위해 clone 생성 
                , orgStyle = getComputedStyle(orgEl)
                , elmType = 'text';
                if( el.classList.contains('text-design') ){	//글상자
                // 글상자  ( div 내부 span 내용 )
                    let otext = orgEl.querySelector('span'); 
                    let text = el.querySelector('span');
                    text.style.fontSize = resizing(getComputedStyle(otext).fontSize);
                    Object.assign(el.style, {
                        width: resizing(orgStyle.width)
                        ,paddingLeft: resizing(orgStyle.paddingLeft)
                        ,paddingRight:resizing(orgStyle.paddingRight)
                        ,paddingTop: resizing(orgStyle.paddingTop)
                        ,paddingBottom: resizing(orgStyle.paddingBottom)
                        ,marginLeft: resizing(orgStyle.marginLeft)
                        ,marginRight: resizing(orgStyle.marginRight)
                        ,marginTop: resizing(orgStyle.marginTop)
                        ,marginBottom: resizing(orgStyle.marginBottom)
                    });
                    el.removeAttribute('class');
                    elmType = 'text';

                } else if ( el.classList.contains('stat_table') ) { // 표 관련 리뉴얼
                // 표 관련 리뉴얼
                    let colgroup = el.querySelector('colgroup'); //HTMLCollection
                    let rows = Array.from(el.rows); // 테이블 내 자식들 복사
                    let newTable = document.createElement('table');
                    let maxCell = 0; // 최대 cell 수를 저장해 두기 위해
                    newTable.setAttribute('border', 1);
                    newTable.setAttribute('class', el.getAttribute('class'));
                    newTable.setAttribute('style', el.getAttribute('style'));
                    Object.assign(newTable.style, {
                        width: resizing(orgStyle.width)
                        ,borderCollapse: 'collapse'
                        ,textAlign: 'center'
                        ,fontSize: resizing(orgStyle.fontSize)
                    })
                    for(let row of rows){
                        //간혹 rowspan에 불필요하게 값을 넣어 놔서 row를 합칠때 문제가 발생한다. thead, tfoot이 테이블에 존재하면 인쇄시 매페이지에 따라다닌다.
                        let cCnt = row.childElementCount;
                        if( maxCell < cCnt ) maxCell = cCnt;
                        for(let ci=0; ci<cCnt; ci++){
                            let r = row.children.item(ci);
                            if(r.rowSpan < 1) r.rowSpan = 1;
                            // th, td에 붙은 class들 모두 제거 사용처가 있다면 남겨둬도 되지만 혹시 모를 style이 적용될 것을 우려하여 제거함
                            if( r.className ) { r.removeAttribute('class');	}
                        }
                        newTable.appendChild(row);
                    }
                    // colgroup이 표에 존재 했다면
                    if(colgroup) newTable.prepend(colgroup);
                    // 테이블에 최대로 만들수 있는 cell수 파악
                    newTable.dataset.mcell = maxCell;
                    el = newTable;
                    elmType = 'table';

                } else {	// 차트
                // 차트 이미지 변환 ( 제목 + 라벨 + 차트 묶음 )
                    let chart = orgEl.querySelector('canvas');
                    let src = chart.toDataURL('image/png');
                    let canvasToImg = new Image();
                    canvasToImg.src = src;
                    imgsLoadChk.setTotal();
                    canvasToImg.onload = function(){
                        canvasToImg.style.width = resizing(canvasToImg.naturalWidth);
                        imgsLoadChk.setReady();
                    }
                    let inputLoc = el.querySelector('canvas');
                    inputLoc.parentElement.style.height = 'auto';
                    el.style.width = resizing(orgEl.style.width);
                    inputLoc.after(canvasToImg);
                    inputLoc.remove();
                    //차트 제목들 글자 크기 변경
                    let c_title = Array.from(el.children[0].children);
                    el.children[0].removeAttribute('class');
                    Object.assign(el.children[0].style, {
                        textAlign: 'center'
                        ,display: 'flex'
                        ,justifyContent: 'center'
                        ,flexFlow: 'column'
                    });
                    for( let title of c_title ) {
                        title.style.fontSize = resizing(title.style.fontSize);
                    }
                    //차트 라벨 크기 및 글차 크기 변경
                    el.children[1].removeAttribute('class');
                    el.children[1].style.cssText = 'display: inline-block; width: 100%';
                    let c_orglabel = orgEl.children[1].querySelector('ul'); //ul
                    let c_label = el.children[1].querySelector('ul'); //ul
                    //라벨을 이용 안하는 특수한 항목들이 존재한다. 
                    if( c_label !== null ){ 
                        let ulTransPtag = document.createElement('p');
                        let c_li = c_label.children;
                        let cssFlexWrap = 'display: inline-flex; flex-wrap: wrap; align-items: center;';
                        ulTransPtag.style.cssText = c_label.style.cssText + cssFlexWrap + 'width: 100%;';
                        //차트 라벨 리뉴얼
                        for( let li of c_li ) {
                            //감싸지는 li를 span 테그로 변경
                            let liTransSpanTag = document.createElement('span');
                            liTransSpanTag.style.cssText = li.style.cssText + cssFlexWrap + 'margin: 0 3px;';
                            ulTransPtag.append(liTransSpanTag);
                            //항목 문자열 
                            let tSpan = document.createElement('span');
                            tSpan.innerText = li.lastElementChild.textContent;
                            //항목 색상표
                            let lcolor = li.firstElementChild;
                            lcolor.innerHTML = '■';
                            let lcolorHex = that2.$statConfig.rgbToHex(lcolor.style.backgroundColor);
                            //hex로 넣어도 Chrome 기반 브라우저에서는 모두 rgb로 변환을 하기 때문에 속성으로 때려 넣어준다.
                            lcolor.setAttribute('style', 'color: '+ lcolorHex + ';'); 
                            //빈칸용 더미 span ( 워드용 )
                            let spaceSpan = document.createElement('span');
                            spaceSpan.innerHTML = '&nbsp;&nbsp;';
                            //li를 대체하는 span에 담기 
                            liTransSpanTag.append(spaceSpan);
                            liTransSpanTag.append(lcolor);
                            liTransSpanTag.append(tSpan);
                        }
                        ulTransPtag.style.fontSize = resizing(getComputedStyle(c_orglabel).fontSize);
                        c_label.remove();
                        el.children[1].append(ulTransPtag);
                    }
                    elmType = 'chart';
                
                }
                el.dataset.ptype = elmType;
                if( multiGroup ){
                    let td = document.createElement('td');
                    td.append(el);
                    el = td;
                }
                groupDiv.append(el);
            });
            if( multiGroup ){ groupDiv = tempDiv }
            section.append(groupDiv);
        });
        document.body.append(section);
        document.getElementById('wrap').hidden = true;
        section.style.position = '';
        section.style.left = '0';
        document.body.style.minWidth = 'unset';
        // img load 시간을 주기 위해서 document.body.append(section);를 상단에 배치한다면 더 시간을 단축 할 수 있긴하다.
        function printOnload(){ 
            let pageCnt = 1;
            let topMargin = whiteSpace;
            let hChkObj = Array.from(section.children);
            let appHeight = 0;
            for( let line of hChkObj ){
                let aH = parseInt(getComputedStyle(line).height);
                let accH = pageHeight - (pageCnt > 1 ? 0 : whiteSpace) - appHeight;
                // 한페이지의 여유 공간보다 다음 row의 높이가 더 클 경우 
                if( accH < aH ) {
                    let innerElm = Array.from(line.querySelectorAll('[data-ptype="chart"], [data-ptype="table"], [data-ptype="text"]')); //line.children
                    let accCnt = 0;	// 페이지 변경이 필요한 객체가 한 line에 몇개가 있는지 확인 2개 이상이면 다음 페이지로 넘김
                    let freeSpace = accH; // 페이지에 남은 여유공간
                    innerElm.map(function(e, i){
                        let h = parseInt(getComputedStyle(e).height);
                        if( h > accH ) accCnt++;
                    });
                    // line에 속하는 그룹내 객체 2개 이상의 높이가 초과 되었을때 line 차체를 다음 페이지로
                    if( accCnt > 1 ){
                        line.style.breakBefore = 'page'; pageCnt++;
                        freeSpace = pageHeight;
                    } 
                    let ieMH = 0;
                    innerElm.map(function(e, i){
                        let h = parseInt(getComputedStyle(e).height);
                        if( h > freeSpace ) { // 비교 값만 변경하면 된다.
                            let addH = Math.ceil(h % pageHeight);
                            if( e.dataset.ptype == 'table' ) {
                                let nextSpace = freeSpace;
                                let rows = Array.from(e.rows);
                                addH = pageCnt > 1 ? 0 : whiteSpace;
                                let rsI = 0;//rowspan 되어 있는 객체 
                                for( let i=0; i<rows.length; ){
                                    let r = rows[i];
                                    let nsTF = false;
                                    addH += parseInt(getComputedStyle(r).height);
                                    // rowspan 되어 있는 row를 저장한다. 다음 페이지로 넘겨야 된다면 여기서 부터 넘긴다.
                                    if( e.dataset.mcell == r.childElementCount ) rsI = i;
                                    // 여유 공간에 들어갈 수 있는 row 까지 남겨두고 자른다.
                                    if( nextSpace < addH ){ nsTF = true; }
                                    // 한페이지 높이를 넘은 경우
                                    if( pageHeight < addH || nsTF){
                                        if( e.dataset.mcell > r.childElementCount ) {
                                            rows[rsI].style.breakBefore = 'page'; pageCnt++;
                                            i = rsI;
                                        } else {
                                            r.style.breakBefore = 'page'; pageCnt++;
                                        }
                                        if( nsTF ) nextSpace = pageHeight;
                                        addH = 0; //다음 페이지로 넘어가기 때문에 0으로 초기화 후 다시 실행 
                                        continue;
                                    }
                                    i++;
                                }
                            } else if ( e.dataset.ptype == 'chart' ) {
                                line.style.breakBefore = 'page'; pageCnt++;
                                addH = h;
                            }
                            // 내부 객체중 가장 큰 것에서 중 다음페이지에서 차지하는 공간을 지정하기 위해 
                            if( ieMH < h ) {
                                appHeight = addH;
                                ieMH = addH;
                            }
                        } // if( h > freeSpace )
                    });
                    continue;
                } // if( accH < aH )
                appHeight += aH;
            }
            //print();
            //section.remove();
            //document.body.style.removeProperty('minWidth')
            //document.getElementById('wrap').hidden = false;
        };
        imgsLoadChk.setTntervalResult(printOnload);
        imgsLoadChk.runInteval();
      }
    }, // method


  }
</script>
<style scoped>
  .setting_btn_area { 
    text-align: right;
    padding-right: 25px;
  }
</style>
