const jwt = require('jsonwebtoken');

async function authMiddleware(req, res, next) {
    
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) return res.status(401).json({error: 'Missing or invalid token format'});


    const token = authorization.split(' ')[1];

    if (!token) return res.status(401).json({error: 'Missing token'});

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        
        req.user = { id: decoded.id };
        
        next();
        } catch (error) {
        
        return res.status(401).json({ message: 'Invalid/expired token' });
        }
}

module.exports = authMiddleware;