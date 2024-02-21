<template>
  <div class="sch_area template-search" v-if="getConfigEval">
    <div class="sch_cont">
      <dl class="sch_element">
        <dt>통계값</dt>
        <dd>
          <input type="radio" id="cross_calc_value_0" v-model="getStatSetting.crossCalcValue" :value="0">
          <label for="cross_calc_value_0"><span></span>원본</label>

          <input type="radio" id="cross_calc_value_1" v-model="getStatSetting.crossCalcValue" :value="1">
          <label for="cross_calc_value_1"><span></span>건수</label>

          <input type="radio" id="cross_calc_value_2" v-model="getStatSetting.crossCalcValue" :value="2">
          <label for="cross_calc_value_2"><span></span>가치</label>
        </dd>
      </dl>
      <dl class="sch_element" :class="{'conceal' : getStatSetting.crossCalcValue != 2}">
        <dt>금액단위</dt>
        <dd>
          <input type="radio" id="numberScale_0" v-model="getStatSetting.numberScale" value="0"><label for="numberScale_0"><span></span>원</label>
          <input type="radio" id="numberScale_1" v-model="getStatSetting.numberScale" value="1"><label for="numberScale_1"><span></span>천원</label>
          <input type="radio" id="numberScale_2" v-model="getStatSetting.numberScale" value="2"><label for="numberScale_2"><span></span>백만원</label>
        </dd>
      </dl>

      <dl class="sch_element">
        <dt>기간 설정</dt>
        <dd class="datebox">
          <select title="기간 설정"
                  v-model="getStatSetting.dateType"
                  @change="selectDateType($event)">
            <option :value="1">연간</option>
            <option :value="2">월간</option>
            <option :value="3">지정</option>
          </select>
          <select v-show="getStatSetting.dateType!==3"
                  title="연간"
                  @change="selectYear($event)"
                  v-model="getStatSetting.selectYear">
            <option v-for="y in yearList"
                    :value="y"
                    :key="y"
            >{{y}}
            </option>
          </select>
          <select v-show="getStatSetting.dateType===2"
                  title="월간"
                  @change="selectMonth($event)"
                  v-model="getStatSetting.selectMonth">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>

          </select>
          <div v-show="getStatSetting.dateType===3">
            <datepicker
                :disabledDates="disabledDates"
                :format="defaultFormat"
                :language="ko"
                v-model="getStatSetting.dateRange.startDate"
            />
            <span>~ </span>
            <datepicker
                :disabledDates="disabledDates"
                :format="defaultFormat"
                :language="ko"
                v-model="getStatSetting.dateRange.endDate"
            />
          </div>
        </dd>
      </dl>
      <dl class="sch_element">
        <dt>검색 범위</dt>
        <dd class="border">
          <ul id="news_group_select">
            <li>
              <input type="checkbox" id="search_form_all_check" :checked="searchRangeIsAll()" @change="searchRangeAllCheck($event)">
              <label for="search_form_all_check"><span></span>전체선택</label>
            </li>
            <li v-for="item in getNewsGroupInfo" :key="item.lvalue">
              <input type="checkbox"
                     :id="'sch_grp'+item.lvalue"
                     :value="item.lvalue"
                     v-model="getStatSetting.searchRange" title="">
              <label v-bind:for="'sch_grp'+item.lvalue">
                <span></span>{{item.sname}}
              </label>
            </li>
          </ul>
        </dd>
      </dl>
      <dl class="sch_element">
        <dt>검색어</dt>
        <dd>
          <select title="검색어" v-model="getStatSetting.searchOption">
            <option :value="1">제목+내용</option>
            <option :value="2">제목</option>
            <option :value="3">내용</option>
          </select>
          <input type="text" v-model="getStatSetting.keyword" placeholder="검색어를 입력해 주세요">
          <input type="radio" id="sch_key_and" :value="1" v-model="getStatSetting.keywordOption">
          <label for="sch_key_and"><span></span>AND</label>
          <input type="radio" id="sch_key_or" :value="2" v-model="getStatSetting.keywordOption">
          <label for="sch_key_or"><span></span>OR</label>
        </dd>
      </dl>
      <dl class="sch_element">
        <dt>배제어</dt>
        <dd class="border keyword">
          <input type="text" v-model="getStatSetting.notKeyword" placeholder="배제어를 입력해 주세요">
          <input type="radio" id="sch_exp_and" :value="1" v-model="getStatSetting.notKeywordOption">
          <label for="sch_exp_and"><span></span>AND</label>
          <input type="radio" id="sch_exp_or" :value="2" v-model="getStatSetting.notKeywordOption">
          <label for="sch_exp_or"><span></span>OR</label>
        </dd>
      </dl>
      <dl class="sch_element">
        <dt>검색조건</dt>
        <dd>
          <ul class="border">
            <li>
              <input type="checkbox" id="sch_term01" v-model="getStatSetting.searchCriteria.includeHideArticles">
              <label for="sch_term01"><span></span>감춘 기사 포함</label>
            </li>
            <li>
              <input type="checkbox" id="sch_term02" v-model="getStatSetting.searchCriteria.includingNot">
              <label for="sch_term02"><span></span>평가 제외 기사 포함</label>
            </li>
            <li>
              <input type="checkbox" id="sch_term03" v-model="getStatSetting.searchCriteria.includingPrivate">
              <label for="sch_term03"><span></span>비공개 스크랩 포함</label>
            </li>
          </ul>

        </dd>
      </dl>
      <dl class="sch_element">
        <dt>매체선택</dt>
        <dd id="media_group_select">
          <div class="fake_button_upper">
            <ul>
              <li>
                <input type="checkbox" id="sch_media_all"
                       @change="selectMediaAll($event)"
                       :checked="stateMediaAll()">
                <label for="sch_media_all"><span></span>전체선택</label>
              </li>
              <li>
                <input type="radio" id="gic_true_" name="gic_true_" :value="true" v-model="getStatSetting.groupIsCategory" @change="changeMediaGroup($event)" />
                <label for="gic_true_"><span></span>분류</label>
                <input type="radio" id="gic_false_" name="gic_false_" :value="false" v-model="getStatSetting.groupIsCategory" @change="changeMediaGroup($event)" />
                <label for="gic_false_"><span></span>유형</label>
              </li>
            </ul>
            <p style="display:none">{{groupSelectList}}/{{partSelectMediaGroup}}</p>
          </div>
          <div class="fake_button">
            <div style="width:calc(100% - 26px);float:left">
              <ul>
                <li v-for="(g,gidx) in mediaLabel()" :key="'fbml_'+gidx">
                  <input type="checkbox"
                  :id="'fbmlcb_'+gidx"
                  :value="g.id"
                  @change="selectMediaGroup($event,g)"
                  v-model="getStatSetting.mediaSelectionOptions">
                  <label :for="'fbmlcb_'+gidx"><span :class="{'part_checked' : partSelectMediaGroup.indexOf(g.id) > -1}"></span>{{g.name}} {{g.countCur}}/{{g.count}}</label>
                </li>
              </ul>
            </div>
            <div style="width:26px;float:left">
              <button class="test_button" @click="showMediaSelection" title="매체목록 보기"></button>
            </div>
          </div>
        </dd>
      </dl>
    </div>
    <!-- 검색 조건 끝-->
    <!-- 자동평가 시작 -->
    <div class="filter0">
      <div class="ft_title">
        <h5>자동평가 항목</h5>
        <a @click="resetAuto()">초기화</a>
        <span class="option">
          <input type="radio" id="sch_stat_auto_and_" value="1" v-model.number="getStatSetting.evaluation0Options" @change="selectEval0Type">
          <label for="sch_stat_auto_and_">AND</label>
          <input type="radio" id="sch_stat_auto_or_" value="2" v-model.number="getStatSetting.evaluation0Options" @change="selectEval0Type">
          <label for="sch_stat_auto_or_" >OR</label>
        </span>
      </div>
      <div class="ft_cont" :class="getStatSetting.evaluation0Options===1?'and':''" v-if="getEval0ClassNew">
        <template v-for="(eval0, e0i) in getEval0ClassNew">
          <div class="ft2_box" v-if="eval0.isUse === 'Y' || showUnusedEvalItem" :class="eval0.isUse === 'N' ? 'wither' : ''" :key="e0i+'e0'+eval0.name">
            <div class="ft_ch" style="overflow:hidden" :title="eval0.isUse === 'N' ? eval0.name+' (미사용)' : eval0.name">
              <input type="checkbox"
              v-if="getStatSetting.evaluation0Options===2"
              :id="'ft0_a'+eval0.seq"
              @change="selectEval0GroupNew($event, getConfigEval.group_item[eval0.seq])"
              :checked="stateEval0GroupNew(getConfigEval.group_item[eval0.seq])"
              :value="eval0.seq"
              ><label v-bind:for="'ft0_a'+eval0.seq"><span></span>{{eval0.name}}</label>
            </div>
            <ul class="ft2_li" v-if="getEvalGroupItems[eval0.seq]">
              <!-- eslint-disable vue/no-use-v-if-with-v-for,vue/no-confusing-v-for-v-if -->
              <li v-for="(item, e0si) in getEvalGroupItems[eval0.seq]" v-if="item.isUse === 'Y' || getConfigEval.policy.NU.value === 'Y'" 
                :class="item.isUse === 'N' ? 'wither' : ''" :title="item.isUse === 'N' ? item.value + ' (미사용)' : item.value" :key="e0si+'-'+item.value">
                <input :type="getStatSetting.evaluation0Options===2 ? 'checkbox' : 'radio'"
                :id="'ft0_b'+item.seq"
                :name="'ft0_a'+eval0.seq"
                @change="selectEval0New($event, getConfigEval.group_item[eval0.seq])"
                :checked="stateEval0New(item)"
                :value="item.seq"
                @click="getStatSetting.evaluation0Options===2 ? null : radioButtonToggleAuto($event, eval0.seq, item.seq)"
                wasChecked="getStatSetting.evaluation0Options===2 ? null : false"
                ><label v-bind:for="'ft0_b'+item.seq"><span></span>{{item.value}}</label>
              </li>
            </ul>
          </div>
        </template>
      </div>
    </div>
    <!-- 자동평가 끝-->
    <!-- 평가 1 시작 -->
    <div class="filter1">
      <div class="ft_title">
        <h5>
          <input type="checkbox" id="sch_ft1_all">
          평가 1 항목</h5>
        <a @click="resetEval1()">초기화</a></div>
      <div class="ft_cont">
        <div class="ft1_top">
          <div class="ft_tit">
            <input type="checkbox" id="sch_ft1_a00"
                   value="1"
                   @change="selectEval1($event)"
                   :checked="stateEval1('1')">
            <label for="sch_ft1_a00"><span></span>대분류</label>
          </div>
          <div class="ft_tit">
            <input type="checkbox" id="sch_ft1_b00"
                   value="2"
                   @change="selectEval1($event)"
                   :checked="stateEval1('2')">
            <label for="sch_ft1_b00"><span></span>중분류</label>
          </div>
          <div class="ft_tit">
            <input type="checkbox" id="sch_ft1_c00"
                   value="3"
                   @change="selectEval1($event)"
                   :checked="stateEval1('3')">
            <label for="sch_ft1_c00"><span></span>소분류</label>
          </div>
        </div>
        <div class="ft1_box">
          <!-- 평가 항목 리스트 ex) CEO, 사업부문 -->
          <div class="ft1_val" 
               v-if="getEval1CategoryNew!==null && (largeCategory.isUse === 'Y' || getConfigEval.policy.NU.value === 'Y')"
               v-for="largeCategory in getEval1CategoryNew"
               :key="largeCategory.seq" :class="largeCategory.isUse === 'N' ? 'wither' : ''" :title="largeCategory.isUse === 'N' ? largeCategory.name + ' (미사용)' : largeCategory.name">
            <div class="ft_ch"
                 v-if="largeCategory.upperSeq==null">
              <input type="checkbox"
                     :id="'sch_ft1_a'+largeCategory.seq"
                     v-model="getStatSetting.evaluationItem1"
                     :value="largeCategory.seq">
              <label v-bind:for="'sch_ft1_a'+largeCategory.seq"><span></span>{{largeCategory.name}}</label><span
                class="btn_all"><a @click="selectEval1GroupAll(largeCategory)">ALL</a></span>
            </div>
            <!-- 중분류, 소분류로 구성 -->
            <dl class="ft1_li"
                v-if="largeCategory.sub!==null && (middleCategory.isUse === 'Y' || getConfigEval.policy.NU.value === 'Y')"
                v-for="middleCategory in largeCategory.sub"
                :key="middleCategory.seq" :class="middleCategory.isUse === 'N' ? 'wither' : ''" :title="middleCategory.isUse === 'N' ? middleCategory.name + ' (미사용)' : middleCategory.name">
              <dt>
                <input type="checkbox"
                       :id="'sch_ft1_b'+middleCategory.seq"
                       v-model="getStatSetting.evaluationItem1"
                       :value="middleCategory.seq">
                <label v-bind:for="'sch_ft1_b'+middleCategory.seq"><span></span>{{middleCategory.name}}</label><span
                  class="btn_all"><a @click="selectEval1GroupAll(middleCategory)">ALL</a></span>
              </dt>
              <dd v-if="middleCategory.sub!==null">
                <ul>
                  <li v-for="smallCategory in middleCategory.sub"
                      :key="smallCategory.seq" v-if="(smallCategory.isUse === 'Y' || getConfigEval.policy.NU.value === 'Y')" :class="smallCategory.isUse === 'N' ? 'wither' : ''" :title="smallCategory.isUse === 'N' ? smallCategory.name + ' (미사용)' : smallCategory.name">
                    <input type="checkbox"
                           :id="'sch_ft1_c'+smallCategory.seq"
                           v-model="getStatSetting.evaluationItem1"
                           :value="smallCategory.seq">
                    <label v-bind:for="'sch_ft1_c'+smallCategory.seq"><span></span>{{smallCategory.name}}</label>
                  </li>
                </ul>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
    <!-- 평가1 끝-->
    <!-- 평가 2 시작 -->
    <div class="filter2">
      <div class="ft_title">
        <h5>
          <input type="checkbox" id="sch_ft2_all">
          평가 2 항목</h5>
        <a @click="resetEval2()">초기화</a>
        <span class="option">
          <input type="radio" id="sch_stat_and_" value="1" v-model.number="getStatSetting.evaluation2Options"
                 @change="selectEval2Type">
            <label for="sch_stat_and_">AND</label>
          <input type="radio" id="sch_stat_or_" value="2" v-model.number="getStatSetting.evaluation2Options"
                 @change="selectEval2Type">
            <label for="sch_stat_or_">OR</label>
        </span>
      </div>
      <div class="ft_cont" :class="getStatSetting.evaluation2Options===1?'and':''" v-if="getEval2ClassNew">
        <template v-for="(eval2, e2i) in getEval2ClassNew">
          <!-- eslint-disable vue/no-use-v-if-with-v-for,vue/no-confusing-v-for-v-if -->
          <div class="ft2_box" v-if="eval2.isUse === 'Y' || showUnusedEvalItem" :class="eval2.isUse === 'N' ? 'wither' : ''" :key="e2i+'-e2-'+eval2.name">
            <div class="ft_ch" style="overflow:hidden" :title="eval2.isUse === 'N' ? eval2.name+' (미사용)' : eval2.name">
              <input type="checkbox"
              v-if="getStatSetting.evaluation2Options===2"
              :id="'ft2_a'+eval2.seq"
              @change="selectEval2GroupNew($event, getConfigEval.group_item[eval2.seq])"
              :checked="stateEval2GroupNew(getConfigEval.group_item[eval2.seq])"
              :value="eval2.seq"
              ><label v-bind:for="'ft2_a'+eval2.seq"><span></span>{{eval2.name}}</label>
            </div>
            <ul class="ft2_li" v-if="getEvalGroupItems[eval2.seq]">
              <!-- eslint-disable vue/no-use-v-if-with-v-for,vue/no-confusing-v-for-v-if -->
              <li v-for="(item, e2si) in getEvalGroupItems[eval2.seq]" v-if="item.isUse === 'Y' || showUnusedEvalItem" 
                :class="item.isUse === 'N' ? 'wither' : ''" :title="item.isUse === 'N' ? item.value + ' (미사용)' : item.value" :key="e2si+'-'+item.value">
                <input :type="getStatSetting.evaluation2Options===2 ? 'checkbox' : 'radio'"
                :id="'ft2_b'+item.seq"
                :name="'ft2_a'+eval2.seq"
                @change="selectEval2New($event, getConfigEval.group_item[eval2.seq])"
                :checked="stateEval2New(item)"
                :value="item.seq"
                @click="getStatSetting.evaluation2Options===2 ? null : radioButtonToggleM2($event, eval2.seq, item.seq)"
                wasChecked="getStatSetting.evaluation2Options===2 ? null : false"
                ><label v-bind:for="'ft2_b'+item.seq"><span></span>{{item.value}}</label>
              </li>
            </ul>
          </div>
        </template>
      </div>
    </div>
    <!-- 평가2 끝-->
    <MediaSelection v-if="isMediaSelectionVisible"
                    @close="closeMediaSelection"
                    :value="getStatSetting.statSelectionMedium"
                    @input="val => getStatSetting.statSelectionMedium = val"/>
  </div>
</template>

<script>
  /* eslint-disable no-console */
  import Datepicker from 'vuejs-datepicker';
  import {ko} from 'vuejs-datepicker/dist/locale';
  import {mapActions, mapGetters} from 'vuex';
  import MediaSelection from '../../MediaSelection';
  import draggable from "vuedraggable";
  // import StatValueSetting from './StatValueSetting';

  export default {
    name: 'StatSearch',
    components: {draggable, Datepicker, MediaSelection},


    data() {
      const startDate = new Date();
      const minDate = new Date(2017, 0, 1);
      return {
        defaultFormat: 'yyyy-MM-dd',
        ko: ko,
        disabledDates: {
          from: startDate,
          to: minDate
        },
        isMediaSelectionVisible: false,
        isValueSettingVisible: false,
        partSelectMediaGroup: [],
        totalItemLabel: '전체 항목 접기',

        opButtonTxt: '닫기↩', //'열기↪',
        
        
        
      } // return
    },
    created() {
      this.$eventBus.$off('kickOut');
      this.$eventBus.$on("kickOut", () => {
        alert('Logged out!');
        this.$store.dispatch('LOGOUT').then(() =>
          this.$router.push('/login')
        );
      });
    },
    async mounted() {
      await this.onSetting();
      let self = this;
      window.addEventListener('keyup', function(event) {
        if (event.keyCode === 113) {
          self.applyDataToObjects();
        }
        else if (event.keyCode === 115) {
          self.statSearch();
        }
      });
    },
    watch: {
      getMediaList: function() {
        let result = [];
        this.getStatSetting.statSelectionMedium = {};
        for (let [k,v] of Object.entries(this.mediaLabel())) {
          if (v && v.media) {
            result = [];
            v.media.forEach(m => result.push(m));
            this.getStatSetting.statSelectionMedium[v.name] = result;
          }
        }
      },
    },
    computed: {
      // getter를 객체 전개 연산자(Object Spread Operator)로 계산하여 추가합니다.
      ...mapGetters([
        'getStatSetting',
        'getNewsGroupInfo',
        'getMediaList',
        'getEval1Category',
        'getEval2Class',
        'getConfigEval'
      ]),

      getEvalGroupItems() {
        let rtn = {}, tmpArr;
        if (this.getConfigEval && this.getConfigEval['group_item']) {
          for (let [k,v] of Object.entries(this.getConfigEval['group_item'])) {
            tmpArr = Object.values(v);
            tmpArr.sort((a, b) => (Number(a.order) > Number(b.order)) ? 1 : -1);
            rtn[k] = tmpArr;
          }
        }
        return rtn;
      },
      getEval0ClassNew() {
        let rtn = [], tmpObj;
        if (this.getConfigEval && this.getConfigEval['group'] && this.getConfigEval['group']['AT']) {
          Object.values(this.getConfigEval['group']['AT']).forEach(g => {
            tmpObj = JSON.parse(JSON.stringify(g));
            tmpObj['order'] = Number(tmpObj['order']);
            rtn.push(tmpObj);
          });
          rtn.sort((a, b) => (a.order > b.order) ? 1 : -1);
        }
        return rtn;
      },
      getEval2ClassNew() {
        let rtn = [], tmpObj;
        if (this.getConfigEval && this.getConfigEval['group'] && this.getConfigEval['group']['M2']) {
          Object.values(this.getConfigEval['group']['M2']).forEach(g => {
            tmpObj = JSON.parse(JSON.stringify(g));
            tmpObj['order'] = Number(tmpObj['order']);
            rtn.push(tmpObj);
          });
          rtn.sort((a, b) => (a.order > b.order) ? 1 : -1);
        }
        return rtn;
      },
      getEval2ClassNew() {
        let rtn = [], tmpObj;
        if (this.getConfigEval && this.getConfigEval['group'] && this.getConfigEval['group']['M2']) {
          Object.values(this.getConfigEval['group']['M2']).forEach(g => {
            tmpObj = JSON.parse(JSON.stringify(g));
            tmpObj['order'] = Number(tmpObj['order']);
            rtn.push(tmpObj);
          });
          rtn.sort((a, b) => (a.order > b.order) ? 1 : -1);
        }
        return rtn;
      },
      getEval1CategoryNew() {
        let rtn = [], tmpGroup, tmpItem, tmpData, tmpIdx = -1, tmpIds = [];
        if (this.getConfigEval && this.getConfigEval['item'] && this.getConfigEval['item']['M1']) {
          tmpData = Object.values(this.getConfigEval['item']['M1']);
          tmpData.forEach(o => {
						if (o.upper_seq === 0) {
							tmpItem = new Object();
							tmpItem.isUse = o.isUse; tmpItem.name = o.value;
							tmpItem.order = Number(o.order); tmpItem.score = o.score;
							tmpItem.seq = String(o.seq); tmpItem.sub = [];
							tmpItem.subSeq = []; tmpItem.upperSeq = null;
							rtn.push(tmpItem);
							tmpIds.push(o.seq);
						}
					}); // step 1
					tmpData.forEach(o => {
						tmpIdx = tmpIds.indexOf(o.upper_seq);
						if (o.upper_seq !== 0 && tmpIdx > -1) {
							tmpItem = new Object();
							tmpItem.isUse = o.isUse; tmpItem.name = o.value;
							tmpItem.order = Number(o.order); tmpItem.score = o.score;
							tmpItem.seq = String(o.seq); tmpItem.sub = [];
							tmpItem.subSeq = []; tmpItem.upperSeq = String(o.upper_seq);
							rtn[tmpIdx].sub.push(tmpItem);
							rtn[tmpIdx].subSeq.push(o.seq);
						}
					}); // step 2
					tmpData.forEach(o => {
						tmpIdx = tmpIds.indexOf(o.upper_seq);
						if (o.upper_seq !== 0 && tmpIdx === -1) {
							tmpItem = new Object();
							tmpItem.isUse = o.isUse; tmpItem.name = o.value;
							tmpItem.order = Number(o.order); tmpItem.score = o.score;
							tmpItem.seq = String(o.seq); tmpItem.sub = [];
							tmpItem.subSeq = []; tmpItem.upperSeq = String(o.upper_seq);
							rtn.forEach(x => {
								tmpIdx = x.subSeq.indexOf(o.upper_seq);
								if (tmpIdx > -1) {
									x.sub[tmpIdx].sub.push(tmpItem);
									x.sub[tmpIdx].subSeq.push(o.seq);
								}
							});
						}
					}); // step 3
					rtn.forEach(r => {
						r.sub.forEach(s => {
							s.sub.sort((a, b) => (a.order > b.order) ? 1 : -1);
						});
						r.sub.sort((a, b) => (a.order > b.order) ? 1 : -1);
					}); // sort by order
        }
        return rtn;
      },
      showUnusedEvalItem() {
        let rtn = false;
        if (this.getConfigEval && this.getConfigEval['policy'] && this.getConfigEval['policy']['NU']) {
          rtn = (this.getConfigEval['policy']['NU']['value'] === 'Y');
        }
        return rtn;
      },
      yearOldest() {
        if (this.getConfigEval && this.getConfigEval['policy'] && this.getConfigEval['policy']['OY']) {
          return Number(this.getConfigEval['policy']['OY']['value']);
        } else {
          return 2010;
        }
      },
      /**
       * 연도 계산 목록 출력
       * @returns {Array}
       */
      yearList() {
        // this.trigger;
        let rtn = [];
        let yearCurrent = new Date().getFullYear();
        let yearOldest = this.yearOldest;
        let yearPush = yearCurrent;
        while (yearPush >= yearOldest) {
          rtn.push(yearPush--);
        }
        return rtn;
      },
      groupSelectList: function() {
        let group = this.getStatSetting.groupIsCategory ? this.categoryList : this.typeList, rtn = [], rtn2 = [];
        for (let [k,v] of Object.entries(this.getStatSetting.statSelectionMedium)) {
          for (let [gk,gv] of Object.entries(group)) {
            if (k === gv.name) {
              if (gv.count === v.length) {
                rtn.push(gv.id);
              } else if (v.length > 0) {
                rtn2.push(gv.id);
              }
            }
          }
        }
        
        this.getStatSetting.mediaSelectionOptions = rtn;
        this.partSelectMediaGroup = rtn2;
        return rtn;
      },
      categoryList: function() {
        const result = {};
        if (this.getMediaList) {
          let tmpId, tmpMedia, tmpGroup;
          for (const key in this.getMediaList) {
            tmpMedia = this.getMediaList[key];
            tmpId = tmpMedia.category_id;
            if (!result[tmpId]) {
              result[tmpId] = Object.assign({}, {
                id: tmpId,
                name: tmpMedia.category_name,
                count: 0,
                visible: true,
                media: []
              });
            }
            result[tmpId].count++;
            result[tmpId].media.push(tmpMedia);
          }
        }
        return result;
      },
      typeList: function() {
        const result = {};
        if (this.getMediaList) {
          let tmpId, tmpMedia, tmpGroup;
          for (const key in this.getMediaList) {
            tmpMedia = this.getMediaList[key];
            tmpId = tmpMedia.media_type;
            if (!result[tmpId]) {
              result[tmpId] = Object.assign({}, {
                id: tmpId,
                name: tmpMedia.media_type_name,
                count: 0,
                visible: true,
                media: []
              });
            }
            result[tmpId].count++;
            result[tmpId].media.push(tmpMedia);
          }
        }
        return result;
      },
      fullList: function() {
        const result = {};
        if (this.getMediaList) {
          let tmpId, tmpMedia, tmpGroup;
          for (const key in this.getMediaList) {
            tmpMedia = this.getMediaList[key];
            tmpId = (this.getStatSetting.groupIsCategory) ? tmpMedia.category_id : tmpMedia.media_type;
            if (!result[tmpId]) {
              result[tmpId] = Object.assign({}, {
                group_id: tmpId,
                group_name: (this.getStatSetting.groupIsCategory) ? tmpMedia.category_name : tmpMedia.media_type_name,
                mediaListRaw: [],
                mediaCount: 0
              });
            }
            result[tmpId].mediaCount++;
            result[tmpId].mediaListRaw.push(tmpMedia);
          } // group by category|type
          for (const key in result) {
            result[key].mediaList = this.mediaGroups(result[key].mediaListRaw, 'paper_category');
            delete result[key].mediaListRaw;
          } // group by paper_category
        }
        return result;
      }
    }, // computed



    methods: {

      ...mapActions(['newsGroupAPI', 'categoryIdAPI', 'getEval1CategoryAPI', 'getEval2ClassAPI', 'getConfigEvalAPI', 'categoryNameOldAPI']),

      /**
       * API LOAD
       * @returns {Promise<void>}
       */
      async onSetting() {
        try {
          await this.newsGroupAPI();
          await this.categoryIdAPI();
          await this.getEval1CategoryAPI();
          let params = new FormData();
          params.append('t', 's');
          await this.getEval2ClassAPI(params);
          let result = await this.getConfigEvalAPI(new FormData());
          this.getStatSetting.mediaCategoryList = this.categoryList;
          this.getStatSetting.mediaTypeList = this.typeList;
          this.getStatSetting.searchRange = Object.keys(this.getNewsGroupInfo);
          this.getStatSetting.mediaCategoryOldList = await this.categoryNameOldAPI();
        } catch (e) {
          console.error(e);
        }
      },
      /**
       * 매체 목록 출력
       */
      showMediaSelection() {
        this.isMediaSelectionVisible = true;
        this.$statConfig.bodyScrolling(false);
      },
      /**
       * 매체 목록 닫기
       */
      closeMediaSelection() {
        this.isMediaSelectionVisible = false;
        this.$statConfig.bodyScrolling(true);
      },
      /**
       * 매체 목록 출력
       */
      showValueSetting() {
        this.isValueSettingVisible = true;
      },
      /**
       * 매체 목록 닫기
       */
      closeValueSetting() {
        this.isValueSettingVisible = false;
      },
      /**
       * 매체 목록 버튼 라벨
       * @returns {string}
       */
      mediaLabel() {
        let result = [], count = 0, item = {};
        let group = this.getStatSetting.groupIsCategory ? this.categoryList : this.typeList;

        if (group) {
          for (let [k,v] of Object.entries(group)) {
            if (!this.getStatSetting.statSelectionMedium[v.name]) {
              this.getStatSetting.statSelectionMedium[v.name] = [];
            }
            item = v;
            item['countCur'] = this.getStatSetting.statSelectionMedium[v.name].length;
            result.push(item);
          }
        }

        return result;
      },
      changeMediaGroup(e) {
        if (e) {
          console.log(e);
        }
        let group = this.getStatSetting.groupIsCategory ? this.categoryList : this.typeList, subGroup = '', rtn = {};
        for (let [k,v] of Object.entries(group)) {
          rtn[v.name] = [];
        }
        for (let [k,v] of Object.entries(this.getStatSetting.statSelectionMedium)) {
          v.forEach(m => {
            // subGroup = this.getStatSetting.groupIsCategory ? m.category_name : m.media_type_name;
            rtn[this.getStatSetting.groupIsCategory ? m.category_name : m.media_type_name].push(m);
          });
        }
        this.getStatSetting.statSelectionMedium = rtn;
      },
      /**
       * 항목 펴기
       */
      showSearchTotalItem() {
        if (this.getStatSetting.searchTotalItemOpen) {
          this.getStatSetting.searchTotalItemOpen = false;
          this.totalItemLabel = '전체 항목 펴기';
        } else {
          this.getStatSetting.searchTotalItemOpen = true;
          this.totalItemLabel = '전체 항목 접기';
        }
      },
      /**
       * 연도 선택시 datepicker 값 변경
       */
      selectYear() {
        if (this.getStatSetting.selectYear && this.getStatSetting.dateType == '1') {
          this.getStatSetting.dateRange.startDate = new Date(this.getStatSetting.selectYear, 0, 1);
          this.getStatSetting.dateRange.endDate = new Date(this.getStatSetting.selectYear, 12, 0);
        } else if (this.getStatSetting.dateType == '2') {
          this.selectMonth();
        } 
      },
      /**
       * 연간 월간 기간 선택
       * @param $event
       */
      selectDateType($event) {
        if ($event.target.value) {
          if ($event.target.value === '1') {
            this.selectYear();
          } else if ($event.target.value === '2') {
            this.selectMonth();
          } else if ($event.target.value === '3') {
            this.getStatSetting.dateRange.startDate = new Date();
            this.getStatSetting.dateRange.endDate = new Date();
          }
        }
      },
      /**
       * 월간 월 선택시 datepicker 날짜변경
       */
      selectMonth() {
        if (this.getStatSetting.selectMonth) {
          this.getStatSetting.dateRange.startDate = new Date(this.getStatSetting.selectYear, Number(this.getStatSetting.selectMonth) - 1, 1);
          this.getStatSetting.dateRange.endDate = new Date(this.getStatSetting.selectYear, Number(this.getStatSetting.selectMonth), 0);
        } 
      },
      /**
       * 자동평가 and or 타입 변경
       */
      selectEval0Type() {
        this.getStatSetting.evaluationItem0 = [];
      },
      /**
       * 평가2 and or 타입 변경
       */
      selectEval2Type() {
        this.getStatSetting.evaluationItem2 = [];
      },
      /**
       *  자동평가 그룹체크 상태
       * @param eval0
       * @returns {boolean}
       */
      stateEval0Group(eval0) {
        if (eval0.sub.length>0) {
          return eval0.sub.every(item=> {
            if (this.getStatSetting.evaluationItem0.indexOf(item.seq) > -1) {
              return true;
            }
          });
        }
      },
      stateEval0GroupNew(eval0_items) {
        if (eval0_items && eval0_items.constructor.name === 'Object') {
          return Object.values(eval0_items).every(item => {
            if (this.getStatSetting.evaluationItem0.indexOf(item.seq) > -1) {
              return true;
            }
          });
        }
      },
      /**
       *  평가2 그룹체크 상태
       * @param eval2
       * @returns {boolean}
       */
      stateEval2Group(eval2) {
        if (eval2.sub.length>0) {
          return eval2.sub.every(item=> {
            if (this.getStatSetting.evaluationItem2.indexOf(item.seq) > -1) {
              return true;
            }
          });
        }
      },
      stateEval2GroupNew(eval2_items) {
        if (eval2_items && eval2_items.constructor.name === 'Object') {
          return Object.values(eval2_items).every(item => {
            if (this.getStatSetting.evaluationItem2.indexOf(item.seq) > -1) {
              return true;
            }
          });
        }
      },
      /**
       * 자동평가 그룹 선택 이벤트
       * @param $event
       * @param eval0
       */
      selectEval0Group($event, eval0) {
        if (eval0.sub) {
          eval0.sub.forEach(sub => {
            if ($event.target.checked) {
              if (this.getStatSetting.evaluationItem0.indexOf(sub.seq) === -1) {
                this.getStatSetting.evaluationItem0.push(sub.seq);
              }
            } else {
              const idx = this.getStatSetting.evaluationItem0.indexOf(sub.seq);
              if (idx > -1) {
                this.getStatSetting.evaluationItem0.splice(idx, 1);
              }
            }
          });
        }
      },
      selectEval0GroupNew($event, eval0_items) {
        if (eval0_items && eval0_items.constructor.name === 'Object') {
          Object.values(eval0_items).forEach(i => {
            if ($event.target.checked) {
              if (this.getStatSetting.evaluationItem0.indexOf(i.seq) === -1) {
                this.getStatSetting.evaluationItem0.push(i.seq);
              }
            } else {
              const idx = this.getStatSetting.evaluationItem0.indexOf(i.seq);
              if (idx > -1) {
                this.getStatSetting.evaluationItem0.splice(idx, 1);
              }
            }
          });
        }
      },
      /**
       * 평가2 그룹 선택 이벤트
       * @param $event
       * @param eval2
       */
      selectEval2Group($event, eval2) {
        if (eval2.sub) {
          eval2.sub.forEach(sub=> {
            if ($event.target.checked) {
              if (this.getStatSetting.evaluationItem2.indexOf(sub.seq) === -1) {
                this.getStatSetting.evaluationItem2.push(sub.seq);
              }
            } else {
              const idx = this.getStatSetting.evaluationItem2.indexOf(sub.seq);
              if (idx > -1) {
                this.getStatSetting.evaluationItem2.splice(idx, 1);
              }
            }
          });
        }
      },
      selectEval2GroupNew($event, eval2_items) {
        if (eval2_items && eval2_items.constructor.name === 'Object') {
          Object.values(eval2_items).forEach(i => {
            if ($event.target.checked) {
              if (this.getStatSetting.evaluationItem2.indexOf(i.seq) === -1) {
                this.getStatSetting.evaluationItem2.push(i.seq);
              }
            } else {
              const idx = this.getStatSetting.evaluationItem2.indexOf(i.seq);
              if (idx > -1) {
                this.getStatSetting.evaluationItem2.splice(idx, 1);
              }
            }
          });
        }
      },
      /**
       * 자동평가 체크박스 상태
       * @param sub
       * @returns {boolean}
       */
      stateEval0(sub) {
        if (sub) {
          if (this.getStatSetting.evaluationItem0.indexOf(sub.seq) > -1) {
            return true;
          }
        }
        return false;
      },
      stateEval0New(item) {
        return (item && item.constructor.name === 'Object' && this.getStatSetting.evaluationItem0.indexOf(item.seq) > -1);
      },
      /**
       * 평가2 체크박스 상태
       * @param sub
       * @returns {boolean}
       */
      stateEval2(sub) {
        if (sub) {
          if (this.getStatSetting.evaluationItem2.indexOf(sub.seq) > -1) {
            return true;
          }
        }
        return false;
      },
      stateEval2New(item) {
        return (item && item.constructor.name === 'Object' && this.getStatSetting.evaluationItem2.indexOf(item.seq) > -1);
      },
      /**
       * 자동평가 체크박스 선택 이벤트
       * @param $event
       * @param eval0
       */
      selectEval0($event, eval0) {
        if ($event.target.checked) {
          if ($event.target.type === 'checkbox') {
            this.getStatSetting.evaluationItem0.push($event.target.value);
          } else {
            eval0.sub.forEach(sub=> {
              const idx = this.getStatSetting.evaluationItem0.indexOf(sub.seq);
              if (idx > -1) {
                this.getStatSetting.evaluationItem0.splice(idx, 1);
              }
            });
            this.getStatSetting.evaluationItem0.push($event.target.value);
          }
        } else {
          const idx = this.getStatSetting.evaluationItem0.indexOf($event.target.value);
          if (idx > -1) {
            this.getStatSetting.evaluationItem0.splice(idx, 1);
          }
        }
      },
      selectEval0New($event, eval0_items) {
        if ($event.target.checked) {
          if ($event.target.type === 'checkbox') {
            this.getStatSetting.evaluationItem0.push($event.target.value);
          } else {
            if (eval0_items && eval0_items.constructor.name === 'Object') {
              Object.values(eval0_items).forEach(i => {
                const idx = this.getStatSetting.evaluationItem0.indexOf($event.target.value);
                if (idx > -1) {
                  this.getStatSetting.evaluationItem0.splice(idx, 1);
                }
              });
            }
            this.getStatSetting.evaluationItem0.push($event.target.value);
          }
        } else {
          const idx = this.getStatSetting.evaluationItem0.indexOf($event.target.value);
          if (idx > -1) {
            this.getStatSetting.evaluationItem0.splice(idx, 1);
          }

          const _ref = this.getStatSetting.evaluationItem0;
          const _idx = _ref.indexOf($event.target.value);
          if (_idx > -1) { _ref.splice(_idx, 1); }
        }
      },
      /**
       * 평가2 체크박스 선택 이벤트
       * @param $event
       * @param eval2
       */
      selectEval2($event, eval2) {
        if ($event.target.checked) {
          if ($event.target.type === 'checkbox') {
            this.getStatSetting.evaluationItem2.push($event.target.value);
          } else {
            eval2.sub.forEach(sub=> {
              const idx = this.getStatSetting.evaluationItem2.indexOf(sub.seq);
              if (idx > -1) {
                this.getStatSetting.evaluationItem2.splice(idx, 1);
              }
            });
            this.getStatSetting.evaluationItem2.push($event.target.value);
          }
        } else {
          const idx = this.getStatSetting.evaluationItem2.indexOf($event.target.value);
          if (idx > -1) {
            this.getStatSetting.evaluationItem2.splice(idx, 1);
          }
        }
      },
      selectEval2New($event, eval2_items) {
        if ($event.target.checked) {
          if ($event.target.type === 'checkbox') {
            this.getStatSetting.evaluationItem2.push($event.target.value);
          } else {
            if (eval2_items && eval2_items.constructor.name === 'Object') {
              Object.values(eval2_items).forEach(i => {
                const idx = this.getStatSetting.evaluationItem2.indexOf($event.target.value);
                if (idx > -1) {
                  this.getStatSetting.evaluationItem2.splice(idx, 1);
                }
              });
            }
            this.getStatSetting.evaluationItem2.push($event.target.value);
          }
        } else {
          const idx = this.getStatSetting.evaluationItem2.indexOf($event.target.value);
          if (idx > -1) {
            this.getStatSetting.evaluationItem2.splice(idx, 1);
          }

          const _ref = this.getStatSetting.evaluationItem2;
          const _idx = _ref.indexOf($event.target.value);
          if (_idx > -1) { _ref.splice(_idx, 1); }
        }
      },
      /**
       * 평가원 체크박스 상태
       * @param value
       * @returns {boolean}
       */
      stateEval1(value) {
        if (this.getEval1CategoryNew) {
          let $result = [];
          this.getEval1CategoryNew.forEach(largeCategory=> {
            if (value === '1') {
              $result.push(largeCategory.seq);
            } else if (value === '2' || value === '3') {
              if (largeCategory.sub !== null) {
                largeCategory.sub.forEach(middleCategory=> {
                  if (value === '2') {
                    $result.push(middleCategory.seq);
                  } else {
                    if (middleCategory.sub !== null) {
                      middleCategory.sub.forEach(smallCategory=> {
                        $result.push(smallCategory.seq);
                      });
                    }
                  }
                });
              }
            }
          });
          if ($result.length > 0) {
            return $result.every(item=> {
              if (this.getStatSetting.evaluationItem1.indexOf(item) > -1) {
                return true;
              }
            });
          } else {
            return false;
          }
        }
      },
      /**
       * 평가1 체크박스 이벤트
       * @param $event
       */
      selectEval1($event) {
        if (this.getEval1CategoryNew.length>0) {
          this.getEval1CategoryNew.forEach(largeCategory=> {
            if ($event.target.value === '1') {
              if ($event.target.checked) {
                if (this.getStatSetting.evaluationItem1.indexOf(largeCategory.seq) === -1) {
                  this.getStatSetting.evaluationItem1.push(largeCategory.seq);
                }
              } else {
                const idx = this.getStatSetting.evaluationItem1.indexOf(largeCategory.seq);
                if (idx > -1) {
                  this.getStatSetting.evaluationItem1.splice(idx, 1);
                }
              }
            } else if ($event.target.value === '2' || $event.target.value === '3') {
              if (largeCategory.sub !== null) {
                largeCategory.sub.forEach(middleCategory=> {
                  if ($event.target.value === '2') {
                    if ($event.target.checked) {
                      if (this.getStatSetting.evaluationItem1.indexOf(middleCategory.seq) === -1) {
                        this.getStatSetting.evaluationItem1.push(middleCategory.seq);
                      }
                    } else {
                      const idx = this.getStatSetting.evaluationItem1.indexOf(middleCategory.seq);
                      if (idx > -1) {
                        this.getStatSetting.evaluationItem1.splice(idx, 1);
                      }
                    }
                  } else {
                    if (middleCategory.sub !== null) {
                      middleCategory.sub.forEach(smallCaergory=> {
                        if ($event.target.checked) {
                          if (this.getStatSetting.evaluationItem1.indexOf(smallCaergory.seq) === -1) {
                            this.getStatSetting.evaluationItem1.push(smallCaergory.seq);
                          }
                        } else {
                          const idx = this.getStatSetting.evaluationItem1.indexOf(smallCaergory.seq);
                          if (idx > -1) {
                            this.getStatSetting.evaluationItem1.splice(idx, 1);
                          }
                        }
                      });
                    }
                  }
                });
              }
            }
          });
        }
      },
      /**
       * 평가1 그룹 ALL 버튼 선택
       * @param group
       */
      selectEval1GroupAll(group) {
        if (!group) return;
        let groupIdx = this.getStatSetting.evaluationItem1.indexOf(group.seq), groupSubIdx, subIdx, _ei1 = this.getStatSetting.evaluationItem1;
        if (groupIdx === -1) {
          _ei1.push(group.seq);
          if (group.sub) {
            group.sub.forEach(group_sub => {
              if (_ei1.indexOf(group_sub.seq) === -1) {
                _ei1.push(group_sub.seq);
              }
              if (group_sub.sub) {
                group_sub.sub.forEach(sub => {
                  if (_ei1.indexOf(sub.seq) === -1) {
                    _ei1.push(sub.seq);
                  }
                });
              }
            });
          }
        } else {
          _ei1.splice(groupIdx, 1);
          if (group.sub) {
            group.sub.forEach(group_sub => {
              groupSubIdx = _ei1.indexOf(group_sub.seq);
              if (groupSubIdx > -1) {
                _ei1.splice(groupSubIdx, 1);
              }
              if (group_sub.sub) {
                group_sub.sub.forEach(sub => {
                  subIdx = _ei1.indexOf(sub.seq);
                  if (subIdx > -1) {
                    _ei1.splice(subIdx, 1);
                  }
                });
              }
            });
          }
        }
      },

      /**
       * 매체선택 체크박스
       * @param $event
       */
      selectMediaAll($event) {
        if ($event.target.checked) {
          let groupList = this.getStatSetting.groupIsCategory ? this.categoryList : this.typeList, group;
          this.getStatSetting.mediaSelectionOptions = [];
          for (let [k,v] of Object.entries(groupList)) {
            this.getStatSetting.mediaSelectionOptions.push(k);
            this.selectMediaGroup($event, v);
          }
        } else {
          this.getStatSetting.statSelectionMedium = {};
          this.getStatSetting.mediaSelectionOptions = [];
        }
      },
      /**
       * 매체선택 전체 선택 상태
       * @returns {boolean}
       */
      stateMediaAll() {
        if (this.getMediaList.length > 0) {
          let $result = [], group;
          this.getMediaList.forEach(cate => {
            group = this.getStatSetting.groupIsCategory ? cate.category_id : cate.media_type;
            $result.push(group);
          });
          return $result.every(item => {
            if (this.getStatSetting.mediaSelectionOptions.indexOf(item) > -1) {
              return true;
            }
          });
        }
      },

      selectMediaCount() {
        let total = 0;
        if (this.getStatSetting.statSelectionMedium) {
          for (let key in this.getStatSetting.statSelectionMedium) {
            if (this.getStatSetting.statSelectionMedium[key].length > 0) {
              total += this.getStatSetting.statSelectionMedium[key].length;
            }
          }
        }
        return total;
      },

      /**
       * 매체선택 카테고리별 체크박스 이벤트
       * @param $event
       * @param category
       */
      selectMediaGroup($event, group) {
        let result = [];
        if (group && group.media) {
          this.getStatSetting.statSelectionMedium[group.name] = [];
          if (!$event.target.checked) {
            result = [];
          } else {
            group.media.forEach(media => {
              result.push(media);
            });
          }
          this.getStatSetting.statSelectionMedium[group.name] = result;
        }
      },

      /**
       * 자동평가 리셋
       */
      resetAuto() {
         this.getStatSetting.evaluationItem0 = [];
      },
      /**
       * 평가1 리셋
       */
      resetEval1() {
        this.getStatSetting.evaluationItem1 = [];
      },
      /**
       * 평가2 리셋
       */
      resetEval2() {
        this.getStatSetting.evaluationItem2 = [];
      },
      /**
       * 전체 리셋
       */
      reset() {
        this.getStatSetting.searchRange = Object.keys(this.getNewsGroupInfo);
        this.selectMediaAll({target: {checked: true}});
        this.getStatSetting.mediaCategoryList = this.categoryList;
        this.getStatSetting.mediaTypeList = this.typeList;
      },
      countMediaResult(key, medium) {
        let groupList = this.getStatSetting.groupIsCategory ? this.categoryList : this.typeList, result = false;
        for (let [k,v] of Object.entries(groupList)) {
          if (v.name === key) {
            if (v.count === medium.length) result = true;
            break;
          }
        }
        return result;
      },
      /**
       * 매체 선택 결과값 출력
       * @returns {string}
       */
      selectMediaResult(medium) {
        let result = '';
        if (medium.length > 0) {
          let mediaArray = [];
          medium.forEach(media=> {
            mediaArray.push(media.media_name);
          });
          result += mediaArray.join(', ');
        }
        return result;
      },
      /**
       * 평가1 결과값 출력
       * @returns {string}
       */
      selectEval1Result() {
        let tmpArray = {};
        if (this.getEval1CategoryNew) {
          let largeIdx = 0;
          let middleIdx = 0;
          let smallIdx = 0;
          this.getEval1CategoryNew.forEach(largeCategory=> {
            if (this.getStatSetting.evaluationItem1.indexOf(largeCategory.seq) > -1) {
              if (largeIdx === 0) {
                tmpArray['대분류'] = [];
              }
              tmpArray['대분류'].push(largeCategory.name);
              largeIdx++;
            }
            if (largeCategory.sub) {

              largeCategory.sub.forEach(middleCategory=> {
                if (this.getStatSetting.evaluationItem1.indexOf(middleCategory.seq) > -1) {
                  if (middleIdx === 0) {
                    tmpArray['중분류'] = [];
                  }
                  tmpArray['중분류'].push(middleCategory.name);
                  middleIdx++;
                }
                if (middleCategory.sub) {

                  middleCategory.sub.forEach(smallCategory=> {
                    if (this.getStatSetting.evaluationItem1.indexOf(smallCategory.seq) > -1) {
                      if (smallIdx === 0) {
                        tmpArray['소분류'] = [];
                      }
                      tmpArray['소분류'].push(smallCategory.name);
                      smallIdx++;
                    }
                  });
                }
              });
            }
          });

        }
        return tmpArray;
      },
      /**
       * 자동평가 결과값 출력
       * @returns {string}
       */
      selectEval0Result() {
        let rtn = {};
        if (this.getConfigEval && this.getConfigEval.group && this.getConfigEval.group_item && this.getConfigEval.group['AT'] && this.getConfigEval.group['AT'].constructor.name === 'Object') {
          let items;
          Object.keys(this.getConfigEval.group['AT']).forEach(gs => {
            items = Object.values(this.getConfigEval.group_item[gs]);
            items.forEach(item => {
              if (this.getStatSetting.evaluationItem0.indexOf(item.seq) > -1) {
                if (!rtn[item.group_name]) rtn[item.group_name] = [];
                rtn[item.group_name].push(item.value);
              }
            });
          });
        }
        return rtn;
      },
      /**
       * 평가2 결과값 출력
       * @returns {string}
       */
      selectEval2Result() {
        let rtn = {};
        if (this.getConfigEval && this.getConfigEval.group && this.getConfigEval.group_item && this.getConfigEval.group['M2'] && this.getConfigEval.group['M2'].constructor.name === 'Object') {
          let items;
          Object.keys(this.getConfigEval.group['M2']).forEach(gs => {
            items = Object.values(this.getConfigEval.group_item[gs]);
            items.forEach(item => {
              if (this.getStatSetting.evaluationItem2.indexOf(item.seq) > -1) {
                if (!rtn[item.group_name]) rtn[item.group_name] = [];
                rtn[item.group_name].push(item.value);
              }
            });
          });
        }
        return rtn;
      },

      
      
      /**
       *
       * @param e
       * @param upperSeq
       * @param subSeq
       */
      radioButtonToggle(e, upperSeq, subSeq) {
        if(e.target.attributes.wasChecked.value === 'true') {
          e.target.checked = false;
          e.target.attributes.wasChecked.value = false;
          const idx = this.getStatSetting.evaluationItem2.indexOf(subSeq);
          if( idx > -1 ) this.getStatSetting.evaluationItem2.splice(idx, 1);
        } else {
          e.target.attributes.wasChecked.value = true;
        }
        const sub_cate = document.querySelectorAll('input[name=ft2_a'+upperSeq+']');
        if (window.NodeList && !NodeList.prototype.forEach) {
          NodeList.prototype.forEach = Array.prototype.forEach;
        }
        sub_cate.forEach(sub_one => {
          if(sub_one.attributes.id.value !== ('ft2_b'+subSeq)){
            sub_one.attributes.wasChecked.value = false;
          }
        });
      },
      radioButtonToggleAuto(e, groupSeq, itemSeq) {
        if (e.target.attributes.wasChecked.value === 'true') {
          e.target.checked = false;
          e.target.attributes.wasChecked.value = 'false';
          const idx = this.getStatSetting.evaluationItem0.indexOf(itemSeq);
          if (idx > -1) this.getStatSetting.evaluationItem0.splice(idx, 1);
        } else {
          e.target.attributes.wasChecked.value = 'true';
        }
        if (window.NodeList && !NodeList.prototype.forEach) {
          NodeList.prototype.forEach = Array.prototype.forEach;
        }
        let _idx = -1, _ref = this.getStatSetting.evaluationItem0;
        this.$el.querySelectorAll('input[name=ft0_a' + groupSeq + ']').forEach(sub_one => {
          if (sub_one.attributes.id.value !== ('ft0_b' + itemSeq)) {
            sub_one.attributes.wasChecked.value = 'false';
            _idx = _ref.indexOf(sub_one.value);
            if (_idx > -1) _ref.splice(_idx, 1);
          }
        });
      },
      radioButtonToggleM2(e, groupSeq, itemSeq) {
        if (e.target.attributes.wasChecked.value === 'true') {
          e.target.checked = false;
          e.target.attributes.wasChecked.value = 'false';
          const idx = this.getStatSetting.evaluationItem2.indexOf(itemSeq);
          if (idx > -1) this.getStatSetting.evaluationItem2.splice(idx, 1);
        } else {
          e.target.attributes.wasChecked.value = 'true';
        }
        if (window.NodeList && !NodeList.prototype.forEach) {
          NodeList.prototype.forEach = Array.prototype.forEach;
        }
        let _idx = -1, _ref = this.getStatSetting.evaluationItem2;
        this.$el.querySelectorAll('input[name=ft2_a' + groupSeq + ']').forEach(sub_one => {
          if (sub_one.attributes.id.value !== ('ft2_b' + itemSeq)) {
            sub_one.attributes.wasChecked.value = 'false';
            _idx = _ref.indexOf(sub_one.value);
            if (_idx > -1) _ref.splice(_idx, 1);
          }
        });
      },
      /**
       * 검색범위 전체선택 check 여부
       * @returns {boolean}
       */
      searchRangeIsAll() {
        let rtn = true;
        for (let [k,v] of Object.entries(this.getNewsGroupInfo)) {
          rtn = rtn && (this.getStatSetting.searchRange.indexOf(v.lvalue) > -1);
        }
        return rtn;
      },

      /**
       *검색범위 전체선택 체크박스 체크,체크해제 시\
       * @param $event
       */
      searchRangeAllCheck($event) {
        let $this = this;
        const newsMe = this.getNewsGroupInfo;
        for(let [k,v] of Object.entries(newsMe)) {
          if($event.target.checked){
            if($this.getStatSetting.searchRange.indexOf(v.lvalue) === -1){
              $this.getStatSetting.searchRange.push(v.lvalue);
            }
          } else {
            $this.getStatSetting.searchRange = [];
          }
        }
      },

      /**
       * 특정 그룹으로 묶기
       * @param list
       * @param key
       */
      mediaGroups(list, key) {
        const result = {};
        if (Array.isArray(list)) {
          list.forEach(item => {
            if (item.used !== String(this.useCheck)) {
              if (!result[item[key]]) {
                result[item[key]] = [];
              }
              result[item[key]].push(item);
            }
          });
        }
        return result;
      },

      crossStandard(name) {
        const label = document.querySelectorAll('.cross-std > label');
        if (label === undefined) return ;
      },

      maxLengthCheck(object) {
        if(object.value.length > 1) {
          object.value = object.value.slice(0, 1);
        }
      },

      showOptionSetting() {
        this.opButtonTxt = this.opButtonTxt === '열기↪' ? '닫기↩' : '열기↪';
      }

    }, // methods


  };
</script>

<style scoped>
  /* ============================= 검색옵션 스타일[Start]] ============================= */
  .template-search {
    height: 395px;
    margin: 0px 0px 10px 0px;
    border-bottom: 2px solid rgba(173,173,173, 0.5);
    box-shadow: 0 4px 6px -4px #ddd;
    z-index: 0;
  }
  .sch_area .sch_cont .stat_option label {
    margin-right: 0;
  }
  .dn_cross {
    display: none;
  }
  .crossAxis select {
    width: 30%;
    margin-right: 3%;
  }
  .fake_button_upper {
    overflow: hidden;
  }
  .fake_button {
    width: 100%;
    min-height: 26px;
    padding: 5px;
    overflow: hidden;
    border: 1px #aeaeae solid;
    background: #f2f2f2;
    vertical-align: middle;
    margin-top: 3px;
  }
  .test_button {
    background: url(/img/ico_pre.467a0115.png) -30px 0 no-repeat !important;
    border: 0 !important;
    max-height: 18px !important;
    min-height: 18px !important;
    margin: -8px 0 0 0 !important;
    text-indent: -9999px;
    cursor: pointer;
    padding: 0 !important;
  }
  .test_button:focus {
    outline: none;
  }
  .sch_area .sch_cont { min-height: 360px; }

  dd.datebox header { width: 100% !important; }
  dd.datebox span {margin-right: 0 !important; }
  .wither {opacity: 0.5; }

.sch_area > .sch_ {
  width: 800px;
  float: left;
  margin: 0px 0px 0 20px;
}
.sch_area > .sch_ > .sch_element {
  display: flex;
  margin: 0px 0px 8px 0px;
}
.sch_area .sch_ .sch_element dt {
    float: left;
    width: 100px;
    font-size: 13px;
    color: #808080;
    font-weight: 600;
    padding-bottom: 10px;
}
/* ============================= 검색옵션 스타일[End] ============================= */

</style>
