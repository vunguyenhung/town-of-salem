/* eslint-disable function-paren-newline */
/*
3rd Party library imports
 */
const R = require('ramda');
const Task = require('folktale/concurrency/task');
const log = require('debug')('src:handle-message');

/*
Project file imports
 */
const { publishToStateUpdatesChannel, publishToMessageChannel } = require(
	'../infrastructures/graphql/pubsub');

const messageToEvent = R.pipe(R.prop(['value']), JSON.parse);

const handleEvent = (event) => {
	switch (event.type) {
	case '[Lobby] LOBBY_UPDATED':
		return Task.of(publishToStateUpdatesChannel(
			{ stateUpdates: { lobby: event.payload, forUsers: event.payload.users } }));
	case '[Lobby] LEAVE_LOBBY':
		return Task.of(publishToStateUpdatesChannel(
			{ stateUpdates: { lobby: null, forUsers: [event.payload] } }));
	case '[Game] GAME_UPDATED':
	case '[Game] GAME_CREATED':
		return Task.of(publishToStateUpdatesChannel(
			{
				stateUpdates: {
					game: event.payload,
					forUsers: event.payload.players.map(R.prop('username')),
				},
			}));
	case '[Game] GAME_ENDED':
		return Task.of(publishToStateUpdatesChannel({
			stateUpdates: {
				game: { ...event.payload, ended: true },
				forUsers: event.payload.players.map(R.prop('username')),
			},
		}));
	case '[Message] PUBLIC_MESSAGE_ADDED':
		// event.payload = { game, source, message, forUsers: ['username1', 'username2'] }
		return Task.of(publishToMessageChannel({
			message: event.payload,
		}));
	case '[Message] PRIVATE_MESSAGE_ADDED':
		// event.payload = { message: { game, source, target, message }, forUsers: [source, target] }
		return Task.of(publishToMessageChannel({
			message: event.payload,
		}));
	default:
		return Task.of('Event not handled!');
	}
};

const handleMessage = message =>
	Task.of(messageToEvent(message))
		.chain(handleEvent);

module.exports = {
	handleMessage,
};
