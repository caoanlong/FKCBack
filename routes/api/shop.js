var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var secret =require('../../config').secret;

var GoldBeanType = require('../../models/GoldBeanType');
var Member = require('../../models/Member');
var AccountDetail = require('../../models/AccountDetail');

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
/* 购买金豆 */
router.post('/buyGoldBean', function(req, res) {
	let token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token']
	let memberId = jwt.decode(token, secret.jwtTokenSecret).iss
	let goldBeanNum = Number(req.body.goldBeanNum)
	Member.findOne({_id: memberId}).exec(function(err, member) {
		Member.update({_id: memberId},{
			goldBean: member.goldBean + goldBeanNum
		})
		new AccountDetail({
			member: memberId,
			goldBeanChange: +goldBeanNum,
			type: '充值',
			info: ''
		}).save()
	})
})

module.exports = router;