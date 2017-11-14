/*
3rd Party library imports
 */
const Task = require('folktale/concurrency/task');
const superagent = require('superagent');
const R = require('ramda');
const config = require('config');

const _sendLoginRequest = ({ username, password }) => {
  const request = superagent
    .get(config.get('AuthenticationServiceEndpoint'))
    .set('username', username)
    .set('password', password);
  return Task.fromNodeback(request
    .end.bind(request))();
};

// sendLoginRequest :: {username::String, password::String} -> Task Error Token
const sendLoginRequest = loginInfo =>
  _sendLoginRequest(loginInfo)
    .map(R.path(['body', 'token']));

module.exports = {
  sendLoginRequest,
};
