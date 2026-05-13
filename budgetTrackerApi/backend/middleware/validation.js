const validateRegister = (req, res, next) => {
    const {email, name, password} = req.body;

    if (!email || !name || !password) return res.status(400).json({error: 'Missing credentials'});

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (name.length < 3) return res.status(400).json({error: 'Name too short'});
    if (password.length < 6) return res.status(400).json({error: 'Password too short'});
    if (!emailRegex.test(email)) return res.status(400).json({error: 'Invalid email format'});

    next();

};

const validateProject = (req, res, next) => {
    const {name, budget} = req.body;

    if (!name || !budget) return res.status(400).json({error: 'Missing arguments'});

    if (name.length < 3) return res.status(400).json({error: 'Name too short'});

    const floatBudget = parseFloat(budget);

    if (isNaN(floatBudget) || floatBudget <= 0) return res.status(400).json({error: 'Invalid budget format'});

    next();
};

module.exports = {validateRegister, validateProject};