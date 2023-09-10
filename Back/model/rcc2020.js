const mongoose = require('mongoose')
const Rcc2020Schema = new mongoose.Schema({
    PlaceId: {type: Number, required: true},
    Port: {type: Number, required: true},
    Status: {type: Number, required: true},
}, 
{collection: 'RCC2020'}
)
const model = mongoose.model('Rcc2020Schema', Rcc2020Schema)

module.exports = model