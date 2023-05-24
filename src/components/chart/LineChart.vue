<template>
  <div :id="'chartBox' + etc.index" class="chartBox">
    <div :class="'customTitle title-area'+etc.index"></div>
    <div :class="'customLegend legend' + etc.index"></div>
    <LineChartGenerator
      :chart-options="chartOptions"
      :chart-data="chartData"
      :chart-id="chartId"
      :dataset-id-key="datasetIdKey"
      :plugins="plugins"
      :css-classes="cssClasses"
      :styles="styles"
      :width="width"
      :height="height"
    />
  </div>
</template>

<script>
import { Line as LineChartGenerator } from "vue-chartjs/legacy";

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement
);

export default {
  name: "LineChart",
  components: {
    LineChartGenerator,
  },

  props: {
    chartOptions: {
      type: Object,
      default: () => {}
    },
    chartData: {
      type: Object,
      default: () => {}
    },
    chartId: {
      type: String,
      default: "line-chart",
    },
    datasetIdKey: {
      type: String,
      default: "label",
    },
    width: {
      type: Number,
      default: 400,
    },
    height: {
      type: Number,
      default: 400,
    },
    cssClasses: {
      default: "",
      type: String,
    },
    styles: {
      type: Object,
      default: () => {},
    },
    plugins: {
      type: Array,
      default: () => []
    },
    etc: {
      type: Object,
      default: () => {}
    },
  }, // props

  data() {
    return {
      myChart: null,
    }
  },

  methods: {
    updateLegend(click) {
      const element = click.target.parentNode;
      element.classList.toggle('fade');
      this.myChart.update();
    },

    drawTitle() {
      const DIV = document.querySelector('.title-area' + this.etc.index);
      const SPAN_T = document.createElement('span');
      const SPAN_ST = this.etc.text.subtitle ? document.createElement('span') : null;

      SPAN_T.textContent = this.etc.text.title.message;
      SPAN_T.style.color = this.etc.text.title.color;
      SPAN_T.style.fontWeight = this.etc.text.title.font.weight;
      SPAN_T.style.fontSize = this.etc.text.title.font.size;
      SPAN_T.style.margin = '0 0 10px 0';
      DIV.appendChild(SPAN_T);

      if (SPAN_ST !== null) {
        SPAN_ST.textContent = this.etc.text.subtitle.message;
        SPAN_ST.style.color = this.etc.text.subtitle.color;
        SPAN_ST.style.fontWeight = this.etc.text.subtitle.font.weight;
        SPAN_ST.style.fontSize = this.etc.text.subtitle.font.size;
        SPAN_ST.style.margin = '0 0 10px 0';
        DIV.appendChild(SPAN_ST);
      }
    },

    drawLegend() {
      // get the selected location
      let classN = '.legend' + this.etc.index;
      const div = document.querySelector(classN);
      // create array ul
      let ul = [document.createElement('ul')];
      // save index
      let fadeGroup = {};
      // Avoid duplication
      let flag = false;
      // line break
      let lineBreak = 0, ulIdx = 0;

      this.myChart.legend.legendItems.forEach((dataset, index) => {
        const text = dataset.text;
        const datasetIndex = dataset.datasetIndex;
        const bgColor = dataset.fillStyle;
        const bColor = dataset.strokeStyle;
        
        // create li, p, span, Text
        const li = document.createElement('li');
        const p = document.createElement('p');
        const span = document.createElement('span');
        span.style.borderColor = bColor;
        span.style.backgroundColor = bgColor;
        const textNode = document.createTextNode(text);
        
        if (!fadeGroup[text]) {
          fadeGroup[text] = [], flag = true;
          fadeGroup[text].push(datasetIndex);
        } else {
          fadeGroup[text].push(datasetIndex);
          flag = false;
        } 

        li.onclick = (click) => {
          const isHidden = !this.myChart.isDatasetVisible(datasetIndex);
          this.myChart.setDatasetVisibility(datasetIndex, isHidden);
          this.updateLegend(click);
        }
          
        // li.onclick = (click) => {
        //   for (let [key, value] of Object.entries(fadeGroup)) {
        //     if (text === key) {
        //       for (let i = 0; i < value.length; i++) { console.log('key, value: ', key, value[i]);
        //         // visible=true -> hedden=false
        //         const isHidden = !this.myChart.isDatasetVisible(value[i]);
        //         this.myChart.setDatasetVisibility(value[i], isHidden);
        //       } // for-array
        //     } // if-selected legend
        //   } // for-object
        //   this.updateLegend(click);
        // } // onclick event

        /** 처음 등장하는 범례만 등록 (중복 제외)
         * <ul>
         *   <li>
         *      <span>Color</span>
         *      <p>Text</p> 
         *   </li>
         * </ul>
         */
        if (flag) { 
          // 범례가 한 줄에 10개 이상일 경우
          if (lineBreak !== 0 && lineBreak%10 === 0) {
            ul.push(document.createElement('ul'));
            ulIdx++;
          }
          lineBreak++;
          ul[ulIdx].appendChild(li);
          li.appendChild(span);
          li.appendChild(p);
          p.appendChild(textNode);
        }
      }); // myChart forEach

      // ul 요소들을 div에 부착
      for (let i = 0; i < ul.length; i++) {
        div.appendChild(ul[i]);
      }
    },
  },// methods

  mounted() {
    // 자식 컴포넌트까지 완료된 후..
    this.$nextTick(function() {
      // chart object
      this.myChart = ChartJS.getChart(this.chartId);
      this.drawTitle();
      if(this.etc.legend) this.drawLegend();
      let chartDiv = document.getElementById('chartBox' + this.etc.index);
      if (chartDiv) {
        chartDiv.style.width = this.etc.size.width; // 부모
        chartDiv.children[2].style.height
         = this.etc.size.height == '0px' ? 'auto' : this.etc.size.height; // 자식
      }
    });
  },
};
</script>