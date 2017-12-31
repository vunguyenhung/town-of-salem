/* eslint-disable no-param-reassign */
/*
3rd Party library imports
 */
const express = require('express');

const router = express.Router();

/*
Project file imports
 */
const { getGameByUsername, getPlayersByGameId } = require('../entity');
const { createTrace } = require('../utils');

const trace = createTrace('src:rest');

router.get('/state', (req, res) => {
	const username = req.get('username');
	getGameByUsername(username)
		.run()
		.promise()
		.then(result => res.status(200).json(result.toObject()))
		.catch(err => res.status(404).end(err));
});

router.get('/games/:gameId/players', (request, response) => {
	const { gameId } = request.params;
	trace('gameId received: ');
	getPlayersByGameId(gameId)
		.run()
		.promise()
		.then(result => response.status(200).json(result))
		.catch(err => response.status(404).end(err));
});

router.get('/', (req, res) => {
	res.end('App is running');
});

module.exports = router;

