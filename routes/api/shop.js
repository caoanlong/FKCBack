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
	var pageIndex = Number(req.query.pageIndex || 1);
	var pageSize = 10;
	var pages = 0;
	GoldBeanType.count(function(err,count) {
		//计算总页数
		pages = Math.ceil(count / pageSize);
		//取值不能超过pages
		pageIndex = Math.min( pageIndex, pages );
		//取值不能小于1
		pageIndex = Math.max( pageIndex, 1 );

		var skip = (pageIndex - 1) * pageSize;
		var pagesArr = [];
		for (var i = 1; i < pages+1; i++) {
			pagesArr.push(i)
		}
		GoldBeanType.find().sort({_id: -1}).limit(pageSize).skip(skip).exec(function(error,result) {
			if (error) {
				responseData.code = 1
				responseData.msg = '获取失败'
				res.json(responseData)
				return
			}
			responseData.msg = '获取成功'
			responseData.data = {
				goldBeanTypeList: result,
				count: count,
				pageSize: pageSize,
				pageIndex: pageIndex,
				pages: pages
			}
			res.json(responseData)
		})
	})
})

module.exports = router;