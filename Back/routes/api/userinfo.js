const express = require("express")
const router = express.Router()
const user = require("./../..//model/user.js")
const games = require("./../../model/games.js")
const RelativeTime = require("@yaireo/relative-time")
const relativeTime = new RelativeTime()
const bodyParser = require("body-parser")
router.use(bodyParser.json())

router.get("/:id", async (req, res) => {
	var id = req.params.id
	if (isNaN(parseFloat(id)) === true) {
		return res.json({ error: true })
	}
	const response = await user
		.findOne({ userid: id })
		.lean()
		.select("-inventory")

	if (!response) {
		return res.json({ error: true, message: "404" })
	}

	let status = { status: "Offline" }
	if (response.status) {
		status = JSON.parse(response.status)
	}
	const actualTimeMilliseconds = new Date().getTime()
	if (
		(response.timesincelastrequest &&
			actualTimeMilliseconds - response.timesincelastrequest >=
				60000 * 3 /*3 minutes*/ &&
			status &&
			status.status.includes("Playing") === false) ||
		(response.timesincelastrequest &&
			actualTimeMilliseconds - response.timesincelastrequest >=
				60000 * 3 /*3 minutes*/ &&
			!status)
	) {
		// been 3 minutes since last request mark as offline make sure we don't mark them offline while they are playing a game
		status.status = "Offline"
		response.status = JSON.stringify(status)
		status = JSON.parse(response.status)
	}
	if (
		(response.timesincelastrequest &&
			actualTimeMilliseconds - response.timesincelastrequest <=
				60000 * 3 /*3 minutes*/ &&
			status &&
			status.status.includes("Playing") === false) ||
		(response.timesincelastrequest &&
			actualTimeMilliseconds - response.timesincelastrequest <=
				60000 * 3 /*3 minutes*/ &&
			!status)
	) {
		status.status = "Online"
		response.status = JSON.stringify(status)
		status = JSON.parse(response.status)
	}

	return res.json({
		error: false,
		userinfo: {
			joindate: response.joindate,
			joindateepoch: new Date(response._id.getTimestamp()).getTime(),
			lastonline: relativeTime.from(
				new Date(response.timesincelastrequest),
			),
			lastonlineepoch: response.timesincelastrequest,
			coins: response.coins,
			username: response.username,
			userid: response.userid,
			friends: response.friends,
			admin: response.admin,
			discordid: response.discordid,
			membership: response.membership,
			bio: response.bio,
			status,
			followers: response.followers?.length,
			css: response.css,
			aboutme: response.aboutme,
		},
	})
})

router.post("/:id/inventory", async (req, res) => {
	var id = req.params.id
	const resultsPerPage = 5
	let page = req.body.page ?? 0
	if (page != 0) {
		page -= 1
	}
	let filter = req.body.filter ?? "Shirts"
	console.log(req.body)
	filter = filter.charAt(0).toUpperCase() + filter.slice(1)
	console.log(filter)
	let onlywearing = req.body.onlywearing ?? false
	if (isNaN(parseFloat(id)) === true) {
		return res.json({ error: true })
	}
	console.log(onlywearing)
	let response
	if (onlywearing === true) {
		response = await user.aggregate([
			{
				$match: {
					userid: parseInt(id),
				},
			},
			{
				$project: {
					inventory: 1,
				},
			},
			{
				$unwind: {
					path: "$inventory",
				},
			},
			{
				$match: {
					"inventory.Equipped": true,
				},
			},
			{
				$group: {
					_id: "$_id",
					inventory: {
						$push: "$inventory",
					},
				},
			},
		])
	} else {
		response = await user.aggregate([
			{
				$match: {
					userid: parseInt(id),
				},
			},
			{
				$project: {
					inventory: 1,
				},
			},
			{
				$unwind: {
					path: "$inventory",
				},
			},
			{
				$match: {
					"inventory.Type": filter,
				},
			},
			{
				$group: {
					_id: "$_id",
					inventory: {
						$push: "$inventory",
					},
				},
			},
			{
				$project: {
					inventory: {
						$slice: [
							"$inventory",
							parseFloat(page) * resultsPerPage,
							resultsPerPage,
						],
					},
				},
			},
		])
	}
	await user.populate(response, {
		path: "inventory.itemdata",
		select: "Name",
	})
	console.log(response?.[0]?.inventory?.length)
	if (!response[0]?.inventory) {
		return res.json({ error: false, inventory: [] })
	}
	if (onlywearing === true) {
		// we aren't gonna use pagination for equipped yet cause lazy and its only used on peoples profiles anyways
		return res.json({ error: false, inventory: response?.[0]?.inventory })
	}
	let responsecount
	if (onlywearing === true) {
		responsecount = (
			await user.aggregate([
				{ $match: { userid: parseInt(id) } },
				{ $project: { inventory: 1 } },
				{ $unwind: { path: "$inventory" } },
				{
					$match: {
						"inventory.Type": filter,
						"inventory.Equipped": onlywearing,
					},
				},
				{ $count: "inventory" },
			])
		)[0].inventory
	} else {
		responsecount = (
			await user.aggregate([
				{ $match: { userid: parseInt(id) } },
				{ $project: { inventory: 1 } },
				{ $unwind: { path: "$inventory" } },
				{ $match: { "inventory.Type": filter } },
				{ $count: "inventory" },
			])
		)[0].inventory
	}
	console.log(responsecount)
	//const responsecount = await user.aggregate([ { $match : { userid : id } },{$project: { count: { $size:"$inventory" }}}]) // alternative yea

	if (!response) {
		return res.json({ error: true, message: "404" })
	}

	return res.json({
		error: false,
		inventory: response?.[0]?.inventory,
		pages: Math.ceil(Math.max(responsecount / resultsPerPage, 1)),
	})
})

router.get("/:id/creations", async (req, res) => {
	var id = req.params.id
	if (isNaN(parseFloat(id)) === true) {
		return res.json({ error: true })
	}
	const response = await user.findOne({ userid: id }).lean()

	if (!response) {
		return res.status(404).json({ error: true, message: "Not found" })
	}

	const gameresponse = await games
		.find({ useridofowner: id })
		.lean()
		.select([
			"idofgame",
			"version",
			"nameofgame",
			"numberofplayers",
			"visits",
			"useridofowner",
		])

	return res.json(gameresponse)
})

router.get("/:id/visits", async (req, res) => {
	var id = req.params.id
	if (isNaN(parseFloat(id)) === true) {
		return res.json({ error: true })
	}
	const response = await user.findOne({ userid: id }).lean()

	if (!response) {
		return res.status(404).json({ error: true, message: "Not found" })
	}

	const visits = await games.aggregate([
		{ $match: { useridofowner: parseFloat(id) } },
		{
			$group: {
				_id: null,
				visits: {
					$sum: "$visits",
				},
			},
		},
	])

	return res.json({ error: false, visits: visits[0]?.visits || 0 })
})

router.get("/usernametoid/:id", async (req, res) => {
	var id = req.params.id

	const response = await user
		.findOne({ username: { $regex: id, $options: "i" } })
		.lean()

	if (!response) {
		console.log(response)
		return res.json({ error: true })
	}

	return res.json({ error: false, userid: response.userid })
})

router.get("/discordidtouserid/:id", async (req, res) => {
	var id = req.params.id

	const response = await user.findOne({ discordid: id }).lean()

	if (!response) {
		console.log(response)
		return res.json({ error: true })
	}

	return res.json({ error: false, userid: response.userid })
})

module.exports = router
