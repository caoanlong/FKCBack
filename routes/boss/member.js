const express = require('express')
const router = express.Router()
const co = require('co')

const Member = require('../../models/Member')
const GuessList = require('../../models/GuessList')
const AccountDetail = require('../../models/AccountDetail')
const MemberPrize = require('../../models/MemberPrize')

//统一返回格式
let responseData
router.use(function(req, res, next) {
	responseData = {
		code: 0,
		msg: ''
	}
	next()
})

/* 会员列表 */
router.get('/', (req, res) => {
	let pageIndex = Number(req.query.pageIndex || 1)
	let pageSize = Number(req.query.pageSize || 10)
	co(function* () {
		let count = yield Member.count((err, count) => count)
		let pages = Math.ceil(count / pageSize)
		//取值不能超过pages
		pageIndex = Math.min(pageIndex, pages)
		//取值不能小于1
		pageIndex = Math.max(pageIndex, 1)
		let skip = (pageIndex - 1) * pageSize

		let members = yield Member.find().sort({_id: -1}).limit(pageSize).skip(skip).exec((error, members) => {
			if (error) {
				responseData.code = 1
				responseData.msg = '失败'
				res.json(responseData)
				return
			}
			return members
		})

		responseData.msg = '成功'
		responseData.data = {
			memberList: members,
			count: count,
			pageSize: pageSize,
			pageIndex: pageIndex,
			pages: pages
		}
		res.json(responseData)
	})
})

/* 会员添加 */
router.post('/add', (req, res) => {
	let mobile = req.body.mobile
	co(function* () {
		let member = yield Member.findOne({mobile: mobile}, (err, member) => member)
		if (member) {
			responseData.code = 1
			responseData.msg = '会员已经存在了'
			res.json(responseData)
		} else {
			//数据库中不存在该会员，可以保存
			new Member({
				mobile: mobile
			}).save()
			responseData.msg = '保存成功'
			res.json(responseData)
		}
	})
})

/* 会员删除 */
router.post('/delete', (req, res) => {
	let id = req.body.id
	Member.remove({_id: id}, (err) => {
		if (err) {
			responseData.code = 1
			responseData.msg = '删除失败'
			res.json(responseData)
		}else {
			responseData.msg = '删除成功'
			res.json(responseData)
		}
	})
})

/* 会员修改 */
router.post('/edit', (req, res) => {
	let id = req.body.id
	Member.update({_id: id}, {
		mobile: req.body.mobile,
		goldBean: req.body.goldBean
	}, (err) => {
		if (err) {
			responseData.code = 1
			responseData.msg = '修改失败'
			res.json(responseData)
		}else {
			responseData.msg = '修改成功'
			res.json(responseData)
		}
	})
})

/* 禁用会员 */
router.post('/disable', (req, res) => {
	let id = req.body.id
	Member.update({_id: id}, {isDisabled: true}, (err) => {
		if (err) {
			responseData.code = 1
			responseData.msg = '禁止失败'
			res.json(responseData)
		}else {
			responseData.msg = '禁止成功'
			res.json(responseData)
		}
	})
})
/* 启用会员 */
router.post('/enable', (req, res) => {
	let id = req.body.id
	Member.update({_id: req.body.id}, {isDisabled: false}, (err) => {
		if (err) {
			responseData.code = 1
			responseData.msg = '启用失败'
			res.json(responseData)
		}else {
			responseData.msg = '启用成功'
			res.json(responseData)
		}
	})
})

/* 会员竞猜列表 */
router.get('/guess', (req, res) => {
	let pageIndex = Number(req.query.pageIndex || 1)
	let pageSize = Number(req.query.pageSize || 10)
	let memberId = req.query.memberId

	co(function* () {
		let count = yield GuessList.count({member: memberId}, (err, count) => count)

		let pages = Math.ceil(count / pageSize)
		//取值不能超过pages
		pageIndex = Math.min(pageIndex, pages)
		//取值不能小于1
		pageIndex = Math.max(pageIndex, 1)
		let skip = (pageIndex - 1) * pageSize

		let guessList = yield GuessList.find({member: memberId}).sort({_id: -1}).limit(pageSize).skip(skip).populate('project').exec((error, guessList) => {
			if (error) {
				responseData.code = 1
				responseData.msg = '失败'
				res.json(responseData)
				return
			}
			return guessList
		})

		responseData.msg = '成功'
		responseData.data = {
			guessList: guessList,
			count: count,
			pageSize: pageSize,
			pageIndex: pageIndex,
			pages: pages
		}
		res.json(responseData)
	})
})

/* 会员账户明细列表 */
router.get('/accountDetails', (req, res) => {
	let pageIndex = Number(req.query.pageIndex || 1)
	let pageSize = Number(req.query.pageSize || 10)
	let memberId = req.query.memberId

	co(function* () {
		let count = yield AccountDetail.count({member: memberId}, (err, count) => count)

		let pages = Math.ceil(count / pageSize)
		//取值不能超过pages
		pageIndex = Math.min(pageIndex, pages)
		//取值不能小于1
		pageIndex = Math.max(pageIndex, 1)
		let skip = (pageIndex - 1) * pageSize

		let accountList = yield AccountDetail.find({member: memberId}).sort({_id: -1}).limit(pageSize).skip(skip).exec((error, accountList) => {
			if (error) {
				responseData.code = 1
				responseData.msg = '失败'
				res.json(responseData)
				return
			}
			return accountList
		})

		responseData.msg = '成功'
		responseData.data = {
			accountList: accountList,
			count: count,
			pageSize: pageSize,
			pageIndex: pageIndex,
			pages: pages
		}
		res.json(responseData)
	})
})

/* 会员中奖奖品列表 */
router.get('/memberPrize', (req, res) => {
	let pageIndex = Number(req.query.pageIndex || 1)
	let pageSize = Number(req.query.pageSize || 10)

	co(function* () {
		let count = yield MemberPrize.count((err, count) => count)

		let pages = Math.ceil(count / pageSize)
		//取值不能超过pages
		pageIndex = Math.min(pageIndex, pages)
		//取值不能小于1
		pageIndex = Math.max(pageIndex, 1)
		let skip = (pageIndex - 1) * pageSize

		let memberPrizeList = yield MemberPrize.find().sort({_id: -1}).limit(pageSize).skip(skip).populate(['member', 'prize']).exec((error, memberPrizeList) => {
			if (error) {
				responseData.code = 1
				responseData.msg = '失败'
				res.json(responseData)
				return
			}
			return memberPrizeList
		})

		responseData.msg = '成功'
		responseData.data = {
			memberPrizeList: memberPrizeList,
			count: count,
			pageSize: pageSize,
			pageIndex: pageIndex,
			pages: pages
		}
		res.json(responseData)
	})
})

/* 会员中奖奖品详情 */
router.get('/memberPrize/detail', (req, res) => {
	let memberPrizeId = req.query.id

	MemberPrize.findOne({_id: memberPrizeId}).populate(['member', 'prize']).exec((err, memberPrize) => {
		if (err) {
			responseData.code = 1
			responseData.msg = '失败'
			res.json(responseData)
			return
		}
		responseData.msg = '成功'
		responseData.data = memberPrize
		res.json(responseData)
	})
})

/* 会员中奖奖品发货 */
router.post('/memberPrize/send', (req, res) => {
	let memberPrizeId = req.body.memberPrizeId
	let waybillNo = req.body.waybillNo

	MemberPrize.findOne({_id: memberPrizeId}).exec((err, memberPrize) => {
		if (err) {
			responseData.code = 1
			responseData.msg = '发货成功'
			res.json(responseData)
		}else {
			memberPrize.waybillNo = waybillNo
			memberPrize.isSend = '1'
			memberPrize.save()
			responseData.msg = '发货成功'
			res.json(responseData)
		}
	})
})

/* 会员中奖奖品取消发货 */
router.post('/memberPrize/cancel', (req, res) => {
	let memberPrizeId = req.body.memberPrizeId

	MemberPrize.findOne({_id: memberPrizeId}).exec((err, memberPrize) => {
		if (err) {
			responseData.code = 1
			responseData.msg = '取消成功'
			res.json(responseData)
		}else {
			memberPrize.waybillNo = ''
			memberPrize.isSend = ''
			memberPrize.save()
			responseData.msg = '取消成功'
			res.json(responseData)
		}
	})
})

module.exports = router