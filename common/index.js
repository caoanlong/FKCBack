function getVerCode(num) {
	let result = '';
	for (let i = 0; i < num; i++) {
		let ran = Math.floor(Math.random()*10);
		result += ran;
	};
	return result;
}
module.exports = {
	getVerCode: getVerCode
}