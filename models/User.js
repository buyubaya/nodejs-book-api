const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: { type: String, required: true },
    password: { type: String, required: true },
    img: { type : String, default: null },
    role: { type : String, default: null },
    createdAt: { type : Date, default: Date.now },
    updatedAt: { type : Date, default: Date.now }
});


module.exports = mongoose.model('User', userSchema);