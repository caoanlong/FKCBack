const mongoose = require('mongoose')

// 奖品的表结构
module.exports = new mongoose.Schema({
	// 奖品名称
	prizeName: String,
	// 奖品描述
	prizeInfo: String,
	// 奖品图片
	prizeImg: {
		type: String,
		default: ''
	},
	// 奖品参考价格
	prizeRefPrice: Number,
	// 奖品金豆价格
	prizeGoldBeanPrice: Number,
	// 添加时间
	addTime: {
		type: Date,
		default: new Date()
	}
})