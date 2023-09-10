const express = require("express")
const router = express.Router()
const { requireAuth } = require('./../../middleware/authmiddleware')
const bodyParser = require('body-parser')   
const catalog = require('./../../model/item.js')
//const path = require('path');
router.use(bodyParser.json())
// only supports skyscraper ads for now

router.get("/",async (req, res) => {

    const activeAdCount = await catalog.countDocuments({ActiveAd: true})

    //console.log(activeAdCount)

    let random = Math.floor(Math.random() * activeAdCount)

    const Addoc = await catalog.findOne({ActiveAd: true}).skip(random)
    if (!Addoc){
        // no ads are running!
        return res.json({imageUrl: "/assets/images/defaultadsky.png", redirectUrl: "#", AdID: 0})
    }

    if (Addoc.adstartedtime <= new Date(new Date().getTime() - (24 * 60 * 60 * 1000)).getTime() || Addoc.Hidden){
        // more than 24 hours old invalidate ad OR ad was moderated
        Addoc.ActiveAd = false
        Addoc.markModified('ActiveAd')
        await Addoc.save()
    }
    let redirectUrl

    if (Addoc.adtype === "game"){
        redirectUrl = "/games/"+Addoc.adredirectid
    }

    return res.json({imageUrl: "/api/thumbnailrender/asset?id="+Addoc.ItemId, redirectUrl, AdID: Addoc.ItemId})
    
})

module.exports = router