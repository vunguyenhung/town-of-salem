/*
3rd Party library imports
 */
const R = require('ramda');
const Result = require('folktale/result');
const uuid = require('uuid/v4');

/*
Project file imports
 */
const { updateOrAppend } = require('./common');

// createLobby :: () -> Lobby
const createLobby = () => ({
	id: uuid(),
	users: [],
	isClosed: 0,
	updatedAt: new Date(),
});

// addLobby :: Array Lobby -> Array Lobby
const addLobby = R.append(createLobby());

const closeLobby = R.assoc('isClosed', 1);

const openLobby = R.assoc('isClosed', 0);

const updateLobbyInLobbies = R.curry((lobby, closedIn, lobbies) =>
	Result.of(lobby)
		.map(R.assoc('isClosed', closedIn))
		.map(R.assoc('updatedAt', new Date()))
		.map(updateOrAppend(lobbies)));

const removeLobby = (lobbyId, lobbies) =>
	R.reject(R.propEq('id')(lobbyId))(lobbies);

module.exports = {
	updateLobbyInLobbies,
	addLobby,
	closeLobby,
	openLobby,
	createLobby,
	removeLobby,
};
