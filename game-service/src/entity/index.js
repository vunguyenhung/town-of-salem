/* eslint-disable no-param-reassign */
/*
3rd Party library imports
 */

/*
Project file imports
 */
const { create, GameModel } = require('../infrastructures/database');
const { sendEventToStateUpdateTopic } = require('../utils');

// TODO: add more information into `users` of game
const createGame = (users) => {
	const dataToSave = users.map(username => ({ username }));
	return create({ users: dataToSave })
	// map ID of game
		.chain(gameDoc =>
			sendEventToStateUpdateTopic('[Game] GAME_CREATED', gameDoc.toObject({
				transform: (doc, ret) => {
					ret.id = ret._id;
					return ret;
				},
			})));
};
// more chain here

const getGameByUsername = username => GameModel.findOne({ users: { username } });

// { __v: 0,
// updatedAt: 2017-12-06T17:56:55.840Z,
// createdAt: 2017-12-06T17:56:55.840Z,
// _id: 5a282f67b9ae23015ab015a6,
// users: [ 'vunguyenhung' ] }

module.exports = {
	createGame,
	getGameByUsername,
};
