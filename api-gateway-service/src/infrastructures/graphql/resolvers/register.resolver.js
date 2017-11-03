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
const { sendLoginRequest } = require('./login.resolver');
const MESSAGE = require('../../services/message');
const { improvedEnv } = require('../../../env');

const InvalidRegisterError = createError('InvalidRegisterError', {
  message: MESSAGE.DEFAULT_INVALID_REGISTER_ERROR,
});

// extractResponseErrorText :: Error -> String
const extractResponseErrorText = err => R.path(['response', 'text'])(err);

const extractResponseErrorJSON = err => R.pipe(extractResponseErrorText, JSON.parse)(err);

// sendRegisterRequest :: {username::String, password::String} -> Task Error User
const sendRegisterRequest = user => task((r) => {
  superagent
    .post(improvedEnv.AUTHENTICATION_SERVICE_ENDPOINT)
    .accept('application/json')
    .send(user)
    .end(err => (err
      ? r.reject(new InvalidRegisterError({ data: extractResponseErrorJSON(err) }))
      : r.resolve(user)));
});

// register then login, return token if both of them successfully
const register = baseResolver.createResolver((obj, { user }) =>
  sendRegisterRequest(user)
    .chain(sendLoginRequest)
    .run().promise());

exports.register = {
  Mutation: {
    register,
  },
};
