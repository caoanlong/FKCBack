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

/* 用户删除 */
router.post('/delete', (req, res) => {
	let id = req.body.id
	User.remove({_id: id}, (err) => {
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

/* 用户修改 */
router.post('/edit', (req, res) => {
	let id = req.body.id
	User.update({_id: id},{
		username: req.body.username,
		mobile: req.body.mobile,
		password: req.body.password
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

/* 禁用用户 */
router.post('/disable', (req, res) => {
	let id = req.body.id
	User.update({_id: id},{isDisabled: true}, (err) => {
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
/* 启用用户 */
router.post('/enable', (req, res) => {
	let id = req.body.id
	User.update({_id: id},{isDisabled: false}, (err) => {
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

/* 用户登录 */
router.post('/login', (req, res) => {
	let mobile = req.body.mobile
	let password = req.body.password
	//查询数据库中相同用户名和密码的记录是否存在，如果存在则登录成功
	User.findOne({
		mobile: mobile,
		password: password
	}, (err, user) => {
		if (err || !user) {
			responseData.code = 1
			responseData.msg = '用户名或密码错误'
			res.json(responseData)
			return
		}
		if (user.isDisabled) {
			responseData.code = 2
			responseData.msg = '用户已被禁用'
			res.json(responseData)
			return
		}
		responseData.msg = '登录成功'
		responseData.userInfo = {
			_id: user._id,
			username: user.username,
			isAdmin: user.isAdmin,
			isDisabled: user.isDisabled
		}
		req.session.userInfo = responseData.userInfo
		res.json(responseData)
	})
})

module.exports = router