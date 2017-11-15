/*
3rd library imports
 */
const uuid = require('uuid/v4');
const R = require('ramda');

// createLobby :: () -> Lobby
const createLobby = () => ({
  id: uuid(),
  users: [],
  isClosed: false,
  updatedAt: new Date(),
});

// addLobby :: Array Lobby -> Array Lobby
const addLobby = R.append(createLobby());

module.exports = {
  addLobby,
  createLobby,
};

