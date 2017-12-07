/*
3rd Party library imports
 */
const R = require('ramda');
const Task = require('folktale/concurrency/task');
const log = require('debug')('src:handle-message');

/*
Project file imports
 */
const { publishToStateUpdatesChannel } = require('../infrastructures/graphql/pubsub');

const messageToEvent = R.pipe(R.prop(['value']), JSON.parse);

const mapEventToStateUpdates = (event) => {
	switch (event.type) {
	case '[Lobby] LOBBY_UPDATED':
		return { lobby: event.payload, forUsers: event.payload.users };
	case '[Lobby] LEAVE_LOBBY':
		return { lobby: null, forUsers: [event.payload] };
	case '[Game] LAST_WILL_UPDATED':
	case '[Game] GAME_CREATED':
		return { game: event.payload, forUsers: event.payload.players.map(R.prop('username')) };
		// case '[Game] LAST_WILL_UPDATED':
		// 	// INFO: game will be null if we just return player here.
		// 	// => TODO: combine this with GAME_UPDATED
		// 	return { game: event.payload, forUsers: event.payload.players.map(R.prop('username')) };
		// 	{ type: [Game] LAST_WILL_UPDATED, payload: player }
	default:
		return event.payload;
	}
};

const handleEvent = event =>
	Task.of(publishToStateUpdatesChannel({ stateUpdates: mapEventToStateUpdates(event) }));

const handleMessage = message =>
	Task.of(messageToEvent(message))
		.chain(handleEvent);

module.exports = {
	handleMessage,
};
