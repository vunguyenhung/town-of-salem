const { PubSub } = require('graphql-subscriptions');
const { partial } = require('ramda');

const PUBLISH_CHANNELS = {
  STATE_UPDATES: 'STATE_UPDATES',
};

const pubsub = new PubSub();

const publishToStateUpdatesChannel =
  partial(pubsub.publish.bind(pubsub))([PUBLISH_CHANNELS.STATE_UPDATES]);

exports.pubsub = pubsub;

exports.PUBLISH_CHANNELS = PUBLISH_CHANNELS;

exports.publishToStateUpdatesChannel = publishToStateUpdatesChannel;

