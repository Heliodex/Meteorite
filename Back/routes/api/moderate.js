const express = require("express")
const router = express.Router()
const { requireAuth } = require('./../../middleware/authmiddleware')
const items = require('./../../model/item.js')
const bodyParser = require('body-parser')   
const fs = require('fs')
const path = require("path");
router.use(bodyParser.json())

router.post("/", requireAuth,async (req, res) => {
    let {itemid} = req.body
    if (typeof itemid == "undefined"){
        return res.json({status: 'error', error: "itemid not sent!"})
    }
    itemid = parseInt(itemid)
    if (req.userdocument.admin == false && req.userdocument?.ugcpermission == false) {
        return res.redirect('/')
    }
    const item = await items.findOne({ItemId: itemid})

    if (item.Creator != req.userdocument.userid && req.userdocument.admin === false){ // basically we want ugc uploaders to be able to delete there own items but not other peoples items
        return res.json({status: 'error', error: "You don't own this item!"})
    }
            try{
                items.updateOne({ItemId: itemid}, {
                    $set: {
                        Hidden: true
                    }
                }, 
                function(err, doc) {
                  //console.log(err)
                })
                // delete the item from our servers
                fs.unlink(path.resolve(path.resolve(__dirname, "../../assets/ugc/itemfile-"+itemid+".rbxm")), (err => {
                    if (err) console.log(err)
                  }));
            }catch(err){
                console.log(err)
            }

        return res.json({status: 'success'})

})

router.post("/queue", requireAuth,async (req, res) => {
    const {action,itemid} = req.body
    if (typeof action == "undefined"){
        return res.json("Send Action Please")
    }
    if (typeof itemid == "undefined"){
        return res.json("Send Itemid Please")
    }
    if (req.userdocument.admin == false) {
        return res.redirect('/')
    }
    const item = await items.findOne({ItemId: itemid})

    if (!item){
        return res.json({status: "error", error: "Send Itemid Please"})
    }

    console.log(action)

    if (action === "deny"){
        item.Hidden = true
        item.denied = true
        item.markModified("Hidden")
        item.markModified("denied")
        await item.save()
        fs.unlink(path.resolve(path.resolve(__dirname, "../../assets/ugc/itemfile-"+itemid+".rbxm")), (err => {
            if (err) console.log(err)
          }));
    }
    if (action === "approve"){
        item.approved = true
        item.markModified("approved")
        await item.save()
        if (item.Type === "Shirts" || item.Type === "Pants"){
            // we also have to approve the associated image
            const image = await items.findOne({ItemId: parseInt(itemid)-1})
            image.approved = true
            image.markModified("approved")
            await image.save()
        }

    }
    // finish this LMAO pretty ez tho
    return res.json({status: "success", message: "Done!"})
})

module.exports = router