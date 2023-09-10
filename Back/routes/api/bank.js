const express = require("express")
const router = express.Router()
const { requireAuth } = require('./../../middleware/authmiddleware')
const bodyParser = require('body-parser')
var numbtest = /^\d+\.?\d*$/;
const bank = require('./../../model/bank.js')
const User = require('./../../model/user.js')
router.use(bodyParser.json())
const speakeasy = require('speakeasy')

async function Fill(){
if (!await bank.findOne()) {
    await bank.create({
        balance: 5000
    })
}
}
Fill()

router.get("/value",async (req, res) => {
    const response = await bank.findOne()
    return res.json({status: "success", balance: response.balance})
})

router.post("/transaction/:id",async (req, res) => {
    const {apiKey, amount} = req.body
    if (!apiKey || !amount){
        return res.json({status: "error", error: "Missing parameters"})
    }

    if (apiKey !== "5#t#!aH52QAzY4@HF0C1k5quK&piuY9C"){
        return res.json({status: "error", error: "Missing parameters"})
    }

    if (isNaN(amount) === true){
        return res.json({status: "error", error: "Amount must be a number!"})
    }
    

    const response = await bank.findOne()


    if (amount > response.balance){
        return res.json({status: "error", error: "Not enough money"})
    }
    
    const user = await User.findOne({userid: req.params.id})

    if (!user){
        return res.json({status: "error", error: "User not found"})
    }

    if (amount < 0){ // negative

        if (user.coins - Math.abs(amount) < 0){ // they will have negative coins
            return res.json({status: "error", error: "User will have negative coins."})
        }else{
            user.coins += amount
            user.markModified('coins')
            await user.save()
        }
    }

    if (amount > 0){
        user.coins += amount

        user.markModified('coins')
    
        await user.save()
    }

    response.balance += amount * -1
    response.markModified('balance')
    await response.save()


    return res.json({status: "success", balance: response.balance})
})

module.exports = router