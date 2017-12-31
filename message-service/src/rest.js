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
const { createTrace } = require('./utils');

const trace = createTrace('src:rest');

router.get('/messages/:gameId', (req, res) => {
	const { gameId } = req.params;
	trace('gameId when receiving request:', `${gameId}, type: ${typeof gameId}`);
	getMessagesByGameId(gameId)
		.map(trace('after get messages by GameID: '))
		.run()
		.promise()
		.then(result => res.status(200).json(result))
		.catch(err => res.status(404).end(err));
});

module.exports = router;

