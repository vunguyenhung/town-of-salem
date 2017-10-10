const { baseResolver } = require('./base.resolver');
const { commandToEvents } = require('../../services/command');
const { createError } = require('apollo-errors');

const { MESSAGE } = require('../../services/message');

const { producerManager } = require('../../kafka/producer');

const R = require('ramda');
const { Either } = require('ramda-fantasy');

const { Left, Right } = Either;

const InvalidCommandError = createError('InvalidCommandError', {
  message: MESSAGE.DEFAULT_INVALID_COMMAND_ERROR,
});

const PublishEventsError = createError('PublishEventsError', {
  message: MESSAGE.DEFAULT_PUBLISH_EVENTS_ERROR,
});

const sendCommand = baseResolver.createResolver((obj, { command }) => {
  const eitherEvents = commandToEvents(command);

  const createKafkaMessage = ({ topic, events }) => [{
    topic,
    messages: events.map(JSON.stringify),
  }];

  const publishMessageAsync = async (msg) => {
    await producerManager.publishMessage(msg);
  };

  const publishMessage = msg => R.tryCatch(
    () => Right(MESSAGE.KAFKA_PRODUCER_SENT),
    ({ message }) => Left(new PublishEventsError(message)),
  )(publishMessageAsync(msg));

  const eitherThrowErrorOrReturnIdentity = Either.either(
    (error) => { throw error; },
    R.identity,
  );

  const sendMessageToKafka = eventWrapper => R.pipe(
    createKafkaMessage,
    publishMessage,
    eitherThrowErrorOrReturnIdentity,
  )(eventWrapper);

  const handleValidEvents = eventWrapper =>
    sendMessageToKafka(eventWrapper);

  const handleInvalidEvents = (eventWrapper) => {
    sendMessageToKafka(eventWrapper);

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
