/*
3rd Party library imports
 */
const R = require('ramda');
const Result = require('folktale/result');

/*
Project file imports
 */
const Entity = require('./common');

// closeLobby :: Lobby -> Lobby
const openLobby = R.assoc('isClosed', false);

// openLobbyIfNotFull :: Lobby -> Lobby
const openLobbyIfNotFull = lobby =>
  (Entity.lobbyUsersLength(lobby) < 15 ? openLobby(lobby) : lobby);

// _removeUserFromLobby :: (String, Lobby) -> Lobby
const _removeUserFromLobby = R.curry((username, lobby) => ({
  ...lobby,
  users: R.reject(R.equals(username))(lobby.users),
}));

// removeUserFromLobby :: (String, Lobby) -> Lobby
const removeUserFromLobby = R.curry((username, lobby) =>
  R.pipe(
    _removeUserFromLobby(username),
    openLobbyIfNotFull,
  )(lobby));

// findLobbyContainsUser :: (String, Array Lobby) -> Result LobbyErrors Lobby
const findLobbyContainsUser = (username, lobbies) => {
  const foundLobby = R.find(Entity.isUsernameInLobby(username))(lobbies);
  return foundLobby
    ? Result.Ok(foundLobby)
    : Result.Error(Entity.LobbyErrors.LobbiesNotContainUsername(lobbies, username));
};

// removeUser :: String -> Array Lobby -> Result (LobbyErrors String Array Lobby) Array Lobby
const removeUser = (username, lobbies) =>
  findLobbyContainsUser(username, lobbies)
    .map(removeUserFromLobby(username));

module.exports = {
  removeUser,
};
