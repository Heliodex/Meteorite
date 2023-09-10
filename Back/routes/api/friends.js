const express = require("express")
const router = express.Router()
const { requireAuth } = require('./../../middleware/authmiddleware')
const games = require('./../../model/games.js')
const User = require('./../../model/user.js')
const bodyParser = require('body-parser')   
router.use(bodyParser.json())

router.post("/request-friendship", requireAuth,async (req, res) => {
    const tofriend = req.body.recipientUserId

    if (!tofriend){
        return res.json({status:"error",error:"Recipent not sent!"})
    }
    
    const usertofriend = await User.findOne({userid: tofriend}).lean()
    if (!usertofriend){
        return res.json({status:"error",error:"Can't find Recipent!"})
    }


    if (usertofriend.friends){
        const friends = usertofriend.friends.some(word => word.userid == req.userdocument.userid)
        if (friends === true){

            return res.json({status:"error",error:"You are already friends!"})
        }
        // already friends
    }
    if (req.userdocument.friendrequests){
        // check if the other user is already requesting to friend the player so then they both want to be firends so we can interperept this as an accept request
    
        const bothwantobefriends = req.userdocument.friendrequests.some(word => word.userid == usertofriend.userid)
        if (bothwantobefriends === true){
            console.log(tofriend)
            User.updateOne({userid: req.userdocument.userid}, {
                $push: {
                    friends: {userid: usertofriend.userid, username: usertofriend.username}
                },
                $pull: {
                    friendrequests: {userid: usertofriend.userid, username: usertofriend.username}
                }
            }, 
            function(err, doc) {
        
            })

            User.updateOne({userid: tofriend}, {
                $push: {
                    friends: {userid: req.userdocument.userid, username: req.userdocument.username}
                },
                $pull: {
                    friendrequests: {userid: req.userdocument.userid, username: req.userdocument.username}
                }
            }, 
            function(err, doc) {
        
            })

            return res.json({status:"success",message:"You are now friends :D"})
        }

        }
    if (usertofriend.friendrequests){
        const alreadyrequested = usertofriend.friendrequests.some(word => word.userid == req.userdocument.userid)

        // already friend requested
        if (alreadyrequested === true){

            return res.json({status:"error",error:"You already sent this request!"})
        }
    }
    User.updateOne({userid: usertofriend.userid}, {
        $push: {
            friendrequests: {userid: req.userdocument.userid, username: req.userdocument.username}
        }
    }, 
    function(err, doc) {

    })

    return res.json({status:"success",message:"Friend request sent!"})
    


})

router.post("/decline-friend-request",requireAuth,async (req, res) => {
    const tounfriend = req.body.recipientUserId
    //console.log(tounfriend+" nerd")
    if (!tounfriend){
        return res.json({status:"error",error:"Recipent not sent!"})
    }
    const usertofriend = await User.findOne({userid: tounfriend}).lean()
    if (!usertofriend){
        return res.json({status:"error",error:"Can't find Recipent!"})
    }
    
    const alreadyfriends = req.userdocument?.friends?.some(word => word.userid == tounfriend )
    if (alreadyfriends === true){
        // already friends with the person so they want ro remove their friend
        User.updateOne({userid: tounfriend}, {
            $pull: {
                friends: {userid: req.userdocument.userid, username: req.userdocument.username}
            }
        }, 
        function(err, doc) {
          //console.log(err)
        })
        User.updateOne({userid: req.userdocument.userid}, {
            $pull: {
                friends: {userid:usertofriend.userid, username: usertofriend.username}
            }
        }, 
        function(err, doc) {
          //console.log(err)
        })
        return res.json({status:"error",error:"Unfriended friend!"})
    }



    //otherwise the user isn't friends but still declines the friend request

    User.updateOne({userid: tounfriend}, {
        $pull: {
            friendrequests: {userid: req.userdocument.userid, username: req.userdocument.username}
        }
    }, 
    function(err, doc) {
      //console.log(err)
    })
    User.updateOne({userid: req.userdocument.userid}, {
        $pull: {
            friendrequests: {userid: usertofriend.userid, username: usertofriend.username}
        }
    }, 
    function(err, doc) {
      //console.log(err)
    })

    return res.json({status:"success",message:"Declined friend request!"})
    


})

router.post("/has-sent-request",requireAuth,async (req, res) => {
    const tofriend = req.body.recipientUserId

    if (!tofriend){
        return res.json({status:"error",error:"Recipent not sent!"})
    }
    
    const usertofriend = await User.findOne({userid: tofriend}).lean()
    if (!usertofriend){
        return res.json({status:"error",error:"Can't find Recipent!"})
    }

        const friends = usertofriend?.friends?.some(word => word.userid == req.userdocument.userid)
        if (friends === true){

            return res.json({status:"error",error:"You are already friends!"})
        }
        // already friends

        const alreadyrequested = usertofriend?.friendrequests?.some(word => word.userid == req.userdocument.userid)

        // already friend requested
        if (alreadyrequested === true){

            return res.json({status:"success",message:true})
        }

    const bothwantobefriends = req.userdocument?.friendrequests?.some(word => word.userid == usertofriend.userid)
        if (bothwantobefriends === true){
            return res.json({status:"success",message:"Other user wants to be friends."})
        }

    return res.json({status:"success",message:false})
})


router.post('/friend-requests',requireAuth, async (req, res) => {
    res.json({data: req.userdocument?.friendrequests})
});

module.exports = router