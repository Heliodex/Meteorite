const express = require("express")
const router = express.Router()
const { requireAuth } = require("./../middleware/authmiddleware")
const User = require("./../model/item.js")
const bodyParser = require("body-parser")
router.use(bodyParser.json())
const xss = require("xss")

router.post("/fetch", async (req, res) => {
	const resultsPerPage = 30
	let page = req.body.page ?? 0
	if (page != 0) {
		page -= 1
	}
	let { filter, sort } = req.body
	let libraryassets = ["User Ad", "Gamepass", "Video"] // we don't want to include these in the catalog
	//console.log(req.body)
	try {
		if (filter === "Best Selling") {
			if (sort != "All") {
				response = await User.find({
					Type: sort,
					Hidden: { $exists: false },
				})
					.limit(resultsPerPage)
					.skip(0 + parseFloat(page) * resultsPerPage)
					.sort({ Sales: "descending" })
					.lean()
					.select(["-_id"])
				responsecount = await User.countDocuments({
					Type: sort,
					Hidden: { $exists: false },
				})
			}
			if (sort === "All") {
				response = await User.find({
					Hidden: { $exists: false },
					Type: { $nin: libraryassets },
				})
					.limit(resultsPerPage)
					.skip(0 + parseFloat(page) * resultsPerPage)
					.sort({ Sales: "descending" })
					.lean()
					.select(["-_id"])
				responsecount = await User.countDocuments({
					Hidden: { $exists: false },
					Type: { $nin: libraryassets },
				})
			}
		} else {
			if (sort != "All") {
				response = await User.find({
					Type: sort,
					Hidden: { $exists: false },
				})
					.limit(resultsPerPage)
					.skip(0 + parseFloat(page) * resultsPerPage)
					.lean()
					.select(["-_id"])
				responsecount = await User.countDocuments({
					Type: sort,
					Hidden: { $exists: false },
				})
			}
			if (sort === "All") {
				response = await User.find({
					Hidden: { $exists: false },
					Type: { $nin: libraryassets },
				})
					.limit(resultsPerPage)
					.skip(0 + parseFloat(page) * resultsPerPage)
					.lean()
					.select(["-_id"])
				responsecount = await User.countDocuments({
					Hidden: { $exists: false },
					Type: { $nin: libraryassets },
				})
			}
		}

		//console.log(response.length)
		res.json({
			data: response,
			pages: Math.ceil(Math.max(responsecount / resultsPerPage, 1)),
		})
	} catch (error) {
		res.json({ status: "error", error: "idk" })
	}
})

router.get("/iteminfo/:id", async (req, res) => {
	var id = req.params.id

	if (isNaN(parseInt(id)) === true) {
		return res.json({ status: "error", error: "Must be number" })
	}
	const response = await User.findOne({ ItemId: id }).lean()

	if (!response) {
		return res.json({ status: "error", error: "Not found" })
	}
	return res.json({ error: false, iteminfo: response })
})

router.post("/iteminfo/:id/configure", requireAuth, async (req, res) => {
	var id = req.params.id

	let { name, description, price } = req.body

	if (
		typeof name === "undefined" &&
		typeof description === "undefined" &&
		typeof price === "undefined"
	) {
		return res.json({ status: "error", error: "Nothing to update" })
	}

	if (isNaN(parseInt(id)) === true) {
		return res.json({ status: "error", error: "Must be number" })
	}
	const response = await User.findOne({ ItemId: parseInt(id) })

	if (!response) {
		return res.json({ status: "error", error: "Not found" })
	}

	if (
		response.Creator !== req.userdocument.userid &&
		req.userdocument.admin === false
	) {
		return res.status(401).json({ status: "error", error: "Unauthorized!" })
	}
	let save = false

	if (price && price != null) {
		if (isNaN(parseInt(price)) === true) {
			return res.json({ status: "error", error: "Must be number" })
		}
		price = parseInt(price)
		if (price < 5 && response.Type != "Gamepass") {
			return res.json({
				status: "error",
				error: "Minimum price is 5 rocks.",
			})
		} else if (price < 1 && response.Type === "Gamepass") {
			return res.json({
				status: "error",
				error: "Minimum price is 1 rock.",
			})
		}

		response.Price = price
		response.markModified("Price")
		save = true
	}

	if (description && description != "") {
		response.Description = xss(description)
		response.markModified("Description")
		save = true
	}

	if (name && name != "") {
		response.Name = xss(name)
		response.markModified("Name")
		save = true
	}

	if (save === true) {
		await response.save()
	}
	console.log(name, description, price)

	return res.json({ status: "success", message: "Item updated!" })
})

router.post("/search", async (req, res) => {
	const resultsPerPage = 30
	let page = req.body.page ?? 0
	if (page != 0) {
		page -= 1
	}
	let { filter, sort, searchquery } = req.body
	function escapeRegex(text) {
		return text?.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
	}
	const regex = new RegExp(escapeRegex(searchquery), "gi")
	//console.log(req.body)
	try {
		if (filter === "Best Selling") {
			if (sort != "All") {
				response = await User.find({
					Name: regex,
					Type: sort,
					Hidden: { $exists: false },
				})
					.limit(resultsPerPage)
					.skip(0 + parseFloat(page) * resultsPerPage)
					.sort({ Sales: "descending" })
					.lean()
					.select(["-_id"])
				responsecount = await User.countDocuments({
					Type: sort,
					Hidden: { $exists: false },
				})
			}
			if (sort === "All") {
				response = await User.find({
					Name: regex,
					Hidden: { $exists: false },
				})
					.limit(resultsPerPage)
					.skip(0 + parseFloat(page) * resultsPerPage)
					.sort({ Sales: "descending" })
					.lean()
					.select(["-_id"])
				responsecount = await User.countDocuments({
					Hidden: { $exists: false },
				})
			}
		} else {
			if (sort != "All") {
				response = await User.find({
					Name: regex,
					Type: sort,
					Hidden: { $exists: false },
				})
					.limit(resultsPerPage)
					.skip(0 + parseFloat(page) * resultsPerPage)
					.lean()
					.select(["-_id"])
				responsecount = await User.countDocuments({
					Type: sort,
					Hidden: { $exists: false },
				})
			}
			if (sort === "All") {
				response = await User.find({
					Name: regex,
					Hidden: { $exists: false },
				})
					.limit(resultsPerPage)
					.skip(0 + parseFloat(page) * resultsPerPage)
					.lean()
					.select(["-_id"])
				responsecount = await User.countDocuments({
					Hidden: { $exists: false },
				})
			}
		}

		//console.log(response.length)
		res.json({
			data: response,
			pages: Math.ceil(Math.max(responsecount / resultsPerPage, 1)),
		})
	} catch (error) {
		res.json({ status: "error", error: "idk" })
	}
})

module.exports = router
