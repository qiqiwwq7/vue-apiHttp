/**
 * carry电竞项目 签名算法
 * 如果有token(loginUserId)，则token作为密钥的一部分
 * 新签名需要将参数也参与加密，以防止用户篡改参数
 * jiangshunbin
 */

var CryptoJS = require('./crypto.js').CryptoJS;

// //签名方式，默认无签名
// if (typeof SignType == "0") {
//     var SignType = {};
//     SignType.Sign = '1';      //旧签名，参数不参与计算
//     SignType.APISign = '2';   //新签名，参数需要参与计算，防止参数被篡改
// }

var CarrySign = CarrySign || (function () {
  var Sign = {
    getRandomNum: function (Min, Max) {
      var Range = Max - Min;
      var Rand = Math.random();
      return (Min + Math.round(Rand * Range));
    },

    dateFormat: function (date, fmt) {
      var o = {
        "M+": date.getMonth() + 1,                 //月份
        "d+": date.getDate(),                    //日
        "h+": date.getHours(),                   //小时
        "m+": date.getMinutes(),                 //分
        "s+": date.getSeconds(),                 //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds()             //毫秒
      };

      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
      }

      for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
      }

      return fmt;
    },

    getParamText(params){
      if(params == null){
        return '';
      }

      let keys = Object.keys(params).sort();
      let newParams = {};
      keys.forEach(e=>{
        if(params[e] !== ''){
          newParams[e] = params[e];
        }
      });

      var paramText = '';
      for(var key in newParams){
        if(paramText == ''){
          paramText = key + '=' + newParams[key];
        }else{
          paramText = paramText + '&' + key + '=' + newParams[key];
        }
      }

      return paramText;
    },

    generate: function (timestamp, token, loginUserId, params) {
      var nonce = this.getRandomNum(0, 10000);
      var encryptText = 'timestamp=' + timestamp + '&nonce=' + nonce;
      var paramsText = this.getParamText(params);
      if(paramsText.length > 0){
          encryptText = encryptText + '&' + paramsText;
      }
      var secret = '&';

      if(token != null){
        secret = token + secret;
      }

      //var signature = encodeURIComponent(CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(encryptText, secret)));
      var signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(encryptText, secret));

      var auth = 'nonce:' + nonce + ';signature:' + signature + ';';
      if (loginUserId != null) {
          auth = auth + 'loginUserId:' + loginUserId + ';';
      }

      return {
        // timestamp: timestamp,
        nonce: nonce,
        signature: signature,
        authorization: auth,
        //以下两个返回主要是为了调试方便
        encryptText: encryptText,
        secret: secret
      }
    }
  }

  return Sign;
}());

module.exports = {
    CarrySign: CarrySign,
    // SignType: SignType
    OldSign: '1',
    NewSign: '2'
}
