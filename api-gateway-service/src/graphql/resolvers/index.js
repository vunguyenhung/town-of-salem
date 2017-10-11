const { combineResolvers } = require('apollo-resolvers');
const { sendCommand } = require('./send-command.resolver');
const { stateChanges } = require('./state-changes.resolver');

const resolvers = combineResolvers([
  sendCommand,
  stateChanges,
]);

exports.resolvers = resolvers;
