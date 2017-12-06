/*
3rd Party library imports
 */
const { withFilter } = require('graphql-subscriptions');
const jwt = require('jsonwebtoken');
const log = require('debug')('src:state-updates.resolver');
const R = require('ramda');
const { waitAll, of } = require('folktale/concurrency/task');

/*
Project file imports
 */
const { PUBLISH_CHANNELS, pubsub } = require('../pubsub');
const { authenticationResolver } = require('./authentication.resolver');
const { getCurrentLobbyState } = require('../../../usecases/lobby/state');
const { getCurrentGameState } = require('../../../usecases/game/state');
const { trace } = require('../../../utils');


const stateUpdates = {
	subscribe: withFilter(
		() => pubsub.asyncIterator(PUBLISH_CHANNELS.STATE_UPDATES),
		(payload, variables) => {
			const { forUsers } = payload.stateUpdates;
			const { username } = jwt.decode(variables.token);
			return R.contains(username, forUsers);
		},
	),
};

const currentState = authenticationResolver
	.createResolver((obj, args, { username }) =>
		waitAll([
			getCurrentLobbyState(username),
			getCurrentGameState(username).orElse(() => of(null)),
		]).map(R.zipObj(['lobby', 'game']))
			.map(trace('currentState Result: '))
			// {lobby: {...}}
			// {lobby: {}, game: {}}
			.run()
			.promise());

exports.stateUpdates = {
	Query: {
		currentState,
	},
	Subscription: {
		stateUpdates,
	},
};
