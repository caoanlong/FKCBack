const axios = require('axios')
let getTsapiTicket = function (callback, access_token) {
	let URL = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi`
	return axios.get(URL).then(res => {
		callback(res.data.ticket)
	})
}
module.exports = getTsapiTicket