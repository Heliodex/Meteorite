const express = require("express")
const router = express.Router()
const { requireAuth } = require("./../middleware/authmiddleware")
const bodyParser = require("body-parser")
router.use(bodyParser.json())

router.get("/welcome", requireAuth, async (req, res) => {
	res.send("test")
})

module.exports = router
