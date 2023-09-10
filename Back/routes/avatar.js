const express = require("express")
const router = express.Router()
const { requireAuth } = require('./../middleware/authmiddleware')
const User = require('./../model/user.js')

router.post("/updateavatartype", requireAuth,async (req, res) => {
  let newavatartype
  if (req.userdocument?.avatartype === "R15"){
    newavatartype = "R6"
  }else{
    newavatartype = "R15"
  }
  req.userdocument.avatartype = newavatartype
  req.userdocument.markModified('avatartype')
  await req.userdocument.save()
  return res.json({status: "success", message: "Done!"})

})

module.exports = router