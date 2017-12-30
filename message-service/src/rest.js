/* eslint-disable no-param-reassign */
/*
3rd Party library imports
 */
const express = require('express');

const router = express.Router();

/*
Project file imports
 */
const { getMessagesByGameId } = require('./entity');

router.get('/', (req, res) => {
	const gameId = req.get('gameId');
	getMessagesByGameId(gameId)
		.run()
		.promise()
		.then(result => res.status(200).json(result.toObject()))
		.catch(err => res.status(404).end(err));
});

module.exports = router;

