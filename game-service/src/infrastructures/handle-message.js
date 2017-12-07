/*
3rd Party imports
 */
const R = require('ramda');
const Task = require('folktale/concurrency/task');

/*
Project file imports
 */
const { createGame } = require('../entity');
const { createTrace } = require('../utils');

const trace = createTrace('src:handle-message');

const KafkaEventTypes = {
	START_GAME_CREATE: '[Game] START_GAME_CREATE',
	// createGame a new game in DB,
	// send Kafka Message to tos-state-update-events
	//    message:
	//      type: [Game] GAME_CREATED
	//      payload: { id: ...,  users: [{username: 'something', role: 'SERIAL_KILLER'}] }

};

const messageToEvent = R.pipe(R.prop(['value']), JSON.parse);

// switch event.type:
// case: 'START_GAME_CREATE':

const handleEvent = event =>
	createGame(event.payload);

// handleMessage :: String -> Task
const handleMessage = message =>
	Task.of(messageToEvent(message))
		.chain(handleEvent)
		.map(trace('handleEvent Result: '));

module.exports = {
	handleMessage,
};
