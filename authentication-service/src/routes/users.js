const express = require('express');

const router = express.Router();

/* GET users listing. */
router.get('/user', (req, res, next) => {
  res.send('user route');
});

module.exports = router;
