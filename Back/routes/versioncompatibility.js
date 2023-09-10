const express = require("express")
const router = express.Router()

//router.get("/GetAllowedSecurityVersions", async (req, res) => {
//    res.json({"data":["0.384.0macplayer","0.384.0pcplayer","0.226.0win10player","INTERNALiosapp"]})
//})

//router.get("/GetAllowedMD5Hashes", async (req, res) => {
//    res.json({"data":["37e2512ce73ced8ad0ff72fa6a711dd0"]})
//})

router.get("/universes/validate-place-join", async (req, res) => {
    res.send("true")
})

module.exports = router