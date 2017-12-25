const mongoose = require('mongoose')

// 项目分类的表结构
let ProjectTypeSchema = new mongoose.Schema({
	// 项目分类名称
	name: String,
	// 添加时间
	addTime: {
		type: String,
		default: new Date().getTime()
	}
})
ProjectTypeSchema.pre('save', function (next) {
	this.addTime = new Date().getTime()
	next()
})

module.exports = mongoose.model('ProjectType', ProjectTypeSchema)