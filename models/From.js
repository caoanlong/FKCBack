const mongoose = require('mongoose')

// 会员来源的表结构
let FromSchema = new mongoose.Schema({
	key: String,
	value: String,
	// 添加时间
	addTime: {
		type: String,
		default: new Date().getTime()
	}
})
FromSchema.pre('save', function (next) {
	this.addTime = new Date().getTime()
	next()
})

module.exports = mongoose.model('From', FromSchema)