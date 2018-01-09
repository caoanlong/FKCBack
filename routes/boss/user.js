const express = require('express')
const router = express.Router()
const co = require('co')

const User = require('../../models/User')

//统一返回格式
let responseData
router.use(function(req, res, next) {
	responseData = {
		code: 0,
		msg: ''
	}
	next()
})

/* 用户列表 */
router.get('/', (req, res) => {
	let pageIndex = Number(req.query.pageIndex || 1)
	let pageSize = Number(req.query.pageSize || 10)
	co(function* () {
		let count = yield User.count((err, count) => count)
		let pages = Math.ceil(count / pageSize)
		//取值不能超过pages
		pageIndex = Math.min(pageIndex, pages)
		//取值不能小于1
		pageIndex = Math.max(pageIndex, 1)
		let skip = (pageIndex - 1) * pageSize

		let users = yield User.find().sort({_id: -1}).limit(pageSize).skip(skip).exec((error, users) => {
			if (error) {
				responseData.code = 1
				responseData.msg = '失败'
				res.json(responseData)
				return
			}
			return users
		})

		responseData.msg = '成功'
		responseData.data = {
			userList: users,
			count: count,
			pageSize: pageSize,
			pageIndex: pageIndex,
			pages: pages
		}
		res.json(responseData)
	})
})

/* 用户添加 */
router.post('/add', (req, res) => {
	let username = req.body.username
	let mobile = req.body.mobile
	let password = req.body.password
	co(function* () {
		let user = yield User.findOne({mobile: mobile}, (err, user) => user)
		if (user) {
			responseData.code = 1
			responseData.msg = '用户已经存在了'
			res.json(responseData)
		} else {
			//数据库中不存在该用户，可以保存
			new User({
				username: username,
				mobile: mobile,
				password: password
			}).save()
			responseData.msg = '保存成功'
			res.json(responseData)
		}
	})
})

module.exports = router