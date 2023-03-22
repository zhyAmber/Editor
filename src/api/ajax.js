import axios from 'axios';
import storageUtils from '../utils/storageUtils';

const instance = axios.create({
  baseURL: 'http://127.0.0.1:5000'
});

//instance.defaults.withCredentials = true;
//拦截处理器 axios在发送之前 从本地存储中获取token
instance.interceptors.request.use(
  config => {
    let uToken = storageUtils.getToken();
    if (uToken) {
      config.headers['Authorization'] = uToken;
    }
    return config;
  },
  error => {
    console.log('发送失败了');
    Promise.reject(error);
  }
);

//拦截处理器 axios截取response并对数据作出统一处理
instance.interceptors.response.use(
  res => {
    return res;
  },
  error => {
    storageUtils.removeToken();
    storageUtils.removeUser();
  }
);

export default instance;
