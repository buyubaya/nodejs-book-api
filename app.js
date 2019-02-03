const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// MONGOOSE
mongoose.connect(
    'mongodb://buyubaya:'+encodeURIComponent('P@ssword123')+'@nodejs-book-api-shard-00-00-qh0ln.mongodb.net:27017,nodejs-book-api-shard-00-01-qh0ln.mongodb.net:27017,nodejs-book-api-shard-00-02-qh0ln.mongodb.net:27017/test?ssl=true&replicaSet=nodejs-book-api-shard-0&authSource=admin&retryWrites=true', 
    {
        useNewUrlParser: true
    }
)
.then(() => console.log('CONNECTED'))
.catch(err => console.log('CONECTION FAILED', err));

// BODY PARSER
app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// HEADERS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});

// ROUTES
const bookRoute = require('./routes/book');
const categoryRoute = require('./routes/category');
const authorRoute = require('./routes/author');
const brandRoute = require('./routes/brand');
const userRoute = require('./routes/user');
app.use('/api/product', bookRoute);
app.use('/api/category', categoryRoute);
app.use('/api/author', authorRoute);
app.use('/api/brand', brandRoute);
app.use('/myuser', userRoute);
app.use('/user', (req, res, next) => {
    res.send('USER');
});
app.use('/hello-user', (req, res, next) => {
    res.send('HELLO USER');
});
app.use('/', (req, res, next) => {
    res.send('HELLO BOOKS !!!!!');
});

// ERRORS
app.use((req, res, next) => {
    let error = new Error('NOT FOUND');
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        message: err.message
    });
});


module.exports = app;