<template>
    <div>
        <div class="contents">
            <!--검색하기 누르면 나오는 부분 -->
            <wrap-search v-show="searchFormSeen"></wrap-search>
            <!--평가목록 및 평가하기, 미리보기 부분-->
            <wrap-eval v-show="!searchFormSeen"></wrap-eval>
        </div>
        <!--다중평가 눌렀을 때 나오는 부분-->
        <warp-multi-eval v-if="showDoEvalMulti"></warp-multi-eval>
        <!--평가 캘린더 -->
        <pop-calendar v-show="showPopCalender"></pop-calendar>
    </div>
</template>

<script>
  //import EvalHeader from '../components/eval/doEval/EvalHeader'
  import WrapEval from '../components/eval/WrapEval'
  import WrapSearch from "../components/eval/WrapSearch";
  import WarpMultiEval from '../components/eval/WarpMultiEval'
  import PopCalendar from '../components/eval/eval/PopCalendar'
  
  import {mapState} from 'vuex'
  export default {
    name: "Eval",
    components: {WrapEval,WrapSearch,WarpMultiEval,PopCalendar,},
    computed:mapState(['showDoEvalMulti', 'searchFormSeen', 'showPopCalender']),
  }
</script>
<style>
</style>
