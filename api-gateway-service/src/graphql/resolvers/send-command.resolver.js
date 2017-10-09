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

const PublishEventsError = createError('PublishEventsError', {
  message: MESSAGE.DEFAULT_PUBLISH_EVENTS_ERROR,
});

const sendCommand = baseResolver.createResolver((obj, { command }) => {
  const eitherEvents = commandToEvents(command);

  const publishMessage = async msg => R.tryCatch(
    R.T,
    ({ message }) => {
      throw new PublishEventsError({ message });
    },
  )(await producerManager.publishMessage(msg));

  const createKafkaMessage = ({ topic, events }) => [{
    topic,
    messages: events.map(JSON.stringify),
  }];

  const handleValidEvents = (eventWrapper) => {
    publishMessage(createKafkaMessage(eventWrapper));
    return MESSAGE.KAFKA_PRODUCER_SENT;
  };

  const handleInvalidEvents = (eventWrapper) => {
    publishMessage(createKafkaMessage(eventWrapper));

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
