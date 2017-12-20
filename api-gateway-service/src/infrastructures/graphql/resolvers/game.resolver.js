/*
3rd Party library imports
 */

/*
Project file imports
 */
const { authenticationResolver } = require('./authentication.resolver');
const { baseResolver } = require('./base.resolver');
const { sendUpdateLastWillEvent, sendInteractEvent } = require('../../../usecases/game');

const updateLastWill = authenticationResolver.createResolver((root, { lastWill }, { username }) =>
	sendUpdateLastWillEvent({ username, lastWill }).run().promise());

const interact = baseResolver.createResolver((root, input) =>
	sendInteractEvent(input).run().promise());

module.exports = {
	game: {
		Mutation: {
			updateLastWill,
			interact,
		},
	},
};

