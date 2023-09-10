const express = require("express")
const router = express.Router()
const { requireAuth } = require('./../../middleware/authmiddleware')
const games = require('./../../model/games.js')
const bodyParser = require('body-parser')   
router.use(bodyParser.json())

router.post("/", requireAuth,async (req, res) => {
    const {gameid} = req.body
    if (typeof gameid == "undefined"){
        return res.json("Send gameid Please")
    }
    if (req.userdocument.admin == false) {
        return res.redirect('/')
    }
            try{
                games.updateOne({idofgame: gameid}, {
                    $set: {
                        featured: true
                    }
                }, 
                function(err, doc) {
                  //console.log(err)
                })
            }catch(err){
                console.log(err)
            }

        return res.json({status: 'ok'})

})

module.exports = router