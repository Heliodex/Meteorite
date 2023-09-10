const express = require("express")
const router = express.Router()
const { requireAuth } = require('./../../middleware/authmiddleware')
const User = require('./../../model/user.js')
const bodyParser = require('body-parser')   
const bcrypt = require('bcrypt')
router.use(bodyParser.json())

router.post("/",requireAuth,async (req, res) => {
    const {oldpassword,newpassword} = req.body
    if (!oldpassword || typeof oldpassword !== 'string') {
        return res.json({status: 'error', error: 'Old password needs to be sent and it needs to be a string'})
    }
    if (!newpassword || typeof newpassword !== 'string') {
        return res.json({status: 'error', error: 'New password needs to be sent and it needs to be a string'})
    }

    if(newpassword.length < 4) {
        return res.json({status: 'error', error: 'Password needs to be at least 5 characters'})
    }
    if(await bcrypt.compare(oldpassword, req.userdocument.password)) {
        // password matches
        const newhashedpassword = (await bcrypt.hash(newpassword, 10))
        try{
            req.userdocument.password = newhashedpassword
            req.userdocument.markModified('password')
           await req.userdocument.save()
    
        }catch{
    
        }
        return res.json({status: 'success', message: 'Changed Password!'})
    }
    res.json({status: 'error', error: 'Invalid old password'})
})

module.exports = router