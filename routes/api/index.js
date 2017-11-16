var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var secret =require('../../config').secret;

//统一返回格式
var responseData;
router.use(function(req, res, next) {
	responseData = {
		code: 0,
		msg: ''
	}
	next()
})

//设置跨域
router.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type,Accept,X-Access-Token');
	next();
})

router.use(function(req, res, next) {
	if (req.url.indexOf('verCode') > -1 || req.url.indexOf('login') > -1) {
		next()
		return
	}

	var token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token']
	if (token) {
		try {
			var decoded = jwt.decode(token, secret.jwtTokenSecret)
			if (decoded) {
				next()
			}else {
				responseData.code = '1003'
				responseData.msg = '非法的Token!'
				res.json(responseData)
			}
		} catch (err) {
			if (err) {
				responseData.code = '1002'
				responseData.msg = '非法的Token!'
				res.json(responseData)
			}
		}
	}else {
		responseData.code = '1001'
		responseData.msg = '非法的Token!'
		res.json(responseData)
	}
})

router.use('/member', require('./member'));
router.use('/project', require('./project'));
router.use('/shop', require('./shop'));

module.exports = router;
