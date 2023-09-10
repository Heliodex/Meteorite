const express = require("express")
const router = express.Router()
const rcctalk = require('./../../thumbnailrcctalk')
const rcctalk2018 = require('./../../rcctalk2018')
const fs = require('fs')
const assetrenderscript = fs.readFileSync('assetthumbnailrenderer.lua','utf-8')
var path = require("path");
const User = require('./../../model/user.js')
const item = require('./../../model/item.js')
var rgx = /^[0-9]*\.?[0-9]*$/;
router.use(express.json({limit: '200mb'}));
const { requireAuth } = require('./../../middleware/authmiddleware.js')
const { grabAuth } = require('./../../middleware/grabauth.js')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config()
const RCC_HOST = process.env.RCC_HOST
const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
	windowMs: 2 * 1000, // 5 seconds
	max: 1, // Limit each IP to 1 requests per `window`
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (request, response, next, options) =>{
      return response.sendFile(path.resolve("./assets/default.png"))
    }
})

router.get("/",grabAuth,async (req, res) => {
   if (!req.query.id && !req.query.userId) {
    return res.status(400)
   }
   let headshot = false
   if (req.query.type === "headshot"){
    headshot = true
   }
   let id = req.query.id??req.query.userId

   var sanitizedid = id.match(rgx)

   const user = await User.findOne({userid: sanitizedid}).lean()
    if (!user) {
        return res.json({status: 'error', error: 'User does not exist'})
    }


// lets get our file path with sanitized id
   let path2=path.resolve(__dirname, "../../assets/userthumbnails/"+sanitizedid+".png")
   if (headshot === true){
    path2=path.resolve(__dirname, "../../assets/userthumbnailsheadshots/"+sanitizedid+".png")
   }

   fs.access(path2, fs.F_OK,async (err) => {
    if (err) {
        

    let newrender = await rcctalk2018.OpenRender(sanitizedid,headshot)
    if (newrender.error){
      return res.sendFile(path.resolve("./assets/default.png"))
    }
    newrender = newrender['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:OpenJobResponse']['ns1:OpenJobResult'][0]['ns1:value']._text

    res.writeHead(200, {'Content-Type': 'image/png'})

    fs.writeFile(path2,newrender,'base64',function(err){
      if (err) {
       console.log("error")
      }

     })
     return res.end(Buffer.from(newrender, 'base64'))

    // if this timeouts and rcc doesn't return the image feor some reason then send the default fallback
    //return res.sendFile(path.resolve("./assets/default.png"))
    }
  
    //file exists
    if (req.query.method && req.userdocument && req.userdocument.userid == sanitizedid){ // don't allow unauthenticated users to regenerate avatars and don't allow authenticated users to regenerate other peoples avatars
      if (req.query.method === "regenerate"){
        fs.unlink(path2,async function (err) {
          if (err){
            console.log(err)
          }
          

          let newrender = await rcctalk2018.OpenRender(sanitizedid,headshot)
          if (newrender.error){
            return res.sendFile(path.resolve("./assets/default.png"))
          }
          newrender = newrender['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:OpenJobResponse']['ns1:OpenJobResult'][0]['ns1:value']._text
      
          res.writeHead(200, {'Content-Type': 'image/png'})
      
          fs.writeFile(path2,newrender,'base64',function(err){
            if (err) {
             console.log("error")
            }
      
           })
           return res.end(Buffer.from(newrender, 'base64'))



      });
      }
    }else{
        res.sendFile(path.resolve(path2))
        return
      }


  })

})

router.post("/rcc", (req, res) => {
  var ip = req.headers['cf-connecting-ip'] || req.socket.remoteAddress 
  if (ip == RCC_HOST || ip == "::ffff:"+RCC_HOST) {
    const {player, thumbnail} = req.body
    let path2=path.resolve(__dirname, "../../assets/userthumbnails/"+player+".png")
    fs.writeFile(path2,thumbnail,'base64',function(err){
      if (err) {
       console.log("error")
       // if writing fails we can still fallback
       return res.sendFile(path.resolve("./../../assets/default.png"))
      }
      // if it succeeds then we can send the userthumbnail
      // close the job after
      rcctalk.CloseJob("Thumbnailfor"+player)
     })
  }
})




router.get(["/asset","/asset.ashx"],grabAuth,async (req, res) => {
  if (!req.query.id && !req.query.assetid) {
   return res.status(400)
  }
  let id = req.query.id??req.query.assetid

  var sanitizedid = id.match(rgx)

  const user = await item.findOne({ItemId: sanitizedid}).lean()
   if (!user) {
       return res.json({status: 'error', error: 'Item does not exist'})
   }
   if (user.Type === "Audio"){
    return res.sendFile(path.resolve("./assets/images/audio.png"))
   }
   if (user.Hidden === true){
    // if item isn't supposed to have a thumbnail
    return res.sendFile(path.resolve("./assets/moderated.png"))
   }
   if (user.approved === false && !req.query.nonapproved){
    return res.sendFile(path.resolve("./assets/approval.png"))
   }
   if (req.query.nonapproved && req?.userdocument?.admin === false){ // we only want admins to be able to see non approved assets anyways
    return res.sendFile(path.resolve("./assets/approval.png"))
   }
   if (req.query.nonapproved && (user.Type === "Pants" || user.Type === "Shirts")){
    sanitizedid -= 1 
    return res.sendFile(path.resolve(__dirname, "../../assets/ugc/itemfile-"+sanitizedid+".rbxm"))
   }
   if (req.query.nonapproved && user.Type === "Video"){
    return res.sendFile(path.resolve(__dirname, "../../assets/ugc/itemfile-"+sanitizedid+".rbxm"))
   }
   if (user.Type === "Video"){
    return res.sendFile(path.resolve("./assets/video.png"))
   }
   if (user.Type === "User Ad" || user.Type === "Gamepass"){
    try{
      await fs.promises.access(path.resolve(__dirname, "../../assets/ugc/itemfile-"+sanitizedid+".rbxm"), fs.constants.W_OK)
      return res.sendFile(path.resolve(__dirname, "../../assets/ugc/itemfile-"+sanitizedid+".rbxm"))
    }catch{
      return res.sendFile(path.resolve("./assets/images/defaultadsky.png"))
    }

   }


// lets get our file path with sanitized id
  let path2=path.resolve(__dirname, "../../assets/ugc/asset-"+sanitizedid+".png")

  fs.access(path2, fs.F_OK,async (err) => {
   if (err) {
       

       // get our renderscript with the new character app
     var newrenderscript = assetrenderscript.replace('local asset = 0','local asset = "'+sanitizedid+'"')
     //open a new job for our thumbnail render request
     var response = await rcctalk.OpenJob("Thumbnailfor"+sanitizedid,newrenderscript,"120")
         if (response['SOAP-ENV:Envelope']['SOAP-ENV:Body']['SOAP-ENV:Fault']){
           // if failed then print out error close job then send a fallback image
       //console.dir(response,{ depth: null })
       rcctalk.CloseJob("Thumbnailfor"+sanitizedid)
       return res.sendFile(path.resolve("./assets/default.png"))
   }else{
     // send image to user
    // wait for image to be uploaded by rcc
     function check() {
       setTimeout(() => {
         fs.access(path2, fs.constants.F_OK, error => {
           if (error) {
             check()
           } else {
             return res.sendFile(path2)
           }
         });
       },3000)
     }
   }
   check()

   // if this timeouts and rcc doesn't return the image feor some reason then send the default fallback
   return res.sendFile(path.resolve("./assets/default.png"))
   }
 
       res.sendFile(path.resolve(path2))
       return
     


 })

})



router.post("/rccasset", (req, res) => {
  var ip = req.headers['cf-connecting-ip'] || req.socket.remoteAddress 
  if (ip == RCC_HOST || ip == "::ffff:"+RCC_HOST) {
    const {asset, thumbnail} = req.body
    console.log(asset)
    let path2=path.resolve(__dirname, "../../assets/ugc/asset-"+asset+".png")
    fs.writeFile(path2,thumbnail,'base64',function(err){
      if (err) {
       console.log("error")
       // if writing fails we can still fallback
       return res.sendFile(path.resolve("./../../assets/default.png"))
      }
      // if it succeeds then we can send the userthumbnail
      // close the job after
      rcctalk.CloseJob("Thumbnailforasset"+asset)
     })
  }
})

module.exports = router