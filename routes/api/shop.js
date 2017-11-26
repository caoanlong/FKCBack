const express = require('express')
const router = express.Router()
const jwt = require('jwt-simple')
const secret = require('../../config').secret

const GoldBeanType = require('../../models/GoldBeanType')
const Member = require('../../models/Member')
const AccountDetail = require('../../models/AccountDetail')

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
	let goldBeanNum = Number(req.body.goldBeanNum)
	// 支付对接参数
	let URL = 'http://pay.e-mac.com.cn/pay/v1/order'
	let merNo = '10029'
	let appId = '21'
	let key = '02791ec15c0b0fde86d194694a2da436'
	let transType = req.body.transType // 支付方式
	let transAmt = req.body.transAmt // 支付金额
	let transTime = Date.now() // 支付时间(yyyyMMddHHmmss)
	let orderNo = '19890204' // 订单号，不可重复
	let returnUrl = '' // 公众号返回页面，可不填，不参与加密（以http://开头）
	let showQR = 0 // 0:返回链接1:直接显示二维码(扫码接口有效，默认为0，不参与加密)
	let sign = '' /* 加密信息，加密规则如下：
				   * MD5(merNo|appId|transType|transAmt|transTime|orderNo|KEY)
				   * KEY在对接时申请发放 
				   */
		
	Member.findOne({ _id: memberId }).exec(function (err, member) {
		if (err) {
			responseData.code = 1
			responseData.msg = '失败'
			res.json(responseData)
			return
		}
		Member.update({ _id: memberId }, {
			goldBean: member.goldBean + goldBeanNum
		}, function (error) {
			if (err) {
				responseData.code = 2
				responseData.msg = '充值失败'
				res.json(responseData)
				return
			}
			new AccountDetail({
				member: memberId,
				goldBeanChange: '+' + goldBeanNum,
				type: '充值',
				info: '金豆'
			}).save()
			responseData.msg = '充值成功'
			res.json(responseData)
		})
	})
})

module.exports = router