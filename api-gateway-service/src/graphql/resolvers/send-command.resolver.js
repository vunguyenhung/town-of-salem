const { baseResolver } = require('./base.resolver');
const { commandToEvents } = require('../../services/command');
const { createError } = require('apollo-errors');

const { producerManager } = require('../../kafka/producer');

const R = require('ramda');

const { Either } = require('ramda-fantasy');

const InvalidCommandError = createError('InvalidCommandError', {
  message: 'Invalid command',
});

const sendCommand = baseResolver.createResolver((obj, { command }) => {
  const eitherEvents = commandToEvents(command);

  const handleInvalidCommand = ({ events }) => {
    throw new InvalidCommandError({
      message: events[0].payload.reason,
    });
  };

  const handleValidCommand = async ({ topic, events }) => {
    const messages = [
      {
        topic,
        messages: events.map(JSON.stringify),
      }];
    return R.tryCatch(() => 'Command sent successfully!', ({ message }) => {
      throw new InvalidCommandError({ message });
    })(await producerManager.publishMessage(messages));
  };

  return Either.either(
    handleInvalidCommand,
    handleValidCommand,
  )(eitherEvents);
});

exports.sendCommand = {
  Mutation: {
    sendCommand,
  },
};
