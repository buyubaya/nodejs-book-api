const mongoose = require('mongoose');


const categorySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    img: { type : String, default: null },
    parent_id: { type : mongoose.Schema.Types.ObjectId, default: null },
    description: { type : Date, default: null },
    createdAt: { type : Date, default: Date.now },
    updatedAt: { type : Date, default: Date.now }
});


module.exports = mongoose.model('Category', categorySchema);