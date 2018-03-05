import wiierror from './index'

export default function install(Vue, options) {
	if (this.install.installed) return false

	let { isReport, reportUrl } = options

	if (!reportUrl) {
		return console.error(`reportUrl is required`)
	}

	wiierror.reportUrl = reportUrl

	Object.defineProperty(Vue.prototype, '$wiierror', {
		get: () => this
	})

	if(isReport){
		Vue.config.errorHandler = (error, vm, info) => {
			wiierror.sendReport(error, vm, info)
		}
	}

	this.install.installed = true
}