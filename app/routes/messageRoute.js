const express = require('express');
const router = express.Router();
const multer = require('../midleware/multer.midleware');
const auth = require('../midleware/auth.midleware');

const messageControllers = require('../controllers/message.controller');
router.get('/home',  auth, messageControllers.findAllMessage);
router.post('/home', auth, multer, messageControllers.createMessage);
router.put('/messages/:id', auth, messageControllers.modifyMessage);
router.delete('/messages/:id', auth, messageControllers.deleteMessage);
router.get('/messages', auth, messageControllers.findAllById);
router.post('/home/:id/like',auth, messageControllers.like );
module.exports = router;