const express = require("express")
const router = express.Router()
const { requireAuth } = require('./../../middleware/authmiddleware')
const bodyParser = require('body-parser')
var numbtest = /^\d+\.?\d*$/;
const items = require('./../../model/item.js')
const User = require('./../../model/user.js')
router.use(bodyParser.json())

router.post("/", requireAuth,async (req, res) => {
    if (!req.userdocument.discordid) {
        return res.json({status: "error", error: "Discord link required for purchasing. Link your discord in the settings panel."})
    }
    const {itemid} = req.body
    if (typeof itemid == "undefined"){
        return res.json({status: "error", error: "You need sum itemids bozo"})
    }
    if (numbtest.test(itemid) == false){
        return res.json({status: "error", error: "You need sum itemids bozo"})
    }


    const itemdoc = await items.findOne({ItemId: itemid})//.lean()
    if (typeof req.userdocument.inventory !== "undefined"){
        // check if user already owns item
        for (var v of req.userdocument.inventory){
            if (v.ItemId === itemdoc.ItemId){
                // they already own it
        return res.json({status: 'error', error: "You already own this!"})
            }
        }
    }
    if (itemdoc.Type === "Mesh" || itemdoc.Type === "Audio" || itemdoc.Type === "Mesh"){
        return res.json({status: 'error', error: "You can't buy assets."})
    }

    if (itemdoc.Hidden){
        return res.json({status: 'error', error: "You can't buy this."})
    }
    
    
    if (req.userdocument.coins >= itemdoc.Price){
        // has enough money to purcahse item
        try{
            User.updateOne({userid: req.userdocument.userid}, {
                $set: {
                    coins: req.userdocument.coins - itemdoc.Price
                },
                $push: {
                    inventory: {Type: itemdoc.Type,ItemId: itemdoc.ItemId, ItemName: itemdoc.Name, Equipped: false}
                }
            }, 
            function(err, doc) {
              //console.log(err)
            })
            // give owner cash
            User.updateOne({userid: itemdoc.Creator}, {
                $inc: {
                    coins: itemdoc.Price
                }
            }, 
            function(err, doc) {
              //console.log(err)
            })

            itemdoc.Sales += 1
            if (!itemdoc.Sales){
                itemdoc.Sales = 1
            }
            //console.log(itemdoc.Sales)
            itemdoc.markModified('Sales')
            await itemdoc.save()
        }catch{

        }
        return res.json({status: 'success', message: 'Purchase successful'})
    }
    // too poor
    return res.json({status: 'error', error: "You don't have enough rocks"})

})

module.exports = router