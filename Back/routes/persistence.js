const express = require("express")
const router = express.Router()
const bodyParser = require('body-parser')
const games = require('./../model/games.js')
require('dotenv').config()
const RCC_HOST = process.env.RCC_HOST
router.use(bodyParser.text({limit: '100mb'}))
router.use(async function (req, res, next) {
    var ip = req.headers['cf-connecting-ip'] || req.socket.remoteAddress.replace(/^.*:/, '')
    console.log(ip)

    if (ip === RCC_HOST || ip == "::ffff:"+RCC_HOST){
        return next()
    }
    return res.status(403)
  })
    router.post('/getV2', async (req, res)=>{
        const placeid = req.query.placeId
        const scope = req.query.scope
        const game = await games.findOne({idofgame: placeid}).lean()
        if (!game.datastore){
            return res.json({"data": [{"Key": {"Scope": req.body.qkeys[0], "Target": "KEY", "Key": req.body.qkeys[1]}, "Value": "nil"}]})
        }
        const datastore = JSON.parse(game.datastore)
        // first make sure database exists then make sure scope exists finally make sure key exists inside scope
        if (datastore[req.body.qkeys[2]] && datastore[req.body.qkeys[2]][req.body.qkeys[0]] && datastore[req.body.qkeys[2]][req.body.qkeys[0]][req.body.qkeys[1]]){
                    
        // 2 = database name
        // 1 = Key name
        // 0 = scope

var wow = {"data": [{"Key": {"Scope": req.body.qkeys[0], "Target": "KEY", "Key": req.body.qkeys[1]}, "Value": datastore[req.body.qkeys[2]][req.body.qkeys[0]][req.body.qkeys[1]].value}]};
//console.log(req.body)

console.dir(wow,{ depth: null })



return res.json(wow)
        }



        return res.json({"data": [{"Key": {"Scope": req.body.qkeys[0], "Target": "KEY", "Key": req.body.qkeys[1]}, "Value": "nil"}]})
            

    });
    router.post('/set', async (req, res)=>{
        const placeid = req.query.placeId
        const game = await games.findOne({idofgame: placeid}).lean()
        if (!game){
            return res.sendStatus(404)
        }

        let currentdatastore
        if (!game.datastore){
            try{
                await games.updateOne({idofgame: placeid}, {
                    $set: {
                        datastore: JSON.stringify({[req.query.key]: {[req.query.scope]: {[req.query.target]: {value: req.body.value}},type: req.query.type}})
                    }
                }, 
                function(err, doc) {
                  //console.log(err)
                })
            }catch{
    
            }
            return res.json({"data": [{"Key": {"Scope": req.query.key, "Target": "KEY", "Key": [req.query.target]}, "Value": req.body.value}]})
        }
        currentdatastore = JSON.parse(game.datastore)
        
        if (currentdatastore[req.query.key]){ // if database name already exists
            console.log('1')
            if (currentdatastore[req.query.key][[req.query.scope]]){ // if database scope already exists
                console.log('2')
                if (currentdatastore[req.query.key][req.query.scope][req.query.target]){ // key already stored overwrite it
                    console.log('3')
                    currentdatastore[req.query.key][req.query.scope][req.query.target] =  {value: req.body.value}
                }else{
                    console.log('4')
                    currentdatastore[req.query.key][req.query.scope][req.query.target] =  {value: req.body.value} // database scope exists but key doesn't so generate it
                }
            }else{
                currentdatastore[req.query.key][req.query.scope] = {[req.query.target]: {value: req.body.value}} // scope doesn't exist
            }

        }else{
            currentdatastore[req.query.key] = {[req.query.scope]: {[req.query.target]: {value: req.body.value}},type: req.query.type} // database doesn't exist make sure to pass database type as well
        }

        try{
            await games.updateOne({idofgame: placeid}, {
                $set: {
                    datastore: JSON.stringify(currentdatastore)
                }
            }, 
            function(err, doc) {
              //console.log(err)
            })
        }catch{

        }
        //console.log(req.body)
        res.json({"data": [{"Key": {"Scope": req.query.key, "Target": "KEY", "Key": [req.query.target]}, "Value": req.body.value}]})
    })


    
router.post("/increment", async (req, res) => {
    const placeid = req.query.placeId
    const game = await games.findOne({idofgame: placeid}).lean()
    if (!game){
        return res.sendStatus(404)
    }
    let currentdatastore
    if (!game.datastore){
        res.json({"data": {}})
    }
    currentdatastore = JSON.parse(game.datastore)
    
    if (currentdatastore[req.query.key] && currentdatastore[req.query.key][req.query.scope] && currentdatastore[req.query.key][req.query.scope][req.query.target]){
        let value = parseFloat(currentdatastore[req.query.key][req.query.scope][req.query.target].value)
        if (!isNaN(parseFloat(value)) === true){
            // is number
            let newvalue = value += parseFloat(req.query.value)
            currentdatastore[req.query.key][req.query.scope][req.query.target].value = newvalue.toString()
            try{
                await games.updateOne({idofgame: placeid}, {
                    $set: {
                        datastore: JSON.stringify(currentdatastore)
                    }
                }, 
                function(err, doc) {
                  //console.log(err)
                })
            }catch{
    
            }
            //console.log(req.body)
            return res.json({"data": [{"Key": {"Scope": req.query.key, "Target": "KEY", "Key": [req.query.target]}, "Value": parseFloat(currentdatastore[req.query.key][req.query.scope][req.query.target].value)}]})

        }
    }
    res.json({"data": {}})

})


router.post("/getSortedValues", async (req, res) => {
    const placeid = req.query.placeId
    const game = await games.findOne({idofgame: placeid}).lean()
    if (!game){
        return res.sendStatus(404)
    }
    if (!game.datastore){
        return res.json({"data":{"Entries":[],"ExclusiveStartKey":null}})
    }

    const datastore = JSON.parse(game.datastore)
    // first make sure database exists then make sure scope exists
    if (datastore[req.query.key] && datastore[req.query.key][req.query.scope]){

    function paginate(array, page_size, page_number) {
        // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
        return array.slice((page_number - 1) * page_size, page_number * page_size);
      }
        

let wow = {"data":{"Entries":[],"ExclusiveStartKey":null}}

//console.log(datastore[req.query.key][req.query.scope])

const pageNumber = req.query.exclusiveStartKey??1

for (const [key, value] of Object.entries(datastore[req.query.key][req.query.scope])) {
    wow.data.Entries.push({Target: key,Value: value.value})
  }

  if (req.query.ascending === "False"){
    // descending order
    wow.data.Entries.sort((a, b) => a.Value - b.Value).reverse();
  }else{
    //ascending
    wow.data.Entries.sort((a, b) => a.Value - b.Value)
  }

wow.data.Entries = paginate(wow.data.Entries,req.query.pageSize,pageNumber)

if (Object.entries(datastore[req.query.key][req.query.scope]).length > pageNumber * req.query.pageSize ){  // if the next page exists fill the exclusivestartkey
      wow.data.ExclusiveStartKey = (parseFloat(pageNumber) + 1).toString()
}

//console.log(req.body)

//console.dir(wow,{ depth: null })



return res.json(wow)
    }

    return res.json({"data":{"Entries":[],"ExclusiveStartKey":null}})


})

    
module.exports = router