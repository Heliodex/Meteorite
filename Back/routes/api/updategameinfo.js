const express = require("express")
const router = express.Router()
const bodyParser = require('body-parser')
const rcc = require('./../../model/rcc.js')
const rcc2018 = require('./../../model/rcc2018.js')
const rcc2020 = require('./../../model/rcc2020.js')
const games = require('./../../model/games.js')
const rcctalk = require('./../../rcctalk')
const rcctalk2018 = require('./../../rcctalk2018')
const User = require('../../model/user.js')
router.use(bodyParser.json())
require('dotenv').config()
const RCC_HOST = process.env.RCC_HOST

router.post("/api/updategameinfo", async (req, res) => {
    var ip = req.headers['cf-connecting-ip'] || req.socket.remoteAddress 
    if (ip == RCC_HOST || ip == "::ffff:"+RCC_HOST) {
        const {game,players} = req.body
        //const instance = await rcc.findOne({PlaceId: game}).lean()

        games.updateOne({idofgame: game}, {
            $set: {
                numberofplayers: parseInt(players).toString()
            }
        }, 
        function(err, doc) {
          //console.log(err)
        })

        res.send("good")
    }
})

router.all(["/api/updategameinfo/updatevisits","/game/placevisit.ashx"], async (req, res) => {
    var ip = req.headers['cf-connecting-ip'] || req.socket.remoteAddress 
    if (ip == RCC_HOST || ip == "::ffff:"+RCC_HOST) {
        let {game} = req.body
        if (req.query.AssociatedPlaceID){
            game = req.query.AssociatedPlaceID
        }
        //const instance = await rcc.findOne({PlaceId: game}).lean()

        games.updateOne({idofgame: game}, {
            $inc: {
                visits: 1
            }
        }, 
        function(err, doc) {
          //console.log(err)
        })

        res.send("good")
    }
})

router.all("/api/updategameinfo/gameloaded", async (req, res) => {
    var ip = req.headers['cf-connecting-ip'] || req.socket.remoteAddress 
    if (ip == RCC_HOST || ip == "::ffff:"+RCC_HOST) {
        let {game} = req.body
        const gamedoc = await games.findOne({idofgame: game}).lean()
        if (gamedoc.version === "2020"){

            rcc2020.updateOne({PlaceId: game}, {
                $set: {
                    Status: 2
                }
            }, 
            function(err, doc) {
              //console.log(err)
            })

        }
        if (gamedoc.version === "2018"){

            rcc2018.updateOne({PlaceId: game}, {
                $set: {
                    Status: 2
                }
            }, 
            function(err, doc) {
              //console.log(err)
            })

        }
        if (gamedoc.version === "2016"){

            rcc.updateOne({PlaceId: game}, {
                $set: {
                    Status: 2
                }
            }, 
            function(err, doc) {
              //console.log(err)
            })

        }


        res.send("good")
    }
})


router.post("/api/updategameinfo/closejob", async (req, res) => {
    var ip = req.headers['cf-connecting-ip'] || req.socket.remoteAddress 
    if (ip == RCC_HOST || ip == "::ffff:"+RCC_HOST) {
        console.log("closed")
        let {game} = req.body
        if(typeof game === 'string'){
            game = game.replace('game','')
        }
        //const instance = await rcc.findOne({PlaceId: game}).lean()
        games.updateOne({idofgame: game}, {
            $set: {
                numberofplayers: "0"
            }
        }, 
        function(err, doc) {
          //console.log(err)
        })
        games.updateOne({idofgame: game}, {
            $set: {
                players: []
            }
        }, 
        function(err, doc) {
          //console.log(err)
        })
        const gamedoc = await games.findOne({idofgame: game}).lean()
        try{
            if (gamedoc.version === "2018"){
                await rcc2018.deleteOne({PlaceId: game})
                rcctalk2018.CloseJob("game"+game)
            }
        }catch{}
        try{
            if (gamedoc.version === "2020"){
                await rcc2020.deleteOne({PlaceId: game})
                rcctalk2018.CloseJob("game"+game)
            }
        }catch{}
        try{
            if (gamedoc.version === "2016"){
                await rcc.deleteOne({PlaceId: game})
            
                rcctalk.CloseJob("game"+game) 
            }
        }catch{}

res.send("good")
    }
})

router.get("/api/updategameinfo/closealljobs", async (req, res) => {
    var ip = req.headers['cf-connecting-ip'] || req.socket.remoteAddress 
    if (ip == RCC_HOST || ip == "::ffff:"+RCC_HOST) {
        console.log("closed all")
        //const instance = await rcc.findOne({PlaceId: game}).lean()

        await rcc.deleteMany({})
        games.updateMany({version: "2016"}, {
            $set: {
                numberofplayers: "0"
            }
        }, 
        function(err, doc) {
          //console.log(err)
        })
        games.updateMany({version: "2016"}, {
            $set: {
                players: []
            }
        }, 
        function(err, doc) {
          //console.log(err)
        })
        rcctalk.CloseAllJobs()
res.send("good")
    }
})

router.all(["/api/updategameinfo/updatepresence"], async (req, res) => {
    var ip = req.headers['cf-connecting-ip'] || req.socket.remoteAddress 
    if (ip == RCC_HOST || ip == "::ffff:"+RCC_HOST) {
        let {game,player,name,action} = req.body
        game = await games.findOne({idofgame: game})
        if (action === "joining" || action === "connect"){
            const updatedcount = parseFloat(game.numberofplayers)+1
            games.updateOne({idofgame: game.idofgame}, {
                $push: {
                    players: {userid: player, name: name}
                },
                $set: {
                    numberofplayers: updatedcount.toString()
                }
            }, 
            function(err, doc) {
              //console.log(err)
            })
            User.updateOne({userid: player}, {
                $set: {
                    status: JSON.stringify({status: "Playing "+game.nameofgame,id: game.idofgame})
                },
                $addToSet: {
                    recentlyplayed: {id: game.idofgame}
                },
            }, 
            function(err, doc) {
              //console.log(err)
            })
            User.updateOne({userid: player}, {
                $set: {
                    status: JSON.stringify({status: "Playing "+game.nameofgame,id: game.idofgame})
                },
                $push: {
                    recentlyplayed: {$each: [], $slice: -10}// limit for recently played is 10 so slice anything older than that
                },
            }, 
            function(err, doc) {
              //console.log(err)
            })
            if (game.version === "2018" || game.version === "2020"){
                rcctalk2018.RenewLease("game"+game.idofgame,"69530318916789546987353800") // if someone joins we want to renew the lease so it doesn't expire
                // mostly just for stopping people from spamming urls and keeping games loaded
            }
            if (game.version === "2020"){ // 2020 doesn't do visits for some reason
                games.updateOne({idofgame: game.idofgame}, {
                    $inc: {
                        visits: 1
                    }
                }, 
                function(err, doc) {
                  //console.log(err)
                })
            }


        }

        if (action === "leaving"|| action === "disconnect"){
            const updatedcount = parseFloat(game.numberofplayers)-1
            games.updateOne({idofgame: game.idofgame}, {
                $pull: {
                    players: {userid: player, name: name}
                },
                $set: {
                    numberofplayers: updatedcount.toString()
                }
            }, 
            function(err, doc) {
              //console.log(err)
            })


            User.updateOne({userid: player}, {
                $set: {
                    status: JSON.stringify({status: "Offline"})
                }
            }, 
            function(err, doc) {
              //console.log(err)
            })
        }


res.send("good")
    }
})

module.exports = router