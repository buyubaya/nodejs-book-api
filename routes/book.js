const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
// FIREBASE & GOOGLE CLOUD
const GCS = require('../functions/GCS');
const uploadFile = GCS.uploadFile;
const deleteFile = GCS.deleteFile;
// MULTER
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
    // storage,
    limits: {
        fileSize: 1014 * 1024 * 5
    },
    fileFilter: (req, file, cb) => {
        if (['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/svg'].includes(file.mimetype)) {
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
router.get('/', async (req, res, next) => {
    // FILTER QUERIES
    
    // PAGINATION
    let page = req.query.page ? req.query.page * 1 : 1;
    if(page < 1){
        page = 1;
    }
    const limit = req.query.limit ? req.query.limit * 1 : 10;
    console.log(22222, req.query);
    
    Book.find()
        .limit(limit)
        .skip(limit * (page - 1))
        .populate('category', '_id name')
        .populate('author', '_id name')
        .populate('brand', '_id name')
        .exec()
        .then(doc => {
            Book.countDocuments()
            .exec((err, count) => {
                if(err){
                    res.status(500).json({
                        message: err
                    });
                }
                res.status(200).json({
                    list: doc,
                    page,
                    limit,
                    count
                });
            });
        })
        .catch(err => {
            res.status(500).json({
                message: err
            });
        });
});

// POST
router.post('/', upload.single('img'), async (req, res, next) => {
    let newItem = {};
    if (req.body.name) {
        newItem['name'] = req.body.name;
    }
    if (req.body.price) {
        newItem['price'] = req.body.price;
    }
    if (req.body.category) {
        newItem['category'] = req.body.category;
    }
    if (req.body.author) {
        newItem['author'] = req.body.author;
    }
    if (req.body.brand) {
        newItem['brand'] = req.body.brand;
    }
    if (req.body.description) {
        newItem['description'] = req.body.description;
    }
    if (req.file && req.file.fieldname === 'img') {
        await uploadFile(req.file)
            .then(imgUrl => {
                newItem['img'] = imgUrl;
            })
            .catch(error => {
                res.status(500).send({
                    message: error
                });
            });
    }

    newItem = new Book({ _id: new mongoose.Types.ObjectId(), ...newItem });
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
router.put('/:id', upload.single('img'), async (req, res, next) => {
    const id = req.params.id;
    let newItem = {};

    for (let key in req.body) {
        if (req.body[key] && key !== 'img') {
            newItem[key] = req.body[key];
        }
    }
    if (req.file && req.file.fieldname === 'img') {
        await uploadFile(req.file)
            .then(imgUrl => {
                newItem['img'] = imgUrl;
            })
            .catch(error => {
                res.status(500).send({
                    message: error
                });
            });
    }
    newItem['updatedAt'] = Date.now();

    Book.findByIdAndUpdate({ _id: id }, { $set: newItem })
        .then(async doc => {
            // DELETE OLD FILE
            if(doc.img){
                const filename = doc.img.split('?')[0].split('/').pop();
                await deleteFile(filename);
            }
            res.status(200).json(newItem);
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
        .then(async doc => {
            // DELETE OLD FILE
            if(doc.img){
                const filename = doc.img.split('?')[0].split('/').pop();
                await deleteFile(filename);
            }
            res.status(200).json(doc);
        })
        .catch(err => {
            res.status(500).json({
                message: err
            })
        });
});


module.exports = router;