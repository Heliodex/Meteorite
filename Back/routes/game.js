const express = require("express")
const router = express.Router()
const signatures = require("./signatures.js")
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const User = require('../model/user.js')
const { requireAuth } = require('../middleware/authmiddlewaregame')
const rcctalk = require('../rcctalk')
const games = require('../model/games.js')
const catalog = require('../model/item.js')
const rcc = require('../model/rcc.js')
var sanitize = require('mongo-sanitize');
const { getPort, checkPort, getRandomPort, waitForPort } = require('get-port-please')
const fs = require('fs')
const gamescript = fs.readFileSync('actualgameserver.lua','utf-8')
require('dotenv').config()
const RCC_HOST = process.env.RCC_HOST
const logshook = process.env.logshook
const crypto = require('crypto');
const key = fs.readFileSync('DefaultPrivateKey.pem')
const key2 = fs.readFileSync('DefaultPrivateKey.pem')
const key2020 = fs.readFileSync('PrivateKey2020.txt')
const { _2020placelauncher }  = require('../routes/2020/game')
const { _2018placelauncher }  = require('../routes/2018/game')

//join and placelauncher
function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  router.get("/visit",async (req, res) => {
    // studio
    const string =  `local RS = game:GetService("RunService")
    local P = game:GetService("Players")
    local LP = P:CreateLocalPlayer(0)
    LP.CharacterAppearance = ""
    LP.CharacterAdded:connect(
        function(c)
            repeat
                wait()
            until c:FindFirstChild("Humanoid")
            local h = c:FindFirstChild("Humanoid")
            h.Died:connect(
                function()
                    wait(5)
                    LP:LoadCharacter()
                end
            )
        end
    )
    game:GetService("InsertService"):SetBaseSetsUrl("http://mete0r.xyz/Game/Tools/InsertAsset.ashx?nsets=10&type=base")
game:GetService("InsertService"):SetUserSetsUrl("http://mete0r.xyz/Game/Tools/InsertAsset.ashx?nsets=20&type=user&userid=%d")
game:GetService("InsertService"):SetCollectionUrl("http://mete0r.xyz/Game/Tools/InsertAsset.ashx?sid=%d")
pcall(function() game:GetService("InsertService"):SetFreeModelUrl("http://mete0r.xyz/Game/Tools/InsertAsset.ashx?type=fm&q=%s&pg=%d&rs=%d") end)
pcall(function() game:GetService("InsertService"):SetFreeDecalUrl("http://mete0r.xyz/Game/Tools/InsertAsset.ashx?type=fd&q=%s&pg=%d&rs=%d") end)
    RS:Run()
    LP:LoadCharacter()
    pcall(
        function()
            game:GetService("ContentProvider"):SetBaseUrl("http://mete0r.xyz" .. "/")
        end
    )



    `
    const sign = crypto.createSign('SHA1');
    sign.update("\r\n" + string)
    var signature = sign.sign(key, "base64")

    res.send("--rbxsig%"+signature+"%\r\n" +string)
  })


  router.get(["/GetCurrentUser","/GetCurrentUser.ashx"],async (req, res) => {

    res.send("1") // 1 means logged in and null means logged out
  }) // don't send 404 error but i don't think we will have studio publishing

  router.post("/validate-machine",async (req, res) => {

    res.json({"success":true,"message":""})
  }) 

router.get(["/join","/join.ashx"],requireAuth,async (req, res) => {
    if (!req.userdocument.discordid){
        return res.json({status:"error",error:"Link your discord account stinky"})
    }
    if (req.query.ver === "2018"){
        if (!req.userdocument.gamejoin2018 || req.userdocument.gamejoin2018 === "{}"){
            return res.json({status:"error",error:"no placelauncher"})
        }
        var joinJson = JSON.parse(req.userdocument.gamejoin2018)
        req.userdocument.gamejoin2018 = undefined
                req.userdocument.markModified('gamejoin2018')
               await req.userdocument.save()
        //sign with our sign module
        var signature = signatures.signer(joinJson)
        //console.log(signature)

    return res.send("--rbxsig%"+signature+"%\r\n"+JSON.stringify(joinJson))
    }
    if (req.query.ver === "2020"){
        if (!req.userdocument.gamejoin2020 || req.userdocument.gamejoin2020 === "{}"){
            return res.json({status:"error",error:"no placelauncher"})
        }
        var joinJson = JSON.parse(req.userdocument.gamejoin2020)
        req.userdocument.gamejoin2020 = undefined
                req.userdocument.markModified('gamejoin2020')
               await req.userdocument.save()
        //sign with our sign module
        const sign = crypto.createSign('SHA1');
        sign.update("\r\n" + JSON.stringify(joinJson))
            var signature = sign.sign(key2020, "base64")
            
        //console.log(signature)

    return res.send("--rbxsig2%"+signature+"%\r\n"+JSON.stringify(joinJson))
    }
    if (!req.userdocument.gamejoin || req.userdocument.gamejoin === "{}"){
        return res.json({status:"error",error:"no placelauncher"})
    }
        var joinJson = JSON.parse(req.userdocument.gamejoin)
        req.userdocument.gamejoin = undefined
                req.userdocument.markModified('gamejoin')
               await req.userdocument.save()
        //sign with our sign module
        var signature = signatures.signer(joinJson)
        //console.log(signature)

    res.send("--rbxsig%"+signature+"%\r\n"+JSON.stringify(joinJson))
})  

router.all(["/placelauncher","/placelauncher.ashx"],requireAuth,_2020placelauncher,_2018placelauncher,async (req, res, next) => {
    var enabled = req.config
    if (enabled.GamesEnabled === false){
        return res.json({status:"error",error:"Games are disabled bad boy"})
    }
    var joinJson = {"ClientPort":0,"MachineAddress":"localhost","ServerPort":25564,"PingUrl":"","PingInterval":120,"UserName":"default","SeleniumTestMode":false,"UserId":0,"SuperSafeChat":false,"CharacterAppearance":"http://shitncumblox.gq/game/charapp?name=default","ClientTicket":"","GameId":1,"PlaceId":1818,"MeasurementUrl":"","WaitingForCharacterGuid":"cad99b30-7983-434b-b24c-eac12595e5fd","BaseUrl":"http://www.mete0r.xyz/","ChatStyle":"ClassicAndBubble","VendorId":0,"ScreenShotInfo":"","VideoInfo":"<?xml version=\"1.0\"?><entry xmlns=\"http://www.w3.org/2005/Atom\" xmlns:media=\"http://search.yahoo.com/mrss/\" xmlns:yt=\"http://gdata.youtube.com/schemas/2007\"><media:group><media:title type=\"plain\"><![CDATA[ROBLOX Place]]></media:title><media:description type=\"plain\"><![CDATA[ For more games visit http://www.roblox.com]]></media:description><media:category scheme=\"http://gdata.youtube.com/schemas/2007/categories.cat\">Games</media:category><media:keywords>ROBLOX, video, free game, online virtual world</media:keywords></media:group></entry>","CreatorId":0,"CreatorTypeEnum":"User","MembershipType":"None","AccountAge":365,"CookieStoreFirstTimePlayKey":"rbx_evt_ftp","CookieStoreFiveMinutePlayKey":"rbx_evt_fmp","CookieStoreEnabled":true,"IsRobloxPlace":false,"GenerateTeleportJoin":false,"IsUnknownOrUnder13":false,"SessionId":"c25fd620-bbaa-4fb2-b022-3f053cdd1abd|00000000-0000-0000-0000-000000000000|0|204.236.226.210|8|2016-08-17T01:05:05.7115837Z|0|null|null|null|null","DataCenterId":0,"UniverseId":0,"BrowserTrackerId":0,"UsePortraitMode":false,"FollowUserId":0,"CharacterAppearanceId":1}
        if (!req.query.name && !req.query.placeId){
            return res.json({status:"error",error:"no placeid bad"})
        }
        if (req.userdocument.gamejoin){
            return res.json({"jobId":"Test","status":2,"joinScriptUrl":"http://mete0r.xyz/game/join.ashx?auth="+req.query.auth??req.cookies.jwt,"authenticationUrl":"http://mete0r.xyz/Login/Negotiate.ashx","authenticationTicket":"SomeTicketThatDosentCrash","message":""})
        }
        var sanitizedplaceid = sanitize(req.query.name??req.query.placeId)
        const game = await games.findOne({idofgame: sanitizedplaceid}).lean()
        if (!game){
            return res.json({status:"error",error:"that game doesn't exist!"})
        }
        if (game.version != "2016"){
            return res.json({status: "error",error:"game version is different than client requested"})
        }
        const instance = await rcc.findOne({PlaceId: sanitizedplaceid}).lean()
        if (instance && instance.Status === 2){
            // if an rcc instance already exists we don't need to create a new one so we will just drag them into the existing game
            joinJson.UserName = req.userdocument.username
            joinJson.UserId = req.userdocument.userid
            joinJson.CharacterAppearance = "http://mete0r.xyz/game/charapp?name=" + req.userdocument.userid
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
            sign1.update(`${req.userdocument.userid}\n`/*userid*/+`${req.userdocument.username}\n`/*username*/+`http://mete0r.xyz/game/charapp?name=${req.userdocument.userid}\n`/*charapp*/+`game${sanitizedplaceid}\n`/*jobid*/+ timestamp/*timestamp*/)
            var signature1 = sign1.sign(key, "base64")
            joinJson.ClientTicket += signature1 + ";"
    
            //create signature 2
            const sign2 = crypto.createSign('SHA1');
            sign2.update(`${req.userdocument.userid}\n`/*userid*/+`game${sanitizedplaceid}\n`/*jobid*/+ timestamp/*timestamp*/)
            var signature2 = sign2.sign(key, "base64")
            joinJson.ClientTicket += signature2
            
            req.userdocument.gamejoin = JSON.stringify(joinJson)
            req.userdocument.markModified('gamejoin')
            await req.userdocument.save()
            var joinScriptJson = {"jobId":"Test","status":2,"joinScriptUrl":"http://mete0r.xyz/game/join.ashx?auth="+joinJson.SessionId,"authenticationUrl":"http://mete0r.xyz/Login/Negotiate.ashx","authenticationTicket":"SomeTicketThatDosentCrash","message":""}


            return res.send(JSON.stringify(joinScriptJson))
        }
        if (instance && instance.Status === 1){
            var joinScriptJson = {"jobId":"Test","status":1,"joinScriptUrl":"http://mete0r.xyz/game/join.ashx?auth="+joinJson.SessionId,"authenticationUrl":"http://mete0r.xyz/Login/Negotiate.ashx","authenticationTicket":"SomeTicketThatDosentCrash","message":""}
            return res.send(JSON.stringify(joinScriptJson))
        }


        var port = await getPort({random: true})
        var newgamescript = "local placeId = "+sanitizedplaceid+"\n"+ gamescript
        newgamescript = "local port = "+port+"\n"+ newgamescript
        // launch job
        var response = await rcctalk.OpenJob("game"+sanitizedplaceid,newgamescript,"99999")
               await rcc.create({
                PlaceId: sanitizedplaceid,
                Port: port,
                Status: 1 // 1 means loading
            })

        //console.log(newrenderscript)

        var joinScriptJson = {"jobId":"Test","status":1,"joinScriptUrl":"http://mete0r.xyz/game/join.ashx?auth="+joinJson.SessionId,"authenticationUrl":"http://mete0r.xyz/Login/Negotiate.ashx","authenticationTicket":"SomeTicketThatDosentCrash","message":""}
        res.send(JSON.stringify(joinScriptJson))

}
)

//charapp and colors stealing from roblox


router.get("/charapp", async (req, res) => {
    if (Object.keys(req.query).length === 0) {
        res.status(404).send('No variables :(');
    } else{
        const user = await User.findOne({userid: req.query.name}).lean()
        const placeid = req.headers?.['roblox-place-id']??0
        const placedoc = await games.findOne({idofgame: placeid})
        if (!placedoc){
            return res.json({status:"error",error:"Place not found."})
        }

        if (!user) {
            return res.json({status: 'error', error: 'User not found!'})
        }

        if (!user.inventory){
            if (req.query.rcc){
                return res.json([])
            }
            return res.send('http://mete0r.xyz/game/colors?name='+req.query.name+';')
        }

        if (req.query.rcc){
            var empty = []
            for (var key of user.inventory) {
                if (key.Equipped === true){
                    empty.push({"item": {itemid: key.ItemId, type: key.Type}})
                }
            }
            return res.json(empty)
        }


        var charapp = 'http://mete0r.xyz/asset?name='+req.query.name+';'
        // add to charapp string by adding json to it
        for (var key of user.inventory) {
            if (key.Equipped === true){
                if (placedoc.gearallowed??false === true){
                    charapp += "http://mete0r.xyz/asset?id=" +  key.ItemId + ";"
                }else{
                    if (key.Type != "Gears"){
                        charapp += "http://mete0r.xyz/asset?id=" +  key.ItemId + ";"
                    }
                }
            }
        }

        res.write(charapp)
        res.end()
    }
})

router.get("/colors", async (req, res) => {
    if (Object.keys(req.query).length === 0) {
        res.status(404).send('No variables :(');
    } else{
        const user = await User.findOne({userid: req.query.name}).lean()
        if (!user) {
            return res.json({status: 'error', error: 'User not found!'})
        }

        if (req.query.rcc){
               var empty = []
            for (var key of user.colors) {
                    empty.push(key.value)
            }
            return res.json(empty)
        }


        res.type('application/xml');
    var colorsxml = `<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">
    <External>null</External>
    <External>nil</External>
    <Item class="BodyColors">
    <Properties>
    <int name="HeadColor">`+user.colors.find(x => x.name === 'Head').value+`</int>
    <int name="LeftArmColor">`+user.colors.find(x => x.name === 'Left Arm').value+`</int>
    <int name="LeftLegColor">`+user.colors.find(x => x.name === 'Left Leg').value+`</int>
    <string name="Name">Body Colors</string>
    <int name="RightArmColor">`+user.colors.find(x => x.name === 'Right Arm').value+`</int>
    <int name="RightLegColor">`+user.colors.find(x => x.name === 'Right Leg').value+`</int>
    <int name="TorsoColor">`+user.colors.find(x => x.name === 'Torso').value+`</int>
    <bool name="archivable">true</bool>
    </Properties>
    </Item>
    </roblox>`

        res.send(colorsxml)

    }
})

router.get("/", (req, res) => {
    res.status(404).send('hmmm? kinda sus');
})

router.get("/players/:id", (req, res) => {
    res.json({"ChatFilter":"whitelist"})
})

router.post("/load-place-info", (req, res) => {
    res.json({"CreatorId": 0, "CreatorType": "User", "PlaceVersion": 1})
})

router.post("/badge/awardbadge",async (req, res) => {
    const userid = req.query.UserID
    const badgeid = req.query.BadgeID
    const placeid = req.query.PlaceID

    const badge = await catalog.findOne({ItemId: badgeid}).lean()
    const user = await User.findOne({userid: userid}).lean()

    if(!badge){
        //Badge doesn't exist!
        return res.send("0")
    }

    if(!user){
        return res.send("0")
    }

    const badgecreator = await User.findOne({userid: badge.Creator}).lean()

    if (typeof user.badges !== "undefined"){
        // check if user already owns item
        for (var v of user.badges){
            if (v.badgeid === badgeid){
                // they already own it
                return res.send("0")
            }
        }
    }

    User.updateOne({userid: req.query.UserID}, {
        $push: {
            badges: {badgeid: badgeid, badgename: badge.Name, creator: badge.Creator, placeid: placeid}
        }
    }, 
    function(err, doc) {
        if (err){
            return res.send("0")
        }
    })

    return res.send(user.username+" won "+badgecreator.username+"'s "+badge.Name+" award!")
})


router.get(["/LuaWebService/HandleSocialRequest","/LuaWebService/HandleSocialRequest.ashx"],async (req, res) => {
    res.type('application/xml');
    if (req.query.method === "IsInGroup"){
        if (req.query.groupid === '0' || req.query.groupid === '1200769'){ // 1200769 admin group
            const user = await User.findOne({userid: req.query.playerid}).lean()
            if (user){
                return res.send(`<Value Type="boolean">${user.admin}</Value>`)
            }
        }
        return res.send('<Value Type="boolean">false</Value>')
    }
    if (req.query.method === "GetGroupRank"){
        if (req.query.groupid === '0'|| req.query.groupid === '1200769'){
            const user = await User.findOne({userid: req.query.playerid}).lean()
            if (user){
                if (user.admin === true){
                    return res.send(`<Value Type="integer">255</Value>`)
                }
            }
        }
        return res.send('<Value Type="integer">0</Value>')
    }
    if (req.query.method === "IsBestFriendsWith"){
        return res.send('<Value Type="boolean">false</Value>')
    }
    if (req.query.method === "IsFriendsWith"){
        return res.send('<Value Type="boolean">false</Value>')
    }
    res.type('html');
    return res.status(404).end()
})

router.get("/Tools/InsertAsset.ashx",async (req, res) => {
    const lol = await fetch('http://sets.pizzaboxer.xyz/Game'+req.url);
    if (lol.status === 400){
        return res.send(``)
    }
    return res.send(await lol.text())
})

router.post("/MachineConfiguration.ashx", (req,res) => {
    res.json({"success": true})
})

module.exports = router