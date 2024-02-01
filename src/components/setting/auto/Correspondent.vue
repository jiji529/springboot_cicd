<template>
  <div class="set_auto_box box6">
    <div class="set_title">
      <h2>출입기자</h2>
      <p>* 출입기자에 등록되지 않은 모든 기자는 일반기자로 표시됩니다.</p>
      <div class="set_tit_btn">
        <slot v-if="edit">
          <a @click="edit=false;onSetting()" class="btn_wh">취소</a>
          <a @click="apply" class="btn_na">저장</a>
        </slot>
        <slot v-else>
          <a @click="edit=true" class="btn_gr">편집</a>
          <a @click="reEval" class="btn_gr">재평가</a>
        </slot>
      </div>
    </div>
    <!-- s: set_cont -->
    <div id="searchTextMediaDiv" :class="{'dn':!this.searchTextShow}">
      <p :class="{'selected':Number(m.media_id) === Number(searchTextSelectedMediaId)}" v-for="(m,mi) in mediaList" :key="mi" v-if="m.media_name.indexOf(searchTextMedia) > -1" @mousedown="handleClick($event, m)">{{m.media_name}}({{m.media_type_name}})</p>
    </div>
    <div class="set_cont" id="cor_set_cont" v-on:scroll="handleScroll">
      <!-- s: set_report_val -->
      <dl class="set_report_val">
        <div v-if="evalList.classList.length>0" v-for="(item,index) in evalList.classList" :key="index">
          <dt>{{item.value}} 가치</dt>
          <dd>
            <input v-if="edit" type="number" v-model="item.score">
            <slot v-else>{{item.score}}</slot>
          </dd>
        </div>
      </dl>
      <!-- e: set_report_val -->
      <div class="set_report_box">
        <div class="set_cont_head"><span>상태보기</span>
          <select v-model="stateFilter">
            <option selected value="">전체</option>
            <option value="Y">사용</option>
            <option value="N">비사용</option>
          </select>
          <div class="ft_sch">
            <form @submit.prevent="">
              <input type="text" placeholder="매체 입력" v-model="searchTextM">
              <input type="text" placeholder="기자명 입력" v-model="searchTextR">
              <button type="submit">검색</button>
            </form>
          </div>
        </div>
        <div class="set_report">
          <div class="set_report_th">
            <div class="md col3-1">매체명</div>
            <div class="md col3-2">출입기자명</div>
            <div class="md col3-3">상태</div>
          </div>
          <dl v-for="(media, index) in filteredList" :key="index">
            <dt class="md col3-1">
              <slot v-if="edit">
                <input type="text"
                :list="'edit-list'"
                v-bind:value="media.media_name"
                name="media"
                @keyup.prevent.self="addMedia2($event, media)"
                @focus="focusEditInput($event, media)"
                @blur="blurEditInput"
                placeholder="매체명 선택 또는 입력(수정)" tabindex="0">
              </slot>
              <slot v-else>{{media.media_name}}({{media.media_type_name}})</slot>
            </dt>
            <dd v-if="media.reporter" v-for="(reporter, i) in media.reporter" :key="i">
              <div class="md col3-2" :class="{'conceal':reporter.isUse==='N'}">
                <input type="text"
                       v-if="edit"
                       v-once
                       :value="reporter.reporterName"
                       @input="editReporter($event, media, i)"
                       placeholder="출입기자명 입력"
                       name="value"
                       autocomplete="off">
                <slot v-else>{{reporter.reporterName}}</slot>
              </div>
              <div class="md col3-3">
                <slot v-if="edit">
                  <div class="btn" :class="{'btn_bl':reporter.isUse==='Y','btn_gr':reporter.isUse!=='Y'}"><a
                      @click="reporter.isUse='Y'">사용</a></div>
                  <div class="btn" :class="{'btn_bl':reporter.isUse==='N','btn_gr':reporter.isUse!=='N'}"><a
                      @click="reporter.isUse='N'">비사용</a></div>
                </slot>
                <slot v-else>{{getUseLabel(reporter.isUse)}}</slot>
              </div>
            </dd>
          </dl>
          <dl v-for="(media, ai) in addList.reporterList" :key="'a'+ai">
            <dt class="md col3-1">
              <input type="text"
                     :list="'add-list'"
                     @input="media.media_name=$event.target.value"
                     name="media"
                     @keyup.prevent.self="addMedia1($event, media)"
                     @focus="focusEditInput($event, media, 'add')"
                     @blur="blurEditInput"
                     placeholder="매체명 선택 또는 입력(추가)" tabindex="0">
            </dt>
            <dd v-if="media.reporter" v-for="(reporter, i) in media.reporter" :key="i">
              <div class="md col3-2">
                <input type="text"
                       v-model="reporter.reporterName"
                       placeholder="출입기자명 입력"
                       name="value"
                       autocomplete="off">
              </div>
              <div class="md col3-3">
                <div class="btn" :class="{'btn_bl':reporter.isUse==='Y','btn_gr':reporter.isUse!=='Y'}"><a
                    @click="reporter.isUse='Y'">사용</a></div>
                <div class="btn" :class="{'btn_bl':reporter.isUse==='N','btn_gr':reporter.isUse!=='N'}"><a
                    @click="reporter.isUse='N'">비사용</a></div>
                <div class="btn btn_wh"><a
                    @click="$delete(addList.reporterList,ai);">취소</a>
                </div>
                <div class="btn btn_na" v-if="!edit"><a @click="apply">저장</a></div>
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
    <!-- e: set_cont -->
    <div class="set_list_tf"><a @click="insertCategory">+ 항목추가</a></div>
    <div class="loading" style="background-color:#ffffff45" v-if="loadingGif"><img class="loading-image" :src="require('@/assets/images/loading.gif')" alt="Loading..."/></div>
  </div>
</template>

<script>
  /* eslint-disable no-console */

  import {mapActions,mapState,mapMutations} from 'vuex';

  export default {
    name: 'Correspondent',
    data() {
      return {
        addList: {
          reporterList: []
        },
        edit: false,  // 편집 여부
        evalList: {
          classList: [], // 평가 종류 //출입기자, 일반기자 설정값
          reporterList: [] // 매체별 기자명 및 상태값
        },
        isWhaleBrowser: false,
        searchTextReporterFocused: {},
        searchTextInputFocused: {},
        searchTextShow: false,
        searchTextSelectedMediaArr: [], // 매체 입력 검색
        searchTextSelectedMediaId: -1, // 매체 입력 검색
        searchTextMedia: '', // 매체 입력 검색
        searchTextM: '', // 매체 검색
        searchTextR: '', // 기자명 검색
        stateFilter: '',  // 상태보기 전체 사용 미사용
        mediaList: []  // 전체 서비스 매체 목록
      };
    },
    mounted() {
      this.isWhaleBrowser = (this.$browserDetect.meta.ua.toLowerCase().indexOf('whale') > -1) ? true : false;
      this.onSetting();  // 초기 API 호출 정보
    },
    computed: {
      ...mapState(['loadingGif']),
      /**
       * 매체 또는 기자명 필터
       **/
      filteredList() {
        let result = this.evalList.reporterList;
        if (this.evalList.reporterList) {
          result = result.filter((ev, idx) => {
            ev.idx = idx;
            return ev.media_name.toLowerCase().includes(this.searchTextM.toLowerCase());
          });

          return result.map(ev => {
            if (!ev.reporter) {
              ev.reporter = [];
            }
            let res = Object.assign([], ev, {
              reporter: ev.reporter.filter(m => {
                if (this.stateFilter !== '') {
                  if (m.isUse.toLowerCase() === this.stateFilter.toLowerCase()) {
                    return m.reporterName.toLowerCase().includes(this.searchTextR.toLowerCase());
                  }
                } else {
                  return m.reporterName.toLowerCase().includes(this.searchTextR.toLowerCase());
                }
              })
            });
            if (res.reporter.length > 0) {
              return res;
            }
            return false;
          });
        }
        return result;
      },
      
    },

    methods: {
      ...mapMutations(['SET_LOADING_GIF']),
      ...mapActions(['getCorrespondentAPI', 'categoryIdAPI','setReAutoEvaluateAPI']),
      handleClick($event, media) {
        let tgt = this.searchTextReporterFocused;
        tgt.media_id = media.media_id;
        tgt.media_name = media.media_name;
        tgt.media_type_name = media.media_type_name;
        this.searchTextSelectedMediaId = media.media_id;
        this.searchTextMedia = media.media_name;
        this.searchTextInputFocused.value = media.media_name;
      },
      handleScroll() {
        let wrap = document.getElementById('cor_set_cont');
        let list = document.getElementById('searchTextMediaDiv');
        let input = this.searchTextInputFocused.offsetTop;
        let browser = this.$browserDetect;
        if (browser.isIE || browser.isEdge) {
          input = this.searchTextInputFocused.offsetParent.offsetTop;
          input += 135;
        } else {
          input += 130;
        }
        input -= wrap.scrollTop;
        if (this.searchTextSelectedMediaArr.length < 11) {
          input -= 2;
        }
        let height = (Math.min(this.searchTextSelectedMediaArr.length, 10) * 17) * -1 + input;
        list.style.top = height + 'px';
        if (browser.isEdge) list.style.width = 'calc(40% - 34px)';
        else if (this.isWhaleBrowser) list.style.width = 'calc(40% - 28px)';
      },
      /**
       * 초기 매체명 및 출입기자정보 API 호출
       **/
      async onSetting() {
        try {
          this.evalList = await this.getCorrespondentAPI();
          const mList = await this.categoryIdAPI();
          if (mList && mList.constructor.name === 'Array') {
            this.mediaList = mList.sort((a, b) => (a.media_name > b.media_name) ? 1 : -1);
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
       * 매체명 추가 이벤트
       **/
      addMedia($event, media) {
        const value = $event.target.value;
        if (value) {
          const target = $event.target.list.querySelector('[value="' + value + '"]');
          if (target) {
            const target_id = target.getAttribute('data-id');
            if (target_id) {
              media.media_id = target_id;
              this.filteredList.forEach(c => {
                let tmp = {};
                for (let [k,v] of Object.entries(c)) {
                  tmp[k] = v;
                }
                this.evalList.reporterList[c.idx] = tmp;
              });
              return true;
            }
          }
        }
        alert('매체를 목록에서 선택해주세요.');
        return false;
      },
      blurEditInput($event) {
        this.searchTextMedia = '';
        this.searchTextSelectedMediaId = -1;
        this.searchTextSelectedMediaArr = [];
        this.searchTextShow = false;
      },
      focusEditInput($event, media, add) {
        if (this.searchTextMedia.length === 0) {
          this.searchTextMedia = media.media_name;
        }
        if (add) {
          this.addMedia1($event, media);
        } else {
          this.addMedia2($event, media);
        }
        this.searchTextShow = true;
        this.searchTextReporterFocused = media;
      },
      editReporter($event, media, i) {
        media.reporter[i].reporterName = $event.target.value;
        this.filteredList[media.idx] = media;
      },
      /**
       * 매체명 추가 이벤트
       **/
      addMedia1($event, media) { // 추가시 사용
        if ($event.keyCode === 13) { // Enter
          this.keyEventEnter($event, media);
        } else if ($event.keyCode === 38) { // ArrowUp
          this.keyEventUp();
        } else if ($event.keyCode === 40) {
          this.keyEventDown();
        } else { // etc
          this.searchTextMedia = $event.target.value;
          this.searchTextSelectedMediaId = -1;
          this.searchTextSelectedMediaArr = [];
          this.mediaList.forEach(m => {
            if (m.media_name.indexOf(this.searchTextMedia) > -1) { // 포함
              this.searchTextSelectedMediaArr.push(m.media_id);
            }
          });
          if (this.searchTextSelectedMediaArr.length > 0) {
            this.searchTextSelectedMediaId = this.searchTextSelectedMediaArr[0];
          }

          this.searchTextInputFocused = $event.target;
          this.handleScroll();
        }
        return false;
       },
      addMedia2($event, media) { // 수정시 사용
        if ($event.keyCode === 13) { // Enter
          this.keyEventEnter($event, media);
        } else if ($event.keyCode === 38) { // ArrowUp
          this.keyEventUp();
        } else if ($event.keyCode === 40) {
          this.keyEventDown();
        } else { // etc
          this.searchTextMedia = $event.target.value;
          media.media_name = $event.target.value;
          this.searchTextSelectedMediaId = -1;
          this.searchTextSelectedMediaArr = [];
          this.mediaList.forEach(m => {
            if (m.media_name.indexOf(this.searchTextMedia) > -1) { // 포함
              this.searchTextSelectedMediaArr.push(m.media_id);
            }
          });
          if (this.searchTextSelectedMediaArr.length > 0) {
            this.searchTextSelectedMediaId = this.searchTextSelectedMediaArr[0];
          }

          this.searchTextInputFocused = $event.target;
          this.handleScroll();
        }
        return false;
      },
      keyEventEnter($event, media) {
        if (Number(this.searchTextSelectedMediaId) !== -1) {
          let mediaData = {};
          for (var i = 0; i < this.mediaList.length; i++) {
            if (Number(this.mediaList[i].media_id) === Number(this.searchTextSelectedMediaId)) {
              mediaData = this.mediaList[i];
              media.media_id = mediaData.media_id;
              media.media_name = mediaData.media_name + '(' + mediaData.media_type_name + ')';
              $event.target.value = media.media_name;
              this.searchTextMedia = media.media_name;
              break;
            }
          }
          return true;
        } else {
          alert('매체를 목록에서 선택해주세요.');
          return false;
        }
      },
      keyEventUp() {
        let indexCur = -1, indexMax = -1, indexLen = -1;
        if (this.searchTextSelectedMediaId === -1 && this.searchTextSelectedMediaArr.length > 0) {
          this.searchTextSelectedMediaId = this.searchTextSelectedMediaArr[0];
        }

        indexCur = this.searchTextSelectedMediaArr.indexOf(this.searchTextSelectedMediaId);
        indexLen = this.searchTextSelectedMediaArr.length;
        indexMax = indexLen - 1;
        if (indexCur !== -1 && indexMax > 0) {
          indexCur = (indexMax + 1 + indexCur - 1) % (indexMax + 1);
          this.searchTextSelectedMediaId = this.searchTextSelectedMediaArr[indexCur];
        }

        if (indexLen > 10 && (indexMax - indexCur) > 4) {
          document.getElementById('searchTextMediaDiv').scrollBy(0, -17);
        } else if (indexLen > 10 && indexMax === indexCur) {
          document.getElementById('searchTextMediaDiv').scrollTo(0, 65535);
        }
        return false;
      },
      keyEventDown() {
        let indexCur = -1, indexMax = -1, indexLen = -1;
        if (this.searchTextSelectedMediaId === -1 && this.searchTextSelectedMediaArr.length > 0) {
          this.searchTextSelectedMediaId = this.searchTextSelectedMediaArr[0];
        }

        indexCur = this.searchTextSelectedMediaArr.indexOf(this.searchTextSelectedMediaId);
        indexLen = this.searchTextSelectedMediaArr.length;
        indexMax = indexLen - 1;
        if (indexCur !== -1 && indexMax > 0) {
          indexCur = (indexCur + 1) % (indexMax + 1);
          this.searchTextSelectedMediaId = this.searchTextSelectedMediaArr[indexCur];
        }

        if (indexLen > 10 && indexCur > 4 && indexCur <= indexMax) {
          document.getElementById('searchTextMediaDiv').scrollBy(0, 17);
        } else if (indexLen > 10 && indexCur === 0) {
          document.getElementById('searchTextMediaDiv').scrollTo(0, 0);
        }
        return false;
      },
      /**
       * 항목 추가 이벤트
       */
      insertCategory() {
        if (this.addList.reporterList.length > 0) {
          this.$delete(this.addList.reporterList, 0);
          return;
        }

        let evalClassify = '';
        if (this.evalList.classList) {
          evalClassify = this.evalList.classList[0].seq;
        }
        const newLine = {
          media_id: '',
          media_name: '',
          reporter: [{
            isUse: 'Y',
            evalClassify: evalClassify,
            reporterName: '',
            seq: ''
          }]
        };
        this.$set(this.addList.reporterList, this.addList.reporterList.length, newLine);
        this.$nextTick(()=>{
          const node = this.$el.querySelectorAll('[name=\'media\']');
          for (let i = 0; i < node.length; i++) {
            if (node[i].value.trim() === '') {
              node[i].focus();
              break;
            }
          }
        })
      },
      /**
       *
       * 편집 저장
       **/
      async apply() {
        alert("◇ 신규 등록된 기사부터 변경사항이 적용되어 평가됩니다.\n"
          +"◇ 기존 등록된 기사에 적용하기 위해서는 재평가가 필요합니다.");
        try {
          if (!this.validationEval() && !this.validationAddEval()) {
            let params = new FormData();
            let list = {
              classList : [],
              reporterList : []
            };
            if (this.addList.reporterList.length > 0) {
              this.addList.reporterList.map(a => {
                this.$set(list.reporterList, list.reporterList.length, a);
              });
              this.$delete(this.addList.reporterList, 0);
            }
            if (this.edit ) {
              this.evalList.classList.map(e => {
                this.$set(list.classList, list.classList.length, e);
              });

              let i = {};
              this.filteredList.forEach(f => {
                i = this.evalList.reporterList[f.idx];
                i.media_id = f.media_id;
                i.media_name = f.media_name;
                i.media_type_name = f.media_type_name;
              });

              this.evalList.reporterList.map(e => {
                this.$set(list.reporterList, list.reporterList.length, e);
              });
            }
            if (list !== null) {
              params.append('q', JSON.stringify(list));
              const result = await this.getCorrespondentAPI(params);
              if (result) {
                this.evalList = result;
                this.edit = false;
              } else {
                this.$eventBus.$emit('kickOut');
              }
            }
          } else {
            let check = false;
            const node = this.$el.querySelectorAll('[name=\'media\']');
            for (let i = 0; i < node.length; i++) {
              if (node[i].value.trim() === '') {
                alert('매체를 입력하세요.');
                check = true;
                node[i].focus();
                break;
              }
              else {
                alert('매체를 목록에서 선택해주세요.');
                check = true;
                break;
              }
            }
            if (!check) {
              const node2 = this.$el.querySelectorAll('[name=\'value\']');
              for (let i = 0; i < node2.length; i++) {
                if (node2[i].value.trim() === '') {
                  alert('출입기자명을 입력하세요.');
                  node2[i].focus();
                  break;
                }
              }
            }
          }
        } catch (e) {
          console.error(e);
        }
      },
      /**
       * 편집시 빈값 체크
       * @returns {boolean}
       */
      validationEval() {

        if (this.evalList.reporterList) {
          return this.evalList.reporterList.some((ev) => {
            if (ev.media_id.trim() === '') {
              return true;
            }
            if (ev.reporter) {
              return ev.reporter.some((r) => {
                if (r.reporterName.trim() === '') {
                  return true;
                }
                return ev.reporter.some(rr=>{
                  if(r.seq!==rr.seq){
                    if (r.reporterName.trim() === rr.reporterName.trim()) {
                      alert('"'+r.reporterName + '"이/가 중복되어 들어가 있습니다.');
                      return true;
                    }
                  }
                })
              });
            }
          });
        } else {
          return false;
        }
      },
      validationAddEval() {
        if (this.addList.reporterList.length > 0) {
          return this.addList.reporterList.some((ev) => {
            if (ev.media_id.trim() === '') {
              return true;
            }
            if (ev.reporter) {
              return ev.reporter.some((r) => {
                if (r.reporterName.trim() === '') {
                  return true;
                }
                if (this.evalList.reporterList) {
                  return this.evalList.reporterList.some(rl => {
                    if (rl.media_id === ev.media_id) {
                      return rl.reporter.some(rr => {
                        if (rr.reporterName === r.reporterName) {
                          alert(ev.media_name + '에 "' + r.reporterName + '"이/가 이미 존재합니다.');
                          return true;
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        } else {
          return false;
        }
      },

      async reEval() {
				const sen1 = ""
				+"재평가 시 등록된 모든 기사의 자동평가가 다시 수행됩니다."
				+"\n"
				+"수동으로 평가값을 변경한 기사에 대해서도 다시 평가되며,\n재평가 후에는 복구가 불가능합니다."
				+"\n\n"
				+"[출입기자]에 대한 재평가를 실시하시겠습니까?";
				
				const sen2 = ""
				+"다시 확인해주세요."
				+"\n\n"
				+"재평가 시 등록된 모든 기사의 자동평가가 다시 수행됩니다."
				+"\n"
				+"수동으로 평가값을 변경한 기사에 대해서도 다시 평가되며,\n재평가 후에는 복구가 불가능합니다."
				+"\n\n"
				+"[출입기자]에 대한 재평가를  실시하시겠습니까?";
				if (!confirm(sen1)) return;
				if (!confirm(sen2)) return;
				alert("등록된 기사에 따라 많은 시간이 소요될 수 있습니다.\n기본적으로 수 분이 소요됩니다.\n완료 시까지 기다려 주세요.");
				this.SET_LOADING_GIF(true);
				let params = new FormData();
				params.append('evaluationSeq', 4);
				if (await this.setReAutoEvaluateAPI(params)) {
					alert("재평가가 완료 됐습니다.");
				}
				this.SET_LOADING_GIF(false);
			}
    }
  };
</script>

<style scoped>
  .cont_wrap .set_report_box .set_report dd {
    border-left: 0 !important;
  }
  .cont_wrap .set_box_area .btn {
    float: right !important;
  }
  #searchTextMediaDiv {
    max-height: 170px;
    width: calc(40% - 35px);
    overflow-y: auto;
    overflow-x: hidden;
    position: absolute;
    left: 20px;
    border: 1px #999 solid;
    background: #fff;
    top: -300px;
    z-index: 10;
  }
  #searchTextMediaDiv p {
    width: 220px;
    overflow: hidden;
  }
  #searchTextMediaDiv p.selected {
    background: gray;
    color: white;
  }
  .dn {
    display:none;
  }
  .set_auto_box.box6 { height: calc(70% - 10px) !important; }
</style>
