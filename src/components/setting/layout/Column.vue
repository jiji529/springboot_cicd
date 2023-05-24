<template>
  <div class="set_box_area" style="width:65%">
    <div class="set_auto_box box5">
      <div class="set_title">
        <h2>비사용 평가항목 처리</h2>
        <p>비사용 항목이 조회 조건에 포함됩니다.</p>
        <div class="set_tit_btn">
          <slot v-if="edit">
            <a @click="applyPolicyNoUse()" class="btn_wh">취소</a>
            <a @click="applyPolicyNoUse(true)" class="btn_na">저장</a>
          </slot>
          <slot v-else>
            <a @click="edit=true" class="btn_gr">편집</a>
          </slot>
        </div>
      </div>
      <div class="set_cont">
        <dl class="set_report_val" style="border-bottom:none">
          <dt>조회 조건 포함</dt>
          <dd>
            <ul v-if="edit">
              <li><input type="radio" id="evPNSY" v-model.lazy="evalItemPolicyNoUseSearch" value="Y"><label for="evPNSY"><span></span>포함</label></li>
              <li><input type="radio" id="evPNSN" v-model.lazy="evalItemPolicyNoUseSearch" value="N"><label for="evPNSN"><span></span>미포함</label></li>
            </ul>
            <slot v-else>{{evalItemPolicyNoUseSearch === 'Y' ? '포함' : '미포함'}}</slot>
          </dd>
        </dl>
        <dl class="set_report_val">
          <dt>통계 결과 포함</dt>
          <dd>
            <ul v-if="edit">
              <li><input type="radio" id="evPNRY" v-model.lazy="evalItemPolicyNoUseResult" value="Y"><label for="evPNRY"><span></span>포함</label></li>
              <li><input type="radio" id="evPNRN" v-model.lazy="evalItemPolicyNoUseResult" value="N"><label for="evPNRN"><span></span>미포함</label></li>
            </ul>
            <slot v-else>{{evalItemPolicyNoUseResult === 'Y' ? '포함' : '미포함'}}</slot>
          </dd>
        </dl>
      </div>
    </div>
    <div class="set_auto_box box5">
      <div class="set_title">
        <h2>표시 항목 설정 - 화면/인쇄</h2>
        <div class="set_tit_btn">
          <a @click="request('WEB')" class="btn_na">저장</a>
        </div>
        <p>각 항목을 끌어서 순서를 바꿉니다.</p>
        <div style="display:inline-block;float:right;margin-right:100px">
          <input type="radio" :value="'Y'" id="cvm0" :key="" v-model="column_classic_view.value" />
          <label for="cvm0" title="mode0" style="margin-right:12px"><span></span>화면에 평가 참고필드 우선표시</label>
          <input type="radio" :value="'N'" id="cvm1" v-model="column_classic_view.value" />
          <label for="cvm1" title="mode1"><span></span>순서대로 표시</label>
          <p style="font-size:11px;letter-spacing:-1px">* {{column_classic_view.alias}}</p>
        </div>
      </div>
      <div class="set_cont">
        <div class="set_report_box">
          <draggable v-model="column_items_web" group="web" @start="drag=true" @end="drag=false">
            <slot v-for="(column) in column_items_web">
              <div class="set_report set_report_item">
                <div class="set_report_th head" :title="column.desc">
                  <input type="checkbox" :id="'chk_column_web_'+column.seq" v-model="column.use">
                  <label :for="'chk_column_web_'+column.seq"><span></span></label>
                  {{column.desc}}
                </div>
                <div class="set_report_td">
                  <input type="text" v-model="column.title" title="표시명칭" placeholder="표시명칭" size="1"></div>
              </div>
            </slot>
          </draggable>
        </div>
      </div>
    </div>
    <div class="set_auto_box box5">
      <div class="set_title">
        <h2>표시 항목 설정 - 엑셀</h2>
        <div class="set_tit_btn">
          <a @click="request('XLS')" class="btn_na">저장</a>
        </div>
        <p>각 항목을 끌어서 순서를 바꿉니다.</p>
      </div>
      <div class="set_cont">
        <div class="set_report_box">
          <draggable v-model="column_items_xls" group="xls" @start="drag=true" @end="drag=false">
            <slot v-for="(column) in column_items_xls">
              <div class="set_report set_report_item">
                <div class="set_report_th head" :title="column.desc">
                  <input type="checkbox" :id="'chk_column_xls_'+column.seq" v-model="column.use">
                  <label :for="'chk_column_xls_'+column.seq"><span></span></label>
                  {{column.desc}}
                </div>
                <div class="set_report_td">
                  <input type="text" v-model="column.title" title="표시명칭" placeholder="표시명칭">
                </div>
              </div>
            </slot>
          </draggable>
        </div>
      </div>
    </div>
    <div class="set_auto_box box5">
      <div class="set_title">
        <h2>스크랩마스터 3.5 분류정보 통계 표시</h2>
        <p>3.5에서 뷰어 등록시 입력한 분류를 사용한 통계값 출력</p>
        <div class="set_tit_btn">
          <slot v-if="edit2">
            <a @click="applyPolicyS3Mode()" class="btn_wh">취소</a>
            <a @click="applyPolicyS3Mode(true)" class="btn_na">저장</a>
          </slot>
          <slot v-else>
            <a @click="edit2=true" class="btn_gr">편집</a>
          </slot>
        </div>
      </div>
      <div class="set_cont">
        <dl class="set_report_val">
          <dt>항목 출력 여부</dt>
          <dd>
            <ul v-if="edit2">
              <li><input type="radio" id="evS3Y" v-model.lazy="evalItemPolicyS3Mode" value="Y"><label for="evS3Y"><span></span>출력</label></li>
              <li><input type="radio" id="evS3N" v-model.lazy="evalItemPolicyS3Mode" value="N"><label for="evS3N"><span></span>미출력</label></li>
            </ul>
            <slot v-else>{{evalItemPolicyS3Mode === 'Y' ? '출력' : '미출력'}}</slot>
          </dd>
        </dl>
      </div>
    </div>
  </div>
</template>

<script>
  import {mapActions} from 'vuex'
  import draggable from 'vuedraggable'
  export default {
    name : 'column',
    components: {
      draggable
    },
    data() {
      return {
        edit: false,
        edit2: false,
        evalItemPolicyNoUseSearch: 'Y',
        evalItemPolicyNoUseResult: 'Y',
        evalItemPolicyS3Mode: 'Y',
        column_classic_view: {},
        column_items: {},
        column_items_web: [],
        column_items_xls: []
      }
    },
    async mounted() {
      await this.request();
      await this.applyPolicyNoUse();
      await this.applyPolicyS3Mode();
    },
    methods: {
      ...mapActions(['getMediaPolicyAPI', 'getColumnSettingAPI'])
      , async applyPolicyS3Mode(arg) {
        const params = new FormData();
        params.append('m', '3');
        if (arg) params.append('q', this.evalItemPolicyS3Mode);
        const result = await this.getMediaPolicyAPI(params);
        if (result && result.success && result.final) {
          this.evalItemPolicyS3Mode = result.final;
          if (arg) alert('항목 출력 여부가 저장되었습니다.');
          this.edit2 = false;
        } else if (arg) {
          alert('오류!');
        }
      }
      , async applyPolicyNoUse(arg) {
        const params = new FormData();
        params.append('m', 'n');
        if (arg) {
          params.append('qs', this.evalItemPolicyNoUseSearch);
          params.append('qr', this.evalItemPolicyNoUseResult);
        }
        const result = await this.getMediaPolicyAPI(params);
        if (result && result.success && result.final) {
          this.evalItemPolicyNoUseSearch = result.final['INC_SEARCH'];
          this.evalItemPolicyNoUseResult = result.final['INC_EVAL'];
          if (arg) alert('비사용 항목 표시 여부가 저장되었습니다.');
          this.edit = false;
        } else if (arg) {
          this.$eventBus.$emit('kickOut');
        }
      }
      , async requestView(isSubmit) {
        let params = new FormData();
        params.append('m', 'v');
        if (isSubmit) {
          params.set('q', JSON.stringify(this.column_classic_view));
        }
        const data = await this.getColumnSettingAPI(params);
        if (data) {
          if (isSubmit) {
            // alert('표시 항목 설정 - 기본 항목이 저장되었습니다.');
          } else {
            this.column_classic_view = data.data;
          }
        } else {
          this.$eventBus.$emit('kickOut');
          return false;
        }
      }
      , async request(arg) {
        if (!arg) {
          this.requestView();
        } else {
          this.requestView(true);
        }
        let params = new FormData(), order = 0;
        params.append('m', 'c');
        let isSubmit = (this.column_items && Object.keys(this.column_items).length > 0);
        if (isSubmit) {
          let sendData = [], src_data;
          if (arg === 'WEB') {
            src_data = this.column_items_web;
          } else if (arg === 'XLS') {
            src_data = this.column_items_xls;
          } else {
            return false;
          }
          src_data.forEach(c => {
            sendData.push({
              order: ++order,
              use: (c.use ? 'Y' : 'N'),
              title: c.title,
              category: c.category,
              seq: c.seq
            });
          });
          params.append('q', JSON.stringify(sendData));
        }
        const data = await this.getColumnSettingAPI(params);
        if (data) {
          if (isSubmit) {
            this.column_items = data.data;
            let msg = '표시 항목 설정 - ';
            if (arg === 'WEB') {
              msg += '화면/인쇄 가';
            } else if (arg === 'XLS') {
              msg += '엑셀 이';
            }
            window.alert(msg + ' 저장되었습니다.');
          } else {
            this.column_items = data.data;
            this.column_items_web = [];
            this.column_items_xls = [];
            data.data.forEach(c => {
              c.use = (c.use === 'Y');
              if (c.category === 'WEB') {
                this.column_items_web.push(c);
              } else if (c.category === 'XLS') {
                this.column_items_xls.push(c);
              }
            });
          }
        }
      }
    }
  }

</script>
<style scoped>
	.cont_wrap .set_cont { padding-top:6px }
	.set_report_th.head { cursor:pointer; text-align:center; overflow:hidden; height:20px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
	.set_report_box { margin-top:0 }
	.set_report_item { background-color:rgba(192,192,192,0.1); border:1px solid #d9d9d9; padding:4px; margin:1px; width:calc(10% - 2px) !important; }
  .set_report_box .set_report input { width:100% !important; }
</style>
