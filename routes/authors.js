const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Author = require('../models/Author');


// GET BY ID
router.get('/:id', (req, res, next) => {
    const id = req.params.id;

    Author.findById(id)
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
    Author.find()
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
router.post('/', (req, res, next) => {
    const newItem = new Author({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name
    });

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
    
    Author.findByIdAndUpdate({ _id: id }, { $set: newItem })
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

    Author.findByIdAndDelete({ _id: id })
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