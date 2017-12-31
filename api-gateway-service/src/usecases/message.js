/*
3rd Party library imports
 */
const { Producer } = require('kafka-node-driver');
const Task = require('folktale/concurrency/task');
const superagent = require('superagent');
const R = require('ramda');
const config = require('config');

/*
Project file imports
 */

const _sendGetCurrentMessagesRequest = (endpoint, gameId) => {
	const request = superagent
		.get(`${endpoint}/messages/${gameId}`)
		.accept('application/json')
		.send();
	return Task.fromNodeback(request.end.bind(request))();
};

const sendGetCurrentMessagesRequest = R.curry((endpoint, gameId) =>
	_sendGetCurrentMessagesRequest(endpoint, gameId)
		.map(R.prop('body')));

const getCurrentMessages = sendGetCurrentMessagesRequest(config.get('MessageServiceEndpoint'));

const createAddPublicMessageEvent = message => ({
	type: '[Message] ADD_PUBLIC_MESSAGE',
	payload: message,
});

const createAddPrivateMessageEvent = message => ({
	type: '[Message] ADD_PRIVATE_MESSAGE',
	payload: message,
});

const createKafkaMessages = event => ([{
	topic: 'tos-message-events',
	messages: JSON.stringify(event),
}]);

const sendAddPublicMessage = message =>
	Task.of(createAddPublicMessageEvent(message))
		.map(createKafkaMessages)
		.chain(Producer.send(0))
		.map(() => 'Event sent successfully!');

const sendAddPrivateMessage = message =>
	Task.of(createAddPrivateMessageEvent(message))
		.map(createKafkaMessages)
		.chain(Producer.send(0))
		.map(() => 'Event sent successfully!');

module.exports = {
	getCurrentMessages,
	sendAddPublicMessage,
	sendAddPrivateMessage,
};
