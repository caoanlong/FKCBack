var express = require('express');
var router = express.Router();
var session = require('express-session');

//设置session
router.use(session({
    name: 'sessionId',
    secret: 'fkc',
    resave: true,
    saveUninitialized: false
}))
router.use(function(req, res, next) {
    if (!req.session.userInfo) {
        if (req.url == '/user/login') {
            next()
        }else{
            res.redirect('/admin/user/login')
        }
    }else {
        next()
    }
})

/* 首页 */
router.get('/',function(req, res) {
    res.render('admin/index',{
        active: 'index',
        userInfo: req.session.userInfo
    })
})

router.use('/user', require('./user'));
router.use('/member', require('./member'));
router.use('/project', require('./project'));
router.use('/shop', require('./shop'));

module.exports = router;
