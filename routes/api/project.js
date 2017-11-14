var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var secret =require('../../config').secret;

var Project = require('../../models/Project');
var GuessList = require('../../models/GuessList');
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

/* 项目列表 */
router.get('/', function(req, res) {
	var pageIndex = Number(req.query.pageIndex || 1);
	var pageSize = 10;
	var pages = 0;
	Project.count({
			endTime: {
				$gt: Date.now()
			}
		},function(err,count) {
		//计算总页数
		pages = Math.ceil(count / pageSize);
		//取值不能超过pages
		pageIndex = Math.min( pageIndex, pages );
		//取值不能小于1
		pageIndex = Math.max( pageIndex, 1 );

		var skip = (pageIndex - 1) * pageSize;

		Project.find({
			endTime: {
				$gt: Date.now()
			}
		}).sort({_id: -1}).limit(pageSize).skip(skip).exec(function(error,result) {
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
			Member.update({_id: member._id},{
				goldBean: member.goldBean - Number(goldBeanNum)
			},function(error2) {
				if (error2) {
					responseData.code = 4
					responseData.msg = '服务器错误'
					res.json(responseData)
					return
				}
				// 生成竞猜
				new GuessList({
					member: memberId,
					projectOption: projectOption,
					goldBeanNum: Number(goldBeanNum),
					project: projectId
				}).save()
				// 生成账单
				new AccountDetail({
					member: memberId,
					goldBeanChange: -Number(goldBeanNum),
					type: '投注',
					info: project.name
				}).save()
				responseData.msg = '投注成功'
				res.json(responseData)
			})
		})
	})
})
/* 会员竞猜列表 */
router.get('/guess', function(req, res) {
	var token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token']
	var memberId = jwt.decode(token,secret.jwtTokenSecret).iss
	// 是否开奖
	var isLottery = Number(req.query.isLottery || 1);
	// 是否中奖
	var isWin = req.query.isWin;
	var pageIndex = Number(req.query.pageIndex || 1);
	var pageSize = 10;
	var pages = 0;
	var projectMatch = null;
	if (isLottery == 1) {
		GuessList.count({
			member: memberId
		},function(err,count) {
			//计算总页数
			pages = Math.ceil(count / pageSize);
			//取值不能超过pages
			pageIndex = Math.min(pageIndex, pages);
			//取值不能小于1
			pageIndex = Math.max(pageIndex, 1);
			var skip = (pageIndex - 1) * pageSize;
			GuessList.find({
				member: memberId
			}).populate('project').sort({_id: -1}).limit(pageSize).skip(skip).exec(function(error,guess) {
				responseData.msg = '获取成功'
				responseData.data = {
					guessList: guess,
					count: count,
					pageSize: pageSize,
					pageIndex: pageIndex,
					pages: pages
				}
				res.json(responseData)
			})
		})
	}else if (isLottery == 2) {
		Project.find({
			resultOdds: 0
		}).exec(function(err,project) {
			GuessList.count({
				member: memberId,
				project: {
					$in: project.map((item) => item._id)
				}
			},function(error,count) {
				//计算总页数
				pages = Math.ceil(count / pageSize);
				//取值不能超过pages
				pageIndex = Math.min( pageIndex, pages );
				//取值不能小于1
				pageIndex = Math.max( pageIndex, 1 );
				var skip = (pageIndex - 1) * pageSize;
				GuessList.find({
					member: memberId,
					project: {
						$in: project.map((item) => item._id)
					}
				}).populate('project').sort({_id: -1}).limit(pageSize).skip(skip).exec(function(error1,guess) {
					responseData.msg = '获取成功'
					responseData.data = {
						guessList: guess,
						count: count,
						pageSize: pageSize,
						pageIndex: pageIndex,
						pages: pages
					}
					res.json(responseData)
				})
			})
		})
	}else if (isLottery == 3) {
		Project.find({
			resultOdds: {
				$ne: 0
			}
		}).exec(function(err,project) {
			GuessList.find({
				member: memberId,
				project: {
					$in: project.map((item) => item._id)
				}
			}).populate('project').exec(function(error,guess) {
				var count = guess.length;
				//计算总页数
				pages = Math.ceil(count / pageSize);
				//取值不能超过pages
				pageIndex = Math.min(pageIndex, pages);
				//取值不能小于1
				pageIndex = Math.max(pageIndex, 1);
				var skip = (pageIndex - 1) * pageSize;
				var filterGuess = guess.filter((item) => {
					if (isWin == 'true') {
						return item.project.resultContent == item.projectOption.content
					}else {
						return item.project.resultContent != item.projectOption.content
					}
				})
				GuessList.find({
					member: memberId,
					project: {
						$in: project.map((item) => item._id)
					},
					_id: {
						$in: filterGuess.map((item) => item._id)
					}
				}).populate('project').sort({_id: -1}).limit(pageSize).skip(skip).exec(function(error1,guessResult) {
					responseData.msg = '获取成功'
					responseData.data = {
						guessList: guessResult,
						count: count,
						pageSize: pageSize,
						pageIndex: pageIndex,
						pages: pages
					}
					res.json(responseData)
				})
			})
		})
	}
})

module.exports = router;