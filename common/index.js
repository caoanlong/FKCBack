function getVerCode(num) {
	let result = ''
	for (let i = 0; i < num; i++) {
		let ran = Math.floor(Math.random()*10)
		result += ran
	};
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
module.exports = {
	getVerCode: getVerCode,
	oneToTwoNum: oneToTwoNum,
	getTimeNum: getTimeNum
}