/*
3rd Party library imports
 */
const Task = require('folktale/concurrency/task');
const superagent = require('superagent');
const R = require('ramda');

/*
Project file imports
 */

const _sendGetCurrentStateRequest = (endpoint, username) => {
	const request = superagent
		.get(`${endpoint}/state`)
		.set('username', username);
	return Task.fromNodeback(request.end.bind(request))();
};

const sendGetCurrentStateRequest = R.curry((endpoint, username) =>
	_sendGetCurrentStateRequest(endpoint, username)
		.map(R.prop('body')));

module.exports = {
	sendGetCurrentStateRequest,
};
