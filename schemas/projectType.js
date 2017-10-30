var mongoose = require('mongoose');

// 项目分类的表结构
module.exports = new mongoose.Schema({
    // 项目分类名称
    name: String,
    // 添加时间
    addTime: {
        type: Date,
        default: new Date()
    }
})