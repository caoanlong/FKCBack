const axios = require('axios')
let setMenu = function (callback, access_token) {
	let URL = 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token=' + access_token
	let params = {
		"button":[
			{
				"type": "view",
				"name": "91疯狂猜",
				"url": `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxe0fd26ab323ce46d&redirect_uri=${encodeURIComponent('http://admin.91fkc.com/weixin/getOpenID')}&response_type=code&scope=snsapi_base&state=index#wechat_redirect`
			},
			{
				"type": "view",
				"name": "免费领豆",
				"url": `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxe0fd26ab323ce46d&redirect_uri=${encodeURIComponent('http://admin.91fkc.com/weixin/getOpenID')}&response_type=code&scope=snsapi_base&state=free#wechat_redirect`
			}
		]
	}
	return axios.post(URL, params).then(res => {
		callback(res.data)
	})
}
module.exports = setMenu