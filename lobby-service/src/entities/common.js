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
  NoLobbyAvailable(lobbies) {
    return { lobbies };
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

// Lobby :: { id :: String, users :: [String], isClosed :: Boolean }
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

// Lobby :: { id :: String, users :: Array String, isClosed :: Boolean }
// updateLobbies :: Array Lobby -> Lobby -> Array Lobby
const updateLobbies = R.curry((toBeUpdatedLobbies, subjectLobby) =>
  R.map(originalLobby =>
    (R.eqProps('id', originalLobby, subjectLobby)
      ? subjectLobby
      : originalLobby))(toBeUpdatedLobbies));

module.exports = {
  isUsernameInLobby,
  validate,
  updateLobbies,
  lobbyUsersLength,
  LobbyErrors,
  // exports for testing purpose
  isValidLobby,
};
