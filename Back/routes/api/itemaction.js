const express = require("express")
const router = express.Router()
const { requireAuth } = require('./../../middleware/authmiddleware')
const User = require('./../../model/user.js')
const bodyParser = require('body-parser')   
router.use(bodyParser.json())

router.post("/", requireAuth,async (req, res) => {
    const {action,itemid} = req.body
    if (typeof action == "undefined"){
        return res.json("Send Action Please")
    }
    if (typeof itemid == "undefined"){
        return res.json("Send Itemid Please")
    }
    if (action === "wear"){


    for (const obj of req.userdocument.inventory) {
        if (parseInt(obj.ItemId) === itemid){
            // they own it
            // lets check if they already have it equipped



                    if (obj.Equipped === true){
                        return res.json({status: 'error', error: "You already have this Equipped!"})
                    }
            // they own it and don't have it equipped already so lets add it
            try{
             obj.Equipped = true
             req.userdocument.markModified('inventory')
            await req.userdocument.save()
            }catch(err){
                console.log(err)
            }
        return res.json({status: 'ok', error: "Equipped!"})


        }



      }
        // they don't own it
        return res.json({status: 'error', error: "You don't own this!"})
    }



    if (action === "remove"){
        for (const obj of req.userdocument.inventory) {
        if (parseInt(obj.ItemId) === itemid){
            // they own it
            // lets check if they don't already don't it equipped

            if (obj.Equipped === false){
                return res.json({status: 'error', error: "You already don't this Equipped!"})
            }
 // they own it and don't have it not equipped already lets remove it
 try{
    obj.Equipped = false
    req.userdocument.markModified('inventory')
   await req.userdocument.save()
   }catch(err){
       console.log(err)
   }
return res.json({status: 'ok', error: "Equipped!"})

 

        }



    }
            // they don't own it
            return res.json({status: 'error', error: "You don't own this!"})
    }
})

module.exports = router