const express = require("express")
const router = express.Router()
const { requireAuth } = require('./../middleware/authmiddleware')
const clientid = "1008206768989544449"
const secret = "M2ixbjumSA6o1Qgt7KvCNcPb_giJHyp3"
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const User = require('./../model/user.js')
const speakeasy = require('speakeasy')
const qrcode = require('qrcode')
const bodyParser = require('body-parser')
const xss = require('xss')
router.use(bodyParser.json())

router.get('/authenticate',requireAuth,async function(req,rep){
    const code = req.query.code
    //console.log(code)
    if (code){
       const response = await fetch("https://discord.com/api/oauth2/token",{
            body:  new URLSearchParams({
                client_id: clientid,
                client_secret: secret,
                code,
                grant_type: 'authorization_code',
                redirect_uri: `http://mete0r.xyz/settings/authenticate`,
                scope: 'identify',
            }),
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })

            const son =  await response.json()
            //console.log(son)
            //console.log(son["access_token"])

            const resp2 = await fetch("https://discord.com/api/users/@me",{
                headers: {
                    "authorization": `${son["token_type"]} ${son["access_token"]}`
                }
            })

                const final = await resp2.json()

                const dcid = final.id
                //console.log(dcid)
                const user = await User.findOne({discordid: dcid})/*.lean()*/
                if (user) {
                    return rep.redirect("/settings?error=alreadyused")
                }
                const milliseconds = BigInt(dcid) >> 22n
                if (new Date(Number(milliseconds) + 1420070400000)> Date.now() - (1000 * 60 * 60 * 24 * 7 * 4) === true){ // 1 month
                    return rep.redirect("/settings?error=toonew")
                }
                req.userdocument.discordid = dcid.toString()
                req.userdocument.markModified('discordid')
               await req.userdocument.save()

                rep.redirect('/settings')
            
    }
})


/*router.get("/unlink", requireAuth,async (req, res) => {
    req.userdocument.discordid = undefined
    req.userdocument.markModified('discordid')
   await req.userdocument.save()
   res.redirect('/settings')
})*/

router.get("/2fa", requireAuth,async (req, res) => {
    if (req.userdocument.twofasecrets){
        const json = JSON.parse(req.userdocument.twofasecrets)
        if (json.verified === true){
            return res.json({status: "success", message: "2FA already set sorry."})
        }else{
            // basically if they haven't verified that they know the secret before we will just remove it for them
            req.userdocument.twofasecrets = undefined
            req.userdocument.markModified('twofasecrets')
            req.userdocument.save()
        }
    }
    const secret = speakeasy.generateSecret({
        name: "Meteorite"
    })
    qrcode.toDataURL(secret.otpauth_url, function(err, data) {

        req.userdocument.twofasecrets = JSON.stringify({secret: secret.ascii, verified: false})
        req.userdocument.markModified('twofasecrets')
        req.userdocument.save()
        return res.json({status: "success", message: "2FA set please verify to complete.", qrcode: data})
      });

})


router.post("/verify2fa", requireAuth,async (req, res) => {
    const {code} = req.body
    if (req.userdocument.twofasecrets){
        const json = JSON.parse(req.userdocument.twofasecrets)
        if (json.verified === true){
            return res.json({status: "success", message: "2FA already set sorry."})
        }else{

            const valid = speakeasy.totp.verify({
                secret: json.secret,
                encoding: 'ascii',
                token: code
            })
            if (valid === false){
                return res.json({status: 'error', error: 'Invalid 2FA Code'}) 
            }else{
                json.verified = true
                req.userdocument.twofasecrets = JSON.stringify(json)
                req.userdocument.markModified('twofasecrets')
                req.userdocument.save()
                return res.json({status: "success", message:"2FA verified."})
            }


        }
    }
})

router.post("/setbio", requireAuth,async (req, res) => {
    const { bio } = req.body
    if (typeof bio !== 'string'){
        return res.json({status: 'error', error: 'Bio not sent'}) 
    }
    if (bio.length>100){
        return res.json({status: 'error', error: 'Length over 100.'}) 
    }
    req.userdocument.bio = xss(bio)
    req.userdocument.markModified('bio')
    req.userdocument.save()
    return res.json({status: "success", message:"Done."})
})

router.post("/changecss", requireAuth,async (req, res) => {
    const { customcss } = req.body
    if (typeof customcss !== 'string'){
        return res.json({status: 'error', error: 'Bio not sent'}) 
    }
    if (customcss.length>5000){
        return res.json({status: 'error', error: 'Length over 5000.'}) 
    }
    req.userdocument.css = xss(customcss)
    req.userdocument.markModified('css')
    req.userdocument.save()
    return res.json({status: "success", message:"Done."})
})

router.post("/aboutme", requireAuth,async (req, res) => {
    const { about } = req.body
    if (typeof about !== 'string'){
        return res.json({status: 'error', error: 'Bio not sent'}) 
    }
    if (about.length>200){
        return res.json({status: 'error', error: 'Length over 200.'}) 
    }
    req.userdocument.aboutme = xss(about)
    req.userdocument.markModified('aboutme')
    req.userdocument.save()
    return res.json({status: "success", message:"Done."})
})


module.exports = router