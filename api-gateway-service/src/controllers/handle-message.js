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
	// log('event: ', event);
	// return ({
	// 	lobby: event.payload, someField: 'asd',
	// });
	switch (event.type) {
	case '[Lobby] LOBBY_UPDATED':
		return { lobby: event.payload, forUsers: event.payload.users };
	case '[Lobby] LEAVE_LOBBY':
		return { lobby: null, forUsers: [event.payload] };
	default:
		return event.payload;
	}
};

// TODO: implement mapEvent fn when we have more event
// lobby service will send clear lobby event to api gateway.
// {type: '[Lobby] LEAVE_LOBBY', payload: 'vunguyenhung'}

// TODO: add forUsers:[] to stateUpdates
const handleEvent = event =>
	Task.of(publishToStateUpdatesChannel({ stateUpdates: mapEventToStateUpdates(event) }));

const handleMessage = message =>
	Task.of(messageToEvent(message))
		.chain(handleEvent);

module.exports = {
	handleMessage,
};
