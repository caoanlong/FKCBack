const express = require('express')
const router = express.Router()
const md5 = require('md5')
const jwt = require('jwt-simple')
const secret = require('../../config').secret

const GoldBeanType = require('../../models/GoldBeanType')
const Member = require('../../models/Member')
const AccountDetail = require('../../models/AccountDetail')
const TemporaryOrder = require('../../models/TemporaryOrder')
const common = require('../../common/index')

//统一返回格式
let responseData
router.use(function (req, res, next) {
	responseData = {
		code: 0,
		msg: ''
	}
	next()
})

/* 金豆列表 */
router.get('/goldBeanType', function (req, res) {
	GoldBeanType.find().sort({ num: -1 }).exec(function (error, result) {
		if (error) {
			responseData.code = 1
			responseData.msg = '获取失败'
			res.json(responseData)
			return
		}
		responseData.msg = '获取成功'
		responseData.data = {
			goldBeanTypeList: result
		}
		res.json(responseData)
	})
})
/* 购买金豆 */
router.post('/buyGoldBean', function (req, res) {
	let token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token']
	let memberId = jwt.decode(token, secret.jwtTokenSecret).iss
	
	Member.findOne({ _id: memberId }).exec(function (err, member) {
		if (err) {
			responseData.code = 1
			responseData.msg = '失败'
			res.json(responseData)
			return
		}
		new TemporaryOrder({
			member: memberId,
			goldBeanNum: req.body.goldBeanNum,
			orderNo: req.body.orderNo
		}).save()
		responseData.msg = '等待平台...'
		res.json(responseData)
	})
})

module.exports = router