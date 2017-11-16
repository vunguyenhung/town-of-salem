const { addUser } = require('./add-user');
const { removeUser } = require('./remove-user');
const { addLobby } = require('./lobby-operators');
const { updateLobbyInLobbies } = require('./lobby-operators');

module.exports = {
  addUser,
  removeUser,
  addLobby,
  updateLobbyInLobbies,
};
