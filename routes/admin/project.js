var express = require('express');
var router = express.Router();
var crypto = require('crypto');

var Project = require('../../models/Project');
var ProjectType = require('../../models/ProjectType');
var GuessList = require('../../models/GuessList');

//统一返回格式
var responseData;
router.use(function(req, res, next) {
	responseData = {
		code: 0,
		msg: ''
	}
	next()
})

/* 项目列表 */
router.get('/', function(req, res) {
	if (!req.session.userInfo.isAdmin) {
		res.redirect('/admin');
		return;
	};
	var pageIndex = Number(req.query.pageIndex || 1);
	var pageSize = 10;
	var pages = 0;
	Project.count(function(err,count) {
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
		Project.find().sort({_id: -1}).limit(pageSize).skip(skip).populate('projectType').exec(function(error,result) {
			if (error) {
				res.render('error',{message: '查找失败'})
			}else {
				res.render('admin/project',{
					active: 'project',
					data: {
						projectList: result,
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
/* 项目添加 */
router.get('/add', function(req, res) {
	ProjectType.find(function(err, result) {
		res.render('admin/projectAdd',{
			projectType: result,
			active: 'project',
			userInfo: req.session.userInfo
		})
	})
	
})
router.post('/add',function(req, res) {
	var name = req.body.name;
	var projectType = req.body.projectType;
	var endTime = req.body.endTime;
	var imgUrl = req.body.imgUrl;
	var options = req.body.options;
	new Project({
		name: name,
		projectType: projectType,
		endTime: endTime,
		imgUrl: imgUrl,
		options: options
	}).save()
	responseData.msg = '成功'
	res.json(responseData)
})
/* 项目删除 */
router.post('/delete',function(req, res) {
	Project.remove({_id: req.body.id},function(err) {
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
/* 项目修改 */
router.get('/edit',function(req, res) {
	Project.findOne({_id:req.query.id}).populate('projectType').exec(function(err,projectDetail) {
		if (err) {
			res.render('error', {message: '项目不存在'});
		}else {
			ProjectType.find(function(error,projectType) {
				if (error) {
					res.render('error', {message: '分类错误'});
					return
				}
				res.render('admin/projectDetail',{
					active: 'project',
					projectDetail: projectDetail,
					projectType: projectType,
					userInfo: req.session.userInfo
				})
			})
		}
	})
})
router.post('/edit',function(req, res) {
	Project.update({_id:req.body.id},{
		name: req.body.name,
		projectType: req.body.projectType,
		endTime: req.body.endTime,
		imgUrl: req.body.imgUrl,
		options: req.body.options
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
/* 项目分类列表 */
router.get('/projectType',function(req, res) {
	if (!req.session.userInfo.isAdmin) {
		res.redirect('/admin');
		return;
	};
	var pageIndex = Number(req.query.pageIndex || 1);
	var pageSize = 10;
	var pages = 0;
	ProjectType.count(function(err,count) {
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

		ProjectType.find().sort({_id: -1}).limit(pageSize).skip(skip).exec(function(error,result) {
			if (error) {
				res.render('error',{message: '查找失败'})
			}else {
				res.render('admin/projectType',{
					active: 'projectType',
					data: {
						projectTypeList: result,
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
/* 项目分类添加 */
router.get('/projectType/add', function(req, res) {
	res.render('admin/projectTypeAdd',{
		active: 'projectType',
		userInfo: req.session.userInfo
	})
})
router.post('/projectType/add',function(req, res) {
	new ProjectType({
		name: req.body.name
	}).save()
	responseData.msg = '成功'
	res.json(responseData)
})
/* 项目分类删除 */
router.post('/projectType/delete',function(req, res) {
	ProjectType.remove({_id: req.body.id},function(err) {
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
/* 项目分类修改 */
router.get('/projectType/edit',function(req, res) {
	ProjectType.findOne({_id:req.query.id},function(err,result) {
		if (err) {
			res.render('error', {message: '项目分类不存在'});
		}else {
			console.log(result)
			res.render('admin/projectTypeDetail',{
				active: 'projectType',
				projectTypeDetail: result,
				userInfo: req.session.userInfo
			})
		}
	})
})
router.post('/projectType/edit',function(req, res) {
	ProjectType.update({_id:req.body.id},{
		name: req.body.name
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
/* 竞猜列表 */
router.get('/guess',function(req, res) {
	if (!req.session.userInfo.isAdmin) {
		res.redirect('/admin');
		return;
	};
	var pageIndex = Number(req.query.pageIndex || 1);
	var pageSize = 10;
	var pages = 0;
	GuessList.count(function(err,count) {
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

		GuessList.find().sort({_id: -1}).limit(pageSize).skip(skip).populate(['member','project']).exec(function(error,result) {
			if (error) {
				res.render('error',{message: '查找失败'})
			}else {
				console.log(result)
				res.render('admin/guess',{
					active: 'guess',
					data: {
						guessList: result,
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

module.exports = router;