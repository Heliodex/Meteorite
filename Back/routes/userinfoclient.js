const express = require("express")
const router = express.Router()
const User = require('./../model/user.js')
var bodyParser = require('body-parser');
router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
router.use(bodyParser.text()); // support encoded bodies
const JWT_SECRET = process.env.JWT_SECRET
const jwt = require('jsonwebtoken')
const jwtverify = (req,res,next) => {
    jwt.verify(req.headers['roblox-session-id'],JWT_SECRET, (err,decodedtoken) => {
        if (err){
            return res.status(403).end()
        }else{
            var tokendata = decodedtoken
            var name = tokendata.username
           try {
            User.findOne({username: new RegExp('^'+name+'$', "i")}, function(err, doc) {

                req.userdocument = doc
                next()

            })/*.lean()*/} 
            catch (error) {
                console.error(error);
              }
            
        }

    })
    
};


// below is follow code
router.get("/user/following-exists",async (req, res) => {
    //console.log("My userid"+req.query.userId)
    //console.log("their userid"+req.query.followerUserId)
    const user = await User.findOne({userid: req.query.userId}).lean()
    if(!user){
        return res.json({isFollowing:"false"})
    }
    if (!user.followers){
        return res.json({isFollowing:"false"})
    }

    const follower = user.followers.some(word => word.userid == req.query.followerUserId )

    if (follower === false){
        return res.json({isFollowing:"false"})
    }

    res.json({success:"true",isFollowing:"true"})
})

router.post("/user/follow",jwtverify,async (req, res) => {
    const tofollow = req.body.followedUserId
    if (!tofollow){
        return res.json({isFollowing:"false"})
    }
    let follower = false
    if (req.userdocument.followers){
        follower = req.userdocument.followers.some(word => word.userid == req.query.followerUserId )
    }


    if (follower === true){
        // already following
        res.json({success:"true",isFollowing:"true"})
    }


    User.updateOne({userid: tofollow}, {
        $push: {
            followers: {userid: req.userdocument.userid, username: req.userdocument.username}
        }
    }, 
    function(err, doc) {
      //console.log(err)
    })

    res.json({success:"true",isFollowing:"true"})
    


})

router.post("/user/unfollow",jwtverify,async (req, res) => {
    const tofollow = req.body.followedUserId
    if (!tofollow){
        return res.json({isFollowing:"false"})
    }


    User.updateOne({userid: tofollow}, {
        $pull: {
            followers: {userid: req.userdocument.userid, username: req.userdocument.username}
        }
    }, 
    function(err, doc) {
      //console.log(err)
    })

    res.json({success:"true",isFollowing:"false"})
    


})

//below is friend code

router.get("/user/get-friendship-count",async (req, res) => {
    // this is used to limit friends on the client but since we won't have friends limits we can leave it here
    res.json({success:"true",count:1})
})

router.post("/user/request-friendship",jwtverify,async (req, res) => {
    const tofriend = req.query.recipientUserId

    if (!tofriend){
        return res.json({isFollowing:"false"})
    }
    
    const usertofriend = await User.findOne({userid: tofriend}).lean()
    if (!usertofriend){
        return res.json({success:"true",isFollowing:"true"})
    }


    if (usertofriend.friends){
        const friends = usertofriend.friends.some(word => word.userid == req.userdocument.userid)
        if (friends === true){

            return res.json({success:"true",isFollowing:"true"})
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

            return res.json({success:"true",isFollowing:"true"})
        }

        }
    if (usertofriend.friendrequests){
        const alreadyrequested = usertofriend.friendrequests.some(word => word.userid == req.userdocument.userid)

        // already friend requested
        if (alreadyrequested === true){

            return res.json({success:"true",isFollowing:"true"})
        }
    }

    User.updateOne({userid: usertofriend.userid}, {
        $push: {
            friendrequests: {userid: req.userdocument.userid, username: req.userdocument.username}
        }
    }, 
    function(err, doc) {

    })

    res.json({success:"true",isFollowing:"true"})
    


})

router.post("/user/decline-friend-request",jwtverify,async (req, res) => {
    const tounfriend = req.query.requesterUserId
    //console.log(tounfriend+" nerd")
    if (!tounfriend){
        return res.json({isFollowing:"false"})
    }
    const usertofriend = await User.findOne({userid: tounfriend}).lean()
    if (!usertofriend){
        return res.json({success:"true",isFollowing:"true"})
    }
    
    const alreadyfriends = req.userdocument.friends.some(word => word.userid == tounfriend )
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
        return res.json({success:"true",isFollowing:"true"})
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

    res.json({success:"true",isFollowing:"true"})
    


})

module.exports = router