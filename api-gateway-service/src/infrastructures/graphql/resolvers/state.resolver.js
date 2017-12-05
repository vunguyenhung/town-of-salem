/*
3rd Party library imports
 */
const { withFilter } = require('graphql-subscriptions');
const jwt = require('jsonwebtoken');
const log = require('debug')('src:state-updates.resolver');
const R = require('ramda');

/*
Project file imports
 */
const { PUBLISH_CHANNELS, pubsub } = require('../pubsub');
const { authenticationResolver } = require('./authentication.resolver');
const { sendGetCurrentStateRequest } = require('../../../usecases/lobby/state');

// INFO: we'll set lobby = null on frontend,
// INFO: because notify removed user from a lobby is not possible using pubsub
const stateUpdates = {
  subscribe: withFilter(
    () => pubsub.asyncIterator(PUBLISH_CHANNELS.STATE_UPDATES),
    (payload, variables) => {
      // log('payload: ', payload); // payload: { topic:: String, updatedAt:: String, type::String }
      // log('variables: ', variables); // variable : {token:: String}
      const { users } = payload.stateUpdates.lobby;
      // log('users: ', users);
      const { username } = jwt.decode(variables.token);
      // log('decoded username: ', username);
      return R.contains(username, users);
    },
  ),
};

const currentState = authenticationResolver
  .createResolver((obj, args, { username }) =>
    sendGetCurrentStateRequest(username)
      .run()
      .promise());

exports.stateUpdates = {
  Query: {
    currentState,
  },
  Subscription: {
    stateUpdates,
  },
};
