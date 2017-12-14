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
	// 收货人
	consignee: {
		type: String,
		default: ''
	},
	// 收货手机
	mobile: {
		type: String,
		default: ''
	},
	// 地址
	address: {
		type: String,
		default: ''
	},
	// 运单号
	waybillNo: {
		type: String,
		default: ''
	},
	// 发货状态
	isSend: {
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