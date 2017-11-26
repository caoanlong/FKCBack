const express = require('express')
const router = express.Router()

const GoldBeanType = require('../../models/GoldBeanType')

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
	if (!req.session.userInfo.isAdmin) {
		res.redirect('/admin')
		return
	}
	var pageIndex = Number(req.query.pageIndex || 1)
	var pageSize = 10
	var pages = 0
	GoldBeanType.count(function (err, count) {
		//计算总页数
		pages = Math.ceil(count / pageSize)
		//取值不能超过pages
		pageIndex = Math.min(pageIndex, pages)
		//取值不能小于1
		pageIndex = Math.max(pageIndex, 1)

		var skip = (pageIndex - 1) * pageSize
		var pagesArr = []
		for (var i = 1 i < pages+ 1 i++) {
			pagesArr.push(i)
		}
		GoldBeanType.find().sort({ _id: -1 }).limit(pageSize).skip(skip).exec(function (error, result) {
			if (error) {
				res.render('error', { message: '查找失败' })
			} else {
				res.render('admin/goldBeanType', {
					active: 'goldBeanType',
					data: {
						goldBeanTypeList: result,
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
router.get('/goldBeanType/add', function (req, res) {
	res.render('admin/goldBeanTypeAdd', {
		active: 'goldBeanType',
		userInfo: req.session.userInfo
	})
})
router.post('/goldBeanType/add', function (req, res) {
	new GoldBeanType({
		num: req.body.num
	}).save()
	responseData.msg = '成功'
	res.json(responseData)
})
/* 金豆类型删除 */
router.post('/goldBeanType/delete', function (req, res) {
	GoldBeanType.remove({ _id: req.body.id }, function (err) {
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
router.get('/goldBeanType/edit', function (req, res) {
	GoldBeanType.findOne({ _id: req.query.id }).exec(function (err, goldBeanTypeDetail) {
		if (err) {
			res.render('error', { message: '不存在' })
		} else {
			GoldBeanType.find(function (error, projectType) {
				if (error) {
					res.render('error', { message: '分类错误' })
					return
				}
				res.render('admin/goldBeanTypeDetail', {
					active: 'goldBeanType',
					goldBeanTypeDetail: goldBeanTypeDetail,
					userInfo: req.session.userInfo
				})
			})
		}
	})
})
router.post('/goldBeanType/edit', function (req, res) {
	GoldBeanType.update({ _id: req.body.id }, {
		num: req.body.num
	}, function (err) {
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