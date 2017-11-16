var express = require('express');
var router = express.Router();

var GoldBeanType = require('../../models/GoldBeanType');

//统一返回格式
var responseData;
router.use(function(req, res, next) {
	responseData = {
		code: 0,
		msg: ''
	}
	next()
})

/* 金豆列表 */
router.get('/goldBeanType', function(req, res) {
	GoldBeanType.find().sort({num: -1}).exec(function(error,result) {
		if (error) {
			responseData.code = 1
			responseData.msg = '获取失败'
			res.json(responseData)
			return
		}
		responseData.msg = '获取成功'
		responseData.data = {
			goldBeanTypeList: result
		}
		res.json(responseData)
	})
})

module.exports = router;