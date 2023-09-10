const mongoose = require('mongoose')
const GamesSchema = new mongoose.Schema({
    useridofowner: {type: Number, required: true},
    idofgame: {type: Number, required: true, index: true},
    nameofgame: {type: String, required: true},
    numberofplayers: {type: String, required: true},
    descrption: {type: String, required: true},
    datastore: {type: String, required: false},
    visits: {type: Number, required: false},
    version: {type: String, required: true},
    featured: {type: Boolean, required: false},
    players: {type: Object, required: false},
    avatartype: {type: Object, required: false},
    gearallowed: {type: Boolean, required: false},
    comments: {type: Object, required: false}
}, 
{collection: 'games'}
)

GamesSchema.virtual('owner', {
    ref: 'UserSchema',
    localField: 'useridofowner',
    foreignField: 'userid',
    justOne: true
})

const model = mongoose.model('GamesSchema', GamesSchema)

module.exports = model