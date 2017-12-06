/*
3rd Party library imports
 */
const config = require('config');

/*
Project file imports
 */
// const { trace } = require('../../utils');
const { sendGetCurrentStateRequest } = require('../utils');

const getCurrentLobbyState = sendGetCurrentStateRequest(config.get('LobbyServiceEndpoint'));

// { id: '67ac4756-0359-4722-a7b1-d33286817f86',
//  users: [ 'vunguyenhung1' ],
// isClosed: 0,
// updatedAt: '2017-11-23T15:25:07.376Z' }

module.exports = {
	getCurrentLobbyState,
};
