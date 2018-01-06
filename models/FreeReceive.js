const mongoose = require('mongoose')
let randomGold = require('../common')
let MondayGoldNum = randomGold.getRandomGold()
let TuesdayGoldNum = randomGold.getRandomGold()
let ThursdayGoldNum = randomGold.getRandomGold()
let SaturdayGoldNum = randomGold.getRandomGold()
let SundayGoldNum = randomGold.getRandomGold()
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
			default: MondayGoldNum
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
			default: TuesdayGoldNum
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
			default: ThursdayGoldNum
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
			default: SaturdayGoldNum
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
			default: SundayGoldNum
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