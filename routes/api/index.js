const express = require('express')
const router = express.Router()
const axios = require('axios')
const md5 = require('md5')
const RSAUtil = require('../../common/RSAUtil')
const jwt = require('jwt-simple')
const secret =require('../../config').secret

const TemporaryOrder = require('../../models/TemporaryOrder')
const Member = require('../../models/Member')
const AccountDetail = require('../../models/AccountDetail')
const Prize = require('../../models/Prize')

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

/* 首页奖品列表 */
router.get('/prize', (req, res) => {
	let pageSize = Number(req.query.pageSize || 10)
	Prize.find().sort({ _id: -1 }).limit(pageSize).exec((error, prizeList) => {
		if (error) {
			responseData.code = 1
			responseData.msg = '获取失败' + error
			res.json(responseData)
			return
		}
		responseData.msg = '获取成功'
		responseData.data = prizeList
		res.json(responseData)
	})
})

/* 支付 */
router.post('/payOrder', (req, res) => {
	let token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token']
	let memberId = jwt.decode(token, secret.jwtTokenSecret).iss

	let params = {}
	params.pay_memberid = req.body.pay_memberid
	params.pay_orderid = req.body.pay_orderid
	params.pay_applydate = req.body.pay_applydate
	params.pay_bankcode = req.body.pay_bankcode
	params.pay_notifyurl = req.body.pay_notifyurl
	params.pay_callbackurl = req.body.pay_callbackurl
	params.pay_amount = req.body.pay_amount

	params.pay_productname = req.body.pay_productname
	params.sub_openid = req.body.sub_openid
	params.pay_deviceIp = req.body.pay_deviceIp
	params.pay_scene =req.body.pay_scene
	params.pay_productdesc = req.body.pay_productdesc
	params.pay_producturl = req.body.pay_producturl

	let md5Str = "pay_amount=" + params.pay_amount + "&pay_applydate=" + params.pay_applydate + "&pay_bankcode=" + params.pay_bankcode + "&pay_callbackurl=" + params.pay_callbackurl + "&pay_memberid=" + params.pay_memberid + "&pay_notifyurl=" + params.pay_notifyurl + "&pay_orderid=" + params.pay_orderid + "&key=dejda13l9e4ai197i31jldtd4s6o53n3"
	params.pay_md5sign =  md5(md5Str).toUpperCase()

	let dataParams = "pay_memberid=" + params.pay_memberid + "&pay_orderid=" + params.pay_orderid + "&pay_applydate=" + params.pay_applydate + "&pay_bankcode=" + params.pay_bankcode + "&pay_notifyurl=" + params.pay_notifyurl + "&pay_callbackurl=" + params.pay_callbackurl + "&pay_amount=" + params.pay_amount + "&pay_md5sign=" + params.pay_md5sign + "&pay_productname=" + params.pay_productname + "&sub_openid=" + params.sub_openid + "&pay_deviceIp=" + params.pay_deviceIp + "&pay_scene=" + params.pay_scene + "&pay_productdesc=" + params.pay_productdesc + "&pay_producturl=" + params.pay_producturl
	let URL = 'https://api.qujuhe.com/pay_index'
	let headers = {'Content-Type': 'application/x-www-form-urlencoded'}
	console.log(dataParams)
	axios({
		method: 'post',
		url: URL,
		headers: {
			'Content-type': 'application/x-www-form-urlencoded'
		},
		data: dataParams
	}).then(response => {
		console.log(response.data)
		if (response.data.status == 'success') {
			Member.findOne({ _id: memberId }).exec(function (err, member) {
				if (err) {
					responseData.code = 1
					responseData.msg = '失败'
					res.json(responseData)
					return
				}
				new TemporaryOrder({
					member: memberId,
					goldBeanNum: Number(params.pay_amount) * 100,
					orderNo: params.pay_orderid
				}).save()
				responseData.msg = '成功'
				responseData.data = response.data.data
				res.json(responseData)
			})
		}
	})
})
/* 支付同步回调 */
router.post('/notifyUtl', (req, res) => {
	console.log(req.body)
	// next()
	if (req.body.memberid == '15120' && req.body.orderid && req.body.amount && req.body.amount && req.body.returncode == '00') {
		let params = {
			'memberid': req.body.memberid,
			'orderid': req.body.orderid,
			'transaction_id': req.body.transaction_id,
			'amount': req.body.amount,
			'datetime': req.body.datetime,
			'returncode': req.body.returncode,
			'sign': req.body.sign,
			'attach': req.body.attach
		}
	// 	console.log(params)
	// 	// 如果成功，则给对应用户写入其支付的金额-金币
		TemporaryOrder.findOne({ orderNo: req.body.orderid }).exec((err, temporaryOrder) => {
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
					res.send('OK')
				})
			})
		})
	}
})

router.use((req, res, next) => {
	if (req.url.indexOf('verCode') > -1 || req.url.indexOf('login') > -1 || req.path == '/project' || req.path == '/project/type' || req.url.indexOf('prize') > -1 || req.url.indexOf('banner') > -1) {
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
