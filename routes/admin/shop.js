const express = require('express')
const router = express.Router()

const GoldBeanType = require('../../models/GoldBeanType')
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

/* 金豆列表 */
router.get('/goldBeanType', (req, res) => {
	if (!req.session.userInfo) {
		res.redirect('/admin')
		return
	}
	let pageIndex = Number(req.query.pageIndex || 1)
	let pageSize = 10
	let pages = 0
	GoldBeanType.count((err, count) => {
		//计算总页数
		pages = Math.ceil(count / pageSize)
		//取值不能超过pages
		pageIndex = Math.min(pageIndex, pages)
		//取值不能小于1
		pageIndex = Math.max(pageIndex, 1)

		let skip = (pageIndex - 1) * pageSize
		let pagesArr = []
		for (let i = 1; i < pages+ 1; i++) {
			pagesArr.push(i)
		}
		GoldBeanType.find().sort({ _id: -1 }).limit(pageSize).skip(skip).exec((error, goldBeanTypeList) => {
			if (error) {
				res.render('error', { message: '查找失败' })
			} else {
				res.render('admin/shop/goldBeanType', {
					active: 'shop/goldBeanType',
					data: {
						goldBeanTypeList: goldBeanTypeList,
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
/* 金豆类型添加 */
router.get('/goldBeanType/add', (req, res) => {
	res.render('admin/shop/goldBeanTypeAdd', {
		active: 'shop/goldBeanType',
		userInfo: req.session.userInfo
	})
})
router.post('/goldBeanType/add', (req, res) => {
	new GoldBeanType({
		num: req.body.num
	}).save()
	responseData.msg = '成功'
	res.json(responseData)
})
/* 金豆类型删除 */
router.post('/goldBeanType/delete', (req, res) => {
	GoldBeanType.remove({ _id: req.body.id }, (err) => {
		if (err) {
			responseData.code = 1
			responseData.msg = '删除失败'
			res.json(responseData)
		} else {
			responseData.msg = '删除成功'
			res.json(responseData)
		}
	})
})
/* 金豆类型修改 */
router.get('/goldBeanType/edit', (req, res) => {
	GoldBeanType.findOne({ _id: req.query.id }).exec((err, goldBeanTypeDetail) => {
		if (err) {
			res.render('error', { message: '不存在' })
		} else {
			GoldBeanType.find((error, projectType) => {
				if (error) {
					res.render('error', { message: '分类错误' })
					return
				}
				res.render('admin/shop/goldBeanTypeDetail', {
					active: 'shop/goldBeanType',
					goldBeanTypeDetail: goldBeanTypeDetail,
					userInfo: req.session.userInfo
				})
			})
		}
	})
})
router.post('/goldBeanType/edit', (req, res) => {
	GoldBeanType.update({ _id: req.body.id }, {
		num: req.body.num
	}, (err) => {
		if (err) {
			responseData.code = 1
			responseData.msg = '修改失败'
			res.json(responseData)
		} else {
			responseData.msg = '修改成功'
			res.json(responseData)
		}
	})
})

/* 奖品列表 */
router.get('/prize', (req, res) => {
	if (!req.session.userInfo) {
		res.redirect('/admin')
		return
	}
	let pageIndex = Number(req.query.pageIndex || 1)
	let pageSize = 10
	let pages = 0
	Prize.count((err, count) => {
		//计算总页数
		pages = Math.ceil(count / pageSize)
		//取值不能超过pages
		pageIndex = Math.min(pageIndex, pages)
		//取值不能小于1
		pageIndex = Math.max(pageIndex, 1)

		let skip = (pageIndex - 1) * pageSize
		let pagesArr = []
		for (let i = 1; i < pages+ 1; i++) {
			pagesArr.push(i)
		}
		Prize.find().sort({ _id: -1 }).limit(pageSize).skip(skip).exec((error, prizeList) => {
			if (error) {
				res.render('error', { message: '查找失败' })
			} else {
				res.render('admin/shop/prize', {
					active: 'shop/prize',
					data: {
						prizeList: prizeList,
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
/* 奖品添加 */
router.get('/prize/add', (req, res) => {
	res.render('admin/shop/prizeAdd', {
		active: 'shop/prize',
		userInfo: req.session.userInfo
	})
})
router.post('/prize/add', (req, res) => {
	new Prize({
		prizeName: req.body.prizeName,
		prizeInfo: req.body.prizeInfo,
		prizeImg: req.body.prizeImg,
		prizeRefPrice: req.body.prizeRefPrice,
		prizeGoldBeanPrice: req.body.prizeGoldBeanPrice
	}).save()
	responseData.msg = '成功'
	res.json(responseData)
})
/* 奖品删除 */
router.post('/prize/delete', (req, res) => {
	Prize.remove({ _id: req.body.id }, (err) => {
		if (err) {
			responseData.code = 1
			responseData.msg = '删除失败'
			res.json(responseData)
		} else {
			responseData.msg = '删除成功'
			res.json(responseData)
		}
	})
})
/* 奖品修改 */
router.get('/prize/edit', (req, res) => {
	Prize.findOne({ _id: req.query.id }).exec((err, prizeDetail) => {
		if (err) {
			res.render('error', { message: '不存在' })
		} else {
			res.render('admin/shop/prizeDetail', {
				active: 'shop/prize',
				prizeDetail: prizeDetail,
				userInfo: req.session.userInfo
			})
		}
	})
})
router.post('/prize/edit', (req, res) => {
	Prize.update({ _id: req.body.id }, {
		prizeName: req.body.prizeName,
		prizeInfo: req.body.prizeInfo,
		prizeImg: req.body.prizeImg,
		prizeRefPrice: req.body.prizeRefPrice,
		prizeGoldBeanPrice: req.body.prizeGoldBeanPrice
	}, (err) => {
		if (err) {
			responseData.code = 1
			responseData.msg = '修改失败'
			res.json(responseData)
		} else {
			responseData.msg = '修改成功'
			res.json(responseData)
		}
	})
})

module.exports = router