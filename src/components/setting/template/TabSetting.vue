<template>
    <div class="stat_tab-wrap">
<!-- =========================================================================================================== -->
<!-- =============================================== 탭 리스트 =============================================== -->
<!-- =========================================================================================================== -->
        <div class="set-object-item-wrap">
            <div class="set-object-item-box">
                <div class="set_title">
                    <h2>탭 리스트</h2>
                    <p>* 항목을 클릭하여 데이터를 수정할 수 있습니다.</p>
                    <div class="list-reset">새로고침 <div title="새로고침" @click="loadTab()"></div></div>
                </div>

                <div class="set_list_area">
                    <div class="set_subtitle">
                    > 전체 항목
                    </div>
                    <div class="item_list">
                        <div class="item_list_title">
                            <div class="header-title">탭 제목</div>
                            <div class="header-des">등록된 보고서</div>
                            <div class="tagRegDate">등록 날짜</div>
                            <div class="tagtagEtc">기타</div>
                        </div>
                        <draggable tag="div" :list="getStatSetting.tabList" group="tab-group" @change="changeOrder" :disabled="(addTabData || runModify)">
                            <template v-for="(tab, tabIdx) in getStatSetting.tabList">
                            <li :key="'tab'+tabIdx+tabRen">
                                <!-- 일반 -->
                                <div v-if="modify_reportIdx !== tabIdx" :class="[findReport(tab.skey, 'active')!==1?'deprecated-template':'']">
                                    <div title="탭 제목" :data-seq="tab.seq" type="text" @click="tabInfo($event, tab.skey)">
                                        <a :href="'#rep-'+tab.skey" class="track-down">{{tab.alias}}</a>
                                    </div>
                                    <div >
                                        <p title="등록된 보고서">{{findReport(tab.skey, 'title')}}</p>
                                    </div>

                                    <div class="tagRegDate">{{tab.value.regDate}}</div>
                                    <div class="tagEtc">
                                        <button class="btn-2d blue" :data-tabIdx="tabIdx" @click="btnModify($event)">수정</button>
                                        <button class="btn-2d red" :data-seq="tab.seq" @click="deleteTemp">삭제</button>
                                    </div>
                                </div>

                                <!-- 수정 중 -->
                                <div v-else>
                                    <input title="탭 제목" :data-seq="SINGLE_TAB.seq" type="text" v-model="SINGLE_TAB.alias">
                                    <div class="drag_area_border" @dragenter.prevent @dragover.prevent @drop.prevent="dragDrop"> 
                                        <p>{{findRep[SINGLE_TAB.skey].title}}</p>
                                        <!-- SINGLE_TAB.value.reportTitle -->
                                    </div>
                                    
                                    <div class="tagRegDate">{{SINGLE_TAB.value.regDate}}</div>
                                    <div class="tagEtc">
                                        <button :data-seq="SINGLE_TAB.seq" @click="btnModify_cancel">취소</button>
                                        <button class="btn-2d green" :data-tabIdx="tabIdx" :data-seq="SINGLE_TAB.seq" @click="saveTab">저장</button>
                                    </div>
                                </div>
                            </li>
                            </template>

                        </draggable>


                        <li v-if="addTabData"> <!-- 데이터를 추가하기 위한 태그 -->
                            <div>
                                <input title="탭 제목" :data-seq="SINGLE_TAB.seq" type="text" v-model="SINGLE_TAB.alias">
                                <div class="drag_area_border"  @dragenter.prevent @dragover.prevent @drop.prevent="dragDrop">
                                    <p class="guide" v-if="guide(SINGLE_TAB.value.reportTitle)">[보고서 리스트]에서 항목을 드래그 하세요.</p>
                                    <p v-else>{{SINGLE_TAB.value.reportTitle}}</p>
                                </div>
                                <div class="tagRegDate">{{SINGLE_TAB.value.regDate}}</div>
                                <div class="tagEtc">
                                    <button :data-seq="SINGLE_TAB.seq" @click="tabCancel">취소</button>
                                    <button class="btn-2d green" @click="saveTab">저장</button>
                                </div>
                            </div>
                        </li>
                    </div>
                    <div class="btn">
                        <button class="right-btn" @click="addTab">추가</button>
                    </div>
                </div>
            </div>
        </div>


<!-- =========================================================================================================== -->
<!-- =============================================== 보고서 리스트 =============================================== -->
<!-- =========================================================================================================== -->
        <div class="set-object-item-wrap">
            <div class="set-object-item-box">
                <div class="set_title">
                    <h2>보고서 리스트</h2>
                    <p>* 항목을 클릭하여 데이터를 수정할 수 있습니다.</p>
                    <label for="reportSearch">
                        보고서 검색하기: 
                    </label>
                    <input id="reportSearch" type="text" @input="funcReportSearch">
                </div>

                <div class="set_list_area">
                    <div class="set_subtitle">
                    > 전체 항목
                    </div>
                    <div class="item_list">
                        <div class="item_list_title">
                            <div class="tab-header-title">제목</div>
                            <div class="tab-header-des">상세설명</div>
                            <div></div>
                            <div>날짜</div>
                        </div>

                        <div class="tab-at-all-report tab-space-report">
                            <input type="checkbox" id="all-report" @change="scrollContr"/>
                            <label for="all-report">전체 보고서 리스트<em></em></label>
                            <ul>
                                <template v-for="(tabReport, tabReportIdx) in reportList">
                                <li v-if="tabReport.active != 0" :key="'tab-report'+tabReportIdx+tabRen">
                                    <div>
                                        <div class="item_title short" :id="'rep-'+tabReport.seq" title="보고서 정보 상세보기" :data-seq="tabReport.seq" 
                                            draggable="true" @dragstart="dragStart($event, tabReport)">{{tabReport.title}}</div>
                                        <div class="item_description short"><span>{{tabReport.description}}</span></div>
                                        <div class="item_more">
                                            <div v-if="isThereMoreWriting(tabReport.title, tabReport.description)"
                                            class="rollup" @click="textView" data-nextAction="rolldown"></div>
                                        </div>
                                        <div>{{printDate(tabReport.regDate, tabReport.updDate)}}</div>
                                    </div>
                                </li>
                                </template>
                            </ul>
                        </div> <!-- .tab-at-all-report -->

                        <div class="search-result tab-space-report">
                            <input type="checkbox" id="search-report" @change="scrollContr"/>
                            <label for="search-report">검색 보고서 리스트<em></em></label>
                            <ul>
                                <template v-for="(tabReport, tabReportIdx) in searchReportList">
                                <li v-if="tabReport.active != 0" :key="'tab-search-report'+tabReportIdx+tabRen">
                                    <div>
                                        <div class="item_title short" title="보고서 정보 상세보기" :data-seq="tabReport.seq" 
                                            draggable="true" @dragstart="dragStart($event, tabReport)">{{tabReport.title}}</div>
                                        <div class="item_description short"><span>{{tabReport.description}}</span></div>
                                        <div class="item_more">
                                            <div v-if="isThereMoreWriting(tabReport.title, tabReport.description)"
                                            class="rollup" @click="textView" data-nextAction="rolldown"></div>
                                        </div>
                                        <div>{{printDate(tabReport.regDate, tabReport.updDate)}}</div>
                                    </div>
                                </li>
                                </template>
                            </ul>
                        </div> <!-- .search-result -->
                        
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {mapGetters} from 'vuex';
import draggable from "vuedraggable";
export default {
    components: { draggable },
    name: "TabSetting",
    data() {
        return {
            SINGLE_TAB:[]
            ,tabList: []
            ,reportList: []
            ,searchReportList: []
            ,findRep: {}
            ,tabRen : 0
            ,addTabData: false
            ,reSearch: ''
            ,dragEvent: {
                seq: null
                ,title: null
            }
            ,initTimer: null
            ,runModify: false
            ,modify_reportIdx: null

            ,currentFocus: null
            ,beforeFocus: null
            ,currentHl: null
            ,beforeHl: null

            ,lastTKEY: 0 // 마지막 인덱스를 변수에 넣을 일이 없다면 삭제
        }
    },

    computed: {
        ...mapGetters(['getStatSetting', 'getDate']),
    },
    watch: {
        reportList: function(value) {
            let input = document.getElementById('reportSearch');
            if (input) this.funcReportSearch(input);
        }
    },
    methods: {

        tabRendering() {
            this.tabRen = (this.tabRen > 100) ? 0 : this.tabRen + 1;
        },

        findReport(skey, key) {
            if (!this.findRep || !this.findRep[skey]) return false;
            return this.findRep[skey][key];
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
            const t = document.querySelector('.tab-header-title');
            const d = document.querySelector('.tab-header-des');
            if (!t || !d) return;
            return this.checkTagSize(t.offsetWidth, title) || this.checkTagSize(d.offsetWidth, des);
        },

        printDate(...date) {
            // date[0] = 등록날짜, date[1] = 수정날짜
            if (date[1] === null || date[1] === undefined) {
                return String(date[0].slice(0, 10));
            } 
            return String(date[1].slice(0, 10));
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

        scrollContr() { 
            if (!document.getElementById('all-report').checked) {
                const tags = document.querySelectorAll('label[for="all-report"] + ul > li > div');
                tags.forEach(tag => {
                    tag.className = '';
                });
                this.beforeHl = null;
            }
        },

        dragStart(event, report) { 
            this.dragEvent.seq = report.seq;
            this.dragEvent.title = report.title;
        },

        dragDrop() { // [등록된 보고서] 세팅하기
            if (this.SINGLE_TAB) {
                this.SINGLE_TAB.skey = this.dragEvent.seq; // report 시퀀스 세팅
                this.SINGLE_TAB.value.reportTitle = this.dragEvent.title; // report 제목 세팅
                this.SINGLE_TAB.alias = this.dragEvent.title;
            }
        },

        funcReportSearch(event) {
            const that = this;
            if (event) this.reSearch = !event.target ? event.value : event.target.value;
            else this.reSearch= null;
            if (this.reSearch == '') this.reSearch= null;
            this.searchReportList = [];
            
            document.getElementById('search-report').checked = true;
            this.searchReportList = this.reportList
                                .filter(e => e.title.includes(that.reSearch));
        },

        tabListRendering() {
            if (this.tabRen === 100) this.tabRen = 0;
            else this.tabRen++;
        },
        
        
        setSINGLE_TAB(_seq, _skey, _order) {
            const day = this.getDate.strDate;
            this.SINGLE_TAB = {
                seq: _seq
                ,skey: _skey
                ,tkey: _order
                ,value: { // (=config 잡다한 정보가 들어감 reportTitle, reDate)
                    reportTitle: ''
                    ,regDate: day
                } 
                ,alias: '새 탭' //(=title)
            };
        },

        addTab(e) {
            this.modify_reportIdx = null;
            this.runModify = false;
            this.setSINGLE_TAB(
                null,
                null,
                (this.getStatSetting.tabList.length + 1)
            );
            this.addTabData = true;
            this.tabListRendering();
        },

        tabCancel() {
            this.SINGLE_TAB = {};
            this.modify_reportIdx = null;
            this.runModify = false;
            this.addTabData = false;
            this.tabListRendering();
        },

        
        btnModify(e) {
            this.SINGLE_TAB = {};
            this.modify_reportIdx = null;
            let parentDiv =  document.querySelector('.highlight');
            if (parentDiv) {
                parentDiv.className = ''; // 하이라이트 지우기
                this.currentFocus = null;
                this.beforeFocus = null;
            }


            const _tabIdx = parseInt(e.target.getAttribute('data-tabIdx'));
            this.SINGLE_TAB = JSON.parse(
                JSON.stringify(
                    this.getStatSetting.tabList[_tabIdx]
                )
            );
            if (this.SINGLE_TAB.seq === undefined) return;

            this.modify_reportIdx = _tabIdx;
            this.runModify = true;
            this.addTabData = false;
        },

        btnModify_cancel() {
            this.SINGLE_TAB = {};
            this.modify_reportIdx = null;
            this.runModify = false;
        },

        changeOrder(e) {
            this.getStatSetting.tabList.
                forEach((el, tli) => { el.tkey = (tli+1); });
            this.saveTabOrderInfo();
        },


        /**
         * @description :
         *    탭 리스트 불러오기
         */
        async loadTab() {
            this.getStatSetting.tabList =
                await this.$statConfig.funcLoadRecode("list", 'tab');
        }, // loadTab

        async loadReport() {
            this.reportList = []; 
            this.findRep = {};
            this.reportList = await this.$statConfig.funcLoadRecode("list",'report');
            for(let rep of this.reportList) {
                this.findRep[rep.seq] = rep;
            }
        }, // loadReport

        /**
         * @description : 탭 삭제
         */
        async deleteTemp(e) {
            if (confirm("탭을 삭제하시겠습니까?")) {
                const _seq = parseInt(e.target.getAttribute('data-seq'));
                await this.setSINGLE_TAB(_seq, 0, 0);
                await this.$statConfig.funcDeleteRecode('tab', this.SINGLE_TAB);
                await this.loadTab(); // 데이터를 로드하는 곳에서 탭-리스트 재세팅이 이루어진다.
                this.SINGLE_TAB = {};
                this.modify_reportIdx = null;
                this.runModify = false;
                this.addTabData = false;
                this.tabListRendering();
            }
        }, // deleteTemp


        async saveTab() {
            if (!this.SINGLE_TAB.alias.trim().length) { alert('제목에 공백만 들어갈 수 없습니다.'); return; }
            if (this.SINGLE_TAB.alias.length > 20) { alert('탭 제목은 20글자 이상 쓸 수 없습니다.'); return; }
            if (this.SINGLE_TAB.skey == null) { alert('보고서를 "드래그"하여 등록해 주십시오.'); return; }

            if ((this.addTabData || this.runModify) && confirm("저장 또는 수정을 하시겠습니까?")) {
                // null -> create
                if (this.SINGLE_TAB.seq === null) await this.$statConfig.funcCreateRecode('tab',this.SINGLE_TAB);
                else { 
                    await this.$statConfig.funcModifyRecode('tab', this.SINGLE_TAB); 
                    this.modify_reportIdx = null;
                }
                await this.loadTab(); // 데이터를 로드하는 곳에서 레포트 재세팅이 이루어진다.
                this.addTabData = false;
                this.runModify = false;
                this.tabRendering();
            }
        },

        /**
         * @description :
         *  템플릿 사용/비사용을 컨트롤 한다.
         */
        contrActivity(act, div) {
            if (div === 'list') this.getStatSetting.reportTabActivity = act;
            else this.getStatSetting.crossTabActivity = act;
        },


        async funcOrderModification(arr) {
            await this.$statConfig.funcJSONRequest(
                "/update.menutab"
                , arr
                , "tab-order"
                , false
            );
        },


        tabInfo(e, skey) {
            if (this.findRep[skey].active==0) return;
            document.getElementById('all-report').checked = true;

            this.currentFocus = e.target.parentElement.parentElement;
            if (this.beforeFocus !== this.currentFocus) {
                this.currentFocus.className = "highlight";
                if (this.beforeFocus !== null) this.beforeFocus.className = "";
                this.beforeFocus = this.currentFocus;
            }

            const reportListId = (e.target.getAttribute('href')).slice(1);
            const ex = document.getElementById(reportListId);
            if (!ex) return;
            const DIV = ex.parentElement;
            if (DIV !== null) {
                this.currentHl = DIV;
                if (this.beforeHl !== this.currentHl) {
                    DIV.className = 'blink';
                    if (this.beforeHl !== null) this.beforeHl.className = "";
                    this.beforeHl = this.currentHl;
                }
                
            }
        },

        async saveTabOrderInfo() {
            let tabArr = [];
            const len = this.getStatSetting.tabList.length;
            for (let ti = 0; ti < len; ti++) {
                let _s = this.getStatSetting.tabList[ti].seq;
                let _t = this.getStatSetting.tabList[ti].tkey;
                tabArr.push({
                    seq: _s
                    ,tkey: _t
                });
            }
            await this.funcOrderModification(tabArr);
        },

        guide(str) {
            if (str === "" || str === null || str === undefined) {
                return true;
            }
            return false;
        },


    } // methods

}
</script>

<style scoped>
    .stat_tab-wrap {
        display: flex;
        flex-direction: row;
    }
    .set-object-item-wrap {
        width: 50%;
        height: calc(100vh - 170px);
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
        flex: 1;
    }

    label[for="reportSearch"] {
        font-size: 13px;
        font-weight: 900;
    }
    #reportSearch {
        margin: 0px 0px 0px 10px;
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
        padding: 15px 20px 15px 20px;
    }
    .item_list::-webkit-scrollbar { width: 5px; }
    .item_list::-webkit-scrollbar-thumb {background-color: rgba(58, 50, 50, 0.5); border-radius: 20px;}


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
    .item_list div.item_list_title > div { font-size: 13px; font-weight: bolder; }
    .item_list div.item_list_title > div:nth-child(1) { width: 40%; }
    .item_list div.item_list_title > div:nth-child(2) { width: 34%; }
    .item_list div.item_list_title > div:nth-child(3):not(.tagRegDate) { width: 10%; }
    .item_list div.item_list_title > div:nth-child(4):not(.tagtagEtc) { width: 15%; }
    .item_list li {
        list-style: none;
        border-bottom: 1px solid #b1b1b1;
        margin: 5px 0px 5px 0px;
        padding: 0px 0px 0px 0px;
    }
    .item_list li > div {
        display: flex;
        flex-direction: row;
        line-height: 33px;
        margin: 0px 0px 5px 0px;
    }
    .item_list li > div > div:nth-child(1) { width: 39.5%; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
    .item_list li > div > div:nth-child(2) { width: 35%;}
    .item_list li > div > div:nth-child(2) > p { width: 100%; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 5px;}
    .item_list li > div > div:nth-child(3):not(.tagRegDate) { width: 10%; }/**/
    .item_list li > div > div:nth-child(3) > div.upNdown { 
        width: 26px; height: 26px; background: url(../../../assets/images/ico_pre.png) 3px -283px no-repeat; margin: 4px 0px 0px 0px;}/**/
    .item_list li > div > div:nth-child(4):not(.tagtagEtc) { width: 12%; display: flex; padding: 0px 0px 0px 0px; }
    .item_list li > div > div:nth-child(4) > a { width: 40px; height: 24px; text-align: center; line-height: 24px; margin: 1px 0px 0px 5px;}
    .item_list li > div > div:nth-child(4) > a.act { border: 1px solid #3678b3; background: #5ca5e6; font-size: 12px; font-weight: 700; color:#fff; }
    .item_list li > div > div:nth-child(4) > a.inact { border: 1px solid #ccc; background: #f2f2f2; font-size: 12px; font-weight: 700; color:#000000}

    .item_list li > div > input:nth-child(1) { width: 300px; margin: 0px 26px 0px 0px; }
    .item_list li > div > input:nth-child(2) { width: 300px; }

    .drag_area_border { border: 1px solid #000000; }
    .tagRegDate { width: 11%; margin: 0px 0px 0px 15px; }
    .tagEtc { margin: 0px 0px 0px 0px; }
    .tagEtc > button { width: 45%; margin: 0px 5px 0px 0px; }



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
        margin: 10px 0px 0px 0px;
        line-height: 22px;
        font-size: 12px;
        font-weight: 700;
        background: #f2f2f2;
        border: 1px solid #aeaeae;
    }

    .dragArea {
        width: 20px;
        height: 20px;
        margin: 5px 0px 0px 5px;
        padding: 0px 0px 0px 0px;
        background: url(../../../assets/images/up-down.png);
        background-size: cover;
        transform: translate(0%, 10%);
    }

    
</style>