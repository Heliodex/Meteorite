const mongoose = require('mongoose')
const RccSchema = new mongoose.Schema({
    PlaceId: {type: Number, required: true},
    Port: {type: Number, required: true},
    Status: {type: Number, required: true},
}, 
{collection: 'RCC'}
)
const model = mongoose.model('RccSchema', RccSchema)

module.exports = model