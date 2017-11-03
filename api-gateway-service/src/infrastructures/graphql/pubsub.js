const { PubSub } = require('graphql-subscriptions');
const { curry } = require('ramda');

const PUBLISH_CHANNELS = {
  STATE_UPDATES: 'STATE_UPDATES',
};

const pubsub = new PubSub();

const publish = curry(pubsub.publish.bind(pubsub));

// publishToStateUpdatesChannel :: {stateUpdates :: {test :: String}} -> Boolean
const publishToStateUpdatesChannel =
  publish([PUBLISH_CHANNELS.STATE_UPDATES]);

module.exports = {
  pubsub,
  PUBLISH_CHANNELS,
  publishToStateUpdatesChannel,
};
