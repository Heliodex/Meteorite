const express = require("express")
const router = express.Router()
const { requireAuth } = require('./../../middleware/authmiddleware')
const games = require('./../../model/games.js')
const catalog = require('./../../model/item.js')
const comments = require('./../../model/comment.js')
const bodyParser = require('body-parser')   
router.use(bodyParser.json())
const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
	windowMs: 10 * 1000, // 10 seconds
	max: 1, // Limit each IP to 1 requests per `window`
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (request, response, next, options) =>{
        return response.json({status: 'error', error: 'Too many requests try again later.'})
    }
})

router.post("/post", requireAuth,limiter,async (req, res) => {
    let {comment, AssociatedAssetType, AssociatedAssetId} = req.body

    AssociatedAssetId = parseInt(AssociatedAssetId)
    if (!comment || typeof AssociatedAssetType !== "string"){
        return res.json("Send comment and associated asset id please")
    }
    if (comment.length > 200){
        return res.json({status: 'error', error: "Comment too long!"})
    }

    if (AssociatedAssetType !== "game" && AssociatedAssetType !== "item"){
        return res.json({status: 'error', error: "Invalid asset type!"})
    }

    if (AssociatedAssetType === "game"){
        const game = await games.findOne({idofgame: AssociatedAssetId}).lean()
        if (!game){
            return res.json({status: 'error', error: "Game not found!"})
        }
    }

    if (AssociatedAssetType === "item"){
        const item = await catalog.findOne({ItemId: AssociatedAssetId}).lean()
        if (!item){
            return res.json({status: 'error', error: "Game not found!"})
        }
    }

    await comments.create({
        associatedassetid: AssociatedAssetId,
        associatedassettype: AssociatedAssetType,
        posterid: req.userdocument.userid,
        content: comment,
        date: new Date().getTime(),
        moderated: false
    })

    return res.json({status: 'success', message: "Comment posted!"})

})


router.post("/get", requireAuth,async (req, res) => {
    let {AssociatedAssetType, AssociatedAssetId} = req.body
    AssociatedAssetId = parseInt(AssociatedAssetId)
    const resultsPerPage = 20
    let cursor = req.body.page >= 0 ? req.body.page : 0
    if (cursor != 0){
        cursor-=1
    }

    if (!AssociatedAssetType || typeof AssociatedAssetId === undefined){
        return res.json({status: 'error', error: "Send comment and associated asset id please"})
    }

    if (AssociatedAssetType !== "game" && AssociatedAssetType !== "item"){
        return res.json({status: 'error', error: "Invalid asset type!"})
    }

    let commentsarray
    let commentscount

    if (AssociatedAssetType === "game"){
        const game = await games.findOne({idofgame: AssociatedAssetId}).lean()
        if (!game){
            return res.json({status: 'error', error: "Game not found!"})
        }
    }

    if (AssociatedAssetType === "item"){
        const item = await catalog.findOne({ItemId: AssociatedAssetId}).lean()
        if (!item){
            return res.json({status: 'error', error: "Game not found!"})
        }
    }

    commentsarray = await comments.find({associatedassetid: AssociatedAssetId, associatedassettype: AssociatedAssetType}).lean().sort({date: 'descending'}).populate({path: "poster",select: ["username"]}).select(["posterid", "content", "date", "poster"]).skip(0+parseFloat(cursor)*resultsPerPage).limit(resultsPerPage)
    commentscount = await comments.countDocuments({associatedassetid: AssociatedAssetId, associatedassettype: AssociatedAssetType})

    return res.json({status: 'success', data: commentsarray, pages: Math.ceil(Math.max(commentscount/resultsPerPage, 1))})
})

module.exports = router