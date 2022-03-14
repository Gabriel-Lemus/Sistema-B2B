const express = require('express');
const router = express.Router();

router.get('/devices', (req, res) => {
    res.send('Devices from DataBase');
});

module.exports = router;