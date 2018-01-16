const mongoose = require('mongoose')

// 会员帐户信息的表结构
let BannerSchema = new mongoose.Schema({
	// 图片
	img: String,
	// 链接
	linkUrl: {
		type: String,
		default: ''
	},
	// 添加时间
	addTime: {
		type: String,
		default: new Date().getTime()
	}
})
BannerSchema.pre('save', function (next) {
	this.addTime = new Date().getTime()
	next()
})

module.exports = mongoose.model('Banner', BannerSchema)