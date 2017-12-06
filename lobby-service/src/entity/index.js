const { addUser } = require('./add-user');
const { removeUser } = require('./remove-user');
const { addLobby, removeLobby } = require('./lobby-operators');
const { updateLobbyInLobbies } = require('./lobby-operators');

module.exports = {
	addUser,
	removeUser,
	addLobby,
	removeLobby,
	updateLobbyInLobbies,
};
