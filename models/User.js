const mongoose = require('mongoose')

//用户的表结构
let UserSchema = new mongoose.Schema({
	//用户名
	username: String,
	//手机号
	mobile: String,
	//密码
	password: String,
	//是否是管理员
	isAdmin: {
		type: Boolean,
		default: false
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
UserSchema.pre('save', function (next) {
	this.addTime = new Date().getTime()
	next()
})

module.exports = mongoose.model('User', UserSchema)