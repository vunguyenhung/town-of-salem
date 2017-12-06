const { createError } = require('apollo-errors');
const MESSAGE = require('../message');

const InvalidCommandError = createError('InvalidCommandError', {
	message: MESSAGE.DEFAULT_INVALID_COMMAND_ERROR,
});

const PublishError = createError('PublishError', {
	message: MESSAGE.DEFAULT_PUBLISH_EVENTS_ERROR,
});

const ConsumeError = createError('ConsumeError', {
	message: MESSAGE.DEFAULT_PUBLISH_EVENTS_ERROR,
});

module.exports = {
	InvalidCommandError,
	PublishError,
	ConsumeError,
};
