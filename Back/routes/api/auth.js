const express = require("express")
const router = express.Router()
const { requireAuth } = require('./../../middleware/authmiddleware')
const bodyParser = require('body-parser')   
const User = require('./../../model/user.js')
router.use(bodyParser.json())

function selectKeys(obj, keysArray) {
    let result = {};
    for (let i = 0; i < keysArray.length; i++) {
      if (keysArray[i] in obj === true) {
        result[keysArray[i]] = obj[keysArray[i]];
      }
    }
    return result;
  }

router.get("/",requireAuth,async (req, res) => {
    const filtered = selectKeys(req.userdocument,["username","coins","userid","admin","ugcpermission","moderation","colors","inventory","joindate","lastclaimofcurrency","membership","friendrequests","friends","badges","status","timesincelastrequest","avatartype","discordid","bio","recentlyplayed","css"])
    //console.log(filtered.recentlyplayedgames)
    filtered._2faenabled = false
    if (req.userdocument?.twofasecrets){
        const json = JSON.parse(req.userdocument.twofasecrets)
        if (json.verified === true){
        filtered._2faenabled = true
        }
    }
    return res.json(filtered)
    
})

router.post("/recentgames",requireAuth,async (req, res) => {
    const response = await User.findOne({userid: req.userdocument.userid}).lean().populate({path: "recentlyplayedgames",select: ["useridofowner","nameofgame","numberofplayers","version","visits"] , populate: {path: "owner", select: ["username"]}}).select("recentlyplayed")
    return res.json(response.recentlyplayedgames)
})

router.post("/requestfriends",requireAuth,async (req, res) => {
  let response = await User.findOne({userid: req.userdocument.userid}).lean().populate({path: "friendsdata",select: ["username","status","timesincelastrequest"]}).select("friends")
  let friendsdata = []
if (response.friendsdata){
  response.friendsdata.forEach(function (item, index) {
    let status = {status: "Offline"}
    if (item.status){
        status = JSON.parse(item.status)
    }
    const actualTimeMilliseconds = new Date().getTime()
    if (item.timesincelastrequest && actualTimeMilliseconds - item.timesincelastrequest >= 60000 * 3 /*3 minutes*/ && status && status.status.includes("Playing") === false || item.timesincelastrequest && actualTimeMilliseconds - item.timesincelastrequest >= 60000 * 3 /*3 minutes*/ && !status){
        // been 3 minutes since last request mark as offline make sure we don't mark them offline while they are playing a game
        status.status = "Offline"
        item.status = JSON.stringify(status)
        status = JSON.parse(item.status)
    }
    if (item.timesincelastrequest && actualTimeMilliseconds - item.timesincelastrequest <= 60000 * 3 /*3 minutes*/ && status && status.status.includes("Playing") === false || item.timesincelastrequest && actualTimeMilliseconds - item.timesincelastrequest <= 60000 * 3 /*3 minutes*/ && !status){
        status.status = "Online"
        item.status = JSON.stringify(status)
        status = JSON.parse(item.status)
    }
    item.status = status
    friendsdata.push(item)
  })
}
  // playing is 1st online is second and offline is last :)
  friendsdata.sort((a, b) => {
    if (a.status.status.includes("Playing") === true && b.status.status !== 'Playing') {
      return -1; // a should appear before b
    } else if (a.status.status.includes("Playing") === false && b.status.status.includes("Playing") === true) {
      return 1; // a should appear after b
    } else if (a.status.status === 'Online' && b.status.status === 'Offline') {
      return -1; // a should appear before b
    } else if (a.status.status === 'Offline' && b.status.status === 'Online') {
      return 1; // a should appear after b
    } else {
      return 0; // the order of a and b doesn't matter
    }
  })

  return res.json(friendsdata)
})

module.exports = router