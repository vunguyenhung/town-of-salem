/*
3rd Party library imports
 */
const R = require('ramda');
const Result = require('folktale/result');
const config = require('config');

/*
Project file imports
 */
const Common = require('./common');
const { createLobby } = require('./lobby-operators');

// closeLobby :: Lobby -> Lobby
const closeLobby = R.assoc('isClosed', 10);

// closeLobbyIfFull :: Lobby -> Lobby
const closeLobbyIfFull = lobby =>
	(Common.lobbyUsersLength(lobby) >= config.get('LobbyCapacity') ? closeLobby(lobby) : lobby);

// addUserToLobby :: (String, Lobby) -> Lobby
const addUserToLobby = R.curry((username, lobby) => ({
	...lobby,
	users: [...lobby.users, username],
	updatedAt: new Date(),
}));

// findAvailableLobby :: Array Lobby -> Result (LobbyErrors Array Lobby) Lobby
const findAvailableLobby = R.curry((username, lobbies) => {
	const foundLobby = R.find(R.whereEq({ isClosed: 0 }))(lobbies);
	return foundLobby
		? Result.Ok(foundLobby)
		: Result.Error(Common.LobbyErrors.NoLobbyAvailable(lobbies, username));
});

// addUser :: User -> Array Lobby -> Result (LobbyErrors Array Lobby) Array Lobby
const addUser = R.curry((username, lobbies) =>
	findAvailableLobby(username, lobbies)
		.orElse(() => Result.of(createLobby()))
		.map(addUserToLobby(username))
		.map(closeLobbyIfFull)
		.map(Common.updateOrAppend(lobbies)));

module.exports = {
	addUser,

	// exports for testing purpose
	addUserToLobby,
};

