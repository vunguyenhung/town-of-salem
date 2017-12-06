/* eslint-disable global-require */
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

module.exports = {
	createTrace,
	sendEventToStateUpdateTopic,
};
