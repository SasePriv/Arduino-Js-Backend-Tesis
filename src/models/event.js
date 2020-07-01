const {Schema, model} = require('mongoose');
const shortid = require('shortid');


const EventSchema =  new Schema({
    _id: {
        type: String,
        default: shortid.generate
    },    
    codigo: {type: Number,required: true},
    title: {type: String,required: true},
    description: {type: String,required: true},
    type: {type: String,required: true},
    reviewed: {type: Boolean,default: false}    
}, {
    timestamps:true
})

module.exports = model('Event', EventSchema);