/* eslint-disable no-param-reassign,max-len */
/*
3rd Party library imports
 */
const { fromPromised } = require('folktale/concurrency/task');
const { prop, map } = require('ramda');
const { task, waitAll } = require('folktale/concurrency/task');

/*
Project file imports
 */
const { GameModel, PlayerModel } = require('../infrastructures/database');
const { createTrace, sendEventToStateUpdateTopic } = require('../utils');

const trace = createTrace('src:entity');

// TODO: implement phases ?
// pros: the hardest part
//
// const: the hardest part
//  hard to test

// TODO: implement game rule ?
// pros: easier part
//       easier to show
//
// cons:

const _createGame = data => fromPromised(GameModel.create.bind(GameModel))(data);
const _createPlayers = data => fromPromised(PlayerModel.insertMany.bind(PlayerModel))(data);

const findGameByID = gameId => task((resolver) => {
	GameModel.findOne({ _id: gameId }).populate('players')
		.then(result => resolver.resolve(result))
		.catch(err => resolver.reject(err));
});

const preprocessUsernames = map(username => ({ username }));

const updatePlayerGame = (playerDoc, gameId) =>
	fromPromised(PlayerModel.update.bind(PlayerModel))(
		{ _id: playerDoc._id },
		{ $set: { game: gameId } },
	);

const createGame = usernames =>
	_createPlayers(preprocessUsernames(usernames))
		.map(trace('player docs: '))
		.map(playerDocs => playerDocs.map(prop('_id')))
		.chain(playerIds => _createGame({ players: playerIds }))
		.chain(gameDoc => findGameByID(gameDoc._id)) // players: [playerDoc]
		.map(trace('game doc: '))
		.chain(gameDoc =>
			waitAll(gameDoc.players.map(player => updatePlayerGame(player, gameDoc._id)))
				.map(() => gameDoc))
		.chain(gameDoc => sendEventToStateUpdateTopic('[Game] GAME_CREATED', gameDoc.toObject()));

const getGameByUsername = username => GameModel.findOne({ users: { username } });

// { __v: 0,
// updatedAt: 2017-12-06T17:56:55.840Z,
// createdAt: 2017-12-06T17:56:55.840Z,
// _id: 5a282f67b9ae23015ab015a6,
// users: [ 'vunguyenhung' ] }

// players:
// [ { _id: 5a28eeecc5e7a902b70a22b5,
// updatedAt: 2017-12-07T07:34:04.193Z,
// createdAt: 2017-12-07T07:34:04.193Z,
// __v: 0,
// username: 'vunguyenhung' } ] }

module.exports = {
	createGame,
	getGameByUsername,
};
