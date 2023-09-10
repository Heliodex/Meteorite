const jwt = require('jsonwebtoken')
require('dotenv').config()
const JWT_SECRET = process.env.JWT_SECRET
const atob = require("atob");
const model = require("./../model/user.js")

const grabAuth = (req,res,next) => {
    if (!req.cookies && req.headers['authorization']) {
        return next()
    }
    const token = req.cookies.jwt??req.cookies['.ROBLOSECURITY']??req.headers['authorization']

    if (!token) {
        return next()
    }

    jwt.verify(token,JWT_SECRET, (err,decodedtoken) => {
        if (err){
            next()
        }else{
            var tokendata = decodedtoken
            var name = tokendata.username
           try {
            model.findOne({username: new RegExp('^'+name+'$', "i")}, function(err, doc) {
                req.numberofcoins = doc.coins
                req.admin = doc.admin
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
                    if (date <= datetime2){
                        // they have served there time

                            model.updateOne({userid: doc.userid}, {
                                $set: {
                                    moderation: JSON.stringify({"status":"ok","Reason":"none","ExpiresIn":"none", "BannedBy": "none"})
                                }
                            }, 
                            function(err, doc) {
                              //console.log(err)
                            })
                            
                            
                    }
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

module.exports = {grabAuth}