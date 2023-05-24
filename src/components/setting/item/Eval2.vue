<template>
  <div class="set_val_box">
    <div class="set_title">
      <h2>평가2 항목 설정</h2>
      <p>*평가2의 항목 추가 및 기사가치 설정을 할 수 있습니다.</p>
    </div>
    <div class="set_cont">
      <!-- s: set_list_area -->
      <div class="set_list_area">
        <div class="set_cont_tit"><span>&gt; 전체 항목</span>
          <p>*평가 항목값 수정은 '사용'상태 시 가능합니다.</p>
          <!-- 클릭하면 layer_pop에 display:block-->
        </div>
        <!-- s: set_list_box -->
        <div class="set_list_box">
          <slot v-if="edit">
              <dl class="edit"
                  v-if="evalList!==null"
                  v-for="(evaluation,ei) in evalList"
                  :ref="'large2'"
                  :key="evaluation.upper_cate_seq">
                <dt>
                  <div class="set_li"><span class="item_tit" :class="{'conceal':evaluation.upper_cate_use==='N'}">
										<input type="checkbox"
                           :checked="statChecked(evaluation)"
                           @click="evaluation.checked = !evaluation.checked"
                           @change="selectCategory(evaluation)"
                           :id="'sch_ft1_c'+ei">
										<label v-bind:for="'sch_ft1_c'+ei"><span></span></label>
										<input type="text"
                           :class="{'danger': errors.has('sch_ft1_c'+ei)}"
                           v-validate="'required|max:24'"
                           data-vv-as="항목명"
                           placeholder="항목명 입력"
                           maxlength="24"
                           :name="'sch_ft1_c'+ei"
                           v-model="evaluation.upper_cate_name">
										</span><span class="item_rt"><span class="list_tree">
										<ul class="btn_area">
												<li :class="{'on':evaluation.upper_cate_use==='Y'}">
                          <a @click="evaluation.upper_cate_use='Y'">사용</a>
                        </li>
											<li :class="{'on':evaluation.upper_cate_use==='N'}">
                        <a @click="evaluation.upper_cate_use='N'">비사용</a>
                      </li>
										</ul>

										</span></span></div>
                </dt>
                <dd v-if="evaluation.sub!==null" v-for="(classify,ci) in evaluation.sub" :key="ci" :class="{'conceal':evaluation.upper_cate_use==='N'}">
                  <div class="set_li"><span class="item_tit" :class="{'conceal':classify.use==='N'}">
										<input type="checkbox"
                           :checked="classify.checked"
                           @click="classify.checked = !classify.checked"
                           :id="'sch_ft1_c'+ei+ci">
										<label v-bind:for="'sch_ft1_c'+ei+ci"><span></span></label>
										<input type="text"
                           :class="{'danger': errors.has('sch_ft1_c'+ei+ci)}"
                           v-validate="'required|max:24'"
                           :name="'sch_ft1_c'+ei+ci"
                           data-vv-as="항목명"
                           placeholder="항목명 입력"
                           maxlength="24"
                           v-model="classify.name">
										</span><span class="item_rt"><span class="item_val" :class="{'conceal':classify.use==='N'}">
										<input type="text"
                           v-validate="{ required: true, regex:  /^[-]?\d+(?:[.]\d+)?$/, max:12 }"
                           :name="'sch_ft1_d'+ei+ci"
                           :class="{'danger': errors.has('sch_ft1_d'+ei+ci)}"
                           data-vv-as="기사 가치"
                           placeholder="가치"
                           maxlength="12"
                           v-model="classify.score">
										</span><span class="list_tree">
										<ul class="btn_area">
											<li :class="{'on':classify.use==='Y'}"><a @click="classify.use='Y'">사용</a></li>
											<li :class="{'on':classify.use==='N'}"><a @click="classify.use='N'">비사용</a></li>
										</ul>
										</span></span></div>
                </dd>
              </dl>
          </slot>
          <slot v-else>
            <ul>
              <li v-if="evalList!==null"
                  v-for="(evaluation,ei) in evalList"
                  :key="ei" :class="{'conceal':evaluation.upper_cate_use==='N'}">
                <div class="set_li" @click="addClass=evaluation">
                  <span class="item_tit">{{evaluation.upper_cate_name}}</span>
                  <span class="item_rt">
                  <span class="item_val"></span>
                <span class="list_tree"
                      :class="{'close':evaluation.sub!==null}"
                      :id="'evaluation'+ei"
                      @click="toggle($event)"></span>
                </span>
                </div>
                <dl v-if="evaluation.sub!==null"
                    v-for="classify in evaluation.sub"
                    :ref="'evaluation'+ei"
                    :class="{'conceal':classify.use==='N'}"
                    :key="classify.seq">
                  <dt>
                    <div class="set_li">
                      <span class="item_tit">{{classify.name}}</span>
                      <span class="item_rt">
                      <span class="item_val">{{classify.score}}</span>
                      <span class="list_tree"></span>
                    </span>
                    </div>
                  </dt>

                </dl>
              </li>
            </ul>
          </slot>
        </div>
        <!-- e: set_list_box -->
        <div class="cont_btn">
          <slot v-if="edit">
            <ul class="btn_left">
              <li class="move"><a @click="topClass" class="btn_first">최상단 이동</a></li>
              <li class="move"><a @click="upClass" class="btn_top">위로 이동</a></li>
              <li class="move"><a @click="downClass" class="btn_bottom">아래로 이동</a></li>
              <li class="move"><a @click="bottomClass" class="btn_last">최하단 이동</a></li>
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
      <!-- s: set_add_area -->
      <Eval2Insert :eval="addClass!==null?addClass:null" @reset="addClass=null;onSetting();"></Eval2Insert>
      <!-- e: set_add_area -->
    </div>
    <!-- e: set_cont -->
  </div>
</template>

<script>
  /* eslint-disable no-console */

  import {mapActions} from 'vuex';
  import Eval2Insert from './Eval2Insert';

  export default {
    name: 'EvaluationItemEval2',
    components: {Eval2Insert},
    data() {
      return {
        edit: false,
        evalList: null,
        largeOpen: false,
        middleOpen: [],
        smallOpen: [],
        addClass: null
      };
    },
    mounted: function() {
      this.onSetting();
    },
    methods: {
      ...mapActions(['getEval2ClassAPI','setEval2ClassAPI']),
      async apply() {
        try {
          let params = new FormData();
          params.append('q', JSON.stringify(this.evalList));
          if (await this.setEval2ClassAPI(params)) {
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
          this.evalList = await this.getEval2ClassAPI(params);
          if (this.evalList) {
            this.evalList.map(category => {
              this.$set(category, 'checked', false);
              if (category.sub) {
                category.sub.map(classify => {
                  this.$set(classify, 'checked', false);
                });
              }
            });
          }
        } catch (e) {
          console.error(e);
        }
      },
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
                target.classList.replace('close', 'open');
              } else {
                target.classList.replace('open', 'close');
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
      statChecked(evaluation) {
        let checked = false;
        if (evaluation.sub) {
          checked = evaluation.sub.every(classify => {
            return classify.checked === true;
          });
        }
        evaluation.checked = checked;
        return checked;
      },
      selectCategory(category) {
        if (category.sub) {
          category.sub.map(classify => classify.checked = category.checked);
        }
      },

      upPos(parent, before_pos, after_pos) {
        if (parent && before_pos >= 0) {
          if (before_pos > 0) {
            parent.splice(after_pos, 0, parent.splice(before_pos, 1)[0]);
          }
        }
      },
      downPos(parent, before_pos, after_pos) {

        if (parent && before_pos >= 0) {
          const max = parent.length - 1;
          if (max > before_pos) {
            parent.splice(after_pos, 0, parent.splice(before_pos, 1)[0]);
          }
        }
      },
      upClass() {
        if (this.evalList) {
          let evalChecked = this.evalList.some(evaluation => {
            return evaluation.checked === true;
          });
          this.evalList.map(evaluation => {

            if (evalChecked) {
              if (evaluation.checked) {
                const pos = this.evalList.indexOf(evaluation);
                this.upPos(this.evalList, pos, pos - 1);
              }
            } else {
              if (evaluation.sub) {
                evaluation.sub.map(classify => {
                  if (classify.checked) {
                    const pos = evaluation.sub.indexOf(classify);
                    this.upPos(evaluation.sub, pos, pos - 1);
                  }
                });
              }
            }

          });
        }
      },
      downClass() {
        if (this.evalList) {
          const evalChecked = this.evalList.some(evaluation => {
            return evaluation.checked === true;
          });
          const tmpEvalList = Object.assign([], this.evalList).reverse();
          tmpEvalList.map(evaluation => {
            if (evalChecked) {
              if (evaluation.checked) {
                const pos = this.evalList.indexOf(evaluation);
                this.downPos(this.evalList, pos, pos + 1);
              }
            } else {
              if (evaluation.sub) {
                const tmpSub = Object.assign([], evaluation.sub).reverse();
                tmpSub.map(classify => {

                  if (classify.checked) {
                    const pos = evaluation.sub.indexOf(classify);
                    this.downPos(evaluation.sub, pos, pos + 1);
                  }
                });
              }
            }

          });
        }
      },
      topClass() {
        if (this.evalList) {
          let evalChecked = this.evalList.some(evaluation => {
            return evaluation.checked === true;
          });
          this.evalList.map(evaluation => {

            if (evalChecked) {
              if (evaluation.checked) {
                const pos = this.evalList.indexOf(evaluation);
                this.upPos(this.evalList, pos, 0);
              }
            } else {
              if (evaluation.sub) {
                evaluation.sub.map(classify => {
                  if (classify.checked) {
                    const pos = evaluation.sub.indexOf(classify);
                    this.upPos(evaluation.sub, pos, 0);
                  }
                });
              }
            }

          });
        }
      },
      bottomClass() {
        if (this.evalList) {
          const evalChecked = this.evalList.some(evaluation => {
            return evaluation.checked === true;
          });
          const tmpEvalList = Object.assign([], this.evalList).reverse();
          tmpEvalList.map(evaluation => {
            if (evalChecked) {
              if (evaluation.checked) {
                const pos = this.evalList.indexOf(evaluation);
                this.downPos(this.evalList, pos, this.evalList.length);
              }
            } else {
              if (evaluation.sub) {
                const tmpSub = Object.assign([], evaluation.sub).reverse();
                tmpSub.map(classify => {
                  if (classify.checked) {
                    const pos = evaluation.sub.indexOf(classify);
                    this.downPos(evaluation.sub, pos, evaluation.sub.length);
                  }
                });

              }
            }

          });
        }
      },
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
      }

    }

  };
</script>

<style scoped>
  .set_val_box > div {
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -o-user-select: none;
  }

</style>
