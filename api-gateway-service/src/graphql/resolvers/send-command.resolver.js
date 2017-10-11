const { baseResolver } = require('./base.resolver');
const { commandToEvents } = require('../../services/command');
const { createError } = require('apollo-errors');

const { MESSAGE } = require('../../services/message');

const { producerManager } = require('../../kafka/producer');

const R = require('ramda');
const { Either } = require('ramda-fantasy');

const InvalidCommandError = createError('InvalidCommandError', {
  message: MESSAGE.DEFAULT_INVALID_COMMAND_ERROR,
});

const sendCommand = baseResolver.createResolver((obj, { command }) => {
  const eitherEvents = commandToEvents(command);

  const eitherThrowErrorOrReturnIdentity = Either.either(
    (error) => { throw error; },
    R.identity,
  );

  const publishEventsToKafka = eventWrapper => R.pipe(
    producerManager.publishEventsToKafka,
    eitherThrowErrorOrReturnIdentity,
  )(eventWrapper);

  const handleValidEvents = eventWrapper =>
    publishEventsToKafka(eventWrapper);

  const handleInvalidEvents = (eventWrapper) => {
    publishEventsToKafka(eventWrapper);

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
