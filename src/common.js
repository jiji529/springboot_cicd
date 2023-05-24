export default {
  install(Vue) {
    Vue.prototype.$as = function () {
      let rtn = null;
      if (arguments.length < 3 || arguments[0] === undefined
          || !(arguments[0].constructor.name === 'Object' || arguments[0].constructor.name === 'Array')) {
        return rtn;
      }
      try {
        rtn = arguments[0];
        for (var i = 1; i < arguments.length - 1; i++) {
          if (rtn[arguments[i]] === undefined) break;
          rtn = rtn[arguments[i]];
        }
        rtn = (rtn !== undefined) ? rtn : arguments[arguments.length - 1];
      } catch (e) {
        rtn = arguments[arguments.length - 1];
      }
      return rtn;
    }
  }
};
