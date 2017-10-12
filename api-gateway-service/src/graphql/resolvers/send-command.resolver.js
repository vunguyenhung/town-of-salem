const { baseResolver } = require('./base.resolver');
const { commandToEvents } = require('../../services/command');
const { createError } = require('apollo-errors');

const { MESSAGE } = require('../../services/message');

const { producerManager } = require('../../kafka/producer');

const R = require('ramda');
const { Either } = require('ramda-fantasy');

const { eitherThrowErrorOrReturnIdentity } = require('../../services/utils');

const InvalidCommandError = createError('InvalidCommandError', {
  message: MESSAGE.DEFAULT_INVALID_COMMAND_ERROR,
});

const sendCommand = baseResolver.createResolver((obj, { command }) => {
  const eitherEvents = commandToEvents(command);

  const publishEvents = eventWrapper => R.pipe(
    producerManager.publishEvents,
    eitherThrowErrorOrReturnIdentity,
  )(eventWrapper);

  const handleValidEvents = eventWrapper =>
    publishEvents(eventWrapper);

  const handleInvalidEvents = (eventWrapper) => {
    publishEvents(eventWrapper);

    throw new InvalidCommandError({
      message: eventWrapper.events[0].payload.reason,
    });
  };

  return Either.either(
    handleInvalidEvents,
    handleValidEvents,
  )(eitherEvents);
});

exports.sendCommand = {
  Mutation: {
    sendCommand,
  },
};
