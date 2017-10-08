var express = require('express');
var router = express.Router();

/* 首页 */
router.get('/',function(req, res, next) {
	res.render('admin/index',{active: 'index'})
})

/* 会员管理 */
router.get('/member',function(req, res, next) {
	res.render('admin/member',{active: 'member'})
})
router.get('/member/add',function(req, res, next) {
	res.render('admin/memberAdd',{active: 'member'})
})

/* 项目管理 */
router.get('/project', function(req, res, next) {
  	res.render('admin/project',{active: 'project'});
});

/* 用户管理 */
router.get('/user',function(req, res, next) {
	res.render('admin/user',{active: 'user'})
})
router.get('/user/add',function(req, res, next) {
	res.render('admin/userAdd',{active: 'user'})
})
module.exports = router;
