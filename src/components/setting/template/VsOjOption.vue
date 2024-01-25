<template>
    <div class="object-field">

        <div class="object-list"> <!-- 시각객체 설정 [start] -->
            <div class="visualObj_list">
                <!-- 초기 두 개는 교차-기준을 설정한 뒤, 바로 나타날 수 있도록 한다. -->
                <!-- v-for문을 사용해서 -->
                <draggable tag="div" :list="tableOrChart" group="cross_object_list" class="test-draggable" ghost-class="drag-ghost-tag">
                <template v-for="(obj, parent_i) in tableOrChart">
                    <fieldset :class="[obj.show ? 'obj-max optionList opLst' + parent_i : 'obj-min optionList opLst' + parent_i]" :key="'opList' + parent_i">
                    <!-- 시각객체 옵션의 제목(Table, Chart, Text) -->
                    <legend class="option-title">
                        {{parent_i+1}}.{{obj.name}}
                        <img @click="copyObject($event ,obj, parent_i)" title="데이터 복사" alt="복사" src="../../../assets/images/copy.png">
                        <img v-if="obj.show" @click="setWindowSize(parent_i, false)" title="축소" alt="축소" src="../../../assets/images/reduce.png" style="margin: 0 0 0 5px;">
                        <img v-else @click="setWindowSize(parent_i, true)" title="확대" alt="확대" src="../../../assets/images/increase.png" style="margin: 0 0 0 5px;">
                        <span @click="deleteObject(parent_i)" title="삭제" alt="삭제" style="margin: 0 0 0 13px; cursor: pointer; font-size: 16px;">&#10006;</span>
                    </legend>

                    <div class="isShow" v-show="obj.show" :key="'opList child' + renderWhole">
                        <!--============================================================================== [Table Object] ==============================================================================-->
                        <dl class="sch_element cross_std" v-if="getConfigEval && getConfigEval.group && obj.name==='Table'">


                        <div class="inner tableOp" :data-index="parent_i">
                            <div class="sub_frame tableOp-row">
                            <label class="tableLabel-row-column">행</label>
                            <!-- draggable이 div 취급을 받음 -->
                            <draggable tag="div" :list="obj.rowList.crossAxes" group="cross_op" @change="changeItemNameANDCounting(obj)"
                                :disabled="dontMove[parent_i]" @start="innerDragController($event, parent_i)" @end="innerDragController" handle=".dragArea">
                                <div class="row cross-item" v-for="(row, idx) in obj.rowList.crossAxes" :key="parent_i+'t-r'+idx">
                                <div class="table-list">
                                    <select v-model="row.val" @change="changeCrossStd($event, parent_i, idx, 'row', true)" :key="parent_i+'selectItem'+reSeletItem">
                                    <option value="0">-선택-</option>
                                    <slot v-for="auto in getConfigEval.group.AT">
                                        <option v-if="auto.isUse === 'Y' || showUnusedEvalItem" :value="auto.seq" :disabled="evalDuplicateVerification(obj,(Number(auto.seq)))" :key="parent_i+'c-c-a'+auto.name">[자동]{{auto.name}}</option>
                                    </slot>
                                    <slot v-if="getConfigEval.group.M1.isUse === 'Y' || showUnusedEvalItem">
                                        <option value="10001" :disabled="evalDuplicateVerification(obj,10001,'M1')">[평가1]대분류</option>
                                        <option value="10002" :disabled="evalDuplicateVerification(obj,10002,'M1')">[평가1]중분류</option>
                                        <option value="10022" :disabled="evalDuplicateVerification(obj,10002,'M1')">[평가1]중분류(상위포함)</option>
                                        <option value="10003" :disabled="evalDuplicateVerification(obj,10003,'M1')">[평가1]소분류</option>
                                        <option value="10033" :disabled="evalDuplicateVerification(obj,10003,'M1')">[평가1]소분류(상위포함)</option>
                                    </slot>
                                    <slot v-for="ev2 in getConfigEval.group.M2">
                                        <option v-if="ev2.isEval === 'Y' || showUnusedEvalItem" :value="ev2.seq" :disabled="evalDuplicateVerification(obj,(Number(ev2.seq)))" :key="parent_i+'c-c-e2'+ev2.name">[평가2]{{ev2.name}}</option>
                                    </slot>
                                    <option value="100001" :disabled="evalDuplicateVerification(obj,100001)">[기타]기간</option>
                                    <option v-if="getConfigEval.policy.S3 && getConfigEval.policy.S3.value === 'Y'" value="100004" :disabled="evalDuplicateVerification(obj,100004)">[기타]매체분류(3.5)</option>
                                    <option value="100002" :disabled="evalDuplicateVerification(obj,100002)">[기타]매체분류</option>
                                    <option value="100003" :disabled="evalDuplicateVerification(obj,100003)">[기타]매체유형</option>
                                    <option value="111111" :disabled="evalDuplicateVerification(obj,111111)">[특수]평가별(전체)</option>
                                    <option value="100111" :disabled="evalDuplicateVerification(obj,100111)">[특수]평가별(자동)</option>
                                    <option value="100222" :disabled="evalDuplicateVerification(obj,100222)">[특수]평가별(평가1)</option>
                                    <option value="100333" :disabled="evalDuplicateVerification(obj,100333)">[특수]평가별(평가2)</option>
                                    <option value="100555" :disabled="evalDuplicateVerification(obj,100555)">[특수]매체별</option>
                                    </select>
                                    <div class="dragArea">
                                    <!-- drag image -->
                                    </div>
                                </div>
                                </div>
                            </draggable>
                            </div>

                            <div class="sub_frame tableOp-column">
                            <label class="tableLabel-row-column">열</label>
                            <!-- draggable이 div 취급을 받음 -->
                            <draggable tag="div" :list="obj.columnList.crossAxes" group="cross_op" @change="changeItemNameANDCounting(obj)"
                                :disabled="dontMove[parent_i]" @start="innerDragController($event, parent_i)" @end="innerDragController" handle=".dragArea">
                                <div class="column cross-item" v-for="(col, idx) in obj.columnList.crossAxes" :key="parent_i+'t-c'+idx"> 
                                <div class="table-list">
                                    <select v-model="col.val" @change="changeCrossStd($event, parent_i, idx, 'column', true)" :key="parent_i+'selectItem'+reSeletItem">
                                    <option value="0">-선택-</option>
                                    <slot v-for="auto in getConfigEval.group.AT">
                                        <option v-if="auto.isUse === 'Y' || showUnusedEvalItem" :value="auto.seq" :disabled="evalDuplicateVerification(obj,(Number(auto.seq)))" :key="parent_i+'c-c'+auto.name">[자동]{{auto.name}}</option>
                                    </slot>
                                    <slot v-if="getConfigEval.group.M1.isUse === 'Y' || showUnusedEvalItem">
                                        <option value="10001" :disabled="evalDuplicateVerification(obj,10001,'M1')">[평가1]대분류</option>
                                        <option value="10002" :disabled="evalDuplicateVerification(obj,10002,'M1')">[평가1]중분류</option>
                                        <option value="10022" :disabled="evalDuplicateVerification(obj,10002,'M1')">[평가1]중분류(상위포함)</option>
                                        <option value="10003" :disabled="evalDuplicateVerification(obj,10003,'M1')">[평가1]소분류</option>
                                        <option value="10033" :disabled="evalDuplicateVerification(obj,10003,'M1')">[평가1]소분류(상위포함)</option>
                                    </slot>
                                    <slot v-for="ev2 in getConfigEval.group.M2">
                                        <option v-if="ev2.isEval === 'Y' || showUnusedEvalItem" :value="ev2.seq" :disabled="evalDuplicateVerification(obj,(Number(ev2.seq)))" :key="parent_i+'c-c'+ev2.name">[평가2]{{ev2.name}}</option>
                                    </slot>
                                    <option value="100001" :disabled="evalDuplicateVerification(obj,100001)">[기타]기간</option>
                                    <option v-if="getConfigEval.policy.S3 && getConfigEval.policy.S3.value === 'Y'" value="100004" :disabled="evalDuplicateVerification(obj,100004)">[기타]매체분류(3.5)</option>
                                    <option value="100002" :disabled="evalDuplicateVerification(obj,100002)">[기타]매체분류</option>
                                    <option value="100003" :disabled="evalDuplicateVerification(obj,100003)">[기타]매체유형</option>
                                    <option value="111111" :disabled="evalDuplicateVerification(obj,111111)">[특수]평가별(전체)</option>
                                    <option value="100111" :disabled="evalDuplicateVerification(obj,100111)">[특수]평가별(자동)</option>
                                    <option value="100222" :disabled="evalDuplicateVerification(obj,100222)">[특수]평가별(평가1)</option>
                                    <option value="100333" :disabled="evalDuplicateVerification(obj,100333)">[특수]평가별(평가2)</option>
                                    <option value="100555" :disabled="evalDuplicateVerification(obj,100555)">[특수]매체별</option>
                                    </select>
                                    <div class="dragArea">
                                    <!-- drag image -->
                                    </div>
                                </div>

                                </div>
                            </draggable>
                            </div>
                        </div>

                        <aside class="sideOption">
                            <table>
                                <colgroup><col span="1"  width="25%"/></colgroup>
                                <tr>
                                    <th>교차-계산:</th>
                                    <td>
                                        <input type="radio" :id="'cross_calc_value_off'+parent_i" v-model="obj.crossCalc.isPrice" :value="false">
                                        <label :for="'cross_calc_value_off'+parent_i"><span></span>건수</label>

                                        <input type="radio" :id="'cross_calc_value_on'+parent_i" v-model="obj.crossCalc.isPrice" :value="true">
                                        <label :for="'cross_calc_value_on'+parent_i"><span></span>가치</label>
                                    </td>
                                </tr>
                                <tr class="table-op-calc" v-if="$route.name !== 'scrap'" :class="{'conceal' : obj.crossCalc.isPrice === false}">
                                    <th>금액단위:</th>
                                    <td class="chart-op-calc" v-if="$route.name !== 'scrap'" :class="{'conceal' : obj.crossCalc.isPrice === false}">
                                        <input type="radio" :id="'numberScale_0'+parent_i" v-model="obj.crossCalc.priceUnit" value="0"><label :for="'numberScale_0'+parent_i"><span></span>원</label>
                                        <input type="radio" :id="'numberScale_1'+parent_i" v-model="obj.crossCalc.priceUnit" value="1"><label :for="'numberScale_1'+parent_i"><span></span>천원</label>
                                        <input type="radio" :id="'numberScale_2'+parent_i" v-model="obj.crossCalc.priceUnit" value="2"><label :for="'numberScale_2'+parent_i"><span></span>백만원</label>
                                    </td>
                                </tr>
                                <tr>
                                    <th>평가1계층 적용:</th>
                                    <td>
                                        <input type="checkbox" :id="'offAFewItems_'+parent_i" v-model="obj.M1Active">
                                        <label :for="'offAFewItems_'+parent_i"><span></span></label>
                                    </td>
                                </tr>
                                <tr>
                                    <th>공백(.) 표시:</th>
                                    <td style="height: 45px">
                                        <!-- <input type="checkbox" :id="'onAFewItems_'+parent_i" v-model="obj.showBlank">
                                        <label :for="'onAFewItems_'+parent_i"><span></span></label> -->
                                        <!-- <br> -->
                                        <!-- <div class="cross-std" v-if="!obj.showBlank"> -->
                                            <template v-for="(item, idx) in obj.optionName">
                                            <input type="checkbox" :id="'t'+parent_i+'_'+(idx+1)" class="viewBox" :key="parent_i+'t-crossStd'+idx"
                                                value="true" v-model="item.act">
                                            <label :for="'t'+parent_i+'_'+(idx+1)" :key="parent_i+'lab'+idx" class="text-deco" v-if="item.name">{{item.name}}</label>
                                            <span :key="parent_i+'lab-spa'+idx"></span>
                                            </template>
                                        <!-- </div> -->
                                    </td>
                                </tr>
                            </table>
                        </aside>
                        </dl>

                        <!--============================================================================== [Chart Object] ==============================================================================-->
                        <dl class="sch_element cross_std exc" v-else-if="getConfigEval && getConfigEval.group && obj.name==='Chart'" :key="parent_i+'chart'+renderWhole"> 
                        <div class="cross_std_frame"  :class="[obj.chartType==='3'?'line-style':'']" >
                            <div class="inner chartOp" :data-index="parent_i">
                            <!-- 차트 타입 선택 -->
                            <div class="chart-type">
                                <span>차트형태</span>
                                <dd>
                                <div class="stat_option" :data-index="parent_i">
                                    <!-- 세로형 -->
                                    <input type="radio" :id="'src_chart_bar' + parent_i" v-model="obj.chartType" @change="changeType(obj)" value="1">
                                    <label :for="'src_chart_bar' + parent_i" class="btn src_chart_bar" :class="{ 'on': obj.chartType === '1' }"></label>
                                    <!-- 가로형 -->
                                    <input type="radio" :id="'src_chart_horizontal_bar' + parent_i" v-model="obj.chartType" @change="changeType(obj)" value="2">
                                    <label :for="'src_chart_horizontal_bar' + parent_i" class="btn src_chart_horizontal_bar"
                                        :class="{ 'on': obj.chartType === '2' }"></label>
                                    <!-- 선 -->
                                    <input type="radio" :id="'src_chart_line' + parent_i" v-model="obj.chartType" ref="click" @change="changeType(obj)" value="3">
                                    <label :for="'src_chart_line' + parent_i" class="btn src_chart_line" :class="{ 'on': obj.chartType === '3' }"></label>
                                    <!-- 원 -->
                                    <input type="radio" :id="'src_chart_cir' + parent_i" v-model="obj.chartType" @change="changeType(obj)" value="4">
                                    <label :for="'src_chart_cir' + parent_i" class="btn src_chart_cir" :class="{ 'on': obj.chartType === '4' }"></label>
                                </div>
                                </dd>
                            </div>
                            
                            <!-- 항목 리스트 -->
                            <div :class="[obj.chartType!=='3'?'sub_frame chartOp-main':'sub_frame chartLineOp-fir']">
                                <div class="translocation">
                                <label class="chartLabel-item" v-if="obj.chartType !== '3'">항목</label> <label class="chartLabel-std" v-else>기준 항목</label>
                                <!-- draggable이 div 취급을 받음 -->
                                <draggable tag="div" :list="obj.rowList.crossAxes" group="cross_op" :data-index="parent_i+'/'+obj.chartType" 
                                    :disabled="dontMove[parent_i]"  @start="innerDragController($event, parent_i)" @end="itemUpDown(obj, true)">
                                    <template v-for="(row, idx) in obj.rowList.crossAxes">
                                    <!-- 개별 항목 & 옵션[Start] -->
                                    <div class="row cross-item" :key="parent_i+'c-r'+idx">
                                    <div class="chart-list">
                                        <select v-model="row.val" @change="changeCrossStd($event, parent_i, idx, 'row', true)" :key="parent_i+'selectItem'+reSeletItem">
                                        <option value="0">-선택-</option>
                                        <slot v-for="auto in getConfigEval.group.AT">
                                            <option v-if="auto.isUse === 'Y' || showUnusedEvalItem" :value="auto.seq" :disabled="evalDuplicateVerification(obj,(Number(auto.seq)))" :key="parent_i+'c-c'+auto.name">[자동]{{auto.name}}</option>
                                        </slot>
                                        <slot v-if="getConfigEval.group.M1.isUse === 'Y' || showUnusedEvalItem">
                                            <option value="10001" :disabled="evalDuplicateVerification(obj,10001,'M1')">[평가1]대분류</option>
                                            <option value="10002" :disabled="evalDuplicateVerification(obj,10002,'M1')">[평가1]중분류</option>
                                            <option value="10022" :disabled="evalDuplicateVerification(obj,10002,'M1')">[평가1]중분류(상위포함)</option>
                                            <option value="10003" :disabled="evalDuplicateVerification(obj,10003,'M1')">[평가1]소분류</option>
                                            <option value="10033" :disabled="evalDuplicateVerification(obj,10003,'M1')">[평가1]소분류(상위포함)</option>
                                        </slot>
                                        <slot v-for="ev2 in getConfigEval.group.M2">
                                            <option v-if="ev2.isEval === 'Y' || showUnusedEvalItem" :value="ev2.seq" :disabled="evalDuplicateVerification(obj,(Number(ev2.seq)))" :key="parent_i+'c-c'+ev2.name">[평가2]{{ev2.name}}</option>
                                        </slot>
                                        <option value="100001" :disabled="evalDuplicateVerification(obj,100001)">[기타]기간</option>
                                        <option v-if="getConfigEval.policy.S3 && getConfigEval.policy.S3.value === 'Y'" value="100004" :disabled="evalDuplicateVerification(obj,100004)">[기타]매체분류(3.5)</option>
                                        <option value="100002" :disabled="evalDuplicateVerification(obj,100002)">[기타]매체분류</option>
                                        <option value="100003" :disabled="evalDuplicateVerification(obj,100003)">[기타]매체유형</option>
                                        <option value="111111" :disabled="evalDuplicateVerification(obj,111111)">[특수]평가별(전체)</option>
                                        <option value="100111" :disabled="evalDuplicateVerification(obj,100111)">[특수]평가별(자동)</option>
                                        <option value="100222" :disabled="evalDuplicateVerification(obj,100222)">[특수]평가별(평가1)</option>
                                        <option value="100333" :disabled="evalDuplicateVerification(obj,100333)">[특수]평가별(평가2)</option>
                                        <option value="100555" :disabled="evalDuplicateVerification(obj,100555)">[특수]매체별</option>
                                        </select>
                                        <div class="dragArea">
                                        <!-- drag image -->
                                        </div>
                                    </div>

                                    <!-- modal trigger [Start] -->
                                    <!-- 몇몇 항목은 옵션을 가질 수 없음. (표현되는 라벨은 한정적이므로) -->
                                    <div class="pref" v-if="row.useTheOption && obj.chartType !== '4' && row.val !== '0'" @click="modal_trigger('IO', row, parent_i, idx)"></div>
                                    <!-- modal trigger [End] -->

                                    </div>
                                    </template>
                                </draggable>
                                </div>
                            </div> <!-- 항목 리스트 [End] -->
                            
                            
                            <!-- 라인차트 라인 항목 -->
                            <div v-if="obj.chartType === '3'" class="sub_frame chartLineOp-sec"> 
                                <div class="translocation">
                                <label class="chartLabel-line">라인 항목</label>
                                <draggable tag="div" :list="obj.columnList.crossAxes" group="cross_op" :data-index="parent_i+'/'+obj.chartType"
                                    :disabled="dontMove[parent_i]" @start="innerDragController($event, parent_i)" @end="itemUpDown(obj, true)">
                                    <template v-for="(addItem, idx) in obj.columnList.crossAxes">
                                    <!-- 개별 항목 & 옵션[Start] -->
                                    <div class="col cross-item" :key="parent_i+'c-c'+idx">
                                    <div class="chart-list">
                                        <select v-model="addItem.val" @change="changeCrossStd($event, parent_i, idx, 'column', true)" :key="parent_i+'selectItem'+reSeletItem">
                                        <option value="0">-선택-</option>
                                        <slot v-for="auto in getConfigEval.group.AT">
                                            <option v-if="auto.isUse === 'Y' || showUnusedEvalItem" :value="auto.seq" :disabled="evalDuplicateVerification(obj,(Number(auto.seq)))" :key="parent_i+'c-c'+auto.name">[자동]{{auto.name}}</option>
                                        </slot>
                                        <slot v-if="getConfigEval.group.M1.isUse === 'Y' || showUnusedEvalItem">
                                            <option value="10001" :disabled="evalDuplicateVerification(obj,10001,'M1')">[평가1]대분류</option>
                                            <option value="10002" :disabled="evalDuplicateVerification(obj,10002,'M1')">[평가1]중분류</option>
                                            <option value="10022" :disabled="evalDuplicateVerification(obj,10002,'M1')">[평가1]중분류(상위포함)</option>
                                            <option value="10003" :disabled="evalDuplicateVerification(obj,10003,'M1')">[평가1]소분류</option>
                                            <option value="10033" :disabled="evalDuplicateVerification(obj,10003,'M1')">[평가1]소분류(상위포함)</option>
                                        </slot>
                                        <slot v-for="ev2 in getConfigEval.group.M2">
                                            <option v-if="ev2.isEval === 'Y' || showUnusedEvalItem" :value="ev2.seq" :disabled="evalDuplicateVerification(obj,(Number(ev2.seq)))" :key="parent_i+'c-c'+ev2.name">[평가2]{{ev2.name}}</option>
                                        </slot>
                                        <option value="100001" :disabled="evalDuplicateVerification(obj,100001)">[기타]기간</option>
                                        <option v-if="getConfigEval.policy.S3 && getConfigEval.policy.S3.value === 'Y'" value="100004" :disabled="evalDuplicateVerification(obj,100004)">[기타]매체분류(3.5)</option>
                                        <option value="100002" :disabled="evalDuplicateVerification(obj,100002)">[기타]매체분류</option>
                                        <option value="100003" :disabled="evalDuplicateVerification(obj,100003)">[기타]매체유형</option>
                                        <option value="111111" :disabled="evalDuplicateVerification(obj,111111)">[특수]평가별(전체)</option>
                                        <option value="100111" :disabled="evalDuplicateVerification(obj,100111)">[특수]평가별(자동)</option>
                                        <option value="100222" :disabled="evalDuplicateVerification(obj,100222)">[특수]평가별(평가1)</option>
                                        <option value="100333" :disabled="evalDuplicateVerification(obj,100333)">[특수]평가별(평가2)</option>
                                        <option value="100555" :disabled="evalDuplicateVerification(obj,100555)">[특수]매체별</option>
                                        </select>
                                        <div class="dragArea">
                                        <!-- drag image -->
                                        </div>
                                    </div>

                                    <!-- 여기에 모달창 -->
                                    
                                    </div><!-- 개별 항목 & 옵션[End] -->
                                    </template>
                                </draggable>
                                </div>
                            </div>

                            <div :class="[obj.crossAxesLength === 4 ?'chartOp-sub inActive': 'chartOp-sub']" v-if="obj.chartType !== '3'">
                                <div :data-index="parent_i" v-show="obj.chartType==='1' || obj.chartType==='2'">
                                <input type="checkbox" :id="'verticalSplit'+parent_i" name="verticalSplit"
                                    :value="true" v-model="obj.verticalSplit" :disabled="obj.crossAxesLength === 4" @change="reRenLine">
                                <label :for="'verticalSplit'+parent_i"><span></span>
                                    <template v-if="obj.chartType==='1'" >마지막 항목 <p class="strong">세로</p>로 나누기</template>
                                    <template v-else-if="obj.chartType==='2'">마지막 항목 <p class="strong">가로</p>로 나누기</template>
                                </label>
                                </div>
                            </div>
                            
                            </div> <!-- .inner .chartOp -->
                        </div>

                        <aside class="sideOption">
                            <table>
                                <colgroup><col span="1"  width="22%"/></colgroup>
                                <tr>
                                    <th>제 목:</th>
                                    <td>
                                        <input type="text" :value="obj.title.main.text" readonly @click="modal_trigger('T', obj, parent_i)">
                                    </td>
                                </tr>
                                <tr>
                                    <th>부제목:</th>
                                    <td>
                                        <input type="text" :value="obj.title.sub.text" readonly @click="modal_trigger('ST', obj, parent_i)">
                                    </td>
                                </tr>
                                <tr>
                                    <th>교차-계산:</th>
                                    <td>
                                        <input type="radio" :id="'cross_calc_value_off'+parent_i" v-model="obj.crossCalc.isPrice" :value="false">
                                        <label :for="'cross_calc_value_off'+parent_i"><span></span>건수</label>

                                        <input type="radio" :id="'cross_calc_value_on'+parent_i" v-model="obj.crossCalc.isPrice" :value="true">
                                        <label :for="'cross_calc_value_on'+parent_i"><span></span>가치</label>
                                    </td>
                                </tr>
                                <tr>
                                    <th>금액단위:</th>
                                    <td class="chart-op-calc" v-if="$route.name !== 'scrap'" :class="{'conceal' : obj.crossCalc.isPrice === false}">
                                        <input type="radio" :id="'numberScale_0'+parent_i" v-model="obj.crossCalc.priceUnit" value="0"><label :for="'numberScale_0'+parent_i"><span></span>원</label>
                                        <input type="radio" :id="'numberScale_1'+parent_i" v-model="obj.crossCalc.priceUnit" value="1"><label :for="'numberScale_1'+parent_i"><span></span>천원</label>
                                        <input type="radio" :id="'numberScale_2'+parent_i" v-model="obj.crossCalc.priceUnit" value="2"><label :for="'numberScale_2'+parent_i"><span></span>백만원</label>
                                    </td>
                                </tr>
                                <tr>
                                    <th>설정:</th>
                                    <td>
                                        <div class="pref" @click="modal_trigger('CO', obj, parent_i)" :key="parent_i+'c-o/d'+renderWhole"></div>
                                    </td>
                                </tr>
                            </table>
                        </aside>

                        </dl>

                        <!--===========================================================================================================================================================================-->
                        <!--============================================================================== [Text Object] ==============================================================================-->
                        <!--===========================================================================================================================================================================-->
                        <dl class="sch_element cross_std groupT" v-else-if="getConfigEval && getConfigEval.group && obj.name ==='Text'" :key="textObjectRen">
                        <div :data-index="parent_i" style="display: flex; width:98%;">
                            <textarea :class="'groupT-text text-obj-section'+parent_i" v-model="obj.value.text"></textarea>
                            <aside class="sideOption">
                                <table>
                                    <colgroup><col span="1"  width="40%"/></colgroup>
                                    <tr>
                                        <th>{{obj.charcater}}:</th>
                                        <td>
                                            <div class="pref" @click="modal_trigger('TO', obj, parent_i)"></div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>텍스트 키워드:</th>
                                        <td>
                                            <div class="pref" @click="modal_trigger('TK', obj, parent_i)"></div>
                                        </td>
                                    </tr>
                                </table>
                            </aside>

                        </div>
                        </dl>

                    </div> <!-- [End] isShow -->

                    <div v-show="!obj.show" class="miniDiv" :key="'mini'+renderWhole">
                        <span>{{obj.name}}</span>
                        <template v-if="obj.name != 'Text'">
                        [
                        <span v-for="(on, ni) in obj.optionName" :key="parent_i+' '+ni+' '+on.nm">
                            <template v-if="ni !== 0">-&nbsp;</template>{{on.name}}
                        </span>
                        ]
                        </template>
                    </div>

                    </fieldset> <!-- [End] optionList -->
                    </template> <!-- v-for -->
                </draggable>
            </div>
        </div> <!--!!!!!!!!!!!!!!!!! 시각객체 설정 [end] !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->

        <!--============================================================================== [ add Object ] ==============================================================================-->
        <div class="func-btn">
            <fieldset class="addObject">
                <legend class="addOption">생성</legend>
                <div>
                <div>
                    <img src="../../../assets/images/table.png" alt="테이블 추가" 
                        @click="addTableOrChart('Table')" title="테이블 추가">
                </div>
                <div>
                    <img src="../../../assets/images/chart.png" alt="차트 추가" 
                        @click="addTableOrChart('Chart')"  title="테이블 추가">
                </div>
                <div>
                    <img src="../../../assets/images/text.png" alt="설명 추가" 
                        @click="addTableOrChart('Text')">
                </div>
                </div>
            </fieldset>

            <template v-if="TEMPLATE_.seq === null">
                <button class="search-btn"  @click="vooMiniMap(true)">위치</button>
                <button v-if="TEMPLATE_.tKey === undefined" class="search-btn" @click="search()">확인</button>
                <button v-if="TEMPLATE_.tKey !== undefined" class="search-btn" @click="search()">미리보기(=검색)</button>
                <button v-if="TEMPLATE_.tKey !== undefined" class="save-btn" @click="saveData()">저장</button>
            </template>
            <template v-else>
                <button class="search-btn"  @click="vooMiniMap(true)">위치</button>
                <button class="search-btn" @click="search()">미리보기(=검색)</button>
                <button class="save-btn" @click="saveData()">저장</button>
            </template>
        </div>
    
    
    
    
    
        <!-- ===================================== 차트 라벨 옵션 [Start] =====================================-->
        <template v-if="setItemOption">
            <!-- [Start] modal -->
            <div class="modal-background" :key="'modal'+'c-io/d'+renderWhole">
                <div clasS="dialog dialog--active">
                <span class="dialog__close" @click="dialog_close">&#x2715;</span>
                <h2 class="dialog__title">항목 옵션</h2>

                <div class="dialog__content">
                    <template class="object_index whole">
                    <fieldset>
                    <legend>{{setItemOption.name}}</legend>
                    <div class="dialog-group col">
                        <div class="background-n-n"><span> 색깔: </span><input type="color" :data-key="'labelColor'" v-model="setItemOption.labelColor"></div>
                        <div class="background-n-n"><span> 글꼴 크기: </span>
                        <div class="modal-select">
                            <select data-key="labelWeight" v-model="setItemOption.labelWeight">
                                <option value="bold">bold</option>
                                <option value="bolder">bolder</option>
                                <option value="lighter">lighter</option>
                                <option value="normal">normal</option>
                            </select>
                        </div>
                        </div>
                        <div class="background-n-n"><span> 사이즈: </span><input type="text" :data-key="'labelSize'" v-model="setItemOption.labelSize"></div>
                        <template v-if="designChartAxis()">
                        <span>구분선</span>
                        <div class="background-n-n"><span> 굵기: </span><input type="text" v-model="setItemOption.gridThickness"></div>
                        <div class="background-n-n"><span> 색깔: </span><input type="color" :data-key="'gridColor'" v-model="setItemOption.gridColor"></div>
                        </template>
                    </div>
                    </fieldset>
                    </template>
                </div>
                <button class="dialog__action" @click="saveOption()">확인 &#8594;</button>
                </div>
            </div>
            <!-- [End] modal-background -->
            </template>
            <!-- ===================================== 차트 라벨 옵션 [End] =====================================-->

        <!-- ===================================== 텍스트 (제목, 부제목, 기타) 옵션 [Start] =====================================-->
        <template v-if="setKeyword">
            <!-- [Start] modal -->
            <div class="modal-background">
                <div class="dialog dialog--active-text">
                <span class="dialog__close" @click="dialog_close">&#x2715;</span>
                <h2 class="dialog__title" v-if="setKeyword.delimter === 'T'">제목</h2>
                <h2 class="dialog__title" v-else-if="setKeyword.delimter === 'ST'">부제목</h2>
                <h2 class="dialog__title" v-else>텍스트 객체 키워드</h2>

                <div class="template-title-setting"> 
                    <section class="template-title-screen"></section>
                    <section class="title-comp">
                    <main :class="[setKeyword.delimter === 'TK' ? 'text-object-keyword':'']">
                        <textarea v-if="setKeyword.delimter === 'TK'" :class="'title groupT-text keywordContent'" 
                            @mouseup="keywordCover" v-model="setKeyword.text" :key="'kwd'+renderKeyword"></textarea>
                        <textarea v-else class="textarea keywordContent" wrap="off" @keydown="keyBlock" 
                            @mouseup="keywordCover" v-model="setKeyword.text" :key="'kwd'+renderKeyword"></textarea>
                        <article class="keyword-list">
                        <ul class="noselect">
                            <li><span ref="time" data-code="time" @click="keywordClick($event)">#기간</span></li>
                            <li><span ref="search" data-code="search" @click="keywordClick($event)" >#검색</span></li>
                            <li><span ref="media" data-code="media" @click="keywordClick($event)" >#매체</span></li>
                            <li><span ref="eval" data-code="eval" @click="keywordClick($event)" >#평가항목</span></li>
                            <template v-if="setKeyword.delimter != 'TK'">
                                <li><span ref="statistics" data-code="statistics" @click="keywordClick($event)">#통계항목</span></li>
                                <li><span ref="default" data-code="default" @click="keywordClick($event)" >#기본</span></li>
                            </template>
                        </ul>
                        </article>
                        <small>커서 이동 후, 위 키워드를 클릭하시면 해당 키워드를 삽입 할 수 있습니다.</small>
                    </main>
                    </section>
                    <section id="trans-keyword-modal">
                    <main>
                        <label for=""></label><!-- #기간# ... -->
                        <dl>
                        <template v-for="key in subKeywords">
                        <dt :key="'subKeywords'+key+'/up'"> 
                            <!-- create dt -->
                            <span @click="insertKeyword($event)">{{key}}</span> <!-- #{기간타입}# ... -->
                        </dt>
                        <dd :key="'subKeywords'+key+'/down'">{{keywordDes(key)}}</dd> <!-- 이것은 어쩌구어쩌구 ... -->
                        </template>
                        </dl>
                        <small></small>
                    </main>
                    </section>
                </div>
                
                <button class="dialog__action" @click="saveOption(setKeyword.delimter)">확인 &#8594;</button>
                </div>
            </div>
            <!-- [End] modal-background -->
        </template>
        <!-- ===================================== 제목, 부제목 옵션 [End] =====================================-->



            <!-- ===================================== 차트 옵션 [Start] =====================================-->
        <template v-if="setDetails">
            <!-- [Start] modal -->
            <div class="modal-background" :key="'modal'+'c-o/d'+renderWhole">
            <div :class="[setDetails.name==='툴 팁' ? 'tooltip dialog--active' : 'dialog dialog--active']">
                <span class="dialog__close" @click="dialog_close">&#x2715;</span>
                <h2 class="dialog__title">차트 옵션</h2>

                <div class="dialog__content">
                <template class="object_index whole" v-if="setDetails[0].background"><!--====================================== 배경 ======================================-->
                <fieldset>
                    <legend>{{setDetails[0].name}}</legend>
                    <div class="dialog-group col">
                    <div v-if="setDetails[0]" class="background-n"><span>배경색: </span><input type="color" :data-key="'color'" v-model="setDetails[0].color" :key="'c'+'modal'+'codb'+renderWhole"></div>
                    <!-- setDetails.outlineFlag -->
                    <div v-if="setDetails[0]" class="background-n"><span>점선 사용 여부: </span>
                        <input type="checkbox" :data-key="'outlineFlag'" :id="'switch'+'modal'" class="switch outline-flag"  v-model="setDetails[0].outlineFlag">
                        <label :for="'switch'+'modal'" class="switch_label">
                            <div class="onf_btn"></div>
                        </label>
                    </div>
                    <div v-if="setDetails[0]" class="background-n-n outline-flag " :class="{'tag-disabled' : !setDetails[0].outlineFlag}"><span>굵기:</span><input type="text" :data-key="'outlineThickness'" v-model="setDetails[0].outlineThickness"></div>
                    <div v-if="setDetails[0]" class="background-n-n outline-flag " :class="{'tag-disabled' : !setDetails[0].outlineFlag}"><span>선 색:</span><input type="color" :data-key="'outlineColor'" v-model="setDetails[0].outlineColor" :key="'c'+'modal'+'olc'+renderWhole"></div>
                    <div v-if="setDetails[0]" class="background-n-n outline-flag " :class="{'tag-disabled' : !setDetails[0].outlineFlag}"><span>선 길이:</span><input type="text" :data-key="'outlineLength'" v-model="setDetails[0].outlineLength"></div>
                    <div v-if="setDetails[0]" class="background-n-n outline-flag " :class="{'tag-disabled' : !setDetails[0].outlineFlag}"><span>공백 길이:</span><input type="text" :data-key="'outlineSpace'" v-model="setDetails[0].outlineSpace"></div>
                    <!-- setDetails.legendFlag -->
                    <div v-if="setDetails[0]" class="background-n"><span>범례 사용 여부: </span>
                        <input type="checkbox" :data-key="'legend'" :id="'switch0'+'modal'" class="switch legend-flag"  v-model="setDetails[0].legendFlag">
                        <label :for="'switch0'+'modal'" class="switch_label">
                            <div class="onf_btn"></div>
                        </label>
                    </div>
                    <div v-if="setDetails[0] && setDetails[1].bar" class="background-n-n radius" :class="{'tag-disabled' : insteadOfLegend}" >
                        <span style="width: 200px;">1차원 그래프에서 라벨로 대체</span>
                        <input type="checkbox" :data-key="'useLabel'" :id="'switch0-1'+'modal'" class="switch useLabel"  v-model="setDetails[0].labelInsteadOfLegend">
                        <label :for="'switch0-1'+'modal'" class="switch_label">
                            <div class="onf_btn"></div>
                        </label>
                    </div>
                    </div>
                </fieldset>
                </template>


                <template v-if="setDetails[1].bar"><!--====================================== 막대 ======================================-->
                <fieldset>
                    <legend>{{setDetails[1].name}}</legend>
                    <div class="dialog-group col">
                    <!-- setDetails.emphasize -->
                    <div v-if="setDetails[1]" class="background-n"><span>윤곽선 강조</span>
                    <input type="checkbox" :data-key="'emphasize'" :id="'switch1'+'modal'" class="switch" v-model="setDetails[1].emphasize">
                    <label :for="'switch1'+'modal'" class="switch_label">
                        <div class="onf_btn"></div>
                    </label>
                    </div>
                    <div v-if="setDetails[1]" class="background-n"><span>굴곡선 사용 여부</span>
                    <!-- setDetails.radiusFlag -->
                    <input type="checkbox"  :data-key="'radiusFlag'" :id="'switch3'+'modal'" class="switch radius"  v-model="setDetails[1].radiusFlag">
                    <label :for="'switch3'+'modal'" class="switch_label">
                        <div class="onf_btn"></div>
                    </label>
                    </div>
                    <div v-if="setDetails[1]" class="background-n-n radius" :class="{'tag-disabled' : !setDetails[1].radiusFlag}" ><span>굴곡 수치</span><input type="text" v-model="setDetails[1].radiusValue"></div>
                    <!-- setDetails.date12 --> 
                    <div v-if="setDetails[1] && itemLength" class="background-n"><span>모든 날짜 표시 </span>
                    <input type="checkbox" :data-key="'date12'" :id="'switch2'+'modal'" class="switch date12-flag"  v-model="setDetails[1].date12">
                    <label :for="'switch2'+'modal'" class="switch_label">
                        <div class="onf_btn"></div>
                    </label>
                    </div>
                    <dl v-if="setDetails[1] && itemLength">2차원 Bar Chart에서만 이용 가능한 속성 입니다.</dl>
                    </div>
                </fieldset>
                </template>

                <template v-if="setDetails[2].line"><!--====================================== 선 ======================================-->
                <fieldset>
                    <legend>{{setDetails[2].name}}</legend>
                    <div class="dialog-group row">
                    <div class="group-col">
                        <!-- setDetails.mouseHover -->
                        <div v-if="setDetails[2]" class="background-n"><span>Mouse Hover Event</span>
                        <input type="checkbox" :data-key="'mouseHover'" :id="'switch4'+'modal'" class="switch mouseHover-flag" v-model="setDetails[2].mouseHover">
                        <label :for="'switch4'+'modal'" class="switch_label">
                            <div class="onf_btn"></div>
                        </label>
                        </div>
                        <div v-if="setDetails[2]" class="background-n-n mouseHover-flag " :class="{'tag-disabled' : !setDetails[2].mouseHover}"><span>점 크기</span><input type="text" :data-key="'mouseHoverSize'" v-model="setDetails[2].mouseHoverSize"></div>
                        <div v-if="setDetails[2]" class="background-n-n mouseHover-flag " :class="{'tag-disabled' : !setDetails[2].mouseHover}"><span>점 윤곽선 넓이</span><input type="text" :data-key="'mouseHoverBorderWidth'" v-model="setDetails[2].mouseHoverBorderWidth"></div>
                        <div v-if="setDetails[2]" class="background-n-n mouseHover-flag " :class="{'tag-disabled' : !setDetails[2].mouseHover}"><span>점 윤곽선 색</span><input type="color" :data-key="'mouseHoverBorderColor'" v-model="setDetails[2].mouseHoverBorderColor" :key="'c'+'modal'+'mhbc'+renderWhole"></div>

                        <span>기타</span>
                        <div v-if="setDetails[2]" class="background-n-n2"><span>stack 구조</span>
                        <input type="checkbox" :data-key="'stack'" :id="'switch6'+'modal'" class="switch" v-model="setDetails[2].stack">
                        <label :for="'switch6'+'modal'" class="switch_label">
                            <div class="onf_btn"></div>
                        </label>
                        </div>
                        <!-- <div v-if="setDetails[2]" class="background-n-n2"><span>선 내부 색상 채우기</span>
                        <input type="checkbox" :data-key="'isFill'" :id="'switch7'+'modal'" class="switch" v-model="setDetails[2].isFill">
                        <label :for="'switch7'+'modal'" class="switch_label">
                            <span class="onf_btn"></span>
                        </label>
                        </div> -->
                        <div v-if="setDetails[2]" class="background-n-n2"><span>선 윤곽선 감추기</span>
                        <input type="checkbox" :data-key="'showLine'" :id="'switch8'+'modal'" class="switch" v-model="setDetails[2].showLine">
                        <label :for="'switch8'+'modal'" class="switch_label">
                            <div class="onf_btn"></div>
                        </label>
                        </div>
                    </div>
                    

                    <div class="group-col">
                        <span>점(Point)</span>
                        <div v-if="setDetails[2]" class="background-n-n"><span>모양</span>
                        <div class="modal-select">
                            <select data-key="pointStyle" v-model="setDetails[2].pointStyle">
                                <option value="circle">circle</option>             <option value="cross">cross</option>
                                <option value="crossRot">crossRot</option>         <option value="dash">dash</option>
                                <option value="line">line</option>                 <option value="rect">rect</option>
                                <option value="rectRounded">rectRounded</option>   <option value="rectRot">rectRot</option>
                                <option value="star">star</option>                 <option value="triangle">triangle</option>
                            </select>
                        </div>
                        </div>
                        <div v-if="setDetails[2]" class="background-n-n"><span>윤곽선 색깔</span><input type="color" :data-key="'pointBorderColor'" v-model="setDetails[2].pointBorderColor" :key="'modal'+'pbc'+renderWhole"></div>
                        <div v-if="setDetails[2]" class="background-n-n"><span>윤곽선 크기</span><input type="text" :data-key="'pointBorderWidth'" v-model="setDetails[2].pointBorderWidth"></div>
                        <div v-if="setDetails[2]" class="background-n-n"><span>지름</span><input type="text" :data-key="'pointRadius'" v-model="setDetails[2].pointRadius"></div>
                        <div v-if="setDetails[2]" class="background-n-n"><span>각도</span><input type="text" :data-key="'pointRotation'" v-model="setDetails[2].pointRotation"></div>
                    </div>
                    </div>
                </fieldset>
                </template>

                <template v-if="setDetails[3].pie"><!--====================================== 원 ======================================-->
                <fieldset>
                    <legend>{{setDetails[3].name}}</legend>
                    <div class="dialog-group col">
                    <!-- setDetails.MouseHoverEvent -->
                    <div v-if="setDetails[3]" :data-key="'MouseHoverEvent'" class="background-n"><span>Mouse Hover Event</span>
                        <input type="checkbox" :data-key="'MouseHoverEvent'" :id="'switch9'+'modal'" class="switch" v-model="setDetails[3].MouseHoverEvent">
                        <label :for="'switch9'+'modal'" class="switch_label">
                            <div class="onf_btn"></div>
                        </label>
                    </div>
                    
                    <!-- setDetails.doughnutFlag -->
                    <div v-if="setDetails[3]" class="background-n"><span>도넛</span>
                        <input type="checkbox" :data-key="'doughnutFlag'" :id="'switch10'+'modal'" class="switch doughnut-flag"  v-model="setDetails[3].doughnutFlag">
                        <label :for="'switch10'+'modal'" class="switch_label">
                            <div class="onf_btn"></div>
                        </label>
                    </div>
                    <div v-if="setDetails[3]" class="background-n-n doughnut-flag" :class="{'tag-disabled' : !setDetails[3].doughnutFlag}"><span>안쪽 원 크기: </span><input type="text" :data-key="'doughnutHoleSize'" v-model="setDetails[3].doughnutHoleSize"></div>
                    </div>
                </fieldset>
                </template>

                <template v-if="setDetails[5].yLabel"><!--====================================== Y라벨 ======================================-->
                <fieldset>
                    <legend>{{setDetails[5].name}}</legend>
                    <div class="dialog-group col">
                    <span>Y 라벨</span>
                    <div v-if="setDetails[5]" class="background-n-n"><span>색깔: </span><input type="color" :data-key="'labelColor'" v-model="setDetails[5].labelColor" :key="'c'+'modal'+'tlc'+renderWhole"></div>
                    <div v-if="setDetails[5]" class="background-n-n"><span>굵기: </span>
                        <div class="modal-select">
                        <select data-key="labelWeight" v-model="setDetails[5].labelWeight" :key="'c'+'modal'+'ylws2'+renderWhole">
                            <option value="bold">bold</option>
                            <option value="bolder">bolder</option>
                            <option value="lighter">lighter</option>
                            <option value="normal">normal</option>
                        </select>
                        </div>
                    </div>
                    <div v-if="setDetails[5]" class="background-n-n"><span>크기: </span><input type="text" :data-key="'labelSize'" v-model="setDetails[5].labelSize"></div>
                    <div v-if="setDetails[5]" class="background-n"><span>눈금선 표시 여부: </span>
                        <!-- setDetails.gridFlag -->
                        <input type="checkbox" :data-key="'gridFlag'" :id="'switch14'+'modal'" class="switch grid-flag"  v-model="setDetails[5].gridFlag">
                        <label :for="'switch14'+'modal'" class="switch_label">
                            <div class="onf_btn"></div>
                        </label>
                    </div>
                    <div v-if="setDetails[5]" class="background-n-n grid-flag " :class="{'tag-disabled' : !setDetails[5].gridFlag}"><span>눈금 최대: </span><input type="text" :data-key="'gridMax'" v-model="setDetails[5].gridMax"></div>
                    <div v-if="setDetails[5]" class="background-n-n grid-flag " :class="{'tag-disabled' : !setDetails[5].gridFlag}"><span>눈금 최소: </span><input type="text" :data-key="'gridMin'" v-model="setDetails[5].gridMin"></div>
                    <div v-if="setDetails[5]" class="background-n-n grid-flag " :class="{'tag-disabled' : !setDetails[5].gridFlag}"><span>눈금 증가 수치: </span><input type="text" :data-key="'gridStep'" v-model="setDetails[5].gridStep"></div>
                    </div>
                </fieldset>
                </template>

                <template v-if="setDetails[6].xLabel"><!--====================================== X라벨 ======================================-->
                <fieldset>
                    <legend>{{setDetails[6].name}}</legend>
                    <div class="dialog-group col">
                    <span>X 라벨</span>
                    <div v-if="setDetails[6]" class="background-n-n"><span>색깔: </span><input type="color" :data-key="'labelColor'" v-model="setDetails[6].labelColor" :key="'modal'+'xlc'+renderWhole"></div>
                    <div v-if="setDetails[6]" class="background-n-n"><span>굵기: </span>
                        <div class="modal-select">
                        <select data-key="labelWeight" v-model="setDetails[6].labelWeight"  :key="'s3'+renderWhole">
                            <option value="bold">bold</option>
                            <option value="bolder">bolder</option>
                            <option value="lighter">lighter</option>
                            <option value="normal">normal</option>
                        </select>
                        </div>
                    </div>
                    <div v-if="setDetails[6]" class="background-n-n"><span>크기: </span><input type="text" :data-key="'labelSize'" v-model="setDetails[6].labelSize"></div>
                    <!-- setDetails.gridFlag -->
                    <div v-if="setDetails[6]" class="background-n"><span>눈금선 표시 여부: </span>
                        <input type="checkbox" :data-key="'gridFlag'" :id="'switch15'+'modal'" class="switch grid-flag"  v-model="setDetails[6].gridFlag">
                        <label :for="'switch15'+'modal'" class="switch_label">
                            <div class="onf_btn"></div>
                        </label>
                    </div>
                    <div v-if="setDetails[6]" class="background-n-n grid-flag " :class="{'tag-disabled' : !setDetails[6].gridFlag}"><span>눈금 최대: </span><input type="text" :data-key="'gridMax'" v-model="setDetails[6].gridMax"></div>
                    <div v-if="setDetails[6]" class="background-n-n grid-flag " :class="{'tag-disabled' : !setDetails[6].gridFlag}"><span>눈금 최소: </span><input type="text" :data-key="'gridMin'" v-model="setDetails[6].gridMin"></div>
                    <div v-if="setDetails[6]" class="background-n-n grid-flag " :class="{'tag-disabled' : !setDetails[6].gridFlag}"><span>눈금 증가 수치: </span><input type="text" :data-key="'gridStep'" v-model="setDetails[6].gridStep"></div>
                    </div>
                </fieldset>
                </template>

                <template v-if="setDetails[4].tooltip"><!--====================================== 툴팁 ======================================-->
                <fieldset>
                    <legend>{{setDetails[4].name}}</legend>
                    <div class="dialog-group row">
                    <div class="group-col">
                        <template v-if="setDetails[8].chartType !== '4'">
                        <span>제목</span>
                        <div v-if="setDetails[4]" class="background-n-n"><span>글자색: </span><input type="color" :data-key="'titleColor'" v-model="setDetails[4].titleColor" :key="'c'+'modal'+'ttc'+renderWhole"></div>
                        <div v-if="setDetails[4]" class="background-n-n"><span>글꼴: </span>
                        <div class="modal-select">
                            <select data-key="titleFontStyle" v-model="setDetails[4].titleFontStyle">
                                <option value="normal">normal</option>
                                <option value="italic">italic</option>
                                <option value="oblique">oblique</option>
                                <option value="initial">initial</option>
                                <option value="inherit">inherit</option>
                            </select>
                        </div>
                        </div>
                        <div v-if="setDetails[4]" class="background-n-n"><span>글꼴 크기: </span>
                        <div class="modal-select">
                            <select data-key="titleFontWeight" v-model="setDetails[4].titleFontWeight">
                                <option value="bold">bold</option>
                                <option value="bolder">bolder</option>
                                <option value="lighter">lighter</option>
                                <option value="normal">normal</option>
                            </select>
                        </div>
                        </div>
                        <div v-if="setDetails[4]" class="background-n-n"><span>정렬: </span>
                        <div class="modal-select">
                            <select data-key="titleAlign" v-model="setDetails[4].titleAlign">
                                <option value="left">left</option>
                                <option value="right">right</option>
                            </select>
                        </div>
                        </div>
                        <div v-if="setDetails[4]" class="background-n-n"><span>하단 간격: </span><input type="number" :data-key="'titleMarginBottom'" v-model="setDetails[4].titleMarginBottom"></div>
                        </template>
                    
                        <span>본문</span>
                        <div v-if="setDetails[4]" class="background-n-n"><span>글자색: </span><input type="color" :data-key="'bodyColor'" v-model="setDetails[4].bodyColor" :key="'c'+'modal'+'btbc'+renderWhole"></div>
                        <div v-if="setDetails[4]" class="background-n-n"><span>글꼴: </span>
                        <div class="modal-select">
                            <select data-key="bodyFontStyle" v-model="setDetails[4].bodyFontStyle">
                                <option value="normal">normal</option>
                                <option value="italic">italic</option>
                                <option value="oblique">oblique</option>
                                <option value="initial">initial</option>
                                <option value="inherit">inherit</option>
                            </select>
                        </div>
                        </div>

                        <div v-if="setDetails[4]" class="background-n-n"><span>글꼴 크기: </span>
                        <div class="modal-select">
                            <select data-key="bodyFontWeight" v-model="setDetails[4].bodyFontWeight">
                                <option value="bold">bold</option>
                                <option value="bolder">bolder</option>
                                <option value="lighter">lighter</option>
                                <option value="normal">normal</option>
                            </select>
                        </div>
                        </div>
                    </div>

                    <div class="group-col">
                        <span>기타</span>
                        <div v-if="setDetails[4]" class="background-n-n2"><span>내부 공간 크기: </span><input type="number" :data-key="'padding'" v-model="setDetails[4].padding"></div>
                        <div v-if="setDetails[4]" class="background-n-n2"><span>그래프-tooltip 간격: </span><input type="number" :data-key="'caretPadding'" v-model="setDetails[4].caretPadding"></div>
                        <div v-if="setDetails[4]" class="background-n-n2"><span>화살표 크기: </span><input type="number" :data-key="'caretSize'" v-model="setDetails[4].caretSize"></div>
                        <div v-if="setDetails[4]" class="background-n-n2"><span>윤곽선 굴곡: </span><input type="number" :data-key="'cornerRadius'" v-model="setDetails[4].cornerRadius"></div>
                        
                        <div v-if="setDetails[4]" class="background-n-n2"><span>색상박스 넓이: </span><input type="number" :data-key="'boxWidth'" v-model="setDetails[4].boxWidth"></div>
                        <div v-if="setDetails[4]" class="background-n-n2"><span>색상박스 높이: </span><input type="number" :data-key="'boxHeight'" v-model="setDetails[4].boxHeight"></div>
                        <div v-if="setDetails[4]" class="background-n-n2"><span>색상박스-텍스트 간격: </span><input type="number" :data-key="'boxPadding'" v-model="setDetails[4].boxPadding"></div>
                        <div v-if="setDetails[4]" class="background-n-n2"><span>윤곽선 색: </span><input type="color" :data-key="'borderColor'" v-model="setDetails[4].borderColor" :key="'c'+'modal'+'etbc'+renderWhole"></div>
                        <div v-if="setDetails[4]" class="background-n-n2"><span>윤곽선 두께: </span><input type="text" :data-key="'borderWidth'" v-model="setDetails[4].borderWidth"></div>
                        <!-- setDetails.rtl -->
                        <div v-if="setDetails[4]" class="background-n-n2"><span>텍스트 오른쪽 시작: </span>
                        <input type="checkbox" :data-key="'rtl'" :id="'switch12'+'modal'" class="switch" v-model="setDetails[4].rtl">
                        <label :for="'switch12'+'modal'" class="switch_label">
                            <div class="onf_btn"></div>
                        </label>
                        </div>
                        <!-- setDetails.interaction -->
                        <div v-if="setDetails[8].chartType === '3' && setDetails[4]" class="background-n-n2"><span>툴팁 그룹화 </span>
                        <input type="checkbox" :data-key="'interaction'" :id="'switch13'+'modal'" class="switch" v-model="setDetails[4].interaction">
                        <label :for="'switch13'+'modal'" class="switch_label">
                            <div class="onf_btn"></div>
                        </label>
                        </div>
                    </div>
                    </div>
                </fieldset>
                </template>
                </div>
                <button class="dialog__action" @click="saveOption()">확인 &#8594;</button>
            </div> <!-- [End] dialog -->
            </div>
            <!-- [End] modal -->
        </template>
        <!-- ===================================== 차트 옵션 [End] =====================================-->

        <!-- ===================================== 텍스트 옵션 [Start] =====================================-->
        <template v-if="setText">
        <div class="modal-background">
        <div class="dialog dialog--active">
            <span class="dialog__close" @click="dialog_close" @keyup.esc="dialog_close">&#x2715;</span>
            <h2 class="dialog__title">{{setText.charcater}}</h2>
            <div class="dialog__content">
            <template class="object_index">
                <fieldset>
                <div>
                <div class="background-n"><span> 글꼴 크기: </span><input type="text" :data-key="'fontSize'" v-model="setText.fontSize"></div>
                <div class="background-n"><span> 글꼴색: </span><input type="color" :data-key="'fontColor'" v-model="setText.fontColor"></div>
                <div class="background-n"><span> 글꼴 모양: </span>
                    <div class="modal-select">
                    <select data-key="fontFamily" v-model="setText.fontFamily">
                        <option value="none">none</option>
                        <option value="oblique">sans-serif</option>
                        <option value="italic">monospace</option>
                        <option value="inherit">cursive</option>
                        <option value="inherit">fantasy</option>
                        <option value="inherit">system-ui</option>
                    </select>
                    </div>
                </div>
                <div class="background-n"><span> 글꼴 스타일: </span>
                    <div class="modal-select">
                    <select data-key="fontStyle" v-model="setText.fontStyle">
                        <option value="normal">normal</option>
                        <option value="oblique">oblique</option>
                        <option value="italic">italic</option>
                        <option value="inherit">inherit</option>
                    </select>
                    </div>
                </div>

                <div class="background-n"><span> 글꼴 굵기: </span>
                    <div class="modal-select">
                    <select data-key="fontWeight" v-model="setText.fontWeight">
                        <option value="bold">bold</option>
                        <option value="bolder">bolder</option>
                        <option value="lighter">lighter</option>
                        <option value="normal">normal</option>
                    </select>
                    </div>
                </div>
                <div class="background-n"><span> 글꼴선: </span>
                    <div class="modal-select">
                    <select data-key="fontTextDecoration" v-model="setText.fontTextDecoration">
                        <option value="none">none</option>
                        <option value="overline">overline</option>
                        <option value="underline">underline</option>
                        <option value="line-through">line-through</option>
                        <option value="underline overline">underline overline</option>
                    </select>
                    </div>
                </div>
                </div>
                </fieldset>

                <fieldset>
                <div>
                    <div class="background-n"><span> 공백: </span><input type="number" :data-key="'fontLetterSpacing'" v-model="setText.fontLetterSpacing"></div>
                    <div class="background-n"><span> 글꼴 정렬: </span>
                    <div class="modal-select">
                    <select data-key="position" v-model="setText.position">
                        <option value="left">left</option>
                        <option value="center">center</option>
                        <option value="right">right</option>
                    </select>
                    </div>
                </div>
                </div>
                </fieldset>
            </template>
            </div>
            <button class="dialog__action" @click="saveOption()">확인 &#8594;</button>
        </div>
        </div>
        </template>
        <!-- ===================================== 텍스트 옵션 [End] =====================================-->

        <template>
            <input type="checkbox" id="ative-visual-object-map" v-model="minimap">
            <label for="ative-visual-object-map"></label>
            <div v-if="minimap">
                <header><h3>시각객체의 크기 조절 및 정렬</h3></header>
                <main>
                    <section class="visual-object-size-list">
                        <div class="visual-object-size-list-table" alt="목록 테이블">
                            <table>
                                <colgroup>
                                    <col width="10%"/>
                                    <col width="10%"/>
                                    <col width="15%"/>
                                    <col width="15%"/>
                                    <col width="15%"/>
                                    <col width="20%"/>
                                    <col width="15%"/>
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>타입</th>
                                        <th>너비(px)</th>
                                        <th>열 맞춤</th>
                                        <th>높이(px)</th>
                                        <th>열기준 객체</th>
                                        <th>정렬</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <template v-for="(voo, vooi) in setPosition">
                                        <tr :key="miniMapKey + 'size-list' + vooi" :class="[rowspan[vooi]?'vo-group-line':'']">
                                            <td>{{vooi+1}}</td>
                                            <td>
                                                <img v-if="voo.name=='Chart'" :src="require('@/assets/images/chart.png')" />
                                                <img v-else-if="voo.name=='Table'" :src="require('@/assets/images/table.png')" />
                                                <img v-else :src="require('@/assets/images/text.png')" />
                                            </td>
                                            <!-- 너비 -->
                                            <td>
                                                <input v-if="voo.name=='Chart'" type="number" min="50" max="1860" v-model="voo.size.voWidth" 
                                                        @click="openTip(1, 'w', voo)" @change="sizeMaxMin($event, voo.size)" @input="converters($event, 'px')"
                                                        @keypress="isNumber($event)">
                                                <input v-else type="number" min="0" max="1860" v-model="voo.size.voWidth" 
                                                        @click="openTip(1, 'w', voo)" @change="sizeMaxMin($event, voo.size)" @input="converters($event, 'px')"
                                                        @keypress="isNumber($event)">
                                            </td>
                                            <!-- 열 맞춤 -->
                                            <td v-if="rowspan[vooi]" :rowspan="rowspan[vooi]">
                                                <button @mouseover="openTip(1, 'r')" @mouseleave="openTip(0)" @click="avgWidth(vooi)">열 맞춤</button>
                                            </td>
                                            <!-- 높이 -->
                                            <td>
                                                <input type="number" min="0" @click="openTip(1, 'h')" v-model="voo.size.voHeight"
                                                    @keydown="isNumber($event)">
                                            </td>
                                            <!-- 열기준 객체 -->
                                            <td>
                                                <input class="vo-map" type="checkbox" v-model="voo.relation.linebreak" :id="'volinebreak'+vooi" 
                                                        @change="immediate()" :disabled="vooi == 0">
                                                <label class="vo-map-label" :for="'volinebreak'+vooi"><span @mouseover="openTip(1, 's')" @mouseleave="openTip(0)"></span></label>
                                            </td>
                                            <!-- 정렬 -->
                                            <td v-if="rowspan[vooi]" :rowspan="rowspan[vooi]">
                                                <ul v-if="voo.relation.linebreak"><li>
                                                    <input type="radio" :id="'visual-object-align1'+vooi" value="align-items-left" v-model="voo.relation.align" @change="immediate()">
                                                    <label :for="'visual-object-align1'+vooi"><img :src="require('@/assets/images/align-left.png')" /></label>
                                                </li></ul>
                                                <ul v-if="voo.relation.linebreak"><li>
                                                    <input type="radio" :id="'visual-object-align2'+vooi" value="align-items-center" v-model="voo.relation.align" @change="immediate()">
                                                    <label :for="'visual-object-align2'+vooi"><img :src="require('@/assets/images/align-center.png')" /></label>
                                                </li></ul>
                                                <ul v-if="voo.relation.linebreak"><li>
                                                    <input type="radio" :id="'visual-object-align3'+vooi" value="align-items-right" v-model="voo.relation.align" @change="immediate()">
                                                    <label :for="'visual-object-align3'+vooi"><img :src="require('@/assets/images/align-right.png')" /></label>
                                                </li></ul>
                                            </td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>


                    </section>
                    <section class="visual-object-diagram" @mouseover="openTip(1, 'd')" @mouseleave="openTip(0)">
                        <main class="puzzle">
                        <template v-for="(line, li) in miniComponent">
                            <div :class="line.align + ' mm-line-object'" :key="'puzzle-active'+miniMapKey+'mini-component'+li">
                                <template v-for="voidx in line.list">
                                    <div :style="{'width':getPuzzleWidth(setPosition[voidx].size)}" :key="'puzzle'+voidx">
                                        {{voidx+1}}
                                        <img v-if="setPosition[voidx].name=='Chart'" :src="require('@/assets/images/chart.png')" />
                                        <img v-else-if="setPosition[voidx].name=='Table'" :src="require('@/assets/images/table.png')" />
                                        <img v-else :src="require('@/assets/images/text.png')" />
                                    </div>
                                </template>
                            </div>
                        </template>
                        </main>
                    </section>
                </main>
                <footer>
                    <div>
                        <p>* 표는 항목 수, 합산값 등에 의해 설정 값보다 커질 수 있습니다. ex) 설정값: 400 --> 실제값: 410</p>
                        <p>* 글상자는 글꼴 크기에 따라 설정 값보다 커질 수 있습니다. ex) 글꼴 크기: 200px, 너비: 0px --> 너비 예측불가</p>
                    </div>
                    <div>
                        <button @click="saveOption()">확인</button>
                        <button @click="vooMiniMap(false)">취소</button>
                    </div>
                </footer>
                <section id="tip" class="tip-view" hidden>
                    <div>
                        <p class="tip-title">대제목</p>
                        <dl>
                            <template v-for="(tipTag, tti) in tipTagArray">
                                <dt v-if="tipTag.dt" v-html="tipTag.dt" :key="'tip'+tti"></dt>
                                <div v-if="tipTag.div" v-html="tipTag.div" style="font-size: 12px; font-weight:900;" :key="'tip'+tti"></div>
                                <dd v-else-if="tipTag.dd && tipTag.dd != 'calculator'" v-html="tipTag.dd" :key="'tip'+tti">
                                </dd>
                                <dd v-else-if="tipTag.dd && tipTag.dd == 'calculator'" :key="'tip'+tti">
                                    <div class="tip-calculator"> 
                                        <section>
                                            <span>퍼센트 입력</span>
                                            <input type="number" @input="converters($event, '%')" :value="tipPercent" 
                                                @keypress="isNumber($event)">(%)
                                        </section>
                                        <section>
                                            <span>픽셀 입력</span>
                                            <input type="number" @input="converters($event, 'px')" :value="tipPixel.voWidth" 
                                                @keypress="isNumber($event)">(px)
                                        </section>
                                    </div>
                                </dd>
                            </template>
                        </dl>
                    </div>
                </section>
            </div>
        </template>

        <!-- 아래, 맨 아래 (position: fixed 위치 상관없음) -->
        <input id="copyOptPos" type="checkbox">
        <label for="copyOptPos"></label>
        <main class="option-position">
            <section class="just-below-the" @click="optionPosition('top')">
                <img :src="require('@/assets/images/top.png')" alt="맨 위" title="목록 맨 위">
                <span>최상단 복사</span>
            </section>
            <section class="just-below-the" @click="optionPosition('below')">
                <img :src="require('@/assets/images/middle.png')" alt="아래" title="복사 객체 아래">
                <span>아래 복사</span>
            </section>
            <section class="bottom-line" @click="optionPosition('bottom')">
                <img :src="require('@/assets/images/bottom.png')" alt="맨 아래" title="목록 맨 아래">
                <span>최하단 복사</span>
            </section>
        </main>

        <!-- 복사 버튼 (position: fixed 위치 상관없음) -->
        <input id="showCopyBtn" type="checkbox">
        <label for="showCopyBtn"></label>
        <fieldset class="copy-object">
            <legend class="copy-option">복사</legend>
            <div>
                <template v-if="!isText">
                <div id="copyTableObject">
                    <img src="../../../assets/images/table.png" alt="테이블 복사" 
                        @click="copyTableOrChart('Table')" title="테이블 복사">
                </div>
                <div id="copyChartObject">
                    <img src="../../../assets/images/chart.png" alt="차트 복사" 
                        @click="copyTableOrChart('Chart')"  title="차트 복사">
                </div>
                </template>
                <template v-else>
                <div id="copyTextObject">
                    <img src="../../../assets/images/text.png" alt="설명글 복사" 
                        @click="copyTableOrChart('Text')" title="설명글 복사">
                </div>
                </template>
            </div>
            <div>
                <ul>
                <li>복사할 경우, 새로운 시각객체(테이블, 차트 또는 텍스트)를<br>만들어냅니다.</li>
                <li>&lt;복사 과정에서 특정 옵션 데이터는 소실될 수 있음&gt;</li>
                </ul>
            </div>
        </fieldset>


    </div> <!-- object-field [end] -->
</template>
<script>
import {mapGetters} from 'vuex';
import draggable from "vuedraggable";
export default {
    name: 'VsOjOption',
    components: {draggable},
    props: ['SINGLE_TEMPLATE'],
    data() { 
        return {
            TEMPLATE_: {}
            ,tableOrChart: [] // Table Or Chart
            ,beforeVisualObj: null // use starting drag
            ,dragObjectIndex: null // 

            ,copyVisualObj: null // 시각객체 옵션 복사
            ,optionPos: {}
            ,isText: false
            ,dontMove : new Array(100).fill(false) // 아이템 드래그 컨트롤
            ,reSeletItem: 0

            ,setKeyword: null
            ,setDetails: null
            ,setText: null
            ,setPosition: null // Object size / sort
            ,rowspan : null
            ,miniComponent: null
            ,setItemOption: null // Item Option
            ,TCIndex : 0 // Table Chart Index
            ,IOIndex : 0 // Item Object Index
            ,tipTagArray: [] // tip-tag Array
            ,tipPercent: 0
            ,tipPixel: 0
            ,complText: null // Completed Text
            ,minimap: false // mini-map
            
            ,tempChartType: 1 // 임시 차트 타입
            ,dialogBackground: null
            ,tempDataStorage: null // 임시 데이터 저장
            ,groupTitle: '' // 
            ,textkey: 0
            ,spreadOn: true // 펼치기 / 접기
            ,isAsc: 1
            
            ,subKeywords: null
            ,keywordIndex: null
            ,keywordCode: ''

            ,temListRen: 0 // 템플릿 리스트 렌더링
            ,renderWhole: 0 // 검색 옵션의 대부분을 리렌더링할 때
            ,renKeyword: 0
            ,renderKeyword: 0
            ,renderLine: 0 // 막대그래프 옵션에서 사용
            ,textObjectRen: 0 // 텍스트 오브젝트만 리렌더링 할 때
            ,miniMapKey: 0

        }
    },
    mounted() {
        const that = this;
        window.addEventListener('scroll', function() {
            const e = document.getElementById('copyOptPos'); 
            if (!e) return;
            e.checked = false;
        });
        window.addEventListener('keyup', function(event) {
            if (that.isTipCalc && event.keyCode === 13) { 
                that.changeData();
            }
        });
    },
    beforeUnmount() {
        window.removeEventListener('scroll', function() {
            const e = document.getElementById('copyOptPos'); 
            if (!e) return;
            e.checked = false;
        });
    },
    watch: {
        SINGLE_TEMPLATE: {
            handler(value, oldValue) {
                this.TEMPLATE_ = JSON.parse(JSON.stringify(value));
                if (value && oldValue && value.seq === oldValue.seq) return;
                this.initialization();
            }
            ,deep: true
        },
        minimap: {
            handler(open) {
                if (open) {
                    this.setPosition = [];
                    this.rowspan = null;
                    let rowNum = 0;
                    const rowspan = {};
                    const tempLine = [];
                    this.tableOrChart.forEach((voo, i) => {
                        let line = {
                            list: [],
                            align : 'align-items-left',
                        };
                        if (i==0 || voo.relation.linebreak) {
                            line.align = voo.relation.align;
                            line.list.push(i);
                            tempLine.push(line);
                            rowNum = i
                            rowspan[rowNum] = 1;
                        } else {
                            line = tempLine.at(-1);
                            line.list.push(i);
                            rowspan[rowNum]++;
                        }
                        this.setPosition.push({
                            name : voo.name
                            ,size : JSON.parse(JSON.stringify(voo.size))
                            ,relation : {
                                align : voo.relation.align
                                ,linebreak : i==0 || voo.relation.linebreak
                            }
                        });
                    });
                    this.rowspan = Object.freeze(rowspan);
                    this.miniComponent = tempLine;
                }
                else {
                    this.rowspan = null;
                    this.setPosition = null;
                    this.miniComponent = null;
                }
            }
        },
        
    },
    computed: {
        ...mapGetters([
            'getStatSetting',
            'getEval2AutoAPI',
            'getMediaCategoryOldList',
            'getMediaList',
            'getConfigEval',
            'getConfigEvalGroup',
            'getDate',
        ]),
        
        itemLength() {
            return this.tableOrChart[this.TCIndex].crossAxesLength == 2;
        },

        insteadOfLegend() {
            // console.log(this.tableOrChart[this.TCIndex].crossAxesLength != 1 && !this.setDetails[0].legendFlag);
            return (this.tableOrChart[this.TCIndex].crossAxesLength !== 1  
                || (this.setDetails && !this.setDetails[0].legendFlag));
        }
    },
    methods: {
        initialization() {
            if (!this.TEMPLATE_       || 
                !this.TEMPLATE_.seq   || 
                !this.TEMPLATE_.config ) {
                this.TEMPLATE_.config = {}
                this.tableOrChart = [];
                return;
            } 
            if (this.TEMPLATE_.config.tcObject != null)
                this.tableOrChart = this.TEMPLATE_.config.tcObject;
            if (this.TEMPLATE_.config.tcObject == null
                || this.TEMPLATE_.config.tcObject == undefined) {
                this.TEMPLATE_.config = {}
                this.tableOrChart = [];
            } 
        },

        evalDuplicateVerification(voo, value, type) {
            if (type == 'M1') {
                if (value == 10002 || value == 10022) {
                    return voo.rowList.crossAxes.find(v => [10002, 10022].includes( Number(v.val) )) != undefined
                        || voo.columnList.crossAxes.find(v => [10002, 10022].includes( Number(v.val) )) != undefined;
                } else if (value == 10003 || value == 10033) {
                    return voo.rowList.crossAxes.find(v => [10003, 10033].includes( Number(v.val) )) != undefined
                        || voo.columnList.crossAxes.find(v => [10003, 10033].includes( Number(v.val) )) != undefined;
                } else {
                    return ( voo.rowList.crossAxes.find( x => Number(x.val) == value) != undefined
                        || voo.columnList.crossAxes.find( y => Number(y.val) == value)  != undefined
                    );
                }
            }
            return ( voo.rowList.crossAxes.find( x => Number(x.val) == value) != undefined
                || voo.columnList.crossAxes.find( y => Number(y.val) == value)  != undefined
            );
        },
        checkEval1List(voo) {
            const list = ['10001', '10002', '10022', '10003', '10033'];
            let rLen = voo.rowList.crossAxes.length;
            let cLen = voo.columnList.crossAxes.length;
            for (let i = 0; i < rLen-1; i++) {
                if (!list.includes(voo.rowList.crossAxes[i].val)) continue;
                for (let j = i+1; j < rLen; j++) {
                    if (!list.includes(voo.rowList.crossAxes[j].val)) continue;
                    if (Number(voo.rowList.crossAxes[i].val)%10 > Number(voo.rowList.crossAxes[j].val)%10)
                        [voo.rowList.crossAxes[i], voo.rowList.crossAxes[j]] = [voo.rowList.crossAxes[j], voo.rowList.crossAxes[i]];
                }
            }
            for (let i = 0; i < cLen-1; i++) {
                if (!list.includes(voo.columnList.crossAxes[i].val)) continue;
                for (let j = i+1; j < cLen; j++) {
                    if (!list.includes(voo.columnList.crossAxes[j].val)) continue;
                    if (Number(voo.columnList.crossAxes[i].val)%10 > Number(voo.columnList.crossAxes[j].val)%10)
                        [voo.columnList.crossAxes[i], voo.columnList.crossAxes[j]] = [voo.columnList.crossAxes[j], voo.columnList.crossAxes[i]];
                }
            }
        },


        vooMiniMap(open) {
            this.minimap = open;
        },

        getPuzzleWidth(size) { 
            return parseFloat(Number(size.voWidth) * 0.25).toFixed(5) + "px";
        },

        sizeMaxMin(event, size) {
            // const max = Number(event.target.max);
            const min = Number(event.target.min);
            const val = Number(event.target.value);
            // if (max < val) {
            //     alert("최대값("+max+")을 벗어났습니다.");
            //     size.voWidth = max;
            // } else 
            if (min > val) {
                alert("최소값("+min+")을 벗어났습니다.");
                size.voWidth = min;
            }
        },

        avgWidth(vooi) {
            // name, size, relation:{align, linebreak}
            // 비동기 데이터가 의심되어 this.rowspan을 사용하지 않는다면
            const ob = this.setPosition;
            let index = vooi;
            let i = 0;
            do {i++;} while(ob[++index] && !ob[index].relation.linebreak);
            do {
                let wdh = parseFloat(1860 / i);
                if (wdh < 50 && ob[vooi].name == "Chart") {
                    wdh = 50;
                }
                ob[vooi].size.voWidth = wdh;
            } while(ob[++vooi] && !ob[vooi].relation.linebreak);
        },

        immediate() {
            this.miniComponent = null;
            this.rowspan = null;
            let rowNum = 0;
            const rowspan = {};
            const tempLine = [];
            this.setPosition.forEach((voo, i) => {
                let line = {
                    list: [],
                    align : 'align-items-left',
                };
                if (voo.relation.linebreak) {
                    line.align = voo.relation.align;
                    line.list.push(i);
                    tempLine.push(line);
                    rowNum = i;
                    rowspan[rowNum] = 1;
                } else {
                    line = tempLine.at(-1);
                    line.list.push(i);
                    rowspan[rowNum]++;
                }
            });
            this.rowspan = Object.freeze(rowspan);
            this.miniComponent = tempLine;
            this.miniMapKey = this.miniMapKey > 100 ? 0 : this.miniMapKey+1;
        },

        openTip(show, type, vo) {
            let tip = document.querySelector('.tip-view');
            let p = null;
            this.isTipCalc = false;
            if (!tip) return ;
            if (show == 0 || (['w','h'].includes(type) && !tip.getAttributeNames().includes('hidden'))) {
                tip.setAttribute('hidden', '');
                this.tipPixel = {'voWidth':0};
                return false;
            } else {
                tip.removeAttribute('hidden');
                p = document.querySelector('.tip-title');
            }
            this.tipTagArray = [];
            //설명글 변경 현재 사용자가 작성하고 있는 부분의 설명글로 왼편 설명란을 변경 시킨다.
            switch(type){
                case 'w':
                    p.innerHTML = '너비 입력 정보';
                    if (vo.name == 'Chart') {
                        this.tipTagArray.push({'dt': '차트'});
                        this.tipTagArray.push({'dd': '<span>-</span>최대 : 1860'});
                        this.tipTagArray.push({'dd': '<span>-</span>최소 : 50'});
                    } else if (vo.name == 'Table') {
                        this.tipTagArray.push({'dt': '표'});
                        this.tipTagArray.push({'dd': '<span>-</span>최대 : 1860'});
                        this.tipTagArray.push({'dd': '<span>-</span>최소 : 0 ( 자동 최소값 적용 )'});
                        this.tipTagArray.push({'dd': '<span>-</span>항목이 많을 경우 지정한 값보다 더 커질수 있습니다.'});
                    } else {
                        this.tipTagArray.push({'dt': '문구'});
                        this.tipTagArray.push({'dd': '<span>-</span>최대 : 1860'});
                        this.tipTagArray.push({'dd': '<span>-</span>최소 : 0 ( 자동 최소값 적용 )'});
                    }
                    this.tipTagArray.push({'dd': '<span>-</span>너비는 퍼센트나 픽셀로 입력할 수 있습니다.'});
                    this.tipTagArray.push({'dd': 'calculator'});
                    this.tipTagArray.push({'dd': '<span>-</span>열 그룹 너비 종합이 최대값을 넘을 경우 그룹의 후순위 객체부터 자동 줄바꿈되어 아래로 내려갑니다.'});
                    this.tipPixel = vo.size;
                    this.converters({'target':{"value":vo.size.voWidth}}, 'px');
                    break;
                case 'r':
                    p.innerHTML = '열 맞춤 정보';
                    this.tipTagArray.push({'dt': '사이즈 분배'});
                    this.tipTagArray.push({'dd': '<span>-</span>하나의 그룹(구분선)이 한 줄을 차지합니다.(동일한 사이즈)'});
                    break;
                case 'h':
                    p.innerHTML = '높이 입력 정보';
                    this.tipTagArray.push({'dt': '차트, 표, 문구'});
                    this.tipTagArray.push({'dd': '<span>-</span>모든 객체는 0에서 (자동 최소값)이 적용됩니다.'});
                    this.tipTagArray.push({'dd': '<span>-</span>높이에 대한 값은 그림에 반영되지 않습니다.'});
                    this.tipTagArray.push({'dd': '<span>-</span>열 그룹 너비의 총합이 최대값을 넘을 경우 그들의 후순위 객체부터 자동 줄바꿈 되어 아래로 내려갑니다.'});
                    break;
                case 's':
                    p.innerHTML = '열기준 객체 정보';
                    this.tipTagArray.push({'dt': '그룹'});
                    this.tipTagArray.push({'dd': '<span>-</span>임의로 줄바꿈을 하기 위해선 <br/>"열 기준 객체"로 선택(체크) 해주시면 됩니다.'});
                    break;
                case 'd':
                    p.innerHTML = '배치도';
                    this.tipTagArray.push({'dt': '라인별 여백'});
                    this.tipTagArray.push({'dd': '<span>-</span>자동 줄바꿈과 임의 줄바꿈은 상단 여백으로 구분 가능합니다.'});
                    break;
            }
        },

        converters(event, type) {
            if (!this.tipPixel) return;
            const trg = event.target;
            if (type == '%') {
                this.tipPercent = parseFloat(trg.value);
                this.tipPixel.voWidth = Math.ceil((trg.value / 100) * 1860);
            } else {
                this.tipPercent = parseFloat((trg.value / 1860) * 100).toFixed(1);
                this.tipPixel.voWidth = Math.ceil(trg.value);
            }
        },

        isNumber(e) {
            e = (e) ? e : window.event;
            let charCode = (e.which) ? e.which : e.keyCode;
            if ((31 < charCode 
            && (charCode < 48 || 57 < charCode)) 
            && charCode !== 46 
            && !(95 < charCode && charCode < 106) ) {
                e.preventDefault();
            } else {
                return true;
            }
            
        },

        /**
         * @description: 시각객체 옵션 확대/축소
         */
        setWindowSize(vooIdx, show) {
            this.tableOrChart[vooIdx].show = show; // false = 감추기
        },
        deleteObject(vooIdx) {
            if ( !confirm('설정을 삭제하시겠습니까?') ) return;
            this.tableOrChart.splice(vooIdx, 1);    // 객체 삭제
            this.reRenWholeObject();
        },
        changeItemNameANDCounting(voo) {
            if (voo.name === 'Text') return;
            this.checkEval1List(voo);
            let cnt = 0;
            // 가로, 세로 항목(교차-기준) 개수 카운팅
            voo.rowList.crossAxes.forEach(r => { if (r.val !== "0") cnt++; });
            voo.rowList.itemLen = cnt; // row length
            voo.crossAxesLength = cnt; // sum length
            cnt = 0;
            voo.columnList.crossAxes.forEach(c => { if (c.val !== "0") cnt++; });
            voo.columnList.itemLen = cnt; // column length
            voo.crossAxesLength += cnt;   // sum length
            cnt = 0;
            
            // 빈 교차-기준(항목)을 표시 or 삭제를 할지 결정하는 로직
            // 교차-기준(항목)들의 이름(순서, 행/열)을 재배치하는 역할도 한다.
            voo.optionName = [];
            for(let r of voo.rowList.crossAxes) {
                if (r.val != "0") voo.optionName.push({name:r.name,act:true});
            }
            for(let c of voo.columnList.crossAxes) {
                if (c.val != "0") voo.optionName.push({name:c.name,act:true});
            }
            if (voo.crossAxesLength === 4) voo.verticalSplit = true; // 교차-기준을 최대로 선택했을 때
            if (voo.name==='Chart') this.chartOptionController(voo);
        },
        innerDragController(e, vooIdx) {
            if (vooIdx === null || vooIdx === undefined) {
                // stop drag
                let bef = this.dontMove.indexOf(false);
                this.dontMove.fill(false);
                this.dontMove.splice(bef, 1, false); // vue rendering으로 인해 splice를 사용
                if (this.beforeVisualObj.name == "Chart" && this.beforeVisualObj.chartType == '3') return;
                // 항목 개수가 일정량 초과했는지 판별하는 로직
/*                let dataScale = this.expectedDataSize(this.tableOrChart[this.dragObjectIndex].rowList.crossAxes)
                dataScale = !dataScale.warning ? this.expectedDataSize(this.tableOrChart[this.dragObjectIndex].columnList.crossAxes) : check;
                if (dataScale.warning) {
                    alert(dataScale.msg);
                    this.tableOrChart[this.dragObjectIndex] = this.beforeVisualObj;
                    this.beforeVisualObj = null;
                    this.dragObjectIndex = null;
                    this.reRenWholeObject();
                }*/
            } else { 
                // start drag
                this.dragObjectIndex = vooIdx;
                this.beforeVisualObj = JSON.parse(JSON.stringify(this.tableOrChart[vooIdx]));
                this.dontMove.fill(true);
                this.dontMove.splice(vooIdx, 1, false);
            }
        },
        /**
         * @description 
         * @param {string} name
         * @param {string} value
         * @returns {Object} { size: number, msg : string, warning: boolean }
         */
        expectedDataSize(crossAxes) {
            const LIMIT = 8000;
            const RES = {
                size: 0
                ,msg: ''
                ,warning: true
            }
            try{
                for(let [_, item] of Object.entries(crossAxes)) {
                    if (item.name != "" && item.val !== "0") {
                        RES.size += this.getConfigEvalGroup[item.val].subCnt;
                        RES.msg += item.name + ":" + this.getConfigEvalGroup[item.val].subCnt + ", ";
                    }
                }
                RES.warning = (LIMIT < RES.size);
            } catch(e) { 
                console.error("탐색할 수 없는 값입니다.");
            }
            RES.msg += "최대" + RES.msg + "개의 항목 수가 예상됩니다.\n"
                    +  "브라우저가 예기치 못하게 종료될 수 있습니다.";
            return RES;
        },
        async changeCrossStd(e, vooIdx, selectedIdx, dir, callback) { 
            let isRow = (dir === 'row');
            let to = this.tableOrChart[vooIdx];
            let type = to.chartType;
            const ListName = isRow ? 'rowList' : 'columnList';

            // 이벤트 값 가져오기 (name, val)
            let _name = e.target.options[e.target.selectedIndex].text;
            _name = _name.slice(_name.indexOf("]")+1);
            let _val = String(e.target.options[e.target.selectedIndex].value);

            // 값 세팅하기
            for(let n of to[ListName].crossAxes) {
                if (n.val !== "0" && String(n.val) === _val) {
                    n.name = _name;
                    n.chartItemOption.name = _name;
                } 
            }
            if (type === "3") await this.itemUpDown(to, false);
            await this.changeItemNameANDCounting(to);

            // 항목 개수가 일정량 초과했는지 판별하는 로직
/*            let dataScale = this.expectedDataSize(to[ListName].crossAxes)
            if (dataScale.warning) {
                alert(dataScale.msg);
                e.target.selectedIndex = 0;
                to[ListName].crossAxes[selectedIdx].val = '0';
                to[ListName].crossAxes[selectedIdx].name = '';
                to[ListName].crossAxes[selectedIdx].chartItemOption.name = '';
                if (callback) await this.changeCrossStd(e, vooIdx, selectedIdx, dir, false); // 무한루프 주의
            }*/
            this.reSeletItem = this.reSeletItem > 100 ? 0 : this.reSeletItem++;
        },
        modal_trigger(delimter, voo, vooIdx, etc) { 
            this.$statConfig.bodyScrolling(false);
            let _cloneData = JSON.parse(JSON.stringify(voo));
            this.TCIndex = vooIdx;

            switch(delimter) {
                case "T" : // 제목
                    this.setKeyword = {};
                    this.setKeyword.delimter = delimter;
                    this.setKeyword.text = _cloneData.title.main.text; // span 리스트를 만들 값을 저장한다.
                    break;
                case "ST" : // 부제목
                    this.setKeyword = {};
                    this.setKeyword.delimter = delimter;
                    this.setKeyword.text = _cloneData.title.sub.text; // span 리스트를 만들 값을 저장한다.
                    break;
                case "TK":
                    this.setKeyword = {};
                    this.setKeyword.delimter = delimter;
                    let _r = this.classToText('.text-obj-section'+this.TCIndex);
                    _cloneData.value = _r;
                    this.setKeyword.text = _cloneData.value.text; // span 리스트를 만들 값을 저장한다.
                    break;
                case "IO" : // 교차-기준 옵션
                    this.IOIndex = etc;
                    this.setItemOption = _cloneData.chartItemOption;
                    break;
                case "CO" : // 차트 옵션
                    this.setDetails = _cloneData.details;
                    break;
                case "TO" : // 텍스트 객체 옵션
                    this.setText = _cloneData;
                    break;
                default: console.error("예외적인 데이터 삽입");
            } // switch
        },
        
        async changeType(voo) {
            // 올바른 객체가 아니라면..
            if (voo === null) return;

            /**
            * other -> line , line -> other 다음 2가지 경우에 데이터 구조를 변경할 필요가 있다.
            * 데이터 구조는 기준/데이터 2개의 항목으로 구분한다. 코드에서는 각각 row, column으로 나타낸다.
            * line chart 전용 데이터 구조이다.
            */
            let t = String(voo.chartType);
            if (t === '3') {
                // 값이 존재하는 항목을 기준 데이터로 정하기
                let stdItem = voo.rowList.crossAxes.find(el => el.val !== "0");
                // rowList (=기준 항목), columnList (=라인 항목)
                if (stdItem !== undefined) {
                    // 기준 항목을 제외한 나머지 출력
                    let lineItem = voo.rowList.crossAxes.filter(el => stdItem.val != el.val);
                    voo.rowList.crossAxes = [stdItem]; // (=stdItem)(은)는 object라서 [] 추가
                    voo.columnList.crossAxes = lineItem; // (=lineItem)(은)는 array라서 [] 제외
                } 
                // 기준 항목이 없을 경우 (사용자가 아무것도 교차-기준을 적용하지 않았을 때)
                else {
                    voo.columnList.crossAxes = voo.rowList.crossAxes.splice(1);
                }
            } 
            else if (t !== '3') {
                // 기준 항목과 데이터 항목 합치기
                voo.rowList.crossAxes.push(
                    ...voo.columnList.crossAxes.splice(0)
                );
                // 항목 개수가 일정량 초과했는지 판별하는 로직
/*                let dataScale = await this.expectedDataSize(voo.rowList.crossAxes);
                if (dataScale.warning) {
                    alert(dataScale.msg);
                    this.$refs.click[0].click();
                    return ;
                }*/
            }

            
            // Chart Type에 따라 ~
            if (t === '3') voo.verticalSplit = false;
            let newDeteils = await this.crossChartDetailsOptionInit(t).slice();
            let copies = [];
            let duplChecked = false;
            for(let new_ of newDeteils) {
                duplChecked = false;
                for(let old_ of voo.details) { 
                    if (new_.name == old_.name && new_.display && old_.display) {
                        copies.push(old_);
                        duplChecked = true;
                        break;
                    }
                }
                if (!duplChecked) copies.push(new_);
            }
            voo.details = copies;
            await this.changeItemNameANDCounting(voo); // 항목 길이 재구성
            this.reRenWholeObject(); // 리렌더링
        },
        async itemUpDown(voo, isClickEvent) {
            if (isClickEvent) this.innerDragController(); // drag @end event
            if (voo.chartType === '3')  {
                let rowItem = voo.rowList.crossAxes.filter(el => el.val !== "0");
                if (rowItem.length === 1) return;
                if (rowItem.length === 0) {
                    let fromColumnToRow = [];
                    // column에서 유의미한 데이터 찾기
                    let stdItem = undefined;
                    let checkItem = voo.columnList.crossAxes.some((el, el_i, colList) => {
                        if (el.val !== "0") {
                            stdItem = colList.splice(el_i, 1);
                            return true; // 최초 한번이면 된다.
                        }
                    });
                    // 기준 항목에 val=0인 객체가 존재할 경우
                    if (voo.rowList.crossAxes.length > 0) {
                        fromColumnToRow = voo.rowList.crossAxes.splice(0);
                        for (let i = fromColumnToRow.length; i > 0; i--) {
                            voo.columnList.crossAxes.unshift(fromColumnToRow[i-1]);
                        }
                    } 
                    // 기준 항목 val=0 또는 아무것도 없을 경우
                    // column에 유의미한 값이 없다면
                    if (!checkItem)  {
                        voo.rowList.crossAxes = voo.columnList.crossAxes.splice(0,1);
                    }
                    // column에 유의미한 값이 있다면
                    else {
                        voo.rowList.crossAxes = stdItem;
                    }
                } else {
                    // 내가 항목을 위로 올렸을 때 (이것도 2번째 글과 관련)
                    let tmp = voo.rowList.crossAxes.splice(1);
                    for (let i = tmp.length; i > 0; i--) {
                        voo.columnList.crossAxes.unshift(tmp[i-1]);
                    }
                }
                // 항목 개수가 일정량 초과했는지 판별하는 로직
/*                if (isClickEvent) {
                    let dataScale = this.expectedDataSize(this.tableOrChart[this.dragObjectIndex].rowList.crossAxes)
                    dataScale = !dataScale.warning ? this.expectedDataSize(this.tableOrChart[this.dragObjectIndex].columnList.crossAxes) : check;
                    if (dataScale.warning) {
                        alert(dataScale.msg);
                        this.tableOrChart[this.dragObjectIndex] = this.beforeVisualObj;
                        this.dragObjectIndex = null;
                        this.beforeVisualObj = null;
                        this.reRenWholeObject();
                    }
                }*/
                this.checkEval1List(voo);
                this.chartOptionController(voo)
            } else {
                // 일반적인 드레그 이동 시
                await this.changeItemNameANDCounting(voo);
            }
            // 리렌더링
            this.reRenWholeObject();
        },
        
        async saveData() {
            if (this.TEMPLATE_.seq === undefined) { 
                alert("템플릿을 선택 또는 추가 해주세요."); return ;
            }
            if (!this.TEMPLATE_.title.trim().length) {
                alert("제목은 공백만으로 이뤄질 수 없습니다."); return ;
            }
            // [텍스트] 시각객체 설정 
            await this.fullTextObjectCoding();
            await this.concatTemplateData();
            await this.$nextTick();
            if (this.TEMPLATE_.seq === null) { 
                if (!confirm("저장하시겠습니까?")) { return; }
                this.TEMPLATE_ = await this.$statConfig.funcCreateRecode(
                    'template', this.TEMPLATE_);
                await this.loadData('create');
            } else {
                if (!confirm("수정하시겠습니까?")) { return; }
                this.TEMPLATE_ = await this.$statConfig.funcModifyRecode(
                    'template', this.TEMPLATE_);
                await this.loadData();
            }
            this.tempRendering();
        },

        /**
         * @description : 템플릿 리스트 불러오기
         */
        async loadData(mode) { this.$emit("LoadTemplate", mode); }, // loadData
        

        /*======================================= SUB METHODS =======================================*/

        /**
         * des :  교차-기준(항목)의 *상세 옵션을 컨트롤하는 함수이다.
         *        막대 그래프에서 마지막 항목에 대한 처리 방법에 따라 
         *        항목 옵션의 수를 달리 해야하기 때문에 존재.
         * 
         *        *상세 옵션 (=톱니바퀴 모양)
         * 
         * <교차-기준 적용하기>, <객체(테이블, 차트)> 버튼에도 적용해야 함.
         */
        chartOptionController(voo) {
            if (!voo.rowList || !voo.columnList) return ;
            let max = voo.rowList.itemLen + voo.columnList.itemLen; // 최대 사이즈
            let cnt = 0; // 화면에 출력되는 옵션의 수
            let lastOption = 0; // 옵션의 마지막 인덱스

            // 상황에 따른 옵션들의 등장 여부
            if (voo.chartType === '3') { 
                voo.rowList.crossAxes.forEach(e=>e.useTheOption = true);
                voo.columnList.crossAxes.forEach(e=>e.useTheOption = false);
            } else {
                voo.rowList.crossAxes.forEach((e,i) => {
                    if (e.val != '0' && cnt < (max-1)) {
                    e.useTheOption = true;
                    lastOption = i;
                    cnt++;
                    } else { e.useTheOption = false; }
                });
                voo.rowList.lastChartOptionIndex = lastOption; 
            } // if-else
        }, // method chartOptionController

        copyObject(event, object, pos) {
            let pointer = {
                left: 0
                , top: 0
                , getPointer: function(elm) {
                let parent = elm.offsetParent;
                let bound = elm.getBoundingClientRect();
                    let divbound = parent.getBoundingClientRect();
                    this.left = bound.left - divbound.left;
                    this.top = bound.top - divbound.top + bound.height;
                    return [this.left, this.top];
                }
            }
            let p = pointer.getPointer(event.currentTarget);

            this.optionPos.index = (pos+1);
            this.isText = object.name === "Text" ? true : false;
            const el = document.getElementById('copyOptPos');
            if (!el) return;
            el.checked = !el.checked;
            if (!el.checked) return;
            const modal = document.querySelector(".option-position");
            if (!modal) return; 
            modal.style.top = p[1]+'px';
            modal.style.left = p[0]+'px';
            this.copyVisualObj = JSON.parse(JSON.stringify(object)); // 객체 복사
        },

        optionPosition(std) {
            this.optionPos.std = std;
            this.$statConfig.bodyScrolling(false);
            document.getElementById('copyOptPos').checked = false;
            document.getElementById('showCopyBtn').checked = true;
        },

        copyTableOrChart(typeToReplace) { 
            let _details = this.crossChartDetailsOptionInit("1"); // 차트 상세옵션 info

            let isChart = this.copyVisualObj.name === "Chart";
            let isTable = this.copyVisualObj.name === "Table";
            let isText = this.copyVisualObj.name === "Text";
            if (this.copyVisualObj === null) return; // 복사할 객체가 있다면 

            let newObj = null;
            if (typeToReplace === 'Table') { // 객체 복사 --> table로 변형
                if (isTable) { 
                    newObj = this.copyVisualObj;
                } else if (isChart) {
                    if (this.copyVisualObj.chartType == '3') {
                        this.copyVisualObj.rowList.crossAxes
                            .push(
                                ...this.copyVisualObj
                                .columnList
                                .crossAxes.splice(0)
                            ); 
                        this.changeItemNameANDCounting(this.copyVisualObj);
                        // 항목 개수가 일정량 초과했는지 판별하는 로직
                        let dataScale = this.expectedDataSize(this.copyVisualObj.rowList.crossAxes);
                        if (dataScale.warning) {
                            document.getElementById('showCopyBtn').checked = false;
                            this.copyVisualObj = null;
                            this.dragObjectIndex = null;
                            alert(dataScale.msg+"\n복사할 수 없습니다.");
                            return;
                        }
                    }
                    this.copyVisualObj.optionName.forEach(e => e.act = true);
                    newObj = {
                        name            : 'Table' // table or chart 옵션 구분자
                        ,show           : true
                        ,optionName     : this.copyVisualObj.optionName
                        ,size           : this.copyVisualObj.size
                        ,showBlank      : true
                        ,M1Active       : false
                        ,crossAxesLength: this.copyVisualObj.crossAxesLength
                        ,crossCalc: {
                            isPrice   : this.copyVisualObj.crossCalc.isPrice,
                            priceUnit : this.copyVisualObj.crossCalc.priceUnit
                        }
                        ,rowList: {
                            itemLen   : this.copyVisualObj.rowList.itemLen,
                            crossAxes : this.copyVisualObj.rowList.crossAxes
                        }
                        ,columnList: { itemLen : 0, crossAxes : [] }
                        ,relation  : this.copyVisualObj.relation
                    };
                } 
            } else if(typeToReplace === 'Chart') { // 객체 복사 --> chart로 변형
                if (isChart) { // chart --> chart로 변형
                    newObj = this.copyVisualObj;
                } else if (isTable) { // table --> chart로 변형
                    this.copyVisualObj.rowList.crossAxes
                        .push(
                            ...this.copyVisualObj
                            .columnList
                            .crossAxes.splice(0)
                        );
                    this.changeItemNameANDCounting(this.copyVisualObj); 
                    // 항목 개수가 일정량 초과했는지 판별하는 로직
                    let dataScale = this.expectedDataSize(this.copyVisualObj.rowList.crossAxes)
                    if (dataScale.warning) {
                        document.getElementById('showCopyBtn').checked = false;
                        this.copyVisualObj = null;
                        alert(dataScale.msg+"\n복사할 수 없습니다.");
                        return;
                    }
                    newObj = {
                        name         : 'Chart',
                        show         : true,
                        optionName   : this.copyVisualObj.optionName,
                        size         : this.copyVisualObj.size,
                        title: {
                            main:{text:"", code:[]},
                            sub :{text:"", code:[]}
                        },
                        chartType      : '1', 
                        emphasize      : true, 
                        verticalSplit  : false, // 마지막 항목 가로or세로로 나누기
                        details        : _details.slice(),
                        crossAxesLength: this.copyVisualObj.crossAxesLength,
                        crossCalc: {
                            isPrice   : this.copyVisualObj.crossCalc.isPrice,
                            priceUnit : this.copyVisualObj.crossCalc.priceUnit
                        },
                        rowList: {
                            itemLen   : this.copyVisualObj.rowList.itemLen,
                            crossAxes : this.copyVisualObj.rowList.crossAxes, 
                            lastChartOptionIndex : 0,
                        }, 
                        columnList: { itemLen: 0, crossAxes: [] },
                        relation  : this.copyVisualObj.relation
                    };
                } 

            } else { // 텍스트
                if (typeToReplace === 'Text' && isText) {
                    newObj = this.copyVisualObj;
                } 
            }
            if (this.optionPos.std === "top") {
                this.tableOrChart.unshift(newObj);
            } if (this.optionPos.std === "bottom") {
                this.tableOrChart.push(newObj);
            } else if (this.optionPos.std === "below") {
                this.tableOrChart.splice(this.optionPos.index, 0, newObj);
            }
            document.getElementById('showCopyBtn').checked = false;
            this.chartOptionController(this.tableOrChart[this.tableOrChart.length-1]);
            this.reRenWholeObject();
            this.$statConfig.bodyScrolling(true);
            this.copyVisualObj = null;
        },// copyTableOrChart




        addTableOrChart(name) { 
            if (this.TEMPLATE_.seq === undefined) { 
                alert('템플릿을 추가해주세요 ("추가" 버튼 클릭)'); return ;
            }
            let [cnt, rowList] = this.crossOptionInit();
            let _size = this.initSize();
            let _sizeT = JSON.parse(JSON.stringify(_size.table));
            let _sizeC = JSON.parse(JSON.stringify(_size.chart));
            let _details = this.crossChartDetailsOptionInit("1").slice(); // 차트 상세옵션 info

            // 공통 옵션 목록
            let commonOption = {
                show : true // 옵션 표시 o r감추기
                ,optionName      : [
                    {name:'',act:true}
                    ,{name:'',act:true}
                    ,{name:'',act:true}
                    ,{name:'',act:true}
                ]
                ,crossAxesLength : cnt
                ,crossCalc       : { isPrice: false, priceUnit: 1 }
                ,size            : _sizeT,
                // rowList[crossAxes] --> {name, val, ..etc}
                rowList          : { itemLen: cnt, crossAxes: rowList, lastChartOptionIndex: 0 },
                columnList       : { itemLen: 0, crossAxes: [] },
                relation         : { align: 'align-items-left', linebreak: true }
            };
            // 아래는 이름(commonOption) 좀 바꿔줘야 할 것 같은데...
            if (name === 'Table') {
                commonOption.name = "Table";
                commonOption.showBlank = true;
                commonOption.M1Active = false;
                this.tableOrChart.push(commonOption);
            } else if (name === 'Chart') {
                commonOption.name = "Chart";
                commonOption.size = _sizeC;
                commonOption.title = {};
                commonOption.title.main = {};
                commonOption.title.sub = {};
                commonOption.title.main.text = "#{제목}#"; // 제목
                commonOption.title.sub.text = "";  // 부제목
                commonOption.chartType = "1";
                // commonOption.emphasize = true;
                commonOption.verticalSplit = false;
                commonOption.details = _details;
                this.tableOrChart.push(commonOption);
            } else {
                this.tableOrChart.push({
                    name: 'Text',
                    show: true,
                    charcater: '설정',
                    value: {text:"", code:[]},
                    fontSize: 18,
                    fontColor: '#000000',
                    fontFamily: 'none',
                    fontStyle: 'normal', // normal, oblique, italic, inherit
                    fontWeight: 'bold', // normal, bold, lighter, bolder, 100~900
                    fontLetterSpacing: 1, // px
                    //fontLineHeight: null, // % or px
                    fontTextDecoration: 'none', // overline, underline, line-through, underline overline
                    //fontTextShadow: null, // 가로px 세로px, 흐림의 크기 그림자색 (흐림의 크기는 없어도 됨)
                    position: 'left', // left, center, right
                    size : _sizeT,
                    relation: { align: 'align-items-left', linebreak: true }
                });
            }
            commonOption = null;
            this.TEMPLATE_.config.tcObject 
                = JSON.parse(JSON.stringify(this.tableOrChart));
        }, // addTableOrChart

        /**
         * @description
         *  It is a function that determines the chart type
         *  Param type is Chart type(bar, line, pie)
         * @param {string} type
         * @returns object
         */
        crossChartDetailsOptionInit(type) {
            let chartDetails = [];
            // index 0
            chartDetails.push({name:'배경', display: true, background: true,
                                color:'#ffffff', outlineFlag:false, outlineThickness:2, 
                                outlineColor: '#000000', outlineLength:5, outlineSpace:5,
                                legendFlag: true, labelInsteadOfLegend: false});
            // index 1
            chartDetails.push({name:'막대', display: false, bar:false, 
                                emphasize:false, /*delayAnimation:false,*/ radiusFlag:false,
                                radiusValue:20, date12:false });
            // index 2
            chartDetails.push({ name:'선', display: false, line: false, 
                                pointStyle:'circle', pointBorderColor:'#000000', pointBorderWidth: 2,
                                pointRadius: 7, pointRotation: 0, mouseHover:false, mouseHoverSize:12,
                                mouseHoverBorderWidth: 1, /*mouseHoverBGColor: 'yellow',*/ mouseHoverBorderColor: 'blue',
                                stack: false, isFill: false, showLine: true 
            });
            // index 3
            chartDetails.push({name:'파이', display: false, pie:false, 
                                MouseHoverEvent: false, doughnutFlag: false, doughnutHoleSize: '30' });
            // index 4
            chartDetails.push({
                name:'툴 팁', display: true, tooltip: true
                // 상단 텍스트                                        
                ,titleColor: '#ffffff'      /* 색깔 string   */
                ,titleFontStyle: 'normal'
                ,titleFontWeight: 'bold'    /* 스타일 string */
                ,titleAlign: 'left'         /* 정렬 string   */       
                ,titleMarginBottom: 6       /* 바닥 간격 int */
                // 중간 텍스트  
                ,bodyColor:'#ffffff' 
                ,bodyFontStyle: 'normal'   
                ,bodyFontWeight: 'bold'
                // 상자
                ,padding: 6      // tooltip 내부 int 
                ,caretPadding: 2 // 그래프와 tooltip의 간격 int
                ,caretSize: 5    // 화살표 사이즈 int 
                ,cornerRadius: 6 // tooltip 외곽 굴곡 int
                // ,multiKeyBackground: '#000000'  // multi tooltip일 경우 배경색상 설정 string
                ,boxWidth: 13         // tooltip 안 색상박스의 넓이 int
                ,boxHeight: 13        // tooltip 안 색상박스의 높이 int 
                ,boxPadding: 10       // tooltip 안 색상박스과 텍스트의 간격 int
                ,borderColor: '#000000' // 윤곽선 색 string
                ,borderWidth: 1       // 윤곽선 두께 int
                ,rtl: false // tooltip 내부의 텍스트의 시작 위치 (right to left)
                ,interaction: false //  nearest, average
            });
            // index 5
            chartDetails.push({ name:'Y 라벨', display: false, yLabel: false,
                                labelColor: '#000000', labelWeight: 'bold', labelSize: 13,
                                gridFlag:false, gridMax: 1000, gridMin: 0, gridStep: 1 });
            // index 6
            chartDetails.push({name:'X 라벨', display: false, xLabel: false,
                                labelColor: '#000000', labelWeight: 'bold', labelSize: 13, 
                                gridFlag:false, gridMax: 1000, gridMin: 0, gridStep: 1 });
            // index 7
            chartDetails.push({name:'합 산', display: false, sum: false, });
            // index 8
            chartDetails.push({chartType:type});
            /* ------------------------------------------------------------------------------------- */
            if (type === '1') {
                // background
                chartDetails[1].bar = true;chartDetails[1].display = true;
                // tooltip
                chartDetails[5].yLabel = true;chartDetails[5].display = true;
            } else if (type === '2') {
                // background
                chartDetails[1].bar = true; chartDetails[1].display = true;
                // tooltip
                chartDetails[6].xLabel = true; chartDetails[6].display = true;
            } else if (type === '3') {
                // background
                chartDetails[2].line = true; chartDetails[2].display = true;
                // tooltip
                chartDetails[5].yLabel = true; chartDetails[5].display = true;
                chartDetails[7].sum = true; chartDetails[7].display = true;
            } else if (type === '4') {
                // background
                chartDetails[3].pie = true; chartDetails[3].display = true;
                // tooltip
            }
            return chartDetails;
        }, // crossChartDetailsOptionInit

        crossOptionInit() {
            let itemValue = [];
            ["0","0","0","0"].forEach(e => { 
                itemValue.push({
                    'name': '', 'val': e 
                    // used only in Chart
                    ,'useTheOption':true 
                    ,'chartItemOption':{'name': '', 'labelColor':'#000000', 'labelWeight':'bold'
                    , 'labelSize':15, 'gridThickness':1, 'gridColor': '#000000'} });
            });
            return [0, itemValue];
        },

        initSize() {
            return {
                table: {"voWidth":1860, "voHeight":0, "isPixel":true},
                chart: {"voWidth":1860, "voHeight":450, "isPixel":true}
            }
        },

        // 차트: [제목], [부제목], [텍스트 옵션 객체] 텍스트 코드화 하기
        classToText(section) {
            let P = document.querySelector(section);
            let answer = { text : P.value };
            return answer;
        },

        fullTextObjectCoding() {
            const p =  document.querySelectorAll('.groupT .groupT-text');
            let RTC = null;
            let idx = 0;
            for (const [k, v] of Object.entries(p)) {
                idx = Number(v.className.slice(-1));
                RTC = this.classToText('.'+v.className.split(' ').join('.'));
                this.tableOrChart[idx].value = JSON.parse(JSON.stringify(RTC));
            }
            this.textkey = this.textkey > 100 ? 1 : this.textkey++;
        },

        concatTemplateData() {
            if (typeof this.TEMPLATE_.config == 'string') this.TEMPLATE_.config = {};
            this.TEMPLATE_.config.tcObject = this.tableOrChart;
        },

        search() {
            this.fullTextObjectCoding();
            this.concatTemplateData();
            this.$emit("SearchTemplate", this.TEMPLATE_.config);
        },
            

        /* 차트 옵션 저장하기 */
        saveOption(d) {
            if (this.setKeyword) { 
                let tor = this.tableOrChart[this.TCIndex]; 
                const RTC = this.classToText('.keywordContent');
                if (!RTC) {alert("키워드 설정이 끝나지 않았습니다."); return ;}
                switch(d) {
                    case "T": tor.title.main = RTC; break;
                    case "ST": tor.title.sub = RTC; break;
                    case "TK": tor.value = RTC; break;
                    default: console.error("데이터 갱신 중.. 오류"); break;
                }
            } else if(this.setItemOption) {
                this.tableOrChart[this.TCIndex]
                    .rowList
                    .crossAxes[this.IOIndex]
                    .chartItemOption = this.setItemOption;
            } else if (this.setDetails) {
                this.tableOrChart[this.TCIndex].details 
                    = this.setDetails;

            } else if (this.setText) {
                this.tableOrChart[this.TCIndex] = this.setText;

            } else if (this.setPosition) { 
                this.setPosition.forEach((voo,idx) => {
                    this.tableOrChart[idx].relation = voo.relation;
                    this.tableOrChart[idx].size = voo.size;
                });
                this.minimap = false;
            }
            this.dialog_close();
            this.reRenTextObject();
        },

        /* 모달창 닫기 */
        dialog_close() {
            this.$statConfig.bodyScrolling(true);
            this.setKeyword = null;
            this.setItemOption = null;
            this.setDetails = null;
            this.setText = null;
            this.setPosition = null;
            this.miniComponent = null;
        },

        designChartAxis() {
            return (
                this.tableOrChart[this.TCIndex].chartType !== '3' 
                && this.tableOrChart[this.TCIndex].rowList.itemLen > 2
                && (
                    this.tableOrChart[this.TCIndex]
                        .rowList.lastChartOptionIndex !== this.IOIndex 
                    || !this.tableOrChart[this.TCIndex].verticalSplit
                )
            );
        },

        showUnusedEvalItem() {
            let rtn = false;
            if (this.getConfigEval && this.getConfigEval['policy'] && this.getConfigEval['policy']['NU']) {
                rtn = (this.getConfigEval['policy']['NU']['value'] === 'Y');
            }
            return rtn;
        },



        /**
         * @description : 옵션을 리렌더링 해준다.
         */
        reRenLine() {
            this.renderLine = this.renderLine > 100 ? 0 : this.renderLine+1
        },
        reRenWholeObject() {
            this.renderWhole = this.renderWhole > 100 ? 0 : this.renderWhole+1
        },
        reRenTextObject() {
            this.textObjectRen = this.textObjectRen > 100 ? 0 : this.textObjectRen+1;
        },
        tempRendering() {
            this.temListRen = this.temListRen > 100 ? 0 : this.temListRen +1;
        },
        reRenTextKeyword() {
            this.renderKeyword = this.renderKeyword > 100 ? 0 : this.renderKeyword +1;
        },





        /********************************* 키워드-적용 로직 *********************************/
        keywordDes(keyName) {
            return this.$keywordSet[this.keywordCode][keyName];
        },

        //현재 커서가 위치한 곳에 키워드를 생성한다.
        insertKeyword(elm){ 
            const content = document.querySelector('.keywordContent');
			const start = content.selectionStart;
			const end = content.selectionEnd;
			const value = content.value;
			const keyword = elm.target.innerText;
			this.setKeyword.text = value.substring(0, start) + keyword + value.substring(end);
            this.renderKeyword = this.renderKeyword > 100 ? 1 : this.renderKeyword+1;
			content.selectionStart = content.selectionEnd = start + keyword.length;
			let modal = document.querySelector('#trans-keyword-modal');
			modal.style.display = 'none';
        },

        //입력된 키워드 클릭시 변경 가능한 키워드 목록 modal 열기 ***
        keywordClick(e){ 
            this.keywordCode = e.target ? e.target.dataset.code : e.dataset.code;
            let modal = document.querySelector('#trans-keyword-modal main');
            
            modal.firstElementChild.innerText = this.$keywordSet[this.keywordCode+'_DefName'];
            modal.firstElementChild.dataset.code = this.keywordCode;

            let obj = this.$keywordSet[this.keywordCode];
            this.subKeywords = Object.keys(obj);
            
            if (e.target) {
                modal.parentElement.style.top = e.target.offsetTop + e.target.offsetHeight + 10 + 'px';
                modal.parentElement.style.left = e.target.offsetLeft + e.target.scrollWidth + 'px'; 
                modal.parentElement.style.display = 'block';
            } else {
                modal.parentElement.style.top = e.offsetTop + e.offsetHeight + 10 + 'px';
                modal.parentElement.style.left = e.offsetLeft + e.scrollWidth + 'px'; 
                modal.parentElement.style.display = 'block';
            }
        },

        keywordCover(e) {
            const content = e.currentTarget;
			const value = content.value;
            setTimeout(() => {
                let start = content.selectionStart;
                let end = content.selectionEnd;
                let regex = /(#{[\d\wㄱ-힣]+}#)/g;
                let array1 = null;
                let i = 0;
                while((array1 = regex.exec(value)) !== null){
                    if( i++ === 0 && start < array1.index ){ return ; }
                    if(array1.index < start && regex.lastIndex > end){
                        content.selectionStart = start = array1.index;
                        content.selectionEnd = end = regex.lastIndex;
                        break;
                    }
                }
    
                let keyword = '';
                if( start !== end ){
                    if(start >= end) keyword = value.substring(end, start);
                    else keyword = value.substring(start, end);
                } 
                if(this.$keywordSet.keywordAllList[keyword] !== undefined){
                    this.keywordClick(this.$refs[this.$keywordSet.keywordAllList[keyword]]);
                } else {
                    let modal = document.querySelector('#trans-keyword-modal');
                    modal.style.display = 'none';
                }
            }, 10);
        },

        keyBlock(e) {
            if ([13].indexOf(e.keyCode) != -1) {	//enter, end, home
                e.preventDefault();
                return false;
            }
        },

        


    } // methods
}
</script>

<style scoped>
    /* 가장 큰 테두리 */
    .object-field {
        display: flex;
        flex-direction: row;
        flex: 1;
    }
    .object-list {
        width: 100%;
        height: 395px;
        background-color: #f5f5f5;
        resize: vertical;
        border: 1px solid #9b9b9b;
        overflow: auto;
        padding: 5px 8px 15px 15px;
        box-shadow: rgb(124 124 124) 0px 0px 3px 0px;
        z-index: 1;
    }
    /* 스크롤바 디자인[start] */
    .object-list::-webkit-scrollbar {
        width: 10px;
    }
    .object-list::-webkit-scrollbar-thumb {
        background-color: #2f3542;
        border-radius: 10px;
        background-clip: padding-box;
        border: 2px solid transparent;
    }
    .object-list::-webkit-scrollbar-track {
        background-color: rgb(163, 163, 163);
        border-radius: 10px;
        box-shadow: inset 0px 0px 5px white;
    }
    /* 스크롤바 디자인[end] */

    


    /* 시각객체 옵션 추가하기 */
    .func-btn {
        display: flex;
        flex-direction: column;
        margin: 0px 0px 0px 10px;
    }
    .addObject {
        width: auto; 
        height: 260px; 
        display: flex;
        flex-direction: column;
        border: 3px ridge rgba(173,173,173,0.75); 
        margin: -5px 0px 10px 0px;
        padding: 0px 0px 0px 0px;
        border-radius: 5px;
    }
    .addObject img {
        width: 100%;
        height: 54px;
        object-fit: contain;
        margin: 10px 0;
        cursor: pointer;
    }
    fieldset > legend.addOption {
        background-color: azure;
        text-align: center;
        font-weight: 700;
        width: 60px;
        height: 24px;
        line-height: 24px;
        border: 1px solid;
        border-radius: 5px;
    }
    .save-btn, .search-btn {
        width: 93px;
        height: 35px;
        margin: 4px auto;
        line-height: 22px;
        font-size: 12px;
        font-weight: 700;
        background: #f2f2f2;
        border: 1px solid #aeaeae;
        border-radius: 5px;
        cursor: pointer;
    }
    .save-btn {
        border: 1px solid #3678b3;
        background-color: #5ca5e6;
        color: white;
    }
    





    /* 항목(교차-기준)을 비롯한 기타 옵션들의 css */
    .optionList {
        width: 720px; 
        height:auto; 
        border: 6px ridge rgba(173,173,173,0.75); 
        margin: 10px 0px 10px 0px;
        padding: 0px 0px 0px 0px;
        background-color: #fff;
    }
    .cross_std {
        display: flex;
        width: auto;
        height: 192px;
        margin: 0px 0px 0px 5px;
        padding: 0px 0px 0px 0px;
    }
    .cross_std_frame {
        display: flex;
        padding: 0px 0px 0px 0px;
        /* this height은 .cross_std에서 수정하면 된다. */
        width: auto;
        height: 100%;
        margin: 0 10px 0 0;
    }

    aside.sideOption { 
        display: flex;
        flex: 1;
        align-self: center;
    }
    aside.sideOption > table {
        width: 98%;
        background: #e4ebea;
        border-collapse: collapse;
        border-radius: 5px;
    }
    aside.sideOption > table > tr > th {
        text-align: right;
    }
    aside.sideOption > table > tr > th
    ,aside.sideOption > table > tr > td {
        padding: 5px;

    }
    aside.sideOption > table > tr:not(:last-child) > th
    ,aside.sideOption > table > tr:not(:last-child) > td {
        border-bottom: 2px solid #ffffff;
    }
    aside.sideOption td input { 
        width: 100%;
    }
    



    .inner {
        /*width: 80%;*/
        display: flex;
    }
    .exc {
        margin: 12px 0px 0px 25px;
        position: relative;
        bottom: 6px;
    }
    .line-style {
        position: relative;
        top: -6px;
    }
    .groupT {
        display: flex;
        width: auto;
        height: auto;
        margin: 16px 0px 18px 18px;
    }
    .groupT > div > textarea.groupT-text {
        width: 408px;
        height: 72px;
        padding: 10px 10px 10px 10px;
        margin: 0px 21px 0px 0px;
        resize: vertical;

        overflow-x: auto;
        overflow-y: auto;
        text-rendering: auto;
        color: fieldtext;
        border-width: 1px;
        border-style: solid;
        border-color: -internal-light-dark(rgb(118, 118, 118), rgb(133, 133, 133));
    }


    .sub_frame {
        border: solid 3px gray;
        border-radius: 11px;
        padding: 0px 10px 0px 10px;
        margin: 0px 12px 0px 0px;
    }
    /* 테이블/차트 항목 리스트 제목(라벨) */
    label.tableLabel-row-column {
        float: none;
        display: inline-block;
        width: 40px;
        height: 20px;
        background-color: #fff;
        text-align: center;
        color: #808080;
        font-weight: 600;

        position: relative;
        left: 37%;
        top: -12px;
    }
    /* 차트 항목 리스트 제목(라벨) 위치만 조정 */
    .chartLabel-item, .chartLabel-std, .chartLabel-line {
        float: none;
        display: inline-block;
        width: 68px;
        height: 20px;
        background-color: #fff;
        text-align: center;
        color: #808080; 
        font-weight: 600;
        margin: 0px 0px 2px 0px;

        position: relative;
        left: 32%;
    }
    div.tableOp {
        display: flex;
        flex-direction: column;
        height: auto;
        align-self: center;
    }
    div.tableOp > .tableOp-row, div.tableOp > .tableOp-column {
        width: 205px;
        height: auto;
        margin: 5px 17px;
    }
    div.tableOp > div.tableOp-row > div
        , div.tableOp > div.tableOp-column > div {
        margin-top: -10px;
        padding-bottom: 6px;
        width: 185px;
        height: auto;
    }

    .table-list, .chart-list {
        display: flex;
    }
    .table-list > p {
        margin: 0px 0px 0px 5px;
        color: #808080;
        font-weight: 600;
        font-size: 5px;
    }
    .table-list > select {
        width: 153px;
        height: auto;
    }

    .chart-list > p {
        margin: 0px 0px 0px 5px;
        color: #808080;
        font-weight: 600;
        font-size: 5px;
    }
    .chart-list > select {
        max-width: 141px;
        height: auto;
    }

    /* ========================================================================================================= */

    .showOption {
        padding: 0 10px;
        height: 26px;
        line-height: 22px;
        font-size: 12px;
        font-weight: bold;
        background: #f2f2f2;
        border: 1px #aeaeae solid;

        margin: 0px 0px 11px 0px;
    }

    div.chartOp {
        flex-direction: column;
        margin: 0px 15px 0px 0px;
    }
    div.chartOp > .chartOp-main {
        width: 220px;
        height: 121px;
        margin: 15px 0px 5px 0px;
    }

    .chartOp > div.chart-type {
        display: flex;
        margin: 5px 0px 0px 0px;
    }
    .chartOp > div.chart-type > span {
        float: left;
        width: 60px;
        font-size: 13px;
        color: #808080;
        font-weight: 600;
        /* padding-bottom: 10px; */
        line-height: 23px;
    }






    /* Line Chart에 한에서 적용됨(row). */
    div.chartOp > .chartLineOp-fir {
        width: 220px;
        height: auto;
        margin: 15px 0px 5px 0px;
    }
    /* Line Chart에 한에서 적용됨(column). */
    div.chartOp > .chartLineOp-sec {
        width: 220px;
        height: auto;
        margin: 10px 0px 0px 0px;
    }
    .translocation {
        height: auto;
        position: relative;
        top: -2px;
        margin: -11px 0px 0px 0px;
    }


    div.chartOp > .chartOp-sub {
        width: 220px;
        height: 26px;
        margin: 0px 0px 0px 0px;
        padding: 0px 0px 0px 18px;
    }

    /* .chartOp-main > div > .cross-item > span
        , .chartLineOp-fir > div > .cross-item > span
        , .chartLineOp-sec > div > .cross-item > span { */
    .cross-item > span { flex-grow: 1; }
    .dragArea {
        width: 20px;
        height: 20px;
        margin: 0px 0px 0px 5px;
        padding: 0px 0px 0px 0px;
        background: url(../../../assets/images/drag.png);
        background-size: cover;
    }

    #axis1, #axis2, #axis3, #axis4 {
        width: 132px;
        margin: 0px 0px 13px 0px;
    }




    /* ----------------------차트 형태---------------------- */
    .src_chart_radar {
        width: 40px;
        height: 24px;
        margin: 0;
        border: 1px #aaa solid;
        border-left: 0;
        background-color: #E6E6E6;
        /* text-indent: -9999px; */
    }
    .src_chart_radar.on {
        background-color: #fff;
    }
    .src_chart_radar > img {
        width: 71%;
        height: 88%;
        padding: 3px 0px 0px 12px;
    }



    /* ---------------------차트 옵션--------------------- */
    /* common */
    div#chartFormatting{
        float: left;
        width: 1235px;
        height: 225px;
        margin: 8px 0px 0px 0px;
    }
    div.chartOption1, div.chartOption2, div.chartOption3, div.chartOption4 {
        width: auto;
    }
    .line1 {
        margin: 0px;
        padding: 0px;
        position: relative;
        top: 16px;
        height: 81px;
        border: solid 0.5px #e6e6e6;
    }
    .line2 {
        width: 94%;
        border: solid 0.5px #e6e6e6;
    }



    /* fir */ 
    .fir {
        display: flex;
        margin: 0px 0px 13px 0px;
    }
    /* chartOption 1 */
    div#chartFormatting > .fir > div.chartOption1 {
        margin: 0px 0px 0px 0px;
        padding: 10px 0px 0px 0px;
    }
    div#chartFormatting > .fir > div.chartOption1 > p {
        text-align: right;
        display: inline-block;
    }
    #chartFormatting > .fir > div.chartOption1 > p:nth-child(1) {
        width: 200px;
    }
    #chartFormatting > .fir > div.chartOption1 > p:nth-child(2) {
        width: 184px;
    }
    #chartFormatting > .fir > div.chartOption1 > p:nth-child(3) {
        width: 80px;
    }
    #chartFormatting > .fir > div.chartOption1 > p:nth-child(4) {
        width: 108px;
    }
    #chartFormatting > .fir > div.chartOption1 > p:nth-child(5) {
        width: 1px;
    }
    div#chartFormatting > .fir > div.chartOption1 > div {
        margin: 12px 20px 0px 0px;
    }
    div#chartFormatting > .fir > div.chartOption1 > div > label {
        width: 80px;
        font-size: 13px;
        color: #808080;
        font-weight: 600;
    }
    div#chartFormatting > .fir > div.chartOption1 > div > label + input:not([type='number']) {
        width: 208px;
    }
    div#chartFormatting > .fir > div.chartOption1 > div > input[type='number'] {
        margin: 0px 0px 0px 11px;
    }
    button.insertImg {
        width: 20px;
        height: 20px;
        margin: 0px 0px 0px 5px;
    }
    div#chartFormatting > .fir > div.chartOption1 > div > select {
        margin: 0px 0px 0px 10px;
        text-align: right;
    }



    /* chartOption 2 */
    input.xAxesLH, input.xAxesPadding {
        width: 66px;
    }
    div#chartFormatting > .fir > div.chartOption2 {
        margin: 0px 0px 0px 50px;
        padding: 10px 0px 0px 0px;
    }
    div#chartFormatting > .fir > div.chartOption2 > p:nth-child(1) {
        display: inline-block; width: 109px; text-align: right;
    }
    div#chartFormatting > .fir > div.chartOption2 > p:nth-child(2) {
        display: inline-block; width: 83px; text-align: right;
    }
    div#chartFormatting > .fir > div.chartOption2 > p:nth-child(3) {
        display: inline-block; width: 147px; text-align: right;
    }
    div#chartFormatting > .fir > div.chartOption2 > p:nth-child(4) {
        display: inline-block; width: 69px; text-align: right;
    }
    div#chartFormatting > .fir > div.chartOption2 > div {
        display: flex;
        margin: 12px 20px 0px 0px;
    }
    div#chartFormatting > .fir > div.chartOption2 > div > p {
        width: 30px;
        font-size: 13px;
        color: #808080;
        font-weight: 600;
    }
    div#chartFormatting > .fir > div.chartOption2 > div > select {
        margin: 0px 0px 0px 11px;
        text-align: right;
    }
    div#chartFormatting > .fir > div.chartOption2 > div > input[type=number] {
        margin: 0px 0px 0px 11px;
    }



    /* sec */
    .sec {
        width: auto;
        height: auto;
        display: flex;
        margin: 5px 0px 0px 0px;
    }
    /* chartOption 3 */
    div#chartFormatting > .sec > div.chartOption3 {
        margin: 0px 0px 0px 0px;
        padding: 30px 0px 0px 0px;
        display: flex;

    }
    div.chartOption3 > p {
        display: inline-block;
        margin: 0px 0px 0px 0px;
        width: 63px;
        font-size: 13px;
        color: #808080;
        font-weight: 600;
    }

    fieldset > legend.option-title {
        font-size: 15px;
        font-weight: bold;
        padding: 0 10px 0 10px;
        border: 1px solid black;
        border-radius: 3px;
        text-align: center;
    }



    /* chartOption 4 */
    div#chartFormatting > .sec > div.chartOption4 {
        padding: 10px 0px 0px 0px;
        margin: 0px 0px 0px 23px;
        display: flex;
    }
    div#chartFormatting > .sec > div.chartOption4 > div > p {
        padding: 21px 0px 0px 0px;
        font-size: 13px;
        color: #808080;
        font-weight: 600;
    }
    #chartFormatting > .sec > div.chartOption4 > div:nth-child(2) {
        margin: -7px 0px 0px 8px;
    }
    #chartFormatting > div > div.chartOption4 > div:nth-child(2) > div > p {
        margin: 5px 0px 5px 0px;
    }
    #chartFormatting > div.sec > div.chartOption4 > div > div > #fontSize6 {
        margin: 10px 0px 0px 0px;
    }


    /* 시각객체 옵션 추가하기
    
    
    */



    input[type="checkbox"]:checked + .viewBox {
        background: url(/img/ico_pre.467a0115.png) -240px 0 no-repeat;
    }
    input[type="checkbox"] + .viewBox {
        width: 100px;
        height: 14px;
        background: url(/img/ico_pre.467a0115.png) -210px 0 no-repeat;
        cursor: pointer;
        float: left;
        margin: 3px;
    }
    input[type="checkbox"]:checked + .text-deco {
        text-decoration: none;
        color: black;
    }
    input[type="checkbox"] + .text-deco {
        display: inline-block;
        margin: 0px 10px 0px 0px;
        text-decoration: line-through;
        cursor: pointer;
        color: red;
        font-weight: 700;
    }
    input[type="checkbox"] + .text-deco + span {
        float: left;
        margin: 0px 10px 0px 0px;
    }
    input[type="checkbox"] + .text-deco + span::after {
        content: '/';
        color: black !important;
    }


    .cross-item { display: flex; cursor: pointer; }
    .cross-item > span {
        display: inline-block;
        width: 116px;
        font-size: 13px;
        font-weight: bold;
        line-height: 23px;
    }
    .cross-item > input[type='button'] {
        width: 22px;
        height: 22px;
        margin: 0px 0px 0px 7px;
        
        background-image: url('../../../assets/images/rotation_lock.png');
        background-size: cover;
        cursor:pointer;
    }

    .tableOp .cross-item {
        margin: 0px 0px 5px 0px;
        padding: 0px 0px 0px 0px;
    }
    .chartOp .cross-item {
        margin: 0px 0px 4px 0px;
        padding: 0px 0px 0px 0px;
    }

    .exe_btn {
        width: 100%;
        height: 55px;
        padding: 10px 0px 0px 0px;
    }
    .exe_btn #apply_btn {  
        height: 30px;
        margin: 0px 10px 0px 0px;
    }
    .exe_btn #spread_btn {
        height: 30px;
    }


    .strong { background-color:yellow; display:inline; font-weight: bold;}
    .pref {
        background-image: url('../../../assets/images/preference.png');
        background-size: cover;
        cursor: pointer;
        display: inline-block;
        width: 20px;
        height: 20px;
        transform: translate(5px, 1px);
    }
    .non-pref {
        display: inline-block;
        width: 20px;
        height: 20px;
        margin: 1px 0px 0px 7px;
    }







    /* 모달창 css */
    .dialog, .tooltip > * {
        box-sizing: border-box;
    }
    .dialog__trigger, .dialog__action {
        border: 3px solid #333333;
        background: #f1f1f1;
        padding: 10px 20px;
        font-size: 1.1rem;
        text-transform: uppercase;
        display: block;
        -webkit-transition: all 150ms ease-out;
        transition: all 150ms ease-out;
        -webkit-transform: translateY(0px);
                transform: translateY(0px);
    }
    .dialog__trigger:hover, .dialog__trigger:focus, .dialog__action:hover, .dialog__action:focus {
        outline: 0;
        -webkit-transform: translateY(-5px);
                transform: translateY(-5px);
        -webkit-transition: all 100ms ease-in;
        transition: all 100ms ease-in;
        box-shadow: 0 5px 10px rgba(51, 51, 51, 0.4);
    }
    .dialog__trigger:active, .dialog__action:active {
        -webkit-transform: translateY(-3px);
                transform: translateY(-3px);
    }

    .dialog {
        display: none;
        z-index: 3;
        background: #f1f1f1;
        width: 1317px;
        height: 900px;
        position: fixed;
        top: 50%;
        left: 50%;
        padding: 15px 15px;
        box-shadow: 0 10px 30px rgba(51, 51, 51, 0.4);
        border: 3px solid #333333;
        opacity: 0;
        -webkit-transition: all 180ms ease-in;
        transition: all 180ms ease-in;
    }
    .tooltip {
        z-index: 3;
        background: #f1f1f1;
        width: 875px;
        position: absolute;
        left: calc(50% - 23%);
        top: 0;
        padding: 30px;
        box-shadow: 0 10px 30px rgba(51, 51, 51, 0.4);
        border: 3px solid #333333;
        display: none;
        opacity: 0;
        -webkit-transition: all 180ms ease-in;
        transition: all 180ms ease-in;
    }
    .dialog--active {
        display: inline-block;
        height: auto;
        opacity: 1;
        -webkit-transition: all 250ms ease-out;
        transition: all 250ms ease-out;
        transform: translate(-50%, -50%);
    }
    .dialog--active-text {
        display: inline-block;
        height: auto;
        opacity: 1;
        -webkit-transition: all 250ms ease-out;
        transition: all 250ms ease-out;
        transform: translate(-50%, -90%);
    }
    .dialog__close {
        font-size: 2rem;
        line-height: 2rem;
        position: absolute;
        right: 11px;
        top: 0px;
        cursor: pointer;
        padding: 15px;
        -webkit-transition: color 150ms ease;
        transition: color 150ms ease;
    }
    .dialog__close:hover {
        color: #E74C3C;
    }
    .dialog__title {
        font-size: 2rem;
        font-family: 'Slabo 27px', serif;
        font-weight: 100;
        margin: 0px 0px 15px 0px;
        padding: 0 0 7px 0;
        border-bottom: 2px solid #333333;
    }
    /* content */
    .dialog__content {
        font-size: 1.1rem;
        line-height: 2rem;
        display: flex;
        flex-wrap: wrap;
        gap: 2em;
    }
    .dialog__content > fieldset { display: flex; flex: 1; flex-wrap: wrap; }
    .dialog__content > fieldset > legend {
        text-align: start; font-size: 15px; font-weight: 900;
        border: 1px solid black; border-radius: 5px;
        padding: 0 10px; width: 100%; color: #fff; background-color: gray;
    }
    div.dialog-group { display: flex; flex: 1; border-radius: 5px; padding: 0 15px; 
        box-shadow: 2px 2px 10px 3px rgb(0 0 0 / 13%); }
    div.dialog-group.row { flex-direction: row; }
    div.dialog-group.col { flex-direction: column; }
    div.group.col { display: flex; flex-direction: column; }
    div.group.row { display: flex; flex-direction: row; }

    .dialog__content span {
        font-size: 13px;
        color: #616161;
        font-weight: 600;
    }
    .dialog__content input:not(.switch) {
        padding: 0px 10px 0px 0px;
        font-size: 15px;
        font-weight: bold;
        border: 2;
        border-radius: 5px;
        outline: none;
        padding-left: 10px;
        background-color: rgb(233, 233, 233);
        /* background-color: rgb(128 128 128); */
    } 
    .dialog .dialog__action { margin: 15px 0px 0px 0px; font-size: 1rem; }
    .modal-background:not(input#customTemplate:checked+label+div .modal-background) { display: inline-block; position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
        background-color: rgba(0, 0, 0, 0.3); z-index: 1; }
    input#customTemplate:checked+label+div .modal-background { display: inline-block; position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
        background-color: rgba(128, 128, 128, 0.5); z-index: 1; }
    .background-n, .background-n-n, .background-n-n2 { display: flex; flex-direction: row; width: auto; margin: 5px 0px 5px 0px; }
    .background-n > span { display: inline-block; width: 130px; margin: 0px 0px 0px 0px; }
    .background-n-n > span { display: inline-block; width: 110px; margin: 0px 0px 0px 20px; }
    .background-n-n > span:before { content: "\27A5\00a0"; }
    .background-n-n2 > span { display: inline-block; width: 150px; margin: 0px 0px 0px 20px; }
    .background-n-n2 > input { width: 180px; }
    .background-n-n2 > span:before { content: "\27A5\00a0"; }

    /* on off switch [Start] */
    .switch { position: absolute; appearance: none; -webkit-appearance: none; -moz-appearance: none; }
    .switch_label { position: relative; top: 3px; cursor: pointer; display: inline-block; width: 45px; height: 21px;
        background: #fff; border: 2px solid #c44; border-radius: 20px; transition: 0.2s; }
    .switch_label:hover { background: #efefef; }
    .onf_btn { position: absolute; top: 0px; left: 3px; display: inline-block; width: 17px; height: 17px; 
        border-radius: 20px; background: #c44; transition: 0.2s; }

    /* checking style */
    .switch:checked+.switch_label { background: #c44; border: 2px solid #c44; }
    .switch:checked+.switch_label:hover { background: #e55; }

    /* move */
    .switch:checked+.switch_label .onf_btn { left: 22px; background: #fff; box-shadow: 1px 2px 3px #00000020; }
    .tag-disabled { pointer-events: none; opacity: 0.4; }
    /* on off switch [End] */


    /* etc element */
    .miniDiv {
        padding: 0px 0px 0px 10px;
        margin: 10px 0;
        transform: translate(0px, -9px);
    }
    .miniDiv > span:nth-child(1) {
        font-size: 13px;
        color: #5c5b5b;
        font-weight: 900;
        margin: 0px 10px 0px 0px;
    }
    .maxi-btn {
        float: right;
        margin: 0px 25px 0px 0px; 
    }

    .obj-max { height: auto; }
    .obj-min { height: 55px; }


    /* modal-select */
    div.modal-select > select {
        /* Reset Select */
        appearance: none;
        outline: 0;
        border: 1;
        box-shadow: none;
        /* Personalize */
        flex: 1;
        padding: 0 1em;
        color: rgb(0, 0, 0);
        background-color: var(--darkgray);
        background-image: none;
        cursor: pointer;
        /* font */
        font-size: 15px;
        font-weight: bold;
        border-radius: 5px;
    }
    /* Remove IE arrow */
    div.modal-select > select::-ms-expand {
        display: none;
    }
    /* Custom Select wrapper */
    .modal-select  {
        position: relative;
        display: flex;
        width: 210px;
        height: 26px;
        border-radius: .25em;
        overflow: hidden;
    }
    /* Arrow */
    .modal-select::after {
        content: '\25BC';
        position: absolute;
        top: 0;
        right: 0;
        padding: 0px 10px 0px 10px;
        background-color: #34495e;
        transition: .25s all ease;
        pointer-events: none;
    }
    /* Transition */
    .modal-select:hover::after {
        color: #f39c12;
    }


</style>

