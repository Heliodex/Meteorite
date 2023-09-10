const jwt = require('jsonwebtoken')
require('dotenv').config()
const JWT_SECRET = process.env.JWT_SECRET
const atob = require("atob");
const model = require("./../model/user.js")

const requireAuth = (req,res,next) => {
    if (!req.cookies && req.headers['authorization']) {
        return res.json({status: "error", error: "Unauthorized"})
    }
    let token = req.cookies.jwt??req.cookies['.ROBLOSECURITY']??req.headers['authorization']??req.headers['roblox-session-id']

    if (!token) {
        return res.status(401).json({status: "error", error: "Unauthorized"})
    }


    jwt.verify(token,JWT_SECRET, (err,decodedtoken) => {
        if (err){
            res.cookie('jwt', "", {SameSite: "Strict",maxAge: 1 })
            return res.status(401).json({status: "error", error: "Unauthorized"})
        }else{
            var tokendata = decodedtoken
            var name = tokendata.userid
           try {
            model.findOne({userid: name},async function(err, doc) {
                req.numberofcoins = doc.coins
                req.tokenData = tokendata
                req.userdocument = doc
                moderationstatus = JSON.parse(doc.moderation)
                const actualTimeMilliseconds = new Date().getTime()
                if (actualTimeMilliseconds - doc.timesincelastrequest >= 60000 * 1 || !doc.timesincelastrequest /*2 minutes make sure to update*/){
                    doc.timesincelastrequest = actualTimeMilliseconds
                    doc.markModified('timesincelastrequest')
                    await doc.save()
                }
                // check if they are eligble for daily login reward
                if (actualTimeMilliseconds - req.userdocument.lastclaimofcurrency > 86400000){ // 24 hours
                    req.userdocument.lastclaimofcurrency = actualTimeMilliseconds
                    if (req.userdocument.membership === "TurboBuildersClub"){
                        req.userdocument.coins += 90
                    }else if (req.userdocument.membership === "BuildersClub"){
                        req.userdocument.coins += 60
                    }else if (req.userdocument.membership === "OutrageousBuildersClub"){
                        req.userdocument.coins += 150
                    }
                    else{
                        req.userdocument.coins += 35
                    }
                    req.userdocument.markModified('coins')
                    req.userdocument.markModified('lastclaimofcurrency')
                   await req.userdocument.save()
                }

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
                            return next()
                            
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