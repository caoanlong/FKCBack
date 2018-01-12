const axios = require('axios')
let betting = function (callback, openid, projectName, goldBeanNum, projectOption) {
    let URL = 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + global.access_token
    let params = {
        "touser": openid,
        "template_id": "OYnn0uwZgMrv5-bTClmG0FLu54Fl-yPHcoDg2OXCItU",
        "url": "http://m.91fkc.com/#/myGuess",
        "data": {
            "first": {
                "value": "你成功参与了“91疯狂猜”！",
                "color": "#173177"
            },
            "keyword1":{
                "value": projectName,
                "color": "#173177"
            },
            "keyword2": {
                "value": goldBeanNum + "金豆",
                "color": "#173177"
            },
            "keyword3": {
                "value": projectOption,
                "color": "#173177"
            },
            "remark":{
                "value": "每天猜猜猜，乐趣享无穷~",
                "color": "#173177"
            }
        }
    }
    console.log(params)
	return axios.post(URL, params).then(res => {
		callback(res.data)
	})
}

let lottery = function (callback, openid, projectName, prizeNum, goldBeanNum, projectOption, time, first, remark) {
    let URL = 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + global.access_token
    let params = {
        "touser": openid,
        "template_id": "w5_RxnBb5sbWUDFVOKJYl-wTNB-Iih1hLtT2d5XSl80",
        "url": "http://m.91fkc.com/#/myGuess",
        "data": {
            "first": {
                "value": first,
                "color": "#173177"
            },
            "keyword1":{
                "value": projectName,
                "color": "#173177"
            },
            "keyword2": {
                "value": projectOption,
                "color": "#173177"
            },
            "keyword3": {
                "value": prizeNum + "金豆",
                "color": "#173177"
            },
            "keyword4": {
                "value": goldBeanNum + "金豆",
                "color": "#173177"
            },
            "keyword5": {
                "value": time,
                "color": "#173177"
            },
            "remark":{
                "value": remark,
                "color": "#173177"
            }
        }
    }
    console.log(params)
	return axios.post(URL, params).then(res => {
		callback(res.data)
	})
}
module.exports = {
    betting: betting,
    lottery: lottery
}