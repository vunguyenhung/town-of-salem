/*
3rd Party imports
 */
const R = require('ramda');
const Task = require('folktale/concurrency/task');

/*
Project file imports
 */
const { createGame, updateLastWill } = require('../entity');
const { createTrace } = require('../utils');

const trace = createTrace('src:handle-message');

const KafkaEventTypes = {
	START_GAME_CREATE: '[Game] START_GAME_CREATE',
	UPDATE_LAST_WILL: '[Game] UPDATE_LAST_WILL',
};

const messageToEvent = R.pipe(R.prop(['value']), JSON.parse);

const handleEvent = ({ type, payload }) => {
	switch (type) {
	case KafkaEventTypes.START_GAME_CREATE:
		return createGame(payload);
	case KafkaEventTypes.UPDATE_LAST_WILL:
		return updateLastWill(payload);
	default:
		return Task.of('Event is not handled!');
	}
};

// handleMessage :: String -> Task
const handleMessage = message =>
	Task.of(messageToEvent(message))
		.chain(handleEvent)
		.map(trace('handleEvent Result: '));

module.exports = {
	handleMessage,
};
