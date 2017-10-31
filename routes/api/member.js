var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var common = require('../../common');

var Member = require('../../models/Member');
var VerCode = require('../../models/VerCode');
var secret =require('../../config').secret;

//统一返回格式
var responseData;
router.use(function(req, res, next) {
    responseData = {
        code: 0,
        msg: ''
    }
    next()
})

/* 获取短信验证码 */
router.post('/verCode',function(req, res) {
    var mobile = req.body.mobile||'';
    if (!mobile) {
        responseData.code = 2;
        responseData.msg = '手机号不能为空';
        res.json(responseData);
        return;
    };
    VerCode.findOne({mobile: mobile},function(err, result) {
        if (err) {
            responseData.code = 1;
            responseData.msg = '获取失败';
            res.json(responseData);
            return
        };
        var newVerCode = common.getVerCode(4);
        if (result) {
            VerCode.update({_id: result._id},{
                verCode: newVerCode,
                mobile: mobile,
                addTime: new Date().getTime()
            },function(error) {
                if (error) {
                    responseData.code = 2;
                    responseData.msg = '获取失败';
                    res.json(responseData);
                }else {
                    responseData.msg = '获取成功';
                    responseData.data = newVerCode;
                    res.json(responseData);
                }
            })  
        }else {
            new VerCode({
                verCode: newVerCode,
                mobile: mobile,
                addTime: new Date().getTime()
            }).save();
            responseData.msg = '获取成功';
            responseData.data = newVerCode;
            res.json(responseData);
        }
    }) 
})

/* 会员登录 */
router.post('/login',function(req, res, next) {
    var mobile = req.body.mobile||'';
    var curVerCode = req.body.verCode||'';
    if (!mobile) {
        responseData.code = 3;
        responseData.msg = '手机号不能为空';
        res.json(responseData);
        return;
    };
    if (!curVerCode) {
        responseData.code = 4;
        responseData.msg = '验证码不能为空';
        res.json(responseData);
        return;
    };
    VerCode.findOne({mobile: mobile},function(err, result) {
        if (err) {
            responseData.code = 1;
            responseData.msg = '服务器错误';
            res.json(responseData);
            return;
        };
        if (curVerCode != result.verCode) {
            responseData.code = 2;
            responseData.msg = '验证码不正确';
            res.json(responseData);
            return;
        };
        var curTime = new Date().getTime();
        var addTime = result.addTime;
        var time = 60*1000;
        if (curTime - addTime > time) {
            responseData.code = 3;
            responseData.msg = '验证码已失效';
            res.json(responseData);
            return;
        };
        //判断是否已经注册过
        Member.findOne({mobile: mobile},function(error, data) {
            if (error) {
                responseData.code = 4;
                responseData.msg = '服务器错误';
                res.json(responseData);
                return;
            };
            if (data) {
                var token = jwt.encode({
                    iss: data._id,
                    exp: 1000*60*60*24*365
                },secret.jwtTokenSecret);
                responseData.msg = '登录成功';
                responseData.data = data;
                responseData.token = token;
                res.json(responseData);
                return;
            };
            //数据库中不存在该用户，可以保存
            new Member({mobile: mobile}).save(function(err1) {
                if (err1) {
                    responseData.code = 5;
                    responseData.msg = '登录失败';
                    res.json(responseData);
                    return;
                };
                Member.findOne({mobile: mobile},function(err2,mem) {
                    if (err2) {
                        responseData.code = 6;
                        responseData.msg = '登录失败';
                        res.json(responseData);
                        return;
                    };
                    var token = jwt.encode({
                        iss: mem._id,
                        exp: 1000*60*60*24*365
                    },secret.jwtTokenSecret);
                    responseData.msg = '登录成功';
                    responseData.data = data;
                    responseData.token = token;
                    res.json(responseData);
                })
            })
        })
    })
})

/* 查看会员详情 */
router.post('/info', function(req, res) {
    var token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token']
    var memberId = jwt.decode(token,secret.jwtTokenSecret).iss
    Member.findOne({_id: memberId}, function(err, result) {
        if (err) {
            responseData.code = 1;
            responseData.msg = '获取失败';
            res.json(responseData);
            return;
        }
        responseData.msg = '获取成功';
        responseData.data = result
        res.json(responseData)
    })
})


module.exports = router;