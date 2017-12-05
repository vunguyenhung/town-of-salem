/*
3rd Party library imports
 */
const { withFilter } = require('graphql-subscriptions');
const jwt = require('jsonwebtoken');
const log = require('debug')('src:state-updates.resolver');
const R = require('ramda');

/*
Project file imports
 */
const { PUBLISH_CHANNELS, pubsub } = require('../pubsub');
const { authenticationResolver } = require('./authentication.resolver');
const { sendGetCurrentStateRequest } = require('../../../usecases/lobby/state');

const stateUpdates = {
	subscribe: withFilter(
		() => pubsub.asyncIterator(PUBLISH_CHANNELS.STATE_UPDATES),
		(payload, variables) => {
			// log('payload: ', payload);
			// log('variables: ', variables);
			// TODO: for LEAVE_LOBBY, forUsers: []
			const { forUsers } = payload.stateUpdates;
			const { someField } = payload.stateUpdates;
			log('someField', someField);
			// log('users: ', users);
			const { username } = jwt.decode(variables.token);
			// log('decoded username: ', username);
			return R.contains(username, forUsers);
		},
	),
};

const currentState = authenticationResolver
	.createResolver((obj, args, { username }) =>
		sendGetCurrentStateRequest(username)
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