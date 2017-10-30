var mongoose = require('mongoose');

// 项目的表结构
module.exports = new mongoose.Schema({
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
    // 状态
    status: {
        type: String,
        default: '1'
    },
    // 添加时间
    addTime: {
        type: Date,
        default: new Date()
    }
})