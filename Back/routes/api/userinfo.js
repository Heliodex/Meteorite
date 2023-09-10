const express = require("express")
const router = express.Router()
const user = require('./../..//model/user.js')
const games = require("./../../model/games.js")
const RelativeTime = require("@yaireo/relative-time")
const relativeTime = new RelativeTime()

router.get("/:id",async (req, res) => {
    var id = req.params.id;
    if (isNaN(parseFloat(id)) === true){
        return res.json({error: true})
    }
    const response = await user.findOne({userid: id}).lean()

    if (!response){
        return res.json({error: true, message: "404"})
    }

    let status = {status: "Offline"}
    if (response.status){
        status = JSON.parse(response.status)
    }
    const actualTimeMilliseconds = new Date().getTime()
    if (response.timesincelastrequest && actualTimeMilliseconds - response.timesincelastrequest >= 60000 * 3 /*3 minutes*/ && status && status.status.includes("Playing") === false || response.timesincelastrequest && actualTimeMilliseconds - response.timesincelastrequest >= 60000 * 3 /*3 minutes*/ && !status){
        // been 3 minutes since last request mark as offline make sure we don't mark them offline while they are playing a game
        status.status = "Offline"
        response.status = JSON.stringify(status)
        status = JSON.parse(response.status)
    }
    if (response.timesincelastrequest && actualTimeMilliseconds - response.timesincelastrequest <= 60000 * 3 /*3 minutes*/ && status && status.status.includes("Playing") === false || response.timesincelastrequest && actualTimeMilliseconds - response.timesincelastrequest <= 60000 * 3 /*3 minutes*/ && !status){
        status.status = "Online"
        response.status = JSON.stringify(status)
        status = JSON.parse(response.status)
    }

    return res.json({error:false, userinfo: {joindate: response.joindate, joindateepoch:new Date(response._id.getTimestamp()).getTime(), lastonline: relativeTime.from(new Date(response.timesincelastrequest)), lastonlineepoch: response.timesincelastrequest, coins: response.coins, username: response.username,userid: response.userid,friends: response.friends, admin: response.admin, discordid: response.discordid, membership: response.membership, inventory: response.inventory, bio: response.bio, status,followers: response.followers?.length, css: response.css, aboutme: response.aboutme}})


})

router.get("/:id/creations",async (req, res) => {
    var id = req.params.id;
    if (isNaN(parseFloat(id)) === true){
        return res.json({error: true})
    }
    const response = await user.findOne({userid: id}).lean()

    if (!response){
        return res.status(404).json({error: true, message: "Not found"})
    }

    const gameresponse = await games.find({useridofowner: id}).lean().select(['idofgame', 'version', 'nameofgame', 'numberofplayers', 'visits', 'useridofowner'])

    return res.json(gameresponse)


})

router.get("/:id/visits",async (req, res) => {
    var id = req.params.id;
    if (isNaN(parseFloat(id)) === true){
        return res.json({error: true})
    }
    const response = await user.findOne({userid: id}).lean()

    if (!response){
        return res.status(404).json({error: true, message: "Not found"})
    }

    const visits = await games.aggregate([
        { $match: { useridofowner: parseFloat(id) } },
        {
          "$group": {
            "_id": null,
            "visits": {
                '$sum': "$visits"
            }
          }
        }
      ])

    return res.json({error: false,visits: visits[0]?.visits || 0})


})


router.get("/usernametoid/:id",async (req, res) => {

    var id = req.params.id;

    const response = await user.findOne({username: {'$regex': id,$options:'i'}}).lean()

    if (!response){
        console.log(response)
        return res.json({error: true})
    }

    return res.json({error:false, userid: response.userid})
})

router.get("/discordidtouserid/:id",async (req, res) => {

    var id = req.params.id;

    const response = await user.findOne({discordid: id}).lean()

    if (!response){
        console.log(response)
        return res.json({error: true})
    }

    return res.json({error:false, userid: response.userid})
})

module.exports = router