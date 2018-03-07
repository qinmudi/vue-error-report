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
			.slice(0, 5) // 最大堆栈长度（Error.stackTraceLimit = 10），所以只取前10条
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
	sendReport(data) {
		var img = new Image()
		this.options.timespan = new Date().getTime()
		this.options.url = location.href
		var reqData = Onject.assign({}, this.options, data)
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