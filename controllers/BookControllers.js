const mongoose = require('mongoose');
const Book = require('../models/Book');
const Category = require('../models/Category');
// FIREBASE & GOOGLE CLOUD
const GCS = require('../functions/GCS');
const uploadFile = GCS.uploadFile;
const deleteFile = GCS.deleteFile;
// HELPER
const helper = require('../functions/helper');
const findRelativeChildren = helper.findRelativeChildren;


exports.getById = (req, res, next) => {
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
};

exports.getAll = async (req, res, next) => {    
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
            sortOption['createdAt'] = -1;
        }
        if(sort === 'oldest'){
            sortOption['createdAt'] = 1;
        }
        if(sort === 'a-z'){
            sortOption['name'] = 1;
        }
        if(sort === 'z-a'){
            sortOption['name'] = -1;
        }
        if(sort === 'price-asc'){
            sortOption['price'] = 1;
        }
        if(sort === 'price-desc'){
            sortOption['price'] = -1;
        }
    }
    // SEARCH CATEGORY
    let searchOption = {};
    if(req.query.category){
        const cateList = await Category.find().exec();
        const cateOptions = findRelativeChildren(cateList, req.query.category);
        searchOption['category'] = { $in: cateOptions };
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

    // const bookQuery = Book.find(searchOption)
    //     .sort(sortOption)
    //     .populate('category', '_id name')
    //     .populate('author', '_id name')
    //     .populate('brand', '_id name');
    Book.find(searchOption)
        .sort(sortOption)
        .populate('category', '_id name')
        .populate('author', '_id name')
        .populate('brand', '_id name')
        // .limit(limit)
        // .skip(limit * (page - 1))
        .exec()
        .then(doc => {
            const totalPage = Math.ceil( doc.length / limit );
            if(page > totalPage){
                page = totalPage;
            }
            const list = doc.slice(limit * (page - 1), limit * page);
            res.status(200).json({
                list,
                page,
                limit,
                count: doc.length
            });
            // bookQuery
            //     .countDocuments()
            //     .exec((err, count) => {
            //         if(err){
            //             res.status(500).json({
            //                 message: err
            //             });   
            //         }
            //         res.status(200).json({
            //             list: doc,
            //             page,
            //             limit,
            //             count
            //         });
            //     });
        })
        .catch(err => {
            res.status(500).json({
                message: err
            });
        });
};


exports.addItem = async (req, res, next) => {
    let newItem = {};
    if (req.body.name) {
        newItem['name'] = req.body.name;
    }
    if (req.body.price) {
        newItem['price'] = req.body.price * 1;
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
};


exports.updateItem = async (req, res, next) => {
    const id = req.params.id;
    let newItem = {};

    for (let key in req.body) {
        if (req.body[key] && key !== 'price') {
            newItem[key] = req.body[key] * 1;
        }
        if (req.body[key] && key !== 'img') {
            newItem[key] = req.body[key];
        }
    }
    if (req.file && req.file.fieldname === 'img' && req.file.size > 0) {
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
            if(doc.img && newItem.img){
                const filename = doc.img.split('?')[0].split('/').pop();
                await deleteFile(filename);
            }
            res.status(200).json({ ...doc._doc, ...newItem });
        })
        .catch(err => {
            res.status(500).json({
                message: err
            })
        });
};


exports.deleteItem = (req, res, next) => {
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
};