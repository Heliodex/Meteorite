const mongoose = require('mongoose')
const CommentSchema = new mongoose.Schema({
    associatedassetid: {type: Number, required: true, index: true},
    associatedassettype: {type: String, required: true, index: true},
    posterid: {type: Number, required: true},
    content: {type: String, required: true},
    date: {type: Number, required: true},
    moderated: {type: Boolean, required: true}
},
{collection: 'comments'}
)

CommentSchema.virtual('poster', {
    ref: 'UserSchema',
    localField: 'posterid',
    foreignField: 'userid',
    justOne: true
})

const model = mongoose.model('CommentSchema', CommentSchema)

module.exports = model