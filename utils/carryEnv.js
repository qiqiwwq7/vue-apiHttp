/**
 * 运行环境，程序启动时，最先初始化环境，以确定连接哪个服务器
 * jiangshunbin
 */

//程序运行类别（连接哪个服务器）, profileActive
if (typeof AppRunType == "undefined") {
    var AppRunType = {};
    AppRunType.Test = 'test'; //测试环境
    AppRunType.Dev = 'dev';   //开发环境
    AppRunType.Prod = 'prod'; //生产环境
    AppRunType.Buddy = 'jiangshunbin'; //jiangshunbin的电脑
    AppRunType.Mock = 'mock'; //easy-mock地址
}

var CarryEnv = CarryEnv || (function () {
    var Env = {
        apiURL: '',
        staticURL: '',
        envChar: '',

        /**
        * 程序启动时，最先初始化环境，以确定连接哪个服务器，以及各个环境下的一些配置
        */
        init: function (profile) {
            if (profile == AppRunType.Prod) {
                this.apiURL = 'http://api.carry.youmengchuangxiang.com';
                this.staticURL = 'http://static.youmengchuangxiang.com/carry/app';
                this.envChar = '';
            } else if (profile == AppRunType.Test) {
                this.apiURL = 'http://api.test.carry.youmengchuangxiang.com';
                this.staticURL = 'http://static.youmengchuangxiang.com/carry/app-test';
                this.envChar = 'T';
            } else if (profile == AppRunType.Dev) {
                this.apiURL = 'http://172.16.10.2:8082/MasterMarketApi';
                this.staticURL = 'http://static.youmengchuangxiang.com/carry/app-test';
                this.envChar = 'D';
            } else if (profile == AppRunType.Buddy) {
                this.apiURL = 'http://172.16.20.189:8082/MasterMarketApi';
                this.staticURL = 'http://static.youmengchuangxiang.com/carry/app-test';
                this.envChar = 'B';
            } else if (profile == AppRunType.Mock) {
              this.apiURL = 'https://easy-mock.com/mock/59f0c4dfa877056081aedfbc/example';
              this.staticURL = '';
              this.envChar = 'M';
          }
        }
    }

    return Env;
}());

module.exports = {
    AppRunType: AppRunType,
    CarryEnv: CarryEnv
}
