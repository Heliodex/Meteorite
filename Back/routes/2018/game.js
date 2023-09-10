const express = require("express")
const router = express.Router()
const { requireAuth } = require('../../middleware/authmiddlewaregame')
const crypto = require('crypto');
const fs = require('fs')
const key = fs.readFileSync('DefaultPrivateKey.pem')
const { getPort, checkPort, getRandomPort, waitForPort } = require('get-port-please')
const RCC_HOST = process.env.RCC_HOST
var sanitize = require('mongo-sanitize');
const games = require('./../../model/games.js')
const signatures = require("./../signatures.js")
const rcc = require('../../model/rcc2018.js')
const rcctalk = require('../../rcctalk2018')
const User = require('../../model/user.js')

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
 const _2018placelauncher = async(req,res,next) => {
  var enabled = req.config
  if (enabled.GamesEnabled === false){
      return res.json({status:"error",error:"Games are disabled bad boy"})
  }
  var joinJson = {"ClientPort":0,"MachineAddress":"localhost","ServerPort":25564,"PingUrl":"","PingInterval":120,"UserName":"default","SeleniumTestMode":false,"UserId":0,"SuperSafeChat":false,"CharacterAppearance":"http://shitncumblox.gq/game/charapp?name=default","ClientTicket":"","GameId":1,"PlaceId":1818,"MeasurementUrl":"","WaitingForCharacterGuid":"cad99b30-7983-434b-b24c-eac12595e5fd","BaseUrl":"http://www.mete0r.xyz/","ChatStyle":"ClassicAndBubble","VendorId":0,"ScreenShotInfo":"","VideoInfo":"<?xml version=\"1.0\"?><entry xmlns=\"http://www.w3.org/2005/Atom\" xmlns:media=\"http://search.yahoo.com/mrss/\" xmlns:yt=\"http://gdata.youtube.com/schemas/2007\"><media:group><media:title type=\"plain\"><![CDATA[ROBLOX Place]]></media:title><media:description type=\"plain\"><![CDATA[ For more games visit http://www.roblox.com]]></media:description><media:category scheme=\"http://gdata.youtube.com/schemas/2007/categories.cat\">Games</media:category><media:keywords>ROBLOX, video, free game, online virtual world</media:keywords></media:group></entry>","CreatorId":0,"CreatorTypeEnum":"User","MembershipType":"None","AccountAge":365,"CookieStoreFirstTimePlayKey":"rbx_evt_ftp","CookieStoreFiveMinutePlayKey":"rbx_evt_fmp","CookieStoreEnabled":true,"IsRobloxPlace":false,"GenerateTeleportJoin":false,"IsUnknownOrUnder13":false,"SessionId":"c25fd620-bbaa-4fb2-b022-3f053cdd1abd|00000000-0000-0000-0000-000000000000|0|204.236.226.210|8|2016-08-17T01:05:05.7115837Z|0|null|null|null|null","DataCenterId":0,"UniverseId":0,"BrowserTrackerId":0,"UsePortraitMode":false,"FollowUserId":0,"CharacterAppearanceId":1}
      if (!req.query.name && !req.query.placeId && !req.query.placeid){
          return res.json({status:"error",error:"no placeid bad"})
      }
      if (req.userdocument.gamejoin2018){
          return res.json({"jobId":"Test","status":2,"joinScriptUrl":"http://mete0r.xyz/game/join.ashx?ver=2018&auth="+req.query.auth??req.cookies.jwt,"authenticationUrl":"http://mete0r.xyz/Login/Negotiate.ashx","authenticationTicket":"SomeTicketThatDosentCrash","message":""})
      }
      var sanitizedplaceid = sanitize(req.query.name??req.query.placeId??req.query.placeid)
      const game = await games.findOne({idofgame: sanitizedplaceid}).lean()
      if (!game){
          return res.json({status:"error",error:"that game doesn't exist!"})
      }
      if (game.version != "2018"){
          return next()
      }
      let instance = await rcc.findOne({PlaceId: sanitizedplaceid}).lean()
      if (instance && instance.Status === 2){


          // if an rcc instance already exists we don't need to create a new one so we will just drag them into the existing game
          joinJson.UserName = req.userdocument.username
          joinJson.UserId = req.userdocument.userid
          joinJson.CharacterAppearance = "http://mete0r.xyz/v1.1/avatar-fetch?userId" + req.userdocument.userid
          joinJson.MachineAddress = RCC_HOST // need to put rcc host here lol
          joinJson.ServerPort = instance.Port
          joinJson.PlaceId = instance.PlaceId
          joinJson.GameId = sanitizedplaceid
          joinJson.CharacterAppearanceId = req.userdocument.userid
          joinJson.MembershipType = req.userdocument.membership
          joinJson.CreatorId = game.useridofowner
          joinJson.SessionId = req.query.auth??req.cookies.jwt

          const timestamp = Date.now()
          joinJson.ClientTicket = timestamp+";" // timestamp
          //create signature 1
          const sign1 = crypto.createSign('SHA1');
          sign1.update(`${req.userdocument.userid}\n`/*userid*/+`${req.userdocument.username}\n`/*username*/+`http://mete0r.xyz/v1.1/avatar-fetch?userId=${req.userdocument.userid}\n`/*charapp*/+`game${sanitizedplaceid}\n`/*jobid*/+ timestamp/*timestamp*/)
          var signature1 = sign1.sign(key, "base64")
          joinJson.ClientTicket += signature1 + ";"
  
          //create signature 2
          const sign2 = crypto.createSign('SHA1');
          sign2.update(`${req.userdocument.userid}\n`/*userid*/+`game${sanitizedplaceid}\n`/*jobid*/+ timestamp/*timestamp*/)
          var signature2 = sign2.sign(key, "base64")
          joinJson.ClientTicket += signature2
          
          req.userdocument.gamejoin2018 = JSON.stringify(joinJson)
          req.userdocument.markModified('gamejoin2018')
          await req.userdocument.save()
          var joinScriptJson = {"jobId":"Test","status":2,"joinScriptUrl":"http://mete0r.xyz/game/join.ashx?ver=2018&auth="+joinJson.SessionId,"authenticationUrl":"http://mete0r.xyz/Login/Negotiate.ashx","authenticationTicket":"SomeTicketThatDosentCrash","message":""}


          return res.send(JSON.stringify(joinScriptJson))
      }
      if (instance && instance.Status === 1){
        var joinScriptJson = {"jobId":"Test","status":1,"joinScriptUrl":"http://mete0r.xyz/game/join.ashx?ver=2018&auth="+joinJson.SessionId,"authenticationUrl":"http://mete0r.xyz/Login/Negotiate.ashx","authenticationTicket":"SomeTicketThatDosentCrash","message":""}
        return res.send(JSON.stringify(joinScriptJson))
      }


      var port = await getPort({random: true})
      // launch job
      rcctalk.OpenGame("game"+sanitizedplaceid,port,RCC_HOST,sanitizedplaceid,game.useridofowner)
      //console.dir(response,{ depth: null })
      //console.dir(response,{ depth: null })

      await rcc.create({
        PlaceId: sanitizedplaceid,
        Port: port,
        Status: 1 // 1 means loading
    })

     //console.log(newrenderscript)
        
     var joinScriptJson = {"jobId":"Test","status":1,"joinScriptUrl":"http://mete0r.xyz/game/join.ashx?ver=2020&auth="+joinJson.SessionId,"authenticationUrl":"http://mete0r.xyz/Login/Negotiate.ashx","authenticationTicket":"SomeTicketThatDosentCrash","message":""}
     return res.send(JSON.stringify(joinScriptJson))

 }

router.all("/2018/join",requireAuth,_2018placelauncher,async (req, res) => {
    return res.json({status:"error",error:"Version different than client requested."})
})

//rcctalk.CloseJob('game2')
module.exports = {router: router, _2018placelauncher:_2018placelauncher}