const express = require("express")
const router = express.Router()
const { requireAuth } = require('./../middleware/authmiddleware')
const User = require('./../model/item.js')
const bodyParser = require('body-parser')
router.use(bodyParser.json())

router.post("/fetch", async (req, res) => {
    const resultsPerPage = 30
    let page = req.body.page ?? 0
    if (page != 0){
        page-=1
    }
    let {filter, sort} = req.body
    //console.log(req.body)
    try{
            if (filter === "Best Selling"){
                if (sort != "All"){
                    response = await User.find({Type: sort,Hidden: {$exists:false}}).limit(resultsPerPage).skip(0+parseFloat(page)*resultsPerPage).sort({Sales: "descending"}).lean().select(['-_id'])
                    responsecount = await User.countDocuments({Type: sort, Hidden: {$exists:false}})
                }
                if (sort === "All"){
                    response = await User.find({Hidden: {$exists:false}, Type: { $ne: "User Ad" } }).limit(resultsPerPage).skip(0+parseFloat(page)*resultsPerPage).sort({Sales: "descending"}).lean().select(['-_id'])
                    responsecount = await User.countDocuments({Hidden: {$exists:false}, Type: { $ne: "User Ad" }})
                }
            }else{
                if (sort != "All"){
                response = await User.find({Type: sort, Hidden: {$exists:false}}).limit(resultsPerPage).skip(0+parseFloat(page)*resultsPerPage).lean().select(['-_id'])
                responsecount = await User.countDocuments({Type: sort, Hidden: {$exists:false}})
                }
                if (sort === "All"){
                    response = await User.find({Hidden: {$exists:false}, Type: { $ne: "User Ad" }}).limit(resultsPerPage).skip(0+parseFloat(page)*resultsPerPage).lean().select(['-_id'])
                    responsecount = await User.countDocuments({Hidden: {$exists:false}, Type: { $ne: "User Ad" }})
                }
            }
            
            //console.log(response.length)
            res.json({data: response, pages: Math.ceil(Math.max(responsecount/resultsPerPage, 1))})
    } catch (error) {
        res.json({status: "error", error:"idk"})
    }

})


router.get('/iteminfo/:id', async (req, res) => {
    var id = req.params.id;

    if (isNaN(parseFloat(id)) === true){
        return res.json({status: "error", error: "Must be number"})
    }
    const response = await User.findOne({ItemId: id}).lean()

    if (!response){
        return res.json({status: "error", error: "Not found"})
    }
    return res.json({error: false, iteminfo: response})

});

router.post("/search", async (req, res) => {
    const resultsPerPage = 30
    let page = req.body.page ?? 0
    if (page != 0){
        page-=1
    }
    let {filter, sort, searchquery} = req.body
    function escapeRegex(text) {
        return text?.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }
    const regex = new RegExp(escapeRegex(searchquery), 'gi');
    //console.log(req.body)
    try{
            if (filter === "Best Selling"){
                if (sort != "All"){
                    response = await User.find({Name: regex,Type: sort,Hidden: {$exists:false}}).limit(resultsPerPage).skip(0+parseFloat(page)*resultsPerPage).sort({Sales: "descending"}).lean().select(['-_id'])
                    responsecount = await User.countDocuments({Type: sort, Hidden: {$exists:false}})
                }
                if (sort === "All"){
                    response = await User.find({Name: regex,Hidden: {$exists:false}}).limit(resultsPerPage).skip(0+parseFloat(page)*resultsPerPage).sort({Sales: "descending"}).lean().select(['-_id'])
                    responsecount = await User.countDocuments({Hidden: {$exists:false}})
                }
            }else{
                if (sort != "All"){
                response = await User.find({Name: regex,Type: sort, Hidden: {$exists:false}}).limit(resultsPerPage).skip(0+parseFloat(page)*resultsPerPage).lean().select(['-_id'])
                responsecount = await User.countDocuments({Type: sort, Hidden: {$exists:false}})
                }
                if (sort === "All"){
                    response = await User.find({Name: regex,Hidden: {$exists:false}}).limit(resultsPerPage).skip(0+parseFloat(page)*resultsPerPage).lean().select(['-_id'])
                    responsecount = await User.countDocuments({Hidden: {$exists:false}})
                }
            }
            
            //console.log(response.length)
            res.json({data: response, pages: Math.ceil(Math.max(responsecount/resultsPerPage, 1))})
    } catch (error) {
        res.json({status: "error", error:"idk"})
    }
})

module.exports = router