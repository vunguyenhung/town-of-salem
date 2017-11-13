/*
3rd Party library imports
 */
const R = require('ramda');
const Result = require('folktale/result');
/*
Project file imports
 */
const {
  LobbyErrors,
  isUsernameInLobby,
  validate,
  updateLobbies,
  lobbyUsersLength,
} = require('./common');

// closeLobby :: Lobby -> Lobby
const closeLobby = R.assoc('isClosed', true);

// closeLobbyIfFull :: Lobby -> Lobby
const closeLobbyIfFull = lobby =>
  (lobbyUsersLength(lobby) >= 15 ? closeLobby(lobby) : lobby);

// _addUserToLobby :: (String, Lobby) -> Lobby
const _addUserToLobby = R.curry((username, lobby) => ({
  ...lobby,
  users: [...lobby.users, username],
}));

// checkIfFull :: Lobby -> Lobby
const checkIfFull = lobby =>
  (lobbyUsersLength(lobby) >= 15
    ? Result.Error(LobbyErrors.LobbyFull(lobby))
    : Result.Ok(lobby));

// addUserToLobby :: User -> Lobby -> Result (LobbyErrors Lobby) Lobby
const addUserToLobby = R.curry((username, lobby) =>
  validate(username, lobby)
    .chain(checkIfFull)
    .map(_addUserToLobby(username))
    .map(closeLobbyIfFull));

// findAvailableLobby :: Array Lobby -> Result (LobbyErrors Array Lobby) Lobby
const findAvailableLobby = R.curry((username, lobbies) => {
  const foundLobby = R.find(R.whereEq({ isClosed: false }))(lobbies);
  return foundLobby
    ? Result.Ok(foundLobby)
    : Result.Error(LobbyErrors.NoLobbyAvailable(lobbies, username));
});

// checkIfLobbiesContainsUser :: (Array Lobby, String) -> Result LobbyErrors Array Lobby
const checkIfLobbiesContainsUser = (lobbies, username) => {
  const foundLobby = R.find(isUsernameInLobby(username))(lobbies);
  return foundLobby
    ? Result.Error(LobbyErrors.LobbiesAlreadyContainsUser(lobbies, username))
    : Result.Ok(lobbies);
};

// TODO: add recovery from addUser error here.
// Add lobby and then add userAgain if it is a NoLobbyAvailable
// addUser :: User -> Array Lobby -> Result (LobbyErrors Array Lobby) Array Lobby
const addUser = R.curry((username, lobbies) => (
  checkIfLobbiesContainsUser(lobbies, username)
    .chain(findAvailableLobby(username))
    .chain(addUserToLobby(username))
));

module.exports = {
  addUser,

  // exports for testing purpose
  addUserToLobby,
};

