/*
3rd Party library imports
 */
const config = require('config');

/*
Project file imports
 */
const { sendGetCurrentStateRequest } = require('../utils');

const getCurrentLobbyState = sendGetCurrentStateRequest(config.get('LobbyServiceEndpoint'));

module.exports = {
	getCurrentLobbyState,
};
