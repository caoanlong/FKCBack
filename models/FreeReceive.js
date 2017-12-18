const mongoose = require('mongoose')
let randomGold = require('../common')

// 免费领豆的表结构
let FreeReceiveSchema = new mongoose.Schema({
	// 关联会员
	member: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Member'
	},
	// 周一
	Monday: {
		goldNum: {
			type: Number,
			default: randomGold.getRandomGold()
		},
		isSign: {
			type: Boolean,
			default: false
		},
		isRandom: {
			type: Boolean,
			default: true
		}
	},
	// 周二
	Tuesday: {
		goldNum: {
			type: Number,
			default: randomGold.getRandomGold()
		},
		isSign: {
			type: Boolean,
			default: false
		},
		isRandom: {
			type: Boolean,
			default: true
		}
	},
	// 周三
	Wednesday: {
		goldNum: {
			type: Number,
			default: 28
		},
		isSign: {
			type: Boolean,
			default: false
		},
		isRandom: {
			type: Boolean,
			default: false
		}
	},
	// 周四
	Thursday: {
		goldNum: {
			type: Number,
			default: randomGold.getRandomGold()
		},
		isSign: {
			type: Boolean,
			default: false
		},
		isRandom: {
			type: Boolean,
			default: true
		}
	},
	// 周五
	Friday: {
		goldNum: {
			type: Number,
			default: 58
		},
		isSign: {
			type: Boolean,
			default: false
		},
		isRandom: {
			type: Boolean,
			default: false
		}
	},
	// 周六
	Saturday: {
		goldNum: {
			type: Number,
			default: randomGold.getRandomGold()
		},
		isSign: {
			type: Boolean,
			default: false
		},
		isRandom: {
			type: Boolean,
			default: true
		}
	},
	// 周日
	Sunday: {
		goldNum: {
			type: Number,
			default: randomGold.getRandomGold()
		},
		isSign: {
			type: Boolean,
			default: false
		},
		isRandom: {
			type: Boolean,
			default: true
		}
	},
	// 添加时间
	addTime: {
		type: String,
		default: new Date().getTime()
	}
})
FreeReceiveSchema.pre('save', function (next) {
	this.addTime = new Date().getTime()
	next()
})

module.exports = mongoose.model('FreeReceive', FreeReceiveSchema)