const secret = {
    'jwtTokenSecret': 'myfkc'
}
const sms = {
    AccountSid: '6d501c927247038a73924d0719d4389d', //开发者账号ID。由32个英文字母和阿拉伯数字组成的开发者账号唯一标识符
    token: 'ec960e0bb45aad5b2dd14ca9ddbc3336',
    appId: 'db12d3c40263427ab2ff375b9f91b1ee', //短信验证码里面的appId
    templateId: '28412' //短信模板id
}
module.exports = {
	secret: secret,
	sms: sms
}