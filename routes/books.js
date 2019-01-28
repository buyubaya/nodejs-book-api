const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
    }        
});
const upload = multer({
    storage,
    limits : {
        fileSize: 1014 * 1024 * 5
    },
    fileFilter: (req, file, cb) => {
        if(['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/svg'].includes(file.mimetype)){
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    }
});
const Book = require('../models/Book');


// GET BY ID
router.get('/:id', (req, res, next) => {
    const id = req.params.id;

    Book.findById(id)
    .exec()
    .then(doc => {
        res.status(200).json(doc);
    })
    .catch(err => {
        res.status(500).json({
            message: err
        });
    });
});

// GET ALL
router.get('/', (req, res, next) => {
    Book.find()
    .populate('category', '_id name')
    .exec()
    .then(doc => {
        res.status(200).json(doc);
    })
    .catch(err => {
        res.status(500).json({
            message: err
        });
    });
});

// POST
router.post('/', upload.single('img'), (req, res, next) => {
    console.log('HELLO FILE', req.file);
    let newItem = {};
    if(req.body.name){
        newItem['name'] = req.body.name;
    }
    if(req.file && req.file.fieldname === 'img'){
        newItem['img'] = req.file.filename;
    }
    if(req.body.price){
        newItem['price'] = req.body.price;
    }
    if(req.body.category){
        newItem['category'] = req.body.category;
    }
    if(req.body.category){
        newItem['author'] = req.body.author;
    }
    if(req.body.category){
        newItem['brand'] = req.body.brand;
    }
    if(req.body.category){
        newItem['description'] = req.body.description;
    }
    if(req.body.createdAt){
        newItem['createdAt'] = req.body.createdAt;
    }

    newItem = new Book({_id: new mongoose.Types.ObjectId(), ...newItem});
    newItem.save()
    .then(doc => {
        res.status(200).json(doc);
    })
    .catch(err => {
        res.status(500).json({
            message: err
        })
    });
});

// UPDATE
router.put('/:id', (req, res, next) => {
    const id = req.params.id;
    let newItem = {};
    for(let key in req.body){
        newItem[key] = req.body[key];
    }
    
    Book.findByIdAndUpdate({ _id: id }, { $set: newItem })
    .then(doc => {
        res.status(200).json(doc);
    })
    .catch(err => {
        res.status(500).json({
            message: err
        })
    });
});

// DELETE
router.delete('/:id', (req, res, next) => {
    const id = req.params.id;

    Book.findByIdAndDelete({ _id: id })
    .exec()
    .then(doc => {
        res.status(200).json(doc);
    })
    .catch(err => {
        res.status(500).json({
            message: err
        })
    });
});


module.exports = router;