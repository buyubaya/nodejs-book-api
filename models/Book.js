const mongoose = require('mongoose');


const bookSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    img: { type : String, default: null },
    price: { type : String, default: null },
    category: { type : mongoose.Schema.Types.ObjectId, default: null, ref: 'Category', required: true },
    author: { type : mongoose.Schema.Types.ObjectId, default: null, ref: 'Author' },
    brand: { type : mongoose.Schema.Types.ObjectId, default: null, ref: 'Brand' },
    description: { type : String, default: null },
    createdAt: { type : Date, default: Date.now },
    updatedAt: { type : Date, default: Date.now }
}, { collation: { locale: 'vi' } });


module.exports = mongoose.model('Book', bookSchema);