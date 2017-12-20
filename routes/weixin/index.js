const express = require('express')
const app = express()
const router = express.Router()
const crypto = require('crypto')
const schedule = require('node-schedule')
const getAccessToken = require('./common/getAccessToken')
const setMenu = require('./common/setMenu')

let access_token
// 获取access_token
getAccessToken((res_token) => {
	access_token = res_token
	// 设置菜单
	setMenu((res_data) => {
		console.log(res_data)
	}, access_token)
})
let rule = new schedule.RecurrenceRule()
rule.hour = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21]
rule.minute = 0
// 定时获取access_token
schedule.scheduleJob(rule, function () {
	getAccessToken((res_token) => {
		access_token = res_token
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
	console.log(access_token)
	let signature = req.query.signature
	let timestamp = req.query.timestamp
	let nonce = req.query.nonce
	let echostr = req.query.echostr
	let token = 'fkc123456'
	let tmp = [token,timestamp,nonce].sort().join("")
	let currSign = crypto.createHash("sha1").update(tmp).digest("hex")
	if (currSign === signature) {
		res.send(echostr)
		return
	} else {
		res.send("It is not from weixin")
		return
	}
})

module.exports = router