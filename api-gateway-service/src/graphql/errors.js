const { createError } = require('apollo-errors');
const MESSAGE = require('../services/message');

const InvalidCommandError = createError('InvalidCommandError', {
  message: MESSAGE.DEFAULT_INVALID_COMMAND_ERROR,
});

const PublishEventsError = createError('PublishError', {
  message: MESSAGE.DEFAULT_PUBLISH_EVENTS_ERROR,
});

module.exports = {
  InvalidCommandError,
  PublishError: PublishEventsError,
};
