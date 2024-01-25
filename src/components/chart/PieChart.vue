<template>
  <div :id="'chartBox' + etc.index" class="chartBox">
    <div :class="'customTitle title-area'+etc.index"></div>
    <div :class="'customLegend legend' + etc.index"></div>
    <Pie
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
import { Pie } from 'vue-chartjs/legacy'

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)

export default {
  name: 'PieChart',
  components: {
    Pie
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
      default: 'pie-chart'
    },
    datasetIdKey: {
      type: String,
      default: 'label'
    },
    width: {
      type: Number,
      default: 400
    },
    height: {
      type: Number,
      default: 400
    },
    cssClasses: {
      default: '',
      type: String
    },
    styles: {
      type: Object,
      default: () => {}
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
      const SPAN_ST = document.createElement('span');
      
      if (this.etc.text.title.message || this.etc.text.title.message != '') {
        SPAN_T.textContent = this.etc.text.title.message;
        SPAN_T.style.color = this.etc.text.title.color;
        SPAN_T.style.fontWeight = this.etc.text.title.font.weight;
        SPAN_T.style.fontSize = this.etc.text.title.font.size;
        SPAN_T.style.margin = '0 0 10px 0';
        DIV.appendChild(SPAN_T);
      }

      if (this.etc.text.subtitle.message || this.etc.text.subtitle.message != '') {
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

        /** 처음 등장하는 범례만 등록 (중복 제외)
         * <ul>
         *   <li>
         *      <span>Color</span>
         *      <p>Text</p> 
         *   </li>
         * </ul>
         */
        if(flag) {
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
      try {
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
      } catch (e) {}
    });
  },
};
</script>
