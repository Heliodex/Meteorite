const express = require("express")
const router = express.Router()
const { requireAuth } = require('./../../middleware/authmiddleware')
const User = require('./../../model/user.js')
const bodyParser = require('body-parser')

router.use(bodyParser.json())

router.post("/share",requireAuth,async (req, res) => {
    let { sharevalue } = req.body
    if (!sharevalue || typeof sharevalue !== 'string'){
        return res.json({status: "error", error: "Share value not sent!"})
    }
    if (sharevalue.length > 100){
        return res.json({status: "error", error: "Share value too long!"})
    }
    const date = new Date().getTime()
    if (date - req.userdocument?.lastfeedsharetime < 3600000){
        return res.json({status: "error", error: "You can only share once an hour!"})
    }

    let posterid = req.userdocument.userid
    User.updateOne({userid: req.userdocument.userid}, {
        $push: {
            feed: {posterid, content: sharevalue, date, moderated: false}
        },
        $set: {
            lastfeedsharetime: date
        }
    }, 
    function(err, doc) {
    })
    res.json({status: "success", message: "Done!"}) // the next operation could take some time and we wouldn't want the client to cancel during that!!

    if (req.userdocument.friends){
        //console.log(req.userdocument.friends)
        for (let item of req.userdocument.friends) {
            User.updateOne({userid: item.userid}, {
                $push: {
                    feed: {posterid, content: sharevalue, date, moderated: false}
                }
            }, 
            function(err, doc) {
            })
        }
    }

})

router.post("/fetch",requireAuth,async (req, res) => {
    let feed = await User.findOne({userid: req.userdocument.userid}).lean().populate({path: "feed.userdata",select: ["username"]}).select('feed')
    return res.json({status: "success", data: feed.feed})
})

module.exports = router