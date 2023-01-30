const express = require('express');
const router = express.Router();
const { regUser, download } = require('../router_handler/user')
router.post('/reguster', regUser);
router.post('/download', download);
module.exports = router;