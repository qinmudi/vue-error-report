// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import VueErrorReport from './plugins/index'

Vue.config.productionTip = false

Vue.use(VueErrorReport,{
	isReport: true,
	reportUrl: 'http://dev.sqm.wiiqq.com/api/fe/save',
  appId: '86805a7139a2b8000'
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>',
  mounted(){
  	var a = [];
    console.log(a.b.f)
  	console.log('init')
  }
})
