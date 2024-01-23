import axios from 'axios';
import store from '@/store'

const keywordSet = {
    // 목록 리스트
    "time_DefName" : "#기간#"
    ,"search_DefName" : "#검색#"
    ,"media_DefName" : "#매체#"
    ,"eval_DefName" : "#평가항목#"
    ,"statistics_DefName" : "#통계항목#"
    ,"default_DefName": "#기본"

    // 목록 리스트 안에 리스트
    ,"time" : {
        "#{기간타입}#" : ""
        ,"#{기간시작}#" : ""
        ,"#{기간끝}#" : ""
        ,"#{검색기간}#" : "조회 현재 기준 연월일일시 정보 포맷 미지정시 @yyyyMMdd 가 기본값"  // 설명
    }
    ,"search" : {
        "#{검색범위}#" : ""
        ,"#{검색어}#" : ""
        ,"#{검색어연산자}#" : ""
        ,"#{배제어}#" : ""
        ,"#{배제어연산자}#" : ""
        ,"#{검색조건}#" : ""
    }
    ,"media" : {
        "#{매체선택숫자}#" : "선택숫자 / 전체"
        // ,"#{매체선택숫자T1}#" : "선택숫자 / 전체"
        // ,"#{매체선택숫자T2}#" : "선택숫자(전체 선택시도 숫자)"
        ,"#{매체선택타입}#" : "분류/유형"
        
        ,"#{선택된매체정보}#" : "#{선택된매체정보T1} 동일"
        ,"#{선택된매체정보T1}#" : "분류/유형에서 각 선택된 타입명만  ex. 매체선택타입 유형에서 지면, 온라인, 방송, ..."
        ,"#{선택된매체정보T2}#" : "분류/유형에서 각 선택된 타입명(선택수)  ex. 매체선택타입 유형에서 지면(1), 온라인(3), 방송(4), ..."
        ,"#{선택된매체정보T3}#" : "분류/유형에서 각 선택된 타입명(선택수/전체수)  ex. 매체선택타입 유형에서 지면(1/100), 온라인(3/1000), 방송(4/11), ..."
    }
    ,"eval" : {
        "#{선택된자동평가항목}#" : ""
        ,"#{선택된평가1항목}#" : ""
        ,"#{선택된평가2항목}#" : ""
    }
    ,"statistics" : {
        "#{통계항목1}#" : ""
        ,"#{통계항목2}#" : ""
        ,"#{통계항목3}#" : ""
        ,"#{통계항목4}#" : ""
        ,"#{표시값}#" : "건수/가치"
    }
    ,"default": {
        "#{제목}#":"차트의 기본 제목을 세팅할 수 있다. (구성은 '기간타입 : 통계항목1, ...' 이다)"
    }
    ,"keywordAllList":{
        "#{기간타입}#" : "time"
        ,"#{기간시작}#" : "time"
        ,"#{기간끝}#" : "time"
        ,"#{검색기간}#" : "time"

        ,"#{검색어}#" : "search"
        ,"#{검색범위}#" : "search"
        ,"#{검색어연산자}#" : "search"
        ,"#{배제어}#" : "search"
        ,"#{배제어연산자}#" : "search"
        ,"#{검색조건}#" : "search"
        
        ,"#{매체선택숫자}#" : "media"
        ,"#{매체선택타입}#" : "media"

        ,"#{선택된매체정보}#" : "media"
        ,"#{선택된매체정보T1}#" : "media."
        ,"#{선택된매체정보T2}#" : "media"
        ,"#{선택된매체정보T3}#" : "media"

        ,"#{선택된자동평가항목}#" : "eval"
        ,"#{선택된평가1항목}#" : "eval"
        ,"#{선택된평가2항목}#" : "eval"

        ,"#{통계항목1}#" : "statistics"
        ,"#{통계항목2}#" : "statistics"
        ,"#{통계항목3}#" : "statistics"
        ,"#{통계항목4}#" : "statistics"
        ,"#{표시값}#" : "statistics"
        
        ,"#{제목}#" : "default"
    }
}
const kewordMap = {
    "#{기간타입}#": "dateType"
    ,"#{기간시작}#":"startDate" // dateRange
    ,"#{기간끝}#":"endDate"
    ,"#{검색기간}#": "strDate"

    ,"#{검색범위}#":"searchRange"
    ,"#{검색어}#":"keyword"
    ,"#{검색어연산자}#":"keywordOption"
    ,"#{배제어}#":"notKeyword"
    ,"#{배제어연산자}#":"notKeywordOption"
    ,"#{검색조건}#":"searchCriteria"

    ,"#{매체선택숫자}#":"selectionMediumCount"
    // ,"#{매체선택숫자T1}#":"-"
    // ,"#{매체선택숫자T2}#":"-"
    ,"#{매체선택타입}#":"groupIsCategory"

    ,"#{선택된매체정보}#":"statSelectionMedium"
    ,"#{선택된매체정보T1}#":"selectionMediumType"
    ,"#{선택된매체정보T2}#":"selectionMediumTypeCount"
    ,"#{선택된매체정보T3}#":"selectionMediumTypeRate"

    ,"#{선택된자동평가항목}#":"evaluationItem0"
    ,"#{선택된평가1항목}#":"evaluationItem1"
    ,"#{선택된평가2항목}#":"evaluationItem2"

    ,"#{통계항목1}#":"0" // 통계에서 총괄적으로 선택되는 교차-기준
    ,"#{통계항목2}#":"1"
    ,"#{통계항목3}#":"2"
    ,"#{통계항목4}#":"3"
    ,"#{표시값}#":"calcValue-numberScaleDupe" // (건수/가치) 선택 안할 수 있음(통계에서.. 템플릿에서 개별로 들어감)
    // ,"#{금액단위}#":"-" // 선택 안할 수 있음(통계에서.. 템플릿에서 개별로 들어감)
}
const javaApi = (
    process.env.VUE_APP_USE_SERVE_JAVA === undefined 
        ? process.env.VUE_APP_JAVA_SERVE_HOST+'/'+process.env.VUE_APP_JAVA_SERVE_CONTEXT
        : '/javaApi'
);
const methods = {
    checkUser: async function(userId) {
        let param = new URLSearchParams();
        let res = null;
        try {
            param.append("smID", userId);
            res = await axios.post(
                javaApi+"/settings.premium"
                , param
            );
            if (res.data.result == "SUCCESS") {
                if (res.data.settingInfo.versionStat < 3) {
                    alert("신프리미엄 사용 권한이 없습니다.");
                    return false;
                }
                store.state.viewerUri 
                    = res.data.settingInfo.webViewerUrl;
                return true;
            }
        } catch(e) { console.error("checkUser() error: ", e) }
        return false;
    },

    /**
     * @description base API
     * @param {string} targetUrl 
     * @param {object} inputData 
     * @param {string} condition 
     * @param {boolean} isCallbackData 
     * @returns json
     */
    funcJSONRequest: async function(targetUrl, inputData, condition, isCallbackData) {
        /* 깊은 복사 */
        let data = typeof inputData !== "string" ? JSON.parse(JSON.stringify(inputData)) : inputData;
        /* 프리미엄 */ 
        if (!data) data = {"pid" : store.state.pid};
        else if (condition == 'office') {}
        else if (Array.isArray(data)) data.forEach(el => el.pid = store.state.pid);
        else data.pid = store.state.pid;
        
        let param = new URLSearchParams(); 
        /* 파라미터 세팅 */
        if (condition==="office") { /* 엑셀, 워드 */
            param.append("param", typeof data === "string" ? data : JSON.stringify(data));
        } else { 
            if (condition==="tab-order") {
                /* 탭 순서 변경 요청 */
                param.append("pid", store.state.pid);
                param.append("reorder", JSON.stringify(data));
            } else {
                /* 템플릿, 보고서, 탭 관련 요청*/
                for (const [key, value] of Object.entries(data)) {    
                    if (key==="config") param.append(key, JSON.stringify(value));
                    else if (condition==="create" && key==="seq") {/*최초 저장: seq=null*/}
                    else if (condition==="modify" && key==="active") {/*수정: active=null*/}
                    else if (key==="fkey") param.append("fKey", value); /* Tab */
                    else if (key==="skey") param.append("sKey", value); /* Tab */
                    else if (key==="tkey") param.append("tKey", value); /* Tab */
                    else if (key==="value") param.append(key, JSON.stringify(value)); /* Tab */
                    else param.append(key, value);
                }
                /*보고서 seq=1,2 제외*/
                if (condition.includes("list-exc")) param.append("callCustomListOnly", true);
            }
        }

        let headerOption = {};
        if (condition === 'office') headerOption['responseType'] = 'arraybuffer';
        let res = null;
        
        try {
            res = await axios.post(
                javaApi + targetUrl + ".eval.json"
                , param
                , headerOption
            ); 
        } catch(e) { alert("Network or API Request Error"); } /* 리뉴얼된 DB 사용자가 아니면 오류 해당 알림창이 뜰 수 있다. */

        // success
        if (res.status === 200 && isCallbackData) {
            const ret = res.data;
            if (condition.includes('office')) return res;
            else if (ret.result==="SUCCESS" && ret.tmpltRprtList && ret.tmpltRprtList.tmpltRprt) { 
                /* reponse Template, Report */
                ret.tmpltRprtList.tmpltRprt
                .forEach(e => {
                    e.config = JSON.parse(e.config);
                });
                return ret.tmpltRprtList.tmpltRprt;
            } else if (ret.result==="SUCCESS" && ret.tabList && ret.tabList.tab) { 
                /* reponse Tab */
                ret.tabList.tab.forEach(e => {
                    e.value = JSON.parse(e.value);
                });
                return ret.tabList.tab;
            } else if (ret.result==="FAIL" && ret.action.includes("delete")) {
                if (ret.tmpltRprtList && ret.tmpltRprtList.tmpltRprt) {
                    ret.tmpltRprtList.tmpltRprt
                    .forEach(e => {
                        e.config = JSON.parse(e.config);
                    });
                    return ret.tmpltRprtList.tmpltRprt;
                } else if (ret.tabList && ret.tabList.tab) {
                    ret.tabList.tab.forEach(e => {
                        e.value = JSON.parse(e.value);
                    });
                    return ret.tabList.tab;
                }
            }
        }
    },


    async downloadOffice(filename, type, data) {
        const url = {
            "xlsx":"/excel.export",
            "docx":"/word.export"
        };
        const answer = await this.funcJSONRequest(url[type], data, 'office', true);
        if (!answer) return null;
        !filename && (filename = '통계문서');
        const oURL = window.URL.createObjectURL(new Blob([answer.data], {type: answer.headers["content-type"] }));
        const link = document.createElement("a");
        link.href = oURL;
        link.download = filename +'.'+ type // answer.headers["content-disposition"].split("=")[1]; 서버에서 설정한 제목을 사용할 때
        link.click();
        window.URL.revokeObjectURL(url);
    },


    /**
     * @description
     *  kind: single, list
     *  type: 'template', 'report', report-e, 'menutab'
     * @param {string} kind 
     * @param {string} type 
     * @returns json
     */
    async funcLoadRecode(kind, type, data) {
        const t = type.toLowerCase();
        let url = null;
        let cond = null;
        if (t == 'template') {
            if (kind == 'single') cond = "read template";
            else if (kind == 'list') cond = "read template list";
            url = "/read.template";
        } else if (t == 'report') {
            if (kind == 'single') cond = "read report";
            else if (kind == 'list') cond = "read report list";
            else if (kind == 'list-exc') cond = "read report list-exc"; // exceptions
            url = "/read.report";
        } else if (t == 'tab') {
            if (kind == 'single') cond = "read menutab";
            else if (kind == 'list') cond = "read menutab list";
            url = "/read.menutab";
        }
        return await this.funcJSONRequest(
            url, (!data ? null : data), cond, true);
    },

    /**
     * @description
     *  type: 'template', 'report', 'menutab'
     * @param {string} type 
     * @param {object} data 
     * @param {...any} etc
     * @returns Returns the data whose value is modified by etc
     */
    async funcCreateRecode(type, data) {
        const name = type.toLowerCase();
        const _url = {
            template:"/create.template",
            report: "/create.report",
            tab: "/create.menutab"
        };
        return await this.funcJSONRequest(_url[name], data, "create", true);
    }, // funcCreateTemplates


    /**
     * @description
     *  type: 'template', 'report', 'menutab'
     * @param {string} type 
     * @param {object} data 
     * @returns undefined
     */
    async funcDeleteRecode(type, data) {
        if (data.seq === undefined) return;
        const name = type.toLowerCase();
        const _url = {
            template:"/delete.template",
            report: "/delete.report",
            tab: "/delete.menutab"
        };
        const link = await this.funcJSONRequest(_url[name], data, "delete", true);
        
        const ex = (link) ? link.length : 0;
        if (ex !== 0) {
            const notice = this.funcNotice(link, ex, name != 'report' ? '보고서' : '탭');
            alert(notice);
            return ; // 삭제 취소 클릭시
        }
    }, // funcDeleteTemplates


    /**
     * @description
     *  type: 'template', 'report', 'menutab'
     *  - active=null 이면 title, description, config가 수정.
     *  - active=number이면 active만 수정.
     * @param {string} type 
     * @param {object} data
     * @returns Returns the data whose value is modified by etc
     */
    async funcModifyRecode(type, data) {
        const name = type.toLowerCase();
        const _url = {
            template:"/update.template",
            report: "/update.report",
            tab: "/update.menutab"
        }
        await this.funcJSONRequest(_url[name], data, "modify", false);
        return data;
    }, // funcEditTemplates


    /**
     * @description
     *  type: 'template', 'report'
     * @param {click.$event} e 
     * @param {object} data 
     * @param {string} type 
     */
    funcActive(e, data, type) {
        const name = type.toLowerCase();
        const _url = {
            template:"/update.template",
            report: "/update.report"
        }
        let num = parseInt(e.target.getAttribute('data-active'));
        data.active = num;
        this.funcJSONRequest(
            _url[name]
            , data
            , "active"
            , false
        );
    },
    

    /*************************************************************************/
    /***************************     기타 기능     ****************************/
    /*************************************************************************/

    /**
     * @description: yes: <body> Scrollable / no: <body> Non-scrollable
     * @param {boolean} yes
     * @returns 
     */
    bodyScrolling(scrollable) { 
        if (!document) return;
        const body = document.querySelector('body');
        if (!body) return;
        body.className = (scrollable) ? "" : "outside-non-scrolling";
    },

    // 연결된 항목(데이터) 확인 메세지
    funcNotice(linkedItem, _len, title) {
        let dupl = [];
        let str = '[현재 연결된 '+title+']\n\n';
        for (let _c = 0; _c < _len; _c++) {
            const s = linkedItem[_c].seq
            if (dupl.includes(s)) continue;
            dupl.push(s);
            str += 
            '- 제목: ' + (title!="탭"?linkedItem[_c].title:linkedItem[_c].alias) +
            ' / 등록날짜: ' + (title!="탭"?linkedItem[_c].regDate.slice(0, 10)
                                        :linkedItem[_c].value.regDate.slice(0, 10)) +
            '\n\n';
        } str += '연결된 상위 데이터를 먼저 삭제하십시오.';
        dupl = null;
        return str;
    },


    deepCopy(obj) {
        if(typeof obj !== 'object' || obj === null) {
            return obj;
        }
        if(obj instanceof Date) {
            return new Date(obj.getTime());
        }
        if(obj instanceof Array) {
            return obj.reduce((arr, item, i) => {
                arr[i] = this.deepCopy(item);
                return arr;
            }, []);
        }
        if(obj instanceof Object) {
            return Object.keys(obj).reduce((newObj, key) => {
                newObj[key] = this.deepCopy(obj[key]);
                return newObj;
            }, {})
        }
    },

    //rgb to hex 워드에서 rgb 값으로 색상을 가지지 않는다.
    rgbToHex(rgb) {
        if( rgb.startsWith('rgb') ) {
            rgb = rgb.substring( rgb.indexOf('(')+1, rgb.indexOf(')') );
            rgb = rgb.replaceAll(' ', '');
        }
        let rgbArr = rgb.split(',');
        //3보다 작을 경우 이건 잘못 전달된 rgb이다.
        if( rgbArr.length < 3 ) return rgb;
        rgbArr = rgbArr.slice(0,3);
        let hex = '#';
        rgbArr.map(function(c, i){
            hex += parseInt(c).toString(16);
        });
        return hex;
    },

    waitImageLoading() {
        return new imgsLoading();
    },
}

//이미지 로딩 기다리기
class imgsLoading {
    constructor() {
        this.total = 0;
        this.ready = 0;
        this.intervalTime = 500;
        this.intervalResult = new Function();
    }
    isAllReady(){
        if( this.ready >= this.total ) {
            return true;
        }
        return false;
    }
    setReady() {
        ++this.ready;
        //return this.isAllReady();
    }
    setTotal() {
        ++this.total;
    }
    setTntervalResult(func) {
        this.intervalResult = func;
    }
    runInteval(c){	//c = class
        if( c === undefined ) c = this;
        setTimeout(function(){
            let result = c.isAllReady();
            if( result ) {
                c.intervalResult();
            } else {
                c.runInteval(c);
            }
        }, c.intervalTime);
    }
}


export default {
    install (Vue) {
        Vue.prototype.$statConfig = methods
        Vue.prototype.$keywordSet = keywordSet
        Vue.prototype.$keywordMap = kewordMap
        Vue.prototype.$regex = new RegExp('^.M','g')
    }
}