const express = require('express')
const router = express.Router()
const md5 = require('md5')
const jwt = require('jwt-simple')
const secret = require('../../config').secret

const GoldBeanType = require('../../models/GoldBeanType')
const Member = require('../../models/Member')
const AccountDetail = require('../../models/AccountDetail')
const TemporaryOrder = require('../../models/TemporaryOrder')
const Prize = require('../../models/Prize')
const MemberPrize = require('../../models/MemberPrize')
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
	GoldBeanType.find().sort({ num: 1 }).exec(function (error, result) {
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

/* 奖品列表 */
router.get('/prize', (req, res) => {
	let pageIndex = Number(req.query.pageIndex || 1)
	let pageSize = req.query.pageSize || 10
	let pages = 0
	Prize.count((err, count) => {
		//计算总页数
		pages = Math.ceil(count / pageSize)
		//取值不能超过pages
		pageIndex = Math.min(pageIndex, pages)
		//取值不能小于1
		pageIndex = Math.max(pageIndex, 1)
		let skip = (pageIndex - 1) * pageSize
		Prize.find().sort({ _id: -1 }).limit(pageSize).skip(skip).exec((error, prizeList) => {
			if (error) {
				responseData.code = 1
				responseData.msg = '获取失败'
				res.json(responseData)
				return
			}
			responseData.msg = '获取成功'
			responseData.data = {
				prizeList: prizeList,
				count: count,
				pageSize: pageSize,
				pageIndex: pageIndex,
				pages: pages
			}
			res.json(responseData)
		})
	})
})
/* 奖品详情 */
router.get('/prizeDetail', (req, res) => {
	let prizeId = req.query.prizeId
	Prize.findOne({_id: prizeId}).exec((err, prize) => {
		if (err) {
			responseData.code = 1
			responseData.msg = '获取失败'
			res.json(responseData)
			return
		}
		responseData.msg = '获取成功'
		responseData.data = prize
		res.json(responseData)
	})
})
/* 抽奖 */
router.post('/prizeDraw', (req, res) => {
	let token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token']
	let memberId = jwt.decode(token, secret.jwtTokenSecret).iss
	let prizeId = req.body.prizeId
	let prizeGoldBeanPrice = req.body.prizeGoldBeanPrice
	Member.findOne({_id: memberId}).exec((error, member) => {
		if (error) {
			responseData.code = 1
			responseData.msg = '服务器错误'
			res.json(responseData)
			return
		}
		if (member.goldBean < Number(prizeGoldBeanPrice)) {
			responseData.code = 2
			responseData.msg = '金豆数量不够'
			res.json(responseData)
			return
		}
		Prize.findOne({_id: prizeId}).exec((err, prize) => {
			if (err) {
				responseData.code = 3
				responseData.msg = '未找到对应奖品'
				res.json(responseData)
				return
			}
			Member.update({_id: memberId}, {
				goldBean: member.goldBean - Number(prize.prizeGoldBeanPrice)
			}, error2 => {
				if (error2) {
					responseData.code = 4
					responseData.msg = '服务器错误'
					res.json(responseData)
					return
				}
				// 生成会员奖品
				new MemberPrize({
					member: memberId,
					prize: prizeId
				}).save()
				// 生成账单
				new AccountDetail({
					member: memberId,
					goldBeanChange: -Number(prize.prizeGoldBeanPrice),
					type: '抽奖',
					info: prize.prizeName
				}).save()
				responseData.msg = '抽奖成功'
				res.json(responseData)
			})
		})
	})
})

module.exports = router