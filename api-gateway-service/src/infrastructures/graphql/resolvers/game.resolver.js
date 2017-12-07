/*
3rd Party library imports
 */

/*
Project file imports
 */
const { authenticationResolver } = require('./authentication.resolver');
const { sendUpdateLastWillEvent } = require('../../../usecases/game');

const updateLastWill = authenticationResolver.createResolver((root, { lastWill }, { username }) =>
	sendUpdateLastWillEvent({ username, lastWill }).run().promise());

module.exports = {
	game: {
		Mutation: {
			updateLastWill,
		},
	},
};

