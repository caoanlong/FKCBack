const mongoose = require('mongoose')

// 会员奖品的表结构
let MemberPrizeSchema = new mongoose.Schema({
	// 会员
	member: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Member'
	},
	// 奖品
	prize: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Prize'
	},
	// 地址
	address: {
		type: String,
		default: ''
	},
	// 添加时间
	addTime: {
		type: Date,
		default: new Date().getTime()
	}
})

module.exports = mongoose.model('MemberPrize', MemberPrizeSchema)