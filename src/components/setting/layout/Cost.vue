<template>
	<div class="set_auto_box box4">
		<div class="set_title">
			<h2>단가 설정</h2>
			<p>* 단가에 평가 항목을 곱하여 기사 가치를 산출합니다. </p>
			<div class="set_tit_btn">
				<a @click="apply()" class="btn_na">저장</a>
			</div>
		</div>
		<!-- s: set_cont -->
		<div class="set_cont">
			<!-- s: set_report_val -->
			<dl class="set_report_val">
				<dt>광고 단가</dt>
				<dd><input type="number" v-model="cost_data['cost']" style="text-align:right;"/>
				</dd>
			</dl><span>(단위 : 천원)</span>
			<!-- e: set_report_val -->
		</div>
		<!-- e: set_cont -->
	</div>
</template>

<script>
	import {mapActions} from 'vuex'
	export default {
		name : 'cost',
		data() {
			return {
				cost_data : { 'cost' : 1 , 'category_id' : 0 },
			}
		},
		async mounted(){
			const cost = await this.getUnitCostAPI();
			this.cost_data['cost'] = cost.unit_cost;
			this.cost_data['category_id'] = cost.category_id;
		},
		methods: {
			...mapActions(['getUnitCostAPI']),
			async apply() {
				let params = new FormData();
				params.append('q', JSON.stringify(this.cost_data));
				const data = await this.getUnitCostAPI(params);
				this.cost_data['cost'] = data.unit_cost;
				this.cost_data['category_id'] = data.category_id;
				if(data.success !== false) window.alert('광고 단가가 저장되었습니다.');

			}
		}
	}

</script>