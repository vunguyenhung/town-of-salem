const { combineResolvers } = require('apollo-resolvers');
const { sendCommand } = require('./send-command.resolver');
const { stateUpdates } = require('./state-updates.resolver');

const resolvers = combineResolvers([
  sendCommand,
  stateUpdates,
]);

exports.resolvers = resolvers;
