import axios from 'axios';

const CarryEnvJS = require('../../utils/carryEnv');

const CarryEnv = CarryEnvJS.CarryEnv;

CarryEnv.init(ENV); // eslint-disable-line

// axios 配置
axios.defaults.withCredentials = true;
axios.defaults.timeout = 8000;
axios.defaults.baseURL = CarryEnv.apiURL;

// 添加一个请求拦截器
axios.interceptors.request.use(config => config, error => Promise.reject(error));

// 添加一个返回拦截器
axios.interceptors.response.use(response => response, error => Promise.reject(error));

export default axios;
