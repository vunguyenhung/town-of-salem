/*
3rd library imports
 */
const uuid = require('uuid/v4');
const R = require('ramda');

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

module.exports = {
  addLobby,
  // exports for testing purpose
  createLobby,
};

