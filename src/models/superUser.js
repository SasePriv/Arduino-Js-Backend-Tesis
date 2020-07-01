const { Schema, model} = require('mongoose');
const bcrypt = require('bcryptjs');

const SuperUserSchema = new Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    password: {type: String, required: true},
}, {
    timestamps: true
});

SuperUserSchema.methods.encryptPassword = async password => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

SuperUserSchema.methods.matchPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}   

module.exports = model('SuperUser', SuperUserSchema);