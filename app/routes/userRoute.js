const express = require('express');
const router = express.Router();
const multer = require('../midleware/multer.midleware');
const auth = require('../midleware/auth.midleware');

const users = require('../controllers/user.controller');
router.post('/users/register', multer, users.register);
router.post('/users/login',  multer, users.login);
router.put('/users/:id', auth, multer, users.update);
router.delete('/users/:id', auth, users.delete);
router.get('/profile/:id', users.getUser);
module.exports = router;