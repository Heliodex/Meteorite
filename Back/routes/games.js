const express = require("express")
const router = express.Router()
const { requireAuth } = require('./../middleware/authmiddleware')
const games = require('./../model/games.js')
const catalog = require("./../model/item.js")
const { grabAuth } = require('./../middleware/grabauth.js')
const rcc = require('./../model/rcc.js')
const rcc2018 = require('./../model/rcc2018.js')
const rcc2020 = require('./../model/rcc2020.js')
const rcctalk = require('./../rcctalk')
const rcctalk2018 = require('./../rcctalk2018')
const bodyParser = require('body-parser')
router.use(bodyParser.json())

router.post("/scroll", async (req, res) => {
    const resultsPerPage = 10
    let cursor = req.body.cursor >= 0 ? req.body.cursor : 0
    let type = req.body.type ? req.body.type : "Popular"
    let allowed =  ['idofgame', 'version', 'nameofgame', 'numberofplayers', 'visits', 'useridofowner']
    try{
        if (type === "Popular"){
            const response = await games.find().sort({numberofplayers: "descending", idofgame: 1}).skip(0+parseFloat(cursor)*resultsPerPage).limit(10).lean().select(allowed).populate("owner", "username")
            return res.json(response)
        }
        if (type === "OurRecommendations"){
            const featured = await games.find({featured: true}).skip(0+parseFloat(cursor)*resultsPerPage).limit(10).lean().select(allowed).populate("owner", "username")
            return res.json(featured)
        }
        if (type === "Visits"){
            const mostvisitedresponse = await games.find().sort({visits: "descending", idofgame: 1}).skip(0+parseFloat(cursor)*resultsPerPage).limit(10).lean().select(allowed).populate("owner", "username")
            return res.json(mostvisitedresponse)
        }
        if (type === "NewestArrivals"){
            const newest = await games.find().sort({idofgame: "descending"}).skip(0+parseFloat(cursor)*resultsPerPage).limit(10).lean().select(allowed).populate("owner", "username")
            return res.json(newest)
        }
        return res.json({status: "error", error: "wtf"})

        


    } catch (error) {
        console.log(error)
        return res.json({status: "error", error: "wtf"})
    }

})

router.post("/firstpaint", async (req, res) => {
    const resultsPerPage = 10
    let cursor = 0
    let allowed =  ['idofgame', 'version', 'nameofgame', 'numberofplayers', 'visits', 'useridofowner']
    try{
            const response = await games.find().sort({numberofplayers: "descending", idofgame: 1}).skip(0+parseFloat(cursor)*resultsPerPage).limit(10).lean().select(allowed).populate("owner", "username")
            const featured = await games.find({featured: true}).skip(0+parseFloat(cursor)*resultsPerPage).limit(10).lean().select(allowed).populate("owner", "username")
            const mostvisitedresponse = await games.find().sort({visits: "descending", idofgame: 1}).skip(0+parseFloat(cursor)*resultsPerPage).limit(10).lean().select(allowed).populate("owner", "username")
            const newest = await games.find().sort({idofgame: "descending"}).skip(0+parseFloat(cursor)*resultsPerPage).limit(10).lean().select(allowed).populate("owner", "username")
            return res.json({Popular: {array: response},OurRecommendations: {array: featured}, Visits: {array: mostvisitedresponse}, NewestArrivals: {array: newest} })

    } catch (error) {
        console.log(error)
        return res.json({status: "error", error: "wtf"})
    }

})

router.post("/shutdown",requireAuth, async (req, res) => {
    const {gameid} = req.body
    if (isNaN(parseFloat(gameid)) === true){
        return res.json({status: "error", error: "Not found"})
    }
        
    const gamedoc = await games.findOne({idofgame: gameid}).lean()

    //console.log(response)

    if (!gamedoc){
        return res.json({status: "error", error: "Not found"})
    }
    if (gamedoc.useridofowner != req.userdocument.userid && req.userdocument.admin === false){ // make sure we only let game owners and admins shut down the game
        return res.json({status: "error", error: "Not Authorized"})
    }

        if (gamedoc.version === "2018" || gamedoc.version === "2020"){
            let instance = await rcc2018.findOne({PlaceId: gamedoc.idofgame}).lean()
            if (!instance){
                instance = await rcc2020.findOne({PlaceId: gamedoc.idofgame}).lean()
                if (!instance){
                    return res.json({status: "error", error: "Game not open."})
                }
            }

            await rcc2018.deleteOne({PlaceId: gamedoc.idofgame})
            await rcc2020.deleteOne({PlaceId: gamedoc.idofgame})
            rcctalk2018.CloseJob("game"+gamedoc.idofgame)
        }
        if (gamedoc.version === "2016"){
            const instance = await rcc.findOne({PlaceId: gamedoc.idofgame}).lean()
            if (!instance){
                return res.json({status: "error", error: "Game not open."})
            }

            await rcc.deleteOne({PlaceId: gamedoc.idofgame})
        
            rcctalk.CloseJob("game"+gamedoc.idofgame) 
        }

    return res.json({status: "success", message:"Done!"})


})

router.post("/evictplayer",requireAuth, async (req, res) => {
    const {gameid,userid} = req.body
    if (isNaN(parseFloat(userid)) === true){
        return res.json({status: "error", error: "Not found"})
    }
        
    const gamedoc = await games.findOne({idofgame: gameid}).lean()

    //console.log(response)

    if (!gamedoc){
        return res.json({status: "error", error: "Not found"})
    }
    if (gamedoc.useridofowner != req.userdocument.userid && req.userdocument.admin === false){ // make sure we only let game owners and admins shut down the game
        return res.json({status: "error", error: "Not Authorized"})
    }

        if (gamedoc.version === "2018" || gamedoc.version === "2020"){
            let instance = await rcc2018.findOne({PlaceId: gamedoc.idofgame}).lean()
            if (!instance){
                instance = await rcc2020.findOne({PlaceId: gamedoc.idofgame}).lean()
                if (!instance){
                    return res.json({status: "error", error: "Game not open."})
                }
            }

            rcctalk2018.Execute("game"+gamedoc.idofgame,{"Mode":"EvictPlayer","Settings":{"PlayerId":userid}})
        }
        if (gamedoc.version === "2016"){
            const instance = await rcc.findOne({PlaceId: gamedoc.idofgame}).lean()
            if (!instance){
                return res.json({status: "error", error: "Game not open."})
            }
            let kickscript = `for v, player in pairs(game:GetService("Players"):GetChildren()) do
            print(player.UserId)
            local tokick = ${userid}
            if player.UserId == tokick then
                player:Kick()
            end
        end`
            rcctalk.Execute("game"+gamedoc.idofgame,kickscript)
        }

    return res.json({status: "success", message:"Done!"})


})

router.get('/gameinfo/:id', async (req, res) => {
    var id = req.params.id;
    if (isNaN(parseFloat(id)) === true){
        return res.json({status: "error", error: "Not found"})
    }
    
    const response = await games.findOne({idofgame: id}).lean().select(['idofgame', 'version', 'nameofgame', 'numberofplayers', 'visits', 'useridofowner', 'players','descrption']).populate("owner", "username")
    //console.log(response)

    if (!response){
        return res.json({status: "error", error: "Not found"})
    }
    const date =  new Date(response._id.getTimestamp())
    response.creationdate = (date.getMonth()+1) + '/' + date.getDate() + '/' + date.getFullYear()


    return res.json({error: false, gameinfo: response})
})

router.get('/gameinfo/:id/store', async (req, res) => {
    var id = req.params.id;
    if (isNaN(parseFloat(id)) === true){
        return res.json({status: "error", error: "Not found"})
    }
    
    const response = await catalog.find({associatedgameid: id}).lean()
    //console.log(response)

    if (!response){
        return res.json({status: "error", error: "Not found"})
    }

    return res.json({status: "success", gameinfo: response})
})

router.post('/search', async (req, res) => {
    const resultsPerPage = 100
    let cursor = req.body.cursor >= 0 ? req.body.cursor : 0

    function escapeRegex(text) {
        return text?.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }
    const regex = new RegExp(escapeRegex(req.body.searchquery), 'gi');

    //const pages = await User.countDocuments({username: regex})/resultsPerPage

    const response = await games.find({nameofgame: regex}).limit(resultsPerPage).skip(0+parseFloat(cursor)*resultsPerPage).lean().select(['idofgame', 'version', 'nameofgame', 'numberofplayers', 'visits', 'useridofowner', 'players','descrption'])

    return res.json(response)
    

});

module.exports = router