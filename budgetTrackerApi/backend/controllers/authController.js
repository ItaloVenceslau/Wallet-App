const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
    const {email, password, name} = req.body;

    if (!email || !password || !name) return res.status(400).json({error: 'Missing arguments'});

    const user = await User.findOne({email});

    if (user) return res.status(400).json({error: 'User already exists'});

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({name, email, password: hashedPassword});

    const token = generateToken(newUser._id);

    return res.status(201).json({message: 'User created successfully', token});
};  

const login = async (req, res) => {
    const {email, password} = req.body;

    const user = await User.findOne({email});

    if (!user) return res.status(400).json({error: 'Invalid credentials'});

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) return res.status(400).json({error: 'Invalid credentials'});

    const token = generateToken(user._id);

    return res.status(200).json({message: 'Logged in successfully', token});
};


module.exports = {register, login};