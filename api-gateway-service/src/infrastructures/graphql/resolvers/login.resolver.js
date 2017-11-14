/*
3rd Party library imports
 */
const { createError } = require('apollo-errors');
const Task = require('folktale/concurrency/task');

/*
Project file imports
 */
const { baseResolver } = require('./base.resolver');
const MESSAGE = require('../../message');
const { sendLoginRequest } = require('../../../usecases/authentication/login');

const InvalidLoginError = createError('InvalidLoginError', {
  message: MESSAGE.DEFAULT_INVALID_LOGIN_ERROR,
});

const login = baseResolver.createResolver((obj, { user }) =>
  sendLoginRequest(user)
    .orElse(err => Task.rejected(new InvalidLoginError(err.message)))
    .run()
    .promise());

module.exports = {
  login: {
    Query: {
      login,
    },
  },
  sendLoginRequest,
};
