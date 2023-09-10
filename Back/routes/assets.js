const { response } = require("express")
const express = require("express")
const router = express.Router()
const fs = require('fs')
var path = require('path');
const crypto = require('crypto');
require('dotenv').config()
const RCC_HOST = process.env.RCC_HOST
const User = require('../model/user.js')
const catalog = require("../model/item")
const games = require('./../model/games.js')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

//redirect hmmmm
var rgx = /^[0-9]*\.?[0-9]*$/;
router.get("/",async (req, res) => {
if (req.query.name){
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

      return res.send(colorsxml)
}
  if (req.query.method || /*req.headers?.["requester"] === "Server" &&*/ req.headers?.["assettype"] === "Place"){
    var ip = req.headers['cf-connecting-ip'] || req.socket.remoteAddress
    console.log(ip)
    var sanitizedid = req.query.id.match(rgx)
    if (ip === RCC_HOST || ip ===  "::ffff:"+RCC_HOST){
      fs.access("./assets/ugc/gamefile-"+sanitizedid+".rbxl", fs.F_OK, (err) => {
        if (err) {
          
            res.status(404).send("not found")
          return
        }
  
  
        //file exists
        res.sendFile(path.resolve("./assets/ugc/gamefile-"+sanitizedid+".rbxl"))
        return
      })
    }
  }else{
    if (!req.query.id){
      req.query.id = req.query.assetversionid
    }
    if (isNaN(parseFloat(req.query.id)) === true){
       res.writeHead(302, {'Location': 'https://assetdelivery.roblox.com/v1/asset?id=' + req.query.id});
       return res.end();
  }
    var sanitizedid = parseFloat(req.query.id)
    const response = await catalog.findOne({ItemId: sanitizedid}).lean()
    var ip = req.headers['cf-connecting-ip'] || req.socket.remoteAddress
    if (response?.approved === false && (ip != RCC_HOST || ip ===  "::ffff:"+RCC_HOST) && !req.query.nonapproved){
      return res.status(401).end()
    }
    //this will only allow numbers in our system so that we don't allow nodejs to expose our whole server filesystem
     fs.access("./assets/ugc/itemfile-"+sanitizedid+".rbxm", fs.F_OK,async (err) => {
      //console.log("./assets/ugc/itemfile-"+sanitizedid+".rbxm")
         if (err) {
          if (req.headers?.['user-agent']?.includes("Android") === true || req.headers?.['user-agent']?.includes("iPhone") === true){
              const response = await fetch('https://assetdelivery.roblox.com/v1/assetId/' + req.query.id,{headers: {'User-Agent': 'Roblox/WinInet'}});
              const data = await response.json();
              if (data){
                if (data.location){
                  res.writeHead(302, {'Location': data.location});
                  res.end();
                  return
                }
              }
            }
            if (req.query.id === "507766666"){ // 2018 r15 animation use legacy
              res.writeHead(302, {'Location': 'https://assetdelivery.roblox.com/v1/asset?id=' + req.query.id + '&version=3'});
              return res.end()
            }
            if (req.query.id === "507766388"){
              res.writeHead(302, {'Location': 'https://assetdelivery.roblox.com/v1/asset?id=' + req.query.id + '&version=2'});
              return res.end()
            }
            if (req.query.id === "62633901"){
              return res.sendFile(path.resolve('./assets/ugc/common/itemfile-'+sanitizedid+".rbxm"))
            }
              res.writeHead(302, {'Location': 'https://assetdelivery.roblox.com/v1/asset?id=' + req.query.id});
              res.end();
              return
         }

          res.sendFile(path.resolve('./assets/ugc/itemfile-'+sanitizedid+".rbxm"))
          return




       })
  }

      
})




module.exports = router