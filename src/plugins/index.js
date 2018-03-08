import install from './install'

/*
 *格式化参数
 */
const formatParams = function(data) {
	var arr = [];
	for (var name in data) {
		arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
	}
	return arr.join("&");
}

const wiierror = {
	reportUrl: '',
	options: {
		timespan: '', //发送数据时的时间戳
		level: 'error', //js日志错误级别，如warning, error, info, debug
		msg: '', //错误的具体信息,
		user_agent: navigator.userAgent, //userAgent
		app_id: '', //项目 id
		url: location.href, //上报页面地址
		stack: '', //错误堆栈
		data: {} //更多错误信息
	},
	install,
	processStackMsg(error) {
		var stack = error.stack
			.replace(/\n/gi, '') // 去掉换行，节省传输内容大小
			.replace(/\bat\b/gi, '@') // chrome中是at，ff中是@
			.split('@') // 以@分割信息
			.slice(0, 9) // 最大堆栈长度（Error.stackTraceLimit = 10），所以只取前10条
			.map((v) => v.replace(/^\s*|\s*$/g, '')) // 去除多余空格
			.join('~') // 手动添加分隔符，便于后期展示
			.replace(/\?[^:]+/gi, ''); // 去除js文件链接的多余参数(?x=1之类)
		var msg = error.toString();
		if (stack.indexOf(msg) < 0) {
			stack = msg + '@' + stack;
		}
		return stack;
	},
	formatComponentName(vm) {
		if (vm.$root === vm) return 'root';
		var name = vm._isVue ? (vm.$options && vm.$options.name) || (vm.$options && vm.$options._componentTag) : vm.name;
		return (name ? 'component <' + name + '>' : 'anonymous component') + (vm._isVue && vm.$options && vm.$options.__file ? ' at ' + (vm.$options && vm.$options.__file) : '');
	},
	report_performance() {
		/* performance 对象 */
		var performance = window.webkitPerformance || window.msPerformance || window.performance;
		/* 所需信息 */
		var points = [
			'navigationStart', /* 开始浏览的时间 */
			'unloadEventStart', 'unloadEventEnd', /* 卸载上一个页面的时间 */
			'redirectStart', 'redirectEnd', /* HTTP重定向所消耗的时间 */
			'fetchStart', 'domainLookupStart', /* 缓存加载的时间 */
			'domainLookupStart', 'domainLookupEnd', /* DNS查询的时间 */
			'connectStart', 'connectEnd', /* 建立TCP连接的时间 */
			'connectStart', 'requestStart', 'responseStart', 'responseEnd', /* 建立TCP连接的时间 */
			'domInteractive', /* 可以交互的时间 */
			'domContentLoadedEventStart', 'domContentLoadedEventEnd', /* DomContentLoaded  页面加载完成的时间*/
			'domLoading', 'domComplete', /* 页面渲染的时间 */
			'domLoading', 'navigationStart', /* 加载页面花费的总时间 */
			'loadEventStart', 'loadEventEnd', /* 加载事件的时间 */
			'jsHeapSizeLimit', 'totalJSHeapSize', 'usedJSHeapSize', /* 内存的使用情况 */
			'redirectCount', 'type' /* 页面重定向的次数和类型 */
		]
		/* 性能对象的属性 */
        var timing = performance.timing,
            memory = performance.memory,
            navigation = performance.navigation
        /* 判断性能对象是否可用 */
        if (performance && timing && memory && navigation) {
            /* 组装统计的信息 */
            var m = {
                timing: timing,
                memory: memory,
                navigation: navigation,
                userAgent: navigator.userAgent,
                url: location.href,
                data: + new Date  /* + 相当于 .valueOf()  */
            }
            /* 打印出上传的信息 */
            console.log(m);
        }
	},
	sendReport(data) {
		// this.report_performance()
		var img = new Image()
		img.onload = img.onerror = function() {
			img = null
		}
		var reqData = Object.assign({}, this.options, data, {
			timespan: new Date().getTime(),
			url: location.href
		})
		img.src = `${this.reportUrl}?${formatParams(reqData)}`
	},
	send(error, vm) {
		var componentName = this.formatComponentName(vm);
		this.options.msg = error.message ? error.message : ''
		this.options.stack = error.stack ? error.stack : ''
		this.options.data = JSON.stringify({
			category: 'style',
			componentName: componentName
		});
		this.sendReport(this.options)
	}
}

export default wiierror