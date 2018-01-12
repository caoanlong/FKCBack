const express = require('express')
const router = express.Router()

const Project = require('../../models/Project')
const ProjectType = require('../../models/ProjectType')
const GuessList = require('../../models/GuessList')
const Member = require('../../models/Member')
const AccountDetail = require('../../models/AccountDetail')

const sendMsgToWechat = require('../api/common/sendMsgToWechat')
const getdatefromtimestamp = require('../../common/myFilters').getdatefromtimestamp

//统一返回格式
let responseData
router.use((req, res, next) => {
	responseData = {
		code: 0,
		msg: ''
	}
	next()
})

/* 项目列表 */
router.get('/', function(req, res) {
	if (!req.session.userInfo || !req.session.userInfo.isAdmin) {
		res.redirect('/admin')
		return
	}
	let pageIndex = Number(req.query.pageIndex || 1)
	let pageSize = 10
	let pages = 0
	Project.count(function(err,count) {
		//计算总页数
		pages = Math.ceil(count / pageSize)
		//取值不能超过pages
		pageIndex = Math.min( pageIndex, pages )
		//取值不能小于1
		pageIndex = Math.max( pageIndex, 1 )

		let skip = (pageIndex - 1) * pageSize
		let pagesArr = []
		for (let i = 1; i < pages+1; i++) {
			pagesArr.push(i)
		}
		Project.find().sort({_id: -1}).limit(pageSize).skip(skip).populate('projectType').exec(function(error,result) {
			if (error) {
				res.render('error',{message: '查找失败'})
			}else {
				res.render('admin/project/project',{
					active: 'project',
					data: {
						projectList: result,
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
/* 项目添加 */
router.get('/add', function(req, res) {
	ProjectType.find(function(err, result) {
		res.render('admin/project/projectAdd',{
			projectType: result,
			active: 'project',
			userInfo: req.session.userInfo
		})
	})
	
})
router.post('/add',function(req, res) {
	let name = req.body.name
	let projectType = req.body.projectType
	let endTime = req.body.endTime
	let imgUrl = req.body.imgUrl
	let options = req.body.options
	new Project({
		name: name,
		projectType: projectType,
		endTime: endTime,
		imgUrl: imgUrl,
		options: options
	}).save()
	responseData.msg = '成功'
	res.json(responseData)
})
/* 项目删除 */
router.post('/delete',function(req, res) {
	Project.remove({_id: req.body.id},function(err) {
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
/* 项目修改 */
router.get('/edit',function(req, res) {
	Project.findOne({_id:req.query.id}).populate('projectType').exec(function(err,projectDetail) {
		if (err) {
			res.render('error', {message: '项目不存在'})
		}else {
			ProjectType.find(function(error,projectType) {
				if (error) {
					res.render('error', {message: '分类错误'})
					return
				}
				res.render('admin/project/projectDetail',{
					active: 'project',
					projectDetail: projectDetail,
					projectType: projectType,
					userInfo: req.session.userInfo
				})
			})
		}
	})
})
router.post('/edit',function(req, res) {
	let projectName = req.body.name
	let projectType = req.body.projectType
	let endTime = req.body.endTime
	let imgUrl = req.body.imgUrl
	let options = req.body.options
	let resultContent = req.body.resultContent
	let resultOdds = req.body.resultOdds
	Project.update({_id: req.body.id},{
		name: projectName,
		projectType: projectType,
		endTime: endTime,
		imgUrl: imgUrl,
		options: options,
		resultContent: resultContent,
		resultOdds: resultOdds
	},function(err) {
		if (err) {
			responseData.code = 1
			responseData.msg = '修改失败'
			res.json(responseData)
		}else {
			// 如果开奖
			if (resultContent && resultOdds) {
				GuessList.find({
					project: req.body.id,
					isLottery: false // 选择未开奖的竞猜
				}).populate('member').exec(function(error, guess) {
					for (let i = 0; i < guess.length; i++) {
						// 判断是否中奖(如果中奖)
						if (guess[i].projectOption.content == resultContent && guess[i].projectOption.odds == resultOdds) {
							let bonus = Number((Number(guess[i].projectOption.odds)*Number(guess[i].goldBeanNum)).toFixed())
							// 更新所有未开奖的竞猜
							GuessList.update({_id: guess[i]._id}, {
								isLottery: true,
								isWin: true,
								bonus: bonus
							}, (error1) => {
								// 更新会员账户
								Member.update({_id: guess[i].member._id},{
									goldBean: Number(guess[i].member.goldBean) + bonus
								}, (error2) => {
									// 生成账单
									new AccountDetail({
										member: guess[i].member._id,
										goldBeanChange: '+' + bonus,
										type: '中奖',
										info: guess[i].projectOption.content
									}).save()
								})
								sendMsgToWechat.lottery((response) => {}, guess[i].member.openid, projectName, bonus, guess[i].goldBeanNum, guess[i].projectOption.content, getdatefromtimestamp(guess[i].addTime), "恭喜你，猜对了“91疯狂猜”！赢得"+bonus+"金豆", "如此机智的你简直是竞猜界的大神！")
							})
						} else {
							GuessList.update({_id: guess[i]._id}, {
								isLottery: true
							}, () => {
								console.log('未中奖')
								sendMsgToWechat.lottery((response) => {}, guess[i].member.openid, projectName, 0, guess[i].goldBeanNum, guess[i].projectOption.content, getdatefromtimestamp(guess[i].addTime), "矮油，这次“91疯狂猜”没猜中！", "长得这么帅，早晚能猜中！")
							})
						}
					}
				})
			}
			responseData.msg = '修改成功'
			res.json(responseData)
		}
	})
})
/* 项目分类列表 */
router.get('/projectType',function(req, res) {
	if (!req.session.userInfo) {
		res.redirect('/admin')
		return
	}
	let pageIndex = Number(req.query.pageIndex || 1)
	let pageSize = 10
	let pages = 0
	ProjectType.count(function(err,count) {
		//计算总页数
		pages = Math.ceil(count / pageSize)
		//取值不能超过pages
		pageIndex = Math.min( pageIndex, pages )
		//取值不能小于1
		pageIndex = Math.max( pageIndex, 1 )

		let skip = (pageIndex - 1) * pageSize
		let pagesArr = []
		for (let i = 1; i < pages+1; i++) {
			pagesArr.push(i)
		}

		ProjectType.find().sort({_id: -1}).limit(pageSize).skip(skip).exec(function(error,result) {
			if (error) {
				res.render('error',{message: '查找失败'})
			}else {
				res.render('admin/project/projectType',{
					active: 'projectType',
					data: {
						projectTypeList: result,
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
/* 项目分类添加 */
router.get('/projectType/add', function(req, res) {
	res.render('admin/project/projectTypeAdd',{
		active: 'projectType',
		userInfo: req.session.userInfo
	})
})
router.post('/projectType/add',function(req, res) {
	new ProjectType({
		name: req.body.name
	}).save()
	responseData.msg = '成功'
	res.json(responseData)
})
/* 项目分类删除 */
router.post('/projectType/delete', function(req, res) {
	ProjectType.remove({_id: req.body.id}, function(err) {
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
/* 项目分类修改 */
router.get('/projectType/edit',function(req, res) {
	ProjectType.findOne({_id:req.query.id},function(err,result) {
		if (err) {
			res.render('error', {message: '项目分类不存在'})
		}else {
			console.log(result)
			res.render('admin/project/projectTypeDetail',{
				active: 'projectType',
				projectTypeDetail: result,
				userInfo: req.session.userInfo
			})
		}
	})
})
router.post('/projectType/edit',function(req, res) {
	ProjectType.update({_id:req.body.id},{
		name: req.body.name
	},function(err) {
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
/* 竞猜列表 */
router.get('/guess',function(req, res) {
	if (!req.session.userInfo) {
		res.redirect('/admin')
		return
	}
	let from = req.query.from || ''
	let pageIndex = Number(req.query.pageIndex || 1)
	let pageSize = 10
	let pages = 0
	let memberCondition = req.query.memberId ? {member: req.query.memberId} : {}
	if (from) {
		Member.find({from: from}).exec((err1, member) => {
			if (err1 || member == null) {
				res.render('admin/project/guess',{
					active: 'project/guess',
					data: {
						guessList: [],
						count: count,
						pageSize: pageSize,
						pageIndex: pageIndex,
						pages: pages,
						pagesArr: pagesArr
					},
					userInfo: req.session.userInfo
				})
				return
			}
			let memberIds = member.map(item => item._id)
			GuessList.count({member: {$in: memberIds}}, function(err,count) {
				//计算总页数
				pages = Math.ceil(count / pageSize)
				//取值不能超过pages
				pageIndex = Math.min( pageIndex, pages )
				//取值不能小于1
				pageIndex = Math.max( pageIndex, 1 )

				let skip = (pageIndex - 1) * pageSize
				let pagesArr = []
				for (let i = 1; i < pages+1; i++) {
					pagesArr.push(i)
				}
				GuessList.find({member: {$in: memberIds}}).sort({_id: -1}).limit(pageSize).skip(skip).populate(['member','project']).exec(function(error,result) {
					if (error) {
						res.render('error',{message: '查找失败'})
					}else {
						res.render('admin/project/guess',{
							active: 'project/guess',
							data: {
								guessList: result,
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
	} else {
		GuessList.count(memberCondition, function(err,count) {
			//计算总页数
			pages = Math.ceil(count / pageSize)
			//取值不能超过pages
			pageIndex = Math.min( pageIndex, pages )
			//取值不能小于1
			pageIndex = Math.max( pageIndex, 1 )

			let skip = (pageIndex - 1) * pageSize
			let pagesArr = []
			for (let i = 1; i < pages+1; i++) {
				pagesArr.push(i)
			}
			GuessList.find(memberCondition).sort({_id: -1}).limit(pageSize).skip(skip).populate(['member','project']).exec(function(error,result) {
				if (error) {
					res.render('error',{message: '查找失败'})
				}else {
					res.render('admin/project/guess',{
						active: 'project/guess',
						data: {
							guessList: result,
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
	}
})

module.exports = router;