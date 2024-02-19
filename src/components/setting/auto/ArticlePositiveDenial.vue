<template>
    <div class="set_auto_box box6">
        <div class="set_title">
            <h2>기사 호감도</h2>
            <p>* 긍/부정에서 중립의 최소기준은 변경할 수 없습니다.</p>
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
        <div class="set_cont">
            <div class="set_list_tb">
                <div class="set_list_th">
                    <div class="md col1-1">항목</div>
                    <div class="md col1-5">최소기준</div>
                    <div class="md col1-6">가치</div>
                </div>
                <ul>
                    <template v-if="evalList" v-for="(item, index) in evalList">
                        <li class="set_list_td" :key="index">
                            <!-- 항목 명 -->
                            <div class="md col1-1">
                                {{item.value}}
                            </div>

                            <!-- 최소기준 input 창 -->
                            <div class="md col1-5">
                                <template v-if="item.seq=='42'">
                                    {{item.refValue}}
                                </template>
                                <template v-else>
                                    <input v-if="edit"
                                        type="number"
                                        pattern="(\d*\.?\d+)"
                                        maxlength="10"
                                        autocomplete="off"
                                        v-model="item.refValue">
                                    <slot v-else>{{item.refValue}}</slot>
                                </template>
                            </div>

                            <!-- 가치 input 창 -->
                            <div class="md col1-6">
                                <input v-if="edit" type="number" v-model="item.score">
                                <slot v-else>{{item.score}}</slot>
                            </div>
                        </li>
                    </template>
                </ul>
            </div>
            <div class="set_description_box">
                <h2>최소기준이 0, 0, 0 이면 가장 큰 값으로 긍/부정 결과가 배치됩니다.</h2>
                <p>*긍정 결과 : 긍정 비율이 제일 크고 긍정 최소기준을 넘는 경우.
                    <br>단, 긍정 비율이 제일 높아도 긍정 최소기준을 넘지 않는다면 
                    <br>자동 평가가 적용되지 않습니다.</p>
                <p>*중립 결과 : 중립 비율이 제일 높은 경우.</p>
                <p>*긍정 결과 : 부정 비율이 제일 크고 부정 최소기준을 넘는 경우.
                    <br>단, 부정 비율이 제일 높아도 부정 최소기준을 넘지 않는다면 
                    <br>자동 평가가 적용되지 않습니다.</p>
            </div>
        </div>
        <!-- <div class="loading" style="background-color:#ffffff45" v-if="loadingGif"><img class="loading-image" :src="require('@/assets/images/loading.gif')" alt="Loading..."/></div> -->
    </div>
</template>

<script>
import {mapActions,mapState,mapMutations} from 'vuex';

export default {
    name: 'ArticlePositiveDenial',
    data() {
        return {
            edit: false,
            evalList: [],
            description: [40, 42, 45]
        };
    },

    mounted() {
        this.onSetting();
    },

    computed: {...mapState(['loadingGif'])},
    methods: {
        ...mapMutations(['SET_LOADING_GIF']),
        ...mapActions(['getArticlePositiveDenialAPI','setReAutoEvaluateAPI']),
        /**
         * 초기 API 요청
         **/
        async onSetting() {
            try {
                this.evalList = await this.getArticlePositiveDenialAPI();
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
                if (this.edit && this.evalList.length > 0) {
                    this.evalList.map(e => {
                        this.$set(list, list.length, e);
                    });
                }
                params.append('evalConfigArr', JSON.stringify(list)); 
                const result = await this.getArticlePositiveDenialAPI(params);
                if (result) {
                    this.evalList = result;
                    this.edit = false;
                } else {
                    this.$eventBus.$emit('kickOut');
                }
            } catch (e) {
            console.error(e);
            }
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
            params.append('evaluationSeq', 6);
            if (await this.setReAutoEvaluateAPI(params)) {
            alert("재평가가 완료 됐습니다.");
            }
            this.SET_LOADING_GIF(false);
        }
    }
};
</script>

<style scoped>

.cont_wrap .set_box_area .set_auto_box.box6 .set_cont{height: calc(100% - 30px) !important;}

.md.col1-1{padding-right:240px !important;}
.md.col1-5{width:120px; right:120px; border-left: 1px #fff solid;}
.md.col1-6{width:120px; right: 0;}

.cont_wrap .set_description_box{float:left; width:100%; height: 195px; border:1px #999 solid; margin-top:12px; position:relative; padding:10px;}

.set_description_box h2{width: 100%; font-size: 14px; color: #477acc; margin-bottom: 10px;}
.set_description_box p{font-size:14px; font-weight: bold; color: #808080; margin-bottom: 10px; padding-left: 80px; text-indent: -80px;}

</style>
