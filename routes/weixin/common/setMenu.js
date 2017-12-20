const axios = require('axios')
let setMenu = function (callback, access_token) {
	let URL = 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token=' + access_token
	let params = {
		"button":[
			{
				"type":"view",
				"name":"91疯狂猜",
				"url":"http://m.91fkc.com/"
			},
			{
				"type":"view",
				"name":"免费领豆",
				"url":"http://m.91fkc.com/#/my?showSign=true"
			}
		]
	}
	return axios.post(URL, params).then(res => {
		callback(res.data)
	})
}
module.exports = setMenu