var mongoose = require('mongoose');

// 金豆类型的表结构
module.exports = new mongoose.Schema({
	// 面额
	num: Number,
	// 添加时间
	addTime: {
		type: Date,
		default: new Date()
	}
})