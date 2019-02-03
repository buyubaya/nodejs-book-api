const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// MIDDLEWARES
const AuthMiddleware = require('../middlewares/AuthMiddleware');
// UPLOAD
const upload = require('../functions/upload');
const JWT_SECRET_KEY = 'secret';


// GET BY ID
router.get('/:id', (req, res, next) => {
    const id = req.params.id;

    User.findById(id)
        .select('username img')
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
    User.find()
        .select('username img')
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
router.post('/signup', upload.single('img'), (req, res, next) => {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
            res.status(500).json({
                message: err
            });
        }
        
        const newItem = new User({
            _id: new mongoose.Types.ObjectId(),
            username: req.body.username,
            password: hash
        });

        newItem.save()
            .then(doc => {
                const { password, ...user } = doc._doc;
                res.status(200).json(user);
            })
            .catch(err => {
                res.status(500).json({
                    message: err
                });
            });
    });
});

// DELETE
router.delete('/:id', (req, res, next) => {
    const id = req.params.id;
    
    User.findByIdAndDelete({ _id: id })
        .exec()
        .then(doc => {
            const { password, ...user } = doc._doc;
            res.status(200).json(user);
        })
        .catch(err => {
            res.status(500).json({
                message: err
            })
        });
});

// LOG IN
router.post('/login', (req, res, next) => {
    const { username, password } = req.body;
    console.log('LOGIN', req.body, username, password);
    User.find({ username })
    .exec()
    .then(doc => {
        if(doc.length < 1){
            res.status(400).json({
                message: 'Invalid username and password 1'
            })  
        }

        bcrypt.compare(password, doc[0].password, (err, result) => {
            if(err){
                res.status(400).json({
                    message: 'Invalid username and password 2'
                })    
            }

            const token = jwt.sign(
                {
                    username
                },
                JWT_SECRET_KEY,
                {
                    expiresIn: '1h'
                }
            );
        
            res.status(200).json({ username, token });
        });
    })
    .catch(err => {
        res.status(500).json({
            message: err
        })
    });
});


module.exports = router;