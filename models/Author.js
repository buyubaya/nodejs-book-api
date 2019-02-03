const mongoose = require('mongoose');


const authorSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    img: { type : String, default: null },
    description: { type : String, default: null },
    createdAt: { type : Date, default: Date.now },
    updatedAt: { type : Date, default: Date.now }
});


module.exports = mongoose.model('Author', authorSchema);