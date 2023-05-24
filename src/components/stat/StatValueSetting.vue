<template>
  <transition name="modal-fade">
    <div id="pop_wrap">
      <div class="overlay" @click="close"></div>
      <div class="pop_window">
        <div class="pop_tit">
          <p>가치 설정</p>
          <div class="pop_tit_btn">
            <div class="pop_closed"><a @click="close">닫기</a></div>
          </div>
        </div>
        <div class="pop_cont">
          <!-- s: set_media -->
          <div class="set_media">
            <div class="set_media_th">
              <div class="md sort">매체구분</div>
              <div class="md std">기사 가치 산출 기준</div>
              <div class="md price">광고단가 (단위:천원)</div>
              <div class="md wt">가중치</div>
              <div class="md date">등록일</div>
              <div class="md state">상태</div>
              <div class="md mdedit">관리</div>
            </div>
            <ul>
              <template v-for="(category,i) in categoryList">
                <li class="set_media_list"
                    :class="{'edit_mode' : category.edit,'disable':editMode===true&&!category.edit&&!category.edit_media}"
                    :key="i">
                  <form @submit.prevent="setCategoryValue($event,category)">
                    <div class="md sort">
                      <input type="text"
                             name="category_name"
                             maxlength="12"
                             autocomplete="off"
                             placeholder="매체구분 입력"
                             required
                             v-if="category.edit"
                             :value="category.category_name">
                      <slot v-else>{{category.category_name}}</slot>
                    </div>
                    <div class="md std">
                      <select
                          name="criteria"
                          v-if="category.edit"
                          :value="category.categoryOutput">
                        <option v-for="(value, index) in getValueGroupInfo" :key="index" :value="value.lvalue">
                          {{value.sname}}
                        </option>
                      </select>
                      <slot v-else>{{getValueLabel(category.categoryOutput)}}</slot>
                    </div>
                    <div class="md price">
                      <input type="text"
                             name="cost"
                             pattern="(\d*\.?\d+)"
                             maxlength="10"
                             autocomplete="off"
                             v-if="category.edit"
                             :value="category.unitCost">
                      <slot v-else>{{category.unitCost}}</slot>
                    </div>
                    <div class="md wt">
                      <select
                          name="weighted"
                          v-if="category.edit"
                          :value="category.weighted">
                        <option value="1">평가항목1</option>
                        <option value="2">평가항목2</option>
                        <option value="3">평가항목1 X 평가항목2</option>
                      </select>
                      <slot v-else>{{getWeightedLabel(category.weighted)}}</slot>
                    </div>
                    <div class="md date">{{category.regdate}}</div>
                    <div class="md state">
                      <select
                          name="use"
                          v-if="category.edit"
                          :value="category.isUse">
                        <option value="0">사용</option>
                        <option value="1">비사용</option>
                      </select>
                      <slot v-else>{{getUseLabel(category.isUse)}}</slot>
                    </div>
                    <div class="md mdedit">
                      <div class="btn_right">

                        <slot v-if="category.edit">
                          <button class="btn_na btn" type="submit">저장</button>
                          <button class="btn_gr btn" type="reset" @click="cancelCategory(i)">취소</button>
                        </slot>
                        <div class="btn_gr btn"
                             :class="{'btn_disable':category.edit_media===true}"
                             v-else
                             @click="categoryEdit(category)">편집
                        </div>
                        <div class="btn_gr btn " :class="{'btn_disable':category.edit===true}"
                             @click="mediaListEdit(category)"
                             unselectable="on">매체명관리
                        </div>
                      </div>
                    </div>
                  </form>
                  <!-- 매체명관리 누르면 -->
                  <div class="set_md_list" v-if="category.mediaList" v-show="category.edit_media">
                    <div class="set_md_header">
                      <h4>&gt; 매체명 관리</h4>
                      <div class="md_add">
                        <form @submit.prevent="setCategoryValue($event,null)">
                          <input type="text"
                                 maxlength="12"
                                 required
                                 name="media_name"
                                 placeholder="매체명 입력" autocomplete="off">
                          <input type="text"
                                 class="md_add_val"
                                 pattern="(\d*\.?\d+)"
                                 maxlength="10"
                                 name="point"
                                 autocomplete="off"
                                 placeholder="가치 입력">
                          <input type="hidden" name="category_id" :value="category.category_id">
                          <input type="hidden" name="use" value="0">
                          <button type="submit" class="btn btn_na">추가</button>
                        </form>
                      </div>
                      <p>* 매체명, 가치 값 수정은 '사용' 상태 시 가능합니다.</p>
                    </div>
                    <div class="md_table">
                      <ul class="md_th">
                        <li>
                          <div class="mdn md_no">NO</div>
                          <div class="mdn md_name">매체명</div>
                          <div class="mdn md_val">가치</div>
                          <div class="mdn md_edit">관리</div>
                        </li>
                        <li>
                          <div class="mdn md_no">NO</div>
                          <div class="mdn md_name">매체명</div>
                          <div class="mdn md_val">가치</div>
                          <div class="mdn md_edit">관리</div>
                        </li>
                        <li>
                          <div class="mdn md_no">NO</div>
                          <div class="mdn md_name">매체명</div>
                          <div class="mdn md_val">가치</div>
                          <div class="mdn md_edit">관리</div>
                        </li>
                        <li>
                          <div class="mdn md_no">NO</div>
                          <div class="mdn md_name">매체명</div>
                          <div class="mdn md_val">가치</div>
                          <div class="mdn md_edit">관리</div>
                        </li>
                      </ul>
                      <ul class="md_td">
                        <li v-for="(media ,mediaIdx) in category.mediaList" :key="mediaIdx">
                          <div class="mdn md_no">{{mediaIdx+1}}</div>
                          <div class="mdn md_name"
                               :class="{'danger':media.media_name===''}"
                               @paste="maxLengthPaste"
                               @input="maxLengthKeydown"
                               @blur="media.media_name=$event.target.innerText.trim();updateMedia($event,media)"
                               :maxlength="'12'"
                               :name="'mn'"
                               v-text="media.media_name"
                               v-bind:contenteditable="media.isUse==='0'">
                          </div>
                          <div class="mdn md_val"
                               :class="{'danger':!isNumeric(media.point)}"
                               @paste="maxLengthPaste"
                               @input="maxLengthKeydown"
                               @blur="media.point=$event.target.innerText.trim();updateMedia($event,media)"
                               :maxlength="'10'"
                               :name="'p'"
                               v-text="media.point"
                               v-bind:contenteditable="media.isUse==='0'">
                          </div>
                          <div class="mdn md_edit">
                            <div class="btn"
                                 :class="{'btn_bl':media.isUse==='0','btn_gr':media.isUse!=='0'}"
                                 :name="'u'"
                                 @click="media.isUse='0';updateMedia($event,media)">사용
                            </div>
                            <div class="btn"
                                 :class="{'btn_gr':media.isUse==='0','btn_bl':media.isUse!=='0'}"
                                 :name="'u'"
                                 @click="media.isUse='1';updateMedia($event,media)">비사용
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div class="set_md_footer" style="display:none;">
                      <a @click="close" class="btn_wh btn">취소</a>
                      <a @click="close" class="btn_na btn">저장</a>
                    </div>
                  </div>
                </li>
              </template>
              <!-- 편집 누르면 class edit_mode 추가-->
            </ul>
          </div>
          <!-- e: set_media -->
          <div class="set_list_tf" v-show="!this.editMode"><a @click="insertCategory">+ 항목추가</a></div>
        </div>
        <div class="pop_foot"><a @click="close" class="btn_bl">확인</a><a @click="close" class="btn_gr btn">취소</a></div>
      </div>
    </div>
  </transition>
</template>

<script>
  /* eslint-disable no-console */

  import {mapActions, mapGetters} from 'vuex';

  export default {
    name: 'StatValueSetting',
    data() {
      return {
        categoryList: null,
        editMode: false
      };
    },
    mounted() {
      this.onSetting();
    },

    beforeMount() {
      window.addEventListener('keyup', this.onEscapeKeyUp);
    },
    beforeDestroy() {
      window.removeEventListener('keyup', this.onEscapeKeyUp);
    },
    computed: {
      ...mapGetters([
        'getMediaList',
        'getValueGroupInfo'
      ])
    },
    methods: {
      ...mapActions(['valueGroupAPI', 'setValueSettingAPI']),
      /**
       * ESC로 페이지 닫기 이벤트
       */
      onEscapeKeyUp(event) {
        if (event.which === 27) {
          this.close();
        }
      },
      /**
       * 페이지 닫기 이벤트
       */
      close() {
        this.$emit('close');
      },
      /**
       * 체크박스 초기화
       */
      reset() {
        this.checkedMedia = [];
      },
      /**
       * API LOAD
       * @returns {Promise<void>}
       */
      async onSetting() {
        try {
          await this.valueGroupAPI();
          this.syncMediaList();
        } catch (e) {
          console.error(e);
        }
      },
      /**
       * 매체 목록 동기화
       */
      syncMediaList() {
        const $this = this;
        let edit_open = [];
        if (this.categoryList) {
          this.categoryList.map(function(dd) {
            if (dd.edit_media) {
              edit_open.push(dd.category_id);
            }
          });
        }
        this.categoryList = Object.assign([], this.getMediaList);
        this.categoryList.map(function(dd) {
          $this.$set(dd, 'edit', false);
          $this.$set(dd, 'edit_media', false);
          if (edit_open.length > 0) {
            if (edit_open.indexOf(dd.category_id) >= 0) {
              $this.$set(dd, 'edit_media', true);
            }
          }
        });
      },
      /**
       * 매체구분 상태 라벨
       */
      getUseLabel(isUse) {
        if (isUse === '1') {
          return '미사용';
        } else {
          return '사용';
        }
        /**
         * 매체구분 가중치 라벨
         */
      },
      getWeightedLabel(weighted) {
        switch (weighted) {
          case '1':
            return '평가항목1';
          case '2':
            return '평가항목2';
          case '3':
            return '평가항목1 X  평가항목2';
        }
        return '';
      },
      /**
       * 기사 가치 산출 기준 라벨
       */
      getValueLabel(value) {

        let result = '';
        if (this.getValueGroupInfo) {
          this.getValueGroupInfo.forEach(function(group) {
            if (group.lvalue === value) {
              result = group.sname;
            }
          });
        }
        return result;
      },
      /**
       * 매체 분류 및 매체명 추가 및 업데이트
       */
      async setCategoryValue($event, category) {
        const formData = $event.target;
        try {
          let params = new FormData();
          if (category) {
            params.append('mi', category.media_id);
            params.append('ci', category.category_id);
          } else {
            params.append('ci', formData.category_id.value);
          }


          if (formData.media_name) {
            if (formData.media_name.value.trim() === '') {
              formData.media_name.value = formData.media_name.value.trim();
              formData.media_name.focus();
              return;
            }
            params.append('mn', formData.media_name.value.trim());
            params.append('p', formData.point.value.trim());

          } else if (formData.category_name) {
            if (formData.category_name.value.trim() === '') {
              formData.category_name.value = formData.category_name.value.trim();
              formData.category_name.focus();
              return;
            }
            params.append('cn', formData.category_name.value.trim());
            params.append('co', formData.criteria.value);
            params.append('uc', formData.cost.value.trim());
            params.append('w', formData.weighted.value);
          }
          params.append('u', formData.use.value);
          await this.setValueSettingAPI(params);
          this.syncMediaList();
          this.editMode = false;
        } catch (e) {
          console.error(e);
        }
      },
      /**
       * 항목 추가 이벤트
       */
      insertCategory() {
        const newLine = {
          categoryOutput: '0',
          category_id: '0',
          category_name: '',
          edit: true,
          edit_media: false,
          isUse: '0',
          mediaList: [],
          media_id: '',
          regdate: '',
          unitCost: '0',
          weighted: '3'
        };
        if (!this.editMode){
          this.$set(this.categoryList, this.categoryList.length, newLine);
          this.editMode = true;
        }

      },
      /**
       * 항목 추가 취소
       */
      cancelCategory(i) {
        this.categoryList[i].edit = false;
        if (!this.categoryList[i].media_id) {
          this.categoryList.splice(i, 1);
        }
        this.editMode = false;
      },
      /**
       * 글자 길이 체크
       * @param el
       */
      placeCaretAtEnd(el) {
        el.focus();
        if (typeof window.getSelection !== 'undefined'
            && typeof document.createRange !== 'undefined') {
          let range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false);
          let sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        } else if (typeof document.body.createTextRange !== 'undefined') {
          let textRange = document.body.createTextRange();
          textRange.moveToElementText(el);
          textRange.collapse(false);
          textRange.select();
        }
      },
      isNumeric(num) {
        // 좌우 trim(공백제거)을 해준다.
        num = String(num).replace(/^\s+|\s+$/g, '');
        let regex = /^[+\-]?(([1-9][0-9]{0,2}(,[0-9]{3})*)|[0-9]+){1}(\.[0-9]+)?$/g;

        if (regex.test(num)) {
          num = num.replace(/,/g, '');
          return !isNaN(num);
        } else {
          return false;
        }
      },
      /**
       * 매체 수정
       * @param el
       */
      async updateMedia($event, media) {
        try {
          if (media) {
            if (!this.isNumeric(media.point)) {
              $event.target.parentNode.querySelector('div.md_val').focus();
              $event.target.parentNode.querySelector('div.md_val').classList.add('danger');
              return;
            }
            if (!media.media_name.trim().length) {
              $event.target.parentNode.querySelector('div.md_name').focus();
              $event.target.parentNode.querySelector('div.md_name').classList.add('danger');
              return;
            }
            $event.target.classList.remove('danger');
            let params = new FormData();
            params.append('mi', media.media_id);
            params.append('mn', media.media_name);
            params.append('p', media.point);
            params.append('u', media.isUse);
            await this.setValueSettingAPI(params);
            this.syncMediaList();
          }
        } catch (e) {
          console.error(e);
        }
        return false;
      },
      /**
       * 글자 키보드 입력시 이벤트
       * @param el
       */
      maxLengthKeydown(event) {
        if (event.target.attributes.maxlength) {
          let limit = Number(event.target.attributes.maxlength.value);
          let text_length = event.target.innerText.length;
          if (limit - text_length <= 0) {
            event.target.innerText = event.target.innerText.slice(0, limit);
            this.placeCaretAtEnd(event.target);
          }
        }
      },
      /**
       * 글자 붙여넣기 이벤트
       * @param el
       */
      maxLengthPaste(event) {
        event.preventDefault();
        // get text representation of clipboard
        let text = (event.originalEvent || event).clipboardData.getData('text/plain');
        let limit = Number(event.target.attributes.maxlength.value);
        if (event.target.attributes.maxlength) {
          if (event.target.innerText.length > limit) {
            return;
          }
          if (event.target.innerText.length + text.length > Number(event.target.attributes.maxlength.value)) {
            text = text.substring(0, event.target.attributes.maxlength.value);
          }
        }
        document.execCommand('insertText', true, text);
      },
      categoryEdit(category) {
        if (!this.editMode) {
          category.edit = true;
          category.edit_media = false;
          this.editMode = true;
        }

      },
      mediaListEdit(category) {
        if (!category.edit) {
          if (!this.editMode) {
            category.edit_media = !category.edit_media;
            this.editMode = !this.editMode;
          } else if (category.edit_media) {
            category.edit_media = !category.edit_media;
            this.editMode = !this.editMode;
          }

        }

      }
    }
  };
</script>

<style>

</style>