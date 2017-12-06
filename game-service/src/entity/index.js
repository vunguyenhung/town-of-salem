/*
3rd Party library imports
 */

/*
Project file imports
 */
const { create } = require('../infrastructures/database');
const { sendEventToStateUpdateTopic } = require('../utils');

// TODO: add more information into `users` of game
const createGame = users =>
	create({ users })
		.chain(gameDoc => sendEventToStateUpdateTopic('[Game] GAME_CREATED', gameDoc.toObject()));
// createUsers

// { __v: 0,
// updatedAt: 2017-12-06T17:56:55.840Z,
// createdAt: 2017-12-06T17:56:55.840Z,
// _id: 5a282f67b9ae23015ab015a6,
// users: [ 'vunguyenhung' ] }

module.exports = {
	createGame,
};
