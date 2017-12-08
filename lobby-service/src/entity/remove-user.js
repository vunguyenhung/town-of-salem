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

// closeLobby :: Lobby -> Lobby
const openLobby = R.assoc('isClosed', 0);

// openLobbyIfNotFull :: Lobby -> Lobby
const openLobbyIfNotFull = lobby =>
	(Common.lobbyUsersLength(lobby) < config.get('LobbyCapacity') ? openLobby(lobby) : lobby);

// _removeUserFromLobby :: (String, Lobby) -> Lobby
const removeUserFromLobby = R.curry((username, lobby) => ({
	...lobby,
	users: R.reject(R.equals(username))(lobby.users),
}));

// findLobbyContainsUser :: (String, Array Lobby) -> Result LobbyErrors Lobby
const findLobbyContainsUser = R.curry((username, lobbies) => {
	const foundLobby = R.find(Common.isUsernameInLobby(username))(lobbies);
	return foundLobby
		? Result.Ok(foundLobby)
		: Result.Error(Common.LobbyErrors.LobbiesNotContainUsername(lobbies, username));
});

// removeUser :: String -> Array Lobby -> Result (LobbyErrors String Array Lobby) Array Lobby
const removeUser = (username, lobbies) =>
	findLobbyContainsUser(username, lobbies)
		.map(removeUserFromLobby(username))
		.map(openLobbyIfNotFull)
		.map(Common.updateOrAppend(lobbies));

module.exports = {
	removeUser,
	findLobbyContainsUser,
};
