const mongoose = require('mongoose')

// 竞猜投注的表结构
let GuessListSchema = new mongoose.Schema({
	// 竞猜人
	member: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Member'
	},
	// 竞猜选项
	projectOption: {
		content: String,
		odds: String
	},
	// 投注金额
	goldBeanNum: String,
	// 投注项目
	project: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Project'
	},
	// 是否开奖
	isLottery: {
		type: Boolean,
		default: false
	},
	// 是否中奖
	isWin: {
		type: Boolean,
		default: false
	},
	// 奖金
	bonus: {
		type: Number,
		default: 0
	},
	// 添加时间
	addTime: {
		type: String,
		default: new Date().getTime()
	}
})

module.exports = mongoose.model('GuessList', GuessListSchema)