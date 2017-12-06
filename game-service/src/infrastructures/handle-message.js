/*
3rd Party imports
 */
const R = require('ramda');
const Task = require('folktale/concurrency/task');

/*
Project file imports
 */

const KafkaEventTypes = {
	START_GAME_CREATE: '[Game] START_GAME_CREATE',
};

module.exports = {
	KafkaEventTypes,
};

const messageToEvent = R.pipe(R.prop(['value']), JSON.parse);

const handleEvent = event => event;

// handleMessage :: String -> Task
const handleMessage = message =>
	Task.of(messageToEvent(message))
		.chain(handleEvent);

module.exports = {
	handleMessage,
};
