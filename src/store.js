/* eslint-disable no-console */
import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);
const phpApi = '/' + (
  process.env.VUE_APP_USE_SERVE_PHP === undefined
      ? process.env.VUE_APP_PHP_SERVE_CONTEXT
      : 'phpApi'
);

const newDate = new Date();
const statState = () => ({
  searchOpen: true, // 통계 검색 출력 여부우
  searchTotalItemOpen: true, // 통계 검색 출력 여부
  dateType: 1, // 기간 설정   / 연간 /월간  / 지정
  selectYear: newDate.getFullYear(), //연간 날짜
  selectMonth: newDate.getMonth() + 1, // 월간 날짜
  dateRange: { // 지정 날짜 범위
    startDate: new Date(new Date().getFullYear(), 0, 1), //시작일
    endDate: new Date(new Date().getFullYear(), 11, 31)//종료일
  },
  searchRange: ['0'], // 검색 범위
  searchOption: 1,  // 검색 옵션 제목+내용, 제목, 내용
  keywordOption: 1, // 키워드 옵션 and / or
  keyword: '', // 키워드
  notKeyword: '', // 배제어
  notKeywordOption: 1, //배제어 옵션 and / or
  searchCriteria: { // 기사 조건
    includeHideArticles: true,  //기사 감추기
    includingNot: true,  // 평가 제외 기사 포함
    includingPrivate: true // 비공개 스크랩 포함
  },
  groupIsCategory: true, // 매체 선택 옵션 분류||유형
  mediaSelectionOptions: [], // 매체 선택 옵션 분류||유형 groupId
  evalSelectionMedium: {}, // 평가탭 선택 매체
  statSelectionMedium: {}, // 통계탭 선택 매체
  evaluationItem0: [], // 자동평가
  evaluationItem1: [], // 평가 1
  evaluationItem2: [], // 평가 2
  evaluation0Options: 2, // 자동평가 옵션 and1 / or2
  evaluation2Options: 2, // 평가 2 옵션 and1 / or2
  hideSettingsValues: false, // 가치 산출기준 출력 여부
  mediaCategoryOldList: [], // 매체->category(3.5기준-신문)
  mediaCategoryList: [], // 매체->category(분류)
  mediaTypeList: [], // 매체->type(유형)
  chartExportName: {
    0: '구분류별'
    , 1: '분류별'
    , 2: '유형별'
    , 3: '자동평가별'
    , 4: '수동평가별'
    , 5: '평가별'
    , 6: '매체별'
    , 7: '교차분석'
  },
  mediaChartGroupByName: false,
  mediaChartGroupByCode: false,
  crossCalcValue: 0, // 교차=원본-0|건수-1|가치-2
  crossXAxis: 0, // 교차-평가기준(x축)
  crossYAxis: 0, // 교차-평가기준(y축)
  crossZAxis: 0, // 교차-평가기준(z축)
  crossRAxis: 0, // 교차-평가기준(r축)
  crossColCount: 0,
  crossAxesLength: 0, // 교차-평가기준-실제길이
  crossAxes: [],      // 교차-평가기준
  numberScale: 1,     // 교차|가치-금액단위
  tableCnt: 1,

  imgDownloadInfo: false,
  searchList: {data: [], exixt: false},
  statValue: null,
  templateList: [],
  reportList: [],
  tabList: [],

  template: null,
  report: null,

  chooseReportSeq: 1,
  reportInTabView: false,
  crossInTabView: false,
  preTabMenuIndex: 0,
  templInfoSettings: [],

  showCrossCalc: true
});

const checkTheDate = () => ({
  getInstance: newDate,
  strDate : [
    newDate.getFullYear()
    ,(newDate.getMonth()+1)
    ,newDate.getDate()
  ].join('/')
});

export default new Vuex.Store({
  state: {
    uid: '', // 사용자 아이디
    pid: '',  //프리미엄 아이디
    pwd: '',
    ev: '', // 자동접속 문자열
    message: '',  // 출력 메시지
    isAuth: false, // 인증여부 체크
    isPeUser: false, // 프리미엄 평가통계 등록 여부 체크
    embedded: false, // SM embedded mode
    domain: false, // 도메인 여부 체크
    statSetting: statState(),
    hiddenLink1: phpApi,
    newsGroup: [{
      lvalue: '',
      sname: ''
    }],
    valueGroup: [{
      lvalue: '',
      sname: ''
    }],
    mediaList: [],
    eval1Category: [],
    eval1ByCategory : [],
    eval2Class: [],

    selectedArticle: '',
    multiSelectedArticle: '',
    searchSelectedArticle: '',

    articleList: [],
    searchArticleList: [],
    onlyArticle: [],
    multiEvalArticleList: [],

    newsIdList: [],
    multiNewsIdList: [],
    searchNewsIdList: [],

    evalInfo: [{eval1: '', eval2Cnt: '', eval2Value: []}],
    searchEvalInfo: [{eval1: '', eval2Cnt: '', eval2Value: []}],
    eval2Cnt: 0,

    articleResultCount: 0,
    articleHiddenShow: false,
    articleHiddenList: [],

    getArticleListSource: 'header', // header or searchForm
    getArticleListFromSearchParams: '',
    getArticleListFromHeaderPayload: '',

    /* Eval -> SearchForm */
    searchConditionModel : {
      selectedDateStand : "0",
      selYear: newDate.getFullYear(),
      selMon: (newDate.getMonth()+1),
      selDay: newDate.getDate(),
      sDate: newDate,
      eDate: newDate,
      search_range: '0',
      keyword: '',
      keyword_condition: 'or',
      ex_keyword: '',
      ex_keyword_condition: 'or',
      hUse: true,
      news_comment: true,
      sbUse: true,
      selNewsMe : ["0"],
      pageSize: 50,
      pageNo: -1,
      order_column: '',
      order: ''
    },
    /* SearchEval0.vue */
    searchEval0: {
      eval0Condition: 'OR',
      selEval0: [],
      selEval0AndDisplay: {}
    },
    /* SearchEval1.vue */
    searchEval1: {
      major : [],
      mid : [],
      minor : [],
      selectedEval1: []
    },
    /* SearchEval2.vue */
    searchEval2: {
      eval2Condition: 'OR',
      selEval2 : [],
      selEval2AndDisplay : {}
    },
    /* Search.vue */
    sendSearchData: {
      oneRowEval0 : [],
      eval0_condition: '',
      oneRowEval1 : [],
      oneRowEval2 : [],
      eval2_condition: '',
      isCheckedEval0: false,
      eval0_presentChecked: [],
      isCheckedEval1: false,
      eval1_presentChecked: [],
      isCheckedEval2: false,
      eval2_presentChecked: [],
    },
    callApiSearch: false,
    searchFormSeen: false,
    initSearchForm: false,
    showDoEvalMulti: false,
//    columnSettingWeb: ['w', 'e', 'b'],
//    expandArticleList: false,
    hideAndShowArticleList: false,
    hideAndShowArticleListSearch: false,
    hideAndShowMultiArticleList: false,
    showPopCalender: false,
    loadingGif: false,
    
    date : checkTheDate(),
    selDate : newDate.getFullYear()+'-'+(newDate.getMonth()+1)+'-'+newDate.getDate()

    , configEval: [] // 공통설정
    , configEvalItem: [] // 공통설정-평가
    , configEvalGroup: [] // 공통설정-평가그룹
    , listLayout0: true
    , listLayout1: true
    , listLayout2: true

    , viewerUri: null
    , viewerLogoutUri: null
  },
  mutations: {
    LOGIN(state, data) {
      if (data.success) {
        state.uid = data.data.uid;
        state.pid = data.data.pid;
        state.isPeUser = data.data.peUser;
        if (data.data.embedded) {
          state.isEmbedded = data.data.embedded;
          localStorage.setItem('is-embedded', data.data.embedded);
          localStorage.setItem('last-auth-check', Date.now() + (365 * 24 * 60 * 60 * 1000));
        } else {
          state.isEmbedded = false;
          localStorage.removeItem('is-embedded');
          localStorage.setItem('last-auth-check', Date.now());
        }
        localStorage.setItem('is-new-mode', data.data.peUser);
        state.isAuth = true;
        state.domain = data.data.domain;
      }else{
        state.uid = '';
        state.pid = '';
        state.pwd = '';
        state.ev = '';
        state.isPeUser = false;
        state.isEmbedded = false;
        localStorage.removeItem('is-new-mode');
        localStorage.removeItem('last-auth-check');
        localStorage.removeItem('is-embedded');
        state.isAuth = false;
      }
      state.message = data.message;
    },
    LOGOUT(state) {
      state.uid = '';
      state.pid = '';
      state.pwd = '';
      state.ev = '';
      state.message = '';
      localStorage.removeItem('is-new-mode');
      localStorage.removeItem('last-auth-check');
      localStorage.removeItem('is-embedded');
      state.isAuth = false;
      state.isPeuser = false;
      state.isEmbedded = false;
      state.domain = false;
      state.selectedArticle = '';
      state.searchFormSeen = false;
      state.initSearchForm = false;
      state.evalSelectionMedium = {};
      state.statSelectionMedium = {};
    },

    SET_PWD(state, data) {
      state.pwd = data;
    },
    SET_EV(state, data) {
      state.ev = data;
    },
    SET_EVAL1_CATEGORY(state, data) {
      state.eval1Category = data;
    },
    SET_EVAL1_BY_CATEGORY(state, data) {
      state.eval1ByCategory = data;
    },
    SET_EVAL2_CLASS(state, data) {
      state.eval2Class = data;
    },
    SET_DOMAIN(state,data){
      state.domain = data;
    },
    SET_STAT_OPTION(state, data) {
      state.statSetting = data;
    },
    STAT_RESET(s, data) {
      s.statSetting = statState();
      s.statSetting.evalSelectionMedium = data;
      s.statSetting.statSelectionMedium = data;
    },
    SET_NEWS_GROUP(state, data) {
      state.newsGroup = data;
    },
    SET_VALUE_GROUP(state, data) {
      state.valueGroup = data;
    },
    SET_MEDIA_CATEGORY(state, data) {
      state.mediaList = data;
    },
    SET_CONFIG_EVAL(state, data) {
      state.configEval = data;
    },
    SET_CONFIG_EVAL_ITEM(state, data) {
      state.configEvalItem = data;
    },
    SET_CONFIG_EVAL_GROUP(state, data) {
      state.configEvalGroup = data;
    },
    SET_SELECTED_ARTICLE(state, data) {
      state.selectedArticle = data;
    },
    SET_MULTI_SELECTED_ARTICLE(state, data) {
      state.multiSelectedArticle = data;
    },
    SET_SEARCH_SELECTED_ARTICLE(state,data){
      state.searchSelectedArticle = data;
    },
    SET_ARTICLE_LIST(state, data) {
      state.articleList = data;
    },
    SET_SEARCH_ARTICLE_LIST(state, data) {
      state.searchArticleList = data;
    },
    SET_SEARCH_FORM_SEEN(state, data) {
      state.searchFormSeen = data;
    },
    SET_INIT_SEARCH_FORM(state, data) {
      state.initSearchForm = data;
    },
    SET_CALL_API_SEARCH(state, data) {
      state.callApiSearch = data;
    },
    SET_GET_ARTICLE_LIST_FROM_SEARCH_PARAMS(state, data) {
      state.getArticleListFromSearchParams = data;
    },
    SET_GET_ARTICLE_LIST_FROM_HEADER_PAYLOAD(state, data) {
      state.getArticleListFromHeaderPayload = data;
    },
    TOGGLE_SHOW_DO_EVAL_MULTI(state, data) {
      state.showDoEvalMulti = data;
    },
    SET_MULTI_EVAL_ARTICLE_LIST(state, data) {
      state.multiEvalArticleList = data;
      state.multiSelectedArticle = data[0];
    },
    TOGGLE_EXPAND_ARTICLE_LIST(state, data) {
      state.expandArticleList = data;
    },
    TOGGLE_HIDE_AND_SHOW_ARTICLE_LIST(state, data) {
      state.hideAndShowArticleList = data;
    },
    TOGGLE_HIDE_AND_SHOW_ARTICLE_LIST_SEARCH(state, data) {
      state.hideAndShowArticleListSearch = data;
    },
    TOGGLE_HIDE_AND_SHOW_MULTI_ARTICLE_LIST(state, data) {
      state.hideAndShowMultiArticleList = data;
    },
    TOGGLE_SHOW_POP_CALENDER(state, data) {
      state.showPopCalender = data;
    },
    SET_ARTICLE_LIST_SOURCE(state, data) {
      state.getArticleListSource = data;
    },
    SET_NEWS_ID_LIST(state, data) {
      state.newsIdList = data;
    },
    SET_MULTI_NEWS_ID_LIST(state, data) {
      state.multiNewsIdList = data;
    },
    SET_EVAL_INFO(state, data) {
      state.evalInfo = data;
    },
    SET_EVAL2_CNT(state, data) {
      state.eval2Cnt = data;
    },
    SET_ONLY_ARTICLE(state, data) {
      state.onlyArticle = data;
    },
    SET_SEL_DATE(state,data){
        state.selDate = data;
    },
    SET_LOADING_GIF(state,data){
        state.loadingGif = data;
    },
    SET_SEARCH_NEWS_ID_LIST(state,data){
      state.searchNewsIdList = data;
    },
    SET_SEARCH_EVAL_INFO(state,data){
      state.searchEvalInfo = data;
    },
    SET_ARTICLE_RESULT_COUNT(state,data){
      state.articleResultCount = data;
    },
    SET_ARTICLE_HIDDEN_SHOW(state,data) {
      state.articleHiddenShow = data;
    },
    SET_ARTICLE_HIDDEN_LIST(state,data) {
      state.articleHiddenList = data;
    },
    SET_LIST_LAYOUT_0(state, data) {
      state.listLayout0 = data;
    },
    SET_LIST_LAYOUT_1(state, data) {
      state.listLayout1 = data;
    },
    SET_LIST_LAYOUT_2(state, data) {
      state.listLayout2 = data;
    },
    SET_VIEWER_LOGOUT_URI(state, data) {
      try {
        state.viewerLogoutUri = data.split('?')[0].replace('adminLoginFromEval', 'adminLogout');
      } catch (err) {
        state.viewerLogoutUri = 'https://view.scrapmaster.co.kr/admin/adminLogout.do';
      }
    }
  },
  actions: {
    async LOGOUT({commit}) {
      await axios.post(phpApi + '/logout.php');
      commit('LOGOUT');
      commit('SET_SELECTED_ARTICLE', '');
      commit('SET_SEARCH_SELECTED_ARTICLE', '');
      commit('SET_ARTICLE_LIST', []);
      commit('SET_SEARCH_ARTICLE_LIST', []);
      commit('SET_SEL_DATE', newDate.getFullYear()+'-'+(newDate.getMonth()+1)+'-'+newDate.getDate());
    },
    STAT_RESET({commit}, data) {
      commit('STAT_RESET', data);
    },
    //로그인 API
    async loginAutoAPI(store, params) {
      // 로그인 커밋
      let setLogin = ({commit}, data) => {
        commit('LOGIN', data);
      };
      let setEv = ({commit}, data) => {
        commit('SET_EV', data);
      };
      let setConfigEval = ({commit}, data) => {
        commit('SET_CONFIG_EVAL', data);
      };
      const getConfigEval = (params) => {
        return axios.post(phpApi + '/getConfigEvalJson.php', params);
      };

      // 로그인 서버로 부터 요청
      const getUserInfo = (params) => {
        return axios.post(phpApi + '/loginAuto.php', params);
      };
      try {
        const res = await getUserInfo(params);

        //성공
        if (res.status === 200) {
          setLogin(store, res.data);
          setEv(store, params.get('ev'));
          try {
            const ce_res = await getConfigEval(params);
            if (ce_res.status === 200 && ce_res.data.success) {
              let configEval = ce_res.data.config_eval;
              setConfigEval(store, configEval);
            }
          } catch (err) {
            console.error(err);
          }
        }
        return store.getters.getIsAuth;
      } catch (err) {
        console.error(err);
      }
    },
    async loginAPI(store, params) {
      // 로그인 커밋
      let setLogin = ({commit}, data) => {
        commit('LOGIN', data);
      };
      let setPwd = ({commit}, data) => {
        commit('SET_PWD', data);
      };
      let setConfigEval = ({commit}, data) => {
        commit('SET_CONFIG_EVAL', data);
      };
      const getConfigEval = (params) => {
        return axios.post(phpApi + '/getConfigEvalJson.php', params);
      };

      // 로그인 서버로 부터 요청
      const getUserInfo = (params) => {
        return axios.post(phpApi + '/login.php', params);
      };
      try {
        const res = await getUserInfo(params);
        
        //성공
        if (res.status === 200) {
          setLogin(store, res.data);
          setPwd(store, params.get('password'));
          try {
            const ce_res = await getConfigEval(params);
            if (ce_res.status === 200 && ce_res.data.success) {
              let configEval = ce_res.data.config_eval;
              setConfigEval(store, configEval);
            }
          } catch (err) {
            console.error(err);
          }
        }
        return store.getters.getIsAuth;
      } catch (err) {
        console.error(err);
      }
    },
    //로그인 체크 API
    async loginCheckAPI(store, params) {
      // 로그인 서버로 부터 요청
      // 로그인 커밋
      let setLogin = ({commit}, data) => {
        commit('LOGIN', data);
      };
      const getAuthAPI = (params) => {
        return axios.post(phpApi + '/auth.php', params);
      };
      try {
        let isEmbedded = localStorage.getItem('is-embedded');
        const res = await getAuthAPI(params);
        if (res.status === 200) {
          //성공
          if (isEmbedded) res.data.data.embedded = isEmbedded;
          setLogin(store, res.data);
        }
        return store.getters.getIsAuth;
      } catch (err) {
        console.error(err);
      }
    },
    async loginCheckGentleAPI(store, params) {
      let setLogin = ({commit}, data) => {
        commit('LOGIN', data);
      }; 
      const getAuthAPI = (params) => {
        return axios.post(phpApi + '/auth.php', params);
      };
      try {
        let isEmbedded = localStorage.getItem('is-embedded');
        let oldTime = Number(localStorage.getItem('last-auth-check'));
        oldTime = isNaN(oldTime) ? 0 : oldTime;
        let curTime = Date.now();
        let diffTime = (curTime - oldTime) / 1000;
        
        if (diffTime > 60) {
          const res = await getAuthAPI(params);
          if (res.status === 200) {
            if (isEmbedded) res.data.embedded = isEmbedded;
            setLogin(store, res.data);
          }
        }
        return store.getters.getIsAuth;
      } catch (err) {
        console.error(err);
      }
    },
    //범위 API
    async newsGroupAPI(store) {
      // 로그인 커밋
      let setCommit = ({commit}, data) => {
        commit('SET_NEWS_GROUP', data);
      };
      // 로그인 서버로 부터 요청
      const getNewsGroupInfo = () => {
        return axios.post(phpApi + '/newsGroupInfo.php');
      };
      try {
        const res = await getNewsGroupInfo();
        if (res.status === 200) {
          //성공
          setCommit(store, res.data);
        }
        return store.getters.getNewsGroupInfo;
      } catch (err) {
        console.error(err);
      }
    },
    //매체구분 API - 3.5기준 news.category_name
    async categoryNameOldAPI() {
      const getCategoryNameOld = () => {
        return axios.post(phpApi + '/categoryNameOld.php');
      };
      try {
        const res = await getCategoryNameOld();
        let result = {}, idx = 0;
        if (res.status === 200) {
          if (res.data && res.data.constructor.name === 'Array') {
            res.data.forEach(e => {
              result[idx] = { count: -1, countCur: -1, id: idx++, media: [], name: e, visible: true };
            });
          }
          return result;
        }
      } catch (err) {
        console.error(err);
      }
    },
    //매체구분 API
    async categoryIdAPI(store) {
      // 매체정보 커밋
      let setCommit = ({commit}, data) => {
        commit('SET_MEDIA_CATEGORY', data);
      };
      // 매체정보 요청
      const getCategoryId = () => {
        return axios.post(phpApi + '/category_id.php');
      };
      try {
        const res = await getCategoryId();
        if (res.status === 200) {
          //성공
          if (res.data.success !== false) {
            setCommit(store, res.data);
          }
        }
        return store.getters.getMediaList;
      } catch (err) {
        console.error(err);
      }
    },
    //기사목록 or 검색결과 기사목록 API
    async getArticleListFromSearchAPI(store, param) {
      //기사목록 commit
      let loadingGifCommit = ({commit}, data)=>{
        commit('SET_LOADING_GIF', data);
      };
      let setCommit = ({commit}, data) => {
        commit('SET_SEARCH_ARTICLE_LIST', data);
      };
      let setCommitNewsId = ({commit}, data) => {
        commit('SET_SEARCH_NEWS_ID_LIST', data);
      };
      let setCommitEvalInfo = ({commit}, data) => {
        commit('SET_SEARCH_EVAL_INFO', data);
      };
      let setCommitCount = setCommitCount = ({commit}, data) => {
        commit('SET_ARTICLE_RESULT_COUNT', data);
      };
      //기사목록 서버로 부터 요청
      const getArticle = () => {
        return axios.post(phpApi + '/search_API_wip.php', param);
      };
      const getEvalIs = (newsIdList) => {
          let postparam = new FormData;
          postparam.append('news_id', newsIdList);
          return axios.post(phpApi + '/evalInfoAll.php', postparam);
      };
      loadingGifCommit(store, true);
      let rtn = true;
      try {
        const res = await getArticle();
        const articles = res.data.articles;
        const evals = res.data.evals;
        const count = (res.data.resultCountRow) ? res.data.resultCountRow : -1;
        if (count > -1) {
          setCommitCount(store, count);
        }
        let list = {};
        list[0] = articles;
        let data = {};
        data[0] = list;
        if (res.status === 200 && !res.data.notice_code && !res.data.notice_message) {
          setCommit(store, data);
          let newsIdList = [];
          if(articles[0]) {
            articles.forEach(one => {
              if (one !== null) {
                newsIdList.push(one.news_id);
              }
            });
            setCommitEvalInfo(store, evals);
          }
          if (res.status === 200) {
            setCommitNewsId(store, newsIdList);
          }
        } else {
          rtn = false;
        }
      } catch (err) {
        console.error(err);
      }
      loadingGifCommit(store, false);
      return rtn;
    },
    async getArticleListFromHeaderAPI(store, payload) {
      let loadingGifCommit = ({commit}, data)=>{
        commit('SET_LOADING_GIF', data);
      };
      let setCommit = ({commit}, data) => {
        commit('SET_ARTICLE_LIST', data);
      };
      let setCommitNewsId = ({commit}, data) => {
        commit('SET_NEWS_ID_LIST', data);
      };
      let setCommitEvalInfo = ({commit}, data) => {
        commit('SET_EVAL_INFO', data);
      };

      const getArticle = (param) => {
        return axios.post(phpApi + '/articleListWithSubTitle.php', param);
      };
      const getEvalIs = (newsIdList) => {
        if (newsIdList && newsIdList.length > 0) {
          let postparam = new FormData;
          postparam.append('news_id', newsIdList);
          return axios.post(phpApi + '/evalInfoAll.php', postparam);
        } else {
          return {};
        }
      };
      loadingGifCommit(store, true);
      let rtn = true;
      try {
        let data = [];
        let res = [];
        for (let val of payload['newsMe']) {
          let paramA = new FormData;
          paramA.append('newsMe', val);
          paramA.append('scrapDate', payload['scrapDate']);
          res = await getArticle(paramA);
          if (res.status === 200 && !res.data.notice_code && !res.data.notice_message) {
            Vue.set(data, val, res.data);
          } else {
            Vue.set(data, val, []);
            rtn = rtn && false;
          }
        }
        if (res.status === 200) {
          if(data !== null){
            setCommit(store, data);
          }
        }
        let news_id_list = [];
        data.forEach(group=>{
          if(Object.keys(group).length>0) {
            let grup = Object.keys(group).map(e => group[e]);
            grup.forEach(cate => {
              cate.forEach(one => {
                news_id_list.push(one.news_id);
              })
            });
          }
        });
        const evalInfoList = await getEvalIs(news_id_list);
        if(evalInfoList.status === 200){
          setCommitEvalInfo(store, evalInfoList.data);
        }
        if(res.status === 200){
          setCommitNewsId(store, news_id_list);
        }
      } catch (err) {
        console.error(err);
      }
      loadingGifCommit(store, false);
      return rtn;
    },
    async getEvalInfoAPI(store, payload) {
      let setCommit = ({commit}, data) => {
        commit('SET_EVAL_INFO', data);
      };
	    let setCommitSearch = ({commit}, data) => {
		    commit('SET_SEARCH_EVAL_INFO', data);
	    };
      const getEvalIs = (params) => {
        return axios.post(phpApi + '/evalInfoAll.php', params);
      };

      try {
        const res = await getEvalIs(payload);
        if (res.status === 200) {
          if (res.data.success !== false) {
            if (payload.get('flag') === 'search') {
              setCommitSearch(store, res.data);
            } else {
              setCommit(store, res.data);
            }
          }
          return store.getters.getIsAuth;
        }
      } catch (err) {
        console.error(err);
      }
    },
    async inExcludeEvalAPI(store, params){
	    // 요청
	    const getAPI = (params) => {
		    return axios.post(phpApi + '/inExcludeEval.php', params);
	    };
	    try {
	    	const res = await getAPI(params);
		    if (res.status === 200) {
			    //성공
			    if (res.data.success !== false) {
				    return res.data;

			    }
		    }
	    } catch (err) {
		    console.error(err);
	    }
    },
    async getEval1CategoryAPI(store, params) {
      // 매체정보 커밋
      let setCommit = ({commit}, data) => {
        commit('SET_EVAL1_CATEGORY', data);
      };
      let setByCategoryCommit = ({commit}, data) => {
        commit('SET_EVAL1_BY_CATEGORY', data);
      };
      // 매체정보 요청 - 트리구조
      const getEval1Category = (params) => {
        return axios.post(phpApi + '/getEval1Category_tree.php', params);
      };

      // 매체정보 요청 - 대,중,소 별로
      const getEval1ByCategory = (params) => {
        return axios.post(phpApi + '/getEval1ByCategory.php', params);
      };
      try {
        const res = await getEval1Category(params);
        if (res.status === 200) {
          //성공
          setCommit(store, res.data);
        }
        const resByCategory = await getEval1ByCategory(params);
        if(resByCategory.status === 200) {
          //성공
          let e1ByCate = resByCategory.data
          e1ByCate['subMajorCnt'] = e1ByCate.major.length;
          e1ByCate['subMiddleCnt'] = e1ByCate.middle.length;
          e1ByCate['subMinorCnt'] = e1ByCate.minor.length;
          for(let mj of e1ByCate.major) { mj['subCnt'] = mj.sub.length; }
          for(let md of e1ByCate.middle) { md['subCnt'] = md.sub.length; }
          for(let mn of e1ByCate.minor) { mn['subCnt'] = mn.sub.length; }
          
          setByCategoryCommit(store, resByCategory.data);
        }
        return store.getters.getEval1Category;
      } catch (err) {
        console.error(err);
      }
    },
    async getEval2ClassAPI(store, params) {
      // 평가2항목 커밋
      let setCommit = ({commit}, data) => {
        commit('SET_EVAL2_CLASS', data);
      };
      //평가2항목 갯수
      let setCommitCnt = ({commit}, data) => {
        commit('SET_EVAL2_CNT', data);
      };

      //평가2항목 요청
      const getEval2Class = (params) => {
        return axios.post(phpApi + '/getEval2Class.php', params);
      };
      try {
        const res = await getEval2Class(params);
        let eval2Cnt = 0;
        if(res.data !== '' && res.data !== [] ) {
          res.data.forEach(one => {
          	if(one.sub.length > 0 && one.upper_cate_use === 'Y') eval2Cnt++;
          });
        }
        if (res.status === 200) {
          let tmpAll = [], tmpAuto = [], tmpEv2 = [];
          res.data.forEach(e => {
            if (Number(e.upper_cate_seq) < 1000) {
              e.upper_cate_type = '자동';
              tmpAuto.push(e);
            } else {
              e.upper_cate_type = '수동2';
              tmpEv2.push(e);
            }
          });
          tmpAuto.sort(function(a,b) {
            let ao = a.upper_cate_order ? Number(a.upper_cate_order) : 65535;
            let bo = b.upper_cate_order ? Number(b.upper_cate_order) : 65535;
            return ao - bo;
          });
          tmpEv2.sort(function(a,b) {
            let ao = a.upper_cate_order ? Number(a.upper_cate_order) : 65535;
            let bo = b.upper_cate_order ? Number(b.upper_cate_order) : 65535;
            return ao - bo;
          });
          tmpAll = tmpAuto.concat(tmpEv2);

          //성공
          for (let ta of tmpAll) { ta['subCnt'] = ta.sub.length; }
          setCommit(store, tmpAll);
          setCommitCnt(store, eval2Cnt);
        }
        return store.getters.getEval2Class;
      } catch (err) {
        console.error(err);
      }
    },
    async getStatValueAPI(store, params) {
      let loadingGifCommit = ({commit}, data)=>{
        commit('SET_LOADING_GIF', data);
      };
      //기사 정보 요청
      const getStatScrap = (params) => {
        return axios.post(phpApi + '/stat_value_wip.php ', params);
      };
      let rtn = false;
      // loadingGifCommit(store, true);
      try {
        const res = await getStatScrap(params);
        if (res.status === 200 && res.data.success) {
          rtn = res.data;
        }
      } catch (err) {
        console.error(err);
      }
      // loadingGifCommit(store, false);
      return rtn;
    },

    //범위 API
    async valueGroupAPI(store) {
      // 기사가치 산출기준 커밋
      let setCommit = ({commit}, data) => {
        commit('SET_VALUE_GROUP', data);
      };
      // 로그인 서버로 부터 요청
      const getValueGroupInfo = () => {
        return axios.post(phpApi + '/valueGroupInfo.php');
      };
      try {
        const res = await getValueGroupInfo();
        if (res.status === 200) {
          //성공
          setCommit(store, res.data);
        }
        return store.getters.getValueGroupInfo;
      } catch (err) {
        console.error(err);
      }
    },
    //가치 설정 저장 API
    async setValueSettingAPI(store, params) {
      // 설정 커밋
      let setCommit = ({commit}, data) => {
        commit('SET_MEDIA_CATEGORY', data);
      };
      // 요청
      const getAPI = (params) => {
        return axios.post(phpApi + '/setValueSettings.php', params);
      };
      try {
        const res = await getAPI(params);
        if (res.status === 200) {
          //성공
          if (res.data.success !== false) {
            setCommit(store, res.data);
          }
        }
        return store.getters.getValueGroupInfo;
      } catch (err) {
        console.error(err);
      }
    },
    async getNsConfigEvalAPI(store, params) {
      let setCommit = ({commit}, data) => {
        commit('SET_CONFIG_EVAL', data);
      };
      const getAPI = (params) => {
        return axios.post(phpApi + '/getConfigEvalJson.php', params);
      };

      try {
        const res = await getAPI(params);
        if (res.status === 200 && res.data.success) {
          let configEval = res.data.config_eval;
          setCommit(store, configEval);
        }
      } catch (err) {
        console.error(err);
      }

      return store.getters.getConfigEval;
    },
    async getConfigEvalAPI(store, params) {
      let setCommit = ({commit}, data) => {
        commit('SET_CONFIG_EVAL', data);
      };
      let setCommitItem = ({commit}, data) => {
        commit('SET_CONFIG_EVAL_ITEM', data);
      };
      let setCommitGroup = ({commit}, data) => {
        commit('SET_CONFIG_EVAL_GROUP', data);
      };
      const getAPI = (params) => {
        return axios.post(phpApi + '/getConfigEvalJson.php', params);
      };
      const getCategoryNameOld = () => {
        return axios.post(phpApi + '/categoryNameOld.php');
      };

      try {
        const res = await getAPI(params);
        let subCate = {};
        if (res.status === 200 && res.data.success) {
          let configEval = res.data.config_eval;
          setCommit(store, configEval);

          let configEvalItem = {};
          for (let [k,v] of Object.entries(configEval['item']['AT_M2'])) {
            configEvalItem[v.seq] = v;
          }
          for (let [k,v] of Object.entries(configEval['item']['M1'])) {
            if (!v.group_seq) {
              v.group_name = '대분류';
              v.group_seq = 10001;
              v.upper_seq = 0;
              v.rel_seq = [Number(v.seq), Number(v.seq), Number(v.seq)];
            } else {
              v.upper_seq = Number(v.group_seq);
              v.group_seq = 0;
            }
            v.seq = Number(v.seq);
            configEvalItem['M1' + v.seq] = v;
          }
          for (let [k,v] of Object.entries(configEval['category'])) {
            configEvalItem['MC' + v['category_id']] = {
              class: 'MC', group_name: '매체분류', group_seq: '100002', upper_seq: '0', rel_seq: [], seq: v['category_id'], value: v['category_name']
            };
          }
          for (let [k,v] of Object.entries(configEval['type'])) {
            configEvalItem['MT' + v['category_id']] = {
              class: 'MT', group_name: '매체유형', group_seq: '100003', upper_seq: '0', rel_seq: [], seq: v['category_id'], value: v['category_name']
            };
          }
          let _res = await getCategoryNameOld(), _idx = 0;
          if (_res.status === 200 && _res.data && _res.data.constructor.name === 'Array') {
            _res.data.forEach(e => {
              configEvalItem['MO' + _idx] = {
                class: 'MO', group_name: '매체구분류', group_seq: '100004', upper_seq: '0', rel_seq: [], seq: _idx, value: e
              }; _idx++;
            });
          }

          let isGroupExists = false, objParent;
          for (let [k,v] of Object.entries(configEvalItem)) {
            if (k.includes('M1') && v.group_seq != 10001) {
              isGroupExists = configEvalItem.hasOwnProperty('M1' + v.upper_seq);
              if (isGroupExists) {
                objParent = configEvalItem['M1' + v.upper_seq];
                if (Number(objParent.group_seq) === 10001) {
                  v.group_name = '중분류';
                  v.group_seq = 10002;
                  v.rel_seq = [Number(objParent.seq), Number(v.seq), Number(v.seq)];
                } else { // 부모==중
                  v.group_name = '소분류';
                  v.group_seq = 10003;
                  v.rel_seq = [Number(objParent.upper_seq), Number(objParent.seq), Number(v.seq)];
                }
              }
            }
          }

          let insertItem = {};
          let L={}, M={}, S={};
          for (let [ik, info] of Object.entries(configEval['item']['M1'])) {
            // 대분류
            if (info.rel_seq[0] == info.rel_seq[1] && 
                info.rel_seq[1] == info.rel_seq[2]) {
              L[ik] = info;
              // 평가1 기본(전체)
              if (!insertItem['M1-f'+info.rel_seq[0]]) {
                let attr = JSON.parse(JSON.stringify(configEvalItem['M1'+info.rel_seq[0]]));
                attr.value = info.value;
                attr.group_seq = '100222';
                attr.group_name = '평가별(평가1)';
                insertItem['M1-f'+info.rel_seq[2]] = attr;
              }
            }
            // 중분류 + 상위포함(대분류)
            if (info.rel_seq[0] != info.rel_seq[1] && 
                info.rel_seq[1] == info.rel_seq[2]) {
              M[ik] = info;
              if (!insertItem['M1-m'+info.rel_seq[1]]) {
                if (subCate['10022'] === undefined) subCate['10022'] = 0;
                else subCate['10022'] = subCate['10022'] + 1;
                let attr = JSON.parse(JSON.stringify(configEvalItem['M1'+info.rel_seq[1]]));
                attr.value = info.group_name + '-' + info.value;
                attr.group_seq = '10022';
                attr.group_name = '중분류(상위포함)';
                insertItem['M1-m'+info.rel_seq[1]] = attr;
              }
              // 평가1 기본(전체)
              if (!insertItem['M1-f'+info.rel_seq[1]]) {
                let attr = JSON.parse(JSON.stringify(configEvalItem['M1'+info.rel_seq[2]]));
                attr.value = configEval['item']['M1'][info.rel_seq[0]].value + '-' + info.value;
                attr.group_seq = '100222';
                attr.group_name = '평가별(평가1)';
                insertItem['M1-f'+info.rel_seq[2]] = attr;
              }
            }
            // 소분류 + 상위포함(중분류)
            if (info.rel_seq[0] != info.rel_seq[1] && 
                info.rel_seq[1] != info.rel_seq[2]) {
              S[ik] = info;
              if (!insertItem['M1-s'+info.rel_seq[2]]) {
                if (subCate['10033'] === undefined) subCate['10033'] = 0;
                else subCate['10033'] = subCate['10033'] + 1;
                let attr = JSON.parse(JSON.stringify(configEvalItem['M1'+info.rel_seq[2]]));
                attr.value = info.group_name + '-' + info.value;
                attr.group_seq = '10033';
                attr.group_name = '소분류(상위포함)';
                insertItem['M1-s'+info.rel_seq[2]] = attr;
              }
              // 평가1 기본(전체)
              if (!insertItem['M1-f'+info.rel_seq[2]]) {
                let attr = JSON.parse(JSON.stringify(configEvalItem['M1'+info.rel_seq[2]]));
                attr.value = configEval['item']['M1'][info.rel_seq[0]].value + '-' 
                  + configEval['item']['M1'][info.rel_seq[1]].value + '-'
                  + info.value;
                attr.group_seq = '100222';
                attr.group_name = '평가별(평가1)';
                insertItem['M1-f'+info.rel_seq[2]] = attr;
              }
            }

            
          } Object.assign(configEvalItem, insertItem);

          insertItem = {};
          let LC={}, MC={};
          // 소분류
          for (let [sn, sv] of Object.entries(S)) {
            if (subCate['10033'] === undefined) subCate['10033'] = 0;
            else subCate['10033'] = subCate['10033'] + 1;

            if (!LC[sv.rel_seq[0]]) LC[sv.rel_seq[0]] = sv.rel_seq[0];
            if (!MC[sv.rel_seq[1]]) MC[sv.rel_seq[1]] = sv.rel_seq[1];
          }
          for (let [ln, lv] of Object.entries(L)) {
            if (!LC[ln]) {
              if(S) subCate['10033'] = subCate['10033'] + 1;
              let attr = JSON.parse(JSON.stringify(configEvalItem['M1'+lv.rel_seq[2]]));
              attr.value = lv.group_name + '-' + lv.value;
              attr.group_seq = '10033';
              attr.group_name = '소분류(상위포함)';
              insertItem['M1-s'+lv.rel_seq[2]] = attr;

              if (!insertItem['M1-f'+lv.rel_seq[2]]) {
                let attr = JSON.parse(JSON.stringify(configEvalItem['M1'+lv.rel_seq[2]]));
                attr.value = lv.value;
                attr.group_seq = '100222';
                attr.group_name = '평가별(평가1)';
                insertItem['M1-f'+lv.rel_seq[2]] = attr;
              }
            }
          }
          for (let [mn, mv] of Object.entries(M)) {
            if (!MC[mn]) {
              if(S) subCate['10033'] = subCate['10033'] + 1;
              let attr = JSON.parse(JSON.stringify(configEvalItem['M1'+mv.rel_seq[2]]));
              attr.value = mv.group_name + '-' + mv.value;
              attr.group_seq = '10033';
              attr.group_name = '소분류(상위포함)';
              insertItem['M1-s'+mv.rel_seq[2]] = attr;

              if (!insertItem['M1-f'+mv.rel_seq[2]]) {
                let attr = JSON.parse(JSON.stringify(configEvalItem['M1'+mv.rel_seq[2]]));
                attr.value = configEval['item']['M1'][mv.rel_seq[0]].value + '-' 
                  + mv.value;
                attr.group_seq = '100222';
                attr.group_name = '평가별(평가1)';
                insertItem['M1-f'+mv.rel_seq[2]] = attr;
              }
            }
          } Object.assign(configEvalItem, insertItem);

          insertItem = {};
          LC={};
          for (let [mn, mv] of Object.entries(M)) {
            if (subCate['10022'] === undefined) subCate['10022'] = 0;
            else subCate['10022'] = subCate['10022'] + 1;

            if (!LC[mv.rel_seq[0]]) LC[mv.rel_seq[0]] = mv.rel_seq[0];
          }
          for (let [ln, lv] of Object.entries(L)) {
            if (!LC[ln]) {
              if (M) subCate['10022'] = subCate['10022'] + 1;
              let attr = JSON.parse(JSON.stringify(configEvalItem['M1'+lv.rel_seq[1]]));
              attr.value = lv.group_name + '-' + lv.value;
              attr.group_seq = '10022';
              attr.group_name = '중분류(상위포함)';
              insertItem['M1-m'+lv.rel_seq[1]] = attr;
            }
          } Object.assign(configEvalItem, insertItem);
          LC={}, MC={};

          
          let _cei = JSON.parse(JSON.stringify(configEvalItem));
          insertItem = {};
          for (let [n, v] of Object.entries(_cei)) {
            // M1은 Preview에서 세팅된다.
            if ((v.class.includes('AT') || v.class.includes('M2') || n.includes('M1-f') || n.includes('MC') 
                || n.includes('MO') || n.includes('MO') || n.includes('MT')) && !insertItem['FM-'+n]) {
              if (subCate['111111'] === undefined) subCate['111111'] = 0;
              else subCate['111111'] = subCate['111111'] + 1;
              v.value = (!n.includes('M1-f') ? v.group_name+'-':'') + v.value;
              v.group_seq = '111111';
              v.group_name = '평가별(전체)';
              insertItem['FM-'+n] = v;
            }
          } Object.assign(configEvalItem, insertItem);

          _cei = JSON.parse(JSON.stringify(configEvalItem));
          insertItem = {};
          for (let [ok, item] of Object.entries(_cei)) {
            let _item = JSON.parse(JSON.stringify(item));

            for (let [ik, info] of Object.entries(configEval['group']['AT'])) {
              if (_item.group_seq === info.seq) {
                if (subCate['100111'] === undefined) subCate['100111'] = 0;
                else subCate['100111'] = subCate['100111'] + 1;
                _item.value = _item.group_name+'-'+_item.value;
                _item.group_seq = '100111';
                _item.group_name = '자동평가(전체)';
                insertItem['AM-'+ok] = _item;
                break;
              }
            } // AT

            for (let [ik, info] of Object.entries(configEval['group']['M2'])) {
              if (_item.group_seq === info.seq) {
                if (subCate['100333'] === undefined) subCate['100333'] = 0;
                else subCate['100333'] = subCate['100333'] + 1;
                _item.value = _item.group_name+'-'+_item.value;
                _item.group_seq = '100333';
                _item.group_name = '평가2(전체)';
                insertItem['E2-'+ok] = _item;
                break;
              }
            } // M2

          } Object.assign(configEvalItem, insertItem);
          _cei = null;

          setCommitItem(store, configEvalItem);
          
          let sc = 0;
          for (let iter of store.state.eval1ByCategory['major']) {
            if (iter.sub.length == 0) sc++;
          }
          for (let iter of store.state.eval1ByCategory['middle']) {
            if (iter.sub.length == 0) sc++;
          }
          for (let iter of store.state.eval1ByCategory['minor']) {
            if (iter.sub.length == 0) sc++;
          } 

          let configEvalGroup = {};
          for (let [k,v] of Object.entries(configEval['group']['AT'])) {
            configEvalGroup[String(v.seq)] = v;
          }
          for (let [k,v] of Object.entries(configEval['group']['M1'])) {
            configEvalGroup[String(v.seq)] = v;
          }
          for (let [k,v] of Object.entries(configEval['group']['M2'])) {
            configEvalGroup[String(v.seq)] = v;
          }
          configEvalGroup['10001'] = {
            class: "M1", isEval: "Y", isUse: "Y", name: "대분류", seq: "10001"
          }
          configEvalGroup['10002'] = {
            class: "M1", isEval: "Y", isUse: "Y", name: "중분류", seq: "10002"
          }
          configEvalGroup['10003'] = {
            class: "M1", isEval: "Y", isUse: "Y", name: "소분류", seq: "10003"
          }
          configEvalGroup['100001'] = {
            class: "T", isEval: "Y", isUse: "Y", name: "기간", seq: "100001"
            , subCnt: 12
          }
          configEvalGroup['100002'] = {
            class: "MC", isEval: "Y", isUse: "Y", name: "매체분류", seq: "100002"
            , subCnt: configEval['category'].length
          }
          configEvalGroup['100003'] = {
            class: "MT", isEval: "Y", isUse: "Y", name: "매체유형", seq: "100003"
            , subCnt: Object.values(configEval['type']).length
          }
          configEvalGroup['100004'] = {
            class: "MO", isEval: "Y", isUse: "Y", name: "매체구분류", seq: "100004"
            , subCnt: _idx
          }

          configEvalGroup['10022'] = {
            class: "M1", isEval: "Y", isUse: "Y", name: "중분류(상위포함)", seq: null
            , subCnt: subCate['10022']
          }
          configEvalGroup['10033'] = {
            class: "M1", isEval: "Y", isUse: "Y", name: "소분류(상위포함)", seq: null
            , subCnt: subCate['10033']
          }

          configEvalGroup['111111'] = {
            class: "FM", isEval: "Y", isUse: "Y", name: "평가별(전체)", seq: null
            , subCnt: subCate['111111']
          }
          configEvalGroup['100111'] = {
            class: "AM", isEval: "Y", isUse: "Y", name: "평가별(자동)", seq: null
            , subCnt: subCate['100111']
          }
          configEvalGroup['100222'] = {
            class: "FM1", isEval: "Y", isUse: "Y", name: "평가별(평가1)", seq: null
            , subCnt: sc
          }
          configEvalGroup['100333'] = {
            class: "FM2", isEval: "Y", isUse: "Y", name: "평가별(평가2)", seq: null
            , subCnt: subCate['100333']
          }
          configEvalGroup['100555'] = {
            class: "FMC", isEval: "Y", isUse: "Y", name: "매체별", seq: null
            , subCnt: store.state.mediaList.length
          }
          for (let [key, item] of Object.entries(configEvalGroup)) {
            // 자동, 평가2
            if (['AT', 'M2'].includes(item.class)) {   
                for (let inner of store.state.eval2Class) {
                    if (item.seq == inner.upper_cate_seq) {
                        item.subCnt = inner.subCnt;
                        break;
                    }
                } // for
            }
            // 평가1
            else if ('M1' == item.class) {
                switch(key) {
                    case "10001": item.subCnt = store.state.eval1ByCategory['major'].length; break;
                    case "10002": item.subCnt = store.state.eval1ByCategory['middle'].length; break;
                    case "10003": item.subCnt = store.state.eval1ByCategory['minor'].length; break;
                    case "10022": 
                        item.subCnt = store.state.eval1ByCategory['subMajorCnt'] 
                                    + store.state.eval1ByCategory['subMiddleCnt'];
                        break;
                    case "10033": item.subCnt = store.state.eval1ByCategory['subMinorCnt']; 
                        item.subCnt = store.state.eval1ByCategory['subMajorCnt']
                                    + store.state.eval1ByCategory['subMiddleCnt']
                                    + store.state.eval1ByCategory['subMinorCnt']
                        break;
                    default : console.error("unknown 'key' value");
                }
            } 
          } 
          
          setCommitGroup(store, configEvalGroup);
        }
      } catch (err) {
        console.error(err);
      }

      return store.getters.getConfigEval;
    },
    //평가 자동화 기사 크기 설정 API
    async getArticleSizeAPI(store, params) {
      // 요청
      const getAPI = (params) => {
        return axios.post(phpApi + '/articleSize.php', params);
      };
      let rtn = false;
      try {
        const res = await getAPI(params);
        if (res.status === 200 && res.data.success !== false) {
          rtn = res.data;
        }
      } catch (err) {
        console.error(err);
      }
      return rtn;
    },

    //기사 글자수 설정 API
    async getArticleCharLenAPI(store, params) {
      // 요청
      const getAPI = (params) => {
        return axios.post(phpApi + '/articleCharLen.php', params);
      };
      let rtn = false;
      try {
        const res = await getAPI(params);
        if (res.status === 200 && res.data.success !== false) {
          rtn = res.data;
        }
      } catch (err) {
        console.error(err);
      }
      return rtn;
    },
    //매체 중요도 설정 목록 API
    async getMediaImportanceAPI(store, params) {
      // 요청
      const getAPI = (params) => {
        return axios.post(phpApi + '/mediaImportance.php', params);
      };
      let rtn = false;
      try {
        const res = await getAPI(params);
        if (res.status === 200 && res.data.success !== false) {
          rtn = res.data;
        }
      } catch (err) {
        console.error(err);
      }
      return rtn;
    },
    //출입기자 설정 목록 API
    async getCorrespondentAPI(store, params) {
      // 요청
      const getAPI = (params) => {
        return axios.post(phpApi + '/correspondent.php', params);
      };
      let rtn = false;
      try {
        const res = await getAPI(params);
        if (res.status === 200 && res.data.success !== false) {
          rtn = res.data;
        }
      } catch (err) {
        console.error(err);
      }
      return rtn;
    },
    //기사위치 설정 API
    async getArticlePositionAPI(store, params) {
      const getAPI = (params) => {
        return axios.post(phpApi + '/articlePosition.php', params);
      };
      let rtn = false;
      try {
        const res = await getAPI(params);
        if (res.status === 200 && res.data.success !== false) {
          rtn = res.data;
        }
      } catch (err) {
        console.error(err);
      }
      return rtn;
    },
    //평가1 항목 설정  API
    async setEval1CategoryAPI(store, params) {
      // 요청
      const getAPI = (params) => {
        return axios.post(phpApi + '/setEval1Category.php', params);
      };
      let rtn = false;
      try {
        const res = await getAPI(params);
        if (res.status === 200 && res.data.success !== false) {
          rtn = true;
        }
      } catch (err) {
        console.error(err);
      }
      return rtn;
    },
    //평가2 항목 설정  API
    async setEval2ClassAPI(store, params) {
      // 요청
      const getAPI = (params) => {
        return axios.post(phpApi + '/setEval2Class.php', params);
      };
      let rtn = false;
      try {
        const res = await getAPI(params);
        if (res.status === 200 && res.data.success !== false) {
          rtn = res.data;
        }
      } catch (err) {
        console.error(err);
      }
      return rtn;
    },
	  async getUnitCostAPI(store, params){
    	const getAPI = (params) => {return axios.post(phpApi + '/unitCost.php', params);};
	    try {
    		const res = await getAPI(params);
    		if(res.status === 200) {
    			if(res.data.success !== false ) {
    				return res.data;
			    }
		    }
	    } catch(err) {
	    	console.error(err);
	    }
	  },
	  async getLayoutSettingAPI(store, params){
		  const getAPI = (params) => {return axios.post(phpApi + '/layoutSetting.php', params);};
      let rtn = false;
		  try {
			  const res = await getAPI(params);
			  if (res.status === 200) {
				  rtn = res.data;
			  }
		  } catch(err) {
			  console.error(err);
		  }
      return rtn;
	  },
    async getMediaPolicyAPI(store, params){
      const getAPI = (params) => {
        return axios.post(phpApi + '/mediaPolicy.php', params);
      };
      let rtn = false;
      try {
        const res = await getAPI(params);
        if (res.status === 200 && res.data.success !== false) {
          rtn = res.data;
        }
      } catch(err) {
      	console.error(err);
      }
      return rtn;
    },
    async getMediaCategoryAPI(store, params){
      const getAPI = (params) => {
        return axios.post(phpApi + '/mediaCategory.php', params);
      };
      let rtn = false;
      try {
        const res = await getAPI(params);
        if(res.status === 200) {
          if(res.data.success !== false ) {
            rtn = res.data;
          }
        }
      } catch(err) {
        console.error(err);
      }
      return rtn;
    },
    async getMediaValueAPI(store, params){
      let loadingGifCommit = ({commit}, data)=>{
        commit('SET_LOADING_GIF', data);
      };
      const getAPI = (params) => {
        return axios.post(phpApi + '/mediaValue.php', params);
      };
      let rtn = false;
      loadingGifCommit(store, true);
      try {
        const res = await getAPI(params);
        if (res.status === 200 && res.data.success !== false) {
          rtn = res.data;
        }
      } catch(err) {
      	console.error(err);
      }
      loadingGifCommit(store, false);
      return rtn;
    },
    async getColumnSettingAPI(store, params) {
      const getAPI = (params) => {
        return axios.post(phpApi + '/columnSetting.php', params);
      };
      let rtn = false;
      try {
        const res = await getAPI(params);
        if (res.status === 200 && res.data.success !== false) {
          rtn = res.data;
        }
      } catch(err) {
        console.error(err);
      }
      return rtn;
    },
    async getEval2AutoAPI(store,params) {
      const getEval2Class = (params) => {
  	    return axios.post(phpApi + '/eval2Auto.php', params);
      };
      let rtn = false;
      try {
        const res = await getEval2Class(params);
        if (res.status === 200 && res.data.success !== false) {
          rtn = res.data;
        }
		    // return store.getters.getEval2Class;
	    } catch (err) {
		    console.error(err);
	    }
      return rtn;
    },
    //2020-04-02 Lee J.W
    async getMediaCategorySelectionAPI(store,params) {
      let loadingGifCommit = ({commit}, data) => {
        commit('SET_LOADING_GIF', data);
      };
      const getMediaCategorySelection = (params) => {
        return axios.post(phpApi + '/mediaCategorySelection.php', params);
      };
      let rtn = false;
      loadingGifCommit(store, true);
      try {
        const res = await getMediaCategorySelection(params);
        if (res.status === 200 && res.data.success !== false) {
          rtn = res.data;
        }
      } catch(err) {
        console.error(err);
      }
      loadingGifCommit(store, false);
      return rtn;
    },
    //2020-04-23 Lee J.W
    async updateMediaCategorySelectionAPI(store,params) {
      let loadingGifCommit = ({commit}, data) => {
        commit('SET_LOADING_GIF', data);
      };
      const updateMediaCategorySelectionAction = (params) => {
        return axios.post(phpApi + '/mediaCategorySelectionAction.php', params);
      };
      let rtn = false;
      loadingGifCommit(store, true);
      try {
        const res = await updateMediaCategorySelectionAction(params);
        if (res.status === 200 && res.data.success !== false) {
          if (res.data) {
            rtn = res.data;
          } else {
            rtn = true;
          }
        }
      } catch(err) {
        console.error(err);
      }
      loadingGifCommit(store, false);
      return rtn;
    },
    async toggleListLayout(store, params) { // 번호를 받는다
      let setListLayout = ({commit}, idx, data) => {
        commit('SET_LIST_LAYOUT_' + idx, data);
      };

      if (Number(params) === 0 || Number(params) === 1 || Number(params) === 2) {
        let org = store.state['listLayout' + String(params)];
        setListLayout(store, Number(params), !org);
      }

      let obj0 = document.querySelectorAll('#evalListWrap')[0];
      let obj1 = document.querySelectorAll('#searchListWrap')[1];
      if (obj0 && !obj0.getAttribute('org')) {
        obj0.setAttribute('org', obj0.offsetWidth);
      }
      if (obj1 && !obj1.getAttribute('org')) {
        obj1.setAttribute('org', obj1.offsetWidth);
      }

      let listLayout0 = store.state.listLayout0;
      let listLayout1 = store.state.listLayout1;
      let listLayout2 = store.state.listLayout2;

      let widths = [];
      if (listLayout0 && listLayout1 && listLayout2) { // 1 O O O
        widths = ['30%', '25%', '45%'];
      } else if (listLayout0 && listLayout1 && !listLayout2) { // 2 O O X
        widths = ['calc(75% - 30px)', '25%', '30px'];
      } else if (listLayout0 && !listLayout1 && listLayout2) { // 3 O X O
        widths = ['calc(55% - 30px)', '30px', '45%'];
      } else if (listLayout0 && !listLayout1 && !listLayout2) { // 4 O X X
        widths = ['calc(100% - 60px)', '30px', '30px'];
      } else if (!listLayout0 && listLayout1 && listLayout2) { // 5 X O O
        widths = ['30px', '25%', 'calc(75% - 30px)'];
      } else if (!listLayout0 && listLayout1 && !listLayout2) { // 6 X O X
        widths = ['30px', 'calc(100% - 60px)', '30px'];
      } else if (!listLayout0 && !listLayout1 && listLayout2) { // 7 X X O
        widths = ['30px', '30px', 'calc(100% - 60px)'];
      } else if (!listLayout0 && !listLayout1 && !listLayout2) { // 8 X X X
        widths = ['30px', '30px', '30px'];
      }

      document.getElementById('evalListWrap').style.width = widths[0];
      document.getElementById('evalValWrap').style.width = widths[1];
      document.getElementById('evalPreviewWrap').style.width = widths[2];

      document.getElementById('searchListWrap').style.width = widths[0];
      document.getElementById('searchValWrap').style.width = widths[1];
      document.getElementById('searchPreviewWrap').style.width = widths[2];
    },
  },

  getters: {
    gethiddenLink1: state => state.hiddenLink1,
    getUserID: state => state.uid,
    getPremiumID: state => state.pid,
    getPremiumPW: state => state.pwd,
    getPremiumEV: state => state.ev,
    getIsAuth: state => state.isAuth,
    getIsPeUser: state => state.isPeUser,
    getMessage: state => state.message,
    getStatSetting: state => state.statSetting,
    getSearchEval0: state => state.searchEval0,
    getSearchEval1: state => state.searchEval1,
    getSearchEval2: state => state.searchEval2,
    getSearchData: state => state.sendSearchData,
    getNewsGroupInfo: state => state.newsGroup, // x
    getValueGroupInfo: state => state.valueGroup, // x
    getMediaCategoryOldList: state => state.mediaCategoryOldList,
    getMediaList: state => state.mediaList, // x
    getMultiEvalArticleList: state => state.multiEvalArticleList,
    getEval1Category: state => state.eval1Category, // x
    getEval1ByCategory: state => state.eval1ByCategory,
    getEval2Class: state => state.eval2Class,
    getEvalInfo: state => state.evalInfo, // x
    getSearchEvalInfo: state => state.searchEvalInfo, // x
    getEval2Cnt: state => state.eval2Cnt, // x
    getDomain : state => state.domain,
    getConfigEval : state => state.configEval,
    getConfigEvalItem : state => state.configEvalItem,
    getConfigEvalGroup : state => state.configEvalGroup,
    getListLayout: state => state.listLayout,
    getDate : state => state.date,
    getPremiumLink : state => state.viewerUri,
  }
});
