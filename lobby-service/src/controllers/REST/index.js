/*
3rd Party library imports
 */
const express = require('express');

const router = express.Router();

/*
Project file imports
 */
const { store, getLobbyByUsername } = require('../../usecases/redux');

router.get('/', (req, res) => {
	console.log(req.get('username'));
	res.status(200)
		.json(getLobbyByUsername(req.get('username'))(store.getState()).getOrElse(null));
});

module.exports = router;

