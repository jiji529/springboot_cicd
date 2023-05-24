<template>
  <div class="set_val_box">
    <div class="set_title">
      <h2>평가1 항목 설정</h2>
      <p>*평가1의 대/중/소 항목 추가 및 기사가치 설정을 할 수 있습니다.</p>
    </div>
    <div class="set_cont">
      <!-- s: set_list_area -->
      <div class="set_list_area">
        <div class="set_cont_tit"><span>&gt; 전체 항목</span>
          <span class="help"
                :class="{'on' : eval1Help}"
                @click="eval1Help=!eval1Help">아이콘 설명</span>
          <!-- 클릭하면 layer_pop에 display:block-->
        </div>
        <div class="layer_pop" v-show="eval1Help">
          <h2>평가1 대중소 항목 설명</h2>
          <p>*대/중/소 항목 위치는 아래와 같습니다.<br>
            오른쪽에는 기사가치 값이 표기됩니다.</p>
          <h2>항목 상태 설멍</h2>
          <span class="state">사용 항목</span><span class=" state gray">비사용 항목</span>
          <div class="ex_box">
            <ul>
              <li>
                <div class="set_li"><span class="item_tit">대 항목</span><span class="item_val">기사가치</span></div>
                <dl>
                  <dt>
                    <div class="set_li"><span class="item_tit">중 항목</span><span class="item_val">기사가치</span></div>
                  </dt>
                  <dd>
                    <div class="set_li"><span class="item_tit">소 항목</span><span class="item_val">기사가치</span></div>
                  </dd>
                </dl>
              </li>
            </ul>
          </div>
        </div>
        <!-- s: set_list_box -->
        <div class="set_list_box  box1">
          <slot v-if="edit">
            <ul v-if="evalList!==null"
                v-for="(largeCategory,l) in evalList"
                :key="largeCategory.seq">
              <li class="edit">
                <div class="set_li">
                  <span class="item_tit" :class="{'conceal': largeCategory.isUse==='N'}">
										<input type="checkbox"
                           :checked="statChecked(largeCategory)"
                           @change="selectCategory(largeCategory)"
                           @click="largeCategory.checked = !largeCategory.checked"
                           :id="'sch_ev10'+l">
										<label v-bind:for="'sch_ev10'+l"><span></span></label>
										<input type="text"
                           :class="{'danger': errors.has('sch_ev11'+l)}"
                           v-validate="'required|max:24'"
                           data-vv-as="항목명"
                           placeholder="항목명 입력"
                           maxlength="24"
                           :name="'sch_ev11'+l"
                           v-model="largeCategory.name">
                  </span>
                  <span class="item_rt">
                    <span class="item_val" :class="{'conceal': largeCategory.isUse==='N'}">
										<input type="text"
                           v-validate="{ required: true, regex:  /^[-]?\d+(?:[.]\d+)?$/, max:12 }"
                           :name="'sch_ev12'+l"
                           :class="{'danger': errors.has('sch_ev12'+l)}"
                           data-vv-as="기사 가치"
                           placeholder="가치"
                           maxlength="12"
                           v-model="largeCategory.score">
										</span>
                    <span class="list_tree">
                      <ul class="btn_area">
                       <li :class="{'on':largeCategory.isUse==='Y'}"><a @click="largeCategory.isUse='Y'">사용</a></li>
											<li :class="{'on':largeCategory.isUse==='N'}"><a @click="largeCategory.isUse='N'">비사용</a></li>
                      </ul>
										</span>
                  </span>
                </div>
                <dl v-if="largeCategory.sub!==null" v-for="(middleCategory, m) in largeCategory.sub" :ref="'large'+l"
                    :key="middleCategory.seq" :class="{'conceal':largeCategory.isUse==='N'}">
                  <dt>
                    <div class="set_li">
                      <span class="item_tit" :class="{'conceal':middleCategory.isUse==='N'}">
                        <input type="checkbox"
                               :checked="statChecked(middleCategory)"
                               @click="middleCategory.checked = !middleCategory.checked"
                               @change="selectCategory(middleCategory)"
                               :id="'sch_ev10'+l+m"/>
                        <label v-bind:for="'sch_ev10'+l+m">
                      <span></span>
                    </label>
                        <input type="text"
                               :class="{'danger': errors.has('sch_ev11'+l+m)}"
                               v-validate="'required|max:24'"
                               data-vv-as="중 항목명"
                               placeholder="중 항목명 입력"
                               maxlength="24"
                               :name="'sch_ev11'+l+m"
                               v-model="middleCategory.name"/>
                      </span>
                      <span class="item_rt">
                        <span class="item_val" :class="{'conceal':middleCategory.isUse==='N'}">
                          <input type="text"
                                 v-validate="{ required: true, regex:  /^[-]?\d+(?:[.]\d+)?$/, max:12 }"
                                 :name="'sch_ev12'+l+m"
                                 :class="{'danger': errors.has('sch_ev12'+l+m)}"
                                 data-vv-as="기사 가치"
                                 placeholder="가치"
                                 maxlength="12"
                                 v-model="middleCategory.score"/>
                        </span>
                        <span class="list_tree">
                          <ul class="btn_area">
                            <li :class="{'on':middleCategory.isUse==='Y'}"><a
                                @click="middleCategory.isUse='Y'">사용</a></li>
											<li :class="{'on':middleCategory.isUse==='N'}"><a @click="middleCategory.isUse='N'">비사용</a></li>
										</ul>
                        </span>
                      </span>
                    </div>
                  </dt>
                  <dd v-if="middleCategory.sub!==null"
                      v-for="(smallCategory,s) in middleCategory.sub"
                      :ref="'middle'+m"
                      :key="smallCategory.seq"
                      :class="{'conceal':middleCategory.isUse==='N'}">
                    <div class="set_li">
                          <span class="item_tit" :class="{'conceal':smallCategory.isUse==='N'}">
                            <input type="checkbox"
                                   :checked="smallCategory.checked"
                                   @click="smallCategory.checked = !smallCategory.checked"
                                   :id="'sch_ev10'+l+m+s">
                            <label v-bind:for="'sch_ev10'+l+m+s">
                              <span></span>
                            </label>
                            <input type="text"
                                   :class="{'danger': errors.has('sch_ev11'+l+m+s)}"
                                   v-validate="'required|max:24'"
                                   data-vv-as="소 항목명"
                                   placeholder="소 항목명 입력"
                                   maxlength="24"
                                   :name="'sch_ev11'+l+m+s"
                                   v-model="smallCategory.name">
                          </span>
                      <span class="item_rt">
                            <span class="item_val" :class="{'conceal':smallCategory.isUse==='N'}">
                              <input type="text"
                                     v-validate="{ required: true, regex:  /^[-]?\d+(?:[.]\d+)?$/, max:12 }"
                                     :name="'sch_ev12'+l+m+s"
                                     :class="{'danger': errors.has('sch_ev12'+l+m+s)}"
                                     data-vv-as="기사 가치"
                                     placeholder="가치"
                                     maxlength="12"
                                     v-model="smallCategory.score">
                            </span>
                            <span class="list_tree">
                              <ul class="btn_area">
                                <li :class="{'on':smallCategory.isUse==='Y'}">
                                  <a @click="smallCategory.isUse='Y'">사용</a>
                                </li>
                                <li :class="{'on':smallCategory.isUse==='N'}">
                                  <a @click="smallCategory.isUse='N'">비사용</a>
                                </li>
                              </ul>
                            </span>
                          </span>
                    </div>
                  </dd>
                </dl>
              </li>
            </ul>
          </slot>
          <slot v-else>
            <ul>
              <li v-if="evalList!==null"
                  v-for="(largeCategory,l) in evalList"
                  :key="largeCategory.seq" :class="{'conceal':largeCategory.isUse==='N'}">
                <div class="set_li" @click="addCategory=largeCategory" >
                  <span class="item_tit">{{largeCategory.name}}</span>
                  <span class="item_rt">
                  <span class="item_val">{{largeCategory.score}}</span>
                <span class="list_tree"
                      :class="{'close':largeCategory.sub!==null}"
                      :id="'large'+l"
                      @click="toggle($event)"></span>
                </span>
                </div>
                <dl v-if="largeCategory.sub!==null"
                    v-for="(middleCategory, m) in largeCategory.sub"
                    :ref="'large'+l"
                    :class="{'conceal':middleCategory.isUse==='N'}"
                    :key="middleCategory.seq">
                  <dt>
                    <div class="set_li">
                      <span class="item_tit">{{middleCategory.name}}</span>
                      <span class="item_rt">
                      <span class="item_val">{{middleCategory.score}}</span>
                      <span class="list_tree"
                            :class="{'close':middleCategory.sub!==null}"
                            :id="'middle'+m"
                            @click="toggle($event)"></span>
                    </span>
                    </div>
                  </dt>
                  <dd v-if="middleCategory.sub!==null"
                      v-for="smallCategory in middleCategory.sub"
                      :ref="'middle'+m"
                      :class="{'conceal':smallCategory.isUse==='N'}"
                      :key="smallCategory.seq">
                    <div class="set_li">
                      <span class="item_tit">{{smallCategory.name}}</span>
                      <span class="item_rt">
                    <span class="item_val">{{smallCategory.score}}</span>
                      <span class="list_tree"></span>
                    </span>
                    </div>
                  </dd>
                </dl>
              </li>
            </ul>
          </slot>
        </div>
        <!-- e: set_list_box -->
        <div class="cont_btn">
          <slot v-if="edit">
            <ul class="btn_left">
              <li class="move"><a @click="topClass(evalList)" class="btn_first">최상단 이동</a></li>
              <li class="move"><a @click="upClass(evalList)" class="btn_top">위로 이동</a></li>
              <li class="move"><a @click="downClass(evalList)" class="btn_bottom">아래로 이동</a></li>
              <li class="move"><a @click="bottomClass(evalList)" class="btn_last">최하단 이동</a></li>
            </ul>
            <ul class="btn_right">
              <li><a @click="edit=false;onSetting()">취소</a></li>
              <li class="btn_bl"><a @click="validationCategory">저장</a></li>
            </ul>
          </slot>
          <slot v-else>
            <ul class="btn_left">
              <li><a @click="toggleAll(true)">전체 접기</a></li>
              <li><a @click="toggleAll(false)">전체 펼치기</a></li>
            </ul>
            <ul class="btn_right">
              <li><a @click="edit=true">편집</a></li>
            </ul>
          </slot>
        </div>
      </div>
      <!-- e: set_list_area -->
      <Eval1Insert :category="addCategory!==null?addCategory:null" @reset="addCategory=null;onSetting();"></Eval1Insert>
    </div>
    <!-- e: set_cont -->
  </div>
</template>

<script>
  /* eslint-disable no-console */

  import {mapActions} from 'vuex';
  import Eval1Insert from './Eval1Insert';

  export default {
    name: 'EvaluationItemEval1',
    components: {Eval1Insert},
    data() {
      return {
        edit: false,
        evalList: null,
        eval1Help: false,
        largeOpen: false,
        middleOpen: [],
        smallOpen: [],
        addCategory: null
      };
    },

    mounted: function() {
      this.onSetting();
    },
    methods: {
      ...mapActions(['getEval1CategoryAPI', 'setEval1CategoryAPI']),
      async apply() {
        try {
          let params = new FormData();
          params.append('q', JSON.stringify(this.evalList));
          if (await this.setEval1CategoryAPI(params)) {
            this.onSetting();
            this.edit = false;
            alert('변경되었습니다.');
          } else {
            this.$eventBus.$emit('kickOut');
          }
        } catch (e) {
          console.error(e);
        }
      },
      /**
       * API LOAD
       * @returns {Promise<void>}
       */
      async onSetting() {
        try {
          let params = new FormData();
          params.append('t', 'a');
          this.evalList = await this.getEval1CategoryAPI(params);
          if (this.evalList) {
            this.evalList.map(large => {
              this.$set(large, 'checked', false);
              if (large.sub) {
                large.sub.map(middle => {
                  this.$set(middle, 'checked', false);
                  if (middle.sub) {
                    middle.sub.map(small => {
                      this.$set(small, 'checked', false);
                    });
                  }
                });
              }
            });
          }
        } catch (e) {
          console.error(e);
        }
      },
      /**
       * 행 접기
       * @param $event
       */
      toggle($event) {
        if (this.$refs[$event.target.id]) {
          let display = $event.target.classList.contains('close');
          if (display) {
            $event.target.classList.replace('close', 'open');
          } else {
            $event.target.classList.replace('open', 'close');
          }
          this.$refs[$event.target.id].map(function(ref) {
            if (display) {
              ref.style.display = 'none';
            } else {
              ref.style.display = 'block';
            }
          });
        }
      },
      /**
       * 전체 접기 /펼치기
       * @param $event
       */
      toggleAll(display) {
        if (this.$refs) {
          let target = '.close';
          if (!display) {
            target = '.open';
          }
          if (this.$el.querySelectorAll(target).length > 0) {
            let list = this.$el.querySelectorAll(target);
            [].forEach.call(list, function(target) {
              if (display) {
                target.classList.remove('close');
                target.classList.add('open');
                // target.classList.replace('close', 'open');
              } else {
                target.classList.remove('open');
                target.classList.add('close');
                // target.classList.replace('open', 'close');
              }
            });
          }
          for (let key in this.$refs) {
            this.$refs[key].map(function(ref) {
              if (display) {
                ref.style.display = 'none';
              } else {
                ref.style.display = 'block';
              }
            });
          }
        }
      },
      /**
       * 공백 체크
       */
      validationCategory() {
        this.$validator.validateAll().then((result) => {
          if (result) {
            this.apply();
          } else {
            const error = this.errors.items[0];
            alert(error.msg);
            this.$el.querySelector('[name=' + error.field + ']').focus();
          }
        });
      },
      /**
       * 체크박스 상태값
       */
      statChecked(category) {
        let checked = false;
        if (category.sub.length > 0) {
          checked = category.sub.every(sub => {
            return sub.checked === true;
          });
          category.checked = checked;
        } else {
            checked = category.checked;
        }
        return checked;
      },
      /**
       * 체크박스 선택시 이벤트
       */
      selectCategory(category) {
        if (category.sub) {
          category.sub.map(sub => {
            sub.checked = category.checked;
            this.selectCategory(sub);
          });
        }
      },
      /**
       * 그룹 내 상단 순서 변경 이동
       */
      upPos(parent, before_pos, after_pos) {
        if (parent && before_pos >= 0) {
          if (before_pos > 0) {
            parent.splice(after_pos, 0, parent.splice(before_pos, 1)[0]);
          }
        }
      },
      /**
       * 그룹 내 하단으로 순서 변경
       */
      downPos(parent, before_pos, after_pos) {
        if (parent && before_pos >= 0) {
          const max = parent.length - 1;
          if (max > before_pos) {
             parent.splice(after_pos, 0, parent.splice(before_pos, 1)[0]);
          }
        }
      },
      /**
       * 그룹 내 상단으로 한칸 이동
       */
      upClass(evalList) {
        if (evalList) {
          const allChecked = evalList.some(large => {
            return large.checked === true;
          });
          evalList.map(category => {
            if (allChecked) {
              if (category.checked) {
                const pos = evalList.indexOf(category);
                this.upPos(evalList, pos, pos - 1);
              }
            } else {
              this.upClass(category.sub);
            }
          });
        }
      },
      /**
       * 그룹 내 하단으로 한칸 이동
       */
      downClass(evalList) {
        if (evalList.length > 0) {
          const allChecked = evalList.some(large => {
            return large.checked === true;
          });
          const tmpEvalList = Object.assign([], evalList).reverse();
          tmpEvalList.map(category => {
            if (allChecked) {
              if (category.checked) {
                const pos = evalList.indexOf(category);
                this.downPos(evalList, pos, pos + 1);
              }
            } else {
              this.downClass(category.sub);
            }
          });
        }
      },
      /**
       * 그룹 내 최상단이동
       */
      topClass(evalList) {
        if (evalList) {
          const allChecked = evalList.some(large => {
            return large.checked === true;
          });
          evalList.map(category => {
            if (allChecked) {
              if (category.checked) {
                const pos = evalList.indexOf(category);
                this.upPos(evalList, pos, 0);
              }
            } else {
              this.topClass(category.sub);
            }
          });
        }
      },
      /**
       * 그룹 내 최 하단 이동
       */
      bottomClass(evalList) {
        if (evalList) {
          const allChecked = evalList.some(large => {
            return large.checked === true;
          });
          const tmpEvalList = Object.assign([], evalList).reverse();
          tmpEvalList.map(category => {
            if (allChecked) {
              if (category.checked) {
                const pos = evalList.indexOf(category);
                this.downPos(evalList, pos, evalList.length);
              }
            } else {
              this.bottomClass(category.sub);
            }
          });
        }
      }

    }

  };


</script>

<style>
  /* .edit dl > dl {    padding-left: 25px;  }*/
</style>
