import wiierror from './index'

export default function install(Vue, options) {
	if (this.install.installed) return false

	let {isReport,reportUrl,appId} = options

	if (!reportUrl&&!appId) {
		return console.error(`reportUrl&appId is required`)
	}

	wiierror.reportUrl = reportUrl
	wiierror.options = Object.assign({},wiierror.options,{app_id: appId})

	Object.defineProperty(Vue.prototype, '$wiierror', {
		get: () => this
	})

	if (isReport) {
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
			s_ajaxListener.tempSend.apply(this, [_data]);
			this.onreadystatechange = function() {
				if (this.readyState == 4) {
					if (this.status >= 200 && this.status < 300) {
						return true;
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
				wiierror.options.timespan = new Date().getTime()
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
			var propsData = vm.$options && vm.$options.propsData;

			wiierror.options.msg = error.message;
			wiierror.options.stack = wiierror.processStackMsg(error);
			wiierror.options.data = JSON.stringify({
				category: 'vue',
				componentName: componentName,
				propsData: propsData,
				info: info
			});

			// 合并上报的数据，包括默认上报的数据和自定义上报的数据
			var reportData = Object.assign({}, wiierror.options);
			wiierror.sendReport(reportData)
		}
	}

	this.install.installed = true
}