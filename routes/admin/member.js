const express = require('express')
const router = express.Router()

const Member = require('../../models/Member')
const GuessList = require('../../models/GuessList')
const AccountDetail = require('../../models/AccountDetail')

//统一返回格式
let responseData;
router.use(function(req, res, next) {
	responseData = {
		code: 0,
		msg: ''
	}
	next()
})


/* 会员列表 */
router.get('/', (req, res, next) => {
	if (!req.session.userInfo) {
		res.redirect('/admin')
		return
	}
	var pageIndex = Number(req.query.pageIndex || 1)
	var pageSize = 10
	var pages = 0
	Member.count((err, count) => {
		//计算总页数
		pages = Math.ceil(count / pageSize)
		//取值不能超过pages
		pageIndex = Math.min( pageIndex, pages )
		//取值不能小于1
		pageIndex = Math.max( pageIndex, 1 )

		var skip = (pageIndex - 1) * pageSize
		var pagesArr = []
		for (var i = 1; i < pages+1; i++) {
			pagesArr.push(i)
		}

		Member.find().sort({_id: -1}).limit(pageSize).skip(skip).exec((error, memberList) => {
			if (error) {
				res.render('error',{message: '查找失败'})
			}else {
				res.render('admin/member/member',{
					active: 'member',
					data: {
						memberList: memberList,
						count: count,
						pageSize: pageSize,
						pageIndex: pageIndex,
						pages: pages,
						pagesArr: pagesArr
					},
					userInfo: req.session.userInfo
				})
			}
		})
	})
})
/* 会员添加 */
router.get('/add', (req, res) => {
	res.render('admin/member/memberAdd',{
		active: 'member',
		userInfo: req.session.userInfo
	})
})
router.post('/add',(req, res) => {
	//数据库中是否已经存在相同手机号用户
	Member.findOne({
		mobile: req.body.mobile
	}, (err,result) => {
		if (result) {
			//数据库中已经存在该用户了
			responseData.code = 1
			responseData.msg = '会员已经存在了'
			res.json(responseData)
		} else {
			//数据库中不存在该用户，可以保存
			new Member({
				mobile: req.body.mobile
			}).save()
			responseData.msg = '保存成功'
			res.json(responseData)
		}
	})
})
/* 会员删除 */
router.post('/delete', (req, res) => {
	Member.remove({_id: req.body.id}, (err) => {
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
router.get('/edit', (req, res) => {
	Member.findOne({_id: req.query.id}, (err, member) => {
		if (err) {
			res.render('error', {message: '用户不存在'})
		}else {
			res.render('admin/member/memberDetail',{
				active: 'member',
				memberDetail: member,
				userInfo: req.session.userInfo
			})
		}
	})
})
router.post('/edit', (req, res) => {
	Member.update({_id: req.body.id}, {
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
	Member.update({_id: req.body.id}, {isDisabled: true}, (err) => {
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
	Member.update({_id: req.body.id},{isDisabled: false}, (err) => {
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
	if (!req.session.userInfo) {
		res.redirect('/admin')
		return
	}
	let pageIndex = Number(req.query.pageIndex || 1)
	let pageSize = 10
	let pages = 0
	let memberId = req.query.memberId
	let memberMobile = req.query.memberMobile
	GuessList.count({member: memberId}, (err, count) => {
		//计算总页数
		pages = Math.ceil(count / pageSize)
		//取值不能超过pages
		pageIndex = Math.min( pageIndex, pages )
		//取值不能小于1
		pageIndex = Math.max( pageIndex, 1 )

		let skip = (pageIndex - 1) * pageSize
		let pagesArr = []
		for (let i = 1; i < pages+1; i++) {
			pagesArr.push(i)
		}
		GuessList.find({member: memberId}).sort({_id: -1}).limit(pageSize).skip(skip).populate('project').exec((error, guessList) => {
			if (error) {
				res.render('error',{message: '查找失败'})
			}else {
				res.render('admin/member/memberGuess',{
					active: 'member',
					data: {
						guessList: guessList,
						count: count,
						pageSize: pageSize,
						pageIndex: pageIndex,
						pages: pages,
						pagesArr: pagesArr
					},
					memberMobile: memberMobile,
					userInfo: req.session.userInfo
				})
			}
		})
	})
})
/* 会员账户明细列表 */
router.get('/accountDetails', (req, res) => {
	if (!req.session.userInfo) {
		res.redirect('/admin')
		return
	}
	let pageIndex = Number(req.query.pageIndex || 1)
	let pageSize = 10
	let pages = 0
	let memberId = req.query.memberId
	let memberMobile = req.query.memberMobile
	AccountDetail.count({member: memberId}, (err, count) => {
		//计算总页数
		pages = Math.ceil(count / pageSize)
		//取值不能超过pages
		pageIndex = Math.min( pageIndex, pages )
		//取值不能小于1
		pageIndex = Math.max( pageIndex, 1 )

		let skip = (pageIndex - 1) * pageSize
		let pagesArr = []
		for (let i = 1; i < pages+1; i++) {
			pagesArr.push(i)
		}
		AccountDetail.find({member: memberId}).sort({_id: -1}).limit(pageSize).skip(skip).exec((error, accountList) => {
			if (error) {
				res.render('error',{message: '查找失败'})
			}else {
				res.render('admin/member/memberAccountDetail', {
					active: 'member',
					data: {
						accountList: accountList,
						count: count,
						pageSize: pageSize,
						pageIndex: pageIndex,
						pages: pages,
						pagesArr: pagesArr
					},
					memberMobile: memberMobile,
					userInfo: req.session.userInfo
				})
			}
		})
	})
})

module.exports = router