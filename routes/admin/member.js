var express = require('express');
var router = express.Router();

var Member = require('../../models/Member');

//统一返回格式
var responseData;
router.use(function(req, res, next) {
    responseData = {
        code: 0,
        msg: ''
    }
    next()
})


/* 会员列表 */
router.get('/',function(req, res, next) {
    if (!req.session.userInfo.isAdmin) {
        res.redirect('/admin');
        return;
    };
    var pageIndex = Number(req.query.pageIndex || 1);
    var pageSize = 10;
    var pages = 0;
    Member.count(function(err,count) {
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

        Member.find().sort({_id: -1}).limit(pageSize).skip(skip).exec(function(error,result) {
            if (error) {
                res.render('error',{message: '查找失败'})
            }else {
                res.render('admin/member',{
                    active: 'member',
                    data: {
                        memberList: result,
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
/* 会员添加 */
router.get('/add',function(req, res) {
    res.render('admin/memberAdd',{
        active: 'member',
        userInfo: req.session.userInfo
    })
})
router.post('/add',function(req, res) {
    //数据库中是否已经存在相同手机号用户
    Member.findOne({
        mobile: req.body.mobile
    }, function(err,result) {
        if (result) {
            //数据库中已经存在该用户了
            responseData.code = 1;
            responseData.msg = '会员已经存在了';
            res.json(responseData);
        } else {
            //数据库中不存在该用户，可以保存
            new Member({
                mobile: req.body.mobile
            }).save();
            responseData.msg = '保存成功';
            res.json(responseData);
        }
    })
})
/* 会员删除 */
router.post('/delete',function(req, res) {
    Member.remove({_id: req.body.id},function(err) {
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
/* 会员修改 */
router.get('/edit',function(req, res) {
    Member.findOne({_id:req.query.id},function(err,result) {
        if (err) {
            res.render('error', {message: '用户不存在'});
        }else {
            console.log(result)
            res.render('admin/memberDetail',{
                active: 'member',
                memberDetail: result,
                userInfo: req.session.userInfo
            })
        }
    })
})
router.post('/edit',function(req, res) {
    Member.update({_id:req.body.id},{
        mobile: req.body.mobile,
        goldBean: req.body.goldBean
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
/* 禁用会员 */
router.post('/disable',function(req, res) {
    Member.update({_id:req.body.id},{isDisabled: true},function(err) {
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
/* 启用会员 */
router.post('/enable',function(req, res) {
    Member.update({_id:req.body.id},{isDisabled: false},function(err) {
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

module.exports = router;