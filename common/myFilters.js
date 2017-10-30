function getdatefromtimestamp(input, bool) {
	var now = new Date(Number(input))
	var year = now.getFullYear(); 
	var month = now.getMonth()+1<10?'0'+(now.getMonth()+1):now.getMonth()+1; 
	var date = now.getDate()<10?'0'+now.getDate():now.getDate(); 
	var hour = now.getHours()<10?'0'+now.getHours():now.getHours(); 
	var minute = now.getMinutes()<10?'0'+now.getMinutes():now.getMinutes(); 
	var second = now.getSeconds()+'0';
	if (bool) {
		return year+"-"+month+"-"+date+"-";
	}else {
		return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second;
	}
}
function isEnd(input) {
	var now = Number(new Date().getTime())
	var end = Number(input)
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