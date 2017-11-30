var express = require('express');
var router = express.Router();

var User = require('../../models/User');

//统一返回格式
var responseData;
router.use(function(req, res, next) {
    responseData = {
        code: 0,
        msg: ''
    }
    next()
})

/* 用户列表 */
router.get('/',function(req, res) {
    if (!req.session.userInfo.isAdmin) {
        res.redirect('/admin');
        return;
    };
    var pageIndex = Number(req.query.pageIndex || 1);
    var pageSize = 10;
    var pages = 0;
    User.count(function(err,count) {
        //计算总页数
        pages = Math.ceil(count / pageSize);
        //取值不能超过pages
        pageIndex = Math.min( pageIndex, pages );
        //取值不能小于1
        pageIndex = Math.max( pageIndex, 1 );

        var skip = (pageIndex - 1) * pageSize;
        var pagesArr = [];
        for (var i = 1; i < pages+1; i++) {
            pagesArr.push(i)
        }

        User.find().sort({_id: -1}).limit(pageSize).skip(skip).exec(function(error,result) {
            if (error) {
                res.render('error',{message: '查找失败'})
            }else {
                res.render('admin/user/user',{
                    active: 'user',
                    data: {
                        userList: result,
                        count: count,
                        pageSize: pageSize,
                        pageIndex: pageIndex,
                        pages: pages,
                        pagesArr: pagesArr
                    },
                    userInfo: req.session.userInfo
                })
            }
        })
    })
})
/* 用户添加 */
router.get('/add',function(req, res) {
	res.render('admin/user/userAdd',{
        active: 'user',
        userInfo: req.session.userInfo
    })
})
router.post('/add',function(req, res) {
    //数据库中是否已经存在相同手机号用户
    User.findOne({
    	mobile: req.body.mobile
    }, function(err,result) {
    	if (result) {
            //数据库中已经存在该用户了
            responseData.code = 1;
            responseData.msg = '用户已经存在了';
            res.json(responseData);
        } else {
            //数据库中不存在该用户，可以保存
            new User({
                username: req.body.username,
                mobile: req.body.mobile,
                password: req.body.password
            }).save();
            responseData.msg = '保存成功';
            res.json(responseData);
        }
    })
})
/* 用户删除 */
router.post('/delete',function(req, res) {
    User.remove({_id: req.body.id},function(err) {
        if (err) {
            responseData.code = 1;
            responseData.msg = '删除失败';
            res.json(responseData);
        }else {
            responseData.msg = '删除成功';
            res.json(responseData);
        }
    })
})
/* 用户修改 */
router.get('/edit',function(req, res) {
    User.findOne({_id:req.query.id},function(err,result) {
        if (err) {
            res.render('error', {message: '用户不存在'});
        }else {
            res.render('admin/user/userDetail',{
                active: 'user',
                userDetail: result,
                userInfo: req.session.userInfo
            })
        }
    })
})
router.post('/edit',function(req, res) {
    User.update({_id:req.body.id},{
        username: req.body.username,
        mobile: req.body.mobile,
        password: req.body.password
    },function(err) {
        if (err) {
            responseData.code = 1;
            responseData.msg = '修改失败';
            res.json(responseData);
        }else {
            responseData.msg = '修改成功';
            res.json(responseData);
        }
    })
})
/* 禁用用户 */
router.post('/disable',function(req, res) {
    User.update({_id:req.body.id},{isDisabled: true},function(err) {
        if (err) {
            responseData.code = 1;
            responseData.msg = '禁止失败';
            res.json(responseData);
        }else {
            responseData.msg = '禁止成功';
            res.json(responseData);
        }
    })
})
/* 启用用户 */
router.post('/enable',function(req, res) {
    User.update({_id:req.body.id},{isDisabled: false},function(err) {
        if (err) {
            responseData.code = 1;
            responseData.msg = '启用失败';
            res.json(responseData);
        }else {
            responseData.msg = '启用成功';
            res.json(responseData);
        }
    })
})
/* 用户登录 */
router.get('/login',function(req,res) {
    res.render('admin/login');
})
router.post('/login',function(req, res, next) {
    //查询数据库中相同用户名和密码的记录是否存在，如果存在则登录成功
    User.findOne({
        mobile: req.body.mobile,
        password: req.body.password
    },function(err, result) {
        if (err||!result) {
            responseData.code = 1;
            responseData.msg = '用户名或密码错误';
            res.json(responseData);
        }else {
            if (result.isDisabled) {
                responseData.code = 2;
                responseData.msg = '用户已被禁用';
                res.json(responseData);
            }else {
                responseData.msg = '登录成功';
                responseData.userInfo = {
                    _id: result._id,
                    username: result.username,
                    isAdmin: result.isAdmin,
                    isDisabled: result.isDisabled
                };
                req.session.userInfo = responseData.userInfo;
                res.json(responseData);
            }
            
        }
    })
})
/* 用户退出 */
router.get('/logout',function(req,res) {
    req.session.userInfo = null;
    res.redirect('/admin/user/login')
})

module.exports = router;
