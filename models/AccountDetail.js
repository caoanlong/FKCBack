const mongoose = require('mongoose')

// 会员帐户信息的表结构
let AccountDetailSchema = new mongoose.Schema({
	// 关联会员
	member: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Member'
	},
	// 金豆变化
	goldBeanChange: {
		type: String,
		default: ''
	},
	// 类型
	type: String,
	// 详情
	info: String,
	// 添加时间
	addTime: {
		type: String,
		default: new Date().getTime()
	}
})
AccountDetailSchema.pre('save', function (next) {
	this.addTime = new Date().getTime()
	next()
})

module.exports = mongoose.model('AccountDetail', AccountDetailSchema)