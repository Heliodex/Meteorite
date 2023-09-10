const express = require("express")
const router = express.Router()
const { requireAuth } = require('./../../middleware/authmiddleware')
const bodyParser = require('body-parser')   
const User = require('./../../model/user.js')
const catalog = require('./../../model/item.js')
const games = require('./../../model/games.js')
router.use(bodyParser.json())

router.post("/",requireAuth,async (req, res) => {
    let {itemid, AdId, type} = req.body
    if (typeof itemid == "undefined"){
        return res.json({status: "error", error: "ItemId not sent!"})
    }
    if (typeof AdId == "undefined"){
        return res.json({status: "error", error: "Ad ID not sent!"})
    }
    if (typeof type == "undefined"){
        return res.json({status: "error", error: "Type not sent!"})
    }
    if (type != "game" && type != "item"){
        return res.json({status: "error", error: "Invalid Type!"})
    }

    if (req.userdocument.coins < 10){
        return res.json({status: "error", error: "You don't have enough Rocks!"})
    }

    const Addoc = await catalog.findOne({ItemId: AdId})

    if (!Addoc || Addoc?.Type != "User Ad"){
        return res.json({status: "error", error: "Not found"})
    }

    if (Addoc.Creator != req.userdocument.userid){
        return res.json({status: "error", error: "Not Authorized"}) // tried to use someone elses ad
    }

    if (Addoc.ActiveAd === true){ // ad is already running
        return res.json({status: "error", error: "You are already running this ad!"})
    }

    if (Addoc.Hidden){
        return res.json({status: "error", error: "Ad is moderated!"})
    }

    if (Addoc.approved === false){
        return res.json({status: "error", error: "Ad is pending approval!"})
    }
    

    let itemdoc

    if (type === "game"){
        itemdoc = await games.findOne({idofgame: itemid}).lean()
    }

    if (!itemdoc){
        return res.json({status: "error", error: "Not found"})
    }
    
    if (type === "game"){

        if (itemdoc.useridofowner != req.userdocument.userid){ // make sure we only let game owners advertise there game
            return res.json({status: "error", error: "Not Authorized"})
        }

    }

    if (type === "item"){

        if (itemdoc.Creator != req.userdocument.userid){ // make sure we only let item owners advertise there item
            return res.json({status: "error", error: "Not Authorized"})
        }

    }

    req.userdocument.coins -= 10
    req.userdocument.markModified('coins')
    await req.userdocument.save()

    Addoc.adtype = type
    Addoc.adredirectid = itemid
    Addoc.ActiveAd = true
    Addoc.adstartedtime = Date.now()

    Addoc.markModified('adtype')
    Addoc.markModified('adredirectid')
    Addoc.markModified('ActiveAd')
    Addoc.markModified('adstartedtime')
    await Addoc.save()



    

    return res.json({status: "success", message: "Done!"})
    
})

module.exports = router