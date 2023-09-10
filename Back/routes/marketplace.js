const express = require("express")
const router = express.Router()
const games = require('./../model/games.js')
const User = require('./../model/user.js')
const item = require("./../model/item.js")
const { requireAuth } = require("../middleware/authmiddleware.js")

var rgx = /^[0-9]*\.?[0-9]*$/;
router.get("/marketplace/productinfo", async (req, res) => {
    const sanitizedid = req.query.assetId.match(rgx)
    let json = {"TargetId":5009,"ProductType":"User Product","AssetId":93722443,"ProductId":13831621,"Name":"rrr","Description":"","AssetTypeId":19,"Creator":{"Id":1,"Name":"","CreatorType":"User","CreatorTargetId":1},"IconImageAssetId":0,"Created":"2012-09-28T01:09:47.077Z","Updated":"2017-01-03T00:25:45.8813192Z","PriceInRobux":null,"PriceInTickets":null,"Sales":0,"IsNew":false,"IsForSale":true,"IsPublicDomain":false,"IsLimited":false,"IsLimitedUnique":false,"Remaining":null,"MinimumMembershipLevel":0,"ContentRatingTypeId":0}
    

    let response = await games.findOne({idofgame: parseFloat(sanitizedid)}).lean()
    if (!response){
        response = await item.findOne({ItemId: parseFloat(sanitizedid)}).lean()
        json.PriceInRobux = parseFloat(response.Price)
        json.AssetTypeId = 34
        json.IconImageAssetId = parseFloat(req.query.assetId)
        if (!response){
            return res.status(404).end()
        }
    }

    const creator = await User.findOne({userid: parseFloat(response.useridofowner??response.Creator)}).lean()
    json.AssetId = parseFloat(req.query.assetId)
    json.ProductId = parseFloat(req.query.assetId)
    json.TargetId = parseFloat(req.query.assetId)
    json.Name = response.nameofgame??response.Name
    json.Description = response.descrption??""
    json.Creator.Id = parseFloat(response.useridofowner??response.Creator)
    json.Creator.Name = creator.username
    json.Creator.CreatorTargetId = parseFloat(response.useridofowner??response.Creator)
    res.json(json)
})

router.post("/marketplace/purchase",requireAuth, async (req, res) => {
    const productId = parseInt(req.body.productId)
    if (!productId){
        res.json({success: false,status: "Error",receipt: ""})
    }

    
    const itemdoc = await item.findOne({ItemId: productId})//.lean()
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
        return res.json({success: false,status: "Error",receipt: ""})
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
        return res.json(({success: true,status: "Bought",receipt: ""}))
    }
    // too poor
    return res.json({success: false,status: "Error",receipt: ""})

})

router.get('/ownership/hasasset',async (req, res) => {
    const userid = req.query?.userId
    const assetId = req.query?.assetId
    const doc = await User.findOne({userid: userid})
    const itemdoc = await item.findOne({ItemId: assetId})
    if (!doc){
        return res.send("false")
    }
    if (!itemdoc){
        return res.send("false")
    }

    if (typeof doc.inventory !== "undefined"){
        // check if user already owns item
        for (var v of doc.inventory){
            if (v.ItemId === itemdoc.ItemId){
                // they already own it
                return res.send("true")
            }
        }
    }

    return res.send("false")
})

router.get('/v1/users/:userId/items/gamepass/:assetId',async (req, res) => {
    const userid = req.params?.userId
    const assetId = req.params?.assetId
    const doc = await User.findOne({userid: userid})
    const itemdoc = await item.findOne({ItemId: assetId})
    let data = {"previousPageCursor":null,"nextPageCursor":null,"data":[]}
    
    if (!doc){
        return res.json(data)
    }
    if (!itemdoc){
        return res.json(data)
    }

    if (typeof doc.inventory !== "undefined"){
        // check if user already owns item
        for (var v of doc.inventory){
            if (v.ItemId === itemdoc.ItemId){
                // they already own it
                data.data.push({"type": "GamePass","id": req.params?.assetId,"name": itemdoc.Name,"instanceId": null})
                return res.json(data)
            }
        }
    }

    return res.json(data)
})

router.post('/v1/purchases/products/:assetId',requireAuth,async (req, res) => {
    const assetId = req.params?.assetId
    const itemdoc = await item.findOne({ItemId: assetId})
    let error = {
        "purchased": false,
        "reason": "InsufficientFunds",
        "productId": 15194787,
        "statusCode": 500,
        "title": "Not Enough Robux",
        "errorMsg": "You do not have enough Robux to purchase this item.",
        "showDivId": "InsufficientFundsView",
        "shortfallPrice": 29,
        "balanceAfterSale": -29,
        "expectedPrice": 150,
        "currency": 1,
        "price": 150,
        "assetId": 106690045
    }

    if (!itemdoc){
        error.productId = assetId
        error.title = "Not found"
        return res.json(error)
    }
    error.price = itemdoc.Price
    error.productId = assetId
    error.assetId = assetId
    error.expectedPrice = itemdoc.Price
    error.balanceAfterSale = req.userdocument.coins - itemdoc.Price
    error.shortfallPrice = Math.abs(req.userdocument.coins - itemdoc.Price)


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
        return res.json({status: 'error', error: "You can't buy this!"})
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
        return res.json({
            "purchased": true,
            "reason": "Success",
            "productId": assetId,
            "currency": 1,
            "price": itemdoc.Price,
            "assetId": assetId,
            "assetName": itemdoc.Name,
            "assetType": "Gamepass",
            "assetTypeDisplayName": "Gamepass",
            "assetIsWearable": false,
            "sellerName": "Robloxxx",
            "transactionVerb": "bought",
            "isMultiPrivateSale": false
        })
    }

    return res.json(error)
})

module.exports = router