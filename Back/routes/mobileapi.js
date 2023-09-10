const express = require("express")
const router = express.Router()

router.get('/check-app-version',async (req, res) => {
    return res.json({Response: {"data":{"UpgradeAction":"NotRequired"}}})
})

router.post('/login',async (req, res) => {
    return res.json({
        "Status":"OK",
        "UserInfo": {
            "UserName":"meteorite",
            "RobuxBalance":"69420",
            "TicketsBalance":"69420",
            "IsAnyBuildersClubMember":false,
            "ThumbnailUrl":"http://www.mete0r.xyz/",
            "UserID":1
        }
        })
})



router.get('/userinfo',async (req, res) => {
    return res.json({
        "Status":"OK",
        "UserInfo": {
            "UserName":"meteorite",
            "RobuxBalance":"69420",
            "TicketsBalance":"69420",
            "IsAnyBuildersClubMember":false,
            "ThumbnailUrl":"http://www.mete0r.xyz/",
            "UserID":1
        }
        })
})

router.all('/logout',async (req, res) => {
    res.cookie('jwt', "", {SameSite: "Strict",maxAge: 1 })
    res.cookie('.ROBLOSECURITY', "", {SameSite: "Strict",maxAge: 1 })
    return res.json({})
})

module.exports = router