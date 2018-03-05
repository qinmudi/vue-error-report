import install from './install'

function getSystemInfo() {
	let ua = navigator.userAgent,
		logMsg = '';

	// device & system
	let ipod = ua.match(/(ipod).*\s([\d_]+)/i),
		ipad = ua.match(/(ipad).*\s([\d_]+)/i),
		iphone = ua.match(/(iphone)\sos\s([\d_]+)/i),
		android = ua.match(/(android)\s([\d\.]+)/i);

	logMsg = 'Unknown';
	if (android) {
		logMsg = 'Android ' + android[2];
	} else if (iphone) {
		logMsg = 'iPhone, iOS ' + iphone[2].replace(/_/g, '.');
	} else if (ipad) {
		logMsg = 'iPad, iOS ' + ipad[2].replace(/_/g, '.');
	} else if (ipod) {
		logMsg = 'iPod, iOS ' + ipod[2].replace(/_/g, '.');
	}
	let templogMsg = logMsg;
	// wechat client version
	let version = ua.match(/MicroMessenger\/([\d\.]+)/i);
	logMsg = 'Unknown';
	if (version && version[1]) {
		logMsg = version[1];
		templogMsg += (', WeChat ' + logMsg);
	}
	return templogMsg;
}

const wiierror = {
	reportUrl: null,
	ua: getSystemInfo(),
	install,
	sendReport(error, vm, info) {
		var ua = this.ua
		var url = encodeURIComponent(location.href)
		var msg = error.message
		var line = info
		var img = new Image()
		img.src = `${this.reportUrl}?agent=${ua}&url=${url}&msg=${msg}&line=${line}`
	}
}

export default wiierror