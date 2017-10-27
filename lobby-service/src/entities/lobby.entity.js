/*
3rd Party library imports
 */
const R = require('ramda');
const uuid = require('uuid/v4');
const Result = require('folktale/result');
const { union, derivations } = require('folktale/adt/union');

/*
Project file imports
 */
const { trace, notNil } = require('../utils');

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

// isValidUsername :: String -> Result (LobbyErrors String) String
const isValidUsername = username =>
  (username.trim()
    ? Result.Ok(username)
    : Result.Error(LobbyErrors.EmptyUsername(username)));

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
// _addUserToLobby :: (String, Lobby) -> Lobby
const _addUserToLobby = R.curry((username, lobby) => ({
  ...lobby,
  users: [...lobby.users, username],
}));

// closeLobby :: Lobby -> Lobby
const closeLobby = R.assoc('isClosed', true);

// lobbyUsersLength :: Lobby -> Number | Undefined
const lobbyUsersLength = R.path(['users', 'length']);

// closeLobbyIfFull :: Lobby -> Lobby
const closeLobbyIfFull = lobby =>
  (lobbyUsersLength(lobby) >= 15 ? closeLobby(lobby) : lobby);

// checkIfFull :: Lobby -> Lobby
const checkIfFull = lobby =>
  (lobbyUsersLength(lobby) >= 15
    ? Result.Error(LobbyErrors.LobbyFull(lobby))
    : Result.Ok(lobby));

// Lobby :: { id :: String, users :: Array String, isClosed :: Boolean }
// addUserToLobby :: User -> Lobby -> Result (LobbyErrors Lobby) Lobby
const addUserToLobby = R.curry((username, lobby) =>
  validate(username, lobby)
    .chain(checkIfFull)
    .map(_addUserToLobby(username))
    .map(closeLobbyIfFull));

// Lobby :: { id :: String, users :: Array String, isClosed :: Boolean }
// findAvailableLobby :: Array Lobby -> Result (LobbyErrors Array Lobby) Lobby
const findAvailableLobby = (lobbies) => {
  const foundLobby = R.find(R.whereEq({ isClosed: false }))(lobbies);
  return foundLobby ? Result.Ok(foundLobby) : Result.Error(LobbyErrors.NoLobbyAvailable(lobbies));
};

// Lobby :: { id :: String, users :: Array String, isClosed :: Boolean }
// updateLobbies :: Array Lobby -> Lobby -> Array Lobby
const updateLobbies = R.curry((toBeUpdatedLobbies, subjectLobby) =>
  R.map(originalLobby =>
    (R.eqProps('id', originalLobby, subjectLobby)
      ? subjectLobby
      : originalLobby))(toBeUpdatedLobbies));

const isUsernameInLobby = R.curry((username, lobby) =>
  R.pipe(
    R.prop('users'),
    R.contains(username),
  )(lobby));

// checkIfLobbiesContainsUser :: (Array Lobby, String) -> Result LobbyErrors Array Lobby
const checkIfLobbiesContainsUser = (lobbies, username) => {
  const foundLobby = R.find(isUsernameInLobby(username))(lobbies);
  return foundLobby
    ? Result.Error(LobbyErrors.LobbiesAlreadyContainsUser(lobbies, username))
    : Result.Ok(lobbies);
};

// Lobby :: { id :: String, users :: [String], isClosed :: Boolean }
// addUser :: User -> Array Lobby -> Result (LobbyErrors Array Lobby) Array Lobby
const addUser = R.curry((username, lobbies) => (
  checkIfLobbiesContainsUser(lobbies, username)
    .chain(findAvailableLobby)
    .chain(addUserToLobby(username))
    .map(updateLobbies(lobbies))
));

// Lobby :: { id :: String, users :: Array String, isClosed :: Boolean }
// createLobby :: () -> Lobby
const createLobby = () => ({
  id: uuid(),
  users: [],
  isClosed: false,
});

// This function doesn't need to return result, because it has no error to store
// Lobby :: { id :: String, users :: Array String, isClosed :: Boolean }
// addLobby :: Array Lobby -> Array Lobby
const addLobby = R.append(createLobby());

const findLobbyContainsUser = (username, lobbies) => {
  const foundLobby = R.find(isUsernameInLobby(username))(lobbies);
  return foundLobby
    ? Result.Ok(foundLobby)
    : Result.Error(LobbyErrors.LobbiesNotContainUsername(lobbies, username));
};

// closeLobby :: Lobby -> Lobby
const openLobby = R.assoc('isClosed', false);

const openLobbyIfNotFull = lobby =>
  (lobbyUsersLength(lobby) < 15 ? openLobby(lobby) : lobby);

const _removeUserFromLobby = R.curry((username, lobby) => ({
  ...lobby,
  users: R.reject(R.equals(username))(lobby.users),
}));

const removeUserFromLobby = R.curry((username, lobby) =>
  R.pipe(
    _removeUserFromLobby(username),
    openLobbyIfNotFull,
  )(lobby));

// removeUser :: String -> Array Lobby -> Result (LobbyErrors String Array Lobby) Array Lobby
const removeUser = (username, lobbies) =>
  findLobbyContainsUser(username, lobbies)
    .map(removeUserFromLobby(username))
    .map(updateLobbies(lobbies));

module.exports = {
  // exports for testing purpose
  addUserToLobby,
  createLobby,
  isValidLobby,

  addUser,
  removeUser,
  addLobby,
  LobbyErrors,
};
