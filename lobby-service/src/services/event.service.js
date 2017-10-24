const { startConsuming } = require('../kafka/consumer');

const start = () => startConsuming();
// consume message from tos-lobby-events
// process the raw input (JSON.parse,... )
// validate the processed input
// based on event type: (user create lobby, add user to lobby, remove user from lobby, ...)
// do something with database.
// and then send event to game topic (if lobby is full => new game is created)
// and stateChanges to API gateway

// .map(messageToStateChanges)
// .map(publishToStateUpdatesChannel);

module.exports = {
  start,
};
