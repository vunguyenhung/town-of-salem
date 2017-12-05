/*
3rd Party library imports
 */
const Task = require('folktale/concurrency/task');
const superagent = require('superagent');
const R = require('ramda');
const config = require('config');

/*
Project file imports
 */
// const { trace } = require('../../utils');

const _sendGetCurrentStateRequest = (username) => {
  const request = superagent
    .get(`${config.get('LobbyServiceEndpoint')}/state`)
    .set('username', username);
  return Task.fromNodeback(request.end.bind(request))();
};

const sendGetCurrentStateRequest = username =>
  _sendGetCurrentStateRequest(username)
    .map(R.prop('body'))
    .map(lobby => ({ lobby }));

// { id: '67ac4756-0359-4722-a7b1-d33286817f86',
//  users: [ 'vunguyenhung1' ],
// isClosed: 0,
// updatedAt: '2017-11-23T15:25:07.376Z' }

module.exports = {
  sendGetCurrentStateRequest,
};
