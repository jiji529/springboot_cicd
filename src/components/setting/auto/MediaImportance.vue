<template>
  <div class="set_auto_box box2">
    <div class="set_title">
      <h2>매체 중요도</h2>
      <p>* 항목 간의 매체 중복 설정은 할 수 없습니다.</p>
      <div class="set_tit_btn">
        <slot v-if="edit">
          <a @click="edit=false;onSetting()" class="btn_wh">취소</a>
          <a @click="apply" class="btn_na">저장</a>
        </slot>
        <slot v-else>
          <a @click="edit=true" class="btn_gr">편집</a>
        </slot>
      </div>
    </div>
    <!-- s: set_cont -->
    <div class="set_cont">
      <!-- s: set_list_tb -->
      <div class="set_list_tb">
        <div class="set_list_th">
          <div class="md col1-1">항목</div>
          <div class="md col1-3" style="border-left:1px #fff solid">가치</div>
          <div class="md col1-4">상태</div>
        </div>
        <ul>
          <!-- eslint-disable vue/no-use-v-if-with-v-for,vue/no-confusing-v-for-v-if -->
          <template v-if="evalList!==null" v-for="(item, index) in evalList">
            <li class="set_list_td" :key="index">
              <div class="md col1-1" :class="{'conceal':item.isUse ==='N'}">
                <input v-if="edit" type="text"
                       v-model="item.value"
                       autocomplete="off"
                       placeholder="항목명 입력"
                       name="value">
                <slot v-else>{{item.value}}</slot>
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
                <slot v-else>{{getUseLabel(item.isUse)}}</slot>
              </div>
            </li>
          </template>

          <template v-if="addList" v-for="(item, index) in addList">
            <li class="set_list_td" :class="{'conceal':item.isUse ==='N'}" :key="'a'+index">
              <div class="md col1-1">
                <input type="text"
                       v-model="item.value"
                       autocomplete="off"
                       placeholder="항목명 입력"
                       name="value">
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
      <div class="set_list_tf"><a @click.prevent="insertCategory">+ 항목추가</a></div>

      <div class="set_import_box">
        <div class="set_cont_head"><span>항목보기</span>
          <select v-model="valueFilter">
            <option selected="" value="">전체</option>
            <option v-for="(category,index) in evalList" :key="index" :value="category.seq">{{category.value}}</option>
          </select>
          <div class="ft_sch">
            <form @submit.prevent="">
              <input type="text" placeholder="매체명 입력" v-model="searchText">
              <button type="submit">검색</button>
            </form>
          </div>
        </div>
        <template v-if="edit">
          <div class="set_md_edit"><span>선택한 매체를</span>
            <form @submit.prevent="changeMedia">
              <select name="category">
                <option v-for="(category,index) in evalList" :key="index" :value="index">{{category.value}}</option>
              </select>
              <span>(으)로</span>
              <button class="btn_na" type="submit">이동</button>
            </form>
          </div>
          <div class="set_import_all">
            <input type="checkbox" id="sch_all" :checked="stateAllCheck" @change="checkAll">
            <label for="sch_all"><span></span>전체선택</label>
          </div>
          <!-- eslint-disable vue/no-use-v-if-with-v-for,vue/no-confusing-v-for-v-if -->
          <dl class="set_import" v-if="evalList" v-for="(category,index) in filteredList" :key="index">
            <dt>
              <input type="checkbox" :id="'sch_ft1_c'+index"
                     :checked="stateCategoryChecked(category.media)"
                     @change="changeCategoryChecked(category.media)"
              >
              <label v-bind:for="'sch_ft1_c'+index" >
                <span></span>
                <p>{{category.value}}</p>
                <p v-if="category.media">({{category.media.length}})</p>
              </label>
            </dt>
            <dd v-if="category.media" v-for="(media,i) in category.media" :key="i">
              <input type="checkbox" :id="'sch_ft1_c'+index+i"
                     v-model="selectMedia"
                     :value="media">
              <label v-bind:for="'sch_ft1_c'+index+i" tabindex="0"
                     @keydown.space.prevent="pressSpace(media, 'ft1', String(index)+String(i))"
                     @click.prevent="pressSpace(media, 'ft1', String(index)+String(i))">
                <span></span>{{media.media_name}}({{media.media_type_name}})</label>
            </dd>
          </dl>
          <dl class="set_import" v-if="etcList | valueFilter===''">
            <dt>
              <input type="checkbox"
                     id="sch_else_c"
                     :checked="stateCategoryChecked(etcFilteredList)"
                     @change="changeCategoryChecked(etcFilteredList)">
              <label for="sch_else_c" >
                <span></span>
                <p>미선택</p>
                <p v-if="etcList">({{etcFilteredList.length}})</p>
              </label>
            </dt>
            <dd v-if="etcList" v-for="(media,i) in etcFilteredList" :key="i">
              <input type="checkbox" :id="'sch_else_c'+i"
                     v-model="selectMedia"
                     :value="media">
              <label v-bind:for="'sch_else_c'+i" tabindex="0"
                     @keydown.space.prevent="pressSpace(media, 'else', i)"
                     @click.prevent="pressSpace(media, 'else', i)"
              ><span></span>{{media.media_name}}({{media.media_type_name}})</label>
            </dd>
          </dl>
        </template>


        <template v-else>
          <dl class="set_import" v-if="evalList" v-for="(category,index) in filteredList" :key="index">
            <dt><p>{{category.value}}</p>
              <p v-if="category.media">({{category.media.length}})</p></dt>
            <dd v-if="category.media" v-for="(media,i) in category.media" :key="i">{{media.media_name}}({{media.media_type_name}})</dd>
          </dl>
        </template>
      </div>


    </div>
    <!-- e: set_cont -->
  </div>
</template>

<script>
  import {mapActions} from 'vuex';

  export default {
    name: 'MediaImportance',
    data() {
      return {
        edit: false, // 편집 여부
        evalList: [],  // 선택된 매체 목록
        addList: [],// 항목추가 매체 목록
        etcList: [],  // 미선택 매체 목록
        selectMedia: [], // 매체 전체 목록
        searchText: '', //매체명 검색
        valueFilter: '' // 항목 보기 필터
      };
    },
    mounted() {
      this.onSetting();
    },
    computed: {
      /**
       * 설정된 매체 필터 이벤트
       **/
      filteredList() {
        let result = this.evalList;
        if (this.valueFilter) {
          result = this.evalList.filter(ev => {
            return ev.seq === this.valueFilter;
          });
        }

        return result.map(ev => {
          if (!ev.media) {
            ev.media = [];
          }
          return Object.assign([], ev, {
            media: ev.media.filter(m => {
              return m.media_name.toLowerCase().includes(this.searchText.toLowerCase());
            })
          });
        });

      },
      /**
       * 미설정 매체 필터
       **/
      etcFilteredList() {
        if (this.etcList !== null) {
          return this.etcList.filter(m => {
            return m.media_name.toLowerCase().includes(this.searchText.toLowerCase());
          });
        }
      },
      stateAllCheck() {
        let evalTotal = 0;
        if (this.evalList) {
          this.evalList.map(ev => {
            if (Array.isArray(ev.media)) {
              evalTotal += ev.media.length;
            }
          });
        }
        if (Array.isArray(this.etcList)) {
          evalTotal += this.etcList.length;
        }
        return this.selectMedia.length === evalTotal;
      }

    },

    methods: {
      ...mapActions(['getMediaImportanceAPI', 'categoryIdAPI']),
      pressSpace(media, flag, index_i){
        let subject = null;
        if(flag === 'ft1') {
          subject = document.querySelector('input[id=sch_ft1_c'+index_i+']');
        } else {
          subject = document.querySelector('input[id=sch_else_c'+index_i+']');
        }
        subject.checked = !(subject.checked);
        let index = this.selectMedia.indexOf(media);
        if(subject.checked) {
          if(index === -1)
            this.selectMedia.push(media);
        } else {
          if(index > -1)
            this.selectMedia.splice(index,1);
        }
      },
      async onSetting() {
        this.addList = [];
        try {
          const list = await this.getMediaImportanceAPI();
          if (list) {
            this.evalList = list.selected;
            this.etcList = list.unselected;
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
       **/
      insertCategory() {
        //this.edit = true;
        if(this.edit === false) {
          if (this.addList.length > 0) {
            this.$delete(this.addList, 0);
            return;
          }
        }

        const newLine = {
          seq: '',
          value: '',
          isUse: 'Y',
          score: '1',
          media: [],
          refValue: 'mediaGroup'
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
       * 항목 추가 이벤트
       **/
      async apply() { // newLine을 수정했다. 단, refValue 추가
        try {
          if (!this.validationEval()) {
            let params = new FormData();
            let list = [];
            if (this.addList.length > 0) {
              this.addList.map((a,idx) => {
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
            //params.append('q', JSON.stringify(this.evalList));

            const mediaList = await this.getMediaImportanceAPI(params);
            if (mediaList) {
              this.evalList = mediaList.selected;
              this.etcList = mediaList.unselected;
            } else {
              this.$eventBus.$emit('kickOut');
            }
            this.addList = [];
            this.edit = false;
            

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
       * 항목 추가 저장 공백 체크
       **/
      validationEval() {
        if (this.addList.length > 0) {
          return (this.addList[0].value.trim() === '');
        } else {
          if (this.evalList !== null) {
            return this.evalList.some((ev) => {
              if (ev.value.trim() === '') {
                return true;
              }
            });
          } else {
            return true;
          }
        }
      },
      /**
       * 매체 이동 이벤트
       **/
      changeMedia() {
        const formData = event.target;
        const ci = formData.category.value;
        const mCnt = this.selectMedia.length;
        const cName = this.evalList[ci].value;

        let mStr = '';
        this.selectMedia.some((m, i) => {
          if (i !== (mCnt-1) && i <1) mStr += m.media_name + ', ';
          else mStr += m.media_name;
          return i === 1;
        });

        let cStr = '';
        if(mCnt > 2) cStr = mStr + " 등의 " + mCnt + "개의 매체를 ";
        else cStr +=  mStr + "(을)를 ";
        const cMsg = cStr + cName + "항목으로 이동시키시겠습니까?";
        const c = window.confirm(cMsg);

        if(c) {
          if (!this.evalList[ci].media)
            this.evalList[ci].media = [];

          if (mCnt > 0) {
            this.selectMedia.map(media => {
              const ei = this.etcList.indexOf(media);
              if (ei > -1) {
                this.etcList.splice(ei, 1);
              }
              this.evalList.map(ev => {
                if (ev.media) {
                  const evi = ev.media.indexOf(media);
                  if (evi > -1) {
                    ev.media.splice(evi, 1);
                  }
                }

              });
              this.evalList[ci].media.push(media);
            });

            let aStr = '';
            if(mCnt > 2) aStr = mStr + " 등의 " + mCnt + "개의 매체가 ";
            else aStr =  mStr + "(이)가 ";
            const aMsg = aStr + cName + "항목으로 이동되었습니다.";
            window.alert(aMsg);

            this.selectMedia = [];
          }
        }
      },
      /**
       * 전체 체크
       **/
      checkAll() {
        if (event.target.checked) {
          if (this.evalList) {
            this.evalList.map(ev => {
              if (Array.isArray(ev.media)) {

                ev.media.map(m => {
                  if (this.selectMedia.indexOf(m) === -1) {
                    this.selectMedia.push(m);
                  }
                });
              }
            });
          }
          if (Array.isArray(this.etcList)) {
            if (Array.isArray(this.etcList)) {
              this.etcList.map(m => {
                if (this.selectMedia.indexOf(m) === -1) {
                  this.selectMedia.push(m);
                }
              });
            }
          }
        } else {
          this.selectMedia = [];
        }
      },
      /**
       * 카테고리별 체크 여부
       **/
      stateCategoryChecked(media) {
        if (media.length > 0) {
          return media.every(item => {
            if (this.selectMedia.indexOf(item) > -1) {
              return true;
            }
          });
        } else
          return false;

      },
      /**
       * 카테고리별 체크 이벤트
       **/
      changeCategoryChecked(media) {
        const val = event.target.checked;
        if (val) {
          if (Array.isArray(media)) {
            media.map(m => {
              if (this.selectMedia.indexOf(m) === -1) {
                this.selectMedia.push(m);
              }
            });
          }
        } else {
          if (Array.isArray(media)) {
            media.map(m => {
              const mi = this.selectMedia.indexOf(m);
              if (mi > -1) {
                this.selectMedia.splice(mi, 1);
              }
            });
          }
        }
      }
    }
  };
</script>

<style scoped>

</style>
