const crypto = require('crypto')

function aesEncrypt(data, key) {
    const cipher = crypto.createCipher('aes192', key)
    let crypted = cipher.update(data, 'utf8', 'hex')
    crypted += cipher.final('hex')
    return crypted
}
let key = 'password'
let data = 'UniclientByHhjAndWq'

console.log('激活码:' + aesEncrypt(data, key), '验证密钥:' + key)
