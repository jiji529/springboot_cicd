<template>
  <div>
    <div class="cont_wrap">
      <EvaluationItemEval1 :class="{conceal : !evalManualList[0].value}"></EvaluationItemEval1>
      <EvaluationItemEval2 :class="{conceal : !evalManualList[1].value}"></EvaluationItemEval2>
    </div>
    <ul class="pre_group_set">
      <li>수동 평가 항목 사용</li>
      <template v-for="(item,key) in evalManualList">
        <li>
          <input type="checkbox" :id="'plc'+key" v-model.lazy="item.value" @change="applyPolicy(true)" />
          <label :for="'plc'+key" title="평가 항목 사용 여부 지정">
            <span></span>{{item.alias}}평가{{key+1}}
          </label>
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
  import EvaluationItemEval1 from './item/Eval1';
  import EvaluationItemEval2 from './item/Eval2';
  import {mapActions} from 'vuex';
  export default {
    name: 'EvaluationItem',
    components: {EvaluationItemEval2, EvaluationItemEval1},
    data() {
      return {
        evalManualList: [{'value':false},{'value':false}]
      }
    },
    async mounted() {
      await this.onSetting();
      await this.applyPolicy(false);
    },
    methods: {
      ...mapActions(['getMediaPolicyAPI']),
      async onSetting() {
        await this.applyPolicy(false);
      },
      async applyPolicy(arg) {
        const params = new FormData();
        params.append('m', 'e');
        if (arg) {
          let tmp = [];
          this.evalManualList.forEach(function(e) {
            tmp.push({
              'sKey': e.sKey,
              'value': e.value
            });
          });
          params.append('q', JSON.stringify(tmp));
        }
        const result = await this.getMediaPolicyAPI(params);
        if (result && result.success) {
          this.evalManualList = result.final;
        } else {
          this.$eventBus.$emit('kickOut');
        }
        document.querySelector('.cont_wrap').style.top = '35px';
      }
    }
  };
</script>

<style scoped>
</style>
