/*
3rd Party library imports
 */
const Task = require('folktale/concurrency/task');
const superagent = require('superagent');
const config = require('config');

// sendRegisterRequest :: {username::String, password::String} -> Task Error User
const sendRegisterRequest = (user) => {
  const request = superagent
    .post(config.get('AuthenticationServiceEndpoint'))
    .accept('application/json')
    .send(user);
  return Task.fromNodeback(request.end.bind(request))();
};

module.exports = {
  sendRegisterRequest,
};
