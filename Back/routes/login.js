const express = require("express")
const router = express.Router()
const bodyParser = require('body-parser')
var sanitize = require('mongo-sanitize');
const mongoose = require('mongoose');
const User = require('./../model/user.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const JWT_SECRET = process.env.JWT_SECRET
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const speakeasy = require('speakeasy')
const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
	windowMs: 5 * 1000, // 5 seconds
	max: 1, // Limit each IP to 1 requests per `window`
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (request, response, next, options) =>{
        return response.json({status: 'error', error: 'Too many requests try again later.'})
    }
})

router.use(bodyParser.json())

router.get("/", (req, res) => {
    res.redirect('/')
})

router.get(["/RequestAuth","/RequestAuth.ashx"], (req, res) => {
  if (!req.cookies['.ROBLOSECURITY']){
    res.status(403).end()
  }
    res.send('https://www.mete0r.xyz/Login/Negotiate.ashx?suggest='+req.cookies['.ROBLOSECURITY'])
}) // studio

router.get(["/Negotiate","/Negotiate.ashx"], (req, res) => {
  if (!req.query.suggest){
    res.status(403).end()
  }
    //res.cookie('jwt', req.query.suggest) // maxage is 24 hours
    res.cookie('.ROBLOSECURITY', req.query.suggest)
    res.cookie('.RBXID', req.query.suggest)
    res.send(req.query.suggest)
}) // studio


router.post("/",limiter,async (req, res) => {
    //console.log(req.headers)
    let {username, password, _2fa} = req.body
    if (!username && req.headers?.["user-agent"]?.includes("RobloxStudio/WinInet") === true){ // Studio login
        username = req.body.cvalue??req.body.username
        password = req.body.password??req.body.ticket
        _2fa = req.body.code
    }
    if (!username || typeof username !== 'string') {
        return res.json({status: 'error', error: 'Usernames needs to be sent and it needs to be a string'})
    }
    if (!password || typeof password !== 'string') {
        return res.json({status: 'error', error: 'Password needs to be sent and it needs to be a string'})
    }

    if(password.length < 4) {
        return res.json({status: 'error', error: 'Password needs to be at least 5 characters'})
    }

    sanitizedusername = sanitize(username)

    const user = await User.findOne({username: sanitizedusername})/*.lean()*/
    if (!user) {
        if (req.headers?.["user-agent"] === "RobloxStudio/WinInet"){ // studio response
            return res.json({
                "errors": [
                  {
                    "code": 1,
                    "message": "Incorrect password"
                  }
                ]
              })
        }
        return res.json({status: 'error', error: 'Invalid username/password'})
    }

    if (user.twofasecrets){
        const json = JSON.parse(user.twofasecrets)
        if (json.verified === true){
        if (!_2fa){
            if (req.headers?.["user-agent"] === "RobloxStudio/WinInet"){ // studio response
            return res.json({
                "user": {
                  "id": user.userid,
                  "name": user.username,
                },
                "twoStepVerificationData": {
                  "mediaType": "Email",
                  "ticket": password
                },
                "isBanned": false
              })
            }
            return res.json({status: 'error', error: '2FA Enabled on account but 2fa not sent'})
        }
        const valid = speakeasy.totp.verify({
            secret: json.secret,
            encoding: 'ascii',
            token: _2fa
        })
        if (valid === false){
            if (req.headers?.["user-agent"] === "RobloxStudio/WinInet"){ // studio response
            return res.json({
                "errors": [
                  {
                    "code": 6,
                    "message": "Invalid two step verify code."
                  }
                ]
              })
            }
            return res.json({status: 'error', error: 'Invalid 2FA Code'}) 
        }
        
    }else{
        // basically if they haven't verified that they know the secret before we will just remove it for them
        user.twofasecrets = undefined
        user.markModified('twofasecrets')
        user.save() 
    }
    }

    if(await bcrypt.compare(password, user.password) || password === user.password) {
        // the username and password match
        // lets make a token for them using the data from our database
        const ip = req.headers['cf-connecting-ip'] || req.socket.remoteAddress
        const token = jwt.sign({ id: user._id, username: user.username, admin: user.admin, userid: user.userid, ip, furry: true },JWT_SECRET,{expiresIn: '24h'})
        if (req.headers?.["user-agent"] != "RobloxStudio/WinInet"){
        res.cookie('jwt', token, {SameSite: "Strict",httpOnly: true,maxAge: 24 * 60 * 60 * 1000 }) // maxage is 24 hours
        }
        res.cookie('.ROBLOSECURITY', token, {SameSite: "Strict",httpOnly: true,maxAge: 24 * 60 * 60 * 1000 })
        res.cookie('.RBXID', token, {SameSite: "Strict",httpOnly: true,maxAge: 24 * 60 * 60 * 1000 })
        if (req.url === "/v2/twostepverification/verify"){
            return res.json({})
        }
        if (req.headers?.["user-agent"] === "RobloxStudio/WinInet"){ // studio response
          return res.json({
            "user": {
              "id": user.userid,
              "name": user.username,
            },
            "isBanned": false
          })
        }
        return res.json({status: 'ok', cookie: token})
    }
    if (req.headers?.["user-agent"] === "RobloxStudio/WinInet"){ // studio response
        return res.json({
            "errors": [
              {
                "code": 1,
                "message": "Incorrect password"
              }
            ]
          })
    }

    res.status(403).json({status: 'error', error: 'Invalid username/password'})
})

module.exports = router