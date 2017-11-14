/*
3rd Party library imports
 */
const { createError } = require('apollo-errors');
const Task = require('folktale/concurrency/task');
const R = require('ramda');

/*
Project file imports
 */
const { baseResolver } = require('./base.resolver');
const MESSAGE = require('../../message');
const { sendRegisterRequest } = require('../../../usecases/authentication/register');
const { sendLoginRequest } = require('../../../usecases/authentication/login');

const InvalidRegisterError = createError('InvalidRegisterError', {
  message: MESSAGE.DEFAULT_INVALID_REGISTER_ERROR,
});

// extractResponseErrorText :: Error -> String
const extractResponseErrorText = err => R.path(['response', 'text'])(err);

const extractResponseErrorJSON = err => R.pipe(extractResponseErrorText, JSON.parse)(err);

const register = baseResolver.createResolver((obj, { user }) =>
  sendRegisterRequest(user)
    .orElse(error =>
      Task.rejected(new InvalidRegisterError({ data: extractResponseErrorJSON(error) })))
    .chain(() => sendLoginRequest(user))
    .run()
    .promise());

exports.register = {
  Mutation: {
    register,
  },
};
