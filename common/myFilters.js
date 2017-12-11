function getdatefromtimestamp(input, bool) {
	let now = new Date(Number(input))
	let year = now.getFullYear()
	let month = now.getMonth() + 1 < 10 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1
	let date = now.getDate() < 10 ? '0' + now.getDate() : now.getDate()
	let hour = now.getHours() < 10 ? '0' + now.getHours() : now.getHours()
	let minute = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()
	let second = now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds()
	if (bool) {
		return year + "-" + month + "-" + date + "-"
	}else {
		return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second
	}
}
function isEnd(input) {
	let now = Number(new Date().getTime())
	let end = Number(input)
	if (end > now) {
		return '待开奖'
	}else {
		return '已开奖'
	}
}
module.exports ={
	getdatefromtimestamp: getdatefromtimestamp,
	isEnd: isEnd
}