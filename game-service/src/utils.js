/* eslint-disable global-require,no-param-reassign */
/*
3rd Party library imports
 */
const R = require('ramda');
const Task = require('folktale/concurrency/task');
const { Producer } = require('kafka-node-driver');

const createTrace = namespace => R.curry((message, something) => {
	require('debug')(namespace)(message, something);
	return something;
});

const createEvent = (type, payload) => ({ type, payload });

const createKafkaMessage = R.curry((topic, messages) =>
	([{ topic, messages: JSON.stringify(messages) }]));

// sendEvent :: (String, String, Object) => Promise
const sendEvent = R.curry((topic, type, payload) =>
	Task.of(createEvent(type, payload))
		.map(createKafkaMessage(topic))
		.chain(Producer.send(0)));

const sendEventToStateUpdateTopic = sendEvent('tos-state-update-events');

const sendEventToPhaseTopic = sendEvent('tos-phase-events');

const shuffle = (arr) => {
	for (let i = arr.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
};

module.exports = {
	createTrace,
	sendEventToStateUpdateTopic,
	sendEventToPhaseTopic,
	shuffle,
};
