const mongoose = require('mongoose')

//会员的表结构
let MemberSchema = new mongoose.Schema({
	//用户名
	memberName: {
		type: String,
		default: ''
	},
	//手机号
	mobile: String,
	//头像
	avatar: {
		type: String,
		default: ''
	},
	//金豆
	goldBean: {
		type: Number,
		default: 0
	},
	// 魅力
	charm: {
		type: Number,
		default: 0
	},
	defaultAddress: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Address'
	},
	//是否被禁用
	isDisabled: {
		type: Boolean,
		default: false
	},
	//添加时间
	addTime: {
		type: String,
		default: new Date().getTime()
	}
})

module.exports = mongoose.model('Member', MemberSchema)