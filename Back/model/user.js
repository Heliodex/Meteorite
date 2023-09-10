const mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator');
const UserSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true,uniqueCaseInsensitive: true},
    password: {type: String, required: true},
    coins: {type: Number, required: true},
    admin: {type: Boolean, required: true},
    ugcpermission: {type: Boolean, required: false},
    userid: {type: Number, required: true, index: true},
    moderation: {type: String, required: true},
    moderationhistory: {type: Object, required: false},
    inventory: {type: Object, required: false},
    colors: {type: Object, required: false},
    joindate: {type: String, required: true},
    lastclaimofcurrency: {type: Number, required: true},
    discordid: {type: String, required: false},
    gamejoin: {type: String, required: false},
    gamejoin2018: {type: String, required: false},
    gamejoin2020: {type: String, required: false},
    twofasecrets: {type: String, required: false},
    followers: {type: Object, required: false},
    friends: {type: Object, required: false},
    friendrequests: {type: Object, required: false},
    membership: {type: String, required: true},
    badges: {type: Object, required: false},
    status: {type: String, required: false},
    timesincelastrequest: {type: Number, required: true},
    avatartype: {type: String, required: false},
    bio: {type: String, required: false},
    recentlyplayed: {type: [{id: Number}], required: false},
    css: {type: String, required: false},
    aboutme: {type: String, required: false},
    lastfeedsharetime: {type: Number, required: false},
    feed: [{posterid: Number, content: String, date: Number, moderated: Boolean}], required: false},
 
{collection: 'users'}
)
UserSchema.plugin(uniqueValidator)

UserSchema.virtual('recentlyplayedgames', {
    ref: 'GamesSchema',
    localField: 'recentlyplayed.id',
    foreignField: 'idofgame'
})

UserSchema.virtual('friendsdata', {
    ref: 'UserSchema',
    localField: 'friends.userid',
    foreignField: 'userid'
})

UserSchema.virtual('feed.userdata', {
    ref: 'UserSchema',
    localField: 'feed.posterid',
    foreignField: 'userid',
    justOne: true
})


const model = mongoose.model('UserSchema', UserSchema)

module.exports = model