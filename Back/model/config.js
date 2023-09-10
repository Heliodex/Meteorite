const mongoose = require('mongoose')
const ConfigSchema = new mongoose.Schema({
    RegistrationEnabled: {type: Boolean, required: true},
    MaintenanceEnabled: {type: Boolean, required: true},
    KeysEnabled: {type: Boolean, required: true},
    GamesEnabled: {type: Boolean, required: true}
}, 
{collection: 'config'}
)

const model = mongoose.model('ConfigSchema', ConfigSchema)

module.exports = model