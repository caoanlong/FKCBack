const express = require('express')
const swig = require('swig')
const path = require('path')
// const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const multer = require('multer')
const session = require('express-session')

const app = express()

let storage = multer.diskStorage({
	destination: function (req, file, cb) {
		// cb(null, './public/uploads')
		cb(null, '/mydatadisk/images')
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now() + '.' + file.mimetype.split('/')[1])
	}
})
let upload = multer({ storage: storage })

// view engine setup
app.engine('html', swig.renderFile)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'html')

// 在开发过程中，需要取消模板缓存
swig.setDefaults({ cache: false })
// 设置过滤器
swig.setFilter('getdatefromtimestamp', require('./common/myFilters').getdatefromtimestamp)
swig.setFilter('isEnd', require('./common/myFilters').isEnd)

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function (req, res) {
	res.redirect('/admin')
})
app.use('/admin', require('./routes/admin'))
app.use('/api', require('./routes/api'))

//设置跨域
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*")
	res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
	res.header('Access-Control-Allow-Headers', 'Content-Type,Accept,X-Access-Token')
	next()
})
/* 上传单个图片 */
app.all('/uploadImg', upload.single('file'), function (req, res, next) {
	if (!req.file) {
		res.json({
			code: 1,
			msg: '图片为空'
		})
		return
	}
	res.json({
		code: 0,
		msg: '上传成功',
		data: 'http://39.108.245.177:4000'+req.file.path.slice(18)
	})
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	let err = new Error('Not Found')
	err.status = 404
	next(err)
})

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message
	res.locals.error = req.app.get('env') === 'development' ? err : {}

	// render the error page
	res.status(err.status || 500)
	res.render('error')
})


module.exports = app
