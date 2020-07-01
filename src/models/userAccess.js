const {Schema, model} = require('mongoose');

const UserAccessSchema =  new Schema({    
    name: {type: String, required: true},
    huella: {type: Number,required: true, unique: true},    
    status: {type: String, enum: ['activo', 'inactivo'] ,default: "activo"}
}, {
    timestamps:true
})

module.exports = model('UserAccess', UserAccessSchema);