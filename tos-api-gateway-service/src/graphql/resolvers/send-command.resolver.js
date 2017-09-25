const { baseResolver } = require('./base.resolver');
const { commandToEvents } = require('../../services/command');
const { createError } = require('apollo-errors');

const InvalidCommandError = createError('InvalidCommandError', {
  message: 'Invalid command',
});

const sendCommand = baseResolver.createResolver((obj, { command }) => {
  const events = commandToEvents(command);
  if (events[0].type === '[Event] Invalid Command Received') {
    throw new InvalidCommandError({
      message: events[0].payload.reason,
    });
  }
  return 'Command sent successfully!';
});

exports.sendCommand = {
  Mutation: {
    sendCommand,
  },
};

exports.InvalidCommandError = InvalidCommandError;
