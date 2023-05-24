<template>
  <div class="set_auto_box">
    <div class="set_title">
      <h2>기사 크기</h2>
      <p>* 기사정보의 기사 크기의 항목명과 크기 단위를 설정할 수 있습니다.</p>
      <div class="set_tit_btn">
        <slot v-if="edit">
          <a @click="edit=false;onSetting()" class="btn_wh">취소</a>
          <a @click="apply()" class="btn_na">저장</a>
        </slot>
        <slot v-else>
          <a @click="edit=true" class="btn_gr">편집</a>
        </slot>
      </div>
    </div>
    <!-- s: set_cont -->
    <div class="set_cont">
      <dl class="set_report_val" style="margin-bottom:24px">
				<div>
  				<dt>온라인 기사</dt>
  				<dd>
            <slot v-if="edit">
              <select v-model="evalAutoSizeInvalid">
                <option value="0">자동산정</option>
                <option v-for="ev in evalList" :key="String(ev.seq)" :value="ev.seq" v-if="ev.isUse == 'Y'">{{ev.value}}</option>
              </select>
            </slot>
            <slot v-else>{{showName}}</slot>
  				</dd>
          <dd style="width:50%"><p>* 자동산정은 글자수를 기준으로 합니다.</p></dd>
				</div>
			</dl>
      <!-- s: set_list_tb -->
      <div class="set_list_tb">
        <div class="set_list_th">
          <div class="md col1-1">항목</div>
          <div class="md col1-2">세부항목</div>
          <div class="md col1-3">가치</div>
          <div class="md col1-4">상태</div>
        </div>
        <ul>
          <template v-if="evalList.length>0" v-for="(item, index) in evalList">
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
              </span>cm² 이상
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
          <template v-if="addList.length>0" v-for="(item, index) in addList">
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
              </span>cm² 이상
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
                    @click="$delete(addList,index);">취소</a>
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
    <div class="set_list_tf"><a @click="insertCategory">+ 항목추가</a></div>
  </div>
</template>

<script>
  /* eslint-disable no-console */

  import {mapActions} from 'vuex';

  export default {
    name: 'ArticleSize',
    data() {
      return {
        edit: false, //  편집 여부
        evalList: [],
        addList: [],
        evalAutoSizeInvalid: 16
      };
    },
    mounted() {
      this.onSetting();
    },
    computed: {
      showName: function () {
        let rtn = '자동산정';
        for (let [k,v] of Object.entries(this.evalList)) {
          if (Number(v.seq) === Number(this.evalAutoSizeInvalid)) {
            rtn = v.value;
          }
        }
        return rtn;
      }
    },

    methods: {
      ...mapActions(['getArticleSizeAPI', 'getMediaPolicyAPI']),
      /**
       * 초기 API 요청
       **/
      async onSetting() {
        this.addList = [];
        try {
          this.evalList = await this.getArticleSizeAPI();
          let params = new FormData();
          params.append('m', 'o');
          const result = await this.getMediaPolicyAPI(params);
          if (result && result.success && result.final) {
            let rtn = 0;
            for (let [k,v] of Object.entries(this.evalList)) {
              if (Number(v.seq) === Number(result.final)) {
                rtn = result.final; break;
              }
            }
            this.evalAutoSizeInvalid = rtn;
          }
        } catch (e) {
          console.error(e);
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
      /**
       * 항목 추가 이벤트
       */
      insertCategory() {
        //this.edit = true;
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
      /**
       * 편집 항목 저장
       **/
      async apply() {
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
            const resultSize = await this.getArticleSizeAPI(params);
            if (resultSize) {
              this.evalList = resultSize;
              this.addList = [];
              this.edit = false;

              let params2 = new FormData();
              params2.append('m', 'o');
              params2.append('q', this.evalAutoSizeInvalid);
              const result = await this.getMediaPolicyAPI(params2);
              if (result && result.success && result.final) {
                let rtn = 0;
                for (let [k,v] of Object.entries(this.evalList)) {
                  if (Number(v.seq) === Number(result.final)) {
                    rtn = result.final; break;
                  }
                }
                this.evalAutoSizeInvalid = rtn;
              }
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
       * 편집 저장시 공백 체크
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
            return true;
          }
        }
      }
    }
  };
</script>

<style scoped>

</style>
