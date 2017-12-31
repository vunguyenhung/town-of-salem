/* eslint-disable object-curly-newline */
/*
3rd Party library imports
 */
const { task, fromNodeback, fromPromised } = require('folktale/concurrency/task');
const superagent = require('superagent');
const config = require('config');
const { prop, map } = require('ramda');

/*
Project file imports
 */
const { MessageModel } = require('./database');
const { sendEventToStateUpdateTopic } = require('./utils');
const { createTrace } = require('./utils');

const trace = createTrace('src:entity');

const getMessagesByGameId = (gameId) => {
	trace('gameId in getMessagesByGameId,', `${gameId}, type: ${typeof gameId}`);
	return task((resolver) => {
		MessageModel.find({ game: gameId })
			.then(result => (result ? resolver.resolve(result) : resolver.reject()))
			.catch(err => resolver.reject(err));
	});
};

const insertMessage = fromPromised(MessageModel.create.bind(MessageModel));

const getPLayersByGameIdFromGameService = (gameId) => {
	const request = superagent
		.get(`${config.get('GameServiceEndpoint')}/games/${gameId}/players`)
		.accept('application/json')
		.send();
	return fromNodeback(request.end.bind(request))();
};

// get player list in API GW
const handleAddPublicMessage = ({ gameId, source, message }) =>
	insertMessage({ game: gameId, source, message })
		.chain(() => getPLayersByGameIdFromGameService(gameId)
			.map(trace('response: '))
			.map(prop('body')))
		.map(trace('player get from game-service: '))
		.map(map(prop('username')))
		.chain(players => // players: ['username1','username2']
			sendEventToStateUpdateTopic(
				'[Message] PUBLIC_MESSAGE_ADDED',
				{ gameId, source, message, forUsers: players },
			));

const handleAddPrivateMessage = ({ gameId, source, target, message }) =>
	insertMessage({ game: gameId, source, target, message })
		.chain(() =>
			sendEventToStateUpdateTopic(
				'[Message] PRIVATE_MESSAGE_ADDED',
				{ gameId, source, target, message, forUsers: [source, target] },
			));

module.exports = {
	getMessagesByGameId,
	handleAddPublicMessage,
	handleAddPrivateMessage,
};
