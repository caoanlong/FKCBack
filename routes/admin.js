var express = require('express');
var router = express.Router();

var User = require('../models/User');

/* 首页 */
router.get('/',function(req, res, next) {
	res.render('admin/index',{active: 'index'})
})

/* 会员管理 */
router.get('/member',function(req, res, next) {
	res.render('admin/member',{active: 'member'})
})
router.post('/member/add',function(req, res, next) {
	res.render('admin/memberAdd',{active: 'member'})
})

/* 项目管理 */
router.get('/project', function(req, res, next) {
  	res.render('admin/project',{active: 'project'});
});

/* 用户列表 */
router.get('/user',function(req, res) {
	User.find(function(err,result) {
		console.log(result)
		res.render('admin/user',{
			active: 'user',
			data: result
		})
	})
})
/* 用户添加 */
router.get('/user/add',function(req, res) {
	res.render('admin/userAdd',{active: 'user'})
})
router.post('/user/add',function(req, res) {
    //数据库中是否已经存在相同手机号用户
    User.findOne({
    	mobile: req.body.mobile
    }, function(err,result) {
    	if (result) {
            //数据库中已经存在该用户了
            res.render('error', {
                message: '用户已经存在了'
            })
        } else {
            //数据库中不存在该用户，可以保存
            new User({
                username: req.body.username,
                mobile: req.body.mobile,
                password: req.body.password
            }).save();
            res.redirect('admin/user')
        }
    })
})
module.exports = router;
