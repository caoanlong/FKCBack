const express = require('express')
const router = express.Router()

const From = require('../../models/From')
const Banner = require('../../models/Banner')

//统一返回格式
let responseData;
router.use((req, res, next) => {
	responseData = {
		code: 0,
		msg: ''
	}
	next()
})

// 会员来源列表
router.get('/from', (req, res) => {
	if (!req.session.userInfo || !req.session.userInfo.isAdmin) {
		res.redirect('/admin')
		return
	}
	let pageIndex = Number(req.query.pageIndex || 1)
	let pageSize = 10
	let pages = 0
	From.count((err, count) => {
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

		From.find().sort({_id: -1}).limit(pageSize).skip(skip).exec((error, fromList) => {
			if (error) {
				res.render('error',{message: '查找失败'})
			}else {
				res.render('admin/system/from',{
					active: 'from',
					data: {
						fromList: fromList,
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
/* 会员来源添加 */
router.get('/from/add', (req, res) => {
	res.render('admin/system/fromAdd',{
		active: 'from',
		userInfo: req.session.userInfo
	})
})
router.post('/from/add',(req, res) => {
	new From({
		key: req.body.key,
		value: req.body.value
	}).save()
	responseData.msg = '成功'
	res.json(responseData)
})
/* 会员来源删除 */
router.post('/from/delete', (req, res) => {
	From.remove({_id: req.body.id}, (err) => {
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
/* 会员来源修改 */
router.get('/from/edit', (req, res) => {
	From.findOne({_id:req.query.id}, (err, from) => {
		if (err) {
			res.render('error', {message: '会员来源不存在'})
		}else {
			res.render('admin/system/fromDetail',{
				active: 'from',
				fromDetail: from,
				userInfo: req.session.userInfo
			})
		}
	})
})
router.post('/from/edit', (req, res) => {
	let key = req.body.key
	let value = req.body.value
	From.update({_id:req.body.id},{
		key: req.body.key,
		value: req.body.value
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
// 会员来源列表api接口
router.get('/fromApi', (req, res) => {
	From.find().exec((error, fromList) => {
		if (error) {
			res.json({
				code: 1,
				msg: '失败'
			})
		}else {
			res.json({
				code: 0,
				msg: '成功',
				data: fromList
			})
		}
	})
})

// banner列表
router.get('/banner', (req, res) => {
	if (!req.session.userInfo || !req.session.userInfo.isAdmin) {
		res.redirect('/admin')
		return
	}
	let pageIndex = Number(req.query.pageIndex || 1)
	let pageSize = 10
	let pages = 0
	Banner.count((err, count) => {
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

		Banner.find().sort({_id: -1}).limit(pageSize).skip(skip).exec((error, bannerList) => {
			if (error) {
				res.render('error',{message: '查找失败'})
			}else {
				res.render('admin/system/banner',{
					active: 'banner',
					data: {
						bannerList: bannerList,
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
/* banner添加 */
router.get('/banner/add', (req, res) => {
	res.render('admin/system/bannerAdd',{
		active: 'banner',
		userInfo: req.session.userInfo
	})
})
router.post('/banner/add',(req, res) => {
	new Banner({
		img: req.body.img,
		linkUrl: req.body.linkUrl
	}).save()
	responseData.msg = '成功'
	res.json(responseData)
})
/* banner删除 */
router.post('/banner/delete', (req, res) => {
	Banner.remove({_id: req.body.id}, (err) => {
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
/* banner会员来源修改 */
router.get('/banner/edit', (req, res) => {
	Banner.findOne({_id:req.query.id}, (err, banner) => {
		if (err) {
			res.render('error', {message: '不存在'})
		}else {
			res.render('admin/system/bannerDetail',{
				active: 'banner',
				bannerDetail: banner,
				userInfo: req.session.userInfo
			})
		}
	})
})
router.post('/banner/edit', (req, res) => {
	let img = req.body.img
	let linkUrl = req.body.linkUrl
	Banner.update({_id:req.body.id},{
		img: img,
		linkUrl: linkUrl
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

module.exports = router