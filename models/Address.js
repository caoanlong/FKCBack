const mongoose = require('mongoose')

/*会员地址的表结构*/
let AddressSchema = new mongoose.Schema({
	// 关联会员
	member: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Member'
	},
	// 收货人
	consignee: String,
	// 联系电话
	mobile: String,
	// 所在地区
	area: String,
	// 详细地址
	detailedAddress: String,
	// 添加时间与更新时间
	addTime: {
		type: String,
		default: new Date().getTime()
	}
})
AddressSchema.pre('save', function (next) {
	this.addTime = new Date().getTime()
	next()
})

module.exports = mongoose.model('Address', AddressSchema)