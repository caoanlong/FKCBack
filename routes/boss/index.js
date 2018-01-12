const express = require('express')
const router = express.Router()
const jwt = require('jwt-simple')
const secret =require('../../config').secret

//统一返回格式
let responseData
router.use((req, res, next) => {
	responseData = {
		code: 0,
		msg: ''
	}
	next()
})

//设置跨域
router.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*")
	res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
	res.header('Access-Control-Allow-Headers', 'Content-Type,Accept,X-Access-Token')
	next()
})

router.use('/user', require('./user'))
router.use('/member', require('./member'))
// router.use('/project', require('./project'))
// router.use('/shop', require('./shop'))
// router.use('/system', require('./system'))

module.exports = router