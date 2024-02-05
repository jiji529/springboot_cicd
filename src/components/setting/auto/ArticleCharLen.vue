<template>
  <div class="set_auto_box">
    <div class="set_title">
      <h2>기사 글자수</h2>
      <p>* 기사정보의 기사 글자수의 항목명과 크기 단위를 설정할 수 있습니다.</p>
      <div class="set_tit_btn">
        <slot v-if="edit">
          <a @click="edit=false;onSetting()" class="btn_wh">취소</a>
          <a @click="apply()" class="btn_na">저장</a>
        </slot>
        <slot v-else>
          <a v-show="!add" @click="edit=true" class="btn_gr">편집</a>
          <a @click="reEval" class="btn_gr">재평가</a>
        </slot>
      </div>
    </div>
    <!-- s: set_cont -->
    <div class="set_cont">
      <!-- s: set_list_tb -->
      <div class="set_list_tb">
        <div class="set_list_th">
          <div class="md col1-1">항목</div>
          <div class="md col1-2">세부항목</div>
          <div class="md col1-3">가치</div>
          <div class="md col1-4">상태</div>
        </div>
        <ul>
          <template v-if="evalList" v-for="(item, index) in evalList">
            <li class="set_list_td" :key="index">
              <div class="md col1-1" :class="{'conceal':item.isUse ==='N'}">
                <input v-if="edit" type="text"
                       v-model="item.value"
                       autocomplete="off"
                       placeholder="항목명 입력"
                       name="value">
                <slot v-else>{{item.value}}</slot>
              </div>
              <div class="md col1-2" :class="{'conceal':item.isUse ==='N'}">
                <span>
                  <input v-if="edit"
                         type="number"
                         pattern="(\d*\.?\d+)"
                         maxlength="10"
                         autocomplete="off"
                         v-model="item.refValue">
                  <slot v-else>{{item.refValue}}</slot>
              </span>자 이상
              </div>
              <div class="md col1-3" :class="{'conceal':item.isUse ==='N'}">
                <input v-if="edit" type="number" v-model="item.score">
                <slot v-else>{{item.score}}</slot>
              </div>
              <div class="md col1-4">
                <slot v-if="edit">
                  <a class="btn" :class="{'btn_bl':item.isUse==='Y','btn_gr':item.isUse!=='Y'}" @click="item.isUse='Y'">사용</a>
                  <a class="btn" :class="{'btn_bl':item.isUse==='N','btn_gr':item.isUse!=='N'}" @click="item.isUse='N'">비사용</a>
                </slot>
                <slot v-else><span :class="{'conceal':item.isUse ==='N'}">{{getUseLabel(item.isUse)}}</span></slot>
              </div>
            </li>
          </template>
          <template v-show="addList.length>0" v-for="(item, index) in addList">
            <li class="set_list_td" :key="'a'+index">
              <div class="md col1-1">
                <input type="text"
                       v-model="item.value"
                       autocomplete="off"
                       placeholder="항목명 입력"
                       name="value">
              </div>
              <div class="md col1-2">
                <span>
                  <input
                      type="number"
                      pattern="(\d*\.?\d+)"
                      maxlength="10"
                      autocomplete="off"
                      v-model="item.refValue">
              </span>자 이상
              </div>
              <div class="md col1-3">
                <input type="number" v-model="item.score">
              </div>
              <div class="md col1-4">
                <div class="btn" :class="{'btn_bl':item.isUse==='Y','btn_gr':item.isUse!=='Y'}"><a
                    @click="reporter.isUse='Y'">사용</a></div>
                <div class="btn" :class="{'btn_bl':item.isUse==='N','btn_gr':item.isUse!=='N'}"><a
                    @click="reporter.isUse='N'">비사용</a></div>
                <div class="btn btn_wh"><a
                    @click="deleteItem(addList,index)">취소</a>
                </div>
                <div class="btn btn_na" v-if="!edit"><a @click="apply">저장</a></div>
              </div>
            </li>
          </template>
        </ul>
      </div>
      <!-- e: set_list_tb -->
    </div>
    <!-- e: set_cont -->
    <div v-show="!edit" class="set_list_tf"><a @click="insertCategory">+ 항목추가</a></div>
    <div class="loading" style="background-color:#ffffff45" v-if="loadingGif"><img class="loading-image" :src="require('@/assets/images/loading.gif')" alt="Loading..."/></div>
  </div>
</template>

<script>
  /* eslint-disable no-console */

  import {mapActions,mapState,mapMutations} from 'vuex';

  export default {
    name: 'ArticleCharLen',
    data() {
      return {
        edit: false,
        add: false,
        evalList: [],
        addList: []
      };
    },
    mounted() {
      this.onSetting();
    },
    computed: {...mapState(['loadingGif'])},
    methods: {
      ...mapMutations(['SET_LOADING_GIF']),
      ...mapActions(['getArticleCharLenAPI','setReAutoEvaluateAPI']),
      /**
       * 초기 API 요청
       **/
      async onSetting() {
        this.addList = [];
        try {
          this.evalList = await this.getArticleCharLenAPI();
        } catch (e) {
          console.error(e);
        }
      },
      deleteItem(addList, index) {
				this.$delete(addList, index);
				this.add = false;
			},
      /**
       * 편집 저장
       **/
      async apply() {
        alert("◇ 신규 등록된 기사부터 변경사항이 적용되어 평가됩니다.\n"
          +"◇ 기존 등록된 기사에 적용하기 위해서는 재평가가 필요합니다.");
        try {
          if (!this.validationEval()) {
            let params = new FormData();
            let list = [];
            if (this.addList.length > 0) {
              this.addList.map(a => {
                this.$set(list, list.length, a);
              });
              //this.$delete(this.addList, 0);
            }
            if (this.edit && this.evalList.length > 0) {
              this.evalList.map(e => {
                this.$set(list, list.length, e);
              });
            }
            params.append('q', JSON.stringify(list)); 
            const result = await this.getArticleCharLenAPI(params);
            if (result) {
              this.evalList = result;
              this.addList = [];
              this.edit = false;
              this.add = false;
            } else {
              this.$eventBus.$emit('kickOut');
            }
          } else {
            alert('항목명을 입력하세요.');
            const node = this.$el.querySelectorAll('[name=\'value\']');
            for (let i = 0; i < node.length; i++) {
              if (node[i].value.trim() === '') {
                node[i].focus();
                break;
              }
            }
          }
        } catch (e) {
          console.error(e);
        }
      },
      /**
       * 편집시 공백 체크
       **/
      validationEval() {
        if (this.addList.length > 0) {
          return (this.addList[0].value.trim() === '');
        } else {
          if (this.evalList.length > 0) {
            return this.evalList.some((ev) => {
              if (ev.value.trim() === '') {
                return true;
              }
            });
          } else {
            return false;
          }
        }
      },

      /**
       * 매체구분 상태 라벨
       */
      getUseLabel(isUse) {
        if (isUse === 'N') {
          return '미사용';
        } else {
          return '사용';
        }
        /**
         * 매체구분 가중치 라벨
         */
      },
      insertCategory() {
        this.add = !this.add;
        if(this.edit === false) {
          if (this.addList.length > 0) {
            this.$delete(this.addList, 0);
            return;
          }
        }

        const newLine = {
          isUse: 'Y',
          refValue: '',
          score: '1',
          seq: '',
          value: ''
        };
        this.$set(this.addList, this.addList.length, newLine);
        this.$nextTick(()=>{
          const node = this.$el.querySelectorAll('[name=\'value\']');
          for (let i = 0; i < node.length; i++) {
            if (node[i].value.trim() === '') {
              node[i].focus();
              break;
            }
          }
        })
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
        params.append('evaluationSeq', 2);
        if (await this.setReAutoEvaluateAPI(params)) {
          alert("재평가가 완료 됐습니다.");
        }
        this.SET_LOADING_GIF(false);
      }
    }
  };
</script>

<style scoped>

</style>
