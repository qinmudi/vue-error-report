# vue-error-report

> 平台组前端错误上报插件

## 安装

```
npm i vue-error-report --save
```

## 引入

```javascript
import VueErrorReport from 'vue-error-report'

Vue.use(VueErrorReport,options)
```

### options

| 参数名 | 参数说明 | 是否必填 |
| - | :-: | -:|
| isReport |  是否开启上报 | 必填 |
| reportUrl | 上报地址 | 必填 |