const express = require('express')
const swig = require('swig')
const path = require('path')
// const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
require('body-parser-xml')(bodyParser)
const session = require('express-session')
const schedule = require('node-schedule')
const FreeReceive = require('./models/FreeReceive')

const app = express()

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
app.use(bodyParser.xml({
	limit: '1MB',
	xmlParseOptions: {
		normalize: true,
		normalizeTags: true,
		explicitArray: false
	}
}))
app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'public')))
// 定时任务
schedule.scheduleJob({hour: 0, minute: 0, dayOfWeek: 1}, function () {
	FreeReceive.remove({}, (err) => {
		if (err) {
			console.log(err)
			return
		}
		console.log('remove all  FreeReceive!')
	})
})

app.get('/', function (req, res) {
	res.redirect('/admin')
})
app.use('/boss', require('./routes/boss'))
app.use('/admin', require('./routes/admin'))
app.use('/api', require('./routes/api'))
app.use('/weixin', require('./routes/weixin'))

//设置跨域
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*")
	res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
	res.header('Access-Control-Allow-Headers', 'Content-Type,Accept,X-Access-Token')
	next()
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
