const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');

const register = async (req, res) => {
    try {
        const {name, email, password} = req.body;

        const findUser = await User.findOne({email});

        if (findUser) return res.status(400).json({error: 'User already exists'});

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ name, email, password: hashedPassword});

        return res.status(201).json({message: 'User created successfully', token: generateToken(newUser._id)});


    } catch (e) {
        return res.status(500).json({error: e.message});
    }
    
};

const login = async (req, res) => {
    try {
    const {email, password} = req.body;

    const user = await User.findOne({email}).select('+password');

    if (!user) return res.status(404).json({error: 'Invalid email/password'});

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) return res.status(401).json({error: 'Invalid email/password'});

    const token = generateToken(user._id);

    return res.status(200).json({message: 'Logged in successfully', token});

    } catch (e) {
        return res.status(500).json({error: e.message});
    }
};

module.exports = {register, login};
