/*
3rd Party imports
 */
const R = require('ramda');
const Task = require('folktale/concurrency/task');

/*
Project file imports
 */
const { createTrace } = require('./utils');
const { handleAddPrivateMessage, handleAddPublicMessage } = require('./entity');

const trace = createTrace('src:handle-message');

const KafkaEventTypes = {
	ADD_PUBLIC_MESSAGE: '[Message] ADD_PUBLIC_MESSAGE',
	ADD_PRIVATE_MESSAGE: '[Message] ADD_PRIVATE_MESSAGE',
};

const messageToEvent = R.pipe(R.prop(['value']), JSON.parse);

const handleEvent = ({ type, payload }) => {
	switch (type) {
	case KafkaEventTypes.ADD_PUBLIC_MESSAGE:
		return handleAddPublicMessage(payload);
	case KafkaEventTypes.ADD_PRIVATE_MESSAGE:
		return handleAddPrivateMessage(payload);
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
