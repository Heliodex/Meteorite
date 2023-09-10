const express = require("express")
const router = express.Router()
const { requireAuth } = require('./../../middleware/authmiddleware')
const bodyParser = require('body-parser')   
const groups = require('./../../model/groups.js')
var multer = require('multer');
const fs = require('fs');
const path = require('path')
router.use(bodyParser.json())

router.post("/", requireAuth,async (req, res) => {
    let mygroups = await groups.find({"members.userId": req.userdocument.userid}).lean().select(["Name","Description","Public","groupid","ownerid","memberscount"])
    return res.json(mygroups)
})

router.post("/:id", requireAuth,async (req, res) => {
    const groupid = parseInt(req.params.id)
    if (isNaN(groupid)){
        return res.json({status: "error", error: "Not found"})
    }

    let groupresponse = await groups.findOne({groupid}).lean().select(["Name","Description","Public","groupid","ownerid","memberscount","currentshout"]).populate({path: "owner",select: ["username", "userid"]})

    if (!groupresponse){
        return res.json({status: "error", error: "Not found"})
    }

    return res.json({status: "success", data: groupresponse})
})

router.post("/:id/members", requireAuth,async (req, res) => {
    const groupid = parseInt(req.params.id)
    const {rank} = req.body
    if (!rank){
        return res.json({status: "error", error: "Rank not sent"})
    }

    const resultsPerPage = 5
    let page = req.body.page ?? 0
    if (page != 0){
        page-=1
    }
    let skip = 0+parseFloat(page)*resultsPerPage

    if (isNaN(groupid)){
        return res.json({status: "error", error: "Not found"})
    }

    let groupresponse = await groups.findOne({groupid}).lean().select({"members": { "$slice" : [ skip, resultsPerPage ] }}).populate({path: "memberspoly",select: ["username", "userid"]})

    if (!groupresponse){
        return res.json({status: "error", error: "Not found"})
    }

    return res.json({status: "success", data: groupresponse.memberspoly})
})

async function validateImage(groupid,res){
    return new Promise(async (resolve) => {

        try {
            const myArrayBuffer = await fs.promises.readFile(path.resolve(`assets/groupicons/icon-${groupid}.png`), null)
            pngValidator(myArrayBuffer);
            // success
        } catch {
            // file is invalid or corrupt
            fs.unlink(path.resolve(`assets/groupicons/icon-${groupid}.png`), (err => {
                if (err) console.log(err)
              }));
    
            return res.json({status: 'error', error: 'Image is invalid.'})
        }

        resolve()

    })
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {  
        // Uploads is the Upload_folder_name
            cb(null, "./assets/groupicons")
        
    },
    filename: async function (req, file, cb) {
            const groupid = await groups.countDocuments();
            cb(null, "icon-" + groupid + ".png")
        

    }
  })
       const uploadicon = multer({storage: storage,
        fileFilter: function (req, file, callback) {
            if(file.mimetype != 'image/png') {
                return callback('Invalid file type')
            }
            callback(null, true)
        },
        limits: { fileSize: 1024 * 1024 } // 1mb
    })

router.post("/create", requireAuth,async (req, res) => {
    if (req.userdocument.coins < 100){
        return res.json({status: "error", error: "You don't have enough Rocks!"})
    }
    uploadicon.single("groupicon")(req, res, async function (err) {
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
    const {groupname, description,publicgroup} = req.body

    if (!groupname){
        return res.json({status: 'error', error: 'Group name needs to be sent.'})
    }
    if (!description){
        return res.json({status: 'error', error: 'Description needs to be sent.'})
    }
    if (!publicgroup){
        return res.json({status: 'error', error: 'Public group needs to be sent.'})
    }
    if (publicgroup != "true" && type != "false"){
        return res.json({status: 'error', error: 'Public group needs to be a true or false value.'})
    }
        
    const groupid = await groups.countDocuments();
    // check if the file they just uploaded is valid
    await validateImage(groupid,res)
    let IconApproved = req.userdocument.admin === false ? false : true

        await groups.create({
            Name: xss(groupname),
            Description: xss(description),
            Public: publicgroup,
            IconApproved,
            groupid,
            ownerid: req.userdocument.userid,
            memberscount: 1,
            members: [{userId: req.userdocument.userid, rank: 3}],
            Roles: [{RoleName: "Members", Permissions: {Shout: false, Kick: false, ChangeRoles: false, ModerateWall: false, ManageAllies: false}, Rank: 1}, {RoleName: "Admin", Permissions: {Shout: true, Kick: true, ChangeRoles: true, ModerateWall: true, ManageAllies: false}, Rank: 2}, {RoleName: "Owner", Permissions: {All: true}, Rank: 3}]
            })

    return res.json({status: "success", message: "Group created!"})


})
})

router.post("/editgroup", requireAuth,async (req, res) => {
    

})

router.post("/postshout", requireAuth,async (req, res) => {
    

})

router.post("/joingroup", requireAuth,async (req, res) => {
    

})

router.post("/leavegroup", requireAuth,async (req, res) => {
    

})

router.post("/exile", requireAuth,async (req, res) => {
    

})

module.exports = router