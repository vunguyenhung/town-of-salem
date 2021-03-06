/*
3rd library imports
 */
const R = require('ramda');
const Result = require('folktale/result');

/*
Project file imports
 */
const { union, derivations } = require('folktale/adt/union');
const { notNil } = require('../utils');

const LobbyErrors = union('lobby-errors', {
	EmptyUsername(username) {
		return { username };
	},
	MissingFields(lobby) {
		return { lobby };
	},
	NoLobbyAvailable(lobbies, username) {
		return { lobbies, username };
	},
	LobbiesNotContainUsername(lobbies, username) {
		return { lobbies, username };
	},
	LobbyFull(lobby) {
		return { lobby };
	},
	LobbiesAlreadyContainsUser(lobbies, username) {
		return { lobbies, username };
	},
}).derive(derivations.equality, derivations.debugRepresentation);

const isUsernameInLobby = R.curry((username, lobby) =>
	R.pipe(
		R.prop('users'),
		R.contains(username),
	)(lobby));

// isValidUsername :: String -> Result (LobbyErrors String) String
const isValidUsername = username =>
	(username.trim()
		? Result.Ok(username)
		: Result.Error(LobbyErrors.EmptyUsername(username)));

// lobbyUsersLength :: Lobby -> Number | Undefined
const lobbyUsersLength = R.path(['users', 'length']);

// isValidLobby :: Lobby -> Result (LobbyErrors Lobby) Lobby
const isValidLobby = lobby =>
	(R.where({
		id: notNil,
		users: notNil,
		isClosed: notNil,
	})(lobby) ? Result.Ok(lobby) : Result.Error(LobbyErrors.MissingFields(lobby)));

// validate :: (String, Lobby) -> Result (LobbyErrors String | Lobby) Lobby
const validate = (username, lobby) =>
	isValidUsername(username).chain(() => isValidLobby(lobby));

// updateLobbies :: Array Lobby -> Lobby -> Array Lobby
const updateLobbies = R.curry((toBeUpdatedLobbies, subjectLobby) =>
	R.map(originalLobby =>
		(R.eqProps('id', originalLobby, subjectLobby)
			? subjectLobby
			: originalLobby))(toBeUpdatedLobbies));

const updateOrAppend = R.curry((sourceLobbies, subjectLobby) => {
	const index = R.findIndex(R.eqProps('id', subjectLobby))(sourceLobbies);
	return R.equals(index, -1)
		? R.append(subjectLobby)(sourceLobbies)
		: R.update(index, subjectLobby)(sourceLobbies);
});

module.exports = {
	isUsernameInLobby,
	validate,
	updateLobbies,
	updateOrAppend,
	lobbyUsersLength,
	LobbyErrors,

	// exports for testing purpose
	isValidLobby,
};
