const express = require('express')
const app = express()
const router = express.Router()
const crypto = require('crypto')
const schedule = require('node-schedule')
const getAccessToken = require('./common/getAccessToken')
const getTsapiTicket = require('./common/getTsapiTicket')
const getOpenID = require('./common/getOpenID')
const setMenu = require('./common/setMenu')


//统一返回格式
let responseData
router.use((req, res, next) => {
	responseData = {
		code: 0,
		msg: ''
	}
	next()
})

let access_token
let jsApiTicket

// 获取access_token
getAccessToken((res_token) => {
	access_token = res_token
	// 获取jsapi_ticket
	getTsapiTicket((res_jsApiTicket) => {
		jsApiTicket = res_jsApiTicket
	}, access_token)
	// 设置菜单
	setMenu((res_data) => {
		console.log(res_data)
	}, access_token)
})
let rule = new schedule.RecurrenceRule()
rule.hour = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21]
rule.minute = 45
// 定时获取access_token
schedule.scheduleJob(rule, function () {
	getAccessToken((res_token) => {
		access_token = res_token
		// 获取jsapi_ticket
		getTsapiTicket((res_jsApiTicket) => {
			jsApiTicket = res_jsApiTicket
		}, access_token)
		// 设置菜单
		setMenu((res_data) => {
			console.log(res_data)
		}, access_token)
	})
})

//设置跨域
router.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*")
	res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
	res.header('Access-Control-Allow-Headers', 'Content-Type,Accept,X-Access-Token')
	next()
})

/* 微信验签 */
router.all('/', (req, res) => {
	let signature = req.query.signature
	let timestamp = req.query.timestamp
	let nonce = req.query.nonce
	let echostr = req.query.echostr
	let token = 'fkc123456'
	let tmp = [token,timestamp,nonce].sort().join("")
	let currSign = crypto.createHash("sha1").update(tmp).digest("hex")
	if (req.method == 'GET') {
		if (currSign === signature) {
			res.send('success')
			return
		} else {
			res.send("It is not from weixin")
			return
		}
	} else if (req.method == 'POST') {
		if (currSign !== signature) {
			res.send("It is not from weixin")
			return
		}
		let xmlData = req.body.xml
		if (xmlData.msgtype == 'text') {
			let resMsg = '<xml>' + 
			'<ToUserName><![CDATA[' + xmlData.fromusername + ']]></ToUserName>' + 
			'<FromUserName><![CDATA[' + xmlData.tousername + ']]></FromUserName>' + 
			'<CreateTime>' + parseInt(new Date().getTime()/1000) + '</CreateTime>' + 
			'<MsgType><![CDATA[text]]></MsgType>' + 
			'<Content><![CDATA[你好！呵呵😄]]></Content>' + 
			'</xml>'
			res.writeHead(200, {'Content-Type': 'application/xml'})
			res.end(resMsg)
		} else if (xmlData.msgtype == 'event') {
			if (xmlData.event == 'subscribe') {
				let resMsg = '<xml>' + 
				'<ToUserName><![CDATA[' + xmlData.fromusername + ']]></ToUserName>' + 
				'<FromUserName><![CDATA[' + xmlData.tousername + ']]></FromUserName>' + 
				'<CreateTime>' + parseInt(new Date().getTime()/1000) + '</CreateTime>' + 
				'<MsgType><![CDATA[text]]></MsgType>' + 
				'<Content><![CDATA[你好，欢迎关注91疯狂猜（http://m.91fkc.com/）猜足球、篮球、经济、娱乐和电竞事件，预测未来，成就现在。\n\n注册就送100金豆，每日免费领金豆，金豆可抽奖品，中奖率100%。]]></Content>' + 
				'</xml>'
				res.writeHead(200, {'Content-Type': 'application/xml'})
				res.end(resMsg)
			} else {
				res.send('')
			}
		} else {
			res.send('')
		}
	}
})

/* 获取JSSDK配置参数 */
router.post('/config', (req, res) => {
	let noncestr = 'FKC91fkcCaoanlong'
	let jsapi_ticket = jsApiTicket
	let timestamp = Math.round(new Date().getTime()/1000)
	let url = req.body.url
	let tmp = `jsapi_ticket=${jsapi_ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`
	let signature = crypto.createHash("sha1").update(tmp).digest("hex")
	responseData.msg = '成功'
	responseData.data = {
		'noncestr': noncestr,
		'timestamp': timestamp,
		'signature': signature
	}
	res.json(responseData)
})

/* 获取code */
router.get('/getOpenIDNew', (req, res) => {
	let code = req.query.code
	getOpenID((openid) => {
		if (openid) {
			responseData.msg = '成功'
			responseData.data = openid
			res.json(responseData)
		}
	}, code)
})

/* 获取openID */
router.get('/getOpenID', (req, res) => {
	let code = req.query.code
	let state = req.query.state
	getOpenID((openid) => {
		console.log(code, openid)
		if (state == 'index') {
			res.redirect('http://m.91fkc.com/#/?openid='+openid)
		} else {
			res.redirect('http://m.91fkc.com/#/my?showSign=true&openid='+openid)
		}
	}, code)
})

module.exports = router