const express = require('express')
const router = express.Router()
const jwt = require('jwt-simple')
const secret =require('../../config').secret

const Project = require('../../models/Project')
const ProjectType = require('../../models/ProjectType')
const GuessList = require('../../models/GuessList')
const Member = require('../../models/Member')
const AccountDetail = require('../../models/AccountDetail')
const Banner = require('../../models/Banner')

const sendMsgToWechat = require('./common/sendMsgToWechat')

//统一返回格式
let responseData
router.use((req, res, next) => {
	responseData = {
		code: 0,
		msg: '成功'
	}
	next()
})
/* 项目列表 */
router.get('/', (req, res) => {
	let projectType = req.query.projectType
	let pageIndex = Number(req.query.pageIndex || 1)
	let pageSize = 10
	let pages = 0
	let condition = null
	if (projectType) {
		condition = {
			projectType: projectType,
			endTime: {
				$gt: Date.now()
			}
		}
	} else {
		condition = {
			endTime: {
				$gt: Date.now()
			}
		}
	}
	Project.count(condition, (err, count) => {
		//计算总页数
		pages = Math.ceil(count / pageSize)
		//取值不能超过pages
		pageIndex = Math.min( pageIndex, pages )
		//取值不能小于1
		pageIndex = Math.max( pageIndex, 1 )

		let skip = (pageIndex - 1) * pageSize

		Project.find(condition).sort({endTime: 1}).limit(pageSize).skip(skip).exec((error, result) => {
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

/* 项目详情 */
router.get('/detail', (req, res) => {
	let id = req.query.id
	Project.findOne({_id: id}).exec((err, project) => {
		if (err) {
			responseData.code = 1
			responseData.msg ='失败'
			res.json(responseData)
			return
		}
		responseData.msg = '获取成功'
		responseData.data = project
		res.json(responseData)
	})
})

/* 热门项目(体育第一个) */
router.get('/hot', (req, res) => {
	Project.find({
		projectType: req.query.projectType,
		resultOdds: 0,
		resultContent: ''
	}).sort({addTime: -1}).limit(1).exec((err, project) => {
		if (err) {
			responseData.code = 1
			responseData.msg = '获取失败'
			res.json(responseData)
			return
		}
		responseData.msg = '获取成功'
		responseData.data = project[0]
		res.json(responseData)
	})
})
/* 项目分类列表 */
router.get('/type', (req, res) => {
	ProjectType.find().exec((err, projectType) => {
		if (err) {
			responseData.code = 1
			responseData.msg = '服务器错误'
			res.json(responseData)
			return
		}
		responseData.msg = '成功'
		responseData.data = projectType
		res.json(responseData)
	})
})
/* 投注 */
router.post('/betting', (req, res) => {
	let token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token']
	let memberId = jwt.decode(token,secret.jwtTokenSecret).iss
	let openid = req.body.openid
	let goldBeanNum = req.body.goldBeanNum

	if (Number(goldBeanNum) < 0) {
		responseData.code = 22
		responseData.msg = '滚！'
		res.json(responseData)
		return
	}
	let projectId = req.body.projectId
	let projectOption = req.body.projectOption
	Member.findOne({_id: memberId}, (err, member) => {
		if (err || member == null) {
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
		Project.findOne({_id: projectId}, (error1, project) => {
			if (error1) {
				responseData.code = 3
				responseData.msg = '服务器错误'
				res.json(responseData)
				return
			}
			member.goldBean = member.goldBean - Number(goldBeanNum)
			member.openid = openid
			member.save()
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

			sendMsgToWechat.betting((response) => {}, openid, project.name, goldBeanNum, projectOption.content)
			responseData.msg = '投注成功'
			res.json(responseData)
		})
	})
})
/* 会员竞猜列表 */
router.get('/guess', (req, res) => {
	let token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token']
	let memberId = jwt.decode(token,secret.jwtTokenSecret).iss
	// 是否开奖
	let isLottery = Number(req.query.isLottery || 1)
	// 是否中奖
	let isWin = req.query.isWin
	let pageIndex = Number(req.query.pageIndex || 1)
	let pageSize = 10
	let pages = 0
	// 全部
	if (isLottery == 1) {
		GuessList.count({
			member: memberId
		}, (err,count) => {
			//计算总页数
			pages = Math.ceil(count / pageSize)
			//取值不能超过pages
			pageIndex = Math.min(pageIndex, pages)
			//取值不能小于1
			pageIndex = Math.max(pageIndex, 1)
			let skip = (pageIndex - 1) * pageSize
			GuessList.find({
				member: memberId
			}).populate('project').sort({_id: -1}).limit(pageSize).skip(skip).exec((error, guess) => {
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
	// 待开奖
	}else if (isLottery == 2) {
		GuessList.count({
			member: memberId,
			isLottery: false
		},(error, count) => {
			//计算总页数
			pages = Math.ceil(count / pageSize)
			//取值不能超过pages
			pageIndex = Math.min( pageIndex, pages )
			//取值不能小于1
			pageIndex = Math.max( pageIndex, 1 )
			let skip = (pageIndex - 1) * pageSize
			GuessList.find({
				member: memberId,
				isLottery: false
			}).populate('project').sort({_id: -1}).limit(pageSize).skip(skip).exec((error1, guess) => {
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
	// 已开奖
	}else if (isLottery == 3) {
		GuessList.count({
			member: memberId,
			isLottery: false
		},(error, count) => {
			//计算总页数
			pages = Math.ceil(count / pageSize)
			//取值不能超过pages
			pageIndex = Math.min(pageIndex, pages)
			//取值不能小于1
			pageIndex = Math.max(pageIndex, 1)
			let skip = (pageIndex - 1) * pageSize
			GuessList.find({
				member: memberId,
				isLottery: true,
				isWin: isWin == 'true' ? true : false
			}).populate('project').sort({_id: -1}).limit(pageSize).skip(skip).exec((error1, guessResult) => {
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
	}
})
/* banner列表 */
router.get('/banner', (req, res) => {
	Banner.find().exec((err, bannerList) => {
		if (err) {
			responseData.code = 1
			responseData.msg = '获取失败'
			res.json(responseData)
			return
		}
		responseData.msg = '成功'
		responseData.data = bannerList
		res.json(responseData)
	})
})

module.exports = router