/*
3rd Party library imports
 */
const config = require('config');

/*
Project file imports
 */
const { sendGetCurrentStateRequest } = require('../utils');

const getCurrentGameState = sendGetCurrentStateRequest(config.get('GameServiceEndpoint'));

module.exports = {
	getCurrentGameState,
};
