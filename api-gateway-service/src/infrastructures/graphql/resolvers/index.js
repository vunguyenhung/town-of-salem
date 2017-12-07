/*
3rd Party library imports
 */
const { combineResolvers } = require('apollo-resolvers');

/*
Project file imports
 */
const { stateUpdates } = require('./state.resolver');
const { login } = require('./login.resolver');
const { register } = require('./register.resolver');
const { lobby } = require('./lobby.resolver');
const { game } = require('./game.resolver');

const resolvers = combineResolvers([
	login,
	register,
	lobby,
	stateUpdates,
	game,
]);

exports.resolvers = resolvers;
