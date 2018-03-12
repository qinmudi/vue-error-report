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

	if(isReport){
		wiierror.init()
	}

	this.install.installed = true
}