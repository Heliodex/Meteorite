const express = require("express")
const router = express.Router()
const { requireAuth } = require('./../middleware/authmiddleware')
const User = require('./../model/user.js')
const games = require('./../model/games.js')
const catalog = require('./../model/item.js')
const { requirediscord } = require('./../middleware/requirediscord.js')
var multer = require('multer');
const fs = require('fs');
const path = require('path')
var numbtest = /^\d+\.?\d*$/;
const bodyParser = require('body-parser')
const {pngValidator} = require('png-validator')
const fileTypeChecker = require("file-type-checker")

const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
	windowMs: 3 * 1000, // 3 seconds
	max: 1, // Limit each IP to 1 requests per `window`
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (request, response, next, options) =>{
        response.json({status: 'error', error: 'Too many requests try again later.'})
    }
})

async function validateImage(itemid,res){
    return new Promise(async (resolve) => {

        try {
            const myArrayBuffer = await fs.promises.readFile(path.resolve(`assets/ugc/itemfile-${itemid}.rbxm`), null)
            pngValidator(myArrayBuffer);
            // success
        } catch {
            // file is invalid or corrupt
            fs.unlink(path.resolve(`assets/ugc/itemfile-${itemid}.rbxm`), (err => {
                if (err) console.log(err)
              }));
    
            return res.json({status: 'error', error: 'Image is invalid.'})
        }

        resolve()

    })
}


const pages = [
    'shirts',
    'pants',
    'audios',
    'games',
    'badges',
    'meshes'
]

router.use(bodyParser.json())

router.post("/creations", requireAuth,async (req, res) => {
    const { type } = req.body
    let items = await catalog.find({Creator: req.userdocument.userid, Type: type}).lean().select(['Name',"Description",'ItemId'])
    if (type === "games"){
        items = await games.find({useridofowner: req.userdocument.userid}).lean().select(['nameofgame','idofgame','Description','avatartype','gearallowed'])
    }
    
    if (type === "audios"){
        items = await catalog.find({Creator: req.userdocument.userid, Type: "Audio"}).lean().select(['Name',"Description",'ItemId'])
    }else if (type === "badges"){
        items = await catalog.find({Creator: req.userdocument.userid, Type: "Badge"}).lean().select(['Name',"Description",'ItemId'])
    }else if (type === "meshes"){
        items = await catalog.find({Creator: req.userdocument.userid, Type: "Mesh"}).lean().select(['Name',"Description",'ItemId'])
    }else if (type === "userads"){
        items = await catalog.find({Creator: req.userdocument.userid, Type: "User Ad"}).lean().select(['Name',"Description",'ItemId'])
    }else if (type === "gamepasses"){
        items = await catalog.find({Creator: req.userdocument.userid, Type: "Gamepass"}).lean().select(['Name',"Description",'ItemId'])
    }else if (type === "videos"){
        items = await catalog.find({Creator: req.userdocument.userid, Type: "Video"}).lean().select(['Name',"Description",'ItemId'])
    }
    
    return res.json(items)


})

var storage = multer.diskStorage({
    destination: function (req, file, cb) {  
        // Uploads is the Upload_folder_name
        if(file.fieldname === "thumbnail"){ // is a game thumbnail
            cb(null, "./assets/gameassets")
        }else{
            cb(null, "./assets/ugc")
        }
        
    },
    filename: async function (req, file, cb) {
        //console.log(path.basename(file.originalname,'.png'))
        if (path.extname(file.originalname) === ".rbxl"){
            const placeid = await games.countDocuments();
            cb(null, "gamefile" + "-" + placeid +path.extname(file.originalname))
        }else if(file.fieldname === "thumbnail"){ // is a game thumbnail
            const placeid = await games.countDocuments();
            cb(null, "thumbnail" + "-" + placeid + ".png")
        }
        else if (file.mimetype == "image/png"){
            const itemid = await catalog.countDocuments();
            cb(null, "itemfile" + "-" + itemid + ".rbxm")
        }else if (path.extname(file.originalname) === ".mp3"){
            const itemid = await catalog.countDocuments();
            cb(null, "itemfile" + "-" + itemid + ".rbxm")
        }else if (path.extname(file.originalname) === ".mesh"){
            const itemid = await catalog.countDocuments();
            cb(null, "itemfile" + "-" + itemid + ".rbxm")
        }else if (path.extname(file.originalname) === ".webm"){
            const itemid = await catalog.countDocuments();
            cb(null, "itemfile" + "-" + itemid + ".rbxm")
        }
        

    }
  })
       const uploadcloth = multer({storage: storage,
        fileFilter: function (req, file, callback) {
            if(file.mimetype !== 'image/png' /*&& ext !== '.mp3' && ext !== '.rbxl'*/) {
                return callback('Invalid file type')
            }
            callback(null, true)
        },
        limits: { fileSize: 1024 * 1024 } // 1mb
    })

router.post("/uploadclothing", requireAuth,requirediscord,async (req, res) => {
    uploadcloth.single("clothingfile")(req, res, async function (err) {
    if (err) {
        if (err?.message === "File too large"){
            return res.status(400).send({status: 'error', error: "File too large! 1MB Limit"})
        }
        if (err === "Invalid file type"){
            return res.status(400).send({status: 'error', error: "Invalid file type"})
        }
        return res.status(400).send({status: 'error', error: err.message})
    }
    var xss = require("xss")
    const {clothingname, description,price,type} = req.body
    // save shirt template
    if (!clothingname){
        return res.json({status: 'error', error: 'Clothing name needs to be sent.'})
    }
    if (!description){
        return res.json({status: 'error', error: 'Description needs to be sent.'})
    }
    if (!price){
        return res.json({status: 'error', error: 'Price needs to be sent.'})
    }
    if (type != "Shirts" && type != "Pants"){
        return res.json({status: 'error', error: 'Type needs to be a shirt or pant value'})
    }

    if (numbtest.test(price) == false){
        return res.json({status: 'error', error: 'Price can only be a number!'})
       }

       if (price < 5){
        return res.json({status: 'error', error: 'Minimum price is 5 rocks.'})
        }
        if (req.userdocument.coins < 5) { // less than
            return res.json({status: 'error', error: 'You don\'t have 5 rocks >:(!'})
        }else if (req.userdocument.admin === false){
            req.userdocument.coins -= 5
            req.userdocument.markModified('coins')
           await req.userdocument.save()
        }
        
       const itemid = await catalog.countDocuments();
       // check if the file they just uploaded is valid
       await validateImage(itemid,res)
    let approved = req.userdocument.admin === false ? false : true

    try{
        await catalog.create({
            Name: xss(clothingname),
            Description: xss(description),
            Price: Math.ceil(price),
            Type: "Image",
            Hidden: true,
            ItemId: itemid,
            approved
            })


    }catch{

    }

// save actual item
    let xml = `<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">
    <External>null</External>
    <External>nil</External>
    <Item class="Shirt" referent="RBX0">
      <Properties>
        <Content name="ShirtTemplate">
          <url>http://mete0r.xyz/asset/?id=`+itemid+`</url>
        </Content>
        <string name="Name">Shirt</string>
        <bool name="archivable">true</bool>
      </Properties>
    </Item>
  </roblox>`
if (type === "Pants"){
xml = `<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">
  <External>null</External>
  <External>nil</External>
  <Item class="Pants" referent="RBX0">
    <Properties>
      <Content name="PantsTemplate">
        <url>http://mete0r.xyz/asset/?id=`+itemid+`</url>
      </Content>
      <string name="Name">Pants</string>
      <bool name="archivable">true</bool>
    </Properties>
  </Item>
</roblox>`
}
  let shirtid = itemid + 1 // prevent any race conditions
  shirtid = shirtid.toString()
  fs.writeFile("./assets/ugc/itemfile-"+shirtid+".rbxm", xml,async function(err) {
    if(err) {
        return console.log(err);
    }
    let approved = req.userdocument.admin === false ? false : true
    try{
        await catalog.create({
            Name: xss(clothingname),
            Description: xss(description),
            Price: Math.ceil(price),
            Creator: req.userdocument.userid,
            Type: type,
            ItemId: shirtid,
            approved
            })


    }catch{

    }
}); 
// give player shirt
User.updateOne({userid: req.userdocument.userid}, {
    $push: {
        inventory: {Type: type,ItemId: shirtid, ItemName: xss(clothingname), Equipped: false}
    }
}, 
function(err, doc) {
  //console.log(err)
})
return res.json({status: 'success', message: 'Done!'})



})
})

// upload game WOW
const uploadgame = multer({storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.rbxl'/* && ext !== '.mp3'*/) {
            return callback('Invalid file type')
        }
        callback(null, true)
    },
    limits: { fileSize: 5120 * 1024 * 2 } // 10mb
})

const uploadaudio = multer({storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.mp3' && ext !== '.ogg') {
            return callback('Invalid file type')
        }
        callback(null, true)
    },
    limits: { fileSize: 5120 * 1024 } // 5mb
})

var editgamestorage = multer.diskStorage({
    destination: function (req, file, cb) {  
        // Uploads is the Upload_folder_name
        if(file.fieldname === "thumbnail"){ // is a game thumbnail
            cb(null, "./assets/gameassets")
        }else{
            cb(null, "./assets/ugc")
        }
        
    },
    filename: async function (req, file, cb) {
        //console.log(path.basename(file.originalname,'.png'))
        if (path.extname(file.originalname) === ".rbxl"){

            const item = await games.findOne({idofgame: req.body.gameid}).lean()
            if (!item){
        
                return cb("Item doesn't exist!")
            }    
        
            //console.log(item)
        
            if (item.useridofowner != req.userdocument.userid){
                // player doesn't own this item
                return cb("You don't own this")
            }
            cb(null, "gamefile" + "-" + req.body.gameid +path.extname(file.originalname))
        }

    }
  })

const editgame = multer({storage: editgamestorage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);

        if(ext !== '.rbxl'/* && ext !== '.mp3'*/) {
            return callback('Invalid file type')
        }
        callback(null, true)
    },
    limits: { fileSize: 5120 * 1024 * 2 } // 10mb
})

router.post("/editgame", requireAuth,requirediscord,async (req, res) => {
    const {nameofgame, description, gameid} = req.body
    var xss = require("xss")
    if (!gameid){
        return res.json({status: 'error', error: 'GameID required'}) 
    }

    const item = await games.findOne({idofgame: gameid})
            if (!item){
        
                return res.json({status: 'error', error: "Game doesn't exist."})
            }    
        
            //console.log(item)
        
            if (item.useridofowner != req.userdocument.userid){
                // player doesn't own this item
                return res.json({status: 'error', error: "You don't have permissions for this!"})
            }

            if (nameofgame && nameofgame != ""){
                item.nameofgame = xss(nameofgame)
                item.markModified('nameofgame')
                await item.save()
            }

            if (description && description != ""){
                item.descrption = xss(description)
                item.markModified('descrption')
                await item.save()
            }

        return res.json({status: 'success',message:'Done!'}) 


    })

    router.post("/editavatartype", requireAuth,requirediscord,async (req, res) => {
        const {avatartype, gameid} = req.body
        if (!gameid){
            return res.json({status: 'error', error: 'GameID required'}) 
        }
        if (!avatartype){
            return res.json({status: 'error', error: 'Avatar type required'}) 
        }
        
        if (avatartype != "R6" && avatartype != "R15" && avatartype != "PC"){
            return res.json({status: 'error', error: 'Avatar type required'}) 
        }
        const item = await games.findOne({idofgame: gameid})
        if (!item){
    
            return res.json({status: 'error', error: "Game doesn't exist."})
        }    
    
        //console.log(item)
    
        if (item.useridofowner != req.userdocument.userid){
            // player doesn't own this item
            return res.json({status: 'error', error: "You don't have permissions for this!"})
        }

        item.avatartype = avatartype
        item.markModified('avatartype')
        await item.save()


    
            return res.json({status: 'success',message:'Done!'}) 
    
    
        })
        
    router.post("/editgearstatus", requireAuth,requirediscord,async (req, res) => {
        const {newgearstatus, gameid} = req.body
        if (!gameid){
            return res.json({status: 'error', error: 'GameID required'}) 
        }
        
        if (newgearstatus != true && newgearstatus != false){
            return res.json({status: 'error', error: 'Gear status required'}) 
        }
        const item = await games.findOne({idofgame: gameid})
        if (!item){
    
            return res.json({status: 'error', error: "Game doesn't exist."})
        }    
    
        //console.log(item)
    
        if (item.useridofowner != req.userdocument.userid){
            // player doesn't own this item
            return res.json({status: 'error', error: "You don't have permissions for this!"})
        }

        item.gearallowed = newgearstatus
        item.markModified('gearallowed')
        await item.save()


    
            return res.json({status: 'success',message:'Done!'}) 
    
    
        })

router.post("/editgameupload", requireAuth,requirediscord,async (req, res) => {
    editgame.single("gamefile")(req, res, async function (err) {
    if (err) {
        if (err?.message === "File too large"){
            return res.status(400).send({status: 'error', error: "File too large! 10MB Limit"})
        }
        if (err === "Invalid file type"){
            return res.status(400).send({status: 'error', error: "Invalid file type"})
        }
        return res.status(400).send({status: 'error', error: err.message})
    }

    return res.json({status: 'success',message:'Done!'}) 
})
})

router.post("/uploadgame", requireAuth,requirediscord,async (req, res) => {
    uploadgame.fields([
        {name: 'gamefile', maxCount: 1},
        {name: 'thumbnail', maxCount: 1}
    ])(req, res, async function (err) {
    if (err) {
        if (err?.message === "File too large"){
            return res.status(400).send({status: 'error', error: "File too large! 10MB Limit"})
        }
        if (err === "Invalid file type"){
            return res.status(400).send({status: 'error', error: "Invalid file type"})
        }
        return res.status(400).send({status: 'error', error: err.message})
    }
    var xss = require("xss")
    const {gamename, description, version} = req.body
    // save game
    if (!gamename){
        return res.json({status: 'error', error: 'Game name needs to be sent.'})
    }

    if (gamename?.length > 50) {
        return res.json({status: 'error', error: 'Game name can not be more than 50 characters'})
    }

    if (!description){
        return res.json({status: 'error', error: 'Description needs to be sent.'})
    }

    if (description?.length > 1000) {
        return res.json({status: 'error', error: 'Description can not be more than 1000 characters'})
    }

    if (!version){
        return res.json({status: 'error', error: 'Version needs to be sent.'})
    }
    const versions = [
        //"2014",
        "2016",
        "2018",
        "2020"
    ]

    if (versions.includes(version) === false){
        return res.json({status: 'error', error: 'Invalid version sent.'})
    }
    if (req.userdocument.coins < 5) { // less than
        return res.json({status: 'error', error: 'You don\'t have 5 rocks >:(!'})
    }else if (req.userdocument.admin === false){
        req.userdocument.coins -= 5
        req.userdocument.markModified('coins')
       await req.userdocument.save()
    }

       const placeid = await games.countDocuments();
    try{
        await games.create({
            useridofowner: req.userdocument.userid,
            idofgame: placeid,
            nameofgame: xss(gamename),
            numberofplayers: "0",
            descrption: xss(description),
            version: version
            })


    }catch{
        throw error
    }
    return res.json({status: 'success', message: 'Done!'})
})
})


const uploadasset = multer({storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.mesh') {
            return callback('Invalid file type')
        }
        callback(null, true)
    },
    limits: { fileSize: 5120 * 1024 } // 1mb
})

router.post("/uploadmeshes", requireAuth,requirediscord,limiter,async (req, res) => {
    uploadasset.single("assetfile")(req, res, async function (err) {
    if (err) {
        if (err?.message === "File too large"){
            return res.status(400).send({status: 'error', error: "File too large! 1MB Limit"})
        }
        if (err === "Invalid file type"){
            return res.status(400).send({status: 'error', error: "Invalid file type"})
        }
        return res.status(400).send({status: 'error', error: err.message})
    }
    var xss = require("xss")
    const {itemname} = req.body
    // save mesh
    if (!itemname){
        return res.json({status: 'error', error: 'Mesh name needs to be sent.'})
    }
    const itemid = await catalog.countDocuments();
    const myArrayBuffer = await fs.promises.readFile(path.resolve(`assets/ugc/itemfile-${itemid}.rbxm`), null)

    if (fileTypeChecker.detectFile(myArrayBuffer)){
        // not a mesh
        fs.unlink(path.resolve(`assets/ugc/itemfile-${itemid}.rbxm`), (err => {
            if (err) console.log(err)
          }))

        return res.json({status: 'error', error: 'Mesh is invalid.'})
    }

    try{
        await catalog.create({
            Name: xss(itemname),
            Price: "0",
            Type: "Mesh",
            Creator: req.userdocument.userid,
            Hidden: true,
            ItemId: itemid,
            approved: true
            })


    }catch(err){
        throw(err)
    }

    return res.json({status: 'success', message: "Done! Mesh ID : "+itemid})
})
})

router.post("/uploadbadges", requireAuth,requirediscord,limiter,async (req, res) => {
    uploadasset.single("assetfile")(req, res, async function (err) {
    if (err) {
        if (err?.message === "File too large"){
            return res.status(400).json({status: 'error', error: "File too large! 1MB Limit"})
        }
        if (err === "Invalid file type"){
            return res.status(400).json({status: 'error', error: "Invalid file type"})
        }
        return res.status(400).json({status: 'error', error: err.message})
    }
    var xss = require("xss")
    const {itemname} = req.body
    // save badge
    if (!itemname){
        return res.json({status: 'error', error: 'Badge name needs to be sent.'})
    }
    const itemid = await catalog.countDocuments();

    //check if the file thye just uploaded is valid
    await validateImage(itemid,res)
    try{
        let approved = req.userdocument.admin === false ? false : true
        await catalog.create({
            Name: xss(itemname),
            Price: "0",
            Type: "Badge",
            Creator: req.userdocument.userid,
            Hidden: true,
            ItemId: itemid,
            approved
            })


    }catch(err){
        throw(err)
    }

    return res.json({status: 'success', message: "Done! Badge ID : "+itemid})
})
})

router.post("/uploaduserads", requireAuth,requirediscord,limiter,async (req, res) => {
    uploadasset.single("assetfile")(req, res, async function (err) {
    if (err) {
        if (err?.message === "File too large"){
            return res.status(400).send({status: 'error', error: "File too large! 1MB Limit"})
        }
        if (err === "Invalid file type"){
            return res.status(400).send({status: 'error', error: "Invalid file type"})
        }
        return res.status(400).send({status: 'error', error: err.message})
    }
    var xss = require("xss")
    const {itemname} = req.body
    // save userad
    if (!itemname){
        return res.json({status: 'error', error: 'User Ad name needs to be sent.'})
    }
    const itemid = await catalog.countDocuments();

    // check if the file they just uploaded is valid
    await validateImage(itemid,res)

    try{
        let approved = req.userdocument.admin === false ? false : true
        await catalog.create({
            Name: xss(itemname),
            Price: "0",
            Type: "User Ad",
            Creator: req.userdocument.userid,
            ItemId: itemid,
            ActiveAd: false,
            approved
            })


    }catch(err){
        throw(err)
    }

    return res.json({status: 'success', message: "Done!"})
})
})

router.post("/uploadgamepasses", requireAuth,requirediscord,limiter,async (req, res) => {
    uploadasset.single("assetfile")(req, res, async function (err) {
    if (err) {
        if (err?.message === "File too large"){
            return res.status(400).send({status: 'error', error: "File too large! 1MB Limit"})
        }
        if (err === "Invalid file type"){
            return res.status(400).send({status: 'error', error: "Invalid file type"})
        }
        return res.status(400).send({status: 'error', error: err.message})
    }
    var xss = require("xss")
    const {itemname,price,gameid} = req.body
    // save game pass
    if (!itemname){
        return res.json({status: 'error', error: 'Gamepass name needs to be sent.'})
    }
    if (!price){
        return res.json({status: 'error', error: 'Price needs to be sent.'})
    }
    if (!gameid){
        return res.json({status: 'error', error: 'Gameid needs to be sent.'})
    }
    if (numbtest.test(price) == false){
        return res.json({status: 'error', error: 'Price can only be a number!'})
    }

    if (price < 1){
     return res.json({status: 'error', error: 'Minimum price is 1 rock.'})
    }
    const gamedoc = await games.findOne({idofgame: gameid})

    if (!gamedoc){
        return res.json({status: 'error', error: 'Game not found'})
    }

    if (gamedoc.useridofowner != req.userdocument.userid){
        return res.json({status: 'error', error: "You don't own this game!"})
    }

    const currentgamepasscount = await catalog.countDocuments({associatedgameid: gamedoc.idofgame})

    if (currentgamepasscount >= 20){
        return res.json({status: 'error', error: 'No more than 20 game passes per game.'})
    }
    
    const itemid = await catalog.countDocuments()

    // check if the file they just uploaded is valid
    await validateImage(itemid,res)

    try{
        let approved = req.userdocument.admin === false ? false : true
        await catalog.create({
            Name: xss(itemname),
            Description: "",
            Price: Math.ceil(price),
            Creator: req.userdocument.userid,
            Type: "Gamepass",
            ItemId: itemid,
            approved,
            associatedgameid: gamedoc.idofgame
            })


    }catch(err){
        throw(err)
    }

    return res.json({status: 'success', message: "Done!"})
})
})

router.post("/uploadaudios", requireAuth,requirediscord,limiter,async (req, res) => {
    uploadaudio.single("assetfile")(req, res, async function (err) {
    if (err) {
        if (err?.message === "File too large"){
            return res.status(400).send({status: 'error', error: "File too large! 5MB Limit"})
        }
        if (err === "Invalid file type"){
            return res.status(400).send({status: 'error', error: "Invalid file type"})
        }
        return res.status(400).send({status: 'error', error: err.message})
    }
    var xss = require("xss")
    const {itemname} = req.body
    // save audio
    if (!itemname){
        return res.json({status: 'error', error: 'Audio name needs to be sent.'})
    }
    const itemid = await catalog.countDocuments();
    
    const myArrayBuffer = await fs.promises.readFile(path.resolve(`assets/ugc/itemfile-${itemid}.rbxm`), null)

    if (fileTypeChecker.isMP3(myArrayBuffer) === false && fileTypeChecker.isOGG(myArrayBuffer) === false){
        fs.unlink(path.resolve(`assets/ugc/itemfile-${itemid}.rbxm`), (err => {
            if (err) console.log(err)
          }))

        return res.json({status: 'error', error: 'Audio is invalid.'})
    }

    try{
        let approved = req.userdocument.admin === false ? false : true
        await catalog.create({
            Name: xss(itemname),
            Price: "0",
            Type: "Audio",
            Creator: req.userdocument.userid,
            Hidden: true,
            ItemId: itemid,
            approved
            })


    }catch(err){
        throw(err)
    }

    return res.json({status: 'success', message: "Done! Audio ID : "+itemid})
})
})

const uploadvideo = multer({storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.webm') {
            return callback('Invalid file type')
        }
        callback(null, true)
    },
    limits: { fileSize: 10240 * 1024 } // 10mb
})

router.post("/uploadvideos", requireAuth,requirediscord,limiter,async (req, res) => {
    uploadvideo.single("assetfile")(req, res, async function (err) {
    if (err) {
        if (err?.message === "File too large"){
            return res.status(400).send({status: 'error', error: "File too large! 10MB Limit"})
        }
        if (err === "Invalid file type"){
            return res.status(400).send({status: 'error', error: "Invalid file type"})
        }
        return res.status(400).send({status: 'error', error: err.message})
    }
    var xss = require("xss")
    const {itemname} = req.body
    // save audio
    if (!itemname){
        return res.json({status: 'error', error: 'Video name needs to be sent.'})
    }
    const itemid = await catalog.countDocuments();
    
    const myArrayBuffer = await fs.promises.readFile(path.resolve(`assets/ugc/itemfile-${itemid}.rbxm`), null)

    if (fileTypeChecker.isWEBM(myArrayBuffer) === false){
        fs.unlink(path.resolve(`assets/ugc/itemfile-${itemid}.rbxm`), (err => {
            if (err) console.log(err)
          }))

        return res.json({status: 'error', error: 'Video is invalid.'})
    }

    try{
        let approved = req.userdocument.admin === false ? false : true
        await catalog.create({
            Name: xss(itemname),
            Price: "0",
            Type: "Video",
            Creator: req.userdocument.userid,
            ItemId: itemid,
            approved
            })


    }catch(err){
        throw(err)
    }

    return res.json({status: 'success', message: "Done! Video ID : "+itemid})
})
})

module.exports = router