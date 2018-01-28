/**
 * API接口请求定义，所有的API都在这里定义，页面里直接使用这里的方法，拿到业务数据进行处理即可
 * 有的接口直接在这层不返回失败的回调，因为经过统一错误处理后，页面并不需要错误返回
 * jiangshunbin
 */

var CarrySignJS = require('carrySign.js');
var CarryHttp = require('carryHttp.js').CarryHttp;
var notice_getNotices_success_data = require('./mockdata/notice_getNotices_success.js').default;
var notice_getNotices_fail_data = require('./mockdata/notice_getNotices_fail.js').default;

var CarryAPI = CarryAPI || (function () {
    var APIs = {
        //登录，在这里统一处理userId，token以及其他用户个人信息的全局变量存储（而不是到页面去做这种逻辑处理）

        //获取公共数据（游戏信息等），无需签名
        //jiangshunbin
        getCommonData: function (callback){
            var path = '/game/getCommonData';
            CarryHttp.doGet(path, null, null, callback);
        },

        /**
         * 获取用户信息，旧签名
         * jiangshunbin
         */
        getUserInfo: function (userId, callback){
            var path = '/user/getUserInfo';
            CarryHttp.doGet(path, 
                {
                    'loginUserId': userId
                }, 
                CarrySignJS.OldSign, 
                callback);
        },

        /**
         * 获取用户订单列表，新签名
         * jiangshunbin
         */
        getOrderList: function (userId, callback) {
            var path = '/order/getByUserId';
            // CarryHttp.needCache = true;
            CarryHttp.doGet(path,
                {
                    'loginUserId': userId,
                    'pageLastId': '1',
                    'orderGroupCode': '',
                    'pageSize': '20'
                },
                CarrySignJS.NewSign,
                callback);
        },

        // 获取消息 Created by :jiangshunbin
        getNotices: function (loginUserId, type, noticeTags, time, pageLastId, pageSize, callback) {
            var path = '/notice/getNotices';
            var params = {
                loginUserId: loginUserId,
                'type': type,
                noticeTags: noticeTags,
                time: time,
                pageLastId: pageLastId,
                pageSize: pageSize
            }

            ////CarryHttp.setMockdataFromJSONFile('notice_getNotices_1.json');
            CarryHttp.mockdata = notice_getNotices_success_data;
            // CarryHttp.mockdata = notice_getNotices_fail_data;
            CarryHttp.doGet(path, params, CarrySignJS.OldSign, callback);
        },


    }

    return APIs;
}());

module.exports = {
    CarryAPI: CarryAPI
}