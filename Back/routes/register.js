const { response } = require("express")
const express = require("express")
const router = express.Router()
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const User = require('./../model/user.js')
const keys = require('./../model/keys.js')
const bcrypt = require('bcrypt')
var sanitize = require('mongo-sanitize');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
var xss = require("xss")

function isAlphaNumeric(str) {
    var code, i, len;
  
    for (i = 0, len = str.length; i < len; i++) {
      code = str.charCodeAt(i);
      if (!(code > 47 && code < 58) && // numeric (0-9)
          !(code > 64 && code < 91) && // upper alpha (A-Z)
          !(code === 95) && // underscore
          !(code > 96 && code < 123)) { // lower alpha (a-z)
        return false;
      }
    }
    return true;
  }

router.use(bodyParser.json())

router.post("/",async (req, res) => {
    //console.log(req.body)
    let {username, password: plainTextPassword} = req.body
    if (!req.body.captcha) {
        return res.json({status: 'error', error: 'Need a valid captcha bozo'})
    }
    if (!username || typeof username !== 'string') {
        return res.json({status: 'error', error: 'Usernames needs to be sent and it needs to be a string'})
    }
    if (!plainTextPassword || typeof plainTextPassword !== 'string') {
        return res.json({status: 'error', error: 'Password needs to be sent and it needs to be a string'})
    }

    if(plainTextPassword.length < 4) {
        return res.json({status: 'error', error: 'Password needs to be at least 5 characters'})
    }

    if(username.length > 20) {
        return res.json({status: 'error', error: 'Username can not be more than 20 characters'})
    }

    if (isAlphaNumeric(username) === false){
     return res.json({status: 'error', error: 'Usernames can not have special symbols except for underscores'})
    }
// verify our captcha
   var captchaverifyreq =  await fetch('https://hcaptcha.com/siteverify', {
    method: 'POST',
    headers:{
      'Content-Type': 'application/x-www-form-urlencoded'
    },    
    body: new URLSearchParams({
        'secret': '0xE05AB1CFB83252696175FA69E526a3048547Cf0d',
        'response': req.body.captcha,
        'sitekey': '30f6dee1-f765-42d0-ae34-29697c4aa623'
    })
});
   var captcha = await captchaverifyreq.json()
if (captcha.success == false) {
    return res.json({status: 'error', error: 'Invalid Captcha. Try again.'})
}

// check if keys are enabled
var registration = req.config
if (registration.RegistrationEnabled === false){
    return res.json({status: 'error', error: 'Registration has been temporarily disabled. Please join our discord.'})
}
if (registration.KeysEnabled === true){

    if (!req.body.invitekey){
        return res.json({status: 'error', error: 'Invite key needs to be sent.'})
    }

    sanitizedkey = sanitize(req.body.invitekey)
    const key = await keys.findOne({Key: sanitizedkey}).lean()

    if (!key){
        // key is invalid
        return res.json({status: 'error', error: 'Invalid Key.'})
    }

    if (key.Used === true){
        // key has been used already
        return res.json({status: 'error', error: 'Key has been used already.'})
    }

    keys.updateOne({Key: sanitizedkey}, {
        $set: {
            Used: true,
            UsedBy: username
        }
    }, 
    function(err, doc) {
      //console.log(err)
    })
}



// if all checks above have succceeded we can proceed with registering in our database
username = xss(username) // stop anyone doing anything silly :)
    try{
        const password = (await bcrypt.hash(plainTextPassword, 10))
        const userid = await User.countDocuments();     
    var datetime = new Date()
    var datetimeepoch = new Date().getTime()
       const response =  await User.create({
            username,
            password,
            admin: false,
            coins: 15,
            userid,
            moderation: JSON.stringify({status: "ok", Reason: "None", ExpiresIn: "None"}),
            joindate: datetime.toISOString().slice(0,10),
            colors: [{name: "Head",value: 1001 },{name: "Torso",value: 1001 },{name: "Left Arm",value: 1001 },{name: "Right Arm",value: 1001 },{name: "Left Leg",value: 1001 },{name: "Right Leg",value: 1001 }],
            lastclaimofcurrency: datetimeepoch,
            membership: "None",
            timesincelastrequest: datetimeepoch

        })
        //console.log(response)
    }catch(error){
        if (error.code === 11000) {
            return res.json({status: 'error', error: 'Username already in use'})
        }else if (error.errors.username.kind === "unique") {
            return res.json({status: 'error', error: 'Username already in use'})
        }
        throw error
    }
    
    res.json({status: 'ok'})
})

module.exports = router