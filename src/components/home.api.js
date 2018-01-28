import { CarryHttp } from '@/config/http.config';

const CarrySignJS = require('../../utils/carrySign');

export default {
  // 登录，在这里统一处理userId，token以及其他用户个人信息的全局变量存储（而不是到页面去做这种逻辑处理）
  // 获取公共数据（游戏信息等），无需签名
  // jiangshunbin
  getCommonData(callback) {
    const path = '/game/getCommonData';
    CarryHttp.doGet(path, null, null, callback);
  },
  /**
   * 获取用户信息，旧签名
   * jiangshunbin
   */
  getUserInfo(userId, callback) {
    const path = '/user/getUserInfo';
    CarryHttp.doGet(path,
      {
        loginUserId: userId
      },
      CarrySignJS.OldSign,
      callback);
  },
  /**
   * 获取用户订单列表，新签名
   * jiangshunbin
   */
  getOrderList(userId, callback) {
    const path = '/order/getByUserId';
    // CarryHttp.needCache = true;
    CarryHttp.doGet(path,
      {
        loginUserId: userId,
        pageLastId: '1',
        orderGroupCode: '',
        pageSize: '20'
      },
      CarrySignJS.NewSign,
      callback);
  },
  // 获取消息 Created by :jiangshunbin
  getNotices(loginUserId, type, noticeTags, time, pageLastId, pageSize, callback) {
    const path = '/notice/getNotices';
    const params = {
      loginUserId,
      type,
      noticeTags,
      time,
      pageLastId,
      pageSize
    };

    // //CarryHttp.setMockdataFromJSONFile('notice_getNotices_1.json');
    // CarryHttp.mockdata = notice_getNotices_success_data;
    // CarryHttp.mockdata = notice_getNotices_fail_data;
    CarryHttp.doGet(path, params, CarrySignJS.OldSign, callback);
  }
};
