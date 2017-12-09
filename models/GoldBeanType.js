const mongoose = require('mongoose')

// 金豆类型的表结构
let GoldBeanTypeSchema = new mongoose.Schema({
	// 面额
	num: Number,
	// 添加时间
	addTime: {
		type: String,
		default: new Date().getTime()
	}
})

module.exports = mongoose.model('GoldBeanType', GoldBeanTypeSchema)