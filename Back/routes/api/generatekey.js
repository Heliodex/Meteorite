const express = require("express")
const router = express.Router()
const { requireAuth } = require('./../../middleware/authmiddleware')
const bodyParser = require('body-parser')   
const keys = require('./../../model/keys.js')
router.use(bodyParser.json())

// hay this code hasn't been updated so it contains very old code because I haven't bothered to add key support since the last time they existed 2 months ago?

function stringGen(len) {
    var text = "";
    
    var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    
    for (var i = 0; i < len; i++)
      text += charset.charAt(Math.floor(Math.random() * charset.length));
    
    return text;
  }

router.post("/",requireAuth,async (req, res) => {
  if (req.userdocument.admin === true){
    var key = stringGen(10)
    const response =  await keys.create({
     Creator: req.userdocument.username,
     Key: key,
     Used: false
 })
 return res.redirect(req.get('referer'));
  }
   if (req.userdocument.coins >= 100){
    // they have enough
    req.userdocument.coins -= 100
    req.userdocument.markModified('coins')
   await req.userdocument.save()
   var key = stringGen(10)
   const response =  await keys.create({
    Creator: req.userdocument.username,
    Key: key,
    Used: false
})
return res.redirect(req.get('referer'));

   }

    return res.redirect(req.get('referer'));
})

module.exports = router