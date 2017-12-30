/* eslint-disable object-curly-newline */
/*
3rd Party library imports
 */
const { task, of } = require('folktale/concurrency/task');

/*
Project file imports
 */
const { MessageModel } = require('./database');

const getMessagesByGameId = gameId =>
	task((resolver) => {
		MessageModel.find({ game: gameId })
			.then(result => (result ? resolver.resolve(result) : resolver.reject()))
			.catch(err => resolver.reject(err));
	});

// TODO: implement this!!
const handleAddPublicMessage = ({ gameId, source, message }) => of({ gameId, source, message });

const handleAddPrivateMessage = ({ gameId, source, target, message }) =>
	of({ gameId, source, target, message });

module.exports = {
	getMessagesByGameId,
	handleAddPublicMessage,
	handleAddPrivateMessage,
};
