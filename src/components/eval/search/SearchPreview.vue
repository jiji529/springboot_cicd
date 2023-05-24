<template>
	<div class="preview_wrap" id="searchPreviewWrap">
		<div class="cont_tit">
			<a @click="toggleListLayout(2)" title="접기"></a>
			<span>기사 미리보기</span>
		</div>
		<a @click="preArticle" class="prev" :class="{blind : !listLayout2}">이전</a>
		<a @click="nextArticle" class="next" :class="{blind : !listLayout2}">다음</a>
		<div class="preview " ref="preview" id="previewDivSearch"
		     :class="{scrollY : isFullWidthActive || isZoomActive,
             scrollX : isFullHeightActive || isZoomActive, blind : !listLayout2}" v-if="isPaperOrOnline === 'paper'"  @wheel.prevent="onWheel($event)">
			<div class="highLight" v-if="isPaperOrOnline === 'paper'">
				<img ref="previewImage"
				     :src="filePath"
				     :style="{width: imgWidth , height: imgHeight}"
				     alt="기사미리보기"
				     :class="imageClassBinding"
				     class="paperImg"
				     id="searchPreviewImg"
				     @load="afterImgLoad"
				     v-if="isPaperOrOnline === 'paper' "
				     @error="isShowImage = false"
				     @mousedown="startDrag"
				     @mousemove="moveDrag"
				     @mouseup="stopDrag"/>
			</div>
			<div class="minimap" style="display:block;" v-show="isMiniMapShow" :class="{blind : !listLayout2}">
				<img ref="miniMapImage"
				     :src="miniMapPath"
				     alt="미니맵"
				     @load="getMiniMapLine"
				     @error="isMinimapActive = false"
				     width="120px" height="170px"/>
			</div>
				<div class="redBoxing" v-show="isMiniMapShow"
				:style="{width : miniMapWidth , height: miniMapHeight, bottom : miniMapBottom, right: miniMapRight}" :class="{blind : !listLayout2}">
			</div>
		</div>
		<div v-if="isPaperOrOnline === 'ht5' && isShowImage === true" class="htmlArticle" :class="{blind : !listLayout2}">
			<div v-html="htmlContents"></div>
		</div>
		<div v-if="isPaperOrOnline === 'aef' && isShowImage === true" class="aefArticle" :class="{blind : !listLayout2}">
			<h1><img ref="logoImage" class="aefMediaLogo" :src="aefMediaLogo" @error="isLogoImage = false"  v-if="isLogoImage" alt="logo"/></h1>
			<h1 v-if="!isLogoImage"><span style="float:left; font-size: 16px; font-weight: bold" >{{aefMediaLogoString}}</span></h1>
			<h1 style="text-align:right"><span style="color:#000000;background-color:transparent;font-family:나눔고딕;font-size:10pt;font-weight:normal;font-style:normal;">{{newsTime}}</span></h1>
			<h1><span style="width:34px;"> &nbsp;</span></h1>
			<h2 class="aefTitle" v-html="aefTitle"> </h2><br>
			<h1><span style="width:30px;"> &nbsp;</span></h1>
			<img class="aefArticleImage"
			     :src="aefImage"/><br>
			<h1><span style="width:30px;"> &nbsp;</span></h1>
			<div style="text-align: left;width: 100%;" v-html="contents" ></div>
		</div>
		<div class="cont_btn" :class="{blind : !listLayout2}">
			<ul class="btn_left">
				<li><a @click="print">인쇄</a></li>
				<li style="display:none;" ><a @click="copyImage">복사</a></li>
				<li v-show="isPaperOrOnline === 'paper' "><a @click="saveImage">이미지저장</a></li>
			</ul>
			<ul class="btn_right">
				<li :class="{btn_dg : isZoomInButtonActive}" v-show="isPaperOrOnline === 'paper' "><a @click="zoomIn">확대</a></li>
				<li :class="{btn_dg : isZoomOutButtonActive}" v-show="isPaperOrOnline === 'paper' " ><a @click="zoomOut">축소</a></li>
				<li :class="{btn_dg : isFullWidthActive}" v-show="isPaperOrOnline === 'paper' "><a @click="fullWidth">가로폭</a></li>
				<li :class="{btn_dg : isFullHeightActive}" v-show="isPaperOrOnline === 'paper' "><a @click="fullHeight" >세로폭</a></li>
				<li :class="{btn_dg : isMiniMapShow}" v-show="isPaperOrOnline === 'paper' "><a @click="miniMap">미니맵</a></li><!-- 켜지면 btn_dg / 꺼지면 클래스 없음-->
			</ul>
		</div>
	</div>
</template>
<script>
	import store from '../../../store'
	import {mapState,mapGetters,mapActions} from 'vuex'
	export default {
		data() {
			return{
				//확대,축소,가로폭,세로폭
				imgHeightMax : '0',
				imgWidthMax : '0',
				imgHeightMin : '0',
				imgWidthMin : '0',
				imgHeight : '0',
				imgWidth : '0',
				naturalHeight:'',
				naturalWidth: '',
				clientHeight: '',
				clientWidth: '',
				frameHeight: '',
				frameWidth: '',
				filePath : '',

				//미니맵
				miniMapPath: '',
				coordinateInfo : '',
				miniMapWidth: '',
				miniMapHeight: '',
				miniMapBottom : '',
				miniMapRight: '',

				//가로폭
				isFullWidthActive: false,
				//세로폭
				isFullHeightActive: false,
				//미니맵
				isMinimapActive: false,
				//축소
				isZoomInButtonActive: false,
				//확대
				isZoomOutButtonActive: false,
				//하나라도 크기변경 있었는지
				isZoomActive: false,
				//확대or축소 전 크기
				firstSizeCheck : false,
				//이미지
				isShowImage : true,
				//이미지 드래그
				isDraggable : false,
				pre_x : '',
				pre_y : '',
				last_x : '',
				last_y : '',
				//지면기사
				highLight: '',
				//ht5 기사
				htmlAddress : '',
				htmlContents: '',
				//aef 기사
				newsTime: '',
				contents : '',
				aefTitle : '',
				aefImage : '',
				aefMediaLogo: '',
				aefMediaLogoString: '',
				isLogoImage : true,
				downName: '',

				notAutoCateSeq : [],
			}
		},
		computed: {
			...mapState(['searchSelectedArticle', 'articleList','showDoEvalMulti', 'multiEvalArticleList', 'newsIdList','multiNewsIdList', 'pid','hideAndShowArticleListSearch', 'listLayout0', 'listLayout1', 'listLayout2']),
			...mapGetters(['getDomain']),
			imageClassBinding : function() {
				return {
					maxHeight : !this.isFullWidthActive || !this.isZoomActive,
					nonMaxHeight : this.isFullWidthActive || this.isZoomActive,
					maxWidth : !this.isFullHeightActive || !this.isZoomActive,
					nonMaxWidth : this.isFullHeightActive || this.isZoomActive,
					cursorActive : this.isZoomActive || this.isFullHeightActive || this.isFullWidthActive,
				}
			},
			isMiniMapShow () {
				return this.isMinimapActive &&  this.isPaperOrOnline === 'paper'
			},
			isPaperOrOnline() {
				if(this.searchSelectedArticle === undefined || this.searchSelectedArticle === '') {
					return 'no'
				} else if(Object.keys(this.searchSelectedArticle).length > 10){
					if(this.searchSelectedArticle.part_name === '') {
						return 'paper'
					} else if(this.searchSelectedArticle.part_name === 'ht5'){
						return 'ht5'
					} else if(this.searchSelectedArticle.part_name === 'aef'){
						return 'aef'
					}
				}
			},
		},
		watch : {
			searchSelectedArticle: function () {
				if (this.searchSelectedArticle.constructor.name === 'Object') {
					this.articleChange()
				}
			},
			hideAndShowArticleListSearch() {
				this.firstSizeCheck = false;
			}
		},
		async mounted() {
			await this.articleChange();
		},
		methods: {
			...mapActions([
				'toggleListLayout'
			]),
			/*previewFocus() {
					this.$eventBus.$emit('removeSearchDoEvalKeyup');
			},
			previewBlur() {
					this.$eventBus.$emit('addSearchDoEvalKeyup');
			},*/
			onWheel(e) {
				if(e.deltaY > 0) {
					this.zoomOut();
				} else if (e.deltaY < 0) {
					this.zoomIn();
				}
			},
			async articleChange(){
				let highLightDiv = document.querySelector('.highLight');
				if(highLightDiv !== null ) {
					while (document.querySelector('.highLightKeyword') !== null) {
						highLightDiv.removeChild(document.querySelector('.highLightKeyword'));
					}
				}
				this.setZero();
				this.filePath = '';
				this.miniMapPath = '';

				this.isFullHeightActive = false;
				this.isFullWidthActive = false;
				this.isZoomInButtonActive = false;
				this.isZoomOutButtonActive = false;
				this.isZoomActive= false;
				this.firstSizeCheck= false;
				this.isShowImage = true;
				this.isMinimapActive = false;
				const article = this.searchSelectedArticle;

				if (this.isPaperOrOnline === 'no') {
					this.isShowImage = false;
				} else if (this.isPaperOrOnline === 'paper') {
					if (article.news_file_name !== '') {
						//기사 및 미니맵 이미지 경로
						this.coordinateInfo = article.coordinate;
						let pathdomain = '';
						if(this.getDomain === false) {
							pathdomain = 'https://premium.scrapmaster.co.kr/server/';
						} else {
							pathdomain = 'https://' + this.pid + '.scrapmaster.co.kr/server/';
						}
						if (article.news_file_name.match(pathdomain)) {
							this.filePath = article.news_file_name;
						} else {
							this.filePath = pathdomain + article.news_file_name;
						}
						let miniMap = article.article_serial;
						let miniMapPath = miniMap.substr(0, miniMap.length - 3);
						this.miniMapPath = store.state.domainOrigin + '/paperDown.php?filepath=' + miniMapPath + '&userid=' + this.pid;
						// if (article.article_date !== null) {
						// 	let leg = article.article_date.length;
						// 	article.article_date = article.article_date.substr(0, leg - 3);
						// }
						this.highLight = article.highLight;
						this.isMinimapActive = true;
					}
				} else if (this.isPaperOrOnline === 'ht5') {
					let year = article.article_date.substr(0, 4) + '/';
					let month = article.article_date.substr(5, 2) + '/';
					let day = article.article_date.substr(8, 2) + '/';
					let pid = this.pid + '/';
					let htmlAddress = '';
					if(article.news_file_name !== '') {
						htmlAddress = 'https://premium.scrapmaster.co.kr/server/' + article.news_file_name + '.html';
					} else {
						htmlAddress = 'https://premium.scrapmaster.co.kr/server/article/' + pid + year + month + day + article.guid + '.html';
					}
					this.htmlAddress = htmlAddress;
					let ssdo = store.state.domainOrigin;
					let param = new FormData;
					param.append('nid', article.news_id);
					param.append('pid', this.pid);
					await this.$axios.post(ssdo + '/getHtmlArticle.php',param)
						.then((res) => {
							let data = res.data;
							if (data.success === false) {
								this.$eventBus.$emit('kickOut');
							} else {
								this.htmlContents = data;
							}
						}).catch(e => console.error(e));
				} else if (this.isPaperOrOnline === 'aef') {
					let year = article.scrap_date.substr(0, 4) + '/';
					let month = article.scrap_date.substr(5, 2) + '/';
					let day = article.scrap_date.substr(8, 2) + '/';
					let pid = this.pid ;
					let aefAddress = 'https://premium.scrapmaster.co.kr/server/article/' + pid + '/' + year + month + day + article.article_serial + '.aef';
					let aefTitle = article.article_title;
					let highLightWord = [];
					let ssdo = store.state.domainOrigin;
					let param = new FormData;
					param.append('url', aefAddress);
					await this.$axios.post(ssdo + '/getAefImage.php',param)
						.then(res => {
							let data = res.data;
							if (data.succes === false) {
								this.$eventBus.$emit('kickOut');
							} else {
								this.aefImage = data;
							}
						}).catch(e => console.error(e));
					this.aefMediaLogo = store.state.domainOrigin + '/news_logo.php?q=' +article.media_name+'&u=' +pid;
					this.aefMediaLogoString = article.media_name;
					if(article.article_contents !== ',') {
						this.contents = article.article_contents.replace(/\$n/gi, "<br>");
						this.contents = this.contents.replace(/\$r/gi, "");
					} else {
						this.contents = '';
					}
					if(article.highLightWord !== null && article.highLightWord !== '')  {
						highLightWord = article.highLightWord.split(' ');
						for(const word in highLightWord) {
							aefTitle = this.replaceAll(aefTitle, highLightWord[word], '<span style="background-color: rgba(255,0,0,0.3)">'+highLightWord[word]+'</span>');
							this.contents = this.replaceAll(this.contents, highLightWord[word], '<span style="background-color: rgba(255,0,0,0.3)">'+highLightWord[word]+'</span>');
						}
					}
					this.aefTitle = aefTitle;
					this.newsTime = article.scrap_date;
					this.isLogoImage = true;
				}
			},
			replaceAll(str,searchStr, replaceStr){
				return str.split(searchStr).join(replaceStr);
			},
			async preArticle() {
				this.$eventBus.$emit("toSearchDoEval" , "pre");
			},
			async nextArticle() {
				this.$eventBus.$emit("toSearchDoEval" , "next");
			},
			setZero() {
				if(this.isPaperOrOnline === 'paper') {
					this.naturalHeight = '';
					this.naturalWidth = '';
					this.imgHeightMax = '';
					this.imgWidthMax = '';
					this.imgHeightMin = '';
					this.imgWidthMin = '';
					this.imgHeight = '';
					this.imgWidth = '';
					this.clientHeight = '';
					this.clientWidth = '' ;
					this.frameHeight = '';
					this.frameWidth = '';
					this.isFullWidthActive = false;
				}
			},
			getSizeCheck () {
				if(this.firstSizeCheck !== true) {
					this.setSize();
					this.firstSizeCheck = true
				}
			},
			setSize(){
				if(this.isPaperOrOnline === 'paper') {
					this.naturalHeight = this.$refs.previewImage.naturalHeight;
					this.naturalWidth = this.$refs.previewImage.naturalWidth;
					if(this.$refs.previewImage.naturalHeight !== 0) {
						this.imgHeight = this.$refs.previewImage.naturalHeight;
						this.imgHeightMax = this.imgHeight * 1.8;
						this.imgHeightMin = this.imgHeight * 0.15;
					}
					if(this.$refs.previewImage.naturalWidth !== 0) {
						this.imgWidth = this.$refs.previewImage.naturalWidth;
						this.imgWidthMax = this.imgWidth * 1.8;
						this.imgWidthMin = this.imgWidth * 0.15;
					}
					this.clientHeight = this.$refs.previewImage.clientHeight;
					this.clientWidth = this.$refs.previewImage.clientWidth;

					this.frameHeight = this.$refs.preview.clientHeight - 54; // pading: 20px, scrollbar: 17 px 인데 17px 한번더 뺀값
					this.frameWidth = this.$refs.preview.clientWidth - 22; //padding : 20px , scrollbar : 17px
				}
			},
			zoomIn(){
				if(this.isPaperOrOnline === 'paper') {
					document.querySelector('#previewDivSearch').focus();
					this.isZoomInButtonActive = true;
					this.isZoomOutButtonActive = false;
					if (this.isFullWidthActive || this.isFullHeightActive || this.isZoomActive) {
						let widIndex = this.imgWidth.indexOf('p');
						let heiIndex = this.imgHeight.indexOf('p');
						let wid = this.imgWidth.substr(0, widIndex);
						let hei = this.imgHeight.substr(0, heiIndex);
						let expandWidth = Math.round(wid * 1.2);
						let expandHeight = Math.round(hei * 1.2);
						if (expandWidth < this.imgWidthMax && expandHeight < this.imgHeightMax) {
							this.imgHeight = expandHeight + 'px';
							this.imgWidth = expandWidth + 'px';
							this.highLightCheck(expandWidth, expandHeight);
						}
					} else {
						this.getSizeCheck();
						let expandWidth = Math.round(this.clientWidth * 1.2);
						let expandHeight = Math.round(this.clientHeight * 1.2);
						if (expandWidth < this.imgWidthMax && expandHeight < this.imgHeightMax) {
							this.imgHeight = expandHeight + 'px';
							this.imgWidth = expandWidth + 'px';
							this.highLightCheck(expandWidth, expandHeight);
						}
					}
					this.isZoomActive = true;
					this.isFullHeightActive = false;
					this.isFullWidthActive = false;
				}
			},
			zoomOut(){
				if(this.isPaperOrOnline === 'paper') {
					document.querySelector('#previewDivSearch').focus();
					this.isZoomOutButtonActive = true;
					this.isZoomInButtonActive = false;
					if (this.isFullWidthActive || this.isFullHeightActive || this.isZoomActive ) {
						let widIndex = this.imgWidth.indexOf('p');
						let heiIndex = this.imgHeight.indexOf('p');
						let wid = this.imgWidth.substr(0, widIndex);
						let hei = this.imgHeight.substr(0, heiIndex);
						let downWidth = Math.round(wid * 0.8);
						let downHeight = Math.round(hei * 0.8);
						if (downWidth > this.imgWidthMin && downHeight > this.imgHeightMin) {
							this.imgHeight = downHeight + 'px';
							this.imgWidth = downWidth + 'px';
							this.highLightCheck(downWidth, downHeight);
						}
					} else {
						this.getSizeCheck();
						let downWidth = Math.round(this.clientWidth * 0.8);
						let downHeight = Math.round(this.clientHeight * 0.8);
						if (downWidth > this.imgWidthMin && downHeight > this.imgHeightMin) {
							this.imgHeight = downHeight + 'px';
							this.imgWidth = downWidth + 'px';
							this.highLightCheck(downWidth, downHeight);
						}
					}
					this.isZoomActive = true;
					this.isFullHeightActive = false;
					this.isFullWidthActive = false;
				}
			},
			fullHeight(){
				if(this.isPaperOrOnline === 'paper') {
					document.querySelector('#previewDivSearch').focus();
					this.isFullHeightActive = !this.isFullHeightActive;
					this.isFullWidthActive = false;
					this.isZoomActive = false;
					if (this.isFullHeightActive) {
						this.getSizeCheck();
						this.isZoomInButtonActive = false;
						this.isZoomOutButtonActive = false;
						this.imgHeight = this.frameHeight + 'px';
						let ratioWidth = Math.round(this.frameHeight * this.naturalWidth / this.naturalHeight);

						this.imgWidth = ratioWidth + 'px';
						this.highLightCheck(ratioWidth, this.frameHeight);
					} else {
						this.imgWidth = this.clientWidth + 'px';
						this.imgHeight = this.clientHeight + 'px';
						this.highLightCheck(this.clientWidth, this.clientHeight);
					}
				}
			},
			fullWidth(){
				if(this.isPaperOrOnline === 'paper') {
					document.querySelector('#previewDivSearch').focus();
					this.isFullWidthActive = !this.isFullWidthActive;
					this.isFullHeightActive = false;
					this.isZoomActive = false;
					if (this.isFullWidthActive) {
						this.getSizeCheck();
						this.isZoomInButtonActive = false;
						this.isZoomOutButtonActive = false;
						this.imgWidth = this.frameWidth;
						let ratioHeight = Math.round(this.frameWidth * this.naturalHeight / this.naturalWidth);
						if(ratioHeight > this.frameHeight) {
							this.imgWidth = this.imgWidth - 17;
						}
						this.highLightCheck(this.imgWidth, ratioHeight);
						this.imgWidth = this.clientWidth + 'px';
						this.imgHeight = ratioHeight + 'px';
					} else {
						this.imgWidth = this.clientWidth + 'px';
						this.imgHeight = this.clientHeight + 'px';
						this.highLightCheck(this.clientWidth, this.clientHeight);
					}
				}
			},
			miniMap() {
				if(this.isPaperOrOnline === 'paper') {
					this.isMinimapActive = !this.isMinimapActive;
				}
			},
			afterImgLoad() {
				this.getMiniMapLine();
				this.getSizeCheck();
				this.highLightCheck(this.clientWidth, this.clientHeight);
			},
			getMiniMapLine() {
				if(Object.keys(this.searchSelectedArticle).length>3 ) {
					if(this.isPaperOrOnline === 'paper') {
						this.coordinateInfo = this.searchSelectedArticle.coordinate;
						if (this.coordinateInfo === this.searchSelectedArticle.coordinate) {
							let commaIndex = '';
							let pipeIndex = '';
							commaIndex = Number(this.coordinateInfo.indexOf(","));
							pipeIndex = Number(this.coordinateInfo.indexOf("|"));

							let xyArray = [];
							xyArray = this.coordinateInfo.split("|");
							if(commaIndex > pipeIndex) {
								xyArray.shift();
							}

							let one = [];
							let xArray = [];
							let yArray = [];
							for (var key in xyArray) {
								if (key !== xyArray.length - 1) {
									one = xyArray[key].split(",");
									if(one[0] !== undefined && one[0] !== '') {
										xArray.push(one[0]);
									}
									if(one[1] !== undefined && one[1] !== '') {
										yArray.push(one[1]);
									}
								}
							}
							let maxX = Math.max.apply(null, xArray);
							let minX = Math.min.apply(null, xArray);
							let maxY = Math.max.apply(null, yArray);
							let minY = Math.min.apply(null, yArray);

							let minimapWidth = maxX - minX;
							let minimapHeight = maxY - minY;
							let naturalWidth = this.$refs.miniMapImage.naturalWidth;
							let naturalHeight = this.$refs.miniMapImage.naturalHeight;
							let reducedWidth = Math.round(minimapWidth * 120 / naturalWidth) ;
							let reducedHeight = Math.round(minimapHeight * 170 / naturalHeight) ;

							this.miniMapWidth = reducedWidth  + 'px';
							this.miniMapHeight = reducedHeight + 'px' ;
							let bottomPx = 170 - Math.round(maxY * 170 / naturalHeight) + 70 ;
							let rightPx = 120 - Math.round(maxX * 120 / naturalWidth) + 20 ;

							this.miniMapBottom = bottomPx + 'px' ;
							this.miniMapRight = rightPx + 'px';
						}
					}
				}

			},
			startDrag(e){
				this.isDraggable = true;
				this.pre_x = e.clientX;
				this.pre_y = e.clientY;
				e.preventDefault();
				e.target.style.cursor = 'move';
			},
			moveDrag (e){
				if(this.isDraggable){
					let moved_x = this.pre_x - e.clientX;
					let moved_y = this.pre_y - e.clientY;
					const frame = document.getElementById('previewDivSearch');
					const userAgent=navigator.userAgent.toLowerCase();
					if(userAgent.indexOf('trident') > -1 || userAgent.indexOf('edge') > -1) {
						frame.scrollLeft = frame.scrollLeft + moved_x;
						frame.scrollTop = frame.scrollTop + moved_y;
					} else {
						frame.scrollBy(moved_x,moved_y);
					}
					this.pre_x = e.clientX;
					this.pre_y = e.clientY;
				}
			},
			stopDrag(e) {
				if(this.isDraggable) {
					e.target.style.cursor = 'default';
					this.isDraggable = false;
				}
			},
			print() {
				if(this.isPaperOrOnline === 'paper') {
					let ssdo = store.state.domainOrigin;
					let print = window.open('기사인쇄','기사인쇄', 'width=800, height=600');
					print.document.open();
					print.document.write(paperPrint(ssdo + '/paperImage.php?filepath='+this.filePath));
					print.document.close();
				} else if(this.isPaperOrOnline === 'aef') {
					let aefDiv = document.querySelector('.aefArticle').innerHTML;
					aefDiv = aefDiv.replace('<h1 data-v-fa94b05a=""><span data-v-fa94b05a="" style="width: 34px;"> &nbsp;</span></h1>', '');
					aefDiv = aefDiv.replace('<h1 data-v-fa94b05a=""><span data-v-fa94b05a="" style="width: 30px;"> &nbsp;</span></h1>', '');
					aefDiv = aefDiv.replace('<h1 data-v-fa94b05a=""><span data-v-fa94b05a="" style="width: 30px;"> &nbsp;</span></h1>', '<br>');
					let print = window.open('기사인쇄','기사인쇄', 'width=800, height=600');
					/*console.log(aefAndHtPrint(aefDiv));*/
					print.document.open();
					print.document.write(aefAndHtPrint(aefDiv));
					print.document.close();

				} else if(this.isPaperOrOnline === 'ht5') {
					let aefDiv = document.querySelector('.htmlArticle');
					let print = window.open('기사인쇄','기사인쇄', 'width=800, height=600');
					print.document.open();
					print.document.write(aefAndHtPrint(aefDiv.innerHTML));
					print.document.close();
				}
				function paperPrint(source){
					return  "<!DOCTYPE html><html><head><script>function step1(){\n" +
						"setTimeout('step2()', 0);}\n" +
						"function step2(){window.print();window.close()}\n" +
						"</scri" + "pt>\n"+
						"<style>@page{size:A4; margin:10mm auto;} @media print{ html,body{width:210mm;height:295mm;} "+
						"img{display:block; padding-top:20px; margin: 0 auto; max-width:90%; max-height:90%; vertical-align:middle;}}</style>\n"+
						"</head><body onload='step1()' >\n" +
						"<div style='height:100%;' ><img src='" + source + "' /></div></body></html>";
				}
				function aefAndHtPrint(source){
					return  "<!DOCTYPE html><html><head><script>function step1(){\n" +
						"setTimeout('step2()', 0);}\n" +
						"function step2(){window.print();window.close()}\n" +
						"</scri" + "pt>\n"+
						"<style> @page {size:210mm 297mm; margin:15mm 0 ;}  @media print{ body{margin:0;padding:0;} "+
						".aefArticle{\n" +
						"        margin:0 auto;\n" +
						"        position: relative;\n" +
						"        display: block;\n" +
						"        background-color: white;\n" +
						"        max-width: 700px;\n" +
						"    }\n" +
						"    .aefMediaLogo{\n" +
						"        height: 25px;\n" +
						"        float:left;\n" +
						"        display: block;\n" +
						"    }\n" +
						"    .aefArticleImage{\n" +
						"        cursor: pointer;\n" +
						"        height: 250px;\n" +
						"    }\n" +
						"    .aefArticleContents {\n" +
						"       font-size:12px;\n"+
						"    }\n"+
						"}</style>\n"+
						"</head><body onload='step1()' >\n" +
						"<div class='aefArticle'>"+source + "</div></body></html>";
				}
			},
			copyImage() {
			},
			saveImage(){
				if(this.isPaperOrOnline === 'paper') {
					const aTag = document.createElement('a');
					const sel = this.searchSelectedArticle;
					aTag.href= store.state.domainOrigin + '/saveImage.php?filepath='+this.filePath+'&title='+sel.news_title+'&media='+sel.media_name+'&date='+sel.news_date;
					aTag.setAttribute('download', 'paperImage');
					document.body.appendChild(aTag);
					aTag.click();
					aTag.parentNode.removeChild(aTag);
				}
			},
			highLightCheck(clientW, clientH){
				if(this.isPaperOrOnline === 'paper' && this.searchSelectedArticle.highLight !== '') {
					const highLight = this.highLight;
					if(highLight !== '') {
						const wordSplit = highLight.split(':');
						let coordinateSplit = [];
						wordSplit.pop();
						for (const word in wordSplit) {
							coordinateSplit[word] = wordSplit[word].split(',');
						}
						const relativeCoordinate = [];
						const colorInfo = [];
						for (const wordA in coordinateSplit) {
							if (coordinateSplit[wordA] !== null) {
								relativeCoordinate[wordA] = [];
								colorInfo[wordA] = [];
								colorInfo[wordA].push(coordinateSplit[wordA][0]);
								colorInfo[wordA].push(coordinateSplit[wordA][1]);
								relativeCoordinate[wordA].push(Math.round((coordinateSplit[wordA][2] * clientW) / this.naturalWidth));
								relativeCoordinate[wordA].push(Math.round((coordinateSplit[wordA][3] * clientH) / this.naturalHeight));
								relativeCoordinate[wordA].push(Math.round((coordinateSplit[wordA][4] * clientW) / this.naturalWidth));
								relativeCoordinate[wordA].push(Math.round((coordinateSplit[wordA][5] * clientH) / this.naturalHeight));
							}
						}
						let parent = document.querySelector('.highLight');
						while (document.querySelector('.highLightKeyword') !== null) {
							parent.removeChild(document.querySelector('.highLightKeyword'));
						}
						if (coordinateSplit[0][0] === '0') {
							return false
						}
						for (const key in relativeCoordinate) {
							let div = document.createElement('div');
							div.style.position = 'absolute';
							div.className = 'highLightKeyword';
							div.style.zIndex = '3';
							div.style.backgroundColor = 'rgba(' + colorInfo[key][0] + ',0,0,0.3)';
							div.style.left = relativeCoordinate[key][0] + 'px';
							div.style.top = relativeCoordinate[key][1] + 'px';
							div.style.width = (relativeCoordinate[key][2] - relativeCoordinate[key][0]) + 'px';
							div.style.height = (relativeCoordinate[key][3] - relativeCoordinate[key][1]) + 'px';
							parent.appendChild(div);
						}
					}
				}
			}
		}
	}
</script>

<style scoped>
	.scrollY {overflow-y : scroll;}
	.scrollX {overflow-x: scroll;}
	.maxHeight {max-height:calc(100vh - 254px);}
	.nonMaxHeight {max-height:none;}
	.maxWidth {max-width:100%;}
	.nonMaxWidth {max-width:none;}
	.minimapImg {position: relative;z-index: 70;}
	.paperImg {border: 1px solid #999;z-index: 1;}
	.redBoxing {border: 2px solid #ff2323;height: 50px;width: 50px;z-index:80;position:absolute;bottom:70px;right:20px;}
	.cursorActive {cursor: hand;}
	.htmlArticle{background-color: white;height: calc(100vh - 200px);overflow: auto;margin : 0 auto;padding:30px;}
	.htmlArticle .cs95E872D0 img {margin: 0 auto;}
	.aefArticle{margin:0 auto;padding:30px;display: inline-block;width:100%;height: calc(100vh - 200px);position: static;background-color: white;overflow: auto;text-align: center;}
	.aefMediaLogo{text-align:left;height: 26px;display: block;}
	.aefArticleImage{cursor: pointer;max-width:500px;max-height:222px;margin: 0 auto;}
	.aefTitle{font-family:'나눔고딕';font-size:18pt;font-weight:bold;font-style:normal;text-align:center;margin-top:10px;}
	.highLight{margin: 0 auto;z-index: 2;position:relative;display:inline-block;}
	.cont_tit a {
		display: block;
    float: left;
    width: 28px;
    height: 38px;
    background: url(/img/ico_pre.467a0115.png) 0 -102px no-repeat;
    text-indent: -9999px;
	}
</style>
