const express = require('express');
const router = express.Router();
// CONTROLERS
const BookControllers = require('../controllers/BookControllers');
// MIDDLEWARES
const AuthMiddleware = require('../middlewares/AuthMiddleware');
// UPLOAD
const upload = require('../functions/upload');


// GET BY ID
router.get('/:id', BookControllers.getById);

// GET ALL
router.get('/', BookControllers.getAll);

// POST
router.post('/', AuthMiddleware, upload.single('img'), BookControllers.addItem);

// UPDATE
router.put('/:id', AuthMiddleware, upload.single('img'), BookControllers.updateItem);

// DELETE
router.delete('/:id', AuthMiddleware, BookControllers.deleteItem);


module.exports = router;