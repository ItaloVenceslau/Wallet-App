const validateRegister = (req, res, next) => {
    const {email, name, password} = req.body;

    if (!email || !name || !password) return res.status(400).json({error: 'Missing credentials'});

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (name.length < 3) return res.status(400).json({error: 'Name too short'});
    if (password.length < 6) return res.status(400).json({error: 'Password too short'});
    if (!emailRegex.test(email)) return res.status(400).json({error: 'Invalid email format'});

    next();

};

const validateTransaction = (req, res, next) => {
    const {title, amount, type, category, note} = req.body;
    const validTypes = ["income", "expense"];


    if (typeof title !== "string" || title.length < 3) return res.status(400).json({error: 'Invalid title'});
    if (isNaN(parseFloat(amount)) || amount < 0) return res.status(400).json({error: "Invalid amount"});
    if (!validTypes.includes(type)) return res.status(400).json({error: 'Invalid type'});
    if (!category || typeof category !== "string") return res.status(400).json({error: 'Invalid category'});

    next();
};

module.exports = {validateRegister, validateTransaction};