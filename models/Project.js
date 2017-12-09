const mongoose = require('mongoose')

// 项目的表结构
let ProjectSchema = new mongoose.Schema({
	// 项目名称
	name: String,
	// 项目图片
	imgUrl: String,
	// 项目类型
	projectType: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'ProjectType'
	},
	// 截止时间
	endTime: String,
	// 选项列表
	options: {
		type: Array,
		default: []
	},
	resultContent: {
		type: String,
		default: ''
	},
	resultOdds: {
		type: Number,
		default: 0
	},
	// 添加时间
	addTime: {
		type: String,
		default: new Date().getTime()
	}
})

module.exports = mongoose.model('Project', ProjectSchema)