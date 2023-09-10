const mongoose = require('mongoose')
const CatalogSchema = new mongoose.Schema({
    Name: {type: String, required: true},
    Description: {type: String, required: false},
    Price: {type: String, required: true},
    Type: {type: String, required: true},
    Creator: {type: Number, required: false},
    Hidden: {type: Boolean, required: false},
    ItemId: {type: String, required: true},
    Sales: {type: Number, required: false},
    ActiveAd: {type: Boolean, required: false}, // these 4 are for user generated ads
    adtype: {type: String, required: false},
    adredirectid: {type: String, required: false},
    adstartedtime: {type: Number, required: false},
    approved: {type: Boolean, required: true},
    denied: {type: Boolean, required: false},
    associatedgameid: {type: Number, required: false},
}, 
{collection: 'catalog'}
)
const model = mongoose.model('CatalogSchema', CatalogSchema)

module.exports = model