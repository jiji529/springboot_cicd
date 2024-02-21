<template>
    <div>
        <div class="report-wrap">
    <!-- ======================================================================================================================= -->
    <!-- ======================================================================================================================= -->
    <!-- 보고서 리스트 -->
    <!-- ======================================================================================================================= -->
    <!-- ======================================================================================================================= -->
            <div class="set-object-item-wrap">
                <div class="set-object-item-box">
                    <div class="set_title">
                        <h2>보고서 리스트</h2>
                        <p>* 항목을 클릭하여 데이터를 수정할 수 있습니다.</p>
                        <div class="list-reset">새로고침 <div title="새로고침" @click="loadReport()"></div></div>
                    </div>
                    <div class="set_list_area rp-op-rp-ls">
                        <div class="set_subtitle">
                        > 전체 항목
                        </div>
                        <div class="item_list">
                            <div class="item_list_title">
                                <div class="rep-header-title">제목 <a class="sort" @click="sorting"></a></div>
                                <div class="rep-header-des">상세설명</div>
                                <div></div>
                                <div>동작여부</div>
                            </div>
                            <template v-for="(report, reportIdx) in reportList">
                            <li v-if="report.seq > 2" :key="'report'+reportIdx+reportRen"> <!-- li 태그 반복문의 대상 -->
                                <div :class="[SINGLE_REPORT.seq === report.seq ? 'highlight' : '']">
                                    <div class="item_title short" title="템플릿 제목" @click="reportInfo($event, report)"
                                        :data-idx="reportIdx" :data-seq="report.seq">{{report.title}}</div>
                                    <div class="item_description short" @click="reportInfo($event, report)">
                                        <p>{{printDate(report.regDate, report.updDate)}}</p>
                                        <span>{{report.description}}</span>
                                    </div>
                                    <div class="item_more">
                                        <div v-if="isThereMoreWriting(report.title, report.description)"
                                        class="rollup" @click="textView" data-nextAction="rolldown"></div>
                                    </div>
                                    <div>
                                        <a :class="[report.active===1?'act':'inact']" data-active="1" @click="$statConfig.funcActive($event, report, 'report')">사용</a>
                                        <a :class="[report.active===0?'act':'inact']" data-active="0" @click="$statConfig.funcActive($event, report, 'report')">비사용</a>
                                    </div>
                                </div>
                            </li>
                            </template>
                        </div>
                        <div class="btn">
                            <button class="left-btn gen-btn" v-if="arrow" @click="spread()">전체 펼치기</button>
                            <button class="left-btn gen-btn" v-else @click="spread()">전체 접기</button>
                            <button class="right-btn gen-btn" @click="deleteReport">삭제</button>
                            <button class="right-btn gen-btn" @click="addReport">추가</button>
                        </div>
                    </div>
                </div>
            </div>


    <!-- ======================================================================================================================= -->
    <!-- ======================================================================================================================= -->
    <!-- 보고서 세팅 -->
    <!-- ======================================================================================================================= -->
    <!-- ======================================================================================================================= -->
            <div class="set-object-item-wrap">
                <div class="set-object-item-box">
                    <input type="hidden" id="reportSeq" value="">
                    <div class="set_title">
                        <h2>보고서 상세 설정</h2>
                        <p>* 템플릿을 보고서에 추가 및 삭제할 수 있습니다.</p>
                        <span v-if="SINGLE_REPORT.seq === null" class="strong-font-right">보고서 추가....</span>
                        <span v-if="SINGLE_REPORT.seq" class="strong-font-right">보고서 조회/수정....</span>
                    </div>
                    <div class="report-setting">
                        <div>
                            <div class="option-font">보고서 제목</div>
                            <p>* 최대 20 글자만 입력할 수 있습니다.</p>
                        </div>
                        <input type="text" class="rs-list" @click="wrongAction" v-model="SINGLE_REPORT.title" maxlength="20">

                        <div class="option-font">보고서 설명</div>
                        <textarea id="reportDes" name="reportDes" @click="wrongAction" class="rs-des" v-model="SINGLE_REPORT.description"></textarea>

                        <div class="option-font">등록된 템플릿 <div class="calc-helper" @click="showGuide"></div></div>
                        <div class="rs-data" @scroll="handleScroll" @dragover.prevent @dragenter.prevent @drop.prevent="funcDrop">
                            <draggable tag="div" :list="SINGLE_REPORT.config" group="selTemplate-group" :disabled="false">
                                <template v-for="(selectedTempl, templIdx) in SINGLE_REPORT.config">
                                <li :data-idx="templIdx" :key="reportRen+'report-template'+templIdx">
                                    <div :class="[findTemplate(selectedTempl.seq, 'active')==0?'deprecated-template':'']">
                                        <div class="item_title" title="템플릿 제목" 
                                            :data-seq="selectedTempl.seq">{{findTemplate(selectedTempl.seq, 'title')}}</div>
                                        <div class="calc-area">
                                            <button @click="calcSetting($event, templIdx)">표시값 유형 설정</button>
                                            <section class="summary"><p>
                                                    <data v-if="getCrossCalc(templIdx, 'type') == 0">원본</data>
                                                    <data v-else-if="getCrossCalc(templIdx, 'type') == 1">건수</data>
                                                    <data v-else>가치</data>
                                                    <template v-if="getCrossCalc(templIdx, 'type') == 2">
                                                        -
                                                        <data v-if="getCrossCalc(templIdx, 'priceUnit') == 0">원</data>
                                                        <data v-else-if="getCrossCalc(templIdx, 'priceUnit') == 1">천원</data>
                                                        <data v-else>백만원</data>
                                                    </template>
                                            </p></section>
                                        </div>
                                        <div><div class="trash" @click="delSelectedTempl($event, templIdx)"></div></div>
                                    </div>
                                </li>
                                </template>
                            </draggable>


                            <div class="value-calc"> 
                                <template  v-if="valueCalc !== null">
                                <p><span>표시 값</span><span @click="closeValueCalc">X</span></p>
                                <section>
                                    <ul>
                                        <li>
                                            <!-- value >>>> v-model -->
                                            <input id="itemCalc1" type="radio" name="calc_group" v-model="valueCalc.type" value="0" >
                                            <label for="itemCalc1"><span></span>원본</label>
                                        </li>
                                        <li>
                                            <input id="itemCalc2" type="radio" name="calc_group" v-model="valueCalc.type" value="1">
                                            <label for="itemCalc2"><span></span>건수</label>
                                        </li>
                                        <li>
                                            <input id="itemCalc3" type="radio" name="calc_group" v-model="valueCalc.type" value="2">
                                            <label for="itemCalc3"><span></span>가치</label>
                                        </li>
                                    </ul>
                                    <div class="won-unit" v-if="valueCalc.type == 2"> <!-- unit1에서 1이라는 숫자는 templIdx를 뜻한다. -->
                                        <ul>
                                            <li>
                                                <input id="itemUnit1" type="radio" name="unit_group" v-model="valueCalc.priceUnit" v-bind:value="0">
                                                <label for="itemUnit1"><span></span>원</label>
                                            </li>
                                            <li>
                                                <input id="itemUnit2" type="radio" name="unit_group" v-model="valueCalc.priceUnit" v-bind:value="1">
                                                <label for="itemUnit2"><span></span>천원</label>
                                            </li>
                                            <li>
                                                <input id="itemUnit3" type="radio" name="unit_group" v-model="valueCalc.priceUnit" v-bind:value="2">
                                                <label for="itemUnit3"><span></span>백만원</label>
                                            </li>
                                        </ul>
                                    </div>
                                </section>
                                </template>
                            </div>
                        </div>
                    </div>
                    <div class="btn">
                        <button class="left-btn gen-btn" @click="statSearch">미리보기(=검색)</button>
                        <button class="right-btn save-btn" @click="saveData" >저장하기</button>
                    </div>
                </div>
            </div>


    <!-- ======================================================================================================================= -->
    <!-- ======================================================================================================================= -->
    <!-- 템플릿 리스트 -->
    <!-- ======================================================================================================================= -->
    <!-- ======================================================================================================================= -->
            <div class="set-object-item-wrap">
                <div class="set-object-item-box">
                    <div class="set_title">
                        <h2>템플릿 리스트</h2>
                        <p>* 항목을 클릭하여 데이터를 수정할 수 있습니다.</p>
                        <div class="list-reset">새로고침 <div title="새로고침" @click="loadTemplate()"></div></div>
                    </div>

                    <div class="set_list_area">
                        <div class="set_subtitle">
                        > 전체 항목
                        </div>
                        <div class="item_list">
                            <div class="item_list_title">
                                <div class="rep-header-des">제목</div>
                                <div class="rep-header-des">상세설명</div>
                                <div></div>
                                <div>날짜</div>
                            </div>
                            <template v-for="(template, templateIdx) in getStatSetting.templateList">
                            <li :key="'report-template'+templateIdx+reportRen" v-if="template.active !== 0"
                                draggable="true" @dragstart="funcDragStart($event, template)"> <!--  @drag="funcDrag" -->
                                <div>
                                    <div class="item_title short" title="템플릿 제목" 
                                        :data-seq="template.seq">{{template.title}}</div>
                                    <div class="item_description short">{{template.description}}</div>
                                    <div class="item_more">
                                        <div v-if="isThereMoreWriting(template.title, template.description)"
                                        class="rollup" @click="textView" data-nextAction="rolldown"></div>
                                    </div>
                                    <div>{{printDate(template.regDate, template.updDate)}}</div>
                                </div>
                            </li>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
            <input type="checkbox" id="chk-manual">
            <section id="manual" @click="showGuide">
                <strong>표시값 유형이란?</strong><br>
                <span>통계(테이블, 차트)의 숫자(수치)가<br>지니는 의미를 말한다.</span>
            </section>
        </div>
        
        

        

        <StatSearch v-if="showComp == 1"></StatSearch>
        <h2 class="no-data" v-if="noData">평가된 기사가 없음</h2>
        <div v-show="!noData"> <!-- single-template을 감싸고 있는 태그 -->
            <template v-for="(temp, templIdx) in SINGLE_REPORT.config">
            <MiddleManager  :ref="type+templIdx"
                            :componentType="type"
                            :MMIdx="templIdx"
                            @nothing="nothing"
                            :key="'some'+templIdx"></MiddleManager>
            </template>
        </div>
    </div>
</template>

<script>
import {mapGetters, mapState} from 'vuex';
import draggable from "vuedraggable";
import StatSearch from './StatSearch';
import MiddleManager from './MiddleManager';
export default {
    name: 'ReportSetting',
    components: {draggable, MiddleManager, StatSearch},
    data() {
        return {
            type: 'reportSection',
            SINGLE_REPORT: {},
            reportList: [],
            reportListIndex: null,
            linkedTab: [],

            reportRen: 0,
            dragEvent: null,
            passingOption: [],
            ready: false,
            guide: true, // 등록된 템플릿 필드에서 안내문구 출력 여부를 담당
            isAsc: 1,
            arrow: true, // 펼치기 / 접기
            arrowState: 0,

            valueCalc: null,
            currCalcBtn: null,
            noData: false,

            dataScale: null
        }
    },
    props: {'showComp': Number},

    watch: {
        'SINGLE_REPORT.config': function(value) {
            if (!this.SINGLE_REPORT.config) return; 
            let _cnt = this.SINGLE_REPORT.config.length;
            if (this.guide && _cnt > 0) {
                const aft = document.querySelector('.rs-data > div');
                aft.className = 'no-after';
                this.guide = false;
            } else if(!this.guide && _cnt === 0) {
                const aft = document.querySelector('.rs-data > div');
                aft.className = '';
                this.guide = true;
            }   
        },

        arrowState() { 
            const item_up = document.querySelector('.rp-op-rp-ls .rollup');
            const item_down = document.querySelector('.rp-op-rp-ls .rolldown');
            if (!item_up && item_down) this.arrow = false;
            else if (item_up && !item_down) this.arrow = true;
        }
    },

    computed: {
        ...mapGetters(['getStatSetting', 'getDate', 'getConfigEvalGroup']),
    },

    methods: { // <추가>하기 하는 도중에 API로 넘어가서 진행하고 있었음. (seq 때문에)

        reportRendering() {
            this.reportRen = this.reportRen > 100 ? 0 : this.reportRen+1;
        },
        nothing(value) { this.noData = value; },
        handleScroll() { this.closeValueCalc(true); },
        findTemplate(seq, key) {
            for(let e of this.getStatSetting.templateList) {
                if (e.seq == seq) return e[key];
            }
        },

        wrongAction() {
            if (this.SINGLE_REPORT.seq === undefined) { 
                alert('보고서를 추가해 주세요 ("추가" 버튼 클릭)'); 
                return false;
            }
            return true;
        },

        /**
         * @description: 교차-계산에 해당하는 "표시값 유형 설정" 모달창이다.
         * @param {boolean} reset 클릭한 버튼을 초기화할 것인지 결정한다.
         */
        closeValueCalc(reset) { 
            if (document.querySelector('.value-calc')) 
                document.querySelector('.value-calc').style.display = 'none';
            if (this.currCalcBtn) {
                this.currCalcBtn.style.backgroundColor = '#f0f0f0';
                this.currCalcBtn.style.color = 'black';
                if (reset) this.currCalcBtn = null;
            }
            this.valueCalc = null; 
        },

        calcSetting(e, index) {
            const btn = e.currentTarget;
            const group = document.querySelector('.rs-data');
            const div = document.querySelector('.value-calc');
            if (this.currCalcBtn != null) this.closeValueCalc(false);
            if (this.currCalcBtn === btn) { 
                this.closeValueCalc(true);
                return; 
            }
            this.currCalcBtn = btn;
            btn.style.backgroundColor = '#c1c0c0';
            btn.style.color = '#fff';
            div.style.top = (btn.offsetTop - group.scrollTop) + "px" ;
            div.style.left = (btn.offsetLeft + btn.offsetWidth) + 'px';
            div.style.display = 'inline-block';
			div.style.position = 'absolute';
            this.valueCalc = this.SINGLE_REPORT.config[index].parentCrossCalc;
        },

        getCrossCalc(idx, key) {
            return this.SINGLE_REPORT.config[idx].parentCrossCalc[key];
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
            let tagSize1 = document.querySelector('.rep-header-title')?.offsetWidth;
            let tagSize2 = document.querySelector('.rep-header-des')?.offsetWidth;;
            return this.checkTagSize(tagSize1, title) || this.checkTagSize(tagSize2, des);
        },

        printDate(...date) {
        if (date[0] === undefined) return ;
        // date[0] = 등록날짜, date[1] = 수정날짜
        if (date[1] === null || date[1] === undefined) {
            return String(date[0].slice(0, 10));
        } 
            return String(date[1].slice(0, 10));
        },

        spread() {
            const DIV = document.querySelectorAll('.rp-op-rp-ls .item_list > li > div');
            // 펼치기 - 접기
            if (this.arrow) DIV.forEach(el => this.textView(el ,'rolldown'));
            else DIV.forEach(el => this.textView(el ,'rollup'));
            this.arrowState = this.arrowState > 100 ? 1 : this.arrowState + 1;
        },

        textView(e, paramNextAction) {
            let upDown = e.target;
            let isClickEvent = (upDown !== undefined) ? true : false; // 클릭이벤트인가? 아닌가?
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

        addReport() {
            this.SINGLE_REPORT = {
                seq: null,
                tKey: 'report',
                title: '새 보고서',
                description: '보고서 상세 설명',
                active: 1,
                regDate :null,
                updDate: null,
                config: [/* {seq, parentCrossCalc} */],
            };
            this.closeValueCalc(true);
        },

        /** 
         * @description: 데이터의 규모를 측정하는 함수
         * @param {Array} tcObject (table or chart or text) Object
         */
        countdata(value) {
            if (value instanceof Object) {
                if (value.config && value.config.tcObject) return;

            }

            if (value instanceof Array) {
                for(let [_, item] of Object.entries(crossAxes)) {
                    if (item.name != "" && item.val !== "0") {
                        RES.size += this.getConfigEvalGroup[item.val].subCnt;
                        RES.msg += item.name + ":" + this.getConfigEvalGroup[item.val].subCnt + ", ";
                    }
                }
            }
            // this.findTemplate(this.dragEvent.seq) 
        },

        funcDrag(e) {
            let updown = e.clientY - e.target.getBoundingClientRect().y;
            this.dragEvent.position = updown + e.target.offsetTop; // 움직이는 위치
        },

        /**
         * @description : 템플릿 리스트에서 보고서 상세 설정으로 넘어갈 때 사용되는 드래그 기능
         */
        funcDragStart(event, item) { this.dragEvent = Object.freeze(item); },

        funcDrop() {
            if (this.dragEvent === null) return;
            if (!this.wrongAction()) {
                return;
            }
// this.countdata(this.dragEvent);
            this.SINGLE_REPORT.config.push({
                seq: this.dragEvent.seq

                ,parentCrossCalc : {
                    type     :0,
                    priceUnit:0
                }
            })
            this.dragEvent = null;
        },

        showGuide(e) {
            let chk = document.getElementById('chk-manual');
            if (e.target.className == 'calc-helper') {
                chk.checked = !chk.checked;
                let man = document.getElementById('manual');
                man.style.top =  (e.target.offsetTop + 10) + 'px';
                man.style.left = (e.x) + 'px';
            } else chk.checked = false;
        },

        delSelectedTempl(e, _deli) {
            this.SINGLE_REPORT.config.splice(_deli, 1);
        },

        /**
         * @description : 보고서 리스트 불러오기
         */
        async loadReport() {
            this.reportList = [];
            const LIST = await this.$statConfig.funcLoadRecode("list-exc", 'report');
            this.reportList = LIST ? LIST : [];
            await this.$nextTick();
            this.isAsc = 1;
            this.arrow = true;
        }, // loadReport

        /**
         * @description : 템플릿 리스트 불러오기
         */
        async loadTemplate() {
            this.getStatSetting.templateList = [];
            this.getStatSetting.templateList = 
                await this.$statConfig.funcLoadRecode("list", 'template');
        }, // loadTemplate

        /**
         * @description :
         *    레포트 삭제
         */
        async deleteReport() {
            if (this.SINGLE_REPORT.seq === undefined) {alert('선택된 보고서가 없습니다.'); return;}
            if (confirm("보고서를 삭제하시겠습니까?")) {
                if (this.SINGLE_REPORT.seq === null) { this.SINGLE_REPORT = {}; return; }
                await this.$statConfig.funcDeleteRecode('report', this.SINGLE_REPORT);
                await this.loadReport(); // 데이터를 로드하는 곳에서 레포트 재세팅이 이루어진다.
                await this.closeValueCalc(true);
                this.SINGLE_REPORT = {};
                await this.reportRendering();
            }
        }, // deleteReport


        /**
         * @description :
         *    보고서 데이터 .JSON으로 저장
         */
        async saveData() {
            if (this.SINGLE_REPORT.seq === undefined) { 
                alert("보고서를 선택 또는 추가 해주세요."); return ;
            }
            if (!this.SINGLE_REPORT.title.trim().length) {
                alert("제목은 공백만으로 이뤄질 수 없습니다."); return ;
            } 
            this.closeValueCalc(true); // 표시 값 유형 모달창 삭제
            if (this.SINGLE_REPORT.seq === null) {
                if (!confirm("저장하시겠습니까?")) return;
                let chk = await this.$statConfig.funcCreateRecode('report', this.SINGLE_REPORT);
                await this.loadReport(); 
                let lastest = null;
                let __seq = null; 
                if (this.reportList) lastest = this.reportList[0].regDate;
                for (let [_, val] of Object.entries(this.reportList)) {
                    if (new Date(lastest) <= new Date(val.regDate)) {
                        lastest = val.regDate;
                        __seq = val.seq;
                    }
                }
                if (!__seq) {alert('데이터가 없습니다.'); return;}
                this.SINGLE_REPORT.seq = __seq;
            } else {
                if (!confirm("수정하시겠습니까?")) return;
                await this.$statConfig.funcModifyRecode('report', this.SINGLE_REPORT);
                await this.loadReport();
            }
            await this.loadTemplate();
            await this.reportRendering();
        }, // saveData
        


        
        async reportInfo(e, report) {
            if (this.SINGLE_REPORT.seq === null) {
                if (!confirm("작업 중인 보고서의 데이터가 소실됩니다.")) return;
            } 
            if (this.SINGLE_REPORT.seq !== report.seq) {
                this.closeValueCalc(true);
                this.SINGLE_REPORT = {}; 

                this.SINGLE_REPORT = (await this.$statConfig.funcLoadRecode('single', 'report', report))[0];
                if (this.SINGLE_REPORT === {}) {
                    alert("정보 불러오기 실패");
                }
            } else {
                await this.closeValueCalc(true);
                this.SINGLE_REPORT = {};
            }
            // 시각객체 reset
        },

        sorting() {
            const that = this;
            this.reportList.sort((a, b) => {
            return that.isAsc * a.title.localeCompare(b.title);
            });
            this.isAsc = (-1) * this.isAsc;
        },

        async statSearch() {
            try {
                if (!await this.$store.dispatch('loginCheckGentleAPI')) {
                    this.$eventBus.$emit('kickOut');
                }
                await this.$nextTick();
                this.closeValueCalc(true);
                const template = [];
                for (let r of this.SINGLE_REPORT.config) { // report list
                    for (let t of this.getStatSetting.templateList) { // template list
                        if (t.active == 1 && r.seq == t.seq) {
                            template.push(t);
                            break;
                        }
                    }
                }
                if (template.length == 0) return;
                this.$store.state.loadingGif = true;
                await this.$refs[this.type + '0'][0].dropSearchValue(); // 기존 데이터 초기화
                await this.$refs[this.type + '0'][0].settingSearchValue(); // 새 데이터 요청
                await this.searchLogic(JSON.parse(JSON.stringify(template)));
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
                over = this.SINGLE_REPORT.config[_i].parentCrossCalc;
                if (this.getStatSetting.crossCalcValue != 0) {
                    tcArr = template[_i].config.tcObject;
                    tcSize = tcArr.length;
                    for (let _j = 0; _j < tcSize; _j++) {
                        if (tcArr[_j].name != 'Text') {
                            tcArr[_j].crossCalc.isPrice = (this.getStatSetting.crossCalcValue == 2);
                            tcArr[_j].crossCalc.priceUnit = this.getStatSetting.numberScale;
                        }
                    }
                } else if (over.type != 0) { // 0:원본, 1:건수, 2:가치
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
                this.$refs[this.type+_i][0].onSearch(_i, template[_i], true);
            }
        },

        resetPreview() {
            this.SINGLE_REPORT = {};
        },

    }, // method
}
</script>

<style scoped>
    .hidden-me {
        display: none;
    }

    .report-wrap {
        width: 1888px;
        height: 767px;
        display: flex;
        flex-direction: row;
    }
    .set-object-item-wrap {
        width: 33.3%;
        height: 100%;
        padding: 0 10px 10px;
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
    .item_list {
        flex: 1;
        border: 1px solid #9b9b9b;
        overflow: auto;
        padding: 15px 15px 15px 15px;
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
    .item_list > div.item_list_title > div:nth-child(1) { width: 40%; display: flex; }
    .item_list > div.item_list_title > div:nth-child(2) { width: 35%; }
    .item_list > div.item_list_title > div:nth-child(3) { width: 7%; }
    .item_list > div.item_list_title > div:nth-child(4) { width: 15%; }
    .item_list > li {
        list-style: none;
        border-bottom: 1px solid #b1b1b1;
        margin: 5px 0px 5px 0px;
    }
    .item_list > li > div {
        display: flex;
        flex-direction: row;
        line-height: 33px;
        margin: 0px 0px 5px 0px;
    }
    .item_list > li > div > div:nth-child(1) { width: 40%; font-size: 13px; padding-right: 10px; cursor: pointer;}
    .item_list > li > div > div:nth-child(2) { width: 35%; font-size: 13px; margin-left: 5px; cursor: pointer;}
    .item_list > li > div > div:nth-child(3) { width: 6%; }
    .item_list > li > div > div:nth-child(3) > div.upNdown { 
        width: 26px; height: 26px; background: url(../../../assets/images/ico_pre.png) 3px -283px no-repeat; margin: 4px 0px 0px 0px;}

    .item_list > li > div > div:nth-child(4) { width: 17%; display: flex; padding: 0px 0px 0px 0px; }
    .item_list > li > div > div:nth-child(4) > a { width: 40px; height: 24px; text-align: center; line-height: 24px; margin: 1px 0px 0px 5px;}
    .item_list > li > div > div:nth-child(4) > a.act { border: 1px solid #3678b3; background: #5ca5e6; font-size: 12px; font-weight: 700; color:#fff; }
    .item_list > li > div > div:nth-child(4) > a.inact { border: 1px solid #ccc; background: #f2f2f2; font-size: 12px; font-weight: 700; color:#000000}

    
    /* button */
    .btn {
        width: 100%;
        height: 40px;
        border-top: 1px solid #c3cbd9;
        font-size: 12px;
    }
    .right-btn {
        float: right;
        margin-left: 10px;
    }
    .left-btn {
        float: left;
        margin-right: 10px;
    }
    .right-btn, .left-btn {
        width: 100px;
        height: 26px;
        margin-top: 10px;
        line-height: 22px;
        font-size: 12px;
        font-weight: 700;
    }
    .gen-btn {
        background: #f2f2f2;
        border: 1px solid #aeaeae;
    }
    .save-btn {
        border: 1px solid #3678b3;
        background-color: #5ca5e6;
        color: white;
    }


    .option-font {
        display: flex;
        font-weight: 600;
        font-size: 13px;
        margin: 0px 0px 5px 0px;
    }
    .option-font + p {
        margin-left: 15px;
        font-size: 11px;
        color: grey;
        letter-spacing: -1px;
    }
    /* list detail */
    
    .report-setting {
        width: 100%;
        height: 100%;
        margin: 10px 0px 0px 0px;
    }
    .report-setting > div:nth-child(1) {
        display: flex;
    }

    .rs-list, .rs-des, .rs-data {
        margin: 0px 0px 10px 0px;
        border: 1px solid #9b9b9b;
    }

    .rs-list {
        width: 100%;
        height: 8%;
        border-radius: 5px;
        padding: 10px 10px 10px 10px;
    }

    .rs-des {
        width: 100%;
        height: 20%;
        border-radius: 5px;
        padding: 10px 10px 10px 10px;
    }

    .rs-data {
        width: 100%;
        height: 342px;
        display: flex;
        flex-direction: column;
        border-radius: 5px;
        padding: 15px 15px 6px 15px;
        overflow-y: scroll;
    }

    .rs-data > div {
        list-style: none;
        flex-grow: 1;
    }
    /* <등록된 템플릿> 필드의 안내글 */
    .rs-data > div:nth-child(1):after {
        content: '오른쪽 템플릿 리스트에서 아이템을 드래그 합니다.';
        white-space: pre;
        font-size: 20px;
        font-weight: bold;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-52%, 100%);
        opacity: 0.3;
    }
    .rs-data > div.no-after:after {
        content: none;
    }
    .rs-data > div:hover:after {
        display: none;
    }
    .rs-data > div > li:not(.won-unit li) {
        list-style: none;
        margin: 5px 0px 5px 0px;
    }
    .rs-data > div > li > div:not(.won-unit) {
        display: flex;
        flex-direction: row;
        line-height: 50px;
        border: 2px solid #85848445;
        padding: 3px;
        border-radius: 10px;
        margin-right: 10px;
    }
    .rs-data > div > li > div.helper {

    }
    .rs-data > div .item_title {
        width: 295px; font-size: 13px; font-weight: 700; color: rgb(72, 72, 72);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        z-index: 10;
    }

    .calc-area {
        display: flex;
        flex-direction: column;
        margin-right: 51px;
    }
    .calc-area > button {
        padding: 3px;
        border: 2px solid #807d90;
        border-radius: 3px;
        cursor: pointer;
        font-size: 11px;
        background-color: #f0f0f0;
    }
    .calc-area > section {
        z-index: -1;
    }
    .calc-area > section > p {
        width: auto;
        height: 20px;
        margin-block-start: -14px;
        margin-block-end: 0em;
        margin-inline-start: 0px;
        margin-inline-end: 0px;
    }
    .calc-helper {
        display: inline-block;
        width: 19px;
        height: 19px;
        margin-left: 10px;
        background: url(../../../assets/images/ico_pre.png) 0 -400px no-repeat;
        transform: translate(-1px, 2.6px);
    }

    #chk-manual:checked + #manual {
        display: inline-block;
    }
    #manual {
        position: absolute;
        display: none;

        width: 175px;
        height: 65px;
        padding: 10px;
        background: #fff;
        border: 1px solid #333;
        color: #777;
        font-size: 11px;
        font-weight: normal;
        letter-spacing: -1px;
        z-index: 11;
    }
    #manual a {
        position: absolute;
        bottom: 45px;
        left: 190px;
    }


    .trash {
        display: inline-block;
        width: 19px;
        height: 19px;
        margin: 0px 0px 0px 0px;
        background: url(../../../assets/images/trash.png);
        background-size: cover;
        transform: translate(0px, 5px);
    }
    .drag-helper {
        display: none;
    }



</style>