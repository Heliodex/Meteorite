const mongoose = require('mongoose')
const Rcc2018Schema = new mongoose.Schema({
    PlaceId: {type: Number, required: true},
    Port: {type: Number, required: true},
    Status: {type: Number, required: true},
}, 
{collection: 'RCC2018'}
)
const model = mongoose.model('Rcc2018Schema', Rcc2018Schema)

module.exports = model