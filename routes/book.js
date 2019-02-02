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
    // PAGINATION
    let page = req.query.page ? req.query.page * 1 : 1;
    if(page < 1){
        page = 1;
    }
    const limit = req.query.limit ? req.query.limit * 1 : 10;
    // SORT
    let sortOption = {};
    if(req.query.sort){
        const sort = req.query.sort;
        if(sort === 'latest'){
            sortOption['createdAt'] = -1
        }
        if(sort === 'oldest'){
            sortOption['createdAt'] = 1
        }
        if(sort === 'a-z'){
            sortOption['name'] = 1
        }
        if(sort === 'z-a'){
            sortOption['name'] = -1
        }
        if(sort === 'price-asc'){
            sortOption['price'] = 1
        }
        if(sort === 'price-desc'){
            sortOption['price'] = -1
        }
    }
    // SEARCH CATEGORY
    let searchOption = {};
    if(req.query.category){
        searchOption['category'] = req.query.category;
    }
    // SEARCH AUTHOR
    if(req.query.author){
        searchOption['author'] = req.query.author;
    }
    // SEARCH BRAND
    if(req.query.brand){
        searchOption['brand'] = req.query.brand;
    }
    // SEARCH NAME
    if(req.query.search){
        let search = req.query.search.toLowerCase();
        search = search.replace('a', '(a|á|à|ả|ã|ạ|ă|â)');
        search = search.replace('ă', '(ă|ắ|ằ|ẳ|ẵ|ặ)');
        search = search.replace('â', '(â|ấ|ầ|ẩ|ẫ|ậ)');
        search = search.replace('e', '(e|é|è|ẻ|ẽ|ẹ|ê)');
        search = search.replace('ê', '(ê|ế|ề|ể|ễ|ệ)');
        search = search.replace('u', '(u|ú|ù|ủ|ũ|ụ|ư)');
        search = search.replace('ư', '(ư|ứ|ừ|ử|ữ|ự)');
        search = search.replace('i', '(i|í|ì|ỉ|ĩ|ị)');
        search = search.replace('o', '(o|ó|ò|ỏ|õ|ọ|ơ|ô)');
        search = search.replace('ơ', '(ơ|ớ|ờ|ở|ỡ|ợ)');
        search = search.replace('ô', '(ô|ố|ồ|ổ|ỗ|ộ)');
        const searchRegex = new RegExp(search, 'i');
        searchOption['name'] = searchRegex;
    }
    
    Book.find(searchOption)
        .sort(sortOption)
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