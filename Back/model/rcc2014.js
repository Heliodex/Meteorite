const mongoose = require('mongoose')
const Rcc2014Schema = new mongoose.Schema({
    PlaceId: {type: Number, required: true},
    Port: {type: Number, required: true}
}, 
{collection: 'RCC2014'}
)
const model = mongoose.model('Rcc2014Schema', Rcc2014Schema)

module.exports = model