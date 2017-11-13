const { combineResolvers } = require('apollo-resolvers');
const { stateUpdates } = require('./state-updates.resolver');
const { login } = require('./login.resolver');
const { register } = require('./register.resolver');

const resolvers = combineResolvers([
  login,
  register,
  stateUpdates,
]);

exports.resolvers = resolvers;
