/*
3rd Party imports
 */
const R = require('ramda');
const Task = require('folktale/concurrency/task');

/*
Project file imports
 */
const { handleEvent } = require('./handle-event');

const messageToEvent = R.pipe(R.prop(['value']), JSON.parse);

// handleMessage :: String -> Task
const handleMessage = message =>
  Task.of(messageToEvent(message))
    .chain(handleEvent);

module.exports = {
  messageToEvent,
  handleMessage,
};
