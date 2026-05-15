const jwt = require("jsonwebtoken");


const authMiddleware = (req, res, next) => {

    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token required' });
    }
    
    const authorization = req.headers.authorization.split(' ');

    if (authorization.length !== 2 || authorization[0] !== 'Bearer') return res.status(401).json({error: 'Invalid token'});

    try {
        const token = authorization[1];

        if (!process.env.JWT_KEY) throw new Error('JWT_KEY is not defined in environment');
    

        const decoded = jwt.verify(token, process.env.JWT_KEY);

        req.user = { id: decoded.id };

        next();
    } catch (e) {
        return res.status(401).json({error: 'Invalid token'});
    }
    
};

module.exports = authMiddleware;