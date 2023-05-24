<template>
  <!-- s: set_add_area -->
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
        <li v-if="newCategory!=null" v-for="(largeCategory, li) in newCategory" :key="li" :class="{'on':focusCategory===largeCategory}">
          <div class="add_li" >
            <div class="add_item">
              <input type="text"
                     v-model="largeCategory.name"
                     autocomplete="off"
                     placeholder="대 항목명 입력"
                     @focus="focusCategory=largeCategory;parentCategory=newCategory;focusPosition=1">
            </div>
            <div class="add_val">
              <input type="text"
                     v-model="largeCategory.score"
                     autocomplete="off"
                     pattern="(\d*\.?\d+)"
                     @focus="focusCategory=largeCategory;parentCategory=newCategory;focusPosition=1">
            </div>
            <div class="line_del" v-if="li!==0">
              <button class="btn_gr" @click="$delete(newCategory,li)">삭제</button>
            </div>
          </div>
          <dl v-if="largeCategory.sub!==null" v-for="(middleCategory, mi) in largeCategory.sub" :key="mi" :class="{'on':focusCategory===middleCategory}">
            <dt>
              <div class="add_li" >
                <div class="add_item">
                  <input type="text"
                         v-model="middleCategory.name"
                         autocomplete="off"
                         placeholder="중 항목명 입력"
                         @focus="focusCategory=middleCategory;parentCategory=largeCategory.sub;focusPosition=2">
                </div>
                <div class="add_val">
                  <input type="text"
                         v-model="middleCategory.score"
                         autocomplete="off"
                         pattern="(\d*\.?\d+)"
                         @focus="focusCategory=middleCategory;parentCategory=largeCategory.sub;focusPosition=2">
                </div>
                <div class="line_del">
                  <button class="btn_gr" v-if="category===null || middleCategory.hasOwnProperty('isAdd')" @click="$delete(largeCategory.sub,mi)">삭제</button>
                </div>
              </div>
            </dt>
            <dd v-if="middleCategory.sub!==null" v-for="(smallCategory, si) in middleCategory.sub" :key="si"  :class="{'on':focusCategory===smallCategory}">
              <div class="add_li">
                <div class="add_item">
                  <input type="text"
                         v-model="smallCategory.name"
                         autocomplete="off"
                         placeholder="소 항목명 입력"
                         @focus="focusCategory=smallCategory;parentCategory=middleCategory.sub;focusPosition=3">
                </div>
                <div class="add_val">
                  <input type="text"
                         v-model="smallCategory.score"
                         autocomplete="off"
                         pattern="(\d*\.?\d+)"
                         @focus="focusCategory=smallCategory;parentCategory=middleCategory.sub;focusPosition=3">
                </div>
                <div class="line_del">
                  <button class="btn_gr" v-if="category===null || smallCategory.hasOwnProperty('isAdd')" @click="$delete(middleCategory.sub,si)">삭제</button>
                </div>
              </div>
            </dd>
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
        <li v-show="category===null"><a @click="addCategory(1)">대 항목 추가</a></li>
        <li><a @click="addCategory(2)">중 항목 추가</a></li>
        <li><a @click="addCategory(3)">소 항목 추가</a></li>
      </ul>
      <ul class="btn_right">
        <li v-show="category!==null"><a @click="reset">취소</a></li>
        <li class="btn_bl"><a @click="apply">적용</a></li>
      </ul>
    </div>
  </div>
  <!-- e: set_add_area -->
</template>

<script>
  import {mapActions} from 'vuex';

  export default {
    name: 'Eval1Insert',
    props: ['category'],
    watch: {
      category(newVal) { // watch it
        newVal = eval('(' + JSON.stringify(newVal) + ')');
        if (newVal !== null)
          this.newCategory = [newVal];//
      }
    },
    computed: {},
    data() {
      return {
        newCategory: [{
          name: '',
          order: '',
          score: '1',
          sub: null
        }],
        focusCategory:null,
        parentCategory:null,
        focusPosition: 1,

      };
    },
    methods: {
      ...mapActions(['setEval1CategoryAPI']),
      async apply() {
        try {
          if (!this.validationCategory()) {
            let params = new FormData();
            params.append('q', JSON.stringify(this.newCategory));
            if (await this.setEval1CategoryAPI(params)) {
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
        this.newCategory = [{
          name: '',
          order: '',
          score: '1',
          sub: null,
          upperSeq: null
        }];
        this.$emit('reset');
      },
      validationCategory() {
        if (this.newCategory !== null) {
          return this.newCategory.some((large,i) => {
            if (large.name.trim() === '') {
              return true;
            }
            if (large.sub) {
              return large.sub.some((middle) => {
                if (middle.name.trim() === '') {
                  return true;
                }
                if (middle.sub) {
                  return middle.sub.some((small) => {
                    if (small.name.trim() === '') {
                      return true;
                    }
                  });
                }
              });
            }
          });
        } else {
          return true;
        }
      },
      addCategory(category) {
        const $this = this;
        const newLine = new Object({
          name: '',
          order: '',
          score: '1',
          sub: null,
          upperSeq: null,
          isAdd: true
        });
        let length = 0;
        let target = [];
        if (this.newCategory !== null) {
          target = this.newCategory;
          length = this.newCategory.length;
        }
        switch (category) {
          case 1:
            this.$set(target, length, newLine);
            break;
          case 2:
            if ($this.focusPosition<3) {
              if (target.indexOf($this.focusCategory) !== -1) {
                target = $this.focusCategory;
                if (target.sub === null) {
                  target.sub = [];
                }
                length = target.sub.length;
                this.$set(target.sub, length, newLine);
              } else if ($this.parentCategory !== null) {
                target = $this.parentCategory;
                if (target === null) {
                  target = [];
                }
                length = target.length;
                $this.$set($this.parentCategory, length, newLine);
              }
            }

            break;
          case 3:

            if ($this.focusPosition>=2) {
              target.map(middle => {
                if (middle.sub) {
                  if (middle.sub.indexOf($this.focusCategory) !== -1) {
                    target = $this.focusCategory;
                    if (target.sub === null) {
                      target.sub = [];
                    }
                    length = target.sub.length;
                    $this.$set(target.sub, length, newLine);
                  } else if ($this.parentCategory !== null) {
                    target = $this.parentCategory;

                    if (target === null) {
                      target = [];
                    }
                    length = target.length;
                    $this.$set($this.parentCategory, length, newLine);
                  }
                }
              });
            }

            break;
        }
      },
      getPositionType() {
        //const $this = this;
        let result = 0;
        if (this.newCategory) {
          if (this.newCategory.indexOf(this.focusCategory) === -1) {
            this.newCategory.map((large) => {
              if (large.sub) {
                if (large.sub.indexOf(this.focusCategory) === -1) {
                  large.sub.map((middle) => {
                    if (middle.sub) {
                      if (middle.sub.indexOf(this.focusCategory) !== -1) {
                        result = 3;
                      }
                    }
                  });
                } else {
                  result = 2;
                }
              }
            });
          } else {
            result = 1;
          }
        }
        return result;
      },
      upPosition() {
        if (this.focusCategory !== null) {
          const pos = this.parentCategory.indexOf(this.focusCategory);
          if (pos > 0) {
            this.parentCategory.splice(pos - 1, 0, this.parentCategory.splice(pos, 1)[0]);
          }
        }


      },
      downPosition() {
        if (this.focusCategory !== null) {
          const max = this.parentCategory.length - 1;
          const pos = this.parentCategory.indexOf(this.focusCategory);
          if (max > pos) {

            this.parentCategory.splice(pos + 1, 0, this.parentCategory.splice(pos, 1)[0]);
          }
        }
      }
    }
  };
</script>

<style>


</style>
