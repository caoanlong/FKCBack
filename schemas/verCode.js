var mongoose = require('mongoose');

//短息验证码的表结构
module.exports = new mongoose.Schema({
	//验证码
    verCode: String,
    //手机号
    mobile: String,
    //添加时间
    addTime: String
})