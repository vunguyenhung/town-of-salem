/*
3rd Party library imports
 */
const { Producer } = require('kafka-node-driver');
const Task = require('folktale/concurrency/task');

const createUserJoinEvent = username => ({
	type: '[Lobby] USER_LEAVE',
	payload: username,
});

const createKafkaMessages = event => ([{
	topic: 'tos-lobby-events',
	messages: JSON.stringify(event),
}]);

// sendJoinLobbyEvent :: String -> Task
const sendLeaveLobbyEvent = username =>
	Task.of(createUserJoinEvent(username))
		.map(createKafkaMessages)
		.chain(Producer.send(0))
		.map(() => 'Event sent successfully!');
// TODO: catch error here.

module.exports = {
	sendLeaveLobbyEvent,
};
