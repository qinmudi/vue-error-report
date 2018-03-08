# vue-error-report

> 平台组前端错误上报插件，会自动收集以下几点：
> 问题静态资源加载
> Ajax请求
> Vue语法错误
> Javascript语法错误

## 安装

```
npm i vue-error-report --save
```

## 引入

```javascript
import VueErrorReport from 'vue-error-report'

Vue.use(VueErrorReport,options)
```

## 实例
```javascript
Vue.use(VueErrorReport,{
    isReport: true,
    reportUrl: 'https://ping.qq.com',
    appId: ''
})
```

### options

| 参数名 | 参数说明 | 是否必填 |
| - | :-: | -:|
| isReport |  是否开启上报 | 必填 |
| reportUrl | 上报地址 | 必填 |
| appId     | 项目id  | 必填 |