// convert lobby to Kafka message, then send them
// that function return a promise

/*
3rd Party library imports
 */
const { Producer } = require('kafka-node-driver');
const Task = require('folktale/concurrency/task');
const R = require('ramda');

/*
Project file imports
 */
const { trace } = require('../../utils');

const createEvent = (type, payload) => ({ type, payload });

const createKafkaMessage = R.curry((topic, messages) =>
	([{ topic, messages: JSON.stringify(messages) }]));

// sendEvent :: (String, String, Object) => Promise
const sendEvent = (topic, type, payload) =>
	Task.of(createEvent(type, payload))
		.map(trace('After create Event: '))
		.map(createKafkaMessage(topic))
		.map(trace('After create Kafka message: '))
		.chain(Producer.send(0));

module.exports = {
	sendEvent,
};
