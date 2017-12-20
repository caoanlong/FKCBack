const axios = require('axios')
let getAccessToken = function (callback) {
	let URL = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxe0fd26ab323ce46d&secret=bd97ae9cecab743d31eb3e0c400cdbff'
	return axios.get(URL).then(res => {
		callback(res.data.access_token)
	})
}
module.exports = getAccessToken