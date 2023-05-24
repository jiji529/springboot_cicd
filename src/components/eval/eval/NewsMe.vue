<template>
	<div id="news_me_wrap">
		<ul class="pre_group">
			<li v-for="g in newsGroup" :key="g.lvalue">
				<input type="checkbox" :value="Number(g.lvalue)" :id="g.lvalue" v-model="selNewsMe" @change="selGroupChange">
				<label :for="g.lvalue"><span></span> {{g.sname}} </label>
			</li>
		</ul>
	</div>
</template>
<script>
	import {mapState, mapActions} from 'vuex'
	export default {
		data() {
			return {
				selNewsMe: [0],
			}
		},
		computed: mapState(['newsGroup', 'searchFormSeen']),
		async mounted(){
			await this.newsGroupAPI();
			let tmp = [];
			for (let [k,v] of Object.entries(this.newsGroup)) {
				tmp.push(Number(v.lvalue));
			}
			this.selNewsMe = tmp;
			this.selGroupChange();
		},
		methods: {
			...mapActions(['newsGroupAPI']),
			async selGroupChange() {
				if (await this.$store.dispatch('loginCheckGentleAPI')) {
					this.$eventBus.$emit('sendNewsMeToEvalHeader', this.selNewsMe);
					this.$eventBus.$emit('sendNewsMeToArtList', this.selNewsMe);
				} else {
					this.$eventBus.$emit('kickOut');
				}
			}
		}
	}
</script>
