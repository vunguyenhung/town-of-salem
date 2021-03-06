const { createAction } = require('redux-actions');

const ActionTypes = {
	ADD_USER: '[Lobby] ADD_USER',
	ADD_USER_FAILED: '[Lobby] ADD_USER_FAILED',
	REMOVE_USER: '[Lobby] REMOVE_USER',
	REMOVE_USER_FAILED: '[Lobby] REMOVE_USER_FAILED',
	REMOVE_LOBBY: '[Lobby] REMOVE_LOBBY',
	CLOSING_LOBBY: '[Lobby] CLOSING_LOBBY',
	SEND_KAFKA_EVENT: '[Lobby] SEND_KAFKA_EVENT',
};

const AddUser = createAction(ActionTypes.ADD_USER);
const AddUserFailed = createAction(ActionTypes.ADD_USER_FAILED);

const RemoveUser = createAction(ActionTypes.REMOVE_USER);
const RemoveUserFailed = createAction(ActionTypes.REMOVE_USER_FAILED);

const ClosingLobby = createAction(ActionTypes.CLOSING_LOBBY);
const RemoveLobby = createAction(ActionTypes.REMOVE_LOBBY);

const SendKafkaEvent = createAction(ActionTypes.SEND_KAFKA_EVENT);

module.exports = {
	ActionTypes,

	AddUser,
	AddUserFailed,

	RemoveUser,
	RemoveUserFailed,
	ClosingLobby,
	RemoveLobby,

	SendKafkaEvent,
};
