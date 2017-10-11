const { pubsub } = require('../pubsub');

const CHANNELS = {
  STATE_CHANGES: 'STATE_CHANGES',
};

// don't use createResolver
// create normal subscription resolver
// then combine it with combineResolvers
// BUG: this send back [object Object]
// SOL1: implement consumer part to see if client still receives updates
const stateChanges = {
  subscribe: () => pubsub.asyncIterator(CHANNELS.STATE_CHANGES),
};

exports.stateChanges = {
  Subscription: {
    stateChanges,
  },
};
