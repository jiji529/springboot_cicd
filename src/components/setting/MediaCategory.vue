<template>
    <div>
        <div class="cont_wrap" style="margin-top:40px">
            <div id="policyThird" class="policyArea">
                <div class="set_box_area media_category left">
                    <div class="set_auto_box box2">
                        <div class="set_title">
                            <h2>매체분류</h2>
                            <div class="set_tit_btn">
                                <!--<a @click="" class="btn_gr">취소</a>-->
                                <a @click="categoryEdit = true" class="btn_na" v-if="!categoryEdit">추가/수정</a>
                                <slot v-else>
                                    <a @click="categoryAdd()" class="btn_na">추가</a>
                                    <a @click="saveCategoryChange()" class="btn_na">저장</a>
                                    <a @click="categoryUpdateClose()" class="btn_wh">취소</a>
                                </slot>
                            </div>
                        </div>
                        <div class="set_cont">
                            <div class="set_list_tb">
                                <div class="set_list_th">
                                    <div class="md col1-1">
                                        <input type="checkbox" title="전체선택" id="mediaTypeAll" @change="selectCategoryAll(selectedCategoryAll)" v-model="selectedCategoryAll" /><label for="mediaTypeAll"><span></span></label>
                                    </div>
                                    <div class="md col1-6">No.</div>
                                    <div class="md col1-5">매체분류</div>
                                    <div class="md col1-4">매체갯수</div>
                                </div>
                                <ul>
                                    <template v-for="(item, index) in mediaCategoryList">
                                        <li class="set_list_td" :key="item.value" v-if="!categoryEdit">
                                            <div>
                                                <div class="md col1-1">
                                                  <input type="checkbox" :id="'selectedCategoryListChk_'+item.value" :value="item.value"
                                                  v-model="selectedCategoryList" @change="selectCategory(item.value)" /><label :for="'selectedCategoryListChk_'+item.value"><span></span></label>
                                                </div>
                                                <div class="md col1-6">{{item.value}}</div>
                                                <div class="md col1-5">{{item.alias}}</div>
                                                <div class="md col1-4">{{item.cnt}}</div>
                                            </div>
                                        </li>
                                        <li v-else class="set_list_td" :id="'category_'+index" :key="item.value" draggable="true" v-on:dragstart="onDragStart($event);" v-on:dragover="allowDrop($event)" v-on:drop="drop($event);">
                                            <div>
                                                <div class="md col1-1">{{Number(item.sort)+1}}</div>
                                                <div class="md col1-6">{{item.value}}</div>
                                                <div class="md col1-5"><input type="text" v-model="item.alias"/></div>
                                                <div class="md col1-4">{{item.cnt}}</div>
                                            </div>
                                        </li>
                                    </template>
                                </ul>
                                <div class="categoryChangeComment">
                                  <p>&#187; 추가되는 매체의 기본 분류는 0번입니다.</p>
                                  <p v-if="categoryEdit">&#187; 항목을 끌어서 이동하시면 순서가 변경 됩니다.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="set_box_area media_value right">
                    <div class="set_auto_box box2" style="width:100%">
                        <div class="set_title">
                            <h2>매체별 분류 설정</h2>
                        </div>
                        <div class="set_cont">
                            <div class="set_cont_head">
                                <select v-model="moveCategory">
                                    <option v-for="(item, index) in mediaCategoryList" :value="item.value">{{item.alias}}</option>
                                </select>
                                <span>으로</span>
                                <a class="btn_move" @click="mediaMove()">매체 이동</a>
                            </div>
                            <div class="set_list_tb">
                            <template v-if="mediaList.length > 0">
                                <template v-for="(paper, pidx) in paperCategoryList">
                                    <div style="overflow:hidden" :key="'media_group'+pidx">
                                        <div class="set_list_th" >
                                            <div class="md col1-1" >
                                                <input type="checkbox" :id="'group_checkbox'+pidx" class="reset_group" @change="selectGroup($event, paper, pidx)">
                                                <label style="margin-left: 37px;" :for="'group_checkbox'+pidx"><span></span></label>
                                            </div>
                                            <div class="md col1-2">{{paper.name}}</div>
                                            <div class="md col1-3"></div>
                                        </div>
                                        <ul>
                                            <template v-for="(media, midx) in mediaList.slice(paper.start, paper.end)">
                                                <li class="set_list_td">
                                                    <div class="md col1-1">
                                                        <input type="checkbox" :id="'midx_'+media.mediaId" @change="clickCheckedMedia(media.mediaId, pidx, true)" v-model="mediaInfo[media.mediaId].checked" />
                                                        <label :for="'midx_'+media.mediaId"><span ></span></label>
                                                    </div>
                                                    <div class="md col1-2"><slot ><!--v-if="categoryIsMulti"-->[{{mediaInfo[media.mediaId].mediaCateName}}]</slot> {{mediaInfo[media.mediaId].mediaName}}</div>
                                                    <div class="md col1-3"></div>
                                                    <slot v-if="media.mapCode.length > 0">
                                                        <template v-for="(map, mapIdx) in media.mapCode" v-if="mediaInfoByMap[map]">
                                                            <div class="sub md col1-1">
                                                                <input type="checkbox" :id="'midx_'+media.mediaId+'_'+mapIdx" @change="clickCheckedMedia(mediaInfoByMap[map].mediaId, pidx, true)" v-model="mediaInfo[mediaInfoByMap[map].mediaId].checked" />
                                                                <label :for="'midx_'+media.mediaId+'_'+mapIdx"><span></span></label>
                                                            </div>
                                                            <div class="sub md col1-2">┗ <slot><!--v-if="categoryIsMulti"-->({{mediaInfoByMap[map].mediaCateName}})</slot> {{mediaInfoByMap[map].mediaName}}</div>
                                                            <div class="sub md col1-3"></div>
                                                        </template>
                                                    </slot>
                                                </li>
                                                <hr v-if="(midx+1)%3==0" style="border:0" />
                                            </template>
                                            <template v-for="n in Number(paper.gap)">
                                                <li class="set_list_td"></li>
                                            </template>
                                        </ul>
                                    </div>
                                </template>
                            </template>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="loading" v-if="loadingGif"><img class="loading-image" :src="require('@/assets/images/loading.gif')" alt="Loading..."/>
    		</div>
    </div>
</template>
<script>
    import {mapActions, mapState} from 'vuex';
    export default{
        name: 'MediaCategory'
        ,data(){
            return {
                'mediaList':[]
                ,'mediaInfo':[]
                ,'mediaInfoByMap':[]
                ,'allList':[]
                ,'mediaCategoryList':[]
                ,'paperCategoryList':[]
                ,'categoryEdit':false
                ,'orgMediaCategoryList':[]
                ,'checkedMedia':[]
                ,'selectedCategoryList':[]
                ,'selectedCategoryAll':false
                ,'moveCategory':0
            }
        }
        ,async created() {
            this.getPageData();
        }
        ,watch: {
            categoryEdit:function(){
                if(this.categoryEdit){
                    this.orgMediaCategoryList = JSON.parse(JSON.stringify(this.mediaCategoryList));
                }
            },
        }
        ,computed: {
            ...mapState([
                'pid','loadingGif'
            ]),
            categoryIsMulti:function(){
                return (this.selectedCategoryAll === true || this.selectedCategoryList.length !== 1);
            }
        }
        ,methods: {
            ...mapActions([
                'getMediaCategorySelectionAPI'
                ,'updateMediaCategorySelectionAPI'
            ]),
            selectGroup(e, paper) {
                if (e.target.checked) {
                    for(let me of this.mediaList.slice(paper.start, paper.end)) {
                        me.checked = true;
                        this.mediaInfo[me.mediaId].checked = true;
                        this.clickCheckedMedia(me.mediaId, null, false);
                    }
                } else {
                    for(let me of this.mediaList.slice(paper.start, paper.end)) {
                        me.checked = false;
                        this.mediaInfo[me.mediaId].checked = false;
                        this.clickCheckedMedia(me.mediaId, null, false);
                    }
                }
                

            },
            async getPageData(){
                var formData = new FormData;
                let catSeqsStr = this.selectedCategoryAll ? '-1' : this.selectedCategoryList.join();
                formData.append('mediaCategory', catSeqsStr);
                const arrData = await this.getMediaCategorySelectionAPI(formData);
                this.allList = arrData.allList;
                this.allList.forEach(media =>{
                    this.mediaInfo[media.mediaId] = media;
                    if (media.paperCode !== '' && media.paperCode !== 'ZZZZ') {
                      this.mediaInfoByMap[media.paperCode] = media;
                    }
                });
                this.mediaList = arrData.list;
                if(this.mediaList !== null){
                    this.paperCategoryList = arrData.paperCategorys;
                }else{
                   this.mediaList = []
                   this.mediaList.push();
                }
                this.mediaCategoryList = arrData.mediaCategorys;
            }
            ,onDragStart(ev){
                ev.dataTransfer.setData("text", ev.target.id);
            }
            ,allowDrop(ev) {
                ev.preventDefault();
            }
            ,drop(ev) {
                ev.preventDefault();
                var data = ev.dataTransfer.getData("text");
                var dropIdx = ev.target.offsetParent.id.split("_")[1];
                var dragIdx = document.getElementById(data).id.split("_")[1];

                var dropObj = JSON.parse(JSON.stringify(this.mediaCategoryList[dropIdx]));
                this.mediaCategoryList.splice(dropIdx,1,this.mediaCategoryList[dragIdx]);
                this.mediaCategoryList.splice(dragIdx,1,dropObj);
            }
            ,categoryAdd(){
                var obj = {
                    'seq':""
                    ,'sort':this.mediaCategoryList.length+""
					,'alias':'미지정'
					,'value':this.mediaCategoryList.length+""
					,'cnt':0
                }
                this.mediaCategoryList.push(obj);
            }
            ,async saveCategoryChange(){
                const formData = new FormData;
                var paramsList = JSON.parse(JSON.stringify(this.mediaCategoryList));
                paramsList.forEach((obj) => {
                    obj['alias'] = encodeURI(obj['alias']);
                })
                formData.append('params', JSON.stringify(paramsList));
                formData.append('updateCode', 'cate');
                const data = await this.updateMediaCategorySelectionAPI(formData);
                if (data) {
                  this.mediaCategoryList = data;
                  this.mediaCategoryList.push();  //변경 감지를 위해
                  this.categoryEdit = false;
                } else {
                  this.$eventBus.$emit('kickOut');
                }
            }
            ,async categoryUpdateClose(){
                this.mediaCategoryList = new Array();
                /*
                this.orgMediaCategoryList.forEach((obj, idx) =>{
                    this.mediaCategoryList.push(obj);
                });
                */
                this.mediaCategoryList = this.orgMediaCategoryList;
                this.mediaCategoryList.push();  //변경 감지를 위해
                this.categoryEdit = false;
            }
            ,clickCheckedMedia(mediaId, paperIdx, all){
                if (this.mediaInfo[mediaId].checked && this.checkedMedia.indexOf(mediaId) === -1) {
                    this.checkedMedia.push(mediaId);
                } else {
                    this.checkedMedia.splice(this.checkedMedia.indexOf(mediaId), 1);
                }
                if (all) { // 상위 카테고리별(ex-전문지, 지방지...)로 일괄 선택
                    if(!this.mediaList.slice( 
                        this.paperCategoryList[paperIdx].start, 
                        this.paperCategoryList[paperIdx].end
                    ).every(el => this.mediaInfo[el.mediaId].checked) ) {
                        document.getElementById('group_checkbox'+paperIdx).checked = false;
                    } else {
                        document.getElementById('group_checkbox'+paperIdx).checked = true;
                    }
                }
            }
            ,async mediaMove(){
                var obj = {};
                obj['mediaCategory'] = this.moveCategory;
                obj['mediaIds'] = this.checkedMedia.join();
                var formData = new FormData;
                formData.append('params', JSON.stringify(obj));
                formData.append('updateCode', 'mediaMove');
                if (await this.updateMediaCategorySelectionAPI(formData)) {
                    await this.getPageData();
                    this.checkedMedia.forEach(m => {
                        this.$set(this.mediaInfo[m], 'checked', false);
                    });
                    this.checkedMedia = [];
                } else {
                    this.$eventBus.$emit('kickOut');
                }
                document.querySelectorAll('.reset_group').forEach(el => {
                    el.checked = false;
                });
            }
            ,async selectCategoryAll(arg){
                this.selectedCategoryList = (arg) ? this.mediaCategoryList.map((v, k) => { return String(k) }) : []
                await this.getPageData();
            }
            ,async selectCategory(category){
                if (this.selectedCategoryList.length === this.mediaCategoryList.length && this.selectedCategoryList.length > 0) {
                    this.$nextTick(() => {
                        this.selectedCategoryAll = true;
                    });
                } else {
                    this.selectedCategoryAll = false;
                }
                await this.getPageData();
            }
        }
    };
</script>
<style scoped>
    .dn {display: none}
	.policyArea {overflow: hidden}
	.media_category.left {width:20%}
	.media_value.right {width:calc(80% - 24px)}
	.media_category .set_list_td > label {width:100%}
	.media_category .md {
		position:static!important;
	}
	.media_category .md.col1-1 {
		width:40px!important;
		padding-right:10px!important;
		text-align:center!important;
	}
	.media_category .md.col1-2 {
		/*width:calc(100% - 125px)!important;*/
		border-left:0!important;
		line-height:1.5!important;
	}
	.media_category .md.col1-3 {
		width:98px!important;
	}
	.media_category .md.col1-4 {
		width:68px!important;
		border-right:0!important;
		text-align:right!important;
		line-height:1.5;
	}
	.media_category .md.col1-5 {
		width:182px!important; /*205px!important;*/
	}
  .media_category .md.col1-6 {
    text-align:right!important;
    width:36px!important;
  }
	.media_category ul li:last-child .md.col1-2 {
		width:calc(100% - 40px) !important;
	}
	.media_value .md.col1-1 {width:80px!important;padding-right:10px!important;position:static!important;text-align:center!important}
	.media_value .md.col1-2 {
		text-align:left!important;width:calc(100% - 245px)!important;border-left:0!important;border-right:0!important;position:static!important;right:0;white-space:nowrap;
	}
	.media_value .md.col1-3 {width:165px!important;border-right:0!important;position:static!important;right:0;
		text-align:right !important;
		padding-right:55px !important;
	}
	hr {clear:both;position:relative;top:-1px}
	.media_value .set_list_tb > div {margin-top:-1px}
	.media_value .set_list_th {border-top: 1px #ccc solid;}
	.media_value .set_list_th .md.col1-2 {font-weight:bold}
	.media_value .set_list_td .md.col1-1 {padding-left:48px!important}
	.media_value .set_list_td {
		position:static!important;
		overflow:hidden;
		width:33.3%!important;
		border-top: 1px #ccc solid!important;
		border-bottom: 0 !important;
	}
	.media_value ul li:nth-child(0n+1) {
		border-top: 0!important;
	}
	.media_value ul li:nth-child(0n+2) {
		border-top: 0!important;
	}
	.media_value ul li:nth-child(0n+3) {
		border-top: 0!important;
	}
	.margin-top-minus {
		margin-top: -1px !important;
	}
	#inputKeyword {
		margin-bottom: 16px;
		width: 100px;
	}
	.set_list_tb > div {overflow:hidden;margin-bottom:4px}
	.set_cont > div {overflow:hidden;}
	.set_cont > div > dl {border-bottom:0;}
	input.unchecked {
		background-color: rgba(192,0,0,0.1);
		border: 1px solid red !important;
	}
	.set_cont_head a.btn_move {
	    padding: 0 8px;
        font-size: 12px;
        float: left;
        margin-left: 4px;
        background: #477acc!important;
        border: 1px #4268a6 solid!important;
        color: #fff!important;
        height: 24px;
        line-height: 20px;
    }
    .categoryChangeComment {
        margin-top: 16px;
        float: left;
        width: 100%;
    }
    .selectedCategoryActive{
        background-color: cornflowerblue;
        font-weight: 600;
        color: white;
    }
    .cursorPointer{cursor: pointer;}
    .loading { width: 100%;height: 100%;top: 0px;left: 0px;position: fixed;display: block;opacity: 0.7;background-color: #fff;z-index: 99;text-align: center;vertical-align: middle;}
    .loading-image {position: absolute;top: 50%;left: 50%;z-index: 100;}
    .loading-message {position: relative;margin: 0 auto;z-index: 101;}
</style>
