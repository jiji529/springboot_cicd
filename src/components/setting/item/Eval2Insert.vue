<template>
  <div class="set_add_area">
    <div class="set_cont_tit">&gt; 항목 추가
      <p>*항목을 클릭해 위치를 변경할 수 있습니다. 여러개의 항목을 선택할 수 있습니다.</p>
    </div>
    <!-- s: set_add_box -->
    <div class="set_add_box">
      <ul class="add_th">
        <li>
          <div class="add_li">
            <div class="add_item"> 항목명</div>
            <div class="add_val"> 기사 가치</div>
            <div class="line_del"></div>
          </div>
        </li>
      </ul>
      <ul>
        <li v-if="newEvaluation!=null" v-for="(evaluation, li) in newEvaluation" :key="li" :class="{'on':focusPosition===evaluation}">
          <div class="add_li" >
            <div class="add_item">
              <input type="text"
                     v-model="evaluation.upper_cate_name"
                     autocomplete="off"
                     placeholder="항목명 입력"
                     @focus="focusPosition=evaluation;parentPosition=newEvaluation">
            </div>
            <div class="add_val">

            </div>
            <div class="line_del">
              <button class="btn_gr" v-if="li!==0" @click="$delete(newEvaluation,li)">삭제</button>
            </div>
          </div>
          <dl v-if="evaluation.sub!==null" v-for="(evalClassify, mi) in evaluation.sub" :key="mi" :class="{'on':focusPosition===evalClassify}">
            <dt>
              <div class="add_li" >
                <div class="add_item">
                  <input type="text"
                         v-model="evalClassify.name"
                         autocomplete="off"
                         placeholder="세부항목 입력"
                         @focus="focusPosition=evalClassify;parentPosition=evaluation.sub">
                </div>
                <div class="add_val">
                  <input type="text"
                         v-model="evalClassify.score"
                         autocomplete="off"
                         pattern="(\d*\.?\d+)"
                         @focus="focusPosition=evalClassify;parentPosition=evaluation.sub">
                </div>
                <div class="line_del" v-if="(eval===null&mi!==0)|(eval!==null&evalClassify.seq==='')">
                  <button class="btn_gr" @click="$delete(evaluation.sub,mi)">삭제</button>
                </div>
              </div>
            </dt>

          </dl>
        </li>

      </ul>
    </div>
    <!-- e: set_add_box -->
    <div class="cont_btn">
      <ul class="btn_left">
        <li class="move"><a @click="upPosition" class="btn_top">위로 이동</a></li>
        <li class="move"><a @click="downPosition" class="btn_bottom">아래로 이동</a></li>
      </ul>
      <ul class="btn_left">
        <li v-show="eval===null"><a @click="addEvaluation(1)">항목 추가</a></li>
        <li><a @click="addEvaluation(2)">세부항목 추가</a></li>
      </ul>
      <ul class="btn_right">
        <li v-show="eval!==null"><a @click="reset">취소</a></li>
        <li class="btn_bl"><a @click="apply">적용</a></li>
      </ul>
    </div>
  </div>
</template>

<script>
  import {mapActions} from 'vuex';

  export default {
    name: 'Eval2Insert',
    props: ['eval'],
    watch: {
      eval(newVal) { // watch it
        newVal = eval('(' + JSON.stringify(newVal) + ')');
        if (newVal !== null)
          this.newEvaluation = [newVal];
      }
    },
    data() {
      return {
        newEvaluation: [{
          upper_cate_seq:'',
          upper_cate_name: '',
          upper_cate_order: '',
          sub: [{
            seq: '',
            name: '',
            order: '1',
            score: '1',
            upperSeq: '',
            use: 'Y'
          }]
        }],
        focusPosition: null,
        parentPosition: null

      };
    },
    methods: {
      ...mapActions(['setEval2ClassAPI']),
      async apply() {
        try {
          if (!this.validationCategory()) {
            let params = new FormData();
            params.append('q', JSON.stringify(this.newEvaluation));
            if (await this.setEval2ClassAPI(params)) {
              this.reset();
            } else {
              this.$eventBus.$emit('kickOut');
            }
          } else {
            alert('항목명을 입력하세요.');
          }

        } catch (e) {
          console.error(e);
        }
      },
      reset() {
        this.newEvaluation = [{
          upper_cate_seq:'',
          upper_cate_name: '',
          upper_cate_order: '',
          sub: [{
            seq: '',
            name: '',
            order: '1',
            score: '1',
            upperSeq: '',
            use: 'Y'
          }]
        }];
        this.$emit('reset');
      },
      validationCategory() {
        if (this.newEvaluation !== null) {
          return this.newEvaluation.some(evalClassify => {
            if (evalClassify.upper_cate_name.trim() === '') {
              return true;
            }
            if (evalClassify.sub) {
              return evalClassify.sub.some(cls => {
                if (cls.name.trim() === '') {
                  return true;
                }
              });
            }
          });
        } else {
          return true;
        }

      },
      upPosition() {
        if (this.focusPosition !== null) {
          const pos = this.parentPosition.indexOf(this.focusPosition);
          if (pos > 0) {
            this.parentPosition.splice(pos - 1, 0, this.parentPosition.splice(pos, 1)[0]);
          }
        }


      },
      downPosition() {
        if (this.focusPosition !== null) {
          const max = this.parentPosition.length - 1;
          const pos = this.parentPosition.indexOf(this.focusPosition);
          if (max > pos) {

            this.parentPosition.splice(pos + 1, 0, this.parentPosition.splice(pos, 1)[0]);
          }
        }
      },
      addEvaluation(evaluation) {
        const $this = this;
        const subLine = {
          seq: '',
          name: '',
          order: '1',
          score: '1',
          upperSeq: '',
          use: 'Y'
        };
        const evalLine = {
          upper_cate_seq:'',
          upper_cate_name: '',
          upper_cate_order: '',
          sub: [subLine]
        };

        let length = 0;
        let target = [];
        if ($this.newEvaluation !== null) {
          target = $this.newEvaluation;
          length = $this.newEvaluation.length;
        }
        switch (evaluation) {
          case 1:
            $this.$set(target, length, evalLine);
            break;
          case 2:
            if (target.indexOf($this.focusPosition) !== -1) {
              target = $this.focusPosition;
              if (target.sub === null) {
                target.sub = [];
              }
              length = target.sub.length;
              $this.$set(target.sub, length, subLine);
            }else            if ($this.parentPosition !== null  ) {
              target = $this.parentPosition;
              if (target === null) {
                target = [];
              }
              length = target.length;
              $this.$set($this.parentPosition, length, subLine);
            }
            break;

        }
      }
    }
  };
</script>

<style scoped>

</style>