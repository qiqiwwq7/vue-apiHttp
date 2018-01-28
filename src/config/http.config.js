/**
 * Carry电竞接口Http请求
 * 请求时，可以没有签名，或是使用旧签名（参数不参与计算），或是使用新签名（参数参与加密）
 * 若指定了mockdata，则认为是请求者在测试，直接返回数据
 * 若网络不通，则不发起请求，而直接吐司提示用户网络异常，同时，看请求的API是否启用了缓存，若启用了，则读取缓存数据返回给调用者
 * 真正请求时，如果启用了缓存，则将数据缓存起来，以防下次请求异常时直接返回；同时，解析出data数据返回给调用者
 * 所有的返回数据进行统一处理（错误吐司提示，签名失败跳转到登录界面，正确数据去掉状态码等外壳，只返回数据给请求者）
 * jiangshunbin
 */
import commonData from './commondata';
import axios from './axios.config';

const signJs = require('../../utils/carrySign');

const CarrySign = signJs.CarrySign;

// var CarrySignType = signJs.CarrySignType;

// const RESULT_OK = "0";

// const ERROR_REQUEST = { code: 1000001, msg: '网络请求异常' },
// const ERROR_REQUEST_NET_AVAILABLE = { code: 1000002, msg: '网络未连接' },
// const ERROR_REQUEST_VALID_DATA = { code: 1000003, msg: '返回数据解析失败' },
const HTTPResultCode = {
  RESULT_OK: '0',
  ERROR_REQUEST: {
    code: 1000001,
    msg: '网络请求异常'
  },
  ERROR_REQUEST_NET_AVAILABLE: {
    code: 1000002,
    msg: '网络未连接'
  },
  ERROR_REQUEST_VALID_DATA: {
    code: 1000003,
    msg: '返回数据解析失败'
  }
};


const Http = {
  // 测试数据(因js代码的特殊性，无需定义mockService)
  mockdata: null,
  // 是否启用缓存，若启用，则以请求参数（排序后）作为key，来存储数据，分页参数也一样以支持分页数据的缓存
  needCache: false,
  doRequest(method, apiPath, params, signType, terminal, callback) {
    // var self = this;
    // commonData.token = '5AAF208A977CCFCC6881793B19C9E77E';
    // commonData.loginUserId = '975689757604734976';

    // 首先，若是使用测试数据（MockData），则直接返回测试数据
    if (this.mockdata != null) {
      this.analysisData(this.mockdata, callback);
      return;
    }

    // const requestURL = CarryEnv.apiURL + apiPath;

    // 构造缓存的key
    let cacheKey = null;
    if (this.needCache) {
      cacheKey = `${apiPath}?${CarrySign.getParamText(params)}`;
    }

    // 其次，检查网络是否畅通，若网络不通，给出网络异常的提示
    // if(网络不通){ // @TODO:  什么意思？？？？？？
    //     this.processError(HTTPResultCode.ERROR_REQUEST_NET_AVAILABLE.code,
    //                       HTTPResultCode.ERROR_REQUEST_NET_AVAILABLE.msg, callback, cacheKey);

    //     return;
    // }

    // 最后，真正的发起网络请求
    const timestamp = new Date().getTime();
    const requestHeader = {
      // 'content-type': 'application/x-www-form-urlencoded',
      'content-type': 'application/json',
      TerminalDef: terminal,
      DateTime: timestamp
      // 'Authorization': signInfo.authorization
    };
    // 如果接口需要签名，则看是用的旧签名还是新签名
    if (signType != null) {
      let signInfo = null;
      if (signType === signJs.OldSign) { // 旧签名
        signInfo = CarrySign.generate(timestamp, commonData.token, commonData.loginUserId);
      } else if (signType === signJs.NewSign) { // 新签名
        signInfo = CarrySign.generate(timestamp, commonData.token, commonData.loginUserId, params);
      }

      if (signInfo != null) {
        requestHeader.Authorization = signInfo.authorization;
      }
    }

    let data = {}; // eslint-disable-line
    if (params != null) {
      data = params;
    }


    axios({
      url: apiPath,
      method,
      headers: requestHeader,
      data
    }).then((response) => { // 200返回，给返回数据去壳，识别是成功数据还是失败数据
      this.analysisData(response.data, callback, self.needCache ? cacheKey : null);
    }).catch((err) => {
      let errCode = HTTPResultCode.ERROR_REQUEST.code;
      const errMsg = HTTPResultCode.ERROR_REQUEST.msg;
      if (err.response != null) {
        // 处理 400，401，404，500等等错误
        errCode = err.response.status;
      }
      this.processError(errCode, errMsg, callback, cacheKey);
    });
  },

  doGet(apiPath, params, signType, callback) {
    this.doRequest('GET', apiPath, params, signType, commonData.terminalDef, callback);
  },

  doPost(apiPath, params, signType, callback) {
    this.doRequest('POST', apiPath, params, signType, commonData.terminalDef, callback);
  },

  // 读取缓存数据
  getCacheData(key) { // eslint-disable-line
    // TODO key
  },
  // 保存缓存数据
  setCacheData(key, data){ // eslint-disable-line
    // TODO
  },
  // 解析数据(若指定了cacheKey，则缓存数据)
  analysisData(response, callback, cacheKey) {
    try {
      if (response.code === HTTPResultCode.RESULT_OK) {
        // 如果请求需要缓存，则存储缓存数据
        if (this.needCache && cacheKey != null && response.data != null) {
          this.setCacheData(cacheKey, response.data);
        }

        if (callback != null) {
          callback.onSuccess(response.data);
        }
      } else {
        this.processError(response.code, response.message, callback, null, response.data);
        // 正常返回（200）错误时，不能将缓存数据交给前台
      }
    } catch (error) {
      this.processError(HTTPResultCode.ERROR_REQUEST_VALID_DATA.code,
        HTTPResultCode.ERROR_REQUEST_VALID_DATA.msg, cacheKey);
    }
  },
  // 处理请求错误，启用了缓存则返回缓存数据
  processError(code, message, callback, cacheKey, errData) {
    this.unifiedError(code, message);

    // 虽然是错误，统一错误处理（吐司提示）后，有缓存把缓存数据当作成功回调处理。（不再回传错误，调用者不用关心是否已经失败）
    if (this.needCache && cacheKey != null) {
      const cacheData = this.getCacheData(cacheKey);
      if (cacheData != null) {
        callback.onSuccess(cacheData); // 用户得到了上次的缓存数据，根本不知道请求已经失败
        return;
      }
    }

    if (callback != null) {
      callback.onFail({
        code,
        message,
        data: errData
      });
    }
  },
  // 错误统一处理
  // 1，组织返回给用户看到的错误描述——服务端返回的有些描述属于技术语言，不适合直接呈现给用户
  // 2，401错误为签名验算失败的错误，具体的错误消息不告知用户，直接弹出登录窗口让用户重新登录
  // 3，其他的一些错误码统一处理
  unifiedError(code, message) {
    let msg = message;

    if (code === 400 || code === 404 || HTTPResultCode.ERROR_REQUEST_NET_AVAILABLE.code === code) {
      msg = '访问服务器失败，请检查网络是否畅通';
    } else if (code === 1100) { // app 必须升级，理论上浏览器端不会出现这个错误
      msg = null; // 对于一些特殊的错误，不需要吐司提示给用户
    } else if (code === 401) {
      msg = null;
      // 弹出登录窗口 TODO
    }

    if (msg != null) {
      // TODO  吐司提示
    }
  }
};

const CarryHttp = Http;

export {
  CarryHttp,
  HTTPResultCode
};
