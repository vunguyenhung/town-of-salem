/*
3rd Party library imports
 */
const R = require('ramda');
const Result = require('folktale/result');

/*
Project file imports
 */
const {
  LobbyErrors, isUsernameInLobby, lobbyUsersLength, updateLobbies,
} = require('./common');

// closeLobby :: Lobby -> Lobby
const openLobby = R.assoc('isClosed', false);

// openLobbyIfNotFull :: Lobby -> Lobby
const openLobbyIfNotFull = lobby =>
  (lobbyUsersLength(lobby) < 15 ? openLobby(lobby) : lobby);

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
  const foundLobby = R.find(isUsernameInLobby(username))(lobbies);
  return foundLobby
    ? Result.Ok(foundLobby)
    : Result.Error(LobbyErrors.LobbiesNotContainUsername(lobbies, username));
};

// removeUser :: String -> Array Lobby -> Result (LobbyErrors String Array Lobby) Array Lobby
const removeUser = (username, lobbies) =>
  findLobbyContainsUser(username, lobbies)
    .map(removeUserFromLobby(username))
    .map(updateLobbies(lobbies));

module.exports = {
  removeUser,
};
