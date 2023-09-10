const jwt = require('jsonwebtoken')
require('dotenv').config()
const JWT_SECRET = process.env.JWT_SECRET
const atob = require("atob");
const model = require("./../model/user.js")
// exactly the same as normal authimddleware but uses req.query instead of cookies for our client
const requireAuth = (req,res,next) => {
    let token = req.query.auth
        if (req.cookies && req.headers?.['user-agent'] != "Roblox/WinInet") { // Mobile
            if (req.cookies.jwt) {
                token = req.cookies.jwt
            }
        }
        if (req.headers['roblox-session-id']) { // TeleportService
            token = req.headers['roblox-session-id']
        }
        if (req.headers?.['user-agent']?.includes("Android") === true || req.headers?.['user-agent']?.includes("iPhone") === true){
            console.log(token)
            console.log(req.headers)
        }
    //console.log(req.headers)

    
        


    if (!token) {
        return res.status(405).end()
    }


    jwt.verify(token,JWT_SECRET, (err,decodedtoken) => {
        if (err){
            res.cookie('jwt', "", {SameSite: "Strict",maxAge: 1 })
            return res.status(405)
        }else{
            var tokendata = decodedtoken
            var name = tokendata.userid
           try {
            model.findOne({userid: name}, function(err, doc) {
                req.numberofcoins = doc.coins
                req.tokenData = tokendata
                req.userdocument = doc
                moderationstatus = JSON.parse(doc.moderation)
                if (moderationstatus.status !== "ok") {
                    // if they are moderated then we invalidate the cookie and proceed
                    //res.cookie('jwt', "", {SameSite: "Strict",maxAge: 1 })
                    //return res.send("You have been moderated for "+moderationstatus.Reason+" expires at"+moderationstatus.ExpiresIn+" Moderated by "+moderationstatus.BannedBy )
                    var date = Date.parse(moderationstatus.ExpiresIn)
                    var datetime = new Date();
                    var datetime2 = Date.parse(datetime)
                    /*if (date <= datetime2){
                        // they have served there time

                            model.updateOne({userid: doc.userid}, {
                                $set: {
                                    moderation: JSON.stringify({"status":"ok","Reason":"none","ExpiresIn":"none", "BannedBy": "none"})
                                }
                            }, 
                            function(err, doc) {
                              //console.log(err)
                            })
                            
                            
                    }*/
                    return res.json({status: "error", error:"Moderated", moderationstatus})
                }
                next()
            })/*.lean() rip*/} 
            catch (error) {
                console.error(error);
              }
            
        }

    })
}

module.exports = {requireAuth}