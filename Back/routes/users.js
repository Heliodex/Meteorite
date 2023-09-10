const express = require("express")
const router = express.Router()
const { requireAuth } = require('./../middleware/authmiddleware')
const User = require('./../model/user.js')
const games = require('./../model/games.js')
const bodyParser = require('body-parser')
router.use(bodyParser.json())

router.post('/api/users/search', async (req, res) => {
    const resultsPerPage = 12
    let page = req.body.page ?? 0
    if (page != 0){
        page-=1
    }
    let {searchquery} = req.body

    function escapeRegex(text) {
        return text?.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }
    const regex = new RegExp(escapeRegex(searchquery), 'gi');

    //const pages = await User.countDocuments({username: regex})/resultsPerPage

    const response = await User.find({username: regex}).limit(resultsPerPage).skip(0+parseFloat(page)*resultsPerPage).select(['userid','username']).lean()
    let responsecount = await User.countDocuments({username: regex})

    res.json({data: response, pages: Math.ceil(Math.max(responsecount/resultsPerPage, 1))})
});

router.get(['/users/:userid/canmanage/:gameid','//users/:userid/canmanage/:gameid'], async (req, res) => {

    const user = await User.findOne({userid: req.params.userid})/*.lean()*/
    if (!user) {
        return res.json({"Success":false,"CanManage":false})
    }
    
    const game = await games.findOne({idofgame: req.params.gameid}).lean()
    if (!game) {
        return res.json({"Success":false,"CanManage":false})
    }

    if (game.useridofowner === user.userid || user.userid === 0 || user.userid === 18){
        return res.json({"Success":true,"CanManage":true})
    }

    return res.json({"Success":true,"CanManage":false})
});

module.exports = router