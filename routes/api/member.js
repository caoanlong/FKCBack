const express = require('express')
const router = express.Router()
const jwt = require('jwt-simple')
const common = require('../../common')

const Member = require('../../models/Member')
const VerCode = require('../../models/VerCode')
const AccountDetail = require('../../models/AccountDetail')
const MemberPrize = require('../../models/MemberPrize')
const Address = require('../../models/Address')
const secret = require('../../config').secret

//统一返回格式
let responseData
router.use((req, res, next) => {
	responseData = {
		code: 0,
		msg: ''
	}
	next()
})

/* 获取短信验证码 */
router.post('/verCode', (req, res) => {
	let mobile = req.body.mobile||''
	if (!mobile) {
		responseData.code = 2
		responseData.msg = '手机号不能为空'
		res.json(responseData)
		return
	}
	VerCode.findOne({mobile: mobile}, (err, result) => {
		if (err) {
			responseData.code = 1
			responseData.msg = '获取失败'
			res.json(responseData)
			return
		}
		let newVerCode = common.getVerCode(4)
		common.getResult(newVerCode, mobile).then(response => {
			console.log(response.data)
			if (response.data.resp.respCode == '000000') {
				if (result) {
					VerCode.update({_id: result._id},{
						verCode: newVerCode,
						mobile: mobile,
						addTime: new Date().getTime()
					}, (error) => {
						if (error) {
							responseData.code = 2
							responseData.msg = '获取失败'
							res.json(responseData)
						}else {
							responseData.msg = '获取成功'
							responseData.data = newVerCode
							res.json(responseData)
						}
					})  
				}else {
					new VerCode({
						verCode: newVerCode,
						mobile: mobile,
						addTime: new Date().getTime()
					}).save()
					responseData.msg = '获取成功'
					responseData.data = newVerCode
					res.json(responseData)
				}
			} else {
				responseData.code = 3
				responseData.msg = '获取失败'
				res.json(responseData)
			}
		}, response => {
			console.log(response.data)
			responseData.code = 4
			responseData.msg = '获取失败'
			res.json(responseData)
		})
	}) 
})

/* 会员登录 */
router.post('/login', (req, res, next) => {
	let mobile = req.body.mobile||''
	let curVerCode = req.body.verCode||''
	if (!mobile) {
		responseData.code = 3
		responseData.msg = '手机号不能为空'
		res.json(responseData)
		return
	}
	if (!curVerCode) {
		responseData.code = 4
		responseData.msg = '验证码不能为空'
		res.json(responseData)
		return
	}
	VerCode.findOne({mobile: mobile}, (err, result) => {
		if (err) {
			responseData.code = 1
			responseData.msg = '服务器错误'
			res.json(responseData)
			return
		}
		if (curVerCode != result.verCode) {
			responseData.code = 2
			responseData.msg = '验证码不正确'
			res.json(responseData)
			return
		}
		let curTime = new Date().getTime()
		let addTime = result.addTime
		let time = 120*1000
		if (curTime - addTime > time) {
			responseData.code = 3
			responseData.msg = '验证码已失效'
			res.json(responseData)
			return
		}
		//判断是否已经注册过
		Member.findOne({mobile: mobile}, (error, member) => {
			if (error) {
				responseData.code = 4
				responseData.msg = '服务器错误'
				res.json(responseData)
				return
			}
			if (member) {
				let token = jwt.encode({
					iss: member._id,
					exp: 1000*60*60*24*365
				},secret.jwtTokenSecret)
				responseData.msg = '登录成功'
				responseData.data = member
				responseData.token = token
				res.json(responseData)
				return
			}
			//数据库中不存在该用户，可以保存
			new Member({mobile: mobile}).save((err1) => {
				if (err1) {
					responseData.code = 5
					responseData.msg = '登录失败'
					res.json(responseData)
					return
				}
				Member.findOne({mobile: mobile}, (err2, mem) => {
					if (err2) {
						responseData.code = 6
						responseData.msg = '登录失败'
						res.json(responseData)
						return
					}
					let token = jwt.encode({
						iss: mem._id,
						exp: 1000*60*60*24*365
					},secret.jwtTokenSecret)
					responseData.msg = '登录成功'
					responseData.data = mem
					responseData.token = token
					res.json(responseData)
				})
			})
		})
	})
})

/* 查看会员详情 */
router.post('/info', (req, res) => {
	let token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token']
	let memberId = jwt.decode(token,secret.jwtTokenSecret).iss
	Member.findOne({_id: memberId}, [
			'mobile',
			'avatar',
			'charm',
			'goldBean',
			'isDisabled',
			'addTime',
			'defaultAddress'
		], (err, result) => {
		if (err) {
			responseData.code = 1
			responseData.msg = '获取失败'
			res.json(responseData)
			return
		}
		if (!result) {
			responseData.code = 2
			responseData.msg = '获取失败'
			res.json(responseData)
			return
		}
		responseData.msg = '获取成功'
		responseData.data = result
		res.json(responseData)
	})
})
/* 查看会员帐户明细 */
router.get('/accountDetails', (req, res) => {
	let token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token']
	let memberId = jwt.decode(token,secret.jwtTokenSecret).iss
	let pageIndex = Number(req.query.pageIndex || 1)
	let pageSize = 15
	let pages = 0
	AccountDetail.count({member: memberId}, (error, count) => {
		//计算总页数
		pages = Math.ceil(count / pageSize)
		//取值不能超过pages
		pageIndex = Math.min(pageIndex, pages)
		//取值不能小于1
		pageIndex = Math.max(pageIndex, 1)
		let skip = (pageIndex - 1) * pageSize
		AccountDetail.find({member: memberId}).sort({_id: -1}).limit(pageSize).skip(skip).exec((err, accountDetail) => {
			if (err) {
				responseData.code = 1
				responseData.msg = '获取失败'
				res.json(responseData)
				return
			}
			responseData.msg = '获取成功'
			responseData.data = {
				accountDetail: accountDetail,
				count: count,
				pageSize: pageSize,
				pageIndex: pageIndex,
				pages: pages
			}
			res.json(responseData)
		})
	})
})
/* 查看会员奖品列表 */
router.get('/memberPrize', (req, res) => {
	let token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token']
	let memberId = jwt.decode(token,secret.jwtTokenSecret).iss
	MemberPrize.find({member: memberId}).populate('prize').sort({_id: -1}).exec((err, memberPrizelist) => {
		if (err) {
			responseData.code = 1
			responseData.msg = '获取失败'
			res.json(responseData)
			return
		}
		responseData.msg = '获取成功'
		responseData.data = memberPrizelist
		res.json(responseData)
	})
})
/* 设置会员奖品地址 */
router.post('/memberPrize/setAddress', (req, res) => {
	let memberPrizeId = req.body.memberPrizeId
	let consignee = req.body.consignee
	let mobile = req.body.mobile
	let address = req.body.address
	MemberPrize.findOne({_id: memberPrizeId}).exec((err, memberPrize) => {
		if (err) {
			responseData.code = 1
			responseData.msg = '添加失败'
			res.json(responseData)
			return
		}
		memberPrize.consignee = consignee
		memberPrize.mobile = mobile
		memberPrize.address = address
		memberPrize.save()
		responseData.msg = '添加成功'
		res.json(responseData)
	})
})
/* 确认收货 */
router.post('/memberPrize/sure', (req, res) => {
	let memberPrizeId = req.body.id
	MemberPrize.findOne({_id: memberPrizeId}).exec((err, memberPrize) => {
		if (err) {
			responseData.code = 1
			responseData.msg = '确认失败'
			res.json(responseData)
			return
		}
		memberPrize.isSend = '2'
		memberPrize.save()
		responseData.msg = '确认成功'
		res.json(responseData)
	})
})
/* 查看会员地址 */
router.get('/address', (req, res) => {
	let token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token']
	let memberId = jwt.decode(token,secret.jwtTokenSecret).iss
	Address.find({member: memberId}).sort({_id: -1}).exec((err, addressList) => {
		if (err) {
			responseData.code = 1
			responseData.msg = '获取失败'
			res.json(responseData)
			return
		}
		responseData.msg = '获取成功'
		responseData.data = addressList
		res.json(responseData)
	})
})
/* 查看会员地址详情 */
router.get('/address/detail', (req, res) => {
	let addressId = req.query.addressId
	Address.findOne({_id: addressId}).exec((err, address) => {
		if (err) {
			responseData.code = 1
			responseData.msg = '获取失败'
			res.json(responseData)
			return
		}
		responseData.msg = '获取成功'
		responseData.data = address
		res.json(responseData)
	})
})
/* 添加会员地址 */
router.post('/address/add', (req, res) => {
	let token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token']
	let memberId = jwt.decode(token,secret.jwtTokenSecret).iss
	let consignee = req.body.consignee
	let mobile = req.body.mobile
	let area = req.body.area
	let detailedAddress = req.body.detailedAddress
	let isSetDefault = req.body.isSetDefault
	new Address({
		member: memberId,
		consignee: consignee,
		mobile: mobile,
		area: area,
		detailedAddress: detailedAddress
	}).save(err => {
		if (err) {
			responseData.code = 1
			responseData.msg = '添加失败'
			res.json(responseData)
			return
		}
		if (isSetDefault) {
			Address.findOne({
				member: memberId,
				consignee: consignee,
				mobile: mobile,
				area: area,
				detailedAddress: detailedAddress
			}).exec((error, address) => {
				if (error) {
					responseData.code = 2
					responseData.msg = '设置默认失败'
					res.json(responseData)
					return
				}
				Member.findOne({_id: memberId}).exec((error2, member) => {
					member.defaultAddress = address._id
					member.save()
					responseData.msg = '添加成功'
					res.json(responseData)
				})
			})
		} else {
			responseData.msg = '添加成功'
			res.json(responseData)
		}
	}) 
})
/* 修改会员地址 */
router.post('/address/update', (req, res) => {
	let token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token']
	let memberId = jwt.decode(token,secret.jwtTokenSecret).iss
	let addressId = req.body.addressId
	let consignee = req.body.consignee
	let mobile = req.body.mobile
	let area = req.body.area
	let detailedAddress = req.body.detailedAddress
	let isSetDefault = req.body.isSetDefault
	Address.findOne({_id: addressId}).exec((err, address) => {
		if (err) {
			responseData.code = 1
			responseData.msg = '修改失败'
			res.json(responseData)
			return
		}
		address.consignee = consignee
		address.mobile = mobile
		address.area = area
		address.detailedAddress = detailedAddress
		address.save()
		if (isSetDefault) {
			Member.findOne({_id: memberId}).exec((error, member) => {
				member.defaultAddress = address._id
				member.save()
				responseData.msg = '修改成功'
				res.json(responseData)
			})
		} else {
			responseData.msg = '修改成功'
			res.json(responseData)
		}
	})
})
/* 删除会员地址 */
router.post('/address/delete', (req, res) => {
	let addressId = req.body.addressId
	Address.remove({_id: addressId}, err => {
		if (err) {
			responseData.code = 1
			responseData.msg = '删除失败'
			res.json(responseData)
			return
		}
		responseData.msg = '删除成功'
		res.json(responseData)
	})
})
/* 设置默认会员地址 */
router.post('/address/setDefault', (req, res) => {
	let token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token']
	let memberId = jwt.decode(token,secret.jwtTokenSecret).iss
	let addressId = req.body.addressId
	Member.update({_id: memberId}, {
		defaultAddress: addressId
	}, err => {
		if (err) {
			responseData.code = 1
			responseData.msg = '设置失败'
			res.json(responseData)
			return
		}
		responseData.msg = '设置成功'
		res.json(responseData)
	})
})
/* 上传头像 */
router.post('/avatar', (req, res) => {
	Member.update({_id: req.body.memberId}, {
		avatar: req.body.avatar
	}, error => {
		if (error) {
			responseData.code = 1
			responseData.msg = '上传失败'
			res.json(responseData)
			return
		}
		Member.findOne({_id: req.body.memberId}).exec((err, member) => {
			if (err) {
				responseData.code = 2
				responseData.msg = '上传失败'
				res.json(responseData)
				return
			}
			responseData.msg = '获取成功'
			responseData.data = member
			res.json(responseData)
		})
	})
})

module.exports = router