const express = require('express')
const router = express.Router()
const session = require('express-session')
const AccountDetail = require('../../models/AccountDetail')
const Member = require('../../models/Member')

//设置session
router.use(session({
	name: 'sessionId',
	secret: 'fkc',
	resave: true,
	saveUninitialized: false
}))
router.use(function(req, res, next) {
	if (!req.session.userInfo) {
		if (req.url == '/user/login') {
			next()
		}else{
			res.redirect('/admin/user/login')
		}
	}else {
		next()
	}
})

/* 首页 */
router.get('/',function(req, res) {
	res.render('admin/index',{
		active: 'index',
		userInfo: req.session.userInfo
	})
})
/* 支付管理 */
// 支付列表
router.get('/payment', (req, res) => {
	if (!req.session.userInfo) {
		res.redirect('/admin')
		return
	}
	let condition = {type: '充值'}
	let from = req.query.from || ''
	let startDate = req.query.startDate
	let endDate = req.query.endDate
	let pageIndex = Number(req.query.pageIndex || 1)
	let pageSize = 10
	let pages = 0
	if (startDate || endDate) {
		condition.addTime = {
			$gte: startDate,
			$lte: endDate
		}
	}
	if (from) {
		Member.find({from: from}).exec((err1, member) => {
			if (err1 || member == null) {
				res.render('admin/payment/paymentList', {
					active: 'payment',
					data: {
						accountList: [],
						count: count,
						pageSize: pageSize,
						pageIndex: pageIndex,
						pages: pages,
						pagesArr: pagesArr
					},
					userInfo: req.session.userInfo
				})
				return
			}
			let memberIds = member.map(item => item._id)
			condition.member = {
				$in: memberIds
			}
			AccountDetail.count(condition, (err, count) => {
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
				AccountDetail.find(condition).populate('member').sort({_id: -1}).limit(pageSize).skip(skip).exec((error, accountList) => {
					if (error) {
						res.render('error',{message: '查找失败'})
					}else {
						res.render('admin/payment/paymentList', {
							active: 'payment',
							data: {
								accountList: accountList,
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
	} else {
		AccountDetail.count(condition, (err, count) => {
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
			AccountDetail.find(condition).populate('member').sort({_id: -1}).limit(pageSize).skip(skip).exec((error, accountList) => {
				if (error) {
					res.render('error',{message: '查找失败'})
				}else {
					res.render('admin/payment/paymentList', {
						active: 'payment',
						data: {
							accountList: accountList,
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
	}
})

router.use('/user', require('./user'))
router.use('/member', require('./member'))
router.use('/project', require('./project'))
router.use('/shop', require('./shop'))
router.use('/system', require('./system'))

module.exports = router
