const express = require("express")
const router = express.Router()
var path = require('path')
const { requireAuth } = require('./../middleware/authmiddleware')
var multer = require('multer');
const bodyParser = require('body-parser')
router.use(bodyParser.json())
const User = require('./../model/games.js')
const ActualUser = require('./../model/user.js')
const catalog = require('./../model/item.js')
const games = require('./../model/games.js')
const rcc = require('./../model/rcc.js')
var numbtest = /^\d+\.?\d*$/;
const rcctalk = require('./../rcctalk')
require('dotenv').config()
const RCCDIR = process.env.RCC_Content

var thisistheplaceid = "1"
var storage = multer.diskStorage({
    destination: function (req, file, cb) {  
        // Uploads is the Upload_folder_name
        if (file.mimetype == "image/png"){
                cb(null, "./assets/gameassets")
        }else{
            cb(null, "./assets/ugc")
        }
        
    },
    filename: async function (req, file, cb) {
        if (path.extname(file.originalname) === ".rbxl"){
            const placeid = await User.countDocuments();
            cb(null, file.fieldname + "-" + placeid +path.extname(file.originalname))
        }else if (file.mimetype == "image/png"){
            const placeid = await User.countDocuments();
                cb(null, file.fieldname + "-" + placeid +path.extname(file.originalname))
            
        }else if (file.mimetype == "application/octet-stream"){
            const itemid = await catalog.countDocuments();
            cb(null, file.fieldname + "-" + itemid +path.extname(file.originalname))
        }

    }
  })
       const upload = multer({storage: storage,
        fileFilter: function (req, file, callback) {
            var ext = path.extname(file.originalname);
            if(ext !== '.png' && ext !== '.png' && ext !== '.rbxl') {
                return callback('Only pngs and rbxl are allowed')
            }
            callback(null, true)
        },
    })


       const itemupload = multer({storage: storage,
        fileFilter: function (req, file, callback) {
            var ext = path.extname(file.originalname);
            if (req.userdocument.admin === "false"){
                return callback('LEAVE')
            }
            if(ext !== '.png' && ext !== '.png' && ext !== '.rbxm') {
                return callback('Only pngs and rbxm are allowed')
            }
            callback(null, true)
        },
    })

router.post("/uploaditem", requireAuth,itemupload.single("itemfile"),async (req, res) => {
    if (req.userdocument.admin == false && req.userdocument?.ugcpermission == false) {
        return res.redirect('/')
    }
    const xss = require('xss')
    //console.log(req.body)
    const {itemname, description, price,Type} = req.body
       if (numbtest.test(price) == false){
        return res.json({status: 'error', error: 'Price can only be a number!'})
       }

       try{
        const itemid = await catalog.countDocuments();
       const response =  await catalog.create({
        Name: xss(itemname),
        Description: xss(description),
        Price: price,
        Type: Type,
        Creator: req.userdocument.userid,
        ItemId: itemid,
        approved: true
        })
    }catch(error){
        throw error
    }
    return res.json({status: "success", message: "Action completed."})
})


router.post("/moderateuser", requireAuth,async (req, res) => {
    if (req.userdocument.admin == false) {
        return res.redirect('/')
    }
    let {userid, reason, unbantime,Type} = req.body

    if (numbtest.test(userid) == false){
        return res.json({status: "error", error: "Userid can only be a number!"})
       }

    const lookupuser = await ActualUser.findOne({userid: userid}).lean()

    if (!lookupuser) {
        return res.json({status: "error", error: "User not found"})
    }
    if (Type === "Permanent Ban"){
        unbantime = "2100-01-01"
    }
    if (Type === "Warning"){
        unbantime = "2000-01-01"
    }
    //console.log(req.body)
    //console.log(unbantime)

    // if all above checks have passed lets set their moderation status and also log this entry for later lookup
    var datetime = new Date();
        ActualUser.updateOne({userid: userid}, {
            $set: {
                moderation: JSON.stringify({"status":Type,"Reason":reason,"ExpiresIn":unbantime, "BannedBy": req.userdocument.username})
            },
            $push: {
                moderationhistory: {"status":Type,"Reason":reason, "BannedBy": req.userdocument.username, "Date": datetime.toISOString().slice(0,10)}
            }
        }, 
        function(err, doc) {
          //console.log(err)
        })
        
        return res.json({status: "success", message: "Action completed."})
})

router.post("/moderateuserlookup", requireAuth,async (req, res) => {
    if (req.userdocument.admin == false) {
        return res.redirect('/')
    }
    const {userid,username} = req.body
    const whitelist = ["username","coins","userid","admin","moderation","colors","inventory","joindate","lastclaimofcurrency","membership","friendrequests","friends","badges","status","timesincelastrequest","avatartype","discordid","moderationhistory"]
    if (numbtest.test(userid) == false && !username){
        return res.json({status: "error", error: "Userid can only be a number!"})
       }

       let lookupuser 

       if (userid != ""){
        lookupuser = await ActualUser.findOne({userid: userid}).lean().select(whitelist)
       }else if (username){
        lookupuser = await ActualUser.findOne({username: username}).lean().select(whitelist)
       }

       if (!lookupuser) {
        return res.json({status: "error", error: "User not found reenter"})
    }
       return res.json({status: "success", data: lookupuser})
})

router.post("/queue", requireAuth,async (req, res) => {
    if (req.userdocument.admin == false) {
        return res.redirect('/')
    }
    const resultsPerPage = 30
    let page = req.body.page ?? 0
    if (page != 0){
        page-=1
    }
    let {sort} = req.body
    let response
    let responsecount
    
    if (sort != "All"){
        response = await catalog.find({Type: sort, approved: false, Type: {$ne: "Image"}, denied: {$exists:false}}).limit(resultsPerPage).skip(0+parseFloat(page)*resultsPerPage).lean().select(['-_id'])
        responsecount = await catalog.countDocuments({Type: sort, approved: false, Type: {$ne: "Image"}, denied: {$exists:false}})
    }
    if (sort === "All"){
        response = await catalog.find({approved: false, Type: {$ne: "Image"}, denied: {$exists:false}}).limit(resultsPerPage).skip(0+parseFloat(page)*resultsPerPage).lean().select(['-_id'])
        responsecount = await catalog.countDocuments({approved: false, Type: {$ne: "Image"}, denied: {$exists:false}})
    }

    
    return res.json({data: response, pages: Math.ceil(Math.max(responsecount/resultsPerPage, 1)), count: responsecount })
})

module.exports = router