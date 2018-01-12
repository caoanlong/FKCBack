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
		default: 100
	},
	// 魅力
	charm: {
		type: Number,
		default: 0
	},
	// 默认地址
	defaultAddress: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Address'
	},
	// 是否被禁用
	isDisabled: {
		type: Boolean,
		default: false
	},
	// 微信公众平台openid
	openid: {
		type: String,
		default: ''
	},
	// 来源
	from: {
		type: String,
		default: 'default'
	},
	//添加时间
	addTime: {
		type: String,
		default: new Date().getTime()
	}
})
MemberSchema.pre('save', function (next) {
	if (this.isNew) {
		this.addTime = new Date().getTime()
	}
	next()
})

module.exports = mongoose.model('Member', MemberSchema)