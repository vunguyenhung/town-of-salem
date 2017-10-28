const { publishToStateUpdatesChannel } = require('../graphql/pubsub');
const { startConsuming } = require('../kafka/consumer');

// TODO: implement the details
const messageToStateChanges = message => ({
  stateUpdates: {
    test: message.value,
  },
});

const start = () => startConsuming()
  .map(messageToStateChanges)
  .map(publishToStateUpdatesChannel); 

module.exports = {
  start,
};
