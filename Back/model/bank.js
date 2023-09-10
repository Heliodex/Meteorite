const mongoose = require('mongoose')
const bankSchema = new mongoose.Schema({
    balance: {type: Number, required: true},
}, 
{collection: 'bank'}
)
const model = mongoose.model('bank', bankSchema)

module.exports = model