const { combineResolvers } = require('apollo-resolvers');
const { sendCommand } = require('./send-command.resolver');

const resolvers = combineResolvers([
  sendCommand,
]);

exports.resolvers = resolvers;
