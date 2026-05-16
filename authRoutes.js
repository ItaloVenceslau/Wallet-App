const express = require('express');
const router = express.Router();
const {register, login, getCurrentUser} = require('../controllers/authController');
const {validateRegister} = require('../middleware/validation');

router.post('/register', validateRegister, register);
router.post('/login', login);
router.get('/me', getCurrentUser);

module.exports = router;
