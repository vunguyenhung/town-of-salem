/*
3rd Party library imports
 */
const { Producer } = require('kafka-node-driver');
const Task = require('folktale/concurrency/task');

/*
Project file imports
 */

const createUpdateLastWillEvent = ({ username, lastWill }) => ({
	type: '[Game] UPDATE_LAST_WILL',
	payload: { username, lastWill },
});

const createInteractEvent = interaction => ({
	type: '[Game] INTERACT',
	payload: interaction,
});

const createKafkaMessages = event => ([{
	topic: 'tos-game-events',
	messages: JSON.stringify(event),
}]);

// sendJoinLobbyEvent :: String -> Task
const sendUpdateLastWillEvent = ({ username, lastWill }) =>
	Task.of(createUpdateLastWillEvent({ username, lastWill }))
		.map(createKafkaMessages)
		.chain(Producer.send(0))
		.map(() => 'Event sent successfully!');
// TODO: catch error here.

const sendInteractEvent = interaction =>
	Task.of(createInteractEvent(interaction))
		.map(createKafkaMessages)
		.chain(Producer.send(0))
		.map(() => 'Event sent successfully!');

module.exports = {
	sendUpdateLastWillEvent,
	sendInteractEvent,
};

