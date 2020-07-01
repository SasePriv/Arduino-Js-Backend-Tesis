const {Schema, model} = require('mongoose');
const shortid = require('shortid');


const ProductoSchema =  new Schema({
    _id: {
        type: String,
        default: shortid.generate
    }, 
    name: {type: String,required: true},
    price: {type: Number,required: true},
    status:{type: String,  enum: ['bobeda', 'activo'] ,default: "bobeda"},
    peso:{type: String, required: true},
    category:{type: String, enum: ['joyas', 'relog', 'anillos'], required: true},
}, {
    timestamps:true
})

module.exports = model('Producto', ProductoSchema);