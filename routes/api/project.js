var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var secret =require('../../config').secret;

var Project = require('../../models/Project');
var GuessList = require('../../models/GuessList');
var Member = require('../../models/Member');

//统一返回格式
var responseData;
router.use(function(req, res, next) {
	responseData = {
		code: 0,
		msg: ''
	}
	next()
})

/* 项目列表 */
router.get('/', function(req, res) {
	var pageIndex = Number(req.query.pageIndex || 1);
	var pageSize = 10;
	var pages = 0;
	Project.count(function(err,count) {
		//计算总页数
		pages = Math.ceil(count / pageSize);
		//取值不能超过pages
		pageIndex = Math.min( pageIndex, pages );
		//取值不能小于1
		pageIndex = Math.max( pageIndex, 1 );

		var skip = (pageIndex - 1) * pageSize;

		Project.find().sort({_id: -1}).limit(pageSize).skip(skip).exec(function(error,result) {
			if (error) {
				responseData.code = 1
				responseData.msg = '获取失败'
				res.json(responseData)
				return
			}
			responseData.msg = '获取成功'
			responseData.data = {
				projectList: result,
				count: count,
				pageSize: pageSize,
				pageIndex: pageIndex,
				pages: pages
			}
			res.json(responseData)
		})
	})
})
/* 投注 */
router.post('/betting', function(req, res) {
	var token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token'];
    var memberId = jwt.decode(token,secret.jwtTokenSecret).iss;
    var goldBeanNum = req.body.goldBeanNum;
    var projectId = req.body.projectId;
    var projectOption = req.body.projectOption;
    Member.findOne({_id: memberId},function(err, member) {
    	if (err) {
    		responseData.code = 1
    		responseData.msg = '服务器错误'
    		res.json(responseData)
    		return
    	}
    	if (member.goldBean < Number(goldBeanNum)) {
    		responseData.code = 2
    		responseData.msg = '金豆数量不够'
    		res.json(responseData)
    		return
    	}
    	Project.findOne({_id: projectId},function(error1, project) {
    		if (error1) {
    			responseData.code = 3
	    		responseData.msg = '服务器错误'
	    		res.json(responseData)
	    		return
    		}
    		member.accountDetails.push({
				project: project,
				goldBeanChange: -Number(goldBeanNum)
			})
			member.save()
    	})
    	Member.update({_id: member._id},{
    		goldBean: member.goldBean - Number(goldBeanNum)
    	},function(error2) {
    		if (error2) {
    			responseData.code = 4
	    		responseData.msg = '服务器错误'
	    		res.json(responseData)
	    		return
    		}
    		new GuessList({
		    	member: memberId,
		    	projectOption: projectOption,
		    	goldBeanNum: Number(goldBeanNum),
		    	project: projectId
		    }).save()
		    responseData.msg = '投注成功'
		    res.json(responseData)
    	})
    })
})
/* 竞猜列表 */
router.get('/guess', function(req, res) {
	var pageIndex = Number(req.query.pageIndex || 1);
	var pageSize = 10;
	var pages = 0;
	GuessList.count(function(err,count) {
		//计算总页数
		pages = Math.ceil(count / pageSize);
		//取值不能超过pages
		pageIndex = Math.min( pageIndex, pages );
		//取值不能小于1
		pageIndex = Math.max( pageIndex, 1 );

		var skip = (pageIndex - 1) * pageSize;

		GuessList.find().sort({_id: -1}).limit(pageSize).skip(skip).populate(['member','project']).exec(function(error,result) {
			if (error) {
				responseData.code = 1
				responseData.msg = '获取失败'
				res.json(responseData)
				return
			}
			responseData.msg = '获取成功'
			responseData.data = {
				guessList: result,
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