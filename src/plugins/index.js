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
	init(){
		//Ajax监控
		var s_ajaxListener = new Object();
		s_ajaxListener.tempSend = XMLHttpRequest.prototype.send; //复制原先的send方法
		s_ajaxListener.tempOpen = XMLHttpRequest.prototype.open; //复制原先的open方法
		//重写open方法,记录请求的url
		XMLHttpRequest.prototype.open = function(method, url, boolen) {
			s_ajaxListener.tempOpen.apply(this, [method, url, boolen]);
			this.ajaxUrl = url;

		};
		XMLHttpRequest.prototype.send = function(_data) {
			var oldReq = this.onreadystatechange
			this.onreadystatechange = function() {
				if (this.readyState == 4) {
					if (this.status >= 200 && this.status < 300) {
						oldReq?oldReq.apply(this, [_data]):''
					} else {
						wiierror.options.msg = 'ajax请求错误';
						wiierror.options.stack = `错误码：${this.status}`
						wiierror.options.data = JSON.stringify({
							fileName: this.ajaxUrl,
							category: 'ajax',
							text: this.statusText,
							status: this.status
						})
						// 合并上报的数据，包括默认上报的数据和自定义上报的数据
						var reportData = Object.assign({}, wiierror.options)
						// 把错误信息发送给后台
						wiierror.sendReport(reportData)
					}
				}
			}
			s_ajaxListener.tempSend.apply(this, [_data])
		};

		//监控资源加载错误(img,script,css,以及jsonp)
		window.addEventListener('error', function(e) {
			var target = e.target ? e.target : e.srcElement;
			wiierror.options.msg = e.target.localName + ' is load error';
			wiierror.options.stack = 'resouce is not found';
			wiierror.options.data = JSON.stringify({
				tagName: e.target.localName,
				html: target.outerHTML,
				type: e.type,
				fileName: e.target.currentSrc,
				category: 'resource'
			});
			if (e.target != window) {
				//抛去js语法错误
				// 合并上报的数据，包括默认上报的数据和自定义上报的数据
				var reportData = Object.assign({}, wiierror.options);
				wiierror.sendReport(reportData)
			}
		}, true);

		//监控js错误
		window.onerror = function(msg, _url, line, col, error) {
			if (msg === 'Script error.' && !_url) {
				return false;
			}
			//采用异步的方式,避免阻塞
			setTimeout(function() {
				//不一定所有浏览器都支持col参数，如果不支持就用window.event来兼容
				col = col || (window.event && window.event.errorCharacter) || 0;
				if (error && error.stack) {
					//msg信息较少,如果浏览器有追溯栈信息,使用追溯栈信息
					wiierror.options.msg = msg;
					wiierror.options.stack = error.stack;
				} else {
					wiierror.options.msg = msg;
					wiierror.options.stack = '';
				}
				wiierror.options.data = JSON.stringify({
					url: this.ajaxUrl,
					fileName: _url,
					category: 'javascript',
					line: line,
					col: col
				})
				// 合并上报的数据，包括默认上报的数据和自定义上报的数据
				var reportData = Object.assign({}, wiierror.options)
				// 把错误信息发送给后台
				wiierror.sendReport(reportData)
			}, 0);

			return true; //错误不会console浏览器上,如需要，可将这样注释
		}

		//监控 promise 异常
		window.addEventListener('unhandledrejection', function(event){
			// 进行各种处理
			wiierror.options.msg = event.reason;
			wiierror.options.data = JSON.stringify({
				url: location.href,
				category: 'promise'
			})
			wiierror.options.stack = 'promise is error';
			var reportData = Object.assign({}, wiierror.options);
			wiierror.sendReport(reportData)
			// 如果想要阻止继续抛出，即会在控制台显示 `Uncaught(in promise) Error` 的话，调用以下函数
			event.preventDefault()
		},true)

		//Vue异常监控
		Vue.config.errorHandler = (error, vm, info) => {
			var componentName = wiierror.formatComponentName(vm);
			// var propsData = vm.$options && vm.$options.propsData;

			wiierror.options.msg = error.message;
			wiierror.options.stack = wiierror.processStackMsg(error);
			wiierror.options.data = JSON.stringify({
				category: 'vue',
				componentName: componentName,
				// propsData: propsData,
				info: info
			});

			// 合并上报的数据，包括默认上报的数据和自定义上报的数据
			var reportData = Object.assign({}, wiierror.options);
			wiierror.sendReport(reportData)
		}
	},
	stop(){
		this.sendReport = function(){}
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