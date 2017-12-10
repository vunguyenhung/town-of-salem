/*
3rd Party imports
 */
const R = require('ramda');
const Task = require('folktale/concurrency/task');

/*
Project file imports
 */
const { startPhase } = require('./entity');
const { createTrace } = require('./utils');

const trace = createTrace('src:handle-message');

const KafkaEventTypes = {
	START_PHASE: '[Phase] START_PHASE',
};

const messageToEvent = R.pipe(R.prop(['value']), JSON.parse);

const handleEvent = ({ type, payload }) => {
	switch (type) {
	case KafkaEventTypes.START_PHASE:
		return startPhase(payload);
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
