<template>
  <transition name="modal-fade" >
    <div id="pop_wrap" class="hereclass">
      <div class="overlay" @click="close"></div>
      <div class="pop_window">
        <div class="pop_tit">
          <p>매체 설정</p>
          <div class="pop_tit_btn">
            <div class="pop_refresh"><a @click="reset">초기화</a></div>
            <div class="pop_closed"><a @click="close">닫기</a></div>
          </div>
        </div>
        <div class="pop_cont">
          <div class="sel_all">
            <input type="checkbox" id="media_list_all" v-model="selectAll">
            <label for="media_list_all"><span></span>전체선택</label>
            <p style="float:right;margin-left:16px">
              <span style="margin-left:16px" class="btn_open" @click="foldAll(false)">전체 항목 펴기<a  class="ico ms_ico_open"></a></span>
              <span style="margin-left:16px" class="btn_close" @click="foldAll(true)">전체 항목 접기<a class="ico ms_ico_close"></a></span>
            </p>
            <p style="float:right;width:auto">
              <span style="float:left">목록 보기 방식</span>
              <input type="radio" id="media_group_category" v-model="getStatSetting.groupIsCategory" @change="getStatSetting.groupIsCategory=true" value="true"
              >
              <label for="media_group_category" style="margin-left:16px"><span></span>분류(category)별</label>
              <input type="radio" id="media_group_type" v-model="getStatSetting.groupIsCategory" @change="getStatSetting.groupIsCategory=false" value="false"
              >
              <label for="media_group_type" style="margin-left:16px"><span></span>유형(type)별</label>
            </p>
          </div>
          <div class="ct_group opened" :class="'ct_group_'+(getStatSetting.groupIsCategory?'cat':'type')+'_'+group.group_id" v-for="group in fullList" :key="'ct_group_'+group.group_id">
            <strong>
              <input type="checkbox"
                     :id="'ct_group_'+group.group_id"
                     :value="group.group_id"
                     :title="group.group_name"
                     :checked="stateCategory(group)"
                     @change="checkCategory($event, group)">
              <label v-bind:for="'ct_group_'+group.group_id">
                <span></span>
                {{group.group_name}} ({{group.mediaCount}}종)
              </label>
              <span class="btn_open" @click="fold(group.group_id)">전체 항목 펴기<a class="ico ms_ico_open"></a></span>
              <span class="btn_close" @click="fold(group.group_id)">전체 항목 접기<a class="ico ms_ico_close"></a></span>
            </strong>
            <div class="media_wrapper" :class="'media_wrapper_' + group.group_id">
              <dl v-for="(pk,key,idx) in group.mediaList"
              :key="'pk_'+group.group_id+'_'+idx" :class="'pk_' + (getStatSetting.groupIsCategory?'cat':'type') + '_' + group.group_id + '_' + idx" class="pk_group opened">
                <dt>
                  <input type="checkbox"
                  :id="'pk_'+group.group_id+'_'+idx" :value="idx"
                  :checked="stateGroup(pk)"
                  @change="checkGroup($event, pk)">
                  <label v-bind:for="'pk_'+group.group_id+'_'+idx"><span></span>{{key}} ({{pk.length}}종)</label>
                  <span class="btn_open" @click="foldPg(group.group_id+'_'+idx)">전체 항목 펴기<a class="ico ms_ico_open"></a></span>
                  <span class="btn_close" @click="foldPg(group.group_id+'_'+idx)">전체 항목 접기<a class="ico ms_ico_close"></a></span>
                </dt>
                <dd class="paper_wrapper">
                  <ul>
                    <li v-for="media in pk" :key="'media_'+media.media_id">
                      <input type="checkbox"
                      :id="'media_'+media.media_id"
                      :value="media" v-model="checkedMedia">
                      <label v-bind:for="'media_'+media.media_id"><span></span>{{media.media_name}}{{ media.media_type === '0' ? '' : ' (' + media.media_type_name + ')' }}</label>
                    </li>
                  </ul>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="pop_foot"><a @click="submit" class="btn_bl">확인</a><a @click="close" class="btn_gr">취소</a></div>
      </div>
    </div>
  </transition>
</template>

<script>
  /* eslint-disable no-console */

  import {mapGetters} from 'vuex';

  export default {
    name: 'MediaSelection',
    props: ['value', 'used'],
    data() {
      return {
        useCheck: this.used ? this.used : 1,
        checkedMedia: this.getProps()
      };
    },
    computed: {
      // getter를 객체 전개 연산자(Object Spread Operator)로 계산하여 추가합니다.
      ...mapGetters([
        'getMediaList',
        'getStatSetting'
      ]),
      checkedMediaIds: function() {
        let rtn = [];
        this.checkedMedia.forEach(m => {
          rtn.push(m.media_id);
        });
        return rtn;
      },
      selectAll: {
        get: function() {
          if (this.fullList) {
            let count = 0;
            for (const listKey in this.fullList) {
              for (const mediaKey in this.fullList[listKey].mediaList) {
                count += this.fullList[listKey].mediaList[mediaKey].length;
              }
            }
            return this.checkedMedia.length === count;
          }
          return false;
        },
        set: function(value) {
          const selected = [];
          if (value) {
            for (const listKey in this.fullList) {
              for (const mediaKey in this.fullList[listKey].mediaList) {
                this.fullList[listKey].mediaList[mediaKey].forEach(function(item) {
                  selected.push(item);
                });
              }
            }
          }
          this.checkedMedia = selected;
        }
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
    },
    created() {
      this.$eventBus.$on('mediaSelectionReset', params => {
				this.reset();
			});
    },
    beforeMount() {
      window.addEventListener('keyup', this.onEscapeKeyUp);
    },
    beforeDestroy () {
      window.removeEventListener('keyup', this.onEscapeKeyUp);
      this.$eventBus.$off("mediaSelectionReset");
    },

    methods: {
      /**
       * ESC로 페이지 닫기 이벤트
       */
      onEscapeKeyUp (event) {
        if (event.which === 27) {
          this.close();
        }
      },
      /**
       * 페이지 닫기 이벤트
       */
      close() {
        this.$statConfig.bodyScrolling(true)
        this.$emit('close');
      },
      /**
       * 체크박스 초기화
       */
      reset() {
        this.checkedMedia = [];
      },
      /**
       * 체크박스 내용 부모페이지에 전달
       */
      submit() {
        let group = this.getStatSetting.groupIsCategory ? 'category_name' : 'media_type_name';
        this.$emit('input', this.mediaGroups(this.checkedMedia, group));
        this.close();
      },
      /**
       * 수정중
       * @returns {Array}
       */
      getProps() {
        let result = [];
        if (this.value) {
          let $this = this;
          Object.keys($this.value).map(function(objectKey) {
            let value = $this.value[objectKey];
            for (let key in value) {
              result.push(value[key]);
            }
          });
        }
        return result;
      },
      /**
       * 그룹 체크박스 이벤트
       * @param $event
       * @param group
       */
      checkGroup($event, group) {
        let $this = this;
        if (group) {
          group.forEach(function(item) {
            if ($event.target.checked) {

              if ($this.checkedMedia.indexOf(item) === -1) {
                $this.checkedMedia.push(item);
              }
            } else {
              const idx = $this.checkedMedia.indexOf(item);
              if (idx > -1) {
                $this.checkedMedia.splice(idx, 1);
              }
            }
          });
        }
      },

      /**
       * 그룹 체크박스 상태 여부 자동 체크 처리
       * @param group
       * @returns {boolean}
       */
      stateGroup(group) {
        if (Array.isArray(group)) {
          let $this = this;
          return group.every(function(item) {
            if ($this.checkedMediaIds.indexOf(item.media_id) > -1) {
              return true;
            }
          });
        }
      },
      /**
       * 카테고리 체크박스 상태여부 자동 체크 처리
       * @param category
       * @returns {boolean}
       */
      stateCategory(category) {
        if (category.mediaList) {
          let $this = this;
          const cateList = [];
          for (const mediaKey in category.mediaList) {
            category.mediaList[mediaKey].forEach(function(item) {
              cateList.push(item);
            });
          }
	        return cateList.every(function(item, idx) {
            if ($this.checkedMedia.indexOf(item) > -1) {
              return true;
            }
          });
        }
      },
      /**
       * 카테고리 체크박스 이벤트
       * @param $event
       * @param category
       */
      checkCategory($event, category) {
        let $this = this;
        if (category.mediaList) {
          for (const mediaKey in category.mediaList) {
            category.mediaList[mediaKey].forEach(function(item) {
              if ($event.target.checked) {
                if ($this.checkedMedia.indexOf(item) === -1) {
                  $this.checkedMedia.push(item);
                }
              } else {
                const idx = $this.checkedMedia.indexOf(item);
                if (idx > -1) {
                  $this.checkedMedia.splice(idx, 1);
                }
              }

            });
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
      }

      , fold(num) {
        let classNameSelector = '.ct_group_' + (this.getStatSetting.groupIsCategory ? 'cat' : 'type') + '_' + num;
        let obj = this.$el.querySelector(classNameSelector);
        let className, isFoldedParent = false;
        if (obj) {
          className = obj.getAttribute('class');
          if (className.includes('folded')) {
            className = className.replace('folded', 'opened');
            isFoldedParent = false;
          } else {
            className = className.replace('opened', 'folded');
            isFoldedParent = true;
          }
          obj.setAttribute('class', className);
        }
        classNameSelector = classNameSelector + ' .pk_group';
        obj = this.$el.querySelectorAll(classNameSelector);
        [].forEach.call(obj, function(o) {
          className = o.getAttribute('class');
          if (isFoldedParent) {
            className = className.replace('opened', 'folded');
          } else {
            className = className.replace('folded', 'opened');
          }
          o.setAttribute('class', className);
        });
      }

      , foldPg(num) {
        let classNameSelector = '.pk_' + (this.getStatSetting.groupIsCategory ? 'cat' : 'type') + '_' + num;
        let obj = this.$el.querySelector(classNameSelector);
        let className;
        if (obj) {
          className = obj.getAttribute('class');
          if (className.includes('folded')) {
            className = className.replace('folded', 'opened');
          } else {
            className = className.replace('opened', 'folded');
          }
          obj.setAttribute('class', className);
        }
      }

      , foldAll(mode) {
        let classNameSelector = '', classNameNew = '';
        if (mode === true) {
          classNameSelector = 'opened';
          classNameNew = 'folded';
        } else if (mode === false) {
          classNameSelector = 'folded';
          classNameNew = 'opened';
        } else {
          return;
        }
        let obj = this.$el.querySelectorAll('.' + classNameSelector);
        let className;
        if (obj) {
          [].forEach.call(obj, function(o) {
            className = o.getAttribute('class');
            className = className.replace(classNameSelector, classNameNew);
            o.setAttribute('class', className);
          });
        }
      }
    }
  };
</script>

<style scoped>
  .pop_tit > p {
    width: calc(100% - 84px);
  }
  .pop_cont {
    overflow-y: scroll !important;
  }
  .ct_group {
    border: 1px solid #d9d9d9;
  }
  .ct_group.folded {
    border-bottom: none;
  }
  .ct_group > .media_wrapper {
    overflow: hidden;
    padding: 6px 14px 14px 14px;
  }
  .ct_group.folded > .media_wrapper {
    display: none;
  }
  .folded > .paper_wrapper {
    display: none;
  }

  strong {
    border-top: 0 !important;
    border-right: 0 !important;
    border-left: 0 !important;
    border-bottom: 1px solid #d9d9d9 !important;
  }
  .btn_close, .btn_open {
    color: #999;
    cursor: pointer;
    float: right;
    font-size: 11px;
    font-weight: bold;
    margin-top: 3px;
  }
  .btn_close .ico, .btn_open .ico {
    float: right;
    height: 14px;
    margin: 2px 0 0 4px;
    width: 14px;
  }
  .ct_group.folded > strong > .btn_close, .pk_group.folded > dt > .btn_close {
    display: none;
  }
  .ct_group.opened > strong > .btn_open, .pk_group.opened > dt > .btn_open {
    display: none;
  }
  @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
    a.ms_ico_close, a.ms_ico_open {
      margin-top: 1px;
    }
    span.ms_ico_close, span.ms_ico_open {
      margin-top: 3px;
    }
  }
  #pop_wrap .pop_window .pop_cont .media dl {
    overflow: hidden;
  }
</style>
