const express = require('express');

const router = express.Router();

/* GET users listing. */
router.get('/user', (req, res) => {
  res.send('user route');
});

module.exports = router;
