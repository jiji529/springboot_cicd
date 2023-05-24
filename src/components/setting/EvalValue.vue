<template>
  <div>
    <div class="cont_wrap">
      <div class="set_box_area">
        <div class="set_auto_box box4" style="height:auto;margin-top:15px">
          <div class="set_title">
            <h2>평가항목</h2>
            <p>평가 항목(자동평가, 수동평가1/2)의 병합 방법입니다.</p>
            <div class="set_tit_btn">
              <slot v-if="edit1">
                <a @click="edit1=false;onSetting()" class="btn_wh">취소</a>
                <a @click="applyPolicy(true)" class="btn_na">저장</a>
              </slot>
              <slot v-else>
                <a @click="edit1=true" class="btn_gr">편집</a>
              </slot>
            </div>
          </div>
          <div class="set_cont">
            <dl class="set_report_val">
              <div>
                <dt>누적 방법</dt>
                <dd>
                  <ul v-if="edit1">
                    <li v-for="(item,key) in evalItemPolicyList">
                      <input type="radio" :id="'plc'+key" v-model="evalItemPolicy" :value="key" />
                      <label :for="'plc'+key" :title="item.long">
                        <span></span>{{item.short}}
                      </label>
                    </li>
                  </ul>
                  <slot v-else-if="evalItemPolicyList[evalItemPolicy]">
                    {{evalItemPolicyList[evalItemPolicy].short}}
                  </slot>
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <div class="set_auto_box box4" style="height:auto">
          <div class="set_title">
            <h2>기사면적/비율</h2>
            <p>계산된 기사가치에 크기(수치/비율) 정보를 반영합니다.</p>
            <div class="set_tit_btn">
              <slot v-if="edit2">
                <a @click="edit2=false;onSetting()" class="btn_wh">취소</a>
                <a @click="applyPolicyArea(true)" class="btn_na">저장</a>
              </slot>
              <slot v-else>
                <a @click="edit2=true" class="btn_gr">편집</a>
              </slot>
            </div>
          </div>
          <div class="set_cont">
            <dl class="set_report_val">
              <div>
                <dt>기사 면적(㎠)</dt>
                <dd>
                  <ul v-if="edit2">
                    <li><input type="radio" id="evPDY" v-model.lazy="evalItemPolicySize" value="Y"><label for="evPDY"><span></span>반영</label></li>
                    <li><input type="radio" id="evPDN" v-model.lazy="evalItemPolicySize" value="N"><label for="evPDN"><span></span>미반영</label></li>
                  </ul>
                  <slot v-else>{{ evalItemPolicySize === 'Y' ? '반영' : '미반영' }}</slot>
                </dd>
              </div>
            </dl>
            <dl class="set_report_val">
              <dt>기사 비율(%)</dt>
              <dd>
                <ul v-if="edit2">
                  <li><input type="radio" id="evPRY" v-model.lazy="evalItemPolicyRatio" value="Y"><label for="evPRY"><span></span>반영</label></li>
                  <li><input type="radio" id="evPRN" v-model.lazy="evalItemPolicyRatio" value="N"><label for="evPRN"><span></span>미반영</label></li>
                </ul>
                <slot v-else>{{ evalItemPolicyRatio === 'Y' ? '반영' : '미반영' }}</slot>
              </dd>
            </dl>
            <dl class="set_report_val surplus" :class="{'conceal':evalItemPolicySize !== 'Y'}">
              <dt>온라인도 면적 반영</dt>
              <dd>
                <ul v-if="edit2">
                  <li><input type="radio" id="evSOY" v-model.lazy="evalItemPolicySizeOnline" value="Y"><label for="evSOY"><span></span>반영</label></li>
                  <li><input type="radio" id="evSON" v-model.lazy="evalItemPolicySizeOnline" value="N"><label for="evSON"><span></span>미반영</label></li>
                </ul>
                <slot v-else>{{ evalItemPolicySizeOnline === 'Y' ? '반영' : '미반영' }}</slot>
              </dd>
            </dl>
            <dl class="set_report_val surplus" :class="{'conceal':evalItemPolicyRatio !== 'Y'}">
              <dt>온라인도 비율 반영</dt>
              <dd>
                <ul v-if="edit2">
                  <li><input type="radio" id="evROY" v-model.lazy="evalItemPolicyRatioOnline" value="Y"><label for="evROY"><span></span>반영</label></li>
                  <li><input type="radio" id="evRON" v-model.lazy="evalItemPolicyRatioOnline" value="N"><label for="evRON"><span></span>미반영</label></li>
                </ul>
                <slot v-else>{{ evalItemPolicyRatioOnline === 'Y' ? '반영' : '미반영' }}</slot>
              </dd>
            </dl>
          </div>
        </div>
        <div class="set_auto_box box4" style="height:auto">
          <div class="set_title">
            <h2>가치보정계수</h2>
            <p>가치 환산시 보정 계수(float)를 반영합니다.</p>
            <div class="set_tit_btn">
              <slot v-if="edit4">
                <a @click="edit4=false;onSetting()" class="btn_wh">취소</a>
                <a @click="applyPolicyCorrection(true)" class="btn_na">저장</a>
              </slot>
              <slot v-else>
                <a @click="edit4=true" class="btn_gr">편집</a>
              </slot>
            </div>
          </div>
          <div class="set_cont">
            <dl class="set_report_val">
              <div>
                <dt>가치 보정 계수</dt>
                <dd>
                  <ul v-if="edit4">
                    <li><input type="text" id="evCV" v-model.lazy="evalItemPolicyCorrection"><label for="evCV"><span></span></label></li>
                  </ul>
                  <slot v-else>x {{evalItemPolicyCorrection}}</slot>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      <div class="set_box_area">
        <div class="set_val_box">
          <div class="set_title">
            <h2>가치 산정 평가 요소</h2>
            <p>기사 가치산정 시 체크된 평가항목만 사용합니다.</p>
            <div class="set_tit_btn">
              <slot v-if="edit3">
                <a @click="edit3=false;onSetting()" class="btn_wh">취소</a>
                <a @click="applyPolicyList(true)" class="btn_na">저장</a>
              </slot>
              <slot v-else>
                <a @click="edit3=true" class="btn_gr">편집</a>
              </slot>
            </div>
          </div>
          <div class="set_cont">
            <div class="set_list_area">
              <div class="set_list_box box1">
                <ul>
                  <li v-for="(largeitem, largekey) in evalItemPolicySetList">
                    <div class="set_li">
                      <span class="item_tit">{{largeitem.alias}}</span>
                    </div>
                    <dl v-if="largeitem.item!==null" v-for="(smallitem, smallkey) in largeitem.item">
                      <dt>
                        <div class="set_li">
                          <span class="item_tit" :class="{'conceal':!smallitem.isEval}">{{smallitem.name}}</span>
                          <span class="item_rt">
                              <slot v-if="edit3">
                                <a class="btn" :class="{'btn_bl':smallitem.isEval,'btn_gr':smallitem.isEval}" @click="smallitem.isEval=true">사용</a>
                                <a class="btn" :class="{'btn_bl':!smallitem.isEval,'btn_gr':smallitem.isEval}" @click="smallitem.isEval=false">비사용</a>
                                &nbsp;<!--
                                <input type="checkbox" :id="'plcset'+largekey+smallkey" v-model="smallitem.isEval" :value=true><label :for="'plcset'+largekey+smallkey"><span></span></label>-->
                              </slot>
                              <span v-else :class="{'conceal':!smallitem.isEval}">{{smallitem.isEval ? '사용' : '비사용'}}</span>
                            </span>
                        </div>
                      </dt>
                    </dl>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {mapActions} from 'vuex';
  import Vue from 'vue';
  export default {
    name: 'EvalValue',
    components: {

    },
    data() {
      return {
        evalItemPolicy: 0,
        evalItemPolicyList: [],
        evalItemPolicySetList: [],
        evalItemPolicySize: 'N',
        evalItemPolicyRatio: 'N',
        evalItemPolicyNoUse: 'Y',
        evalItemPolicyCorrection: 1.0,
        evalItemPolicySizeOnline: 'Y',
        evalItemPolicyRatioOnline: 'Y',
        edit1: false,
        edit2: false,
        edit3: false,
        edit4: false
      }
    },
    async mounted() {
      await this.onSetting();
    },
    watch: {
      evalItemPolicySize(newVal) {
        this.evalItemPolicySizeOnline = newVal;
      }, // 기사면적/비율의 상위항목 변경시 하위항목도 변경
      evalItemPolicyRatio(newVal) {
        this.evalItemPolicyRatioOnline = newVal;
      }
		},
    methods: {
      ...mapActions(['getMediaPolicyAPI']),
      async onSetting() {
        await this.applyPolicy();
        await this.applyPolicyArea();
        await this.applyPolicyList();
        await this.applyPolicyCorrection();
      },

      async applyPolicyArea(arg) { // 2 기사면적 반영 여부
        const params = new FormData();
        params.append('m', 'z');
        if (this.edit2) {
          params.append('as', this.evalItemPolicySize); // 기사면적
          params.append('ar', this.evalItemPolicyRatio); // 기사비율
          params.append('aso', this.evalItemPolicySizeOnline); // 기사면적온라인
          params.append('aro', this.evalItemPolicyRatioOnline); // 기사비율온라인
        }

        const result = await this.getMediaPolicyAPI(params);
        if (result && result.success && result.final) {
          this.evalItemPolicySize = result.final['SIZE'];
          this.evalItemPolicyRatio = result.final['RATIO'];
          this.evalItemPolicySizeOnline = result.final['SIZE_ONLINE'];
          this.evalItemPolicyRatioOnline = result.final['RATIO_ONLINE'];
          if (this.edit2) {
            alert('기사면적/비율 반영 여부가 저장되었습니다.');
          }
          this.edit2 = false;
        } else if (arg) {
          this.$eventBus.$emit('kickOut');
        }
      },
      async applyPolicy(arg) {
        const params = new FormData();
        params.append('m', 'v');
        if (arg) params.append('q', this.evalItemPolicy);
        const result = await this.getMediaPolicyAPI(params);
        if (result && result.final && result.final_list && result.success) {
          this.evalItemPolicy = result.final;
          this.evalItemPolicyList = result.final_list;
          if (arg) alert('평가항목 누적 방법이 저장되었습니다.');
          this.edit1 = false;
        } else if (arg) {
          this.$eventBus.$emit('kickOut');
        }
      },
      async applyPolicyList(arg) {
        const params = new FormData();
        params.append('m', 'l');
        if (arg) {
          let list = [];
          params.append('q', JSON.stringify(this.evalItemPolicySetList));
        }
        const result = await this.getMediaPolicyAPI(params);
        if (result && result.final && result.success) {
          this.evalItemPolicySetList = result.final;
          if (arg) alert('통계 포함 여부가 저장되었습니다.');
          this.edit3 = false;
        } else if (arg) {
          this.$eventBus.$emit('kickOut');
        }
      },
      async applyPolicyCorrection(arg) {
        const params = new FormData();
        params.append('m', 'x');
        if (arg) {
          params.append('q', this.evalItemPolicyCorrection);
        }
        const result = await this.getMediaPolicyAPI(params);
        if (result && result.final && result.success) {
          this.evalItemPolicyCorrection = result.final;
          if (arg) alert('가치 보정 계수가 저장되었습니다.');
          this.edit4 = false;
        } else if (arg) {
          this.$eventBus.$emit('kickOut');
        }
      }
    }
  }
</script>
<style scoped>
.set_list_box ul li dt label {
  margin-left:4px;
}
.set_val_box {
  width: 100%;
  height: 75%;
  padding: 10px;
}
.set_val_box .set_cont {
  height: calc(100% - 30px);
}
.cont_wrap .set_cont .set_list_area {
  width: 100%;
}
.cont_wrap .set_cont .set_list_area .set_cont {
  height: calc(100% - 30px);
}
.cont_wrap .set_box_area .set_val_box .set_title .set_tit_btn {
    float: right;
}
.cont_wrap .set_box_area .set_val_box .set_title .set_tit_btn a {
  padding: 0 8px;
  font-size: 12px;
  float: left;
  margin-left: 4px;
}
.cont_wrap .set_val_box .set_cont .set_list_area .set_list_box {
  height: calc(100% - 22px);
}
.cont_wrap .set_val_box .set_cont .set_list_area .set_list_box .set_li .item_tit {
  width: 75%; padding: 0;
}
.cont_wrap .set_val_box .set_cont .set_list_area .set_list_box .set_li .item_rt {
  width: 25%; padding-right: 12px; text-align: right;
}

.cont_wrap .set_val_box .set_cont .set_list_area .set_list_box .set_li {
  height: 21px; line-height: 1.7;
}

.desc_text {
  float: none !important;
  margin-left: 15px;
  font-size: 11px;
  color: #808080;
  letter-spacing: -1px;
}
.surplus {
  border: 0 !important;
}
</style>
