const { PUBLISH_CHANNELS, pubsub } = require('../pubsub');

const stateUpdates = {
  subscribe: () => pubsub.asyncIterator(PUBLISH_CHANNELS.STATE_UPDATES),
};

exports.stateUpdates = {
  Subscription: {
    stateUpdates,
  },
};
