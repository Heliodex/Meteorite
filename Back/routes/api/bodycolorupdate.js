const express = require("express")
const router = express.Router()
const { requireAuth } = require('./../../middleware/authmiddleware')
const User = require('./../../model/user.js')
const bodyParser = require('body-parser')   
const validTypes = [
    'all',
    'Head',
    'Torso',
    'Left Arm',
    'Right Arm',
    'Left Leg',
    'Right Leg'
]
router.use(bodyParser.json())

router.post("/",requireAuth,async (req, res) => {
    const {Type,color} = req.body
    if (typeof Type == "undefined"){
        return res.json("Send Type Please")
    }
    if (typeof color == "undefined"){
        return res.json("Send Color Please")
    }
    if (!isNaN(color) === false){
        return res.json("Color needs to be a number lol")
    }
   if (validTypes.includes(Type) === true){
    try{
        for (const obj of req.userdocument.colors) {
            if (Type === "all"){
                obj.value = color
                req.userdocument.markModified('colors')
               await req.userdocument.save()
            }
            if (obj.name === Type){
                obj.value = color
                req.userdocument.markModified('colors')
               await req.userdocument.save()
            }
        }
    }catch(err){
        console.log(err)
    }
    return res.json({status: 'success', message: "Color change successful"})
   }
   // they tried to submit an invalid form
   return res.json({status: "error", error: "Invalid Type"})
})

module.exports = router