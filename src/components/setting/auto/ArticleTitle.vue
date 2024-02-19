<template>
    <div class="set_auto_box box6">
        <!-- 제목 및 저장/재평가버튼 -> 취소/저장버튼 -->
        <div class="set_title">
            <h2>기사 대/소제목</h2>
            <p>* 뷰어에 등록된 대/소제목입니다.</p>
            <div class="set_tit_btn">
                <slot v-if="edit">
                    <a @click="edit=false;onSetting()" class="btn_wh">취소</a>
                    <a @click="apply()" class="btn_na">저장</a>
                </slot>
                <slot v-else>
                    <a @click="edit=true" class="btn_gr">편집</a>
                    <a @click="reEval" class="btn_gr">재평가</a>
                </slot>
            </div>
        </div>
        <!-- 내용 -->
        <div class="set_cont">
            <div class="set_list_tb">
                <div class="set_list_th">
                    <div class="md col1-1">항목</div>
                    <div class="md col1-5" style="border-left:1px #fff solid">세부항목</div>
                    <div class="md col1-6">가치</div>
                </div>
                <ul>
                    <template v-if="titleList" v-for="(item, index) in titleList">
                        <!-- 항목명. 사용자 수정 불가. -->
                        <li class="set_list_td" :key="item.seq">
                            <div class="md col1-1">
                                <input v-if="edit" type="checkbox" :id="'tit_num'+index" @click="item.checked = !item.checked">
                                <label v-if="edit" :for="'tit_num'+index"><span></span></label>
                                {{item.value}}
                            </div>
                            <!-- 세부항목. 사용자 수정 불가 -->
                            <div class="md col1-5">
                                <span>
                                {{item.refValue}}
                                </span>
                            </div>
                            <!-- 가치항목. -->
                            <div class="md col1-6">
                                <input v-if="edit" type="number" pattern="(\d*\.?\d+)" maxlength="10" autocomplete="off" v-model="item.score">
                                <slot v-else>{{item.score}}</slot>
                            </div>
                        </li>
                    </template>
                </ul>
            </div>
        </div>
        <!-- 정렬버튼 -->
        <div class="cont_title_btn">
            <slot v-if="edit">
                <ul class="btn_left">
                    <li class="move">
                        <a @click="topClass(titleList)" class="btn_first">최상단 이동</a>
                    </li>
                    <li class="move">
                        <a @click="upClass(titleList)" class="btn_top">위로 이동</a>
                    </li>
                    <li class="move">
                        <a @click="downClass(titleList)" class="btn_bottom">아래로 이동</a>
                    </li>
                    <li class="move">
                        <a @click="bottomClass(titleList)" class="btn_last">최하단 이동</a>
                    </li>
                </ul>
            </slot>
            <slot v-else>
                <ul class="btn_right">
                    <p>*대/소제목 목록 갱신이 필요하면 데이터 동기화를 해주세요.</p>
                    <li><a @click="dataSynchronization">데이터 동기화</a></li>
                </ul>
            </slot>
        </div>
        <div class="loading" style="background-color:#ffffff45" v-if="loadingGif"><img class="loading-image" :src="require('@/assets/images/loading.gif')" alt="Loading..."/></div>
    </div>
</template>

<script>
    import {mapActions,mapState,mapMutations} from 'vuex';

    export default {
        name: 'ArticleTitle',
        data() {
            return {
                edit: false,
                titleList: []
            };
        },
        mounted() {
            this.onSetting();
        },
        computed: {...mapState(['loadingGif'])},
        methods: {
            ...mapMutations(['SET_LOADING_GIF']),
            ...mapActions(['getArticleClassTypeAPI', 'setReAutoEvaluateAPI', 'setArticleClassTypeAPI']),
            /**
             * 초기 API 요청
             **/
            async onSetting() {
                try {
                    this.titleList = await this.getArticleClassTypeAPI();
                } catch (e) {
                    console.error(e);
                }
            },
            
            /**
             * 편집 저장
             **/
            async apply() {
                alert("◇ 신규 등록된 기사부터 변경사항이 적용되어 평가됩니다.\n"
                +"◇ 기존 등록된 기사에 적용하기 위해서는 재평가가 필요합니다.");
                try {
                    let params = new FormData();
                    let list = [];
                    if (this.edit && this.titleList.length > 0) {
                        this.titleList.map(e => {
                            this.$set(list, list.length, e);
                        });
                        console.table(list);
                    }
                    params.append('evalConfigArr', JSON.stringify(list)); 
                    const result = await this.getArticleClassTypeAPI(params);
                    if (result) {
                        this.titleList = result;
                        console.table(this.titleList);
                        this.edit = false;
                    } else {
                        this.$eventBus.$emit('kickOut');
                    }
                } catch (e) {
                    console.error(e);
                }
            },
            /*
             * 데이터 동기화
             */
            async dataSynchronization(){
                try {
                    //대/소제목 목록 수정 사항 적용 API
                    await this.setArticleClassTypeAPI();

                    //db값 목록으로 가져오기
                    const a = await this.getArticleClassTypeAPI();
                    if(a) {
                        this.titleList = a;
                    } else {
                        alert("동기화 실패했습니다.");
                    }
                    alert("새로운 대/소제목이 동기화되었습니다.");
                    
                } catch (e) {
                    console.error(e);
                }
            },

            /*
             * 개별/묶음별 상단으로 한칸 이동
             */
            upClass(titleList) {
                titleList.map(oneTitle => {
                    if (oneTitle.checked) {
                        const pos = titleList.indexOf(oneTitle);
                        this.upPos(titleList, pos, pos - 1);
                    }
                });
            },
            upPos(parent, before_pos, after_pos) {
                if (parent && before_pos >= 0) {
                    if (before_pos > 0) {
                        parent.splice(after_pos, 0, parent.splice(before_pos, 1)[0]);
                    }
                }
            },
            /**
             * 개별/묶음별 하단으로 한칸 이동
             */
            downClass(titleList) {
                const tmptitleList = Object.assign([], titleList).reverse();
                tmptitleList.map(oneTitle => {
                    if (oneTitle.checked) {
                        const pos = titleList.indexOf(oneTitle);
                        this.downPos(titleList, pos, pos + 1);
                    }
                });
            },
            downPos(parent, before_pos, after_pos) {
                if (parent && before_pos >= 0) {
                    const max = parent.length - 1;
                    if (max > before_pos) {
                        parent.splice(after_pos, 0, parent.splice(before_pos, 1)[0]);
                    }
                }
            },
            /**
             * 개별/묶음별 최상단이동
             */
            topClass(titleList) {
                const tmptitleList = Object.assign([], titleList).reverse();
                tmptitleList.map(oneTitle => {
                    if (oneTitle.checked) {
                        const pos = titleList.indexOf(oneTitle);
                        this.upPos(titleList, pos, 0);
                    }
                });
            },
            /**
             * 개별/묶음별 최하단 이동
             */
            bottomClass(titleList) {
                const tmptitleList = Object.assign([], titleList);
                tmptitleList.map(oneTitle => {
                    if (oneTitle.checked) {
                        const pos = titleList.indexOf(oneTitle);
                        this.downPos(titleList, pos, titleList.length);
                    }
                });
            },
        

            async reEval() {
                const sen1 = ""
                    +"재평가 시 등록된 모든 기사의 자동평가가 다시 수행됩니다."
                    +"\n"
                    +"수동으로 평가값을 변경한 기사에 대해서도 다시 평가되며,\n재평가 후에는 복구가 불가능합니다."
                    +"\n\n"
                    +"[글자수]에 대한 재평가를 실시하시겠습니까?";
                
                const sen2 = ""
                +"다시 확인해주세요."
                +"\n\n"
                +"재평가 시 등록된 모든 기사의 자동평가가 다시 수행됩니다."
                +"\n"
                +"수동으로 평가값을 변경한 기사에 대해서도 다시 평가되며,\n재평가 후에는 복구가 불가능합니다."
                +"\n\n"
                +"[글자수]에 대한 재평가를  실시하시겠습니까?";
                if (!confirm(sen1)) return;
                if (!confirm(sen2)) return;
                alert("등록된 기사에 따라 많은 시간이 소요될 수 있습니다.\n기본적으로 수 분이 소요됩니다.\n완료 시까지 기다려 주세요.");
                this.SET_LOADING_GIF(true);
                let params = new FormData();
                params.append('evaluationSeq', 7);
                if (await this.setReAutoEvaluateAPI(params)) {
                    alert("재평가가 완료 됐습니다.");
                }
                this.SET_LOADING_GIF(false);
            }
        }
    };
</script>

<style scoped>

.md.col1-1{padding-right:240px !important;}
.md.col1-5{width:120px; right:120px;}
.md.col1-6{width:120px; right: 0;}

.cont_wrap .set_title p{margin-left:15px; font-size:11px; color:#808080; letter-spacing:-1px;}

.cont_title_btn{width: 96.7%; height:31px; border-top:1px #d9d9d9 solid; background:#fff; position:absolute; bottom:10px; font-size:12px;}
.cont_title_btn .btn_left{float:left;}
.cont_title_btn ul{ float:left; padding-top:7px;}
.cont_title_btn ul p{ float:left; padding-top:7px; font-size: 11px; color:#808080; margin-right:10px;}
.cont_title_btn ul li{float:left; padding:0 10px; height:26px; line-height:22px; font-size:12px; font-weight:bold; background:#f2f2f2; border:1px #aeaeae solid; margin:0 3px;}
.cont_title_btn ul li a{color:#333;}

.cont_title_btn .btn_right{float: right; height:24px !important;}
.cont_title_btn .btn_right a{line-height: 24px;}

.cont_title_btn .move{padding:0; border:0; width:24px; height:24px;}
.cont_title_btn .move *{width:24px; height:24px; padding:0; background:url(../../../assets/images/ico_pre.png) no-repeat; text-indent:-9999px;}
.cont_title_btn .move .btn_first{ background-position:0 -350px;}
.cont_title_btn .move .btn_top{ background-position:-30px -350px;}
.cont_title_btn .move .btn_bottom{ background-position:-60px -350px;}
.cont_title_btn .move .btn_last{ background-position:-90px -350px;}

</style>
