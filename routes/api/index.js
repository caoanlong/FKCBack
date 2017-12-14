const express = require('express')
const router = express.Router()
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

/* 支付同步回调 */
router.post('/paymentSync', (req, res) => {
	if (req.body.orderId && req.body.orderNo && req.body.transaction_id && req.body.merNo && req.body.appId && req.body.transAmt && req.body.orderDate && req.body.respCode && req.body.timeEnd && req.body.sign) {
		let params = {
			orderId: req.body.orderId,
			orderNo: req.body.orderNo,
			transaction_id: req.body.transaction_id,
			merNo: req.body.merNo,
			appId: req.body.appId,
			transAmt: req.body.transAmt,
			orderDate: req.body.orderDate,
			respCode: req.body.respCode,
			timeEnd: req.body.timeEnd,
			sign: req.body.sign
		}
		// 如果成功，则给对应用户写入其支付的金额-金币
		TemporaryOrder.findOne({ orderNo: req.body.orderNo }).exec((err, temporaryOrder) => {
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
					responseData.msg = '成功'
					responseData.data = 'SUCCESS'
					res.json(responseData)
				})
			})

		})
	} else {
		responseData.code = 1
		responseData.msg = '失败'
		responseData.data = 'EORROR'
		res.json(responseData)
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
