const mongoose = require('mongoose')
const KeysSchema = new mongoose.Schema({
    Creator: {type: String, required: true},
    Key: {type: String, required: true},
    Used: {type: Boolean, required: true},
    UsedBy: {type: String, required: false}
}, 
{collection: 'keys'}
)

const model = mongoose.model('KeysSchema', KeysSchema)

module.exports = model