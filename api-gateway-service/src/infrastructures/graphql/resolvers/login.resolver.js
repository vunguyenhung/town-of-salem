/*
3rd Party library imports
 */
const { createError } = require('apollo-errors');
const { task } = require('folktale/concurrency/task');
const superagent = require('superagent');
const R = require('ramda');

/*
Project file imports
 */
const { baseResolver } = require('./base.resolver');
const MESSAGE = require('../../services/message');
const { improvedEnv } = require('../../../env');

const InvalidLoginError = createError('InvalidLoginError', {
  message: MESSAGE.DEFAULT_INVALID_LOGIN_ERROR,
});

// sendLoginRequest :: {username::String, password::String} -> Task Error Token
const sendLoginRequest = ({ username, password }) => task((r) => {
  superagent
    .get(improvedEnv.AUTHENTICATION_SERVICE_ENDPOINT)
    .set('username', username)
    .set('password', password)
    .end((err, res) => (err
      ? r.reject(new InvalidLoginError(err.message))
      : r.resolve(R.path(['body', 'token'], res))));
});

const login = baseResolver.createResolver((obj, { user }) =>
  sendLoginRequest(user).run().promise());

module.exports = {
  login: {
    Query: {
      login,
    },
  },
  sendLoginRequest,
};
