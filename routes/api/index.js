const express = require('express')
const router = express.Router()
const md5 = require('md5')
const crypto = require('crypto')
const RSAUtil = require('../../common/RSAUtil')
const jwt = require('jwt-simple')
const secret =require('../../config').secret

const TemporaryOrder = require('../../models/TemporaryOrder')
const Member = require('../../models/Member')
const AccountDetail = require('../../models/AccountDetail')

//统一返回格式
let responseData
router.use((req, res, next) => {
	responseData = {
		code: 0,
		msg: ''
	}
	next()
})

//设置跨域
router.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*")
	res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
	res.header('Access-Control-Allow-Headers', 'Content-Type,Accept,X-Access-Token')
	next()
})

/* 微信验签 */
router.get('/', (req, res) => {
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

/* 支付 */
router.post('/payOrder', (req, res) => {
	let token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token']
	let memberId = jwt.decode(token, secret.jwtTokenSecret).iss

	let appid = req.body.appid
	let key = req.body.key
	let subject = req.body.subject
	let amount = parseInt(Number(req.body.amount))
	let mchntOrderNo = req.body.mchntOrderNo
	let body = req.body.body
	let childAppid = req.body.childAppid
	let clientIp =req.body.clientIp
	let payChannelId = req.body.payChannelId
	let notifyUrl = req.body.notifyUrl
	let returnUrl = req.body.returnUrl
	let type = req.body.type
	let version = 'h5_NoEncrypt'
	let m = {}
	m['appid'] = appid
	m['amount'] = amount
	m['body'] = body
	m['clientIp'] = clientIp
	m['mchntOrderNo'] = mchntOrderNo
	m['notifyUrl'] = notifyUrl

	m['returnUrl'] = returnUrl
	m['subject'] = subject
	m['version'] = version
	let md5Str = "amount=" + amount + "&appid=" + appid + "&body=" + body
	if (childAppid != '') {
		md5Str += "&childAppid=" + childAppid
		m['childAppid'] = childAppid
	}
	md5Str += "&clientIp=" + clientIp + "&mchntOrderNo=" + mchntOrderNo + "&notifyUrl=" + notifyUrl
	if (payChannelId != '') {
		md5Str += "&payChannelId=" + payChannelId
		m['payChannelId'] = payChannelId
	}
	md5Str += "&returnUrl=" + returnUrl + "&subject=" + subject + "&version=h5_NoEncrypt&key=" + key
	console.log(md5Str)
	let signature =  md5(md5Str)
	m['signature'] = signature
	let json = JSON.stringify(m)
	let onderInfo = RSAUtil.rsaEncrypt(json)
	console.log(onderInfo)

	Member.findOne({ _id: memberId }).exec(function (err, member) {
		if (err) {
			responseData.code = 1
			responseData.msg = '失败'
			res.json(responseData)
			return
		}
		new TemporaryOrder({
			member: memberId,
			goldBeanNum: amount,
			orderNo: mchntOrderNo
		}).save()
		responseData.msg = '成功'
		responseData.data = onderInfo
		res.json(responseData)
	})
})
/* 支付同步回调 */
router.post('/notifyUtl', (req, res) => {
	if (req.body.orderNo && req.body.mchntOrderNo && req.body.appid && req.body.amount && req.body.paySt == 2) {
		let params = {
			'orderNo': req.body.orderNo,
			'mchntOrderNo': req.body.mchntOrderNo,
			'appid': req.body.appid,
			'amount': req.body.amount,
			'body': req.body.body,
			'clientIp': req.body.clientIp,
			'notifyUrl': req.body.notifyUrl,
			'payChannelId': req.body.payChannelId,
			'returnUrl': req.body.returnUrl,
			'subject': req.body.subject,
			'childAppid': req.body.childAppid,
			'paySt': req.body.paySt
		}
		console.log(params)
		// 如果成功，则给对应用户写入其支付的金额-金币
		TemporaryOrder.findOne({ orderNo: req.body.mchntOrderNo }).exec((err, temporaryOrder) => {
			console.log(temporaryOrder)
			Member.findOne({_id: temporaryOrder.member}).exec((error, member) => {
				Member.update({ _id: member._id }, {
					charm: member.charm + (temporaryOrder.goldBeanNum / 100),
					goldBean: member.goldBean + temporaryOrder.goldBeanNum
				}, (error) => {
					new AccountDetail({
						member: member._id,
						goldBeanChange: '+' + temporaryOrder.goldBeanNum,
						type: '充值',
						info: '金豆'
					}).save()
					res.json({'success':'true'})
				})
			})
		})
	}
})

router.use((req, res, next) => {
	if (req.url.indexOf('verCode') > -1 || req.url.indexOf('login') > -1 || req.path == '/project' || req.path == '/project/type') {
		next()
		return
	}
	let token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token']
	if (token) {
		try {
			let decoded = jwt.decode(token, secret.jwtTokenSecret)
			if (decoded) {
				next()
			}else {
				responseData.code = '1003'
				responseData.msg = '非法的Token!'
				res.json(responseData)
				return
			}
		} catch (err) {
			if (err) {
				responseData.code = '1002'
				responseData.msg = '非法的Token!'
				res.json(responseData)
				return
			}
		}
	}else {
		responseData.code = '1001'
		responseData.msg = '未登录!'
		res.json(responseData)
		return
	}
})

router.use('/member', require('./member'))
router.use('/project', require('./project'))
router.use('/shop', require('./shop'))

module.exports = router
