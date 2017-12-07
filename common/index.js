const md5 = require('md5')
const utf8 = require('utf8')
const base64 = require('base-64')
const axios = require('axios')
const config = require('../config').sms

function getVerCode(num) {
	let result = ''
	for (let i = 0; i < num; i++) {
		let ran = Math.floor(Math.random()*10)
		result += ran
	}
	return result
}
function oneToTwoNum (num) {
	let number = 0
	if (num < 10) {
		number = '' + 0 + num
	} else {
		number = num
	}
	return number
}
function getTimeNum () {
	let date = new Date()
	let time = '' + date.getFullYear() + oneToTwoNum(date.getMonth()+1) + oneToTwoNum(date.getDate()) + oneToTwoNum(date.getHours()) + oneToTwoNum(date.getMinutes()) + oneToTwoNum(date.getSeconds())
	return time
}
function getResult (param, to) {
    const SoftVersion = '2014-06-30'
    const baseURL = 'https://api.ucpaas.com'
    const timeStr = getTimeNum()
    const SigParameter = md5(config.AccountSid + config.token + timeStr).toUpperCase()

    const bytes = utf8.encode(config.AccountSid + ':' + timeStr)
    const Authorization = base64.encode(bytes)

    const url = `${baseURL}/${SoftVersion}/Accounts/${config.AccountSid}/Messages/templateSMS/?sig=${SigParameter}`

    return axios({
        method: 'post',
        url: url,
        data: {
            templateSMS: {
                appId: config.appId,
                param: param,
                templateId: config.templateId,
                to: to
            }
        },
        headers: {
            "Content-Type": "application/json;charset=utf-8",
            "Accept": "application/json",
            "Authorization": Authorization
        }
    })
}
module.exports = {
	getVerCode: getVerCode,
	oneToTwoNum: oneToTwoNum,
	getTimeNum: getTimeNum,
	getResult: getResult
}