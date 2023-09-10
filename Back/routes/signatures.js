const crypto = require('crypto');
const fs = require('fs')
const key = fs.readFileSync('DefaultPrivateKey.pem')
// signature API for roblos , used to bless scripts from site to client/rcc/studio and will grant
// FULL Lua permissions to scripts, and allow CoreGui access.
function signer(wow){
    const sign = crypto.createSign('SHA1');
    sign.update("\r\n" + JSON.stringify(wow))
        var signature_b64 = sign.sign(key, "base64")
        //console.log(signature_b64)

        return(signature_b64)
}
module.exports = {signer}