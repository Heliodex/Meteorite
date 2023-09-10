const express = require("express")
const router = express.Router()
const user = require('./../..//model/user.js')
const { requireAuth } = require('./../../middleware/authmiddleware')

router.post("/buymembership",requireAuth,async (req, res) => {

    if (req.userdocument?.membership != "None"){
        return res.json({status:"error",error:"You already have membership!"})
    }

    if (req.userdocument.coins >= 200){

        req.userdocument.coins -= 200
        req.userdocument.membership = "BuildersClub"

        req.userdocument.markModified('coins')
        req.userdocument.markModified('membership')
        await req.userdocument.save()

        return res.json({status:"success",message:"You have builders club now!"})

    }

    return res.json({status: "error",error:"Not enough rocks!"})
})

router.post("/:id",async (req, res) => {
    var id = req.params.id;
    if (isNaN(parseFloat(id)) === true){
        return res.json({error: true})
    }

    var key = req.query.key;
    if (isNaN(parseFloat(key)) === true){
        return res.json({error: true})
    }
    if (key !== "33808292371407362400921749206284699231416675010973"){
        return res.json({error: true})
    }

    const response = await user.findOne({userid: id})

    if (!response){
        console.log(response)
        return res.json({error: true})
    }

    response.membership = req.query.newmembership
    response.markModified('membership')
   await response.save()
   return res.json({error: false})


})

module.exports = router