<template>
	<div class="set_box_area">
		<div class="set_auto_box box5">
			<div class="set_title">
				<h2>평가 화면 설정</h2><p>* 평가 시 기사 항목 선택 방식을 설정할 수 있습니다.</p>
				<div class="set_tit_btn">
					<a @click="apply()" class="btn_na">저장</a>
				</div>
			</div>
			<!-- s: set_cont -->
			<div class="set_cont">
				<!-- s: set_list_radio -->
				<div class="set_list_radio">
					<ul>
						<li><input type="radio" id="radio1" name="radio" v-model="layout" value="0"><label for="radio1"><span></span>
							<h2>콤보박스</h2><p>직접 선택하거나 입력하여 항목을 선택할 수 있습니다.</p><img src="@/assets/images/radio1.png" alt="콤보박스예시" />
						</label></li>
						<li><input type="radio" id="radio2" name="radio" v-model="layout" value="1"><label for="radio2"><span></span>
							<h2>라디오 버튼</h2><p>평가 항목을 한 눈에 보고 라디오 버튼으로 선택합니다.</p><img src="@/assets/images/radio2.png" alt="라디오버튼 예시" />
						</label></li>
					</ul>
				</div>
				<!-- e: set_list_radio -->
			</div>
			<!-- e: set_cont -->
		</div>
		<div class="set_auto_box box5">
			<div class="set_title">
				<h2>목록 화면 설정</h2><p>* 일일 기사 목록의 분류 구분 표시 여부를 설정할 수 있습니다.</p>
				<div class="set_tit_btn">
					<a @click="applyCategory()" class="btn_na">저장</a>
				</div>
			</div>
			<div class="set_cont">
				<div class="set_list_radio">
					<ul>
						<li><input type="radio" id="radio-category-1" v-model="category" value="1"><label for="radio-category-1"><span></span>
							<h2>분류사용</h2><p>분류로 나뉘어 나옵니다</p><img src="@/assets/images/radio_category_1.png" alt="분류사용 예시" />
						</label></li>
						<li><input type="radio" id="radio-category-0" v-model="category" value="0"><label for="radio-category-0"><span></span>
							<h2>분류미사용</h2><p>분류로 나뉘어 나오지 않습니다</p><img src="@/assets/images/radio_category_0.png" alt="분류미사용 예시" />
						</label></li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import {mapActions} from 'vuex'
	export default {
		name : 'layout',
		data() {
			return {
				layout : null,
				category : null
			}
		},
		async mounted(){
			const display = await this.getLayoutSettingAPI();
			if (display) {
				this.layout = display.layout;
				this.category = display.category;
			} else {
				this.$eventBus.$emit('kickOut');
			}
		},
		methods: {
			...mapActions(['getLayoutSettingAPI']),
			async apply() {
				let params = new FormData();
				params.append('q', this.layout);
				const data = await this.getLayoutSettingAPI(params);
				if (data) {
					this.layout = data.layout;
					window.alert('평가 화면 설정이 저장되었습니다.');
					this.$eventBus.$emit('layoutChangeToEval');
				} else {
					this.$eventBus.$emit('kickOut');
				}
			},
			async applyCategory() {
				let params = new FormData();
				params.set('qc', this.category);
				const data = await this.getLayoutSettingAPI(params);
				if (data) {
					this.category = data.category;
					window.alert('목록 화면 설정이 저장되었습니다.');
				} else {
					this.$eventBus.$emit('kickOut');
				}
			}
		}
	}
</script>
<style scope>
  .box5 { width: 100%; }
</style>
