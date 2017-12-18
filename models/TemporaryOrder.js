const mongoose = require('mongoose')

// 临时储存会员订单信息的表结构
let TemporaryOrderSchema = new mongoose.Schema({
	// 关联会员
	member: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Member'
	},
	// 订单号
	orderNo: String,
	// 金币数量
	goldBeanNum: Number,
	// 添加时间
	addTime: {
		type: String,
		default: new Date().getTime()
	}
})
TemporaryOrderSchema.pre('save', function (next) {
	this.addTime = new Date().getTime()
	next()
})

module.exports = mongoose.model('TemporaryOrder', TemporaryOrderSchema)