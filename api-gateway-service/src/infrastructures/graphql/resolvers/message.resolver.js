/* eslint-disable no-shadow */
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
const { baseResolver } = require('./base.resolver');
const {
	getCurrentMessages,
	sendAddPrivateMessage,
	sendAddPublicMessage,
} = require('../../../usecases/message');
const { trace } = require('../../../utils');

const message = {
	subscribe: withFilter(
		() => pubsub.asyncIterator(PUBLISH_CHANNELS.MESSAGE),
		(payload, variables) => {
			const { forUsers } = payload.message;
			const { username } = jwt.decode(variables.token);
			return R.contains(username, forUsers);
		},
	),
};

const currentMessages = baseResolver.createResolver((obj, { gameId }) => {
	log('gameId: ', gameId);
	return getCurrentMessages(gameId)
		.map(trace('currentState Result: '))
		.map(R.map(message => R.assoc('gameId', message.game)(message)))
		.run()
		.promise();
});

// message: {source, target, message, gameId}
const addPublicMessage = baseResolver.createResolver((obj, { message }) =>
	sendAddPublicMessage(message).run().promise());

const addPrivateMessage = baseResolver.createResolver((obj, { message }) =>
	sendAddPrivateMessage(message).run().promise());

exports.message = {
	Query: {
		currentMessages,
	},
	Mutation: {
		addPublicMessage,
		addPrivateMessage,
	},
	Subscription: {
		message,
	},
};
