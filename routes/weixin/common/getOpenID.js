const axios = require('axios')
let getOpenID = function (callback, code) {
	let URL = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=wxe0fd26ab323ce46d&secret=bd97ae9cecab743d31eb3e0c400cdbff&code=${code}&grant_type=authorization_code`
	return axios.get(URL).then(res => {
		callback(res.data.openid)
	})
}
module.exports = getOpenID