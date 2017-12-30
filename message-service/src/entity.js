/* eslint-disable object-curly-newline */
/*
3rd Party library imports
 */
const { task, of, fromPromised } = require('folktale/concurrency/task');

/*
Project file imports
 */
const { MessageModel } = require('./database');
const { sendEventToStateUpdateTopic } = require('./utils');

const getMessagesByGameId = gameId =>
	task((resolver) => {
		MessageModel.find({ game: gameId })
			.then(result => (result ? resolver.resolve(result) : resolver.reject()))
			.catch(err => resolver.reject(err));
	});

const insertMessage = fromPromised(MessageModel.insert.bind(MessageModel));

const handleAddPublicMessage = ({ gameId, source, message }) =>
	insertMessage({ gameId, source, message })
		.chain(() =>
			sendEventToStateUpdateTopic(
				'[Message] PUBLIC_MESSAGE_ADDED',
				{ gameId, source, message },
			));

const handleAddPrivateMessage = ({ gameId, source, target, message }) =>
	insertMessage({ gameId, source, target, message })
		.chain(() =>
			sendEventToStateUpdateTopic(
				'[Message] PRIVATE_MESSAGE_ADDED',
				{ gameId, source, target, message },
			));

module.exports = {
	getMessagesByGameId,
	handleAddPublicMessage,
	handleAddPrivateMessage,
};
