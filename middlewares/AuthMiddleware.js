const jwt = require('jsonwebtoken');


module.exports = (req, res, next) => {
    try {
        let token = req.headers.authorization;
        token = token.split(' ')[1];
        const user = jwt.verify(token, 'secret');
        req.user = user;
        next();
    }
    catch(err) {
        res.status(401).json({
            message: 'Auth Failed'
        })
    }
};