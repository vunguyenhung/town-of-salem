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
	default:
		return event.payload;
	}
};

// TODO: add forUsers:[] to stateUpdates
const handleEvent = event =>
	Task.of(publishToStateUpdatesChannel({ stateUpdates: mapEventToStateUpdates(event) }));

const handleMessage = message =>
	Task.of(messageToEvent(message))
		.chain(handleEvent);

module.exports = {
	handleMessage,
};
