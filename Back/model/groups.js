const mongoose = require('mongoose')
const GroupSchema = new mongoose.Schema({
    Name: {type: String, required: true},
    Description: {type: String, required: true},
    Public: {type: Boolean, required: true},
    IconApproved: {type: Boolean, required: true},
    denied: {type: Boolean, required: false},
    Hidden: {type: Boolean, required: false},
    groupid: {type: Number, required: true},
    ownerid : {type: Number, required: true},
    memberscount: {type: Number, required: true},
    members: {type: [{userId: Number, rank: Number}], required: true}, 
    currentshout: {type: {content: String, shouter: Number}, required: false},
    Roles: {type: [{RoleName: String, Permissions: {Shout: Boolean, Kick: Boolean, ChangeRoles: Boolean, ModerateWall: Boolean, ManageAllies: Boolean, All: Boolean}, Rank: Number}], required: true}, // default {}
}, 
{collection: 'groups'}
)
const model = mongoose.model('GroupSchema', GroupSchema)

GroupSchema.virtual('owner', {
    ref: 'UserSchema',
    localField: 'ownerid',
    foreignField: 'userid',
    justOne: true
})

GroupSchema.virtual('memberspoly', {
    ref: 'UserSchema',
    localField: 'members.userId',
    foreignField: 'userid'
})

module.exports = model