const { combineResolvers } = require('apollo-resolvers');
const { sendCommand } = require('./send-command.resolver');
const { stateUpdates } = require('./state-updates.resolver');
const { login } = require('./login.resolver');
const { register } = require('./register.resolver');

const resolvers = combineResolvers([
  login,
  register,
  sendCommand,
  stateUpdates,
]);

exports.resolvers = resolvers;
