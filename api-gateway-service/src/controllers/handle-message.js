/*
3rd Party library imports
 */
const R = require('ramda');
const Task = require('folktale/concurrency/task');

/*
Project file imports
 */
const { publishToStateUpdatesChannel } = require('../infrastructures/graphql/pubsub');

const messageToEvent = R.pipe(R.prop(['value']), JSON.parse);

// TODO: implement mapEvent fn when we have more event
const handleEvent = event =>
  Task.of(publishToStateUpdatesChannel({ stateUpdates: { lobby: event.payload } }));

const handleMessage = message =>
  Task.of(messageToEvent(message))
    .chain(handleEvent);

module.exports = {
  handleMessage,
};
