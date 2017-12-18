//node-rsa 加密算法 rsa
const NodeRSA = require('node-rsa')
const fs = require('fs')
//获取公钥
const RSA_PUBLIC_KEY = fs.readFileSync(__dirname+'/pub.pem').toString()
const RSAUtil = {
}
//打印公钥
//console.log(RSA_PUBLIC_KEY)
//公钥加密
RSAUtil.rsaEncrypt = function (content) {
    let clientKey = new NodeRSA(RSA_PUBLIC_KEY)
    // 在node-rsa模块中加解密默认使用 pkcs1_oaep ,而在js中加密解密默认使用的是 pkcs1
    clientKey.setOptions({encryptionScheme: 'pkcs1'}) //就是新增这一行代码
    let encrypted = clientKey.encrypt(content, 'base64')
    return encrypted
}
//公钥解密
RSAUtil.rsaDecrypt = function (content) {
    let clientKey = new NodeRSA(RSA_PUBLIC_KEY)
    // 在node-rsa模块中加解密默认使用 pkcs1_oaep ,而在js中加密解密默认使用的是 pkcs1
    clientKey.setOptions({encryptionScheme: 'pkcs1'}) //就是新增这一行代码
    let decrypted = clientKey.decryptPublic(content,'utf-8')
    return decrypted
}
//测试加密
RSAUtil.getEncrypt = function (content){
    let  encrypted = RSAUtil.rsaEncrypt(content)
    console.log(encrypted)
    console.log(encrypted.length)
}
//测试解密
RSAUtil.getDecrypt = function (content){
    let  decrypted = RSAUtil.rsaDecrypt(content)
    console.log(decrypted)
    console.log(decrypted.length)
}
//测试
//RSAUtil.getEncrypt('test')
//RSAUtil.getDecrypt('enBIq6cyA0imWthjApNkcdiSyVnsKdLN4DtENzL7mIk+U4aliJKpk9SvCKYBocPe5hVQoEMMJWQHqGn3S8SyMd4XkBvi7qPIpQOYYku2dMmg1AxgEbrWaTk+bkAlITh3eT99U/wBAT5NKx7Sv6e3V4IX+sRkPsuSLRFY1fnPqzk=')
module.exports = RSAUtil

